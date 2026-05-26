'use client';

import { Paperclip, Smile, X, FileText, Send, Shield } from 'lucide-react';
import { useRef, useState, useCallback, useEffect } from 'react';
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

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachedFile(file);
    e.target.value = '';
  };

  const removeAttachment = () => setAttachedFile(null);

  const handleSend = async () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachedFile) || !activeChat || !user) return;
    const capturedFile = attachedFile;
    setSending(true);
    setValue('');
    setAttachedFile(null);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    getSocket().emit('stop_typing', activeChat._id);
    try {
      let res;
      if (capturedFile) {
        const form = new FormData();
        form.append('chatId', activeChat._id);
        if (trimmed) form.append('content', trimmed);
        form.append('file', capturedFile);
        res = await api.post('/messages', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/messages', {
          chatId: activeChat._id,
          content: trimmed,
        });
      }
      addMessage(res.data);
      useChatStore.getState().updateChatLastMessage(activeChat._id, res.data);
    } catch {
      setValue(trimmed);
      setAttachedFile(capturedFile);
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
  const canSend = (value.trim() || attachedFile) && activeChat && !sending;

  return (
    <div className="px-3 sm:px-5 py-3 bg-[#0a1929] border-t border-[#6fd1d7]/10 shrink-0 relative">
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

      {/* File preview */}
      {attachedFile && (
        <div className="flex items-center gap-2 mb-2.5 px-1">
          <div className="flex items-center gap-2 glass border border-[#6fd1d7]/15 rounded-xl px-3 py-1.5 max-w-xs">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={URL.createObjectURL(attachedFile)}
                alt="preview"
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <FileText className="w-4 h-4 text-[#5df8d8] shrink-0" />
            )}
            <span className="text-xs text-slate-300 truncate max-w-[160px]">
              {attachedFile.name}
            </span>
            <button
              onClick={removeAttachment}
              className="text-slate-500 hover:text-slate-300 shrink-0 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Attach */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          title="Attach file"
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-[#6fd1d7] hover:bg-[#6fd1d7]/10 transition-colors shrink-0"
        >
          <Paperclip className="w-[17px] h-[17px]" />
        </button>

        {/* Text input */}
        <div className="flex-1 flex items-center gap-2 glass bg-[#093c5d]/20 rounded-xl px-4 py-2.5 border border-[#6fd1d7]/10 focus-within:border-[#5df8d8]/40 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              activeChat
                ? 'Encrypted message...'
                : 'Select a chat to start messaging'
            }
            disabled={!activeChat || sending}
            className="flex-1 text-sm text-slate-200 placeholder:text-slate-600 outline-none bg-transparent disabled:opacity-50"
          />
          <button
            title="Emoji"
            onClick={() => setShowEmoji((prev) => !prev)}
            className={`shrink-0 transition-colors ${showEmoji ? 'text-[#5df8d8]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Smile className="w-[17px] h-[17px]" />
          </button>
        </div>

        {/* Send button */}
        <button
          title="Send"
          onClick={handleSend}
          disabled={!canSend}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
            canSend
              ? 'bg-gradient-to-br from-[#5df8d8] to-[#6fd1d7] text-[#060d14] shadow-lg shadow-[#5df8d8]/20 hover:shadow-[#5df8d8]/40 hover:scale-105 active:scale-95'
              : 'bg-[#093c5d]/30 text-slate-600 cursor-not-allowed'
          }`}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-[#060d14]/30 border-t-[#060d14] rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* E2EE note */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <Shield className="w-2.5 h-2.5 text-[#6fd1d7]" />
        <span className="text-[10px] text-slate-600">
          Messages are end-to-end encrypted. NexChat cannot read them.
        </span>
      </div>
    </div>
  );
}
