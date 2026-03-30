import React from 'react';
import { Icon } from '@iconify/react';

type Props = {
    shiftTitle: string;
    shiftDetail: string;
    days_of_week: string[];
    isDefault?: boolean;
};

const ShiftCard = ({ shiftTitle, shiftDetail, days_of_week, isDefault }: Props) => {
    return (
        <div className={`flex flex-col gap-4 border-2 p-5 rounded-2xl transition-all ${isDefault ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white'}`}>
            
            <div className='flex flex-row items-start justify-between'>
                <div className='flex gap-4'>
                    {/* Clock Icon Wrapper */}
                    <div className='bg-purple-100 p-2.5 rounded-xl h-fit'>
                        <Icon icon="heroicons:clock" className='text-purple-700 w-6 h-6' />
                    </div>

                    <div className='flex flex-col'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-[16px] font-bold text-gray-900'>{shiftTitle}</h3>
                            {isDefault && (
                                <span className='bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-md font-medium'>
                                    Default
                                </span>
                            )}
                        </div>
                        <span className='text-xs text-gray-500 mt-0.5'>{shiftDetail}</span>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    {!isDefault && (
                        <button className='text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors'>
                            Set as Default
                        </button>
                    )}
                    <button className='p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors'>
                        <Icon icon="mi:delete" className='w-5 h-5' />
                    </button>
                </div>
            </div>

            {/* Days of Week Pills */}
            <div className='flex flex-row flex-wrap gap-2'>
                {days_of_week.map((day) => (
                    <div 
                        key={day} 
                        className='px-4 py-1.5 rounded-lg border border-purple-200 bg-white text-purple-600 text-xs font-medium'
                    >
                        {day}
                    </div>
                ))}
            </div>
            
        </div>
    );
};

export default ShiftCard;