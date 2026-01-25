'use client';

import { AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/hooks/useToast';
import Toast from '@/components/ui/Toast';

export default function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-4 md:right-4 sm:bottom-20 sm:left-4 sm:right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
