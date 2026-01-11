import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export function Notification({ type, message, onClose }: NotificationProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl shadow-2xl max-w-md ${
          type === 'success' 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600" />
        ) : (
          <XCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
        )}
        <p className="font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-lg transition"
        >
          <X size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
