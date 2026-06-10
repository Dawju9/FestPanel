import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const toast = useCallback((msg, type, dur) => {
    addToast(msg, type, dur);
  }, [addToast]);

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error = useCallback((msg, dur) => toast(msg, 'error', dur), [toast]);
  const info = useCallback((msg, dur) => toast(msg, 'info', dur), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, removeToast }}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
