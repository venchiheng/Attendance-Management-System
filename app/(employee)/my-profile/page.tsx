"use client";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

export default function MyProfilePage() {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
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
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-0">
      {/* Left side - Profile Overview */}
      {/* Changed max-w-1/3 to lg:max-w-[320px] and w-full for mobile */}
      <div className="flex flex-col w-full lg:max-w-[320px] bg-white rounded-2xl border border-gray-100 h-fit">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-4 p-6 md:p-8 rounded-t-2xl bg-blue-100">
          <div className="avatar placeholder">
            <div className="bg-blue-600 text-primary-content flex items-center justify-center rounded-full w-20 h-20 md:w-24 md:h-24 shadow-lg">
              <span className="text-2xl md:text-3xl font-semibold">
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
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{employee.full_name}</h2>
            <p className="text-blue-600 font-medium text-sm md:text-base">
              {employee.positions?.name || "No Position Assigned"}
            </p>
            <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-wider">
              ID: {employee.employee_code || "---"} 
            </p>
          </div>
        </div>

        {/* Detail */}
        <div className="flex flex-col gap-6 p-6">
          <DetailItem label="Department" value={employee.departments?.name || "---"} />
          <DetailItem label="Work Mode" value={employee.work_mode} isCapitalize />
          <DetailItem label="Employment Type" value={employee.employment_type?.replace("_", " ")} isCapitalize />
          <DetailItem label="Joined Date" value={employee.hire_date || "---"} />
        </div>
      </div>

      {/* Right side - Content Sections */}
      <div className="flex flex-col flex-1 gap-6 md:gap-8">
        
        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm">
          <div className="flex flex-row items-center bg-purple-100 p-4 rounded-t-2xl gap-3">
            <div className="flex items-center bg-purple-600 p-2 rounded-xl text-white">
              <Icon icon="tabler:user" className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-lg font-semibold text-purple-900">Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1 font-medium">Email Address</span>
              <p className="font-semibold text-gray-800">{employee.email}</p>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1 font-medium">Phone Number</span>
              <p className="font-semibold text-gray-800">{employee.phone_number || "---"}</p>
            </div>
          </div>
        </div>

        {/* Employment details */}
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm">
          <div className="flex flex-row items-center bg-green-100 p-4 rounded-t-2xl gap-3">
            <div className="flex items-center bg-green-600 p-2 rounded-xl text-white">
              <Icon
                icon="majesticons:checkbox-list-detail-line"
                className="w-5 h-5 md:w-6 md:h-6"
              />
            </div>
            <h2 className="text-lg font-semibold text-green-900">Employment Details</h2>
          </div>

          {/* Changed grid-cols-2 to grid-cols-1 md:grid-cols-2 for better mobile fit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            <div className="flex flex-col gap-1 text-blue-800 bg-blue-50 p-5 rounded-2xl border border-blue-200">
              <div className="flex flex-row items-center gap-2 mb-1">
                <Icon icon={"mingcute:time-duration-line"} className="w-4 h-4"></Icon>
                <span className="text-sm font-medium">Time with Company</span>
              </div>
              <p className="text-xl font-semibold">
                {calculateTimeWithCompany(employee.hire_date)}
              </p>
            </div>
            
            <div className="flex flex-col gap-1 text-purple-800 bg-purple-50 p-5 rounded-2xl border border-purple-200">
              <div className="flex flex-row items-center gap-2 mb-1">
                <Icon icon={"solar:global-linear"} className="w-4 h-4"></Icon>
                <span className="text-sm font-medium">Employment Status</span>
              </div>
              <p className="text-xl font-semibold capitalize">
                {employee.employment_status || "---"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for detail items on the left side
const DetailItem = ({ label, value, isCapitalize }: { label: string, value: string, isCapitalize?: boolean }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
    <p className={`font-semibold text-gray-700 ${isCapitalize ? 'capitalize' : ''}`}>
      {value || "---"}
    </p>
  </div>
);