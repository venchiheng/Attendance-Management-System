import React from 'react'
import { Icon } from '@iconify/react';

type ColorVariant = 'blue' | 'green' | 'red' | 'orange';

type Props = {
    icon: string;
    title: string;
    value: string | number;
    variant: ColorVariant;
}

const DashboardSummary = ({ icon, title, value, variant }: Props) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600"
  };

  return (
    <div className='flex flex-row gap-4 bg-white rounded-lg p-4 shadow-sm items-center w-full'>
        <div className={`p-3 rounded-lg ${colorMap[variant]}`}>
            <Icon icon={icon} className="text-2xl" />
        </div>
        <div className='flex flex-col gap-1'>
            <span className="text-gray-500 text-sm">{title}</span>
            <h3 className="font-bold text-xl">{value}</h3>
        </div>
    </div>
  )
}

export default DashboardSummary;