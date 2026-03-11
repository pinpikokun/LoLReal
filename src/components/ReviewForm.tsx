'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { validateOpggLink, validateComment, validateRating } from '@/lib/validators';

interface ReviewFormProps {
  summonerId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ summonerId, onSuccess }: ReviewFormProps) {
  const t = useTranslations('review');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [opggLink, setOpggLink] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateRating(rating)) {
      setError(t('ratingRequired'));
      return;
    }

    const commentValidation = validateComment(comment);
    if (!commentValidation.valid) {
      setError(t(commentValidation.error!));
      return;
    }

    if (opggLink && !validateOpggLink(opggLink)) {
      setError(t('invalidOpggLink'));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summoner_id: summonerId,
          rating,
          comment: comment.trim(),
          opgg_link: opggLink.trim() || null,
          is_anonymous_post: isAnonymous,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t('submitError'));
      }

      setSuccess(true);
      setRating(0);
      setComment('');
      setOpggLink('');
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <svg
              className="w-12 h-12 mx-auto text-green-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium">{t('submitSuccess')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('submitReview')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block">{t('rating')}</Label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          <div>
            <Label htmlFor="comment" className="mb-2 block">
              {t('comment')}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('commentPlaceholder')}
              maxLength={500}
              rows={4}
            />
            <p className="mt-1 text-xs text-muted-foreground text-right">
              {comment.length}/500 {t('characters')}
            </p>
          </div>

          <div>
            <Label htmlFor="opgg-link" className="mb-2 block">
              {t('opggLink')}
            </Label>
            <Input
              id="opgg-link"
              type="url"
              value={opggLink}
              onChange={(e) => setOpggLink(e.target.value)}
              placeholder={t('opggLinkPlaceholder')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-input"
            />
            <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
              {t('postAnonymously')}
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? '...' : t('submitReview')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
