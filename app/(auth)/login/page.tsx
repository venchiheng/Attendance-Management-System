"use client";
import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Icon } from "@iconify/react";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for validation error  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Handle specific invalid credentials error
      setError(
        authError.message === "Invalid login credentials"
          ? "Invalid email or password. Please try again."
          : authError.message
      );
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-r from-[#1a3088] to-[#091a52] text-white font-sans p-4">
      {/* 1. TOP LOADING BAR (Visible only when loading) */}
      <div className="fixed top-0 left-0 w-full h-1 z-50">
        {loading && (
          <progress className="progress progress-primary w-full h-1 rounded-none"></progress>
        )}
      </div>

      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-white p-3 rounded-2xl mb-4 shadow-lg">
          <Icon icon={"line-md:security"} className="text-blue-700 w-10 h-10"></Icon>
        </div>
        <h1 className="text-3xl font-bold">neWwave Admin</h1>
        <p className="text-gray-300 opacity-80 mt-1">Dashboard Login</p>
      </div>

      <div className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Access</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">
              Admin Email
            </span>
            <input
              type="email"
              placeholder="Enter your email"
              // 2. ERROR STYLING: Add red border if error exists
              className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all ${
                error
                  ? "border-red-500 focus:outline-red-500 bg-red-50"
                  : "border-gray-300 focus:outline-blue-500"
              }`}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {role === "admin" && (
            <div>
              <div className="form-control flex flex-col gap-2">
                <span className="font-semibold text-sm text-gray-600">
                  Create Password
                </span>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all ${
                    error
                      ? "border-red-500 focus:outline-red-500 bg-red-50"
                      : "border-gray-300 focus:outline-blue-500"
                  }`}
              />
            </div>

            <div className="form-control flex flex-col gap-2">
              <span className="font-semibold text-sm text-gray-600">
                Password
              </span>
            <input
              type="password"
              placeholder="Enter your password"
              className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all ${
                error
                  ? "border-red-500 focus:outline-red-500 bg-red-50"
                  : "border-gray-300 focus:outline-blue-500"
              }`}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          </div>
        )}

          <div className="form-control flex flex-col gap-2">
            <span className="font-semibold text-sm text-gray-600">
              Password
            </span>
            <input
              type="password"
              placeholder="Enter your password"
              className={`input input-bordered w-full rounded-xl bg-white text-gray-800 transition-all ${
                error
                  ? "border-red-500 focus:outline-red-500 bg-red-50"
                  : "border-gray-300 focus:outline-blue-500"
              }`}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* 3. VALIDATION ERROR BOX (Matches your image example) */}
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

      <footer className="mt-8 text-gray-400 text-xs opacity-70">
        © 2026 newwave. All rights reserved.
      </footer>
    </div>
  );
}
