import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastProps = {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
};

const toastStyles = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: 'text-emerald-500',
    iconComponent: CheckCircle
  },
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
    iconComponent: AlertCircle
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    iconComponent: Info
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: 'text-amber-500',
    iconComponent: AlertCircle
  }
};

export default function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const styles = toastStyles[type];
  const IconComponent = styles.iconComponent;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto close
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for exit animation
  };

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 max-w-sm w-full
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        relative p-4 rounded-lg border shadow-lg
        ${styles.bg} ${styles.text}
        backdrop-blur-sm bg-opacity-95
        animate-pulse-once
      `}>
        {/* Success animation overlay */}
        {type === 'success' && (
          <div className="absolute inset-0 rounded-lg bg-emerald-400 opacity-0 animate-success-pulse" />
        )}
        
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${styles.icon}`}>
            <IconComponent className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-5">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 ml-2 p-1 rounded-full
              hover:bg-black/10 transition-colors
              ${styles.text}
            `}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg">
          <div 
            className="h-full bg-current transition-all duration-300 ease-linear"
            style={{
              width: isLeaving ? '0%' : '100%',
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Toast container to manage multiple toasts
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, message, duration, onClose: removeToast };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose addToast globally
  React.useEffect(() => {
    (window as any).showToast = addToast;
    return () => {
      delete (window as any).showToast;
    };
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}

// Custom hook for using toasts
export function useToast() {
  const showToast = (type: ToastType, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showToast) {
      (window as any).showToast(type, message, duration);
    }
  };

  return {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration)
  };
}
