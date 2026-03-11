# LoL Real - 実装計画

## Context
League of Legendsには戦績統計サイト（OP.GG, Mobalytics等）は多数あるが、**プレイヤーを「人として」レビュー・評価するサイトは存在しない**。LoL Realは「RateMyProfessor」のLoL版として、サモナーネーム検索→5段階評価→コメント→証拠リンクという流れでプレイヤーの評判を可視化するニッチなサービスを目指す。

---

## 技術スタック
- **Frontend**: Next.js 15 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **i18n**: next-intl（多言語対応）
- **DB/Auth**: Supabase (PostgreSQL + Auth + RLS)
- **翻訳API**: Google Cloud Translation API or DeepL API（コメント自動翻訳）
- **デザイン**: Anthropic風のモダンクリーン（丸パクリにならない独自性あるデザイン）
- **デプロイ**: Cloudflare Pages（無料・帯域無制限・DDoS防御内蔵・商用利用可）
- **ランタイム**: `@cloudflare/next-on-pages` でNext.jsをCloudflare Pagesにデプロイ

---

## Phase 1: MVP機能
1. サモナーネーム検索
2. 5段階評価 + テキストレビュー投稿
3. OP.GG試合リンク添付
4. 多層認証（匿名 / Discord / Riot ID）
5. レビュアー信頼度システム
6. レビューフィルタリング
7. 多言語対応（UI + コメント自動翻訳）

---

## データベース設計

### テーブル構成

```sql
-- 1. ユーザープロフィール
profiles (
  id UUID PK (= Supabase auth.users.id),
  display_name TEXT,
  avatar_url TEXT NULL,      -- アイコンURL（Riot/Discord/匿名で異なる）
  auth_provider TEXT ('anonymous'|'discord'|'riot'),
  riot_id TEXT NULL,        -- Riot連携時のRiot ID
  riot_verified BOOLEAN DEFAULT false,
  riot_icon_id INT NULL,    -- Riot プロフィールアイコンID
  discord_id TEXT NULL,
  discord_avatar_hash TEXT NULL, -- Discord アバターハッシュ
  trust_score DECIMAL DEFAULT 0,  -- 信頼度スコア
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
-- アイコン取得方法:
--   Riot: https://ddragon.leagueoflegends.com/cdn/{ver}/img/profileicon/{iconId}.png
--   Discord: https://cdn.discordapp.com/avatars/{discordId}/{hash}.png
--   匿名: /images/anonymous-icon.png（カスタムアイコン）

-- 2. サモナー（評価対象プレイヤー）
summoners (
  id UUID PK,
  riot_id TEXT NOT NULL,      -- "Name#TAG" 形式
  region TEXT NOT NULL,       -- "jp1", "kr", "na1" 等
  average_rating DECIMAL DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ,
  UNIQUE(riot_id, region)
)

-- 3. レビュー
reviews (
  id UUID PK,
  summoner_id UUID FK -> summoners.id,
  author_id UUID FK -> profiles.id NULL,  -- 未ログイン匿名の場合NULL
  author_display_name TEXT,    -- 表示用（匿名="匿名ユーザー"）
  author_auth_type TEXT,       -- 投稿時の表示認証タイプ（匿名選択時は'anonymous'）
  is_anonymous_post BOOLEAN DEFAULT false, -- ログイン済みだが匿名投稿を選択
  rating INT CHECK(1-5),
  comment TEXT (max 500文字),
  comment_lang TEXT,           -- 原文の言語コード（auto-detect）
  opgg_link TEXT NULL,         -- OP.GGリンク（任意）
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  ip_hash TEXT,                -- スパム対策用
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- 3.5 コメント翻訳キャッシュ
comment_translations (
  id UUID PK,
  review_id UUID FK -> reviews.id,
  target_lang TEXT NOT NULL,   -- 翻訳先言語コード
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  UNIQUE(review_id, target_lang)
)

-- 4. レビュアー評価（レビュアーに対する信頼度評価）
reviewer_ratings (
  id UUID PK,
  target_user_id UUID FK -> profiles.id,
  rater_user_id UUID FK -> profiles.id,
  rating INT CHECK(1-5),
  created_at TIMESTAMPTZ,
  UNIQUE(target_user_id, rater_user_id)
)

-- 5. レビュー投票（参考になった/ならなかった）
review_votes (
  id UUID PK,
  review_id UUID FK -> reviews.id,
  voter_id UUID FK -> profiles.id NULL,
  vote_type TEXT ('helpful'|'unhelpful'),
  ip_hash TEXT,
  created_at TIMESTAMPTZ,
  UNIQUE(review_id, voter_id) -- ログインユーザーは1回のみ
)

-- 6. 通報
moderation_reports (
  id UUID PK,
  review_id UUID FK -> reviews.id,
  reporter_id UUID FK -> profiles.id NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ
)
```

### インデックス
- `summoners(riot_id, region)` - 検索用
- `reviews(summoner_id, created_at DESC)` - レビュー一覧用
- `reviews(author_auth_type)` - フィルタリング用
- `profiles(trust_score DESC)` - 信頼度フィルタ用

