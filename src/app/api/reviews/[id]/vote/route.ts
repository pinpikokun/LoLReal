import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params;
  const body = await request.json();
  const { vote_type } = body;

  if (!vote_type || !['helpful', 'unhelpful'].includes(vote_type)) {
    return NextResponse.json(
      { error: 'vote_type must be "helpful" or "unhelpful"' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Generate IP hash
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const ipHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // Check for duplicate vote
  if (user) {
    const { data: existing } = await supabase
      .from('review_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('voter_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 });
    }
  }

  // Insert vote
  const { error } = await supabase.from('review_votes').insert({
    review_id: reviewId,
    voter_id: user?.id || null,
    vote_type,
    ip_hash: ipHash,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }

  // Update review counts
  const { data: review } = await supabase
    .from('reviews')
    .select('helpful_count, unhelpful_count')
    .eq('id', reviewId)
    .single();

  if (review) {
    const updates = vote_type === 'helpful'
      ? { helpful_count: ((review as Record<string, number>).helpful_count || 0) + 1 }
      : { unhelpful_count: ((review as Record<string, number>).unhelpful_count || 0) + 1 };

    await supabase
      .from('reviews')
      .update(updates)
      .eq('id', reviewId);
  }

  return NextResponse.json({ success: true });
}
