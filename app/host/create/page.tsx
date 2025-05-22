"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Event } from "@/types/type";
import { useRouter } from "next/navigation";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { PACKAGE_ID, PACKAGE_NAME } from "@/utils/constants";
import { PaginatedObjectsResponse, SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

export default function CreateEventPage() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [adminCap, setAdminCap] = useState<SuiObjectData>();
  const [eventsObject, setEventsObject] = useState<SuiObjectData>();
  const { mutate: execCreateEvent } = useSignAndExecuteTransaction();

  const router = useRouter();
  const [formData, setFormData] = useState<Event>({
    event_name: "",
    host_name: "",
    host_address: "",
    date: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    if (!currentAccount) return;

    const getAdminCap = async () => {
      console.log("Owner address:", currentAccount.publicKey);
      const { data }: PaginatedObjectsResponse =
        await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          cursor: null,
          limit: 50,
          options: { showContent: true },
        });

      if (!data) return;

      const adminCap = data.filter((obj) => {
        return (
          // @ts-expect-error Type "type" is actually defined but not correctly set up in the library
          obj.data?.content?.type === `${PACKAGE_ID}::${PACKAGE_NAME}::AdminCap`
        );
      })[0].data;

      const events = data.filter((obj) => {
        return (
          // @ts-expect-error Type "type" is actually defined but not correctly set up in the library
          obj.data?.content?.type === `${PACKAGE_ID}::${PACKAGE_NAME}::Events`
        );
      })[0].data;

      if (!adminCap || !events) return;

      setAdminCap(adminCap);
      setEventsObject(events);
    };

    getAdminCap();
  }, [currentAccount, suiClient]);

  const callCreateEvent = () => {
    if (!adminCap || !eventsObject) return;

    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::${PACKAGE_NAME}::create_event`,
      typeArguments: [],
      arguments: [
        tx.object(adminCap?.objectId),
        tx.object(eventsObject?.objectId),
        tx.pure.string(formData.event_name),
        tx.pure.string(formData.date),
        tx.pure.string(formData.location),
        tx.pure.string(formData.description),
        tx.pure.string(formData.host_name),
      ],
    });

    execCreateEvent(
      {
        transaction: tx,
      },
      {
        onError: (err) => {
          alert(`Failed to create event, please try again. ${err}`);
        },
        onSuccess: () => {
          console.log("Success: Create event successful!");
          setFormData({
            event_name: "",
            host_name: "",
            host_address: "",
            date: "",
            location: "",
            description: "",
          });

          router.push("/host/manage");
        },
      }
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call the create event function

    callCreateEvent();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="event_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Event Name
              </label>
              <input
                type="text"
                id="event_name"
                name="event_name"
                value={formData.event_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="Annual Tech Conference"
              />
            </div>
            <div>
              <label
                htmlFor="host_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Host Name
              </label>
              <input
                type="text"
                id="host_name"
                name="host_name"
                value={formData.host_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              placeholder="Virtual or physical location"
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
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
              placeholder="Describe your event..."
            ></textarea>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all"
          >
            Create Event
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
