"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SetupPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(true); // Loading state for the link
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      // 1. Try to get the session normally
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // 2. If no session is found, check if tokens are in the URL hash (Implicit Grant flow)
      if (!session && typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.substring(1); // remove '#'
        const params = new URLSearchParams(hash);
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!setSessionError) session = data.session;
        }
      }
      
      if (sessionError || !session) {
        setError("Your invitation link may be invalid or expired. Please check your email.");
      }
      
      setIsVerifying(false);
    };

    checkSession();
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
      router.push("/dashboard?message=Account set up successfully");
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
            <input
              type="password"
              className="input input-bordered w-full mt-1 focus:border-[#1A77F2]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase">Confirm Password</label>
            <input
              type="password"
              className="input input-bordered w-full mt-1 focus:border-[#1A77F2]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
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