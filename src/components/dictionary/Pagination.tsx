import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/95 dark:bg-zinc-900/95 p-4 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] backdrop-blur-md"
    >
      <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
        Showing <strong className="text-zinc-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
        <strong className="text-zinc-900 dark:text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{' '}
        <strong className="text-zinc-900 dark:text-white">{totalItems.toLocaleString()}</strong> words
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>

        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
          Page {currentPage} of {totalPages}
        </span>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};
