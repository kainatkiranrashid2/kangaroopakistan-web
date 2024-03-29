"use client";
import axios from "axios";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { Student, columns } from "./columns";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import SchoolReportDocument from "./SchoolReportDocument";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

type ProfileData = {
  p_fName: string;
  p_mName: string;
  p_lName: string;
  c_fName: string;
  c_mName: string;
  c_lName: string;
  email: string;
  contactNumber: string;
};

const ViewRegistered = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const { onOpen } = useModal();
  const router = useRouter();
  const [registrationId, setRegistrationId] = useState<string>();
  const [preEculier, setPreEculier] = useState<number>(0);
  const [totalPaymentDone, setTotalPaymentDone] = useState<number>(0);
  const [eculier, setEculier] = useState<number>(0);
  const [benjamin, setBenjamin] = useState<number>(0);
  const [cadet, setCadet] = useState<number>(0);
  const [junior, setJunior] = useState<number>(0);
  const [student, setStudent] = useState<number>(0);

  const params = useParams();
  type LevelCounts = Record<string, number>;

  useEffect(() => {
    const fetch = async () => {
      try {
        const session = await getSession();

        const response = await axios.get(
          `/api/users/getuserbyemail/${session?.user.email}`
        );

        const regId = await axios.get(
          `/api/users/contests/${params.id}/${response.data.schoolId}`
        );

        setRegistrationId(regId.data.id);
        const registeredStudents = await axios.get(
          `/api/users/contests/${params.id}/registrations/${regId.data.id}`
        );
        console.log(registeredStudents);
        const levelCounts = registeredStudents.data.reduce(
          (acc: LevelCounts, student: Student) => {
            const { level } = student;
            acc[level] = (acc[level] || 0) + 1;
            return acc;
          },
          {}
        );
        console.log(levelCounts);
        setPreEculier(levelCounts["preecolier"] || 0);
        setEculier(levelCounts["ecolier"] || 0);
        setBenjamin(levelCounts["benjamin"] || 0);
        setCadet(levelCounts["cadet"] || 0);
        setJunior(levelCounts["junior"] || 0);
        setStudent(levelCounts["student"] || 0);
        console.log(registeredStudents.data);
        setStudents(registeredStudents.data);
        const paymentProof = await axios.get(
          `/api/users/paymentproof/${regId.data.id}`
        );
        setTotalPaymentDone(paymentProof.data.length);
        console.log("paymentProof");
        console.log(paymentProof);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetch();
  }, []);
  const handleClick = () => {
    router.push(`/user/viewallrecipts/${registrationId}`);
  };
  const handleBack = () => {
    router.back();
  };
  const handleSheet = async () => {
    try {
      const response = await axios.get(
        `/api/users/pdfdownload/${registrationId}`
      );

      const res = await axios.get(
        `/api/users/allusers/getschoolbyregid/${registrationId}`
      );
      console.log("res");
      console.log(res.data.user.p_fName);
      const profileData: ProfileData = {
        p_fName: res.data.user.p_fName,
        p_mName: res.data.user.p_mName,
        p_lName: res.data.user.p_lName,
        c_fName: res.data.user.c_fName,
        c_mName: res.data.user.c_mName,
        c_lName: res.data.user.c_lName,
        email: res.data.user.email,
        contactNumber: res.data.user.contactNumber,
      };

      console.log(response.data);
      const schoolData = response.data;
      console.log("schoolData"); // This should be an array of ClassData
      console.log(schoolData); // This should be an array of ClassData
      const blob = await pdf(
        <SchoolReportDocument
          schoolData={schoolData}
          profileData={profileData}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "school-report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating the PDF:", error);
    }
  };
  return (
    <div className="container mx-auto py-4">
      <div className="container mx-auto py-4">
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-6 md:mb-0">
            <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
              <h2 className="font-bold text-2xl mb-4">Total Students</h2>
              <p className="text-lg font-semibold">{students.length}</p>
              <h2 className="font-bold text-2xl mb-4">Payment Proof</h2>
              <p className="text-lg font-semibold">
                {totalPaymentDone === 0
                  ? "No payment proof  uploaded"
                  : "Payment Done"}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 px-2">
            <div className="bg-purple-400 rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105">
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
        <div className="flex flex-wrap justify-end mt-4">
          <Button
            className="w-full sm:w-auto mx-2 my-1 sm:my-0"
            onClick={handleClick}
          >
            View All Proof of Payments
          </Button>
          <Button
            className="w-full sm:w-auto mx-2 my-1 sm:my-0"
            onClick={handleSheet}
          >
            Download student Data
          </Button>
          <Button
            className="w-full sm:w-auto mx-2 my-1 sm:my-0"
            onClick={() => onOpen("addImage", { registrationId })}
          >
            Add Proof of Payment
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end">
        <Button variant="default" className="mb-2 sm:mb-0" onClick={handleBack}>
          Back
        </Button>
        <Button
          variant="ghost"
          className="w-full sm:w-auto text-center sm:text-left text-xl font-bold leading-tight tracking-tight text-purple-600 md:text-3xl mb-2 sm:mb-0"
          onClick={() => onOpen("addImage", { registrationId })}
        >
          Attach Proof of Payment
        </Button>
      </div>

      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={students} />
      </div>
    </div>
  );
};

export default ViewRegistered;
