"use client";

import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";

export default function Header() {
  return (
    <>
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Waterfall
          </Link>
          <ConnectButton />
        </div>
      </header>
    </>
  );
}
