import { reactive } from 'vue';

const toasts = reactive([]);

export const useToast = () => {
  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now();
    toasts.push({ id, message, type });

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  };

  return {
    toasts,
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    removeToast
  };
};
