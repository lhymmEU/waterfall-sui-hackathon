"use client";

import DashboardLayout from "../components/DashboardLayout";
import { CalendarIcon, UsersIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

const hostNavLinks = [
  {
    name: "Create Event",
    href: "/host/create",
    icon: CalendarIcon,
  },
  {
    name: "Manage Events",
    href: "/host/manage",
    icon: UsersIcon,
  },
];

export default function HostLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout
      title="Event Host Dashboard"
      navLinks={hostNavLinks}
      userType="host"
    >
      {children}
    </DashboardLayout>
  );
}
