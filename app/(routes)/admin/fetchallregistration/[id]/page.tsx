"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Registration, columns, PaymentProof } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

// Define a type for Registration, including the students array
type Register = {
  id: string;
  students: Student[];
};
interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  level: string;
  class: string; // Changed from `class` to `studentClass`
  schoolName: string | null;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}
type LevelCounts = Record<string, number>;

interface RegistrationWithPaymentProof extends Registration {
  paymentProof: PaymentProof[];
}
const FetchAllRegistrations = () => {
  const params = useParams();
  const [data, setData] = useState<Registration[]>([]);
  const [excel, setExcel] = useState([]); // This makes sure `excel` is an array

  const [totalSchools, setTotalSchools] = useState<number>(0);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [preEculier, setPreEculier] = useState<number>(0);
  const [totalPaymentDone, setTotalPaymentDone] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        `/api/users/fetchallregistrations/${params.id}`
      );

      const registrations = res.data;
      setTotalSchools(res.data.length);
      console.log(res.data.length);
      const totalPayments = registrations.reduce(
        (acc: number, curr: Registration) => {
          return (
            acc + (curr.paymentProof && curr.paymentProof.length > 0 ? 1 : 0)
          );
        },
        0
      );

      setTotalPaymentDone(totalPayments); //

      const studentsArrays = registrations.map((reg: Register) => reg.students);
      const flattenedStudents = studentsArrays.flat();

      // Flatten the array of students arrays into a single array of students
      setAllStudents(flattenedStudents);

      // Count students at each level
      const levelCounts = flattenedStudents.reduce(
        (acc: LevelCounts, student: Student) => {
          const { level } = student;
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        },
        {}
      );

      // Set state for each level
      setPreEculier(levelCounts["preecolier"] || 0);
      setEculier(levelCounts["ecolier"] || 0);
      setBenjamin(levelCounts["benjamin"] || 0);
      setCadet(levelCounts["cadet"] || 0);
      setJunior(levelCounts["junior"] || 0);
      setStudent(levelCounts["student"] || 0);
      console.log(res.data);

      const studentsForExcel = registrations.flatMap((reg: any) =>
        reg.students.map((student: Student) => ({
          bankTitle: reg.user?.bankTitle,
          contactNumber: reg.user?.contactNumber,
          schoolAddress: reg.user?.schoolAddress,
          district: reg.user?.district,
          tehsil: reg.user?.tehsil,
          fax: reg.user?.fax,
          p_fName: reg.user?.p_fName,
          p_mName: reg.user?.p_mName,
          p_lName: reg.user?.p_lName,
          p_contact: reg.user?.p_contact,
          p_phone: reg.user?.p_phone,
          p_email: reg.user?.p_email,
          c_fName: reg.user?.c_fName,
          c_mName: reg.user?.c_mName,
          c_lName: reg.user?.c_lName,
          c_contact: reg.user?.c_contact,
          c_phone: reg.user?.c_phone,
          c_email: reg.user?.c_email,
          c_accountDetails: reg.user?.c_accountDetails,
          userEmail: reg.user?.email,
          ...student, // Spread student attributes
        }))
      );
      setExcel(studentsForExcel);
      console.log(studentsForExcel);
      setData(res.data);
      const extractedData = res.data.map((obj: any) => ({
        contestId: obj.contestId,
        schoolName: obj.schoolName,
        schoolId: obj.schoolId,
        id: obj.id,
        registeredBy: obj.registeredBy,
        studentsLength: obj.students.length,
        email: obj.user.email,
        paymentProof: obj.paymentProof, // This assumes paymentProof is within the user object
      }));

      setData(extractedData);
    };
    fetchData();
  }, []);
  const handleClick = () => {
    if (excel.length > 0) {
      const ws = XLSX.utils.json_to_sheet(excel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `data.xlsx`);
    } else {
      console.log("No data available to export");
    }
  };
  
  return (
    <>
      <div className="container mx-auto py-10">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
            <div className="bg-purple-600 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Registered Students</h2>
              <p className="text-lg font-semibold">{allStudents.length}</p>
              <h2 className="font-bold text-2xl mb-4">Registered Schools</h2>
              <p className="text-lg font-semibold">{totalSchools}</p>
              <h2 className="font-bold text-2xl mb-4">Total Payments</h2>
              <p className="text-lg font-semibold">{totalPaymentDone}</p>
            </div>
          </div>
          <div className="w-full md:w-1/2 px-2">
            <div className="bg-purple-600 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Levels</h2>
              <ul>
                <li className="mb-2 text-lg font-medium">
                  Total # of Preecolier:{" "}
                  <span className="font-bold">{preEculier}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Ecolier:{" "}
                  <span className="font-bold">{eculier}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Benjamin:{" "}
                  <span className="font-bold">{benjamin}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Cadet: <span className="font-bold">{cadet}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Junior: <span className="font-bold">{junior}</span>
                </li>
                <li className="mb-2 text-lg font-medium">
                  Total # of Student:{" "}
                  <span className="font-bold">{student}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-300">
          <Button className="" onClick={handleClick}>
            Export Data
          </Button>
        </div>
        <DataTable columns={columns} data={data} />;
      </div>
    </>
  );
};

export default FetchAllRegistrations;
