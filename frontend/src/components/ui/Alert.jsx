import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, InfoIcon, XCircle, X } from 'lucide-react'

export default function Alert({
  type = 'info',
  title,
  message,
  onClose,
  closeable = true,
  className = '',
}) {
  const icons = {
    info: InfoIcon,
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
  }

  const styles = {
    info: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
    success: 'bg-green-600/20 border-green-500/30 text-green-400',
    warning: 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400',
    error: 'bg-red-600/20 border-red-500/30 text-red-400',
  }

  const Icon = icons[type]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`border rounded-lg p-4 flex items-start gap-3 ${styles[type]} ${className}`}
      >
        <Icon size={20} className="flex-shrink-0 mt-0.5" />

        <div className="flex-1">
          {title && <h3 className="font-semibold">{title}</h3>}
          {message && <p className="text-sm opacity-90">{message}</p>}
        </div>

        {closeable && (
          <button
            onClick={onClose}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={18} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
