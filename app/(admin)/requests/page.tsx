"use client";
import React from "react";


export default function RequestsPage() {
  const tabs = [
    { label: "Pending", count: 3, active: true },
    { label: "Approved", count: 2, active: false },
    { label: "Rejected", count: 1, active: false },
  ];

  const requests = [
    {
      id: 1,
      name: "Sarah Johnson",
      type: "Annual Leave",
      status: "Pending",
      period: "2026-03-20 to 2026-03-22",
      duration: "3 days",
      submitted: "2026-03-10",
      reason: "Family vacation - visiting relatives in another state",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      icon: "calendar",
    },
    {
      id: 2,
      name: "Michael Chen",
      type: "Remote Work",
      status: "Pending",
      period: "2026-03-15",
      duration: "1 day",
      submitted: "2026-03-12",
      reason: "Work from home - personal appointment in the morning",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      icon: "briefcase",
    },
    {
      id: 3,
      name: "James Wilson",
      type: "Remote Work",
      status: "Pending",
      period: "2026-03-18",
      duration: "1 day",
      submitted: "2026-03-12",
      reason: "Home renovation - need to supervise contractors",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      icon: "briefcase",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`h-10 rounded-xl border px-5 text-sm font-medium transition ${
              tab.active
                ? "border-[#d89400] bg-[#d89400] text-white shadow-none"
                : "border-[#d7dbe1] bg-[#f7f7f8] text-[#374151]"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {requests.map((request, index) => (
          <RequestCard key={request.id} request={request} singleColumn={index === 2} />
        ))}
      </div>
    </div>
  );
}

type Request = {
  id: number;
  name: string;
  type: string;
  status: string;
  period: string;
  duration: string;
  submitted: string;
  reason: string;
  iconBg: string;
  iconColor: string;
  icon: "calendar" | "briefcase";
};

function RequestCard({
  request,
  singleColumn,
}: {
  request: Request;
  singleColumn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#dbdee4] bg-white p-5 shadow-none ${
        singleColumn ? "xl:col-span-1" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${request.iconBg}`}
          >
            {request.icon === "calendar" ? (
              <CalendarIcon className={`h-5 w-5 ${request.iconColor}`} />
            ) : (
              <BriefcaseIcon className={`h-5 w-5 ${request.iconColor}`} />
            )}
          </div>

          <div className="leading-tight">
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#111827] sm:text-[25px]">
              {request.name}
            </h2>
            <p className="mt-1 text-[15px] text-[#6b7280]">{request.type}</p>
          </div>
        </div>

        <div className="rounded-full border border-[#efd770] bg-[#f8e8a6] px-4 py-1 text-sm font-medium text-[#b77900]">
          {request.status}
        </div>
      </div>

      <div className="mt-6 space-y-0 text-[15px] text-[#374151]">
        <InfoRow label="Period" value={request.period} />
        <InfoRow label="Duration" value={request.duration} />
        <InfoRow label="Submitted" value={request.submitted} noBorder />
      </div>

      <div className="mt-4 rounded-2xl bg-[#f1f2f4] px-4 py-4">
        <p className="text-[15px] text-[#374151]">Reason:</p>
        <p className="mt-3 text-[15px] text-[#111827]">{request.reason}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className="btn h-[46px] min-h-[46px] rounded-2xl border-0 bg-[#08ad33] text-base font-medium text-white shadow-none hover:bg-[#07952c]">
          <span className="mr-2 text-lg leading-none">✓</span>
          Approve
        </button>
        <button className="btn h-[46px] min-h-[46px] rounded-2xl border-0 bg-[#ff0000] text-base font-medium text-white shadow-none hover:bg-[#e10000]">
          <span className="mr-2 text-lg leading-none">×</span>
          Reject
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  noBorder = false,
}: {
  label: string;
  value: string;
  noBorder?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-4 ${
        noBorder ? "" : "border-b border-[#e1e4e8]"
      }`}
    >
      <span className="text-[15px] text-[#4b5563]">{label}</span>
      <span className="text-right text-[15px] text-[#111827]">{value}</span>
    </div>
  );
}

function CalendarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function BriefcaseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M3 12h18" />
    </svg>
  );
}
