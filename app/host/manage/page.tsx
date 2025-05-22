"use client";

import { motion } from "framer-motion";
import {
  CalendarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";
import {
  PaginatedObjectsResponse,
  SuiObjectResponse,
} from "@mysten/sui/client";
import { PACKAGE_NAME } from "@/utils/constants";
import { PACKAGE_ID } from "@/utils/constants";
import { Event } from "@/types/type";
export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsObj, setEventsObj] = useState<SuiObjectResponse[]>();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  useEffect(() => {
    if (!currentAccount) return;

    const getEvents = async () => {
      console.log("Owner address:", currentAccount.publicKey);

      // Get owned objects
      const { data }: PaginatedObjectsResponse =
        await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          cursor: null,
          limit: 50,
          options: { showContent: true },
        });

      if (!data) return;

      // Get the events object
      const eventsObj = data.filter((obj) => {
        return (
          // @ts-expect-error Type "type" is actually defined but not correctly set up in the library
          obj.data?.content?.type === `${PACKAGE_ID}::${PACKAGE_NAME}::Events`
        );
      })[0]?.data;

      if (!eventsObj) return;

      // Get all the events using the event ids
      // @ts-expect-error Fields are present in the content but not properly typed
      const eventIds = eventsObj.content?.fields?.events?.fields?.contents || [];
      console.log("Published events: ", eventIds);
      
      if (eventIds.length === 0) return;

      const fetchPromises = eventIds.map((eventId: string) => 
        suiClient.getObject({
          id: eventId,
          options: { showContent: true },
        })
      );

      const eventsObjRes = await Promise.all(fetchPromises);
      setEventsObj(eventsObjRes);
    };
    getEvents();
  }, [currentAccount, suiClient]);

  useEffect(() => {
    if (!eventsObj) return;

    const parseEvents = () => {
      const parsedEvents: Event[] = [];
      eventsObj.forEach((event) => {
        // @ts-expect-error Fields are present in the content but not properly typed
        const eventFields = event.data?.content?.fields;
        if (!eventFields) return;
        
        const { date, description, host_address, host_name, location, name } = eventFields;
        const myEvent: Event = {
          date,
          description,
          host_address,
          host_name,
          location,
          event_name: name,
        };
        parsedEvents.push(myEvent);
      });
      console.log("Parsed events: ", parsedEvents);
      setEvents(parsedEvents);
    };
    parseEvents();
  }, [eventsObj]);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Manage Your Events</h2>

        <div className="space-y-4">
          {events &&
            events.map((event, index) => (
              <motion.div
                key={event.event_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold mb-2">
                      {event.event_name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span>
                          {event.date}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <MapPinIcon className="h-5 w-5 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {events && events.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">
              You haven&apos;t created any events yet.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
