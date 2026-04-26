"use client";
import RequestCard from "@/app/components/requests/RequestCard";
import { createClient } from "@/app/lib/supabase/client";
import { useEffect, useState } from "react";

// Define the RequestData type according to your API response structure
type RequestData = {
  id: string;
  name: string;
  status: string;
  type: string;
  period: string;
  duration?: string;
  submitAt: string;
  reason: string;
  note?: string;
  onStatusUpdate: () => void;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      if (!data.error) setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRequests();

    const channel = supabase
      .channel("requests-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employee_requests" },
        () => fetchRequests()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "All") return true;
    return req.status?.toLowerCase() === activeTab.toLowerCase();
  });

  const tabs = [
    { label: `All (${requests.length})`, value: "All" },
    {
      label: `Pending (${
        requests.filter((r) => r.status?.toLowerCase() === "pending").length
      })`,
      value: "Pending",
    },
    {
      label: `Approved (${
        requests.filter((r) => r.status?.toLowerCase() === "approved").length
      })`,
      value: "Approved",
    },
    {
      label: `Rejected (${
        requests.filter((r) => r.status?.toLowerCase() === "rejected").length
      })`,
      value: "Rejected",
    },
  ];

  if (!mounted) {
    return <div className="bg-base-200/30 min-h-screen" />;
  }
  return (
    <div className="bg-base-200/30 min-h-screen">
      {/* Filter Tabs */}
      <div className="tabs tabs-boxed mb-8 bg-transparent gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`tab px-6 ${
              activeTab === tab.value
                ? "tab-active bg-primary text-primary-content font-semibold"
                : "bg-base-100 shadow-sm border border-base-200 hover:bg-base-200"
            }`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Layout remains the same */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              {...req}
              type={req.type as any}
              status={req.status as any}
              onStatusUpdate={fetchRequests}
            />
          ))}
        </div>
      )}
    </div>
  );
}
