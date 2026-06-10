import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

let toastId = 0;

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const { id, type = 'info', message } = toast;
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [id, toast.duration, onRemove]);

  return (
    <div className={`toast toast--${type}`}>
      <div className="toast-icon">
        <Icon size={20} />
      </div>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => onRemove(id)} aria-label="Zamknij">
        <X size={16} />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type, duration) => {
    return addToast(message, type, duration);
  }, [addToast]);

  const success = useCallback((msg, dur) => toast(msg, 'success', dur), [toast]);
  const error = useCallback((msg, dur) => toast(msg, 'error', dur), [toast]);
  const info = useCallback((msg, dur) => toast(msg, 'info', dur), [toast]);

  return { toasts, removeToast, toast, success, error, info };
}
