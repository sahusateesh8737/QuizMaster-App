import { motion } from 'framer-motion'

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  const variants = {
    default: 'bg-slate-700 text-slate-200',
    primary: 'bg-purple-600/20 text-purple-400 border border-purple-500/30',
    success: 'bg-green-600/20 text-green-400 border border-green-500/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-600/20 text-red-400 border border-red-500/30',
    blue: 'bg-blue-600/20 text-blue-400 border border-blue-500/30',
  }

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </motion.span>
  )
}
