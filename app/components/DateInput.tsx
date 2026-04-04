"use client";
import React from 'react';
import { Icon } from "@iconify/react";

type Props = {
  mode?: 'day' | 'month';
  label?: string;
  value: string; 
  onChange: (value: string) => void; 
}

const DateInput = ({ mode = 'day', label, value, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
      {label && (
        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <input 
          type={mode === 'month' ? 'month' : 'date'} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
      </div>
    </div>
  );
};

export default DateInput;