import React from 'react';
import { Home, BookOpen, Zap, Layers, Award, Headphones, Star } from 'lucide-react';
import { AppView } from '../../types';

interface MobileNavProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  favoritesCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
  favoritesCount
}) => {
  const isPracticeActive = ['practice', 'speed-drill', 'flashcards', 'quiz', 'listening', 'spelling'].includes(currentView);
  const isDictActive = currentView === 'explorer' || currentView === 'dictionary';
  const isProgressActive = currentView === 'progress' || currentView === 'favorites';

  const items = [
    { id: 'home' as AppView, label: 'Home', icon: <Home className="w-5 h-5" />, active: currentView === 'home' },
    { id: 'explorer' as AppView, label: 'Dictionary', icon: <BookOpen className="w-5 h-5" />, active: isDictActive },
    { id: 'practice' as AppView, label: 'Practice', icon: <Zap className="w-5 h-5" />, active: isPracticeActive },
    { id: 'progress' as AppView, label: 'Progress', icon: <Star className="w-5 h-5" />, badge: favoritesCount > 0 ? favoritesCount : undefined, active: isProgressActive },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] pb-safe transition-colors">
      <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = item.active;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all flex-1 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <div className={`p-1.5 rounded-xl transition-transform ${isActive ? 'scale-110 bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400' : ''}`}>
                  {item.icon}
                </div>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold leading-none shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight font-semibold">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
