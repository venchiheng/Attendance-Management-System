import React from 'react'

type Props = {
  mode?: 'day' | 'month';
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DateInput = ({ mode = 'day', label, ...props }: Props) => {
  const getDefaultValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');

    return mode === 'month' ? `${year}-${month}` : `${year}-${month}-${day}`;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <p className="text-xs">{label}</p>}
      <input 
        {...props}
        type={mode === 'month' ? 'month' : 'date'} 
        defaultValue={props.value || getDefaultValue()} // Use passed value OR our default
        className="input input-bordered w-full"
      />
    </div>
  )
}

export default DateInput