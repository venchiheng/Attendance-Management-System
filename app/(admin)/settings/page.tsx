"use client";
import { useEffect, useState, useCallback } from "react";
import NotificationContainer from "@/app/components/notification/NotificationContainer";
import HolidayContainer from "@/app/components/holiday/HolidayContainer";
type Props = {};

export default function Page({}: Props) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profiles");
      if (res.ok) {
        const data = await res.json();
        // Ensure we handle array or object responses
        const profileData = Array.isArray(data) ? data[0] : data;
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div>
      <NotificationContainer 
        telegramChatId={profile?.telegram_chat_id} 
      />
      {/* <ShiftContainer/> */}
      <HolidayContainer/>
    </div>
  );
}
