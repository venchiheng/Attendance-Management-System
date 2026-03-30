"use client"
import React, { useEffect, useState } from 'react' // 1. Added useEffect and useState
import { getEmployee } from '@/actions/employee'
import SearchBar from '@/components/SearchBar'
import InfoTable from '@/components/InfoTable'
import Selector from '@/components/Selector'
import CreateEmployee from '@/components/CreateEmployee'
import { Icon } from '@iconify/react'

type Props = {}

export default function Page({}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function loadEmployees() {
        setLoading(true);
        const data = await getEmployee();
        setEmployees(data);
        setLoading(false);
      }
      loadEmployees();
    }, []);

    const handleDelete = (row: any) => {  
      console.log("Delete", row);
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex w-full items-center gap-2">
            <SearchBar placeholder="Search employees..." />
            <Selector
              defaultValue="all"
              placeholder="Filter by Department"
              options={[
                { label: "All Departments", value: "all" },
                { label: "HR", value: "hr" },
                { label: "Engineering", value: "engineering" },
                { label: "AI Engineer", value: "ai-engineer" },
                { label: "Marketing", value: "marketing" },
                { label: "Creative Design", value: "create-design" },
              ]}
            />
          </div>
        </div>
        
        <InfoTable
          title='Employee List'
          columns={[
            { label: "Name", key: "name" },
            { label: "NFC Card", key: "nfc_id" },
            { label: "Position", key: "position" },
            { label: "Department", key: "department" },
            { label: "Join Date", key: "hireDate" },
            { label: "Work Mode", key: "workMode" },
            { label: "Employment Type", key: "type" },
            { label: "Actions", key: "actions", render: (row) => (
              <div className="flex gap-2">
                <button className="btn btn-sm btn-ghost text-blue-600" onClick={() => setIsModalOpen(true)}>
                  <Icon icon={"lucide:edit"} className='w-4 h-4'></Icon>
                </button>
                <button className="btn btn-sm btn-ghost text-red-600 " onClick={() => handleDelete(row)}>
                  <Icon icon={"mi:delete"} className='w-4 h-4'></Icon>
                </button>
              </div>
             )},
          ]}
          // 4. Pass the dynamic state here
          rows={employees} 
        />
        
        {loading && <div className="text-center py-4">Loading employees...</div>}

        <CreateEmployee isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} action='edit'/>
      </div>
    )
}