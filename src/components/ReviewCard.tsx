'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { UserAvatar } from './UserAvatar';
import { TrustBadge } from './TrustBadge';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  currentLocale: string;
}

export function ReviewCard({ review, currentLocale }: ReviewCardProps) {
  const t = useTranslations('review');
  const [translation, setTranslation] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count);
  const [unhelpfulCount, setUnhelpfulCount] = useState(review.unhelpful_count);
  const [voted, setVoted] = useState<'helpful' | 'unhelpful' | null>(null);

  const needsTranslation =
    review.comment_lang && review.comment_lang !== currentLocale;

  const handleTranslate = async () => {
    if (translation) {
      setShowTranslation(!showTranslation);
      return;
    }

    setTranslating(true);
    try {
      const res = await fetch(
        `/api/reviews/${review.id}/translate?lang=${currentLocale}`
      );
      if (res.ok) {
        const data = await res.json();
        setTranslation(data.translated_text);
        setShowTranslation(true);
      }
    } catch {
      // Translation failed silently
    } finally {
      setTranslating(false);
    }
  };

  const handleVote = async (voteType: 'helpful' | 'unhelpful') => {
    if (voted) return;

    try {
      const res = await fetch(`/api/reviews/${review.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (res.ok) {
        setVoted(voteType);
        if (voteType === 'helpful') {
          setHelpfulCount((prev) => prev + 1);
        } else {
          setUnhelpfulCount((prev) => prev + 1);
        }
      }
    } catch {
      // Vote failed silently
    }
  };

  const timeAgo = getTimeAgo(review.created_at);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <UserAvatar
            authType={review.author_auth_type}
            displayName={review.author_display_name}
            riotIconId={review.author?.riot_icon_id}
            discordId={review.author?.discord_id}
            discordAvatarHash={review.author?.discord_avatar_hash}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">
                {review.author_display_name}
              </span>
              <TrustBadge
                authType={review.author_auth_type}
                trustScore={review.author?.trust_score}
              />
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>

            <div className="mt-1">
              <StarRating rating={review.rating} readonly size="sm" />
            </div>

            <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>

            {showTranslation && translation && (
              <div className="mt-2 p-2 bg-muted/50 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">
                  {t('translate')}
                </p>
                <p className="text-sm leading-relaxed">{translation}</p>
              </div>
            )}

            {review.opgg_link && (
              <a
                href={review.opgg_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <svg
                  className="w-3 h-3"
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
                OP.GG Match
              </a>
            )}

            <div className="mt-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleVote('helpful')}
                disabled={voted !== null}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                  />
                </svg>
                {t('helpful')} {helpfulCount > 0 && `(${helpfulCount})`}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleVote('unhelpful')}
                disabled={voted !== null}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 001.302-4.665c0-1.194-.232-2.333-.654-3.375z"
                  />
                </svg>
                {t('unhelpful')} {unhelpfulCount > 0 && `(${unhelpfulCount})`}
              </Button>

              {needsTranslation && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleTranslate}
                  disabled={translating}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
                    />
                  </svg>
                  {translating
                    ? t('translating')
                    : showTranslation
                    ? t('hideTranslation')
                    : t('translate')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString();
}
