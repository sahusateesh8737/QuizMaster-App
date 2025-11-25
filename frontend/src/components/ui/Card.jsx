import { motion } from 'framer-motion'

export default function Card({
  children,
  className = '',
  hover = true,
  onClick = undefined,
  ...props
}) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 transition-all duration-200 ${
        hover ? 'cursor-pointer hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
