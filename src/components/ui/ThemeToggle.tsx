import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className="gap-2"
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
