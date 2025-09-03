import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const toastVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring',
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { 
      duration: 0.2
    } 
  }
};

const iconMap = {
  success: <FiCheckCircle className="w-5 h-5 text-green-500" />,
  error: <FiAlertCircle className="w-5 h-5 text-red-500" />,
  warning: <FiAlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <FiInfo className="w-5 h-5 text-blue-500" />
};

const bgColorMap = {
  success: 'bg-green-50',
  error: 'bg-red-50',
  warning: 'bg-yellow-50',
  info: 'bg-blue-50'
};

export const CustomToast = ({ message, type = 'info', onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`${bgColorMap[type]} rounded-lg shadow-lg p-4 mb-2 flex items-start max-w-sm w-full`}
    >
      <div className="flex-shrink-0">
        {iconMap[type]}
      </div>
      <div className="ml-3 w-0 flex-1 pt-0.5">
        <p className="text-sm font-medium text-gray-900">
          {message}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex">
        <button
          onClick={onDismiss}
          className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <CustomToast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
