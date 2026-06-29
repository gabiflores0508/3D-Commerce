import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }: Props) {
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 24, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className={`relative z-10 w-full ${maxWidth} card p-6`}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-ink/5"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            {title && <h3 className="mb-4 text-lg font-bold">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
