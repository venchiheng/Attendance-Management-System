"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { createClient } from "@/app/lib/supabase/client";

export default function UpdatePasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isErrorMessage =
    message.includes("Invalid") ||
    message.includes("expired") ||
    message.includes("not found") ||
    message.includes("Could not") ||
    message.includes("missing") ||
    message.includes("not ready") ||
    message.includes("do not match") ||
    message.includes("error") ||
    message.includes("Error");

  useEffect(() => {
    const restoreRecoverySession = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.slice(1)
          : window.location.hash;

        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        const type = params.get("type");

        if (type !== "recovery") {
          setMessage("Invalid or expired recovery link.");
          return;
        }

        if (!access_token || !refresh_token) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setSessionReady(true);
            return;
          }

          setMessage(
            "Recovery session not found. Please open the newest reset link again."
          );
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        setSessionReady(true);
      } catch {
        setMessage("Could not restore recovery session.");
      }
    };

    restoreRecoverySession();
  }, [supabase]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!sessionReady) {
      setMessage("Recovery session is not ready yet.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");

    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-r from-[#1a3088] to-[#091a52] text-white font-sans p-4">
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        {loading && (
          <progress className="progress progress-primary w-full h-1 rounded-none"></progress>
        )}
      </div>

      <div className="flex flex-col items-center mb-8 text-center">
        <img
          src="/newwave_logo_white.png"
          alt="logo"
          className="sm:h-20 md:h-24 lg:h-36 xl:h-42 w-auto object-contain"
        />{" "}
        <p className="text-white text-lg mt-1">Attendance Management System</p>
      </div>

      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Update your password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your new password to regain access to your account.
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">
              New Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={!sessionReady || loading}
                className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all pr-12 ${
                  isErrorMessage
                    ? "border-red-500 focus:outline-red-500 bg-red-50"
                    : "border-gray-300 focus:outline-blue-500"
                } ${
                  !sessionReady || loading
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!sessionReady || loading}
              >
                <Icon
                  icon={
                    showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">
              Confirm Password
            </span>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={!sessionReady || loading}
                className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all pr-12 ${
                  isErrorMessage
                    ? "border-red-500 focus:outline-red-500 bg-red-50"
                    : "border-gray-300 focus:outline-blue-500"
                } ${
                  !sessionReady || loading
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!sessionReady || loading}
              >
                <Icon
                  icon={
                    showConfirmPassword
                      ? "mdi:eye-off-outline"
                      : "mdi:eye-outline"
                  }
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`flex items-start gap-2 text-sm mt-1 p-3 rounded-xl animate-in fade-in slide-in-from-top-1 ${
                isErrorMessage
                  ? "text-red-500 bg-red-50"
                  : "text-green-600 bg-green-50"
              }`}
            >
              <Icon
                icon={
                  isErrorMessage
                    ? "material-symbols:error-outline"
                    : "solar:check-circle-bold"
                }
                className="w-5 h-5 mt-0.5 shrink-0"
              />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!sessionReady || loading}
            className="btn bg-blue-600 hover:bg-blue-700 border-none text-white w-full mt-4 normal-case rounded-xl text-md gap-2 disabled:bg-blue-400"
          >
            {!loading && sessionReady && (
              <Icon icon="mdi:lock-reset" className="w-5 h-5" />
            )}
            {loading
              ? "Updating..."
              : sessionReady
              ? "Update password"
              : "Preparing reset session..."}
          </button>
        </form>
      </div>

      <footer className="mt-8 text-white text-xs opacity-70">
        © 2026 neWwave. All rights reserved.
      </footer>
    </div>
  );
}
