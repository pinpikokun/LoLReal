'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  authType: 'anonymous' | 'discord' | 'riot';
  displayName: string;
  riotIconId?: number | null;
  discordId?: string | null;
  discordAvatarHash?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

export function UserAvatar({
  authType,
  displayName,
  riotIconId,
  discordId,
  discordAvatarHash,
  size = 'md',
}: UserAvatarProps) {
  let avatarUrl: string | undefined;

  if (authType === 'riot' && riotIconId) {
    avatarUrl = `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${riotIconId}.png`;
  } else if (authType === 'discord' && discordId && discordAvatarHash) {
    avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${discordAvatarHash}.png`;
  }

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <Avatar className={sizeMap[size]}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
      <AvatarFallback
        className={
          authType === 'anonymous'
            ? 'bg-muted text-muted-foreground'
            : authType === 'discord'
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }
      >
        {authType === 'anonymous' ? '?' : initials}
      </AvatarFallback>
    </Avatar>
  );
}
