import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "./AnimatedLogo";

const Header = () => {
  const navItems = ["How It Works", "Features", "Pricing"];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <AnimatedLogo />

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-muted-foreground hover:text-foreground transition-colors font-body text-lg tracking-wide"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Button variant="glow" size="sm" className="font-display tracking-wider">
            Login
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
