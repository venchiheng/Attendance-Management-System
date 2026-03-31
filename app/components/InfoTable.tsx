"use client";
import React from "react";
import { useState } from "react";

type Column = { label: string; key: string, render?: (row: any) => React.ReactNode };
type InfoTableProps = {
  title: string;
  columns: Column[];
  rows: any[];
};

const getStatusBadge = (status: string) => {
  if (!status) return null;

  const statusLower = status.toLowerCase();

  // 1. Define the colors
  const styles: Record<string, string> = {
    present: "bg-green-200 text-green-700", //attendance log
    active: "bg-blue-200 text-blue-700", //employee status
    inactive: "bg-red-500 text-red-700", //attendance log
    late: "bg-yellow-200 text-yellow-600", //attendance log
    absent: "bg-red-500 text-red-700", //employee status
  };

  const badgeColor = styles[statusLower] || "badge-ghost";

  return (
    <div
      className={`${badgeColor} rounded-xl text-sm px-4 w-fit `}
    >
      {status}
    </div>
  );
};

const InfoTable = ({ title, columns, rows }: InfoTableProps) => {
  // 1. SETTINGS
  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // 2. CALCULATIONS
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / itemsPerPage);

  // Calculate which slice of the array to show
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = rows.slice(indexOfFirstItem, indexOfLastItem);

  // 3. HANDLERS
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="rounded-box border border-base-content/5 bg-base-100 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="p-4 bg-base-200/50 border-b border-base-content/5 flex justify-between items-center">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-xs font-medium opacity-60 bg-base-300 px-2 py-1 rounded-md">
          {totalRows} Total Records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-md">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th className="text-base-content/80 font-semibold" key={index}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {/* 1. Check if a custom render function exists */}
                    {col.render
                      ? col.render(row)
                      : /* 2. Fallback to your existing logic */
                      col.key === "status"
                      ? getStatusBadge(row[col.key])
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      {totalRows > itemsPerPage && (
        <div className="p-4 border-t border-base-content/5 bg-base-200/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm opacity-60">
            Showing{" "}
            <span className="font-bold text-base-content">
              {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalRows)}
            </span>{" "}
            of {totalRows}
          </p>

          <div className="join">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
              className="join-item btn btn-sm btn-outline"
            >
              Previous
            </button>

            {/* Simple dynamic page numbers */}
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i + 1)}
                className={`join-item btn btn-sm ${
                  currentPage === i + 1 ? "btn-active" : "btn-outline"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="join-item btn btn-sm btn-outline"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTable;
