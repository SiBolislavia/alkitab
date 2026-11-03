'use client';

import type { Book, AppSettings, Theme, Language } from '@/types';

interface SettingsBarProps {
  settings: AppSettings;
  onUpdateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  onToggleSearch: () => void;
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

        {/* Font Size Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
            className="p-1.5 rounded-md transition-colors duration-200 text-xs font-bold"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e =>
              (e.currentTarget.style.backgroundColor = 'var(--color-highlight)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            title="Perkecil font"
          >
            A-
          </button>
          <span
            className="text-xs min-w-[2rem] text-center"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {settings.fontSize}
          </span>
          <button
            onClick={() => onUpdateSetting('fontSize', Math.min(32, settings.fontSize + 2))}
            className="p-1.5 rounded-md transition-colors duration-200 text-sm font-bold"
            style={{ color: 'var(--color-text-secondary)' }}
            onMouseEnter={e =>
              (e.currentTarget.style.backgroundColor = 'var(--color-highlight)')
            }
            onMouseLeave={e =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            title="Perbesar font"
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
      </div>
    </div>
  );
}
