import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('termsTitle')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('lastUpdated')}: 2026-03-12</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. サービスの概要</h2>
          <p className="text-muted-foreground leading-relaxed">
            LoL Real（以下「本サービス」）は、League of Legendsプレイヤーに関するレビューや評価を投稿・閲覧するためのプラットフォームです。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. 利用条件</h2>
          <p className="text-muted-foreground leading-relaxed">
            本サービスを利用するには、13歳以上である必要があります。本サービスの利用により、本規約に同意したものとみなされます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. 禁止事項</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>誹謗中傷、差別的表現、ヘイトスピーチの投稿</li>
            <li>虚偽の情報の投稿</li>
            <li>個人情報（実名、住所、電話番号等）の投稿</li>
            <li>スパム行為、自動化ツールによる大量投稿</li>
            <li>他者のなりすまし</li>
            <li>法律に違反する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. 投稿コンテンツ</h2>
          <p className="text-muted-foreground leading-relaxed">
            ユーザーが投稿したレビュー・コメントの内容については、投稿者自身が責任を負います。運営は投稿内容について一切の責任を負いません。
            不適切な投稿は、通報を受け付けた後、運営の判断により削除される場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. 免責事項</h2>
          <p className="text-muted-foreground leading-relaxed">
            本サービスは「現状有姿」で提供されます。サービスの中断、データの喪失、その他の損害について、運営は責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. 知的財産権</h2>
          <p className="text-muted-foreground leading-relaxed">
            League of Legends、Riot Gamesおよび関連するロゴ・画像はRiot Games, Inc.の商標または登録商標です。
            本サービスはRiot Gamesが承認しておらず、Riot Gamesの見解・意見を反映するものではありません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. 規約の変更</h2>
          <p className="text-muted-foreground leading-relaxed">
            本規約は予告なく変更される場合があります。変更後も本サービスを利用する場合、変更後の規約に同意したものとみなされます。
          </p>
        </section>
      </div>
    </div>
  );
}
