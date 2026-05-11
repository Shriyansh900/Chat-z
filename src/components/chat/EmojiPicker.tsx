'use client';

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <Picker
      data={data}
      onEmojiSelect={(emoji: { native: string }) => onSelect(emoji.native)}
      theme="light"
      previewPosition="none"
      skinTonePosition="none"
    />
  );
}
