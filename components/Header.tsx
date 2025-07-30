'use client';
import React from 'react';
import { Theme } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  return (
    <header className="bg-white/80 dark:bg-black/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Attend
          </h1>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
    </header>
  );
};

export default Header;
