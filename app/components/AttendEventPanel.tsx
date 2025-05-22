import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AttendEventPanelProps {
  isOpen: boolean;
  onClose: () => void;
  eventName: string;
  onSubmit: (formData: {
    name: string;
    description: string;
    x_handle: string;
    tg_handle: string;
  }) => void;
}

export default function AttendEventPanel({
  isOpen,
  onClose,
  eventName,
  onSubmit,
}: AttendEventPanelProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    x_handle: "",
    tg_handle: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal container */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal content */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden
                        w-full max-w-md mx-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex justify-between items-center p-4 sm:p-5 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold">Attend: {eventName}</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Modal content */}
              <div className="p-4 sm:p-5 overflow-y-auto max-h-[60vh] sm:max-h-[65vh]">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="x_handle"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      X Handle
                    </label>
                    <input
                      type="text"
                      id="x_handle"
                      name="x_handle"
                      value={formData.x_handle}
                      onChange={handleChange}
                      placeholder="@username"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tg_handle"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Telegram Handle
                    </label>
                    <input
                      type="text"
                      id="tg_handle"
                      name="tg_handle"
                      value={formData.tg_handle}
                      onChange={handleChange}
                      placeholder="@username"
                      className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                    />
                  </div>
                </form>
              </div>

              {/* Modal footer */}
              <div className="border-t dark:border-gray-700 p-4 sm:p-5">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign-in
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
