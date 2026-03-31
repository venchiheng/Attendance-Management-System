import React from "react";

type Props = {
  options: { label: string; value: string }[];
  placeholder: string;
  value: string; // This is your state
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const Selector = ({ options, placeholder, value, onChange }: Props) => {
  return (
    <select 
      value={value}
      onChange={onChange} 
      className="select"
    >
      <option value="all">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Selector;