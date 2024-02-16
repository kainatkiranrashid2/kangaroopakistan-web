"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { getSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Brackets } from "lucide-react";
interface StudentData {
  studentName: string;
  fatherName: string;

  level: string;
  class: string;
}

interface FormData {
  students: StudentData[];
}
// const rollNumberRegex = /^\d{2}-\d+-\d+-\d{2}-\d{3}-[A-Za-z]+$/; // Adjust this regex as needed

const schema = zod.object({
  students: zod.array(
    zod.object({
      studentName: zod.string().min(1, "Student name is required"),
      fatherName: zod.string().min(1, "Father's name is required"),
      // rollNumber: zod
      //   .string()
      //   .regex(rollNumberRegex, "Roll number must be in the correct format"),
      level: zod.string().min(1, "Pls select level"),
      class: zod
        .string()
        .min(1, "Pls select class, it is necessory for roll number"),
    })
  ),
});

const Register = () => {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track if the form is submitting

  const [contestCh, setContestCh] = useState<string | null>();
  const [schoolId, setSchoolId] = useState<number | undefined>();
  const [schoolEmail, setSchoolEmail] = useState<number | undefined | null>();
  const [district, setDistrict] = useState<string | undefined | null>();
  const [registerationId, setRegistrationId] = useState<
    string | undefined | null
  >();

  const [year, setYear] = useState<string | undefined>();
  const [schoolName, setSchoolName] = useState<string | undefined>();

  useEffect(() => {
    const getYearInTwoDigits = (date: Date): string => {
      return new Intl.DateTimeFormat("en-US", {
        year: "2-digit",
      }).format(date);
    };

    const fetch = async () => {
      const resp = await axios.get(`/api/users/contests/${params.id}`);

      setContestCh(resp.data.contestCh);
      const endDate = new Date(resp.data.endDate);
      const contestYear = getYearInTwoDigits(endDate);
      setYear(contestYear);
      const session = await getSession();
      const response = await axios.get(
        `/api/users/getuserbyemail/${session?.user.email}`
      );
      const regId = await axios.get(
        `/api/users/contests/${params.id}/${response.data.schoolId}`
      );
      setRegistrationId(regId.data.id);
      setDistrict(response.data.district);
      setSchoolName(response.data.schoolName);
      setSchoolId(response.data.schoolId);
      setSchoolEmail(response.data.id);
    };
    fetch();
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      students: [
        {
          studentName: "",
          fatherName: "",
          // rollNumber: "",
          level: "",
          class: "",
        },
      ],
    },
  });

  const isDuplicate = (formData: FormData, index: number) => {
    const currentName = formData.students[index].studentName;
    const currentFatherName = formData.students[index].fatherName;

    for (let i = 0; i < index; i++) {
      const prevName = formData.students[i].studentName;
      const prevFatherName = formData.students[i].fatherName;

      if (currentName === prevName && currentFatherName === prevFatherName) {
        return true;
      }
    }

    return false;
  };
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const hasDuplicates = data.students.some((student, index) =>
      isDuplicate(data, index)
    );

    if (hasDuplicates) {
      // Set error message for duplicate fields.
      setDuplicateError("Name and Father's name must be unique");
    } else {
      // Proceed with form submission
      const studentsArray = data.students;
      const payload = {
        students: studentsArray,
        year: year,
        district: district,
        registrationId: registerationId,
        contestCh: contestCh,
        schoolName: schoolName,
        schoolId: schoolId,
        registeredBy: schoolEmail,
      };
      try {
        const response = await axios.post(
          `/api/users/contests/${params.id}/registrations`,
          payload
        );

        router.push(`/user/viewregistered/${params.id}`);
        toast.success("🦄 Student registered successfully", {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setIsSubmitting(false);

        // Handle successful registration creation
      } catch (error) {
        toast.error("Error creating registration ", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        console.error("Error creating registration:", error);
        setIsSubmitting(false);

        // Handle errors appropriately
      }

      setDuplicateError(null); // Clear any previous error
    }
  };
  const { fields, append, remove } = useFieldArray({
    control,
    name: "students",
  });

  const handleClassChange = (classValue: string, index: number) => {
    let levelValue = "";
    switch (classValue) {
      case "01":
      case "02":
        levelValue = "preecolier";
        break;
      case "03":
      case "04":
        levelValue = "ecolier";
        break;
      case "05":
      case "06":
        levelValue = "benjamin";
        break;
      case "07":
      case "08":
        levelValue = "cadet";
        break;
      case "09":
      case "10":
        levelValue = "junior";
        break;
      case "11":
      case "12":
        levelValue = "student";
        break;
      // Add more cases if needed
      default:
        break;
    }
    setValue(`students.${index}.level`, levelValue);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto p-4 border border-gray-300 rounded-lg"
    >
      {duplicateError && <p className="text-red-500">{duplicateError}</p>}
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="mb-4 p-2 border-solid border-2 border-grey-600 "
        >
          <div className="grid items-center lg:space-x-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="md:mr-4 lg:mr-0">
              <input
                {...register(`students.${index}.studentName`)}
                placeholder="Student Name"
                className="w-full p-2 text-sm md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500"
              />
              {errors?.students?.[index]?.studentName && (
                <p className="text-red-500">
                  {errors.students[index]?.studentName?.message}
                </p>
              )}
            </div>
            <div className="mt-3 md:mt-0">
              <input
                {...register(`students.${index}.fatherName`)}
                placeholder="Father's Name"
                className="w-full p-2 rounded border text-sm md:text-base border-gray-300 focus:outline-none focus:border-blue-500"
              />
              {errors?.students?.[index]?.fatherName && (
                <p className="text-red-500">
                  {errors.students[index]?.fatherName?.message}
                </p>
              )}
            </div>
            <div className="mt-3 lg:mt-0 md:mr-4 lg:mr-0">
              <Controller
                name={`students.${index}.class`}
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e); // Important: update the form state
                      handleClassChange(e.target.value, index); // Update the level based on the class
                    }}
                    className="w-full p-2 text-xs md:text-base rounded border border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">SELECT CLASS</option>
                    <option value="01">ONE</option>
                    <option value="02">TWO</option>
                    <option value="03">THREE</option>
                    <option value="04">FOUR</option>
                    <option value="05">FIVE</option>
                    <option value="06">SIX</option>
                    <option value="07">SEVEN</option>
                    <option value="08">EIGHT/O LEVEL-I</option>
                    <option value="09">NINE/O LEVEL-I & II</option>
                    <option value="10">TEN/O LEVEL-II & III</option>
                    <option value="11">ELEVEN/O LEVEL-III & A LEVEL-I</option>
                    <option value="12">TWELVE/A LEVEL-I & II</option>
                  </select>
                )}
              />
              {errors?.students?.[index]?.class && (
                <p className="text-red-500">
                  {errors.students[index]?.class?.message}
                </p>
              )}
            </div>
            <div className="mt-3 lg:mt-0">
              <Controller
                name={`students.${index}.level`}
                control={control}
                render={({ field }) => (
                  <select
                    disabled
                    {...field}
                    className="w-full p-2 rounded border text-xs md:text-base border-gray-300 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">SELECT LEVEL</option>
                    <option value="preecolier">PRE ECOLIER</option>
                    <option value="ecolier">ECOLIER</option>
                    <option value="benjamin">BENJAMIN</option>
                    <option value="cadet">CADET</option>
                    <option value="junior">JUNIOR</option>
                    <option value="student">STUDENT</option>
                  </select>
                )}
              />
              {errors?.students?.[index]?.level && (
                <p className="text-red-500">
                  {errors.students[index]?.level?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <div className="block sm:flex sm:justify-center space-x-2 sm:space-x-4 mt-4 mx-auto">
        <div className="flex justify-center sm:block gap-5 sm:space-x-4">
          <button
            type="button"
            onClick={() =>
              append({
                studentName: "",
                fatherName: "",
                level: "",
                class: "",
              })
            }
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 text-xs sm:text-base sm:px-4 sm:py-2 rounded"
          >
            Add Another Student
          </button>
          <button
            type="button"
            onClick={() => remove(fields.length - 1)}
            className="bg-red-500 hover:bg-red-600 text-white p-3 text-xs sm:text-base sm:px-4 sm:py-2 rounded"
          >
            Remove Student
          </button>
        </div>
        <div className="flex justify-center sm:block mt-4 sm:mt-0">
          <button
            type="submit"
            disabled={isSubmitting} // Disable the button if isSubmitting is true
            className=" bg-green-500 hover:bg-green-600 text-white p-3 text-xs sm:text-base sm:px-4 sm:py-2 rounded"
          >
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default Register;
