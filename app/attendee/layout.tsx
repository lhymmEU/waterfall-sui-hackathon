"use client";

import DashboardLayout from "../components/DashboardLayout";
import { TicketIcon, UserPlusIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

const attendeeNavLinks = [
  {
    name: "Attend Events",
    href: "/attendee/attend",
    icon: TicketIcon,
  },
  {
    name: "My Events",
    href: "/attendee/manage",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    name: "Add Friends",
    href: "/attendee/add-friend",
    icon: UserPlusIcon,
  },
];

export default function AttendeeLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout 
      title="Attendee Dashboard" 
      navLinks={attendeeNavLinks} 
      userType="attendee"
    >
      {children}
    </DashboardLayout>
  );
} 