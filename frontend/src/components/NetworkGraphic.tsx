import { motion } from "framer-motion";

const NetworkGraphic = () => {
  const nodes = [
    { x: 150, y: 80 },
    { x: 250, y: 50 },
    { x: 300, y: 150 },
    { x: 250, y: 250 },
    { x: 150, y: 220 },
    { x: 100, y: 150 },
    { x: 200, y: 150 },
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 300"
        className="w-full max-w-md h-auto"
        fill="none"
      >
        {/* Connection lines */}
        {connections.map(([from, to], i) => (
          <motion.line
            key={`line-${i}`}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
          />
        ))}

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270, 80%, 65%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(290, 85%, 65%)" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="nodeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(290, 85%, 70%)" />
            <stop offset="100%" stopColor="hsl(270, 80%, 55%)" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Nodes */}
        {nodes.map((node, i) => (
          <motion.g key={`node-${i}`} filter="url(#glow)">
            {/* Outer glow ring */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={i === 6 ? 24 : 14}
              fill="url(#nodeGradient)"
              opacity="0.3"
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                delay: i * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Main node */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={i === 6 ? 16 : 10}
              fill="url(#nodeGradient)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
            {/* Inner dark circle */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={i === 6 ? 8 : 5}
              fill="hsl(270, 50%, 10%)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

export default NetworkGraphic;
