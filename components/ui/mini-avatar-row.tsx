// app/components/ui/mini-avatar-row.tsx

import React from 'react';
import {
  Avatar,
  AvatarGroup,
  AvatarImage,
  AvatarFallbackText,
} from '@/components/ui/avatar';

type MiniAvatarRowProps = {
  avatarUrls: string[];
  maxVisible?: number;
};

export function MiniAvatarRow({ avatarUrls, maxVisible = 4 }: MiniAvatarRowProps) {
  if (!avatarUrls || avatarUrls.length === 0) return null;

  const cleanUrls = avatarUrls.filter(Boolean);
  if (cleanUrls.length === 0) return null;

  const visible = cleanUrls.slice(0, maxVisible);
  const remaining = cleanUrls.length - visible.length;

  return (
    <AvatarGroup
      // 🔥 alter Abstand zum linken Rand wiederhergestellt
      className="flex-row items-center ml-2"
    >
      {visible.map((url, index) => (
        <Avatar key={`${url}-${index}`} className="h-7 w-7 rounded-full">
          <AvatarFallbackText className="text-[10px]">?</AvatarFallbackText>
          <AvatarImage source={{ uri: url }} alt="Participant avatar" />
        </Avatar>
      ))}

      {remaining > 0 && (
        <Avatar className="h-7 w-7 rounded-full">
          <AvatarFallbackText className="text-[10px]">
            +{remaining}
          </AvatarFallbackText>
        </Avatar>
      )}
    </AvatarGroup>
  );
}
