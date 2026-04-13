"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

type Props = {
  title: string;
  id: string;
  type: string;
  status: string;
  reason: string;
  start_date: string;
  end_date: string;
  reviewBy: string;
  reviewAt: string;
  note: string;
  submitAt: string;
  onStatusUpdate?: () => void;
};

type RequestType = "Leave" | "Remote" | "Emergency" | "General";
type RequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

const EmployeeRequestCard = (props: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/requests/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        if (props.onStatusUpdate) props.onStatusUpdate();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to cancel request");
      }
    } catch (err) {
      console.error("Cancel Error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getTypeConfig = (type: string) => {
    const normalizedType = (type?.charAt(0).toUpperCase() +
      type?.slice(1).toLowerCase()) as RequestType;

    switch (normalizedType) {
      case "Emergency":
        return { bg: "bg-amber-50", color: "text-amber-500", icon: "mingcute:warning-line" };
      case "Leave":
        return { bg: "bg-red-50", color: "text-red-500", icon: "lucide:calendar" };
      case "General":
        return { bg: "bg-purple-50", color: "text-purple-500", icon: "mynaui:box-solid" };
      case "Remote":
        return { bg: "bg-blue-50", color: "text-blue-500", icon: "uil:suitcase" };
      default:
        return { bg: "bg-gray-50", color: "text-gray-500", icon: "lucide:help-circle" };
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status as RequestStatus;
    switch (s) {
      case "Pending": return "bg-orange-100 text-orange-600";
      case "Approved": return "bg-green-100 text-green-600";
      case "Rejected": return "bg-red-100 text-red-600";
      case "Cancelled": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  const typeConfig = getTypeConfig(props.type);

  return (
    /* Change 1: Flex col on mobile, Flex row on tablet/desktop */
    <div className="w-full p-5 md:p-7 flex flex-col md:flex-row items-start justify-between border-b-2 border-gray-100 gap-4">
      
      {/* Icon and Header Group */}
      <div className="flex flex-row items-start flex-1 w-full">
        <div className={`${typeConfig.bg} rounded-lg p-2 flex items-center justify-center shrink-0`}>
          <Icon icon={typeConfig.icon} className={`w-6 h-6 ${typeConfig.color}`} />
        </div>

        <div className="flex flex-col flex-1 ml-4 gap-1.5">
          <div className="flex flex-row justify-between items-center md:block">
            <h1 className="text-md font-semibold text-gray-800">{props.type} Request</h1>
            {/* Status badge visible only on mobile here (optional, but keeps UI clean) */}
            <span className={`md:hidden px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${getStatusConfig(props.status)}`}>
              {props.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-gray-400">Reason:</span> {props.reason}
          </p>

          {/* Metadata: Stack vertically on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] md:text-xs text-gray-400 mt-1">
            <div className="flex items-center gap-1">
              <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
              <p>
                {props.end_date && props.end_date !== "---" && props.end_date !== props.start_date
                  ? `${props.start_date} to ${props.end_date}`
                  : props.start_date}
              </p>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <Icon icon="lucide:clock" className="w-3.5 h-3.5" />
              <p>Submitted: {props.submitAt}</p>
            </div>
          </div>

          {/* Admin Feedback Box */}
          {(props.status === "Approved" || props.status === "Rejected") && (
            <div className="flex flex-col w-full md:max-w-[80%] bg-blue-50/50 rounded-xl border border-blue-100 p-3 md:p-4 mt-3 gap-2">
              {props.note && (
                <p className="text-sm text-blue-700 italic">
                  "{props.note}"
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] md:text-xs text-blue-500/80 font-medium">
                <p className="flex items-center gap-1">
                  <Icon icon="mdi:account-check-outline" className="w-3 h-3" />
                  By: {props.reviewBy}
                </p>
                {props.reviewAt && (
                  <p className="flex items-center gap-1">
                    <Icon icon="tabler:clock" className="w-3 h-3" />
                    {props.reviewAt}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Sidebar: Hidden on mobile status badge because we moved it above, 
          but Cancel button stays prominent */}
      <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-fit gap-3 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0">
        <span
          className={`hidden md:block px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide ${getStatusConfig(
            props.status
          )}`}
        >
          {props.status}
        </span>
        
        {props.status === "Pending" && (
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="flex-1 md:flex-none text-center text-xs font-semibold text-red-500 bg-red-50 px-4 py-2 md:py-1.5 rounded-lg md:rounded-full cursor-pointer hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
          >
            {isUpdating ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Cancel Request"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeRequestCard;