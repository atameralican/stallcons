'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const emptySubscribe = () => () => {};

// hydration sonrası aktif temayı değiştiriyorum
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full w-9 h-9"
        aria-label="Tema değiştir"
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <Button
      id="theme-toggle"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="rounded-full w-9 h-9 relative overflow-hidden transition-all duration-300 hover:bg-accent"
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      <Sun
        className={`absolute size-4 transition-all duration-500 ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute size-4 transition-all duration-500 ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
