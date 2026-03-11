import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeInput } from '@/lib/validators';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { review_id, reason } = body;

  if (!review_id || !reason?.trim()) {
    return NextResponse.json(
      { error: 'review_id and reason are required' },
      { status: 400 }
    );
  }

  if (reason.length > 500) {
    return NextResponse.json(
      { error: 'Reason must be 500 characters or less' },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from('moderation_reports').insert({
    review_id,
    reporter_id: user?.id || null,
    reason: sanitizeInput(reason),
    status: 'pending',
  });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
