"use client";
import { Icon } from "@iconify/react";
import { useState } from "react";

type RequestType = "Emergency" | "General" | "Leave" | "Remote";
type RequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

interface RequestProps {
  id: string | number;
  name: string;
  type: RequestType;
  period: string;
  duration?: string;
  submitted: string;
  reason?: string;
  status: RequestStatus;
  note?: string;
  onStatusUpdate?: () => void;
}

const RequestCard = ({
  id,
  name,
  type,
  period,
  duration,
  submitted,
  reason,
  status,
  note,
  onStatusUpdate,
}: RequestProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [pendingAction, setPendingAction] = useState<"approved" | "rejected" | null>(null);

  const getTypeConfig = (type: RequestType) => {
    const normalizedType =
      type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();

    switch (normalizedType) {
      case "Emergency":
        return { bg: "bg-red-50", color: "text-red-500", icon: "material-symbols:warning-outline-rounded" };
      case "Leave":
        return { bg: "bg-red-50", color: "text-red-500", icon: "lucide:calendar" };
      case "General":
        return { bg: "bg-blue-50", color: "text-blue-500", icon: "mynaui:box-solid" };
      case "Remote":
        return { bg: "bg-blue-50", color: "text-blue-500", icon: "uil:suitcase" };
      default:
        return { bg: "bg-gray-50", color: "text-gray-500", icon: "lucide:help-circle" };
    }
  };

  const getStatusConfig = (status: RequestStatus) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending": return "bg-orange-50 text-orange-500";
      case "approved": return "bg-green-50 text-green-600";
      case "rejected": return "bg-red-50 text-red-600";
      case "cancelled": return "bg-gray-100 text-gray-500";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const openActionModal = (action: "approved" | "rejected") => {
    setPendingAction(action);
    setAdminNote("");
    const modal = document.getElementById(`action_modal_${id}`) as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const updateRequestStatus = async (newStatus: "approved" | "rejected", note: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update status");
      }

      if (onStatusUpdate) {
        onStatusUpdate();
      }
      
      // Close modal if it was open during the action
      const modal = document.getElementById(`modal_${id}`) as HTMLDialogElement;
      if (modal) modal.close();

      const actionModal = document.getElementById(`action_modal_${id}`) as HTMLDialogElement;
      if (actionModal) actionModal.close();
      setPendingAction(null);

    } catch (err) {
      console.error("Update Error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const config = getTypeConfig(type);
  const statusClass = getStatusConfig(status);

  return (
    <>
      <div className="card bg-white border border-gray-200 shadow-sm rounded-xl h-fit overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg} ${config.color} text-2xl`}>
                <Icon icon={config.icon} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">{name}</h3>
                <p className="text-sm text-gray-500">
                  {type === "Leave" ? "Annual Leave" : `${type} Request`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`badge border-none font-medium py-3 px-4 rounded-lg text-xs ${statusClass}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
              </div>
              <button 
                onClick={() => (document.getElementById(`modal_${id}`) as HTMLDialogElement).showModal()}
                className="text-[10px] uppercase tracking-wider font-bold text-primary hover:underline"
              >
                View Details
              </button>
            </div>
          </div>

          {/* Info Rows */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-black">{type === "General" ? "Requested Date" : "Period"}</span>
              <span className="text-gray-700 font-medium">{period || "---"}</span>
            </div>

            {type !== "General" && duration && (
              <div className="flex justify-between text-sm">
                <span className="text-black">Duration</span>
                <span className="text-gray-700 font-medium">{duration}</span>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-black">Submitted</span>
              <span className="text-gray-700 font-medium">{submitted}</span>
            </div>
          </div>

          {/* Reason Block */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-black uppercase mb-2">Reason:</p>
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 break-words">
              {reason || "No reason provided."}
            </p>
          </div>

          {/* Admin Comment Block */}
          {note && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="lucide:message-square-quote" className="text-blue-600 w-4 h-4" />
                <p className="text-xs font-semibold text-blue-800 uppercase">Admin Comment</p>
              </div>
              <p className="text-sm text-blue-900 leading-relaxed line-clamp-2 break-words">
                {note}
              </p>
            </div>
          )}

          {/* Action Section */}
          <div className="mt-6">
            {status === "Pending" ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={isUpdating}
                  className="btn bg-green-500 hover:bg-green-600 shadow-none text-white border-none min-h-0 h-11 rounded-lg normal-case font-semibold transition-colors disabled:opacity-50"
                  onClick={() => openActionModal("approved")}
                >
                  Approve
                </button>
                <button
                  disabled={isUpdating}
                  className="btn bg-red-500 hover:bg-red-600 shadow-none text-white border-none min-h-0 h-11 rounded-lg normal-case font-semibold transition-colors disabled:opacity-50"
                  onClick={() => openActionModal("rejected")}
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-dashed text-sm font-semibold 
                ${status?.toLowerCase() === "approved" ? "bg-green-50 border-green-200 text-green-700" : 
                  status?.toLowerCase() === "rejected" ? "bg-red-50 border-red-200 text-red-700" : 
                  "bg-gray-50 border-gray-200 text-gray-500"}`}>
                <Icon
                  icon={status?.toLowerCase() === "approved" ? "lucide:check-circle" : status?.toLowerCase() === "rejected" ? "lucide:x-circle" : "lucide:info"}
                  className="text-lg"
                />
                This request has been {status?.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <dialog id={`modal_${id}`} className="modal modal-bottom  sm:modal-middle">
        <div className="modal-box bg-white max-w-xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          
          <div className="flex items-center gap-4 mb-6 border-b pb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg} ${config.color} text-2xl`}>
              <Icon icon={config.icon} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{name}</h3>
              <p className="text-sm text-gray-500">{type} Detail Information</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm mb-6">
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px]">Status</p>
              <p className={`font-semibold ${status?.toLowerCase() === 'approved' ? 'text-green-600' : status?.toLowerCase() === 'rejected' ? 'text-red-600' : 'text-orange-500'}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px]">Submitted Date</p>
              <p className="text-gray-700 font-medium">{submitted}</p>
            </div>
            <div>
              <p className="text-gray-400 font-bold uppercase text-[10px]">{type === "General" ? "Requested Date" : "Period"}</p>
              <p className="text-gray-700 font-medium">{period}</p>
            </div>
            {duration && (
              <div>
                <p className="text-gray-400 font-bold uppercase text-[10px]">Duration</p>
                <p className="text-gray-700 font-medium">{duration}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-xs font-bold text-black uppercase mb-3">Reason for Request:</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {reason || "No detailed reason provided."}
            </p>
          </div>

          {note && (
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mt-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Icon icon="lucide:message-square-quote" className="text-blue-700 w-5 h-5" />
                <p className="text-xs font-bold text-blue-800 uppercase">Admin Comment</p>
              </div>
              <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">
                {note}
              </p>
            </div>
          )}

          {status === "Pending" && (
            <div className="modal-action grid grid-cols-2 gap-4 mt-8">
              <button 
                onClick={() => openActionModal("approved")}
                disabled={isUpdating}
                className="btn bg-green-500 hover:bg-green-600 text-white border-none h-12"
              >
                Approve Request
              </button>
              <button 
                onClick={() => openActionModal("rejected")}
                disabled={isUpdating}
                className="btn bg-red-500 hover:bg-red-600 text-white border-none h-12"
              >
                Reject Request
              </button>
            </div>
          )}
        </div>
      </dialog>

      {/* ACTION CONFIRMATION MODAL (WITH NOTE) */}
      <dialog id={`action_modal_${id}`} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box bg-white">
          <h3 className="font-bold text-lg mb-2">
            {pendingAction === "approved" ? "Approve" : "Reject"} Request
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to {pendingAction} this request? You can add an optional note below.
          </p>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold text-gray-700">Admin Note (Optional)</span>
            </label>
            <textarea 
              className="textarea textarea-bordered h-24 bg-white text-gray-800" 
              placeholder="Enter your reason or remarks here..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            ></textarea>
          </div>

          <div className="modal-action flex gap-3">
            <form method="dialog" className="flex-1">
              <button className="btn btn-ghost w-full">Cancel</button>
            </form>
            <button 
              onClick={() => pendingAction && updateRequestStatus(pendingAction, adminNote)}
              disabled={isUpdating}
              className={`btn flex-1 text-white border-none ${
                pendingAction === "approved" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isUpdating ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                `Confirm ${pendingAction === "approved" ? "Approval" : "Rejection"}`
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default RequestCard;