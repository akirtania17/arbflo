import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NetworkGraphic from "./NetworkGraphic";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main title with typewriter effect */}
            <motion.div variants={itemVariants} className="overflow-hidden">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-wide">
                <motion.span
                  className="inline-block text-foreground"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  ARB
                </motion.span>
                <motion.span
                  className="inline-block text-gradient"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  FLO
                </motion.span>
                <motion.span
                  className="inline-block w-1 h-12 md:h-16 bg-primary ml-2 align-middle animate-blink"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                />
              </h1>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-xl md:text-2xl font-display font-medium text-gradient tracking-wider"
            >
              Sports Arbitrage & Middles Scanner
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-lg leading-relaxed font-body"
            >
              Find guaranteed profit opportunities across sportsbooks.
              Our intelligent AI scanner detects arbitrage and middle opportunities in real-time.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <Button
                variant="glow"
                size="xl"
                onClick={onGetStarted}
                className="group font-display tracking-wider"
              >
                Get Started
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="xl" className="font-display tracking-wider">
                Learn More
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 pt-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {[
                { value: "500+", label: "Arbs Found Daily" },
                { value: "12+", label: "Sportsbooks" },
                { value: "2.5%", label: "Avg Profit" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={statVariants}
                  custom={index}
                  className="relative"
                >
                  <motion.div
                    className="text-3xl font-display font-bold text-gradient"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + index * 0.15, duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.div>
                  <motion.div
                    className="text-sm text-muted-foreground font-body tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.15, duration: 0.4 }}
                  >
                    {stat.label}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right graphic */}
          <motion.div
            className="hidden lg:block"
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="animate-float">
              <NetworkGraphic />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-64 h-64 bg-accent/20 rounded-full blur-[100px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
      />
    </section>
  );
};

export default HeroSection;
