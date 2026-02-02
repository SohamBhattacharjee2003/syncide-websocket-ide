import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { VscClose, VscInfo, VscWarning, VscError, VscCheck } from "react-icons/vsc";

const toastTypes = {
  success: {
    icon: VscCheck,
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: VscError,
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    iconColor: "text-red-400",
  },
  warning: {
    icon: VscWarning,
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    iconColor: "text-yellow-400",
  },
  info: {
    icon: VscInfo,
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
};

function Toast({ id, type = "info", title, message, onClose, duration = 5000 }) {
  const config = toastTypes[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`
        ${config.bgColor} ${config.borderColor}
        border backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm w-full
      `}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-medium text-white">{title}</p>}
          {message && (
            <p className="text-xs text-neutral-400 mt-0.5">{message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-neutral-500 hover:text-white transition-colors shrink-0"
        >
          <VscClose className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      {duration && (
        <motion.div
          className={`absolute bottom-0 left-0 h-0.5 ${config.iconColor.replace('text-', 'bg-')}`}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
}

export function ToastContainer({ toasts = [], onClose }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (title, message) => addToast({ type: "success", title, message });
  const error = (title, message) => addToast({ type: "error", title, message });
  const warning = (title, message) => addToast({ type: "warning", title, message });
  const info = (title, message) => addToast({ type: "info", title, message });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />,
  };
}

export default Toast;
