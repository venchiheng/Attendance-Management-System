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
        return {
          bg: "bg-amber-50",
          color: "text-amber-500",
          icon: "mingcute:warning-line",
        };
      case "Leave":
        return {
          bg: "bg-red-50",
          color: "text-red-500",
          icon: "lucide:calendar",
        };
      case "General":
        return {
          bg: "bg-purple-50",
          color: "text-purple-500",
          icon: "mynaui:box-solid",
        };
      case "Remote":
        return {
          bg: "bg-blue-50",
          color: "text-blue-500",
          icon: "uil:suitcase",
        };
      default:
        return {
          bg: "bg-gray-50",
          color: "text-gray-500",
          icon: "lucide:help-circle",
        };
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status as RequestStatus;
    switch (s) {
      case "Pending":
        return "bg-orange-100 text-orange-600";
      case "Approved":
        return "bg-green-100 text-green-600";
      case "Rejected":
        return "bg-red-100 text-red-600";
      case "Cancelled":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const typeConfig = getTypeConfig(props.type);

  return (
    <div className="w-full h-full p-7 flex flex-row items-start justify-between border-y border-gray-200">
      <div
        className={`${typeConfig.bg} rounded-lg p-2 flex items-center justify-center`}
      >
        <Icon
          icon={typeConfig.icon}
          className={`w-6 h-6 ${typeConfig.color}`}
        />
      </div>
      <div className="flex flex-col flex-1 mx-4 gap-1.5">
        <h1 className="text-md font-semibold">{props.type} Request</h1>
        <p className="text-sm text-gray-600">Reason: {props.reason}</p>
        <div className="flex flex-row items-center gap-4 text-xs text-gray-500 mt-1">
          <div className="flex items-center gap-1">
            <Icon icon="lucide:calendar" className="w-3 h-3" />
            <p>
              {props.end_date && props.end_date !== "---" && props.end_date !== props.start_date
                ? `${props.start_date} to ${props.end_date}`
                : props.start_date}
            </p>
          </div>
          <div className="flex flex-row gap-1 items-center">
            <Icon icon="lucide:clock" className="w-3 h-3" />
            <p>Submitted At: {props.submitAt}</p>
          </div>
        </div>
        {(props.status === "Approved" || props.status === "Rejected") && (
          <div className="flex flex-col max-w-1/2 bg-blue-100 rounded-xl border border-blue-200 p-4 mt-2 gap-3 justify-items-start items-start">
            {props.note && (
              <p className="text-sm text-blue-700  mt-1  w-full">
                Note: {props.note}
              </p>
            )}
            <div className="flex flex-row gap-4 text-xs text-blue-900">
              <p className="flex items-center gap-1">
                <Icon icon="mdi-light:comment" className="w-3 h-3"></Icon>
                <span className="font-medium">Reviewed By:</span>{" "}
                {props.reviewBy}
              </p>
              {props.reviewAt && (
                <p className="flex items-center gap-1">
                  <Icon icon="tabler:clock" className="w-3 h-3"></Icon>
                  <span className="font-medium">Reviewed At:</span>{" "}
                  {props.reviewAt}{" "}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig(
            props.status
          )}`}
        >
          {props.status}
        </span>
        {props.status === "Pending" && (
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="block w-full text-center text-xs font-medium text-gray-500 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-100 hover:text-gray-400"
          >
            {isUpdating ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Cancel"
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeRequestCard;
