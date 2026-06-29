import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/utils/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({ open, onClose, side = 'right', title, children, width = 'w-full sm:max-w-md' }: Props) {
  useScrollLock(open);
  const x = side === 'right' ? 320 : -320;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x }}
            animate={{ x: 0 }}
            exit={{ x }}
            transition={{ type: 'tween', duration: 0.25 }}
            className={cn(
              'absolute top-0 bottom-0 flex flex-col bg-bg shadow-2xl',
              side === 'right' ? 'right-0' : 'left-0',
              width,
            )}
          >
            <header className="flex items-center justify-between border-b border-ink-line px-5 py-4">
              <h3 className="text-base font-bold">{title}</h3>
              <button onClick={onClose} className="rounded-full p-1.5 hover:bg-ink/5" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
