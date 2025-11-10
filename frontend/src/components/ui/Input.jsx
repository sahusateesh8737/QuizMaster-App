import { motion } from 'framer-motion'

export default function Input({
  label,
  error,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        )}

        <input
          disabled={disabled}
          className={`w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg transition-all duration-200 ${
            Icon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-2 flex items-center gap-1"
        >
          <span>⚠️</span> {error}
        </motion.p>
      )}
    </motion.div>
  )
}
