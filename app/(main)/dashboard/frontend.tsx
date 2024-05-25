"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import axios from "axios";
import images from "@/public/images.jpg";
import { getSession } from "next-auth/react";
import Image from "next/image";

interface UserData {
  email: string;
  role: string;
  schoolId: number;
  schoolName: string;
  contactNumber: string;
  schoolAddress: string;
  district: string;
  tehsil: string;
  fax: string;
  p_fName: string;
  p_mName: string;
  p_lName: string;
  p_contact: string;
  p_phone: string;
  p_email: string;
  c_fName: string;
  c_mName: string;
  c_lName: string;
  c_contact: string;
  c_phone: string;
  c_email: string;
  c_accountDetails: string;
}

const Frontend = () => {
  const router = useRouter();

  const { onOpen } = useModal();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mySession, setMySession] = useState<string | null>();
  const [role, setRole] = useState<string | null>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [flash, setFlash] = useState<{
    show: boolean;
    message: string;
    type: "info" | "success" | "error";
  } | null>(null);

  const showFlashMessage = () => {
    setFlash({
      show: true,
      message: "This is a flash message!",
      type: "success",
    });
    setTimeout(() => setFlash(null), 3000);
  };

  const [contestTypes, setContestTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      setMySession(session?.user.id);
      setRole(session?.user.role);
      axios
        .get(`/api/users/profile/${session?.user.id}`)
        .then((response) => {
          setUserData(response.data as UserData);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
      const response = await axios
        .get(`/api/users/notificationimage/`)
        .then((resp) => {
          console.log(resp.data.imageUrl);
          setImageUrl(resp.data.imageUrl);
        })
        .catch((error) => {
          console.error("Error fetching image data:", error);
          setLoading(false);
        });
    };
    fetchData();
  }, []);
  const handleProfile = () => {
    if (mySession && role === "User") {
      router.push(`/user/profile/${mySession}`);
    }
    if (mySession && role === "Admin") {
      router.push(`/admin/profile/${mySession}`);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl text-center my-3 font-bold text-purple-600">
        Notice Board
      </h1>
      <Ticker message="This is a moving message! Stay tuned for more updates." />

      <div className="flex justify-end mt-2">
        <Button variant="default" onClick={() => onOpen("upload-notification")}>
          Upload Image for Notification
        </Button>
      </div>
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mx-auto py-10">
        <div className="flex-1 bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4">
            <h2 className="text-md md:text-lg lg:text-2xl font-semibold text-gray-800">
              {userData?.schoolName}
            </h2>
            <div className="mt-4">
              <p className="text-gray-700 text-sm md:text-base lg:text-lg">
                {userData?.email}
              </p>
              <p className="text-gray-700 text-sm md:text-base lg:text-lg">
                {userData?.contactNumber}
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-300">
            <Button
              className="text-sm md:text-base lg:text-lg"
              onClick={showFlashMessage}>
              View Profile
            </Button>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt="Notification"
              layout="fill"
              objectFit="cover" // Change to "contain" if you do not want the image to be cropped
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Frontend;

interface TickerProps {
  message: string; // Define the type of 'message' as string
}
const Ticker: React.FC<TickerProps> = ({ message }) => {
  return (
    <div className="ticker-wrap">
      <div className="ticker-move">{message}</div>
    </div>
  );
};
