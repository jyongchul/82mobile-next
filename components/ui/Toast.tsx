'use client';

import { motion } from 'framer-motion';
import { useToastStore, Toast as ToastType } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
}

function Toast({ toast }: ToastProps) {
  const { removeToast } = useToastStore();

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-gray-800',
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}
    >
      {toast.icon && (
        <span className="text-2xl flex-shrink-0">{toast.icon}</span>
      )}
      <p className="font-semibold flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/80 hover:text-white transition-colors flex-shrink-0"
      >
        ✕
      </button>
    </motion.div>
  );
}

export default Toast;
