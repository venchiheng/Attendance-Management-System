"use client";
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Selector from "@/app/components/Selector";
import { useRouter } from "next/navigation";

type RequestType = "leave" | "remote" | "emergency" | "general";

const REQUEST_INFO = {
  leave: {
    icon: "uil:calendar",
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    description: "Request time off from work",
    guidelines: [
      "Submit at least 2 weeks in advance",
      "Sick leave requires a medical certificate for 2+ days",
      "Annual leave requires approval",
      "Annual leave requires approval",
    ],
  },
  remote: {
    icon: "uil:suitcase",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
    description: "Request to work from home",
    guidelines: [
      "Must have stable internet connection",
      "Submit at least 1 day in advance",
      "Stay available during work hours",
      "Join all scheduled meetings",
    ],
  },
  emergency: {
    icon: "mingcute:warning-line",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-700",
    description: "Urgent situations requiring immediate time off",
    guidelines: [
      "For urgent situations only",
      "Immediate review and response",
      "Notify your manager directly",
      "May require documentation later",
    ],
  },
  general: {
    icon: "basil:document-outline",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
    description: "Any other company-related requests or changes",
    guidelines: [
      "Schedule or shift changes",
      "Equipment or resource requests",
      "Policy clarifications",
      "Workspace modifications",
    ],
  },
};

