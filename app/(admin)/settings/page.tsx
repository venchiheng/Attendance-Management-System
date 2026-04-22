"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import NotificationContainer from "@/app/components/notification/NotificationContainer";
import HolidayContainer from "@/app/components/holiday/HolidayContainer";
import SettingCard from "@/app/components/SettingCard";
import { updatePassword } from "@/app/lib/actions/auth";

type Props = {};

export default function Page({}: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  const handlePasswordChange = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setIsSaving(true);

    const formData = new FormData();
    formData.append("password", newPassword);

    const result = await updatePassword(formData);

    if (result?.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsSaving(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading settings...</div>;

  return (
    <div className="flex flex-col gap-6">
      <NotificationContainer 
        telegramChatId={profile?.telegram_chat_id} 
      />

      <SettingCard
        icon="solar:lock-password-linear"
        title="Security Settings"
        description="Manage your account security and password"
        headerColor="bg-blue-50"
        iconBgColor="bg-blue-600"
      >
        <div className="flex flex-col gap-6 max-w-2xl">
          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-100">
              <Icon icon="solar:danger-triangle-bold" className="text-lg" />
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-green-50 text-green-700 text-sm flex items-center gap-2 border border-green-100">
              <Icon icon="solar:check-circle-bold" className="text-lg" />
              {passwordSuccess}
            </div>
          )}

          <div className="form-control">
            <label className="label pt-0">
              <span className="label-text text-xs font-bold text-gray-400 uppercase">
                Old Password
              </span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:outline-blue-500 pr-12"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                <Icon
                  icon={showOldPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label pt-0">
                <span className="label-text text-xs font-bold text-gray-400 uppercase">
                  New Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:outline-blue-500 pr-12"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  <Icon
                    icon={showNewPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
            <div className="form-control">
              <label className="label pt-0">
                <span className="label-text text-xs font-bold text-gray-400 uppercase">
                  Confirm Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input input-bordered w-full rounded-xl bg-gray-50 border-gray-200 focus:outline-blue-500 pr-12"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon
                    icon={
                      showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"
                    }
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-2">
            <button
              type="button"
              className="text-blue-600 text-sm font-semibold hover:underline"
              onClick={() => router.push("/forgot-password")}
            >
              Forgot password?
            </button>

            <button
              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl px-8"
              onClick={handlePasswordChange}
              disabled={isSaving || !newPassword}
            >
              {isSaving ? <span className="loading loading-spinner loading-sm"></span> : "Update Password"}
            </button>
          </div>
        </div>
      </SettingCard>

      {/* <ShiftContainer/> */}
      <HolidayContainer/>
    </div>
  );
}
