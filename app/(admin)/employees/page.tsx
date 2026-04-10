"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "@/app/components/SearchBar";
import InfoTable from "@/app/components/InfoTable";
import Selector from "@/app/components/Selector";
import CreateEmployee from "@/app/components/CreateEmployee";
import { Icon } from "@iconify/react";

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [metadata, setMetadata] = useState({
    departments: [],
    positions: [],
    shifts: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data.employees || []);
      setMetadata(
        data.metadata || { departments: [], positions: [], shifts: [] }
      );
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleView = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete ${row.full_name}?`)) return;
    const res = await fetch(`/api/employees?id=${row.id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchEmployees();
  };

  const filteredEmployees = employees.filter((emp: any) => {
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.nfc_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.work_mode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employment_type?.toLowerCase().includes(searchQuery.toLowerCase());


    const matchesDept = filterDept === "all" || emp.department === filterDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex w-full gap-2 mr-2">
          <SearchBar
            placeholder="Search name, NFC, Work Mode, or Employment Type ..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
          <Selector
            value={filterDept} // This is controlled by state
            placeholder="Filter by Department"
            onChange={(e) => setFilterDept(e.target.value)}
            options={metadata.departments.map((d: any) => ({
              label: d.name,
              value: d.name,
            }))}
          />
        </div>
        <button onClick={handleAddNew} className="btn bg-[#1A77F2] text-white">
          + Add Employee
        </button>
      </div>

      <InfoTable
        title="Employee List"
        columns={[
          { label: "Name", key: "full_name" },
          { label: "NFC Card", key: "nfc_id" },
          { label: "Position", key: "position" },
          { label: "Department", key: "department" },
          { label: "Join Date", key: "hire_date" },
          { label: "Work Mode", key: "work_mode" },
          { label: "Employment Type", key: "employment_type" },
          {
            label: "Actions",
            key: "actions",
            render: (row) => (
              <div className="flex gap-2">
                <button
                  className="btn btn-sm btn-ghost text-gray-700"
                  onClick={() => handleView(row)}
                >
                  <Icon icon={"solar:eye-linear"} className="w-4 h-4" />
                </button>
                <button
                  className="btn btn-sm btn-ghost text-blue-600"
                  onClick={() => handleEdit(row)}
                >
                  <Icon icon={"lucide:edit"} className="w-4 h-4" />
                </button>
                <button
                  className="btn btn-sm btn-ghost text-red-600"
                  onClick={() => handleDelete(row)}
                >
                  <Icon icon={"mi:delete"} className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        rows={filteredEmployees}
      />

      {loading && <div className="text-center py-4">Loading employees...</div>}

      <CreateEmployee
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedEmployee}
        metadata={metadata}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}
