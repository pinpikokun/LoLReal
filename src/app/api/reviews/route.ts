import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRating, validateComment, validateOpggLink, sanitizeInput } from '@/lib/validators';
import { detectLanguage } from '@/lib/translation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const summonerId = searchParams.get('summoner_id');
  const sort = searchParams.get('sort') || 'newest';
  const filter = searchParams.get('filter') || 'all';

  if (!summonerId) {
    return NextResponse.json({ error: 'summoner_id is required' }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from('reviews')
    .select('*, author:profiles(*)')
    .eq('summoner_id', summonerId);

  // Apply filters
  switch (filter) {
    case 'riot':
      query = query.eq('author_auth_type', 'riot');
      break;
    case 'discord':
      query = query.eq('author_auth_type', 'discord');
      break;
    case 'verified':
      query = query.neq('author_auth_type', 'anonymous');
      break;
    case 'no-anonymous':
      query = query.neq('author_auth_type', 'anonymous');
      break;
  }

  // Apply sorting
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'highest':
      query = query.order('rating', { ascending: false });
      break;
    case 'lowest':
      query = query.order('rating', { ascending: true });
      break;
    case 'helpful':
      query = query.order('helpful_count', { ascending: false });
      break;
    default: // newest
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data: reviews, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  return NextResponse.json({ reviews: reviews || [] });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { summoner_id, rating, comment, opgg_link, is_anonymous_post } = body;

  // Validate inputs
  if (!summoner_id) {
    return NextResponse.json({ error: 'summoner_id is required' }, { status: 400 });
  }

  if (!validateRating(rating)) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  const commentValidation = validateComment(comment);
  if (!commentValidation.valid) {
    return NextResponse.json({ error: commentValidation.error }, { status: 400 });
  }

  if (opgg_link && !validateOpggLink(opgg_link)) {
    return NextResponse.json({ error: 'Invalid OP.GG link' }, { status: 400 });
  }

  const supabase = await createClient();

  // Get current user (may be null for anonymous)
  const { data: { user } } = await supabase.auth.getUser();

  // Detect comment language
  let commentLang = 'unknown';
  try {
    commentLang = await detectLanguage(comment);
  } catch {
    // Language detection failed, use unknown
  }

  // Determine author info
  let authorId = user?.id || null;
  let authorDisplayName = '匿名ユーザー';
  let authorAuthType = 'anonymous';

  if (user && !is_anonymous_post) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      authorDisplayName = profile.display_name;
      authorAuthType = profile.auth_provider;
    }
  }

  // Generate IP hash for spam prevention
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const ipHash = await hashString(ip);

  const sanitizedComment = sanitizeInput(comment);

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      summoner_id,
      author_id: authorId,
      author_display_name: authorDisplayName,
      author_auth_type: authorAuthType,
      is_anonymous_post: is_anonymous_post || false,
      rating,
      comment: sanitizedComment,
      comment_lang: commentLang,
      opgg_link: opgg_link || null,
      ip_hash: ipHash,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }

  // Update summoner stats
  await updateSummonerStats(supabase, summoner_id);

  return NextResponse.json({ review }, { status: 201 });
}

async function updateSummonerStats(supabase: Awaited<ReturnType<typeof createClient>>, summonerId: string) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('summoner_id', summonerId);

  if (reviews && reviews.length > 0) {
    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    await supabase
      .from('summoners')
      .update({
        total_reviews: totalReviews,
        average_rating: Math.round(averageRating * 10) / 10,
      })
      .eq('id', summonerId);
  }
}

async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
