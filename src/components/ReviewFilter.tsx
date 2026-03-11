'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewFilterProps {
  sortBy: string;
  filterBy: string;
  onSortChange: (value: string) => void;
  onFilterChange: (value: string) => void;
}

const handleValueChange = (
  fn: (value: string) => void
) => (value: string | null) => {
  if (value) fn(value);
};

export function ReviewFilter({
  sortBy,
  filterBy,
  onSortChange,
  onFilterChange,
}: ReviewFilterProps) {
  const t = useTranslations('summoner');

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select value={sortBy} onValueChange={handleValueChange(onSortChange)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder={t('sortBy')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">{t('sortNewest')}</SelectItem>
          <SelectItem value="oldest">{t('sortOldest')}</SelectItem>
          <SelectItem value="highest">{t('sortHighest')}</SelectItem>
          <SelectItem value="lowest">{t('sortLowest')}</SelectItem>
          <SelectItem value="helpful">{t('sortHelpful')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterBy} onValueChange={handleValueChange(onFilterChange)}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder={t('filterBy')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('filterAll')}</SelectItem>
          <SelectItem value="riot">{t('filterRiot')}</SelectItem>
          <SelectItem value="discord">{t('filterDiscord')}</SelectItem>
          <SelectItem value="verified">{t('filterVerified')}</SelectItem>
          <SelectItem value="no-anonymous">{t('filterAnonymous')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
