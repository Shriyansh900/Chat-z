import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  time: string;
  isOwn: boolean;
  deleted?: boolean;
}

export default function MessageBubble({
  content,
  time,
  isOwn,
  deleted,
}: MessageBubbleProps) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-2xl max-w-xs text-sm',
          isOwn
            ? 'bg-blue-50 text-gray-800 rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100',
        )}
      >
        {deleted && (
          <svg
            className="w-3.5 h-3.5 text-gray-400 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
        <span className={cn(deleted && 'italic text-gray-400')}>{content}</span>
        <span className="text-xs text-gray-400 shrink-0 ml-1">{time}</span>
      </div>
    </div>
  );
}
