"use client";

import AttendanceSummary from "@/app/components/AttendanceSummary";
import SearchBar from "@/app/components/SearchBar";
import Selector from "@/app/components/Selector";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import EmployeeRequestCard from "@/app/components/EmployeeRequestCard";
import { createClient } from "@/app/lib/supabase/client";

type RequestData = {
  title: string;
  id: string;
  type: string;
  status: "Pending" | "Approved" | "Rejected" | "Cancelled";
  reason: string;
  start_date: string;
  end_date: string;
  reviewBy: string;
  reviewAt: string;
  note: string;
  submitAt: string;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const router = useRouter();
  const supabase = createClient();

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // 2. Real-time for Requests
    const channel = supabase
      .channel("my-requests-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "employee_requests" },
        () => fetchRequests()
      )
      .subscribe((status) => {
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          supabase.realtime.connect();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        (req.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (req.reason?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || req.type === filterType;
      const matchesStatus = filterStatus === "all" || (req.status?.toLowerCase() || "") === filterStatus.toLowerCase();
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [requests, searchQuery, filterType, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      rejected: requests.filter(r => r.status === 'Rejected').length,
      cancelled: requests.filter(r => r.status === 'Cancelled').length,
    };
  }, [requests]);

  return (
    <div className="p-4 md:p-0">
      {/* SUMMARY STATS: Grid 2 cols on mobile, 5 cols on desktop */}
      <div className="grid grid-cols-2 md:flex md:flex-row gap-3 md:gap-6">
        <AttendanceSummary
          title="Total"
          value={stats.total}
          colorClass="border-gray-200 text-blue-600"
        />
        <AttendanceSummary
          title="Pending"
          value={stats.pending}
          colorClass="border-gray-200 text-orange-600"
        />
        <AttendanceSummary
          title="Approved"
          value={stats.approved}
          colorClass="border-gray-200 text-green-600"
        />
        <AttendanceSummary
          title="Rejected"
          value={stats.rejected}
          colorClass="border-gray-200 text-red-600"
        />
        {/* On mobile, this will span full width to look better if 5 items */}
        <div className="col-span-2 md:contents">
          <AttendanceSummary
            title="Cancelled"
            value={stats.cancelled}
            colorClass="border-gray-200 text-gray-600"
          />
        </div>
      </div>

      <div className="bg-white w-full mt-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* FILTER BAR: Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4 p-4 md:p-6">
          <div className="lg:flex-1">
            <SearchBar 
              placeholder="Search requests..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-48">
            <Selector
              options={[
                { label: "Leave Request", value: "Leave" },
                { label: "Remote Work", value: "Remote" },
                { label: "Emergency", value: "Emergency" },
                { label: "General", value: "General" },
              ]}
              placeholder="All Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-48">
            <Selector
              options={[
                { label: "Pending", value: "pending" },
                { label: "Approved", value: "approved" },
                { label: "Rejected", value: "rejected" },
                { label: "Cancelled", value: "cancelled" },
              ]}
              placeholder="All Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </div>
          <button 
            className="btn w-full lg:w-fit bg-[#1A77F2] text-white hover:bg-[#1A77F2]/90 flex items-center justify-center gap-2" 
            onClick={() => router.push("/submit-request")}
          >
            <span className="text-xl">+</span> New Request
          </button>
        </div>

        {/* LIST SECTION */}
        <div className="flex flex-col">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <EmployeeRequestCard 
                key={req.id} 
                {...req} 
                onStatusUpdate={fetchRequests}
              />
            ))
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="font-medium">No requests found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}