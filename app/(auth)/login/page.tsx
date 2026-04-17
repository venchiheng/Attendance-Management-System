"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { login as loginAction } from "@/app/lib/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result?.success) {
        if (result.role === "admin") {
          router.push("/dashboard");
        } else {
          router.push("/my-dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
    router.refresh();
  };

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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Log into your account
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">Email</span>
            <input
              type="email"
              placeholder="Enter your email"
              className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all ${
                error
                  ? "border-red-500 focus:outline-red-500 bg-red-50"
                  : "border-gray-300 focus:outline-blue-500"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all pr-12 ${
                  error
                    ? "border-red-500 focus:outline-red-500 bg-red-50"
                    : "border-gray-300 focus:outline-blue-500"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
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

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-1 animate-in fade-in slide-in-from-top-1">
              <Icon icon="material-symbols:error-outline" className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn bg-blue-600 hover:bg-blue-700 border-none text-white w-full mt-4 normal-case rounded-xl text-md gap-2"
            disabled={loading}
          >
            {!loading && <Icon icon="line-md:log-in" className="w-5 h-5" />}
            {loading ? "Processing..." : "Access Dashboard"}
          </button>
        </form>
      </div>

      <footer className="mt-8 text-white text-xs opacity-70">
        © 2026 neWwave. All rights reserved.
      </footer>
    </div>
  );
}
