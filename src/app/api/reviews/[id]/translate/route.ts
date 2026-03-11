import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { translateText } from '@/lib/translation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params;
  const { searchParams } = new URL(request.url);
  const targetLang = searchParams.get('lang');

  if (!targetLang) {
    return NextResponse.json(
      { error: 'lang parameter is required' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Check cache first
  const { data: cached } = await supabase
    .from('comment_translations')
    .select('translated_text')
    .eq('review_id', reviewId)
    .eq('target_lang', targetLang)
    .single();

  if (cached) {
    return NextResponse.json({ translated_text: cached.translated_text });
  }

  // Get original review
  const { data: review } = await supabase
    .from('reviews')
    .select('comment, comment_lang')
    .eq('id', reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  }

  // Translate
  try {
    const translatedText = await translateText(
      review.comment,
      targetLang,
      review.comment_lang || undefined
    );

    // Cache the translation
    await supabase.from('comment_translations').insert({
      review_id: reviewId,
      target_lang: targetLang,
      translated_text: translatedText,
    });

    return NextResponse.json({ translated_text: translatedText });
  } catch {
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
