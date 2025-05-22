"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <div className="w-full max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Sui{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Waterfall
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
              Make your events unforgettable.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link 
              href="/host/create"
              className="group relative overflow-hidden rounded-full w-1/2 bg-blue-600 px-6 py-4 text-white shadow-md transition-all hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center justify-between">
                <span className="text-xl font-medium">Event Host</span>
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600"
                initial={false}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </Link>
            
            <Link 
              href="/attendee/attend"
              className="group relative overflow-hidden rounded-full w-1/2 bg-indigo-600 px-6 py-4 text-white shadow-md transition-all hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center justify-between">
                <span className="text-xl font-medium">Attendee</span>
                <ArrowRightIcon className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600"
                initial={false}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Waterfall. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
