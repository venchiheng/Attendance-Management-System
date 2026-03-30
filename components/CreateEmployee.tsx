import React from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  action: "create" | "edit";
};

export default function CreateEmployee({ isOpen, onClose, action }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-white">
        {/* HEADER */}
        <h3 className="font-bold text-lg text-[#1A77F2]">Add New Employee</h3>
        <span className="font-sm text-sm text-gray-400">
          Fill in the employee details below to add them to the system.
        </span>
        {/* FORM */}
        <h4 className="font-bold text-md text-gray-700 mt-6">
          Personal Information
        </h4>
        <div className="divider mt-1"></div>
        <div className="flex flex-col gap-0 mt-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs -mt-2">Full Name</p>
              <input
                type="text"
                placeholder="Enter full name"
                className="input input-bordered w-full"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-xs -mt-2">Email Address</p>
                <input
                  type="text"
                  placeholder="Enter email address"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs -mt-2">Contact Number</p>
                <input
                  type="text"
                  placeholder="Enter contact number"
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs -mt-2">NFC Card ID</p>
              <input
                type="text"
                placeholder="Enter NFC Card ID"
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>
        <h4 className="font-bold text-md text-gray-700 mt-6">
          Job Information
        </h4>
        <div className="divider mt-1"></div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full gap-2">
            <p className="text-xs -mt-2">Position</p>
            <select
              defaultValue={"active"}
              className="select select-bordered w-full"
            >
              <option disabled={true} value={"active"}>
                Select Position
              </option>
              <option value={"manager"}>Manager</option>
              <option value={"developer"}>Developer</option>
              <option value={"designer"}>Designer</option>
            </select>
          </div>
          <div className="flex flex-col w-full gap-2">
            <p className="text-xs -mt-2">Department</p>
            <select
              defaultValue={"active"}
              className="select select-bordered w-full"
            >
              <option disabled={true} value={"active"}>
                Select Departments
              </option>
              <option value={"hr"}>HR</option>
              <option value={"engineering"}>Engineering</option>
              <option value={"design"}>Design</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full gap-2">
            <p className="text-xs mt-2">Hire Date</p>
            <input
              type="date"
              placeholder="Hire Date"
              className="input input-bordered w-full"
            />
          </div>
          <div className="flex flex-col w-full gap-2">
            <p className="text-xs mt-2">Work Mode</p>
            <select
              defaultValue={"active"}
              className="select select-bordered w-full"
            >
              <option disabled={true} value={"active"}>
                Select Work Mode
              </option>
              <option value={"active"}>Remote</option>
              <option value={"inactive"}>On-site</option>
              <option value={"inactive"}>Hybrid</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full gap-2">
            <p className="text-xs mt-2">Shift Type</p>
            <select
              defaultValue={"active"}
              className="select select-bordered w-full"
            >
              <option disabled={true} value={"active"}>
                Select Shift Type
              </option>
              <option value={"active"}>Full-time</option>
              <option value={"inactive"}>Part-time</option>
            </select>
          </div>
          <div className="flex flex-col w-full gap-2">
            <p className="text-xs mt-2">Employment Type</p>
            <select
              defaultValue={"active"}
              className="select select-bordered w-full"
            >
              <option disabled={true} value={"active"}>
                Select Employment Type
              </option>
              <option value={"active"}>Full-time</option>
              <option value={"inactive"}>Part-time</option>
            </select>
          </div>
        </div>
        {/* Example: Conditionally render Employment Status if needed */}
        {action === "edit" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col w-full gap-2">
              <p className="text-xs mt-2">Employment Status</p>
              <select
                defaultValue={"active"}
                className="select select-bordered w-full"
              >
                <option disabled={true} value={"active"}>
                  Select Employment Status
                </option>
                <option value={"active"}>Active</option>
                <option value={"inactive"}>Inactive</option>
              </select>
            </div>
          </div>
        )}

        {/* ACTIONS */}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button className="btn bg-[#1A77F2] text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
