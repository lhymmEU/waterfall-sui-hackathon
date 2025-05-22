"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ConciseEvent } from "@/types/type";
import {
  PaginatedObjectsResponse,
  SuiObjectResponse,
} from "@mysten/sui/client";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";
import { PACKAGE_NAME } from "@/utils/constants";
import { PACKAGE_ID } from "@/utils/constants";
import { Transaction } from "@mysten/sui/transactions";
import { useRouter } from "next/navigation";

export default function AddFriends() {
  const [myEvents, setMyEvents] = useState<ConciseEvent[]>([]);
  const [eventNftMap, setEventNftMap] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [addingFriend, setAddingFriend] = useState<string | null>(null);
  const { mutate: execAddFriend } = useSignAndExecuteTransaction();
  const router = useRouter();
  
  useEffect(() => {
    if (!currentAccount) return;

    const getMyEvents = async () => {
      setIsLoading(true);
      // Get owned nft objects
      const { data }: PaginatedObjectsResponse =
        await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          cursor: null,
          limit: 50,
          options: { showContent: true },
        });

      if (!data) {
        setIsLoading(false);
        return;
      }

      // Extract the attendee nft data
      const nftObjs = data.filter((obj) => {
        return (
          // @ts-expect-error Type "type" is actually defined but not correctly set up in the library
          obj.data?.content?.type ===
          `${PACKAGE_ID}::${PACKAGE_NAME}::Attendance`
        );
      });

      // Extract the event id and nft id
      const eventNftMap: { [key: string]: string } = {};
      const eventIds = nftObjs.map((obj) => {
        // @ts-expect-error Fields are present in the content but not properly typed
        const fields = obj.data?.content?.fields || {};
        const nft_id = fields.id;
        eventNftMap[fields.event_id] = nft_id.id;
        return fields.event_id;
      });
      console.log("Event IDs: ", eventIds);
      setEventNftMap(eventNftMap);
      console.log("Event NFT Map: ", eventNftMap);

      // Get the actual event object data
      const eventObjs: SuiObjectResponse[] = [];
      const eventPromises = eventIds.map(async (id) => {
        const eventData = await suiClient.getObject({
          id: id,
          options: { showContent: true },
        });
        eventObjs.push(eventData);
      });

      await Promise.all(eventPromises);

      // Parse the event data
      if (!eventObjs) return;

      const events: ConciseEvent[] = eventObjs.map((obj) => {
        // @ts-expect-error Fields are present in the content but not properly typed
        const fields = obj.data?.content?.fields || {};
        return {
          event_name: fields.event_name,
          host_name: fields.host_name,
          date: fields.date,
          location: fields.location,
          event_id: obj.data?.objectId,
          participants: fields.participants.fields.contents,
        } as ConciseEvent;
      });
      console.log("My Events: ", events);

      setMyEvents(events);
      setIsLoading(false);
    };
    getMyEvents();
  }, [currentAccount, suiClient]);

  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleEvent = (eventName: string) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventName]: !prev[eventName],
    }));
  };

  const handleAddFriend = async (address: string, eventId: string) => {
    if (!currentAccount) return;

    try {
      setAddingFriend(address);
      // Here you would implement the actual friend addition logic
      // using SUI SDK to call the appropriate contract function

      console.log(
        `Adding friend with address: ${address} from event: ${eventId}`
      );

      // Call add_friend contract function
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${PACKAGE_NAME}::add_friend`,
        typeArguments: [],
        arguments: [
          tx.object(eventId),
          tx.object(eventNftMap[eventId]),
          tx.pure.address(address),
        ],
      });
      execAddFriend(
        { transaction: tx },
        {
          onSuccess: () => {
            router.push("/attendee/manage");
          },
          onError: (err) => {
            alert(`Failed to add friend. Please try again. ${err}`);
          },
        }
      );
    } catch (error) {
      console.error("Error adding friend:", error);
      alert("Failed to add friend. Please try again.");
    } finally {
      setAddingFriend(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md shadow-sm hover:shadow-md transition-all whitespace-nowrap"
            >
              Scan to Add
            </motion.button>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">Event Attendees</h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : myEvents.length > 0 ? (
          <div className="space-y-4">
            {myEvents.map((event) => (
              <div
                key={event.event_name}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              >
                <motion.button
                  onClick={() => toggleEvent(event.event_name)}
                  className="w-full flex items-center justify-between p-5 text-left"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                >
                  <div>
                    <h3 className="text-lg font-medium">{event.event_name}</h3>
                    <p className="text-sm text-gray-500">
                      {event.date} • {event.location}
                    </p>
                  </div>
                  {expandedEvents[event.event_name] ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {expandedEvents[event.event_name] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-5">
                        <h4 className="font-medium mb-3">
                          Attendees ({event.participants?.length || 0})
                        </h4>
                        <div className="space-y-3">
                          {event.participants?.length ? (
                            event.participants.map(
                              (attendee: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                                      <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                    </div>
                                    <span className="text-sm font-medium truncate max-w-[150px]">
                                      {attendee}
                                    </span>
                                  </div>
                                  <motion.button
                                    onClick={() =>
                                      handleAddFriend(attendee, event.event_id)
                                    }
                                    disabled={addingFriend === attendee}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                                      addingFriend === attendee
                                        ? "bg-gray-400"
                                        : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:shadow-md"
                                    }`}
                                  >
                                    {addingFriend === attendee ? (
                                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-1"></div>
                                    ) : (
                                      <PlusIcon className="h-4 w-4 mr-1" />
                                    )}
                                    Add
                                  </motion.button>
                                </div>
                              )
                            )
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No attendees yet
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">
              You haven&apos;t joined any events yet.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
