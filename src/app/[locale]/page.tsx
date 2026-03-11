import { useTranslations } from 'next-intl';
import { SearchForm } from '@/components/SearchForm';

export default function HomePage() {
  const t = useTranslations('home');

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          {t('title')}
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          {t('subtitle')}
        </p>
        <SearchForm />
      </section>

      {/* How It Works */}
      <section className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t('howItWorks')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">{t('step1Title')}</h3>
            <p className="text-sm text-muted-foreground">{t('step1Desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">{t('step2Title')}</h3>
            <p className="text-sm text-muted-foreground">{t('step2Desc')}</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">{t('step3Title')}</h3>
            <p className="text-sm text-muted-foreground">{t('step3Desc')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
