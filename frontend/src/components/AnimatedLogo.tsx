import { motion } from "framer-motion";

const AnimatedLogo = () => {
  return (
    <motion.div 
      className="relative flex items-center gap-1 group cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo container */}
      <div className="relative overflow-hidden">
        {/* Main logo text */}
        <motion.span 
          className="text-2xl md:text-3xl font-display font-bold tracking-wider"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-gradient">ARB</span>
          <span className="text-foreground">FLO</span>
        </motion.span>

        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan" />
        </motion.div>

        {/* Underline effect */}
        <motion.div
          className="absolute -bottom-1 left-0 h-[2px] bg-gradient-to-r from-primary via-accent to-primary"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Dot IO suffix */}
      <motion.span
        className="text-xs font-display text-muted-foreground tracking-widest"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        .io
      </motion.span>

      {/* Hover glow effect */}
      <motion.div
        className="absolute -inset-4 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
        initial={false}
      />

      {/* Corner brackets for futuristic feel */}
      <motion.div
        className="absolute -left-2 -top-1 w-2 h-2 border-l-2 border-t-2 border-primary/50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.9 }}
      />
      <motion.div
        className="absolute -right-2 -top-1 w-2 h-2 border-r-2 border-t-2 border-primary/50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1 }}
      />
      <motion.div
        className="absolute -left-2 -bottom-1 w-2 h-2 border-l-2 border-b-2 border-accent/50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1.1 }}
      />
      <motion.div
        className="absolute -right-2 -bottom-1 w-2 h-2 border-r-2 border-b-2 border-accent/50"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 1.2 }}
      />
    </motion.div>
  );
};

export default AnimatedLogo;