---

## プロジェクト構成

```
src/
├── app/
│   ├── [locale]/                   # next-intl ロケールルーティング
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップページ（検索フォーム）
│   │   ├── summoner/
│   │   │   └── [region]/[riotId]/
│   │   │       └── page.tsx        # サモナー詳細（レビュー一覧）
│   │   └── auth/
│   │       ├── login/page.tsx      # ログインページ
│   │       └── callback/route.ts   # OAuth コールバック
│   └── api/
│       ├── reviews/route.ts            # POST: レビュー投稿
│       ├── reviews/[id]/vote/route.ts  # POST: 投票
│       ├── reviews/[id]/translate/route.ts # GET: コメント翻訳
│       ├── summoners/search/route.ts   # GET: 検索
│       ├── users/[id]/rate/route.ts    # POST: レビュアー評価
│       └── reports/route.ts            # POST: 通報
├── components/
│   ├── SearchForm.tsx          # サモナー検索フォーム
│   ├── StarRating.tsx          # 星評価コンポーネント
│   ├── ReviewCard.tsx          # レビュー表示カード（翻訳ボタン付き）
│   ├── ReviewForm.tsx          # レビュー投稿フォーム
│   ├── ReviewFilter.tsx        # フィルターUI
│   ├── SummonerHeader.tsx      # サモナー情報ヘッダー
│   ├── UserAvatar.tsx          # ユーザーアイコン表示（Riot/Discord/匿名）
│   ├── TrustBadge.tsx          # 認証バッジ表示
│   ├── AuthButton.tsx          # ログイン/ログアウト
│   └── LanguageSwitcher.tsx    # 言語切替UI
├── i18n/
│   ├── request.ts              # next-intl サーバー設定
│   ├── routing.ts              # ロケールルーティング設定
│   └── messages/
│       ├── en.json             # 英語
│       ├── ja.json             # 日本語
│       ├── ko.json             # 韓国語
│       ├── zh.json             # 中国語
│       └── ...                 # 他言語
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # ブラウザ用クライアント
│   │   ├── server.ts           # サーバー用クライアント
│   │   └── middleware.ts       # 認証ミドルウェア
│   ├── translation.ts          # 翻訳API連携
│   ├── validators.ts           # 入力バリデーション
│   └── utils.ts                # ユーティリティ
└── types/
    └── index.ts                # 型定義
```

---

## 認証フロー

### 3段階の信頼度
| レベル | 認証方法 | 信頼度ベース | できること |
|--------|----------|-------------|-----------|
| Lv.0 | 匿名（未ログイン） | 0 | レビュー投稿のみ（IP制限あり） |
| Lv.1 | Discord OAuth | 30 | レビュー投稿 + 投票 + 通報 |
| Lv.2 | Riot ID連携 | 60 | 全機能 + 最高信頼度 |

- Supabase Authで匿名セッション / Discord OAuth / カスタムRiot連携を管理
- 信頼度スコア = ベーススコア + 他ユーザーからの評価平均 × 係数 + 活動ボーナス

### 匿名投稿モード
- ログイン済みユーザーもレビュー投稿時に「匿名で投稿」を選択可能
- 匿名投稿時: 表示名は「匿名ユーザー」、アイコンは匿名アイコン
- DB上は `author_id` にユーザーIDを保持（モデレーション目的）、`is_anonymous_post = true`
- フィルタリング上は「匿名」扱い（認証済み匿名と未ログイン匿名の区別なし）
- 管理者のみ匿名投稿者の実アカウント確認可能（通報対応時）

### フィルタリング
- 認証タイプ別: 「Riot ID認証のみ」「匿名除外」等
- 信頼度別: 「信頼度○○以上のレビューのみ」
- ソート: 新着順 / 評価順 / 参考になった順

---

## 多言語対応 (i18n)

### UI多言語化 - next-intl
- **対応言語（初期）**: 日本語(ja)、英語(en)、韓国語(ko)、中国語簡体(zh)
- ブラウザの`Accept-Language`ヘッダーで自動検出、手動切替も可能
- URL構造: `/{locale}/summoner/{region}/{riotId}` （例: `/ja/summoner/jp1/Player%23JP1`）
- 全UIテキスト（メニュー、ボタン、ラベル、プレースホルダー等）を翻訳ファイルで管理

### コメント自動翻訳
- レビュー投稿時にコメントの言語を自動検出し `comment_lang` に保存
- 閲覧者が異なる言語でアクセスした場合、「翻訳する」ボタンを表示
- 翻訳結果は `comment_translations` テーブルにキャッシュ（同じ翻訳を再リクエストしない）
- 翻訳API: Google Cloud Translation API（無料枠50万文字/月）またはDeepL API（無料枠50万文字/月）
- 原文は常に表示し、翻訳は補助として表示（「翻訳を表示」トグル）

