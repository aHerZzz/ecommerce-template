import React, { useEffect, useState } from 'react';
import { Button } from './Button';

const THEMES = ['light', 'dark', 'system'] as const;
type ThemeOption = (typeof THEMES)[number];

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeOption>('system');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as ThemeOption | null) ?? 'system';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const applyTheme = (value: ThemeOption) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = value === 'system' ? (prefersDark ? 'dark' : 'light') : value;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  };

  const handleChange = (next: ThemeOption) => {
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Selector de tema">
      {THEMES.map((option) => (
        <Button
          key={option}
          size="sm"
          variant={theme === option ? 'primary' : 'secondary'}
          aria-pressed={theme === option}
          aria-label={`Cambiar a modo ${option === 'system' ? 'sistema' : option}`}
          onClick={() => handleChange(option)}
        >
          {option === 'light' && '☀️'}
          {option === 'dark' && '🌙'}
          {option === 'system' && '🖥️'}
        </Button>
      ))}
    </div>
  );
}
