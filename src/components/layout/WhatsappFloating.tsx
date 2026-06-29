import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { whatsappGeneral } from '@/utils/whatsapp';

export function WhatsappFloating() {
  return (
    <motion.a
      href={whatsappGeneral()}
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-2xl hover:bg-emerald-600"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </motion.a>
  );
}
