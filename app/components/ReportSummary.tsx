import { Icon } from '@iconify/react';
import React from 'react';

type bgColor = "bg-white" | "bg-blue-600";
type textColor = "text-white" | "text-black";

type Props = {
    title: string;
    subtitle: string;
    value: number | string;
    icon: string;
    variant: bgColor;
    textColor: textColor;
    iconColor?: string;
    trend?: number;
    subtitleColor?: string;
}

const ReportSummary = (props: Props) => {
  const isPositive = props.trend && props.trend > 0;
  const isNegative = props.trend && props.trend < 0;

  return (
    <div className={`flex flex-col gap-2 ${props.variant} ${props.textColor} rounded-2xl p-4 shadow-sm items-start w-full border border-gray-100`}>
      <div className='flex flex-row gap-2 items-center opacity-80'>
        <Icon icon={props.icon} className={`w-5 h-5 ${props.iconColor}`} />
        <span className={`text-sm ${props.subtitleColor} font-medium`}>{props.title}</span>
      </div>

      <h4 className='text-3xl font-semibold'>{props.value}</h4>

      <div className="flex items-center gap-1">
        {props.trend !== undefined && (
          <>
            <Icon 
              icon={isPositive ? "heroicons:arrow-trending-up" : "heroicons:arrow-trending-down"} 
              className={isPositive ? "text-green-500" : "text-red-500"} 
            />
            <span className={`text-xs font-bold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? `↑ ${props.trend}%` : `↓ ${Math.abs(props.trend)}%`}
            </span>
          </>
        )}
        <span className={`text-xs ${props.subtitleColor}  font-sm`}>{props.subtitle}</span>
      </div>
    </div>
  )
}

export default ReportSummary;