"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import Header from "./header";

interface NavLink {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navLinks: NavLink[];
  userType: "host" | "attendee";
}

export default function DashboardLayout({
  children,
  navLinks,
  userType,
}: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <Header />

      <div className="flex-1 flex relative">
        {/* Desktop Side Navigation */}
        <nav className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 p-4 gap-2">
          <p className="text-sm font-medium text-gray-500 mb-2 uppercase">
            {userType === "host" ? "Host Dashboard" : "Attendee Dashboard"}
          </p>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors relative ${
                  isActive
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <link.icon className="h-5 w-5 relative z-10" />
                <span className="relative z-10">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-0 right-0 mx-auto w-[90%] max-w-md bg-white dark:bg-gray-900 rounded-full shadow-lg border border-gray-200 dark:border-gray-800 z-10">
        <motion.div
          className="flex justify-around py-3"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <link.icon className="h-6 w-6" />
                <span className="text-xs">{link.name}</span>
              </Link>
            );
          })}
        </motion.div>
      </nav>
    </div>
  );
}
