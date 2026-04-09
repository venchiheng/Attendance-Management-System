"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function MyProfilePage() {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Assuming /api/employees/me returns the profile of the current user
        const res = await fetch("/api/employees/me");
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const calculateTimeWithCompany = (hireDate: string) => {
    if (!hireDate) return "---";
    const start = new Date(hireDate);
    const now = new Date();

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const yearStr = years > 0 ? `${years} year` : "";
    const monthStr = months > 0 ? `${months} months` : "";

    if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
    return yearStr || monthStr || "New Joiner";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!employee) {
    return <div className="p-6 text-center">Profile not found.</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left side */}
      <div className="flex flex-col flex-1 bg-white rounded-2xl max-w-1/3  border border-gray-100">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 p-6 rounded-t-2xl bg-blue-100">
          <div className="avatar placeholder">
            <div className="bg-blue-600 text-primary-content flex items-center justify-center rounded-full w-20 h-20">
              <span className="text-2xl font-semibold">
                {employee.full_name
                  ? employee.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "U"}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{employee.full_name}</h2>
            <p className="text-gray-500">
              {employee.positions?.name || "No Position Assigned"}
            </p>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Employee ID: {employee.employee_code}
            </p>
          </div>
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-md text-gray-500">Department</p>
            <p className="font-medium">{employee.departments?.name || "---"}</p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-md text-gray-500">Work Mode</p>
            <p className="font-medium capitalize">
              {employee.work_mode || "---"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-md text-gray-500">Employment Type</p>
            <p className="font-medium capitalize">
              {employee.employment_type?.replace("_", " ")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-md text-gray-500">Joined Date</p>
            <p className="font-medium">{employee.hire_date || "---"}</p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col flex-1 gap-8">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col">
          <div className="flex flex-row items-center bg-purple-100 p-4 rounded-t-2xl gap-3">
            <div className="flex items-center bg-purple-600 p-2 rounded-xl text-white">
              <Icon icon="tabler:user" className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold">Contact Information</h2>
          </div>

          <div className="flex flex-col p-6 gap-4 ">
            <div className="flex flex-col">
              <span className="text-md text-gray-500 mb-2">Email Address</span>
              <p className="font-medium">{employee.email}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-md text-gray-500 mb-2">Phone Number</span>
              <p className="font-medium">{employee.phone_number || "---"}</p>
            </div>
          </div>
        </div>

        {/* Employment details */}
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col">
          <div className="flex flex-row items-center bg-green-100 p-4 rounded-t-2xl gap-3">
            <div className="flex items-center bg-green-600 p-2 rounded-xl text-white">
              <Icon
                icon="majesticons:checkbox-list-detail-line"
                className="w-6 h-6"
              />
            </div>
            <h2 className="text-lg font-bold">Employment Details</h2>
          </div>

          <div className="grid grid-cols-2 gap-4  p-6">
            <div className="flex flex-col gap-1 text-blue-800 bg-blue-100 p-4 rounded-2xl border border-blue-400">
              <div className="flex flex-row items-center gap-2">
                <Icon icon={"mingcute:time-duration-line"}></Icon>
                <span className="text-md">Time with Company</span>
              </div>

              <p className="text-xl font-semibold">
                {calculateTimeWithCompany(employee.hire_date)}
              </p>
            </div>
            <div className="flex flex-col gap-1 text-purple-800 bg-purple-100 p-4 rounded-2xl border border-purple-400">
              <div className="flex flex-row items-center gap-2">
                <Icon icon={"solar:global-linear"}></Icon>
                <span className="text-md">Employment Status</span>
              </div>
              <p
                className={`text-xl font-semibold capitalize ${
                  employee.employment_status === "active"
                }`}
              >
                {employee.employment_status || "---"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
