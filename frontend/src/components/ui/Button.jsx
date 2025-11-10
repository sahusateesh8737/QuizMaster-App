import { motion } from 'framer-motion'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2'

  const variants = {
    primary:
      'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50',
    secondary:
      'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 disabled:opacity-50',
    outline:
      'border-2 border-purple-600 text-purple-400 hover:bg-purple-600/10 disabled:opacity-50',
    danger: 'bg-red-600/20 text-red-400 hover:bg-red-600/30 disabled:opacity-50',
    ghost: 'text-slate-300 hover:text-white hover:bg-slate-700/50 disabled:opacity-50',
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
