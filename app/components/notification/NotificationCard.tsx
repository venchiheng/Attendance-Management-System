"use client";
import React, { useState, useEffect } from "react";
import TelegramConnectModal from "../TelegramModal";
import { useRouter } from "next/navigation"; // Add this import

type Props = {
  title: string;
  description: string;
  initialChatId?: string;
};

const NotificationCard = ({ title, description, initialChatId }: Props) => {
  const router = useRouter();

  // 1. Keep a local state for the chat ID so we don't rely solely on the prop
  const [currentId, setCurrentId] = useState(initialChatId);
  const [isChecked, setIsChecked] = useState(!!initialChatId);
  const [showModal, setShowModal] = useState(false);

  // Sync state if the prop changes from the parent
  useEffect(() => {
    // Only sync if the parent actually provides a defined value (null or string)
    if (initialChatId !== undefined) {
      setIsChecked(!!initialChatId);
      setCurrentId(initialChatId);
    }
  }, [initialChatId]);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setIsChecked(true); // Optimistic UI update
      setShowModal(true);
    } else {
      const proceed = confirm("Disconnect Telegram notifications?");
      if (proceed) {
        handleDisconnect();
      } else {
        setIsChecked(true); // Revert if they cancel
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_chat_id: null }),
      });
      if (res.ok) {
        setIsChecked(false);
        setCurrentId(undefined);
      }
    } catch (err) {
      alert("Failed to disconnect");
      setIsChecked(true);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    // Only uncheck if we don't actually have a saved ID
    if (!currentId) {
      setIsChecked(false);
    }
  };

  const handleSaveSuccess = (newId: string) => {
    setShowModal(false);
    setIsChecked(true);
    setCurrentId(newId);

    // This tells Next.js to fetch the data from the server again
    // without a full "hard" page reload
    router.refresh();
  };

  return (
    <div className="w-full font-['Poppins']">
      <div className="flex flex-row p-4 bg-white border border-gray-100 rounded-xl justify-between w-full items-center shadow-sm">
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-gray-500 text-[11px]">{description}</p>
          {currentId && (
            <p className="text-[9px] text-blue-500 font-mono">
              ID: {currentId}
            </p>
          )}
        </div>

        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="toggle bg-white checked:bg-blue-500 checked:text-white"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="max-w-md w-full">
            <TelegramConnectModal
              currentChatId={currentId}
              onSave={(val) => handleSaveSuccess(val)} // Pass the value back
            />
            <button
              className="btn btn-sm btn-ghost w-full mt-3 text-white/80"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
