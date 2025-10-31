"use client";

import { useState, useEffect } from "react";
import { getAllStudents, fetchAllPayments, getSchoolNames } from "@/services/schoolService";
import { School as SchoolType } from "@/services/schoolService";
import CountUp from "react-countup";

interface Payment {
  _id: string;
  totalAmount: number;
  [key: string]: unknown;
}

// ✅ Define Student interface
export interface Student {
  id: string;
  name: string;
  gender: string;
  class: string;
  examYear: string;
  paymentStatus: "Paid" | "Pending";
  onboardingStatus: "Onboarded" | "Not Onboarded";
}

// ✅ Define School interface with students typed
export interface School {
  _id: string;
  schoolName: string;
  status: string;
}

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  delay?: number;
}


function StatCard({ title, value, color, delay = 0 }: StatCardProps) {
  
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStartAnimation(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <p className="text-lg font-medium text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>
        {startAnimation ? (
          <CountUp end={value} duration={2} separator="," />
        ) : (
          "0"
        )}
      </p>
    </div>
  );
}

export default function StatsCards() {
const [schoolsLength, setSchoolLength] = useState(0)
const [approvedSchools, setApprovedSchools] = useState(0)
const [studentsLength, setStudentsLength] = useState(0)
const [paymentsLength, setPaymentsLength] = useState(0)
const [loading, setLoading] = useState(true)

 useEffect(() => {
    const fetchAllStats = async () => {
      try {
        // Fetch school stats
        const getSchoolStats = await getSchoolNames()
        console.log(getSchoolStats)
        const getApproved = getSchoolStats.filter((school: SchoolType) => school.status === "approved")
        setSchoolLength(getSchoolStats.length)
        setApprovedSchools(getApproved.length)
        
        // Fetch students
        const lengthOfStudents = await getAllStudents()
        console.log(lengthOfStudents.totalItems)
        setStudentsLength(lengthOfStudents.totalItems)
        
        // Fetch payments and calculate total amount
        const totalPayments = await fetchAllPayments();
        console.log(totalPayments.data)
        
        // Sum all totalAmount values from payments
        const totalPaymentAmount = totalPayments.data.reduce((sum: number, payment: Payment) => {
          return sum + (payment.totalAmount || 0);
        }, 0);
        
        setPaymentsLength(totalPaymentAmount)
        
        // Set loading to false when all data is fetched
        setLoading(false)
      } catch (error) {
        console.error('Error fetching stats:', error)
        setLoading(false)
      }
    }
    
    fetchAllStats()
 }, [])

  // const { schools, isLoading: loadingSchools } = useSchools(1, 1000);
  // const { applications, isLoading: loadingApps } = useApplications(
  //   undefined,
  //   "",
  //   1,
  //   1000
  // );

  // const loading = loadingSchools || loadingApps;

  // --- Calculate stats ---
 
  const stats = [
    {
      title: "Total Schools Registered",
      value: schoolsLength,
      color: "text-blue-600",
    },
    {
      title: "Total Approved",
      value: approvedSchools,
      color: "text-blue-600",
    },
    {
      title: "Total Students Onboarded",
      value: studentsLength,
      color: "text-blue-600",
    },
    {
      title: "Total Payments Collected (Naira)",
      value: paymentsLength,
      color: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={`${s.title}-${i}`}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse"
          >
            <div className="h-4 text-sm py-2 rounded w-3/4 font-bold mb-4">{s.title}</div>
            <div className="h-6 bg-gray-200 rounded mt-3 w-1/2"></div>
          </div>
        ))}
        
       
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((s, i) => (
        <StatCard
          key={s.title}
          title={s.title}
          value={s.value}
          color={s.color}
          delay={i * 200}
        />
      ))}
    </div>
  );
}
