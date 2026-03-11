import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check/create profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingProfile) {
          const provider = user.app_metadata.provider || 'anonymous';
          const displayName =
            user.user_metadata.full_name ||
            user.user_metadata.name ||
            user.email?.split('@')[0] ||
            'User';

          await supabase.from('profiles').insert({
            id: user.id,
            display_name: displayName,
            auth_provider: provider,
            discord_id: provider === 'discord' ? user.user_metadata.provider_id : null,
            discord_avatar_hash: provider === 'discord' ? user.user_metadata.avatar_url?.split('/').pop()?.split('.')[0] : null,
            trust_score: provider === 'discord' ? 30 : 0,
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
