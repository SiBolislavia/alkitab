'use client';

import type { Book, AppSettings, Theme, Language } from '@/types';

interface SettingsBarProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onToggleSearch: () => void;
  onOpenContact: () => void;
  showSearch: boolean;
  selectedBook: Book | null;
  selectedChapter: number;
}

const themeOptions: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Terang', icon: '☀️' },
  { value: 'dark', label: 'Gelap', icon: '🌙' },
  { value: 'sepia', label: 'Sepia', icon: '📜' },
];

const languageOptions: { value: Language; label: string }[] = [
  { value: 'id', label: 'Indonesia' },
  { value: 'sml', label: 'Simalungun' },
];

export function SettingsBar({
  settings,
  onUpdateSetting,
  onToggleSearch,
  onOpenContact,
  showSearch,
  selectedBook,
  selectedChapter,
}: SettingsBarProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2 border-b select-none"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
      data-tauri-drag-region
    >
      {/* Left: Current Location */}
      <div className="flex items-center gap-3">
        {selectedBook && (
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {settings.language === 'sml' ? (selectedBook.name_sml || selectedBook.name) : selectedBook.name_id} — {settings.language === 'sml' ? 'Bindu' : 'Pasal'} {selectedChapter}
          </span>
        )}
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Search Toggle */}
        <button
          onClick={onToggleSearch}
          className="p-2 rounded-lg transition-colors duration-200"
          style={{
            color: showSearch ? 'var(--color-accent)' : 'var(--color-text-secondary)',
            backgroundColor: showSearch ? 'var(--color-highlight)' : 'transparent',
          }}
          onMouseEnter={e => {
            if (!showSearch) e.currentTarget.style.backgroundColor = 'var(--color-highlight)';
          }}
          onMouseLeave={e => {
            if (!showSearch) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Pencarian (Ctrl+F)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Language Selector */}
        <select
          value={settings.language}
          onChange={e => onUpdateSetting('language', e.target.value as Language)}
          className="text-xs px-2 py-1.5 rounded-md border outline-none cursor-pointer transition-colors duration-200"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          title="Pilih bahasa"
        >
          {languageOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Font Size Controls (Reader) */}
        <div className="flex items-center gap-1" title="Ukuran Font Pembacaan Ayat">
          <span className="text-[11px] opacity-60 mr-0.5 hidden sm:inline">Baca:</span>
          <button
            onClick={() => onUpdateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
            className="p-1.5 rounded-md transition-colors duration-200 text-xs font-bold cursor-pointer hover:bg-[var(--color-highlight)]"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Perkecil font baca ayat"
          >
            A-
          </button>
          <span
            className="text-xs min-w-[1.6rem] text-center font-mono"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {settings.fontSize}
          </span>
          <button
            onClick={() => onUpdateSetting('fontSize', Math.min(32, settings.fontSize + 2))}
            className="p-1.5 rounded-md transition-colors duration-200 text-sm font-bold cursor-pointer hover:bg-[var(--color-highlight)]"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Perbesar font baca ayat"
          >
            A+
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Font Size Controls (Presentation Mode) */}
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-lg border"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-primary)',
          }}
          title="Atur Ukuran Font Layar Penuh / Mode Presentasi"
        >
          <span className="text-xs" title="Mode Presentasi">📽️</span>
          <span className="text-[11px] font-medium hidden lg:inline" style={{ color: 'var(--color-text-secondary)' }}>
            Presentasi:
          </span>
          <button
            onClick={() =>
              onUpdateSetting(
                'presentationFontSize',
                Math.max(24, (settings.presentationFontSize || 42) - 4)
              )
            }
            className="p-1 rounded-md transition-colors duration-200 text-xs font-bold cursor-pointer hover:bg-[var(--color-highlight)]"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Perkecil font presentasi (-4px)"
          >
            A-
          </button>
          <span
            className="text-xs min-w-[2rem] text-center font-mono font-bold"
            style={{ color: 'var(--color-accent)' }}
          >
            {settings.presentationFontSize || 42}
          </span>
          <button
            onClick={() =>
              onUpdateSetting(
                'presentationFontSize',
                Math.min(72, (settings.presentationFontSize || 42) + 4)
              )
            }
            className="p-1 rounded-md transition-colors duration-200 text-sm font-bold cursor-pointer hover:bg-[var(--color-highlight)]"
            style={{ color: 'var(--color-text-secondary)' }}
            title="Perbesar font presentasi (+4px)"
          >
            A+
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Theme Selector */}
        <div className="flex items-center gap-0.5">
          {themeOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => onUpdateSetting('theme', opt.value)}
              className="p-1.5 rounded-md transition-colors duration-200 text-sm"
              style={{
                backgroundColor:
                  settings.theme === opt.value
                    ? 'var(--color-highlight)'
                    : 'transparent',
              }}
              onMouseEnter={e => {
                if (settings.theme !== opt.value) {
                  e.currentTarget.style.backgroundColor = 'var(--color-highlight)';
                }
              }}
              onMouseLeave={e => {
                if (settings.theme !== opt.value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              title={opt.label}
            >
              {opt.icon}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Hubungi Saya Button */}
        <button
          onClick={onOpenContact}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 cursor-pointer"
          style={{
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--color-highlight)';
            e.currentTarget.style.color = 'var(--color-accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          title={settings.language === 'sml' ? 'Hubungi Ahu (WA / Gmail)' : 'Hubungi Saya (WA / Gmail)'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="hidden md:inline">
            {settings.language === 'sml' ? 'Hubungi Ahu' : 'Hubungi Saya'}
          </span>
        </button>
      </div>
    </div>
  );
}
