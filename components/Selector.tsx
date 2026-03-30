import React from "react";

type Props = {
  options: { label: string; value: string }[];
  placeholder: string;
  defaultValue: string;
};

const Selector = (props: Props) => {
  return (
    <select defaultValue={props.defaultValue} className="select">
      <option disabled={true}>{props.placeholder}</option>
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Selector;
