import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface MessageBubbleProps {
  messageId: string;
  content: string;
  time: string;
  isOwn: boolean;
  deleted?: boolean;
  file?: string;
  onDelete?: (messageId: string) => void; // kept for API compat, no longer used
}

export default function MessageBubble({
  content,
  time,
  isOwn,
  deleted,
  file,
}: MessageBubbleProps) {
  const isImageFile = file && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file);

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex flex-col gap-1 px-3 py-2 rounded-2xl max-w-[85vw] sm:max-w-sm text-sm',
          isOwn
            ? 'bg-blue-100 text-gray-800 rounded-br-sm'
            : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100',
        )}
      >
        {/* File attachment */}
        {file &&
          (isImageFile ? (
            <img
              src={file}
              alt="attachment"
              className="rounded-lg max-w-[220px] max-h-[200px] object-cover"
            />
          ) : (
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/60 rounded-lg px-2 py-1.5 hover:bg-white/80 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-xs text-blue-600 underline truncate max-w-[160px]">
                {file.split('/').pop()}
              </span>
            </a>
          ))}

        {/* Text content + timestamp */}
        {(content || deleted) && (
          <div className="flex items-end gap-2">
            {deleted && (
              <svg
                className="w-3.5 h-3.5 text-gray-400 shrink-0 mb-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            )}
            <span
              className={cn('leading-snug', deleted && 'italic text-gray-400')}
            >
              {content}
            </span>
            <span className="text-[11px] text-blue-400 shrink-0 self-end ml-1 whitespace-nowrap">
              {time}
            </span>
          </div>
        )}

        {/* Timestamp only (file with no text) */}
        {file && !content && !deleted && (
          <span className="text-[11px] text-blue-400 self-end whitespace-nowrap">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
