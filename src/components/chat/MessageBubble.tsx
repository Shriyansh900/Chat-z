'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface MessageBubbleProps {
  messageId: string;
  content: string;
  time: string;
  isOwn: boolean;
  deleted?: boolean;
  file?: string;
  onDelete: (messageId: string) => void;
}

export default function MessageBubble({
  messageId,
  content,
  time,
  isOwn,
  deleted,
  file,
  onDelete,
}: MessageBubbleProps) {
  const [deleting, setDeleting] = useState(false);

  /**
   * Detect image files robustly:
   * - Cloudinary image URLs contain "/image/upload/" in the path
   * - Fallback: check common image extensions at the end of the URL
   */
  const isImageFile =
    file &&
    (file.includes('/image/upload/') ||
      /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(file));

  /** Extract a human-readable filename from a URL */
  const getFileName = (url: string) => {
    try {
      const pathname = new URL(url).pathname;
      const name = pathname.split('/').pop() ?? url;
      // Strip Cloudinary version prefix like "v1234567890/"
      return decodeURIComponent(name.replace(/^v\d+\//, ''));
    } catch {
      return url.split('/').pop() ?? 'file';
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/messages/${messageId}`);
      onDelete(messageId);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2 px-2 group',
        isOwn ? 'justify-end' : 'justify-start',
      )}
    >
      {/* Delete button */}
      {isOwn && !deleted && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          title="Delete message"
          className="w-7 h-7 flex items-center justify-center rounded-full
            bg-[#093c5d]/60 border border-[#6fd1d7]/10
            text-slate-500 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/10
            transition-all duration-200
            opacity-0 group-hover:opacity-100
            translate-x-2 group-hover:translate-x-0
            disabled:opacity-50 shrink-0 mb-1"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Bubble */}
      <div
        className={cn(
          'flex flex-col gap-1.5 px-3.5 py-2.5 rounded-2xl text-sm max-w-[85vw] sm:max-w-sm transition-all duration-200',
          isOwn
            ? 'bg-gradient-to-br from-[#3b7597] to-[#093c5d] text-white rounded-br-sm border border-[#6fd1d7]/20 shadow-lg shadow-[#093c5d]/40'
            : 'glass text-slate-200 rounded-bl-sm border border-[#6fd1d7]/10',
        )}
      >
        {/* File attachment */}
        {file &&
          !deleted &&
          (isImageFile ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file}
                alt="attachment"
                className="rounded-xl max-w-[240px] max-h-[220px] object-cover"
              />
              <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white">
                {time}
              </span>
            </div>
          ) : (
            <a
              href={file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 bg-white/5 rounded-lg px-2.5 py-2 hover:bg-white/10 transition border border-[#6fd1d7]/10"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5df8d8] shrink-0" />
                <span className="text-xs truncate max-w-[140px] text-slate-300">
                  {getFileName(file)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">
                {time}
              </span>
            </a>
          ))}

        {/* Text content */}
        {(content || deleted) && (
          <div className="flex items-end gap-2">
            {deleted ? (
              <span className="text-xs text-slate-500 italic">
                Message deleted
              </span>
            ) : (
              <>
                <span className="leading-snug break-all min-w-0">
                  {content}
                </span>
                <span
                  className={cn(
                    'text-[10px] shrink-0 ml-2 whitespace-nowrap',
                    isOwn ? 'text-[#6fd1d7]/60' : 'text-slate-500',
                  )}
                >
                  {time}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