export default function SubmitRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("leave");
  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit request");
      }

      router.push("/my-requests");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonStyles = (
    type: RequestType,
    activeClass: string,
    inactiveClass: string
  ) => {
    const isActive = requestType === type;
    return `flex flex-col gap-2 p-4 justify-center items-center border rounded-xl cursor-pointer transition-all flex-1
      ${isActive ? activeClass : inactiveClass}`;
  };

  const showEndDate = requestType === "leave" || requestType === "remote";
  const showSelector = requestType === "leave";

  const info = REQUEST_INFO[requestType];

  return (
    <div className="flex flex-row gap-5">
      {/* Actual request form - left side */}
      <div className="flex flex-col w-full gap-6">
        {/* Select request type */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-1">Request Type</h2>
          <p className="text-sm text-gray-500">
            Select the type of request you want to submit
          </p>
          <div className="flex flex-row gap-4 mt-4 ">
            <div
              className={getButtonStyles(
                "leave",
                "bg-red-600 text-white border-red-600 shadow-md",
                "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              )}
              onClick={() => setRequestType("leave")}
            >
              <Icon icon="uil:calendar" className="w-6 h-6"></Icon>
              <span className="font-semibold text-sm">Leave Request</span>
              <span
                className={`text-xs text-center ${
                  requestType === "leave" ? "text-red-100" : "text-red-700"
                }`}
              >
                Request time off from work
              </span>
            </div>
            <div
              className={getButtonStyles(
                "remote",
                "bg-blue-600 text-white border-blue-600 shadow-md",
                "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              )}
              onClick={() => setRequestType("remote")}
            >
              <Icon icon="uil:suitcase" className="w-6 h-6"></Icon>
              <span className="font-semibold text-sm">Remote Work</span>
              <span
                className={`text-xs text-center ${
                  requestType === "remote" ? "text-blue-100" : "text-blue-700"
                }`}
              >
                Request to work from home
              </span>
            </div>
            <div
              className={getButtonStyles(
                "emergency",
                "bg-orange-600 text-white text-center border-orange-600 ",
                "bg-orange-50 text-center border-orange-200 text-orange-600 hover:bg-orange-100"
              )}
              onClick={() => setRequestType("emergency")}
            >
              <Icon icon="mingcute:warning-line" className="w-6 h-6"></Icon>
              <span className="font-semibold text-sm">Emergency Request</span>
              <span
                className={`text-xs text-center ${
                  requestType === "emergency"
                    ? "text-orange-100"
                    : "text-orange-700"
                }`}
              >
                Urgent situations requiring immediate time off
              </span>
            </div>
            <div
              className={getButtonStyles(
                "general",
                "bg-purple-600 text-white border-purple-600 shadow-md",
                "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
              )}
              onClick={() => setRequestType("general")}
            >
              <Icon icon="basil:document-outline" className="w-6 h-6"></Icon>
              <span className="font-semibold text-sm">General Request</span>
              <span
                className={`text-xs text-center ${
                  requestType === "general"
                    ? "text-purple-100"
                    : "text-purple-700"
                }`}
              >
                Any other company-related requests or changes
              </span>
            </div>
          </div>
        </div>
        {/* Requets form */}
        <div className="bg-white rounded-xl border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-slate-900">
              {requestType.charAt(0).toUpperCase() + requestType.slice(1)}{" "}
              Request Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Provide details about your request
            </p>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {showSelector && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <Selector
                  placeholder="Select leave type"
                  showDefaultOption={true}
                  options={[
                    { label: "Annual Leave", value: "annual" },
                    { label: "Sick Leave", value: "sick" },
                    { label: "Maternity Leave", value: "maternity" },
                  ]}
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      leaveType: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            {/* Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {requestType === "general" ? "Expected Date" : "Start Date"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                    required
                  />
                </div>
              </div>
              {showEndDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                    required
                  />
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                placeholder={`Explain the reason for your ${requestType} request...`}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 resize-none"
                required
              />
              <p className="text-xs text-blue-500/80 mt-2">
                Be as detailed as possible to help us process your request
                quickly
              </p>
            </div>

            {/* Attachments */}
            <fieldset className="fieldset">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <input type="file" className="file-input" />
              <label className="label">Max size 2MB</label>
            </fieldset>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-sm disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Requests Detail or informations - right side */}
      <div className="flex flex-col w-1/3 gap-6">
        {/* About this request */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="bg-blue-100 px-6 py-4 rounded-t-xl">
            <h2 className="text-lg font-bold text-slate-900">
              About This Request
            </h2>
          </div>
          <div className="flex flex-col p-6 gap-4">
            {/* header */}
            <div className="flex flex-row gap-4 items-start">
              <div className={`p-3 ${info.iconBg} rounded-lg`}>
                <Icon
                  icon={info.icon}
                  className={`w-6 h-6 ${info.iconColor}`}
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-slate-800">
                  {requestType.charAt(0).toUpperCase() + requestType.slice(1)}{" "}
                  Request
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {info.description}
                </p>
              </div>
            </div>
            <ul
              className={`p-4 rounded-xl flex flex-col gap-1 border-gray-50 ${info.iconBg} ${info.iconColor} pt-4`}
            >
              <p className={`text-sm font-semibold ${info.iconColor}`}>
                {requestType.charAt(0).toUpperCase() + requestType.slice(1)}{" "}
                Guidelines:
              </p>
              {info.guidelines.map((guideline, index) => (
                <li
                  key={index}
                  className={`text-xs ${info.iconColor} list-disc list-inside leading-relaxed`}
                >
                  {guideline}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Processing time */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="bg-purple-100 px-6 py-4 rounded-t-xl">
            <h2 className="text-lg font-bold text-slate-900">
              Processing Time
            </h2>
          </div>

          <div className="flex flex-col p-6 gap-3">
            <div className="flex flex-row justify-between p-3 rounded-xl text-orange-700 text-sm bg-orange-100">
              <p className="font-medium">Emergency</p>
              <p className="font-light">Immediate review</p>
            </div>
            <div className="flex flex-row justify-between p-3 rounded-xl text-blue-700 text-sm bg-blue-100">
              <p className="font-medium">Remote Work</p>
              <p className="font-light">1-2 business days</p>
            </div>
            <div className="flex flex-row justify-between p-3 rounded-xl text-red-700 text-sm bg-red-100">
              <p className="font-medium">Leave Request</p>
              <p className="font-light">2-3 business days</p>
            </div>
            <div className="flex flex-row justify-between p-3 rounded-xl text-purple-700 text-sm bg-purple-100">
              <p className="font-medium">General Request</p>
              <p className="font-light">3-5 business days</p>
            </div>
          </div>
        </div>
        {/* Need Help */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="bg-green-100 px-6 py-4 rounded-t-xl">
            <h2 className="text-lg font-bold text-slate-900">
              Need Help?
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <p className="text-sm text-gray-500">
              If you have questions about submitting a request, contact:
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-800">
                HR Department
              </p>
              <p className="text-xs text-blue-600">hr@company.com</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-800">
                Support Team
              </p>
              <p className="text-xs text-blue-600">support@company.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
