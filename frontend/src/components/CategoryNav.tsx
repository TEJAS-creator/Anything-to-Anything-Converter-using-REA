import React from 'react';
import { motion } from 'framer-motion';
import type { CategoryType } from '../types';
import { CATEGORIES } from '../utils/toolsData';
import {
  FileText,
  Presentation,
  Image,
  Database,
  Film,
  BookOpen,
  Archive,
  Grid
} from 'lucide-react';

interface CategoryNavProps {
  activeCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: Grid,
  pdf: FileText,
  office: Presentation,
  image: Image,
  data: Database,
  media: Film,
  ebook: BookOpen,
  archive: Archive
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max p-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id] || Grid;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as CategoryType)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-rose-500 to-indigo-600 rounded-xl shadow-md shadow-rose-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon className="w-4 h-4" />
                {cat.name}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
