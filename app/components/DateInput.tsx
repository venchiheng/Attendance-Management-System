import React from 'react'

type Props = {
  mode?: 'day' | 'month';
  label?: string;
  value: string; // Make this required for the filter to work
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput = ({ mode = 'day', label, value, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <p className="text-xs">{label}</p>}
      <input 
        type={mode === 'month' ? 'month' : 'date'} 
        value={value} 
        onChange={onChange}
        className="input input-bordered w-full"
      />
    </div>
  )
}

export default DateInput