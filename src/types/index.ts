export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  auth_provider: 'anonymous' | 'discord' | 'riot';
  riot_id: string | null;
  riot_verified: boolean;
  riot_icon_id: number | null;
  discord_id: string | null;
  discord_avatar_hash: string | null;
  trust_score: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Summoner {
  id: string;
  riot_id: string;
  region: string;
  average_rating: number;
  total_reviews: number;
  created_at: string;
}

export interface Review {
  id: string;
  summoner_id: string;
  author_id: string | null;
  author_display_name: string;
  author_auth_type: 'anonymous' | 'discord' | 'riot';
  is_anonymous_post: boolean;
  rating: number;
  comment: string;
  comment_lang: string | null;
  opgg_link: string | null;
  helpful_count: number;
  unhelpful_count: number;
  ip_hash: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  author?: Profile;
}

export interface CommentTranslation {
  id: string;
  review_id: string;
  target_lang: string;
  translated_text: string;
  created_at: string;
}

export interface ReviewerRating {
  id: string;
  target_user_id: string;
  rater_user_id: string;
  rating: number;
  created_at: string;
}

export interface ReviewVote {
  id: string;
  review_id: string;
  voter_id: string | null;
  vote_type: 'helpful' | 'unhelpful';
  ip_hash: string;
  created_at: string;
}

export interface ModerationReport {
  id: string;
  review_id: string;
  reporter_id: string | null;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export type Region = 'jp1' | 'kr' | 'na1' | 'euw1' | 'eune1' | 'br1' | 'la1' | 'la2' | 'oc1' | 'tr1' | 'ru' | 'ph2' | 'sg2' | 'th2' | 'tw2' | 'vn2';

export const REGIONS: { value: Region; label: string }[] = [
  { value: 'jp1', label: 'Japan' },
  { value: 'kr', label: 'Korea' },
  { value: 'na1', label: 'North America' },
  { value: 'euw1', label: 'EU West' },
  { value: 'eune1', label: 'EU Nordic & East' },
  { value: 'br1', label: 'Brazil' },
  { value: 'la1', label: 'LAN' },
  { value: 'la2', label: 'LAS' },
  { value: 'oc1', label: 'Oceania' },
  { value: 'tr1', label: 'Turkey' },
  { value: 'ru', label: 'Russia' },
  { value: 'ph2', label: 'Philippines' },
  { value: 'sg2', label: 'Singapore' },
  { value: 'th2', label: 'Thailand' },
  { value: 'tw2', label: 'Taiwan' },
  { value: 'vn2', label: 'Vietnam' },
];

export type Locale = 'en' | 'ja' | 'ko' | 'zh';