### 言語切替UI
- ヘッダーにLanguageSwitcherコンポーネント配置
- 国旗アイコン or 言語コードで表示
- 選択言語はcookieに保存し次回アクセス時に自動適用

---

## OP.GGリンク処理
- URLバリデーション: `https://www.op.gg/summoners/{region}/{name}/matches/{matchId}` パターンの検証
- リンクはクリッカブルに表示
- OGP等のプレビューは Phase 2

---

## 実装順序

### Step 1: プロジェクト基盤（〜1日目）
- Next.js + TypeScript プロジェクト初期化
- Tailwind CSS + shadcn/ui セットアップ
- next-intl セットアップ（ロケールルーティング + 初期翻訳ファイル）
- Supabase プロジェクト作成・接続
- DBスキーマ作成（マイグレーション）

### Step 2: コア検索機能（〜2日目）
- トップページ + 検索フォーム
- サモナー詳細ページ（レイアウト）
- サモナー検索API

### Step 3: レビュー機能（〜3日目）
- レビュー投稿フォーム（星評価 + コメント + OP.GGリンク）
- レビュー一覧表示
- 匿名投稿対応

### Step 4: 認証（〜4日目）
- Discord OAuth 連携
- Riot ID 連携の基本フロー
- 認証バッジ表示

### Step 5: 信頼度・フィルタリング（〜5日目）
- レビュアー評価機能
- 信頼度スコア計算
- レビューフィルタリングUI
- 参考になった/ならなかった投票

### Step 6: コメント翻訳（〜6日目）
- 翻訳API連携（Google Cloud Translation or DeepL）
- コメント言語自動検出
- 翻訳キャッシュテーブル運用
- 「翻訳を表示」UIの実装

### Step 7: モデレーション・セキュリティ（〜7日目）
- 通報機能
- IPベースレート制限
- reCAPTCHA v3 導入
- 基本的なテキストフィルタリング（NGワード）
- ユーザー入力サニタイズ

### Step 8: 法務ページ・仕上げ（〜8日目）
- 利用規約ページ
- プライバシーポリシーページ
- Cookieポリシー + 同意バナー
- お問い合わせページ
- Riot Games著作権表記
- OGPメタタグ + SEO設定
- レスポンシブデザイン調整

---

## 法律・規約対応（リリース前必須）

### Riot Games API
- API利用規約を遵守し、「Riot Games提供データ」のクレジット表記必須
- APIキーはサーバーサイド（Route Handler / Edge Functions）でのみ使用（フロントに露出させない）
- レート制限を考慮した設計（キャッシュ活用）
- ロゴ・ゲーム画像使用はRiotガイドラインに従う

### 必須ページ
- **利用規約**: 誹謗中傷禁止の明記、投稿はユーザー責任の免責事項
- **プライバシーポリシー**: 収集データの種類・利用目的・第三者提供の有無
- **Cookieポリシー**: Cookie同意バナー（GDPR対応）
- **お問い合わせ**: フォーム or メールアドレス
- **著作権表記**: Riot Gamesコンテンツのクレジット

### 各国法律対応
| 法律 | 対象 | 対応 |
|------|------|------|
| GDPR | EU | Cookie同意、データ削除権、プライバシーポリシー |
| 個人情報保護法 | 日本 | 利用目的の公表、第三者提供制限 |
| CCPA | 米国CA | データ販売オプトアウト権（成長後対応） |
| COPPA | 米国 | 13歳未満のデータ収集制限（成長後対応） |

---

## セキュリティ対策

| 脅威 | 対策 |
|------|------|
| DDoS | Cloudflare Pages内蔵の防御（追加設定不要） |
| スパム投稿 | reCAPTCHA v3 + IPレート制限 |
| SQLインジェクション | Supabase RLS + パラメータ化クエリ |
| XSS | ユーザー入力のサニタイズ、React自動エスケープ |
| APIキー漏洩 | サーバーサイドのみで呼び出し |
| 荒らし・誹謗中傷 | NGワードフィルター + 通報 + AIモデレーション（Phase 2） |

---

## SEO・OGP

- サモナーページごとに動的OGPメタタグ生成（SNSシェア時にプレビュー表示）
- `next/metadata` APIでページごとのtitle/descriptionを多言語対応
- サイトマップ自動生成
- `robots.txt` 設定

---

## Phase 2（将来）
- AI総評生成（ACP / Claude API / OpenAI - 要検討）
- AIモデレーション（投稿の自動チェック）
- Riot API連携でランク・勝率表示
- OP.GGリンクのプレビュー表示
- 管理者ダッシュボード
- モバイル最適化
- CCPA / COPPA 対応
- AdSense導入

---

## 検証方法
1. `npm run dev` でローカル起動、全ページの表示確認
2. サモナー検索 → 詳細ページ遷移の動作確認
3. 匿名/認証済みでのレビュー投稿テスト
4. OP.GGリンクのバリデーション確認
5. フィルタリング機能の動作確認
6. Supabase ダッシュボードでデータ確認
