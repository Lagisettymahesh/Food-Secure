import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <div className="glass rounded-2xl p-5 flex items-center gap-4 animate-pulse">
    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-dark-border flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-6 bg-gray-200 dark:bg-dark-border rounded w-1/3" />
      <div className="h-3 bg-gray-100 dark:bg-dark-panel rounded w-1/2" />
    </div>
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-dark-border flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-2/5" />
      <div className="h-3 bg-gray-100 dark:bg-dark-panel rounded w-1/4" />
    </div>
    <div className="h-6 w-16 bg-gray-200 dark:bg-dark-border rounded-full" />
  </div>
);

export const SkeletonStatGrid = ({ count = 4 }) => (
  <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-4`}>
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Animated toast notification
export const Toast = ({ message, type = 'info', onClose }) => {
  const colors = {
    info:    'bg-blue-50   border-blue-200   text-blue-700',
    success: 'bg-green-50  border-green-200  text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    error:   'bg-red-50    border-red-200    text-red-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-20 right-4 z-[9999] max-w-sm border rounded-2xl px-5 py-4 shadow-xl flex items-start gap-3 ${colors[type]}`}
    >
      <span className="text-lg leading-none">
        {type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 text-lg leading-none">×</button>
      )}
    </motion.div>
  );
};
