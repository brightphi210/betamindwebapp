import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-9999 bg-background flex items-center justify-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="flex flex-col items-center"
      >
        <img
          src="/beta1.png"
          alt="Betamind Logo"
          className="w-16 h-16 object-contain mb-4"
        />
        <p className="text-primary text-sm font-medium tracking-widest">
          LOADING...
        </p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
