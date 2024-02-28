"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export type Contest = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  contestDate: string;
};

type ContestActionsProps = {
  contest: Contest; // Use the Contest type here
};
const ContestActions: React.FC<ContestActionsProps> = ({ contest }) => {
  const router = useRouter();
  const [isDisable, setIsDisable] = useState<boolean>();
  useEffect(() => {
    const currentDate = new Date();
    // Split the contest.endDate string and rearrange it into a valid format
    const dateParts = contest.endDate.split("/"); // splits "16/02/24 Fri" into ["16", "02", "24 Fri"]
    const year = `20${dateParts[2].slice(0, 2)}`; // takes "24" and turns it into "2024"
    const month = dateParts[1]; // month is "02"
    const day = dateParts[0]; // day is "16"

    // Construct a new date string in a format the Date constructor can understand
    // Note: Months are 0-indexed in JavaScript Date, so subtract 1 from the month
    const formattedDate = `${year}-${month}-${day}`; // "2024-02-16"

    // Convert formatted date string to Date object
    const contestEndDate = new Date(formattedDate);

    // Check if the current date is past the contest end date
    const isContestEnded = currentDate > contestEndDate;
    setIsDisable(isContestEnded);
  }, [contest.endDate]);
  const handleRegister = () => {
    console.log(isDisable);
    router.push(`/user/enrollstudents/${contest.id}`);
  };
  const handleView = () => {
    router.push(`/user/viewregistered/${contest.id}`);
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
        <DropdownMenuItem onClick={handleRegister}>
          Register Students
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Contest>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "startDate",
    header: "Registration Start",
  },
  {
    accessorKey: "endDate",
    header: "Registration End",
  },
  {
    id: "actions",
    cell: ({ row }) => <ContestActions contest={row.original} />,
  },
];
