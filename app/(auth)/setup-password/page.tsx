"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function SetupPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true); // Loading state for the link
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
  let isMounted = true; // Prevents double-processing in Strict Mode

  const checkSession = async () => {
    // Check if session already exists
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    if (existingSession) {
      if (isMounted) setIsVerifying(false);
      return;
    }

    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken && refreshToken && isMounted) {
        // Use setSession but catch the error specifically
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (setSessionError) {
          console.error("403 or Session Error:", setSessionError.message);
          // If it's already logged in, we can ignore the error
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
             setError("Invitation link expired or already used.");
          }
        }
      }
    }
    
    if (isMounted) setIsVerifying(false);
  };

  checkSession();

  return () => { isMounted = false; }; // Cleanup
}, [supabase]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    // This updates the user that was automatically "signed in" by clicking the email link
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else {
      // Success! Move to dashboard
      router.push("/my-dashboard?message=Account set up successfully");
    }
  };

  // 1. Show a loading spinner while checking the session
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="loading loading-spinner loading-lg text-[#1A77F2]"></span>
        <p className="ml-3 text-gray-600">Verifying invitation...</p>
      </div>
    );
  }

  // 2. If no session is found after loading, show a clear error
  if (error && !loading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center">
          <h1 className="text-xl font-bold text-red-600">Session Missing</h1>
          <p className="text-gray-500 mt-2">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="btn btn-ghost mt-4 text-[#1A77F2]"
          >
            Back to Login
          </button>
        </div>
      </div>
     );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A77F2]">Welcome to neWwave</h1>
          <p className="text-gray-500 text-sm mt-2">Please set a password for your new account.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full mt-1 focus:border-[#1A77F2] pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                <Icon
                  icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input input-bordered w-full mt-1 focus:border-[#1A77F2] pr-12"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  className="w-5 h-5"
                />
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
               <p className="text-red-500 text-xs text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn bg-[#1A77F2] hover:bg-blue-700 text-white w-full border-none mt-4 transition-all"
          >
            {loading ? <span className="loading loading-spinner"></span> : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}