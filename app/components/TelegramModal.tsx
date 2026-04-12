import { useState } from "react";
import { Icon } from "@iconify/react";

type Props = {
  currentChatId?: string;
  onSave: (id: string) => void;
};

export default function TelegramConnectModal({ currentChatId, onSave }: Props) {
  const [chatId, setChatId] = useState(currentChatId || "");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
    type: null,
    message: ""
  });

  const handleUpdate = async () => {
    const cleanedChatId = chatId.trim();
    if (!cleanedChatId) return;

    setIsSaving(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegram_chat_id: cleanedChatId,
        }),
      });

      if (res.ok) {
        setStatus({ type: 'success', message: "Successfully connected!" });
        // Delay onSave slightly so user can see the success message
        setTimeout(() => {
          onSave(cleanedChatId);
        }, 1500);
      } else {
        const errData = await res.json();
        setStatus({ 
          type: 'error', 
          message: errData.error || "Failed to update profile." 
        });
      }
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: "Connection error. Please check your internet." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card w-full bg-base-100 shadow-xl border border-blue-100 overflow-hidden font-['Poppins']">
      <div className="card-body p-6">
        <h2 className="card-title text-[#1A77F2] flex items-center gap-2 mb-1">
          <Icon icon="logos:telegram" className="text-2xl" />
          Telegram Alerts
        </h2>

        <p className="text-[13px] text-gray-500 leading-relaxed">
          Connect your account to receive real-time notifications.
        </p>

        {/* Setup Guide */}
        <div className="bg-blue-50/40 p-4 rounded-2xl my-4 text-[13px] border border-blue-50">
          <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Icon icon="solar:info-circle-bold" className="text-blue-500 text-lg" />
            Quick Setup Guide:
          </p>
          <ul className="space-y-3">
            <li className="flex gap-3 items-start">
              <span className="flex-none flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold mt-0.5">1</span>
              <span>
                Message our bot{" "}
                <a 
                  href="https://t.me/newwave_attendance_bot" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-blue-600 font-semibold hover:underline"
                >
                  @newwave_attendance_bot
                </a>{" "}
                and click <b>/start</b>. (Required to receive messages)
              </span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-none flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold mt-0.5">2</span>
              <span>Get your ID from the bot or use <a href="https://t.me/userinfobot" target="_blank" className="underline">@userinfobot</a>.</span>
            </li>
          </ul>
        </div>

        {/* Status Alert */}
        {status.type && (
          <div className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            <Icon icon={status.type === 'success' ? "solar:check-circle-bold" : "solar:danger-triangle-bold"} className="text-lg" />
            {status.message}
          </div>
        )}

        <div className="form-control mb-2">
          <label className="label pt-0">
            <span className="label-text text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Your Telegram Chat ID
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 12345678"
              className="input input-bordered w-full focus:border-blue-500 focus:outline-none pl-10 h-11 text-sm bg-gray-50/50"
              value={chatId}
              onChange={(e) => {
                setChatId(e.target.value);
                if (status.type) setStatus({ type: null, message: "" }); // Clear status on type
              }}
            />
            <Icon
              icon="solar:hashtag-square-linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
            />
          </div>
        </div>

        <div className="card-actions mt-4">
          <button
            onClick={handleUpdate}
            className="btn bg-[#1A77F2] hover:bg-blue-600 text-white border-none rounded-xl w-full h-11"
            disabled={isSaving || !chatId.trim() || status.type === 'success'}
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Connect My Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}