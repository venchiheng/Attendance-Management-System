import React from "react";

type Props = {
  colorClass: string;
  label: string;
  value: number;
};

const StatusCard = ({ colorClass, label, value }: Props) => {
  return (
    <div className={`p-4 rounded-xl border ${colorClass}`}>
      <p className="text-sm opacity-80 font-medium">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatusCard;
