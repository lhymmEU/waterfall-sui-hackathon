"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { PACKAGE_NAME } from "@/utils/constants";
import { PACKAGE_ID } from "@/utils/constants";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useSuiClient } from "@mysten/dapp-kit";
import { PaginatedObjectsResponse } from "@mysten/sui/client";
import { Attendee } from "@/types/type";

export default function MyEventsPage() {
  const [myNfts, setMyNfts] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  useEffect(() => {
    if (!currentAccount) return;

    const getMyNfts = async () => {
      setIsLoading(true);
      try {
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

        const nftObjs = data.filter((obj) => {
          return (
            // @ts-expect-error Type "type" is actually defined but not correctly set up in the library
            obj.data?.content?.type === `${PACKAGE_ID}::${PACKAGE_NAME}::Attendance`
          );
        });

        // Extract the attendee nft data
        const nfts = nftObjs.map((obj) => {
          // @ts-expect-error Fields are present in the content but not properly typed
          const fields = obj.data?.content?.fields || {};
          return {
            id: obj.data?.objectId,
            event_id: fields.event_id,
            event_name: fields.event_name,
            name: fields.name,
            description: fields.description,
            x_handle: fields.x_handle,
            tg_handle: fields.tg_handle,
            // An array of friends nft addresses
            friends: fields.friends.fields.contents,
          } as Attendee;
        });

        console.log("My NFTs: ", nfts);
        setMyNfts(nfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getMyNfts();
  }, [currentAccount, suiClient]);

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">My Attendance NFTs</h2>

        {/* NFTs list */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {myNfts.length > 0 ? (
              myNfts.map((nft, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold">
                        {nft.event_name}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 rounded-full text-sm flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        Attended
                      </span>
                    </div>
                    
                    <div className="mt-3 border-t pt-3 border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium mb-2">Your Info</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                          <span>Name: {nft.name || "Not provided"}</span>
                        </div>
                        {nft.description && (
                          <div className="flex items-start text-gray-600 dark:text-gray-300">
                            <MagnifyingGlassIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Description: {nft.description}</span>
                          </div>
                        )}
                        {nft.x_handle && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <span className="font-bold text-lg mr-2">𝕏</span>
                            <span>{nft.x_handle}</span>
                          </div>
                        )}
                        {nft.tg_handle && (
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <span className="text-blue-500 font-bold mr-2">TG</span>
                            <span>{nft.tg_handle}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {nft.friends && nft.friends.length > 0 && (
                      <div className="mt-3 border-t pt-3 border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium mb-2">Friends</h4>
                        <div className="space-y-2">
                          {nft.friends.map((friendAddress, idx) => (
                            <div key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                              <span className="mr-2">•</span>
                              <span className="font-mono">
                                {friendAddress.substring(0, 6)}...{friendAddress.substring(friendAddress.length - 4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">
                  You haven&apos;t attended any events yet.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
