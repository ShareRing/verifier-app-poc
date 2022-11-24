import { useEffect, useState } from 'react';

export const useDarkMode = (): [string, () => void, boolean] => {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);
  const saveTheme = (theme: string) => {
    window.localStorage.setItem('theme', theme);
    setTheme(theme);
  };

  const toggle = () => {
    if (theme === 'light') {
      saveTheme('dark');
    } else {
      saveTheme('light');
    }
  };

  useEffect(() => {
    const localTheme = window.localStorage.getItem('theme');
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !localTheme
      ? saveTheme('dark')
      : localTheme
      ? setTheme(localTheme)
      : saveTheme('light');
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return [theme, toggle, mounted];
};
