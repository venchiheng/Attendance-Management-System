"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isErrorMessage =
    message.includes("wrong") ||
    message.includes("error") ||
    message.includes("Error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setMessage("If that email exists, a reset link has been sent.");
    } catch {
      setMessage("Something went wrong.");
    }

    setLoading(false);
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
          Forgot your password?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we’ll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all ${
                isErrorMessage
                  ? "border-red-500 focus:outline-red-500 bg-red-50"
                  : "border-gray-300 focus:outline-blue-500"
              }`}
            />
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
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 border-none text-white w-full mt-4 normal-case rounded-xl text-md gap-2"
          >
            {!loading && (
              <Icon icon="mdi:email-fast-outline" className="w-5 h-5" />
            )}
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>

      <footer className="mt-8 text-white text-xs opacity-70">
        © 2026 neWwave. All rights reserved.
      </footer>
    </div>
  );
}
