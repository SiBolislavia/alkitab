'use client';

import { useState } from 'react';
import type { Book, Language } from '@/types';
import { openExternalUrl } from '@/services/linkService';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBook: Book | null;
  selectedChapter: number;
  language: Language;
}

// Developer contact endpoints
const DEVELOPER_EMAIL = 'dev588sibolis@gmail.com';
const DEVELOPER_WHATSAPP_NUMBER = '6285394716387';
export function ContactModal({
  isOpen,
  onClose,
  selectedBook,
  selectedChapter,
  language,
}: ContactModalProps) {
  const [topic, setTopic] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const bookName = selectedBook
    ? (language === 'sml' ? (selectedBook.name_sml || selectedBook.name) : selectedBook.name_id)
    : 'Kejadian';
  const contextPlaceholder = `Contoh: ${bookName} Pasal/Bindu ${selectedChapter}`;

  const topicOptions: Record<string, { id: string; sml: string }> = {
    masukan: { id: 'Masukan & Saran', sml: 'Masukan & Saran' },
    teks_ayat: { id: 'Koreksi Teks Ayat / Terjemahan', sml: 'Pangubaon Teks Ayat' },
    kendala: { id: 'Kendala / Error Aplikasi', sml: 'Kendala Aplikasi' },
    pertanyaan: { id: 'Pertanyaan', sml: 'Sungkun-sungkun' },
    lainnya: { id: 'Lainnya', sml: 'Na Legan' },
  };

  const selectedTopicLabel = topic && topicOptions[topic]
    ? (language === 'sml' ? topicOptions[topic].sml : topicOptions[topic].id)
    : '';

  const cleanedContext = contextInput.trim() || 'Umum';

  const formattedSubject = selectedTopicLabel
    ? `[Alkitab] ${selectedTopicLabel} - ${cleanedContext}`
    : `[Alkitab] ${cleanedContext}`;

  const topicLine = selectedTopicLabel ? `• Topik: ${selectedTopicLabel}\n` : '';
  const formattedBody = `Halo, saya ingin menyampaikan masukan untuk aplikasi Alkitab:

${topicLine}• Bagian/Konteks: ${cleanedContext}
• Bahasa: ${language === 'sml' ? 'Simalungun' : 'Indonesia'}
• Versi: 1.0.0 (Desktop)

Isi Masukan / Catatan:
${message.trim() ? message.trim() : '(Belum ada catatan tambahan)'}

Terima kasih!`;

  const handleOpenWhatsApp = async () => {
    const encoded = encodeURIComponent(formattedBody);
    const url = `https://wa.me/${DEVELOPER_WHATSAPP_NUMBER}?text=${encoded}`;
    await openExternalUrl(url);
    onClose();
  };

  const handleOpenGmailWeb = async () => {
    const encodedSubject = encodeURIComponent(formattedSubject);
    const encodedBody = encodeURIComponent(formattedBody);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${DEVELOPER_EMAIL}&su=${encodedSubject}&body=${encodedBody}`;
    await openExternalUrl(url);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border flex flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">
                {language === 'sml' ? 'Hubungi Ahu' : 'Hubungi Saya'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {language === 'sml'
                  ? 'Kirimon masukan langsung marhitei WhatsApp atap Gmail'
                  : 'Kirim masukan atau kendala langsung via WhatsApp atau Gmail'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-75 cursor-pointer"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Tutup (Esc)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Form: Editable Context / Bagian yang Perlu Diperbaiki */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {language === 'sml' ? 'Bagian / Ayat na Sihol Ipaturei' : 'Bagian / Konteks yang Perlu Diperbaiki'}
              </label>
            </div>
            <input
              type="text"
              value={contextInput}
              onChange={e => setContextInput(e.target.value)}
              placeholder={contextPlaceholder}
              className="w-full px-3 py-2 rounded-lg border outline-none font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Form: Topic */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {language === 'sml' ? 'Topik Masukan' : 'Topik Masukan'}
            </label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border outline-none cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: topic ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              }}
            >
              <option value="" disabled hidden>
                Pilih Masukan
              </option>
              {Object.entries(topicOptions).map(([key, label]) => (
                <option key={key} value={key} style={{ color: 'var(--color-text-primary)' }}>
                  {language === 'sml' ? label.sml : label.id}
                </option>
              ))}
            </select>
          </div>

          {/* Form: Message / Masukan */}
          <div>
            <label className="block font-semibold mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {language === 'sml' ? 'Hatorangan Masukan' : 'Masukan / Rincian Pesan Anda'}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={
                language === 'sml'
                  ? 'Tuliskan masukan, pesan, atap kendala na sihol ipadas ham...'
                  : 'Tuliskan masukan, teks yang keliru, atau saran perbaikan di sini...'
              }
              className="w-full p-3 rounded-lg border outline-none resize-none transition-colors"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Direct Send Buttons: WhatsApp & Gmail */}
          <div className="pt-2 space-y-2">
            <p className="font-semibold text-center text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
              Kirim masukan langsung ke:
            </p>

            {/* Direct WhatsApp Send */}
            <button
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
              style={{ backgroundColor: '#25D366' }}
              title="Kirim masukan langsung via WhatsApp"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm5.78 14.07c-.24.68-1.4 1.34-1.95 1.4-.53.07-1.19.1-3.41-.82-2.84-1.18-4.66-4.08-4.8-4.27-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07.99-2.35.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.42-.07.66.5.24.58.82 2.02.89 2.17.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.44.54-.15.15-.3.31-.13.61.17.29.77 1.27 1.65 2.06 1.14 1.01 2.09 1.33 2.39 1.48.3.15.47.12.65-.08.18-.2.76-.89.96-1.19.2-.3.4-.25.68-.15.28.1 1.78.84 2.09.99.31.15.52.23.59.36.08.13.08.77-.16 1.45z"/>
              </svg>
              <span>Kirim via WhatsApp</span>
            </button>

            {/* Direct Gmail Send */}
            <button
              onClick={handleOpenGmailWeb}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
              style={{ backgroundColor: '#EA4335' }}
              title="Kirim masukan langsung via Gmail"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span>Kirim via Gmail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
