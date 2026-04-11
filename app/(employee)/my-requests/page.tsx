"use client";

import AttendanceSummary from "@/app/components/AttendanceSummary";
import SearchBar from "@/app/components/SearchBar";
import Selector from "@/app/components/Selector";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import EmployeeRequestCard from "@/app/components/EmployeeRequestCard";

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
    <div>
      <div className="flex flex-row gap-6">
        <AttendanceSummary
          title="Total Requests"
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
        <AttendanceSummary
          title="Cancelled"
          value={stats.cancelled}
          colorClass="border-gray-200 text-gray-600"
        />
      </div>

      <div className="bg-white w-full mt-6 rounded-t-2xl shadow-sm border border-gray-100">
        <div className="flex flex-row gap-4 p-6">
          <SearchBar 
            placeholder="Search requests..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
          ></Selector>
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
          ></Selector>
          <button 
            className="btn w-fit bg-[#1A77F2] text-white hover:bg-[#1A77F2]/90" 
            onClick={() => router.push("/submit-request")}
          >
            + New Request
          </button>
        </div>

        <div className="flex flex-col gap-4 pb-6">
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
            <div className="text-center py-10 text-gray-400">No requests found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
