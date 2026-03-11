'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { REGIONS } from '@/types';

export function SearchForm() {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const [riotId, setRiotId] = useState('');
  const [region, setRegion] = useState('jp1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!riotId.trim()) return;

    const encodedId = encodeURIComponent(riotId.trim());
    router.push(`/${locale}/summoner/${region}/${encodedId}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={region} onValueChange={(v) => v && setRegion(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('selectRegion')} />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-1 gap-2">
          <Input
            type="text"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="flex-1"
          />
          <Button type="submit" disabled={!riotId.trim()}>
            {t('searchButton')}
          </Button>
        </div>
      </div>
    </form>
  );
}
