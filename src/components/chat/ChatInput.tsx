'use client';

import { Paperclip, Smile, Mic, Heading, X, FileText } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

const EmojiPicker = dynamic(() => import('./EmojiPicker'), { ssr: false });

const TYPING_TIMEOUT = 1500;
const ACCEPTED_FILE_TYPES = 'image/*,video/*,.pdf,.doc,.docx,.txt';

export default function ChatInput() {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const { activeChat, addMessage } = useChatStore();
  const { user } = useAuthStore();

  // ── Typing indicator ──────────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!activeChat) return;
    const socket = getSocket();
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', activeChat._id);
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop_typing', activeChat._id);
    }, TYPING_TIMEOUT);
  }, [activeChat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    emitTyping();
  };

  // ── File attachment ───────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachedFile(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const removeAttachment = () => setAttachedFile(null);

  // ── Send ──────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachedFile) || !activeChat || !user) return;

    setSending(true);
    setValue('');
    setAttachedFile(null);

    // Stop typing indicator
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    getSocket().emit('stop_typing', activeChat._id);

    // Build multipart/form-data — required by the API
    const form = new FormData();
    form.append('chatId', activeChat._id);
    if (trimmed) form.append('content', trimmed);
    if (attachedFile) form.append('file', attachedFile);

    try {
      const res = await api.post('/messages', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      addMessage(res.data);
      // Broadcast to room — include chatId so backend can route correctly
      getSocket().emit('send_message', { ...res.data, chatId: activeChat._id });
    } catch {
      // Restore on failure
      setValue(trimmed);
      setAttachedFile(attachedFile);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setValue((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const isImage = attachedFile?.type.startsWith('image/');

  return (
    <div className="px-2 sm:px-4 py-2.5 bg-white border-t border-gray-100 shrink-0 relative">
      {/* Emoji picker */}
      {showEmoji && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowEmoji(false)}
          />
          <div className="absolute bottom-full right-4 mb-2 z-20 shadow-xl rounded-2xl overflow-hidden">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        </>
      )}

      {/* File preview strip */}
      {attachedFile && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 max-w-xs">
            {isImage ? (
              <img
                src={URL.createObjectURL(attachedFile)}
                alt="preview"
                className="w-8 h-8 rounded object-cover shrink-0"
              />
            ) : (
              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
            )}
            <span className="text-xs text-blue-700 truncate max-w-[160px]">
              {attachedFile.name}
            </span>
            <button
              onClick={removeAttachment}
              className="text-blue-400 hover:text-blue-600 shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-4 py-2 shadow-sm">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment button */}
        <button
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-gray-500 transition-colors shrink-0"
        >
          <Paperclip className="w-[18px] h-[18px]" />
        </button>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            activeChat
              ? 'Type your message here...'
              : 'Select a chat to start messaging'
          }
          disabled={!activeChat || sending}
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-400 outline-none bg-transparent disabled:opacity-50"
        />

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            title="Markdown"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-500 transition-colors"
          >
            <Heading className="w-[16px] h-[16px]" />
          </button>
          <button
            title="Emoji"
            onClick={() => setShowEmoji((prev) => !prev)}
            className={`w-7 h-7 flex items-center justify-center transition-colors ${
              showEmoji ? 'text-blue-500' : 'text-gray-400 hover:text-gray-500'
            }`}
          >
            <Smile className="w-[18px] h-[18px]" />
          </button>
          <button
            title="Voice message"
            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-500 transition-colors"
          >
            <Mic className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
