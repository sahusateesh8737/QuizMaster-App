import { motion } from 'framer-motion'

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        easing: 'linear',
      },
    },
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        variants={containerVariants}
        animate="animate"
        className={`${sizes[size]} border-4 border-slate-700 border-t-purple-500 rounded-full`}
      />
      {text && <p className="text-slate-400">{text}</p>}
    </div>
  )
}
