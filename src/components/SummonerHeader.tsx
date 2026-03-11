import { useTranslations } from 'next-intl';
import { StarRating } from './StarRating';
import type { Summoner } from '@/types';
import { REGIONS } from '@/types';

interface SummonerHeaderProps {
  summoner: Summoner;
}

export function SummonerHeader({ summoner }: SummonerHeaderProps) {
  const t = useTranslations('summoner');
  const regionLabel = REGIONS.find((r) => r.value === summoner.region)?.label || summoner.region;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {summoner.riot_id}
          </h1>
          <p className="text-muted-foreground mt-1">
            {regionLabel}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">
              {summoner.average_rating > 0
                ? summoner.average_rating.toFixed(1)
                : '-'}
            </div>
            <StarRating
              rating={Math.round(summoner.average_rating)}
              readonly
              size="sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {summoner.total_reviews} {t('reviews')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={`https://www.op.gg/summoners/${summoner.region}/${encodeURIComponent(summoner.riot_id.replace('#', '-'))}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          {t('viewOnOpgg')}
        </a>
      </div>
    </div>
  );
}
