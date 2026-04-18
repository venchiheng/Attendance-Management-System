"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="rounded-full blur opacity-30 animate-pulse"></div>
        <img
          src="https://i.pinimg.com/originals/72/f5/2e/72f52efa08f7698fbb72d1239933d88b.gif"
          alt="Nuh uh uh uh uh uh"
          className="relative w-64 h-64 object-contain rounded-2xl"
        />
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4 text-pink-600">
          <h1 className="text-4xl font-bold tracking-tight">Oops!</h1>
        </div>

        <h2 className="text-xl font-medium text-slate-800 mb-2">
          You are not allowed here.
        </h2>

        <p className="text-slate-600 mb-8 leading-relaxed">
          We cannot find you in the system right now.{" "}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
          >
            Go Back
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-12 text-sm text-slate-400">
        Think this is a mistake? Contact your admin for extra help.
      </p>
    </div>
  );
}
