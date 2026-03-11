'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { SummonerHeader } from '@/components/SummonerHeader';
import { ReviewCard } from '@/components/ReviewCard';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewFilter } from '@/components/ReviewFilter';
import { Separator } from '@/components/ui/separator';
import type { Summoner, Review } from '@/types';

export default function SummonerPage() {
  const t = useTranslations('summoner');
  const locale = useLocale();
  const params = useParams<{ region: string; riotId: string }>();
  const [summoner, setSummoner] = useState<Summoner | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const riotId = decodeURIComponent(params.riotId);
  const region = params.region;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const searchRes = await fetch(
        `/api/summoners/search?riot_id=${encodeURIComponent(riotId)}&region=${region}`
      );
      if (searchRes.ok) {
        const data = await searchRes.json();
        setSummoner(data.summoner);

        if (data.summoner) {
          const reviewsRes = await fetch(
            `/api/reviews?summoner_id=${data.summoner.id}&sort=${sortBy}&filter=${filterBy}`
          );
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData.reviews || []);
          }
        }
      }
    } catch {
      // Error handled by showing empty state
    } finally {
      setLoading(false);
    }
  }, [riotId, region, sortBy, filterBy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded mt-8" />
        </div>
      </div>
    );
  }

  // Create a placeholder summoner if not found in DB yet
  const displaySummoner: Summoner = summoner || {
    id: '',
    riot_id: riotId,
    region: region,
    average_rating: 0,
    total_reviews: 0,
    created_at: new Date().toISOString(),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SummonerHeader summoner={displaySummoner} />

      <Separator className="my-6" />

      {/* Review Form Toggle */}
      <div className="mb-6">
        {!showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(true)}
            className="w-full text-left p-4 rounded-lg border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors"
          >
            <span className="text-sm text-muted-foreground">
              {t('writeReview')}...
            </span>
          </button>
        ) : (
          <ReviewForm
            summonerId={displaySummoner.id}
            onSuccess={() => {
              setShowReviewForm(false);
              fetchData();
            }}
          />
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {displaySummoner.total_reviews} {t('reviews')}
        </h2>
        <ReviewFilter
          sortBy={sortBy}
          filterBy={filterBy}
          onSortChange={setSortBy}
          onFilterChange={setFilterBy}
        />
      </div>

      {/* Reviews */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentLocale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('noReviews')}</p>
        </div>
      )}
    </div>
  );
}
