'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="border-t mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">
            {t('terms')}
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
            {t('privacy')}
          </Link>
          <Link href="/cookie-policy" className="text-muted-foreground hover:text-foreground">
            {t('cookie')}
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">
            {t('contact')}
          </Link>
        </div>

        <Separator className="my-4" />

        <p className="text-xs text-muted-foreground leading-relaxed">
          {t('riotDisclaimer')}
        </p>
      </div>
    </footer>
  );
}
