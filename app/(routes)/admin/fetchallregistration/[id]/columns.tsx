"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Registration = {
  id: string;
  schoolId: number;
  schoolName: string;
  studentsLength: number;
  email: string;
  paymentProof?: PaymentProof[];
};
export type PaymentProof = {
  id: number;
  imageUrl: string;
};

type RegistrationProps = {
  registration: Registration; // Use the Contest type here
};
const RegistrationActions: React.FC<RegistrationProps> = ({ registration }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const handleView = () => {
    router.push(`/admin/viewallbyschool/${registration.id}`);
  };
  async function generatePdfBlob(students: Student[]) {
    const doc = <MyDocument students={students} />;

    const asPdf = pdf(doc); // Create an empty PDF instance
    const blob = await asPdf.toBlob();
    return blob;
  }
  const handleDownloadPdf = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/users/pdfdownload/${registration.id}`
      );
      const students: Student[] = response.data;
      const blob = await generatePdfBlob(students);
      saveAs(blob, "students.pdf");
    } catch (error) {
      console.error("Error downloading the PDF:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const handleDownloadPdfPuppeteer = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/pdf-generate/${registration.id}`, {
        responseType: "blob", // This tells Axios to expect a binary response
      });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", "students.pdf"); // or any other name
      document.body.appendChild(link);
      link.click();

      // Clean up and revoke the URL object
      URL.revokeObjectURL(link.href);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPdf}>
          Print Answer Sheets
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={handleDownloadPdfPuppeteer}>
          Download Answer sheet
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export const columns: ColumnDef<Registration>[] = [
  {
    accessorKey: "schoolId",
    filterFn: "equals",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          SchoolId
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "schoolName",
    header: "schoolName",
  },
  {
    accessorKey: "email",
    header: "email",
  },
  {
    accessorKey: "studentsLength",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Student
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "paymentProof", // This should match the key from your data
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Payment Proof
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    sortingFn: "basic",
    cell: ({ row }) => {
      // Access the paymentProof property of the row data
      const paymentProofs = row.original.paymentProof || []; // Fallback to an empty array if undefined
      return paymentProofs.length > 0 ? "P" : "NP";
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <RegistrationActions registration={row.original} />,
  },
];

const numColumns = 2; // Number of columns
const optionWidth = `${100 / numColumns}%`; // Calculate the width of each option

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
  },
  header: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: "bold",

    textAlign: "center",
    textTransform: "uppercase",
  },
  subHeaderBetween: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  studentInfo: {
    marginBottom: 4,
  },
  studentInfoRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 1,
  },
  studentInfoTitle: {
    fontSize: "50px !important",
    width: "100px",
    fontWeight: "black",
  },
  studentInfoContent: {
    fontSize: "50px !important",
    fontWeight: "black",
    marginLeft: "20px",
  },
  answerGrid: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: "black",
    padding: 10,
    // paddingVertical:
    // flex: 1,
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  answerRow: {
    flexDirection: "row",
    // justifyContent: "flex-start",
    width: "100%", // Set width for 3 columns
    paddingBottom: 10, // You can set padding for separation between rows
  },
  questionNumberBox: {
    width: "25px",
    height: "25px",
    marginRight: 14,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    borderRadius: "50%",
  },
  questionNumber: {},
  option: {
    fontSize: 13,
    fontWeight: "bold",
  },
  optionNumber: {
    fontSize: 15,
    marginTop: 2,
  },
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 5,
  },
  answerRowInst: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // marginBottom: "1px",
  },
  optionBox: {
    width: "14px",
    height: "14px",
    borderWidth: "1px",
    borderColor: "black",
    marginRight: "5px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionBoxForAnswers: {
    width: "25px",
    height: "25px",
    marginRight: 4,
    display: "flex",
    borderRadius: "50%",
    borderWidth: "2px",
    borderColor: "black",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  optionBoxLast: {
    width: "50px",
    height: "20px",
    borderWidth: "1px",
    borderColor: "black",

    marginRight: "5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative", // Needed to
  },
  optionText: {
    fontSize: 8,
    textAlign: "center",
  },
  correctFilling: {
    backgroundColor: "black",
  },
  wrongFilling: {
    // Style for wrong filling can include a cross, different color, etc.
    // This example just changes the border color to red
    borderColor: "red",
  },
  filledOption: {
    // When the option is filled incorrectly
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  instBox: {
    borderWidth: 1,
    padding: "10px",
    borderColor: "black",
    marginVertical: "20px",
  },
  cross: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  crossLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "blue",
    transform: "rotate(-45deg)", // Correctly formatted rotate transform
    // Rotate line to create an X
  },
  crossLineReverse: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "blue",
    transform: "rotate(45deg)", // Rotate line in the opposite direction to complete the X
  },
  tickContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tick: {
    position: "absolute",
    border: "2px solid blue", // Tick color
    borderTop: "none",
    borderRight: "none",
    width: "16px", // Adjust width as needed
    height: "8px", // Adjust height as needed
    transform: "rotate(-45deg)", // Rotate to create the tick shape
    marginBottom: "5px", // Push down to fit within the box
  },
  optionTextWrong: {
    fontSize: "10px",
    position: "relative",
    zIndex: "1",
  },
  circle: {
    width: "15px",
    height: "15px",
    position: "absolute",
    borderRadius: "50%",
    backgroundColor: "blue",
  },
  wrongFillingLast: {
    background: "linear-gradient(to right, black 50%, transparent 50%)",
    borderRight: "none", // Remove the border to make it look like a single box
  },
  // Add a right box style to remove the left border to continue the illusion
  rightBox: {
    borderLeft: "none",
  },
  gradientBox: {
    display: "flex",
    flexDirection: "row",
  },
  halfBlack: {
    width: "20px", // Half of the optionBox width
    height: "8px", // Same as the optionBox height
    backgroundColor: "black",
    top: "4px",
    left: "6px",
    position: "absolute",
  },
  wrongBox: {
    marginRight: "20px",
    marginVertical: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  correctBox: {
    marginTop: "4px",
    // marginVertical: "5px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: "20px",
  },
  // halfTransparent: {
  //   width: "15px", // Half of the optionBox width
  //   height: "30px", // Same as the optionBox height
  //   backgroundColor: "transparent",
  // },
});

