import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRating } from '@/lib/validators';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: targetUserId } = await params;
  const body = await request.json();
  const { rating } = body;

  if (!validateRating(rating)) {
    return NextResponse.json(
      { error: 'Rating must be between 1 and 5' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (user.id === targetUserId) {
    return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 });
  }

  // Upsert the rating
  const { error } = await supabase
    .from('reviewer_ratings')
    .upsert(
      {
        target_user_id: targetUserId,
        rater_user_id: user.id,
        rating,
      },
      { onConflict: 'target_user_id,rater_user_id' }
    );

  if (error) {
    return NextResponse.json({ error: 'Failed to rate user' }, { status: 500 });
  }

  // Update trust score
  const { data: ratings } = await supabase
    .from('reviewer_ratings')
    .select('rating')
    .eq('target_user_id', targetUserId);

  if (ratings && ratings.length > 0) {
    const avgRating =
      ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

    // Get profile to determine base score
    const { data: profile } = await supabase
      .from('profiles')
      .select('auth_provider')
      .eq('id', targetUserId)
      .single();

    let baseScore = 0;
    if (profile?.auth_provider === 'discord') baseScore = 30;
    else if (profile?.auth_provider === 'riot') baseScore = 60;

    const trustScore = Math.round(baseScore + avgRating * 4);

    await supabase
      .from('profiles')
      .update({ trust_score: trustScore })
      .eq('id', targetUserId);
  }

  return NextResponse.json({ success: true });
}
