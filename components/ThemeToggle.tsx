import React from 'react';
import { Theme } from '../types';
import { SunIcon, MoonIcon, SystemIcon } from './icons';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themeOptions: { name: Theme, icon: React.FC<{className?: string}> }[] = [
    { name: 'light', icon: SunIcon },
    { name: 'dark', icon: MoonIcon },
    { name: 'system', icon: SystemIcon },
]

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  return (
    <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300">
      {themeOptions.map(opt => (
        <button
          key={opt.name}
          onClick={() => setTheme(opt.name)}
          className={`p-1.5 rounded-full transition-colors duration-300 ${
            theme === opt.name
              ? 'bg-white dark:bg-gray-700 text-primary-light dark:text-primary-dark shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
          }`}
          aria-label={`Switch to ${opt.name} theme`}
        >
          <opt.icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