interface Student {
  rollNumber: string;
  studentName: string;
  fatherName: string;
  studentLevel: string;
  studentClass: string; // Changed from `class` to `studentClass`
  schoolName: string | null;
  address: string | null;
  districtCode: string | null;
  schoolId: number;
}

interface MyDocumentProps {
  students: Student[];
}

const MyDocument: React.FC<MyDocumentProps> = ({ students }) => (
  <Document>
    {students.map((student, index) => (
      <Page size="A4" style={styles.page} key={index}>
        <Text style={styles.header}>
          International Kangaroo Mathematics Contest
        </Text>
        <Text style={styles.subHeaderBetween}>Answer Sheet</Text>

        <Text style={styles.subHeader}>
          {student.studentLevel == "preecolier" &&
            "PRE ECOLIER (Class 01 & 02)"}
          {student.studentLevel == "ecolier" && "ECOLIER (Class 03 & 04)"}
          {student.studentLevel == "benjamin" && "BENJAMIN (Class 05 & 06)"}
          {/* {student.studentLevel === "BENJAMIN" && "BENJAMIN(Class 05 & 06)"} */}
          {student.studentLevel == "cadet" && "CADET (Class 07 & 08)"}
          {student.studentLevel == "junior" && "JUNIOR (Class 09 & 10)"}
          {student.studentLevel == "student" && "STUDENT (Class 11 & 12)"}
        </Text>

        {/* Student Info */}
        <View style={styles.studentInfo}>
          {/* Repeat this View for each piece of student information */}
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Roll No</Text>
            <Text style={styles.studentInfoContent}>{student.rollNumber}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>District</Text>
            <Text style={styles.studentInfoContent}>
              {student.districtCode}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Student Name</Text>
            <Text style={styles.studentInfoContent}>{student.studentName}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Father Name</Text>
            <Text style={styles.studentInfoContent}>{student.fatherName}</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Class/Grade</Text>
            <Text style={styles.studentInfoContent}>
              {student.studentClass}
            </Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Institution Name</Text>
            <Text style={styles.studentInfoContent}>{student.schoolName}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Address</Text>
            <Text style={styles.studentInfoContent}>{student.address}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoTitle}>Institution Code</Text>
            <Text style={styles.studentInfoContent}>{student.schoolId}</Text>
          </View>

          {/* ... other student info rows */}
        </View>
        <View style={styles.instBox}>
          {/* Row with correct filling example */}
          <Text style={styles.optionText}>
            Choose only one of the five proposed answers[A,B,C,D,E] and fill in
            the box with your answer. Example of correctly filled table of
            answer is.
          </Text>
          <View style={styles.correctBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>
              <View style={[styles.optionBox, styles.correctFilling]}></View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Correct filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
                <View style={styles.cross}>
                  <View style={styles.crossLine}></View>
                  <View style={styles.crossLineReverse}></View>
                </View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>B</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>C</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
              {/* ... other options ... */}
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionTextWrong}>B</Text>
                <View style={styles.tick}></View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>C</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
          <View style={styles.wrongBox}>
            <View style={styles.answerRowInst}>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>A</Text>
              </View>
              <View style={[styles.gradientBox]}>
                <View style={styles.optionBox}>
                  <Text style={styles.optionText}>B</Text>
                </View>
                <View style={styles.halfBlack} />
                <View style={styles.optionBox}>
                  <Text style={styles.optionText}>C</Text>
                </View>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>D</Text>
              </View>
              <View style={styles.optionBox}>
                <Text style={styles.optionText}>E</Text>
              </View>
            </View>
            <Text style={styles.optionText}>Wrong filling</Text>
          </View>
        </View>
        {student.studentLevel === "preecolier" ||
        student.studentLevel === "ecolier" ? (
          <VerticalNumberGrid totalNumbers={24} />
        ) : (
          <VerticalNumberGrid totalNumbers={30} />
        )}

        {/* Answer Grid */}
        {/* <View style={styles.answerGrid}>
          {[...Array(30)].map((_, questionIndex) => (
            <View style={styles.answerRow} key={questionIndex}>
              <View style={styles.questionNumberBox}>
                <Text style={styles.option}>{questionIndex + 1}</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>A</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>B</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>C</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>D</Text>
              </View>
              <View style={styles.optionBoxForAnswers}>
                <Text style={styles.option}>E</Text>
              </View>
            </View>
          ))}
        </View> */}

        {/* Add other elements such as instructions, footer, etc. */}
      </Page>
    ))}
  </Document>
);

const generateVerticalNumbers = (totalNumbers: number, numColumns: number) => {
  const numRows = Math.ceil(totalNumbers / numColumns);
  const grid = Array.from({ length: numRows }, () =>
    new Array(numColumns).fill(null)
  );

  for (let number = 1; number <= totalNumbers; number++) {
    const colIndex = Math.floor((number - 1) / numRows);
    const rowIndex = (number - 1) % numRows;
    grid[rowIndex][colIndex] = number;
  }

  return grid;
};

// Render the numbers inside your PDF document
const VerticalNumberGrid = ({ totalNumbers = 30 }) => {
  const grid = generateVerticalNumbers(totalNumbers, 3);

  return (
    <View style={styles.answerGrid}>
      {grid.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginVertical: "1px",
          }}
        >
          {row.map((number, colIndex) => (
            <View key={colIndex} style={styles.answerRow}>
              <View style={styles.questionNumberBox}>
                {number && <Text style={styles.optionNumber}>{number}</Text>}
              </View>
              {/* Render the options A, B, C, D, E */}
              {number &&
                "ABCDE".split("").map((option) => (
                  <View key={option} style={styles.optionBoxForAnswers}>
                    <Text style={styles.option}>{option}</Text>
                  </View>
                ))}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

