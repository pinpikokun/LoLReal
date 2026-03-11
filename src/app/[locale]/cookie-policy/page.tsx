import { useTranslations } from 'next-intl';

export default function CookiePolicyPage() {
  const t = useTranslations('legal');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t('cookieTitle')}</h1>
      <p className="text-sm text-muted-foreground mb-8">{t('lastUpdated')}: 2026-03-12</p>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Cookieとは</h2>
          <p className="text-muted-foreground leading-relaxed">
            Cookieとは、ウェブサイトがブラウザに保存する小さなテキストファイルです。
            本サービスでは、サービスの提供・改善のためにCookieを使用しています。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. 使用するCookie</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium">必須Cookie</h3>
              <p className="text-muted-foreground text-sm">
                認証セッションの管理、言語設定の保持に必要なCookieです。これらはサービスの基本機能に不可欠です。
              </p>
            </div>
            <div>
              <h3 className="font-medium">機能Cookie</h3>
              <p className="text-muted-foreground text-sm">
                言語設定、Cookie同意状態の保存など、ユーザーの設定を記憶するためのCookieです。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Cookieの管理</h2>
          <p className="text-muted-foreground leading-relaxed">
            ブラウザの設定からCookieを無効にすることができますが、一部のサービス機能が利用できなくなる場合があります。
          </p>
        </section>
      </div>
    </div>
  );
}
