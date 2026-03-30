import React from 'react'
import DashboardSummary from '@/components/DashboardSummary';
type Props = {}

export default function page({}: Props) {
  return (
    <div className='flex flex-row gap-4 w-full'>
      <DashboardSummary icon="mingcute:group-line" title="Total Employees" value={100} variant='blue'/>
      <DashboardSummary icon="mi:user-check" title="Total Checked In" value={80} variant='green'/>
      <DashboardSummary icon="tabler:user-bolt" title="Total Check Out" value={20} variant='red'/>
      <DashboardSummary icon="proicons:clock" title="Total Late" value={20} variant='orange'/>
    </div>
  )
}