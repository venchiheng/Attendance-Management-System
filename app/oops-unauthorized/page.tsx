"use client"
import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="rounded-full blur opacity-30 animate-pulse"></div>
        <img
          src="https://i.pinimg.com/originals/11/2d/09/112d094061995bc8e6c454ad47473b28.gif"
          alt="Cute cat guarding door"
          className="relative w-64 h-64 object-contain rounded-2xl"
        />
      </div>

      {/* Text Content */}
      <div className="max-w-md">
        <div className="flex items-center justify-center gap-2 mb-4 text-pink-600">
          <h1 className="text-4xl font-bold tracking-tight">Oops!</h1>
        </div>

        <h2 className="text-xl font-medium text-slate-800 mb-2">
          This area is off-limits.
        </h2>

        <p className="text-slate-600 mb-8 leading-relaxed">
          It looks like you don't have the magic keys to enter this page.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/my-dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-200"
          >
            Go Home
          </Link>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-12 text-sm text-slate-400">
        Think this is a mistake? Contact your admin for extra permission.
      </p>
    </div>
  );
}
