import { useTranslations } from 'next-intl';

export default function PrivacyPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('privacyTitle')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('lastUpdated')}: 2026-03-12</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. 収集する情報</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>アカウント情報（Discord ID、Riot ID等の認証情報）</li>
            <li>投稿コンテンツ（レビュー、評価、コメント）</li>
            <li>利用情報（IPアドレスのハッシュ値、アクセスログ）</li>
            <li>Cookie情報（セッション管理、言語設定）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. 情報の利用目的</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>サービスの提供・運営</li>
            <li>ユーザー認証・セッション管理</li>
            <li>スパム防止・不正利用対策</li>
            <li>サービスの改善・分析</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. 第三者提供</h2>
          <p className="text-muted-foreground leading-relaxed">
            法令に基づく場合を除き、ユーザーの個人情報を第三者に提供することはありません。
            ただし、以下のサービスを利用しており、それぞれのプライバシーポリシーに従います。
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
            <li>Supabase（データベース・認証）</li>
            <li>Cloudflare（ホスティング・CDN）</li>
            <li>Google Cloud Translation API（翻訳機能）</li>
            <li>Discord（OAuth認証）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. データの保持期間</h2>
          <p className="text-muted-foreground leading-relaxed">
            ユーザーデータは、アカウント削除の申請があるまで保持されます。
            アカウント削除後、合理的な期間内にデータを削除します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. ユーザーの権利（GDPR対応）</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>データへのアクセス権</li>
            <li>データの訂正権</li>
            <li>データの削除権（忘れられる権利）</li>
            <li>データの持ち運び権</li>
            <li>処理の制限権</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            上記の権利行使については、お問い合わせページよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. セキュリティ</h2>
          <p className="text-muted-foreground leading-relaxed">
            ユーザー情報の保護のため、適切なセキュリティ対策を講じています。
            ただし、インターネット上の通信は完全に安全ではないため、情報の安全性を100%保証するものではありません。
          </p>
        </section>
      </div>
    </div>
  );
}
