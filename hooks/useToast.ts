'use client';

import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  icon?: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-dismiss after duration (default 3s)
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, toast.duration || 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));

export function useToast() {
  const { addToast } = useToastStore();

  return {
    success: (message: string, options?: { icon?: string; duration?: number }) =>
      addToast({ message, type: 'success', ...options }),
    error: (message: string, options?: { icon?: string; duration?: number }) =>
      addToast({ message, type: 'error', ...options }),
    info: (message: string, options?: { icon?: string; duration?: number }) =>
      addToast({ message, type: 'info', ...options }),
  };
}
