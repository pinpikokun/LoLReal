import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRegion } from '@/lib/validators';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const riotId = searchParams.get('riot_id');
  const region = searchParams.get('region');

  if (!riotId || !region) {
    return NextResponse.json(
      { error: 'riot_id and region are required' },
      { status: 400 }
    );
  }

  if (!validateRegion(region)) {
    return NextResponse.json({ error: 'Invalid region' }, { status: 400 });
  }

  const supabase = await createClient();

  // Try to find existing summoner
  const { data: summoner } = await supabase
    .from('summoners')
    .select('*')
    .eq('riot_id', riotId)
    .eq('region', region)
    .single();

  if (summoner) {
    return NextResponse.json({ summoner });
  }

  // Create new summoner entry
  const { data: newSummoner, error } = await supabase
    .from('summoners')
    .insert({ riot_id: riotId, region })
    .select()
    .single();

  if (error) {
    // Handle race condition - another request may have created it
    const { data: existing } = await supabase
      .from('summoners')
      .select('*')
      .eq('riot_id', riotId)
      .eq('region', region)
      .single();

    if (existing) {
      return NextResponse.json({ summoner: existing });
    }

    return NextResponse.json({ error: 'Failed to create summoner' }, { status: 500 });
  }

  return NextResponse.json({ summoner: newSummoner });
}
