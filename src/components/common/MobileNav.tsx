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
  const items = [
    { id: 'home' as AppView, label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'explorer' as AppView, label: 'Words', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'speed-drill' as AppView, label: 'Drill', icon: <Zap className="w-4 h-4" /> },
    { id: 'flashcards' as AppView, label: 'Cards', icon: <Layers className="w-4 h-4" /> },
    { id: 'quiz' as AppView, label: 'Quiz', icon: <Award className="w-4 h-4" /> },
    { id: 'listening' as AppView, label: 'Listen', icon: <Headphones className="w-4 h-4" /> },
    { id: 'favorites' as AppView, label: 'Saved', icon: <Star className="w-4 h-4" />, badge: favoritesCount > 0 ? favoritesCount : undefined },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 xl:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_-4px_24px_rgba(0,0,0,0.07)] pb-safe transition-colors">
      <div className="flex items-center justify-around px-1.5 py-1.5 max-w-lg mx-auto">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all flex-1 min-w-0 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                  : 'text-zinc-500 dark:text-zinc-400 font-medium hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <div className={`p-1 rounded-xl transition-transform ${isActive ? 'scale-110 bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400' : ''}`}>
                  {item.icon}
                </div>
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1.5 text-[9px] font-mono px-1 py-0.2 rounded-full bg-amber-500 text-white font-bold leading-none shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
