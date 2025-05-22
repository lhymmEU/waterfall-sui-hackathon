"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { Event } from "@/types/type";
import { PACKAGE_NAME } from "@/utils/constants";
import { PACKAGE_ID } from "@/utils/constants";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";
import AttendEventPanel from "@/app/components/AttendEventPanel";
import { SuiObjectResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useRouter } from "next/navigation";

export default function AttendEventsPage() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [globalEvents, setGlobalEvents] = useState<Event[]>([]);
  const [globalEventObjs, setGlobalEventObjs] = useState<SuiObjectResponse[]>(
    []
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { mutate: execSignIn } = useSignAndExecuteTransaction();
  const router = useRouter();

  useEffect(() => {
    if (!currentAccount) return;

    const getEvents = async () => {
      // Get all EventCreated events
      const eventIds: string[] = [];
      const eventsRes = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::${PACKAGE_NAME}::EventCreated`,
        },
      });

      if (!eventsRes) return;

      eventsRes.data.forEach((event) => {
        // @ts-expect-error Type "type" is actually defined
        eventIds.push(event.parsedJson?.event_id);
      });

      console.log("Event IDs:", eventIds);

      const fetchPromises = eventIds.map((eventId) =>
        suiClient.getObject({
          id: eventId,
          options: { showContent: true },
        })
      );

      const eventsObjRes = await Promise.all(fetchPromises);

      if (!eventsObjRes) return;
      console.log("Global event objects: ", eventsObjRes);
      setGlobalEventObjs(eventsObjRes);

      const parsedEvents: Event[] = [];
      eventsObjRes.forEach((event) => {
        // @ts-expect-error Fields are present in the content but not properly typed
        const eventFields = event.data?.content?.fields;
        if (!eventFields) return;

        const { date, description, host_address, host_name, location, name, participants } =
          eventFields;
        const myEvent: Event = {
          date,
          description,
          host_address,
          host_name,
          location,
          event_name: name,
          attendees: participants.fields.contents,
        };
        parsedEvents.push(myEvent);
      });
      console.log("Parsed events: ", parsedEvents);
      setGlobalEvents(parsedEvents);
    };
    getEvents();
  }, [currentAccount, suiClient]);

  // Filter events based on search term
  const filteredEvents = globalEvents.filter(
    (event) =>
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.host_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAttendEvent = (event: Event) => {
    console.log("Attending event:", event.event_name);
    setSelectedEvent(event);
    setIsPanelOpen(true);
  };

  const handleSubmitAttendance = (formData: {
    name: string;
    description: string;
    x_handle: string;
    tg_handle: string;
  }) => {
    console.log("Form data submitted:", formData);
    console.log("For event:", selectedEvent?.event_name);
    // Get the event object id from the
    if (!globalEventObjs) return;

    const eventObj = globalEventObjs.find(
      // @ts-expect-error Fields are present in the content but not properly typed
      (obj) => obj.data?.content?.fields?.name === selectedEvent?.event_name
    );
    if (!eventObj) {
      console.error("Event object not found");
      return;
    }
    const eventObjId = eventObj.data?.objectId;
    if (!eventObjId) {
      console.error("Event object id not found");
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${PACKAGE_NAME}::sign_in`,
      typeArguments: [],
      arguments: [
        tx.object(eventObjId),
        tx.pure.string(formData.name),
        tx.pure.string(formData.description),
        tx.pure.string(formData.x_handle),
        tx.pure.string(formData.tg_handle),
      ],
    });

    execSignIn({transaction: tx}, {
      onSuccess: () => {
        console.log("Successfully signed in to event");
        router.push("/attendee/manage");
      },
      onError: (err) => {
        console.error("Failed to sign in to event", err);
      },
    });

    // Close the panel after submission
    setIsPanelOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Discover Events</h2>

        {/* Search bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
            placeholder="Search events by name, location, or host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Events list */}
        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.event_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-5">
                  <h3 className="text-xl font-semibold mb-2">
                    {event.event_name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    Hosted by {event.host_name}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <CalendarIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <UserIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span>{event.attendees?.length || 0} attendees</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAttendEvent(event)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all"
                  >
                    Attend Event
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                No events found matching your search.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Slide-in Attendance Panel */}
      {selectedEvent && (
        <AttendEventPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          eventName={selectedEvent.event_name}
          onSubmit={handleSubmitAttendance}
        />
      )}
    </div>
  );
}
