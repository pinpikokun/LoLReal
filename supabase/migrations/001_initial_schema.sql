-- LoL Real - Initial Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  auth_provider TEXT NOT NULL DEFAULT 'anonymous' CHECK (auth_provider IN ('anonymous', 'discord', 'riot')),
  riot_id TEXT,
  riot_verified BOOLEAN DEFAULT false,
  riot_icon_id INT,
  discord_id TEXT,
  discord_avatar_hash TEXT,
  trust_score DECIMAL DEFAULT 0,
  review_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Summoners (review targets)
CREATE TABLE summoners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  riot_id TEXT NOT NULL,
  region TEXT NOT NULL,
  average_rating DECIMAL DEFAULT 0,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(riot_id, region)
);

-- 3. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  summoner_id UUID NOT NULL REFERENCES summoners(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_display_name TEXT NOT NULL DEFAULT '匿名ユーザー',
  author_auth_type TEXT NOT NULL DEFAULT 'anonymous' CHECK (author_auth_type IN ('anonymous', 'discord', 'riot')),
  is_anonymous_post BOOLEAN DEFAULT false,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL CHECK (char_length(comment) <= 500),
  comment_lang TEXT,
  opgg_link TEXT,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 Comment Translations Cache
CREATE TABLE comment_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  target_lang TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, target_lang)
);

-- 4. Reviewer Ratings
CREATE TABLE reviewer_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(target_user_id, rater_user_id)
);

-- 5. Review Votes
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(review_id, voter_id)
);

-- 6. Moderation Reports
CREATE TABLE moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_summoners_riot_id_region ON summoners(riot_id, region);
CREATE INDEX idx_reviews_summoner_id_created ON reviews(summoner_id, created_at DESC);
CREATE INDEX idx_reviews_author_auth_type ON reviews(author_auth_type);
CREATE INDEX idx_profiles_trust_score ON profiles(trust_score DESC);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE summoners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: anyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Profiles can be created via auth callback" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Summoners: anyone can read, authenticated can insert
CREATE POLICY "Summoners are viewable by everyone" ON summoners
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create summoners" ON summoners
  FOR INSERT WITH CHECK (true);

-- Reviews: anyone can read, anyone can insert
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reviews can be updated by system" ON reviews
  FOR UPDATE USING (true);

-- Comment Translations: anyone can read, system can insert
CREATE POLICY "Translations are viewable by everyone" ON comment_translations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create translations" ON comment_translations
  FOR INSERT WITH CHECK (true);

-- Reviewer Ratings: anyone can read, authenticated users can insert/update
CREATE POLICY "Ratings are viewable by everyone" ON reviewer_ratings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can rate" ON reviewer_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_user_id);

CREATE POLICY "Users can update their ratings" ON reviewer_ratings
  FOR UPDATE USING (auth.uid() = rater_user_id);

-- Review Votes: anyone can read, anyone can insert
CREATE POLICY "Votes are viewable by everyone" ON review_votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can vote" ON review_votes
  FOR INSERT WITH CHECK (true);

-- Moderation Reports: only reporters and admins can read, anyone can insert
CREATE POLICY "Anyone can create reports" ON moderation_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Reports viewable by reporter" ON moderation_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
