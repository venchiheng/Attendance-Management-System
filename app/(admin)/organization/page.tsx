"use client";
import { useState, useEffect } from "react";
import InfoTable from "@/app/components/InfoTable";
import ShiftModal from "@/app/components/organization/ShiftModal";
import DeptModal from "@/app/components/organization/DeptModal";
import PositionModal from "@/app/components/organization/PositionModal";
import { Icon } from "@iconify/react";

const OrganizationPage = () => {
  const [data, setData] = useState({
    shifts: [],
    departments: [],
    positions: [],
  });

  const [activeModal, setActiveModal] = useState<
    "shift" | "dept" | "pos" | null
  >(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- Data Fetching ---
  const fetchShifts = async () => {
    const res = await fetch("/api/shifts");
    const items = await res.json();
    setData((prev) => ({ ...prev, shifts: items }));
  };

  const fetchDepartments = async () => {
    const res = await fetch("/api/departments");
    const items = await res.json();
    setData((prev) => ({ ...prev, departments: items }));
  };

  const fetchPositions = async () => {
    const res = await fetch("/api/positions");
    const items = await res.json();
    setData((prev) => ({ ...prev, positions: items }));
  };

  useEffect(() => {
    fetchShifts();
    fetchDepartments();
    fetchPositions();
  }, []);

  // --- Handlers ---
  const handleOpenModal = (type: "shift" | "dept" | "pos", item = null) => {
    setSelectedItem(item);
    setActiveModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setSelectedItem(null);
  };

  // --- RESTful Delete Handler ---
  const handleDelete = async (
    type: "shifts" | "departments" | "positions",
    id: string
  ) => {
    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`))
      return;

    // Updated to RESTful Path: /api/shifts/[id]
    const res = await fetch(`/api/${type}/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      if (type === "shifts") fetchShifts();
      if (type === "departments") fetchDepartments();
      if (type === "positions") fetchPositions();
    } else {
      const err = await res.json();
      alert(`Error: ${err.error || "Failed to delete"}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="tabs tabs-lifted w-full border-b-2 border-base-300">
        {/* SHIFTS TAB */}
        <input
          type="radio"
          name="org_tabs"
          className="tab"
          aria-label="Shift Management"
          defaultChecked
        />
        <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Shifts</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenModal("shift")}
            >
              + Add Shift
            </button>
          </div>
          <InfoTable
            title="Work Shifts"
            rows={data.shifts}
            columns={[
              { label: "Shift Name", key: "shift_name" },
              { label: "Start", key: "start_shift" },
              { label: "End", key: "end_shift" },
              { label: "Break Duration", key: "break_duration_minutes" },
              {
                label: "Actions",
                key: "actions",
                render: (row: any) => (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost text-blue-600"
                      onClick={() => handleOpenModal("shift", row)}
                    >
                      <Icon icon={"lucide:edit"} className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-red-600"
                      onClick={() => handleDelete("shifts", row.id)}
                    >
                      <Icon icon={"mi:delete"} className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* DEPARTMENTS TAB */}
        <input
          type="radio"
          name="org_tabs"
          className="tab"
          aria-label="Departments"
        />
        <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Departments</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenModal("dept")}
            >
              + Add Department
            </button>
          </div>
          <InfoTable
            title="Work Departments"
            rows={data.departments}
            columns={[
              { label: "Name", key: "name" },
              {
                label: "Created At",
                key: "created_at",
                render: (row: any) =>
                  new Date(row.created_at).toLocaleDateString(),
              },
              {
                label: "Updated At",
                key: "updated_at",
                render: (row: any) =>
                  new Date(row.updated_at).toLocaleDateString(),
              },
              {
                label: "Actions",
                key: "actions",
                render: (row: any) => (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost text-blue-600"
                      onClick={() => handleOpenModal("dept", row)}
                    >
                      <Icon icon={"lucide:edit"} className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-red-600"
                      onClick={() => handleDelete("departments", row.id)}
                    >
                      <Icon icon={"mi:delete"} className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>

        {/* POSITIONS TAB */}
        <input
          type="radio"
          name="org_tabs"
          className="tab"
          aria-label="Positions"
        />
        <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manage Positions</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenModal("pos")}
            >
              + Add Position
            </button>
          </div>
          <InfoTable
            title="Job Positions"
            rows={data.positions}
            columns={[
              { label: "Position Name", key: "name" },
              {
                label: "Actions",
                key: "actions",
                render: (row: any) => (
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost text-blue-600"
                      onClick={() => handleOpenModal("pos", row)}
                    >
                      <Icon icon={"lucide:edit"} className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-red-600"
                      onClick={() => handleDelete("positions", row.id)}
                    >
                      <Icon icon={"mi:delete"} className="w-4 h-4" />
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* MODALS */}
      <ShiftModal
        isOpen={activeModal === "shift"}
        onClose={handleCloseModal}
        initialData={selectedItem}
        onSuccess={fetchShifts}
      />

      <DeptModal
        isOpen={activeModal === "dept"}
        onClose={handleCloseModal}
        initialData={selectedItem}
        onSuccess={fetchDepartments}
      />

      <PositionModal
        isOpen={activeModal === "pos"}
        onClose={handleCloseModal}
        initialData={selectedItem}
        onSuccess={fetchPositions}
      />
    </div>
  );
};

export default OrganizationPage;
