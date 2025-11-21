export const pageVariants = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.98,
    transition: { duration: 0.2, ease: "easeIn" } 
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export const buttonClick = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.96 }
};

export const cardHover = {
  rest: { y: 0, boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  hover: { 
    y: -5, 
    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const modalPanel = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0, 
    y: 50, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};