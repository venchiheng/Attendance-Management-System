import React from 'react'

type Props = {
  title: string;
  description: string;
};

const NotificationCard = ({title, description}: Props) => {
  return (
    <div className="flex flex-row p-4 bg-white border border-gray-200 rounded-xl justify-between w-full">
      <div className="flex flex-col ">
        <p className='text-sm'>{title}</p>
        <p className='text-gray-500 text-xs'>{description}</p>
      </div>
      <input
        type="checkbox"
        className="toggle bg-white  checked:bg-blue-500 checked:text-white"
      />
    </div>
  );
}

export default NotificationCard