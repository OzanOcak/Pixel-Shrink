// src/pages/infopage2.ts

import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";

const InfoPage2: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirect to the home page
  };

  return (
    <div className="flex flex-col items-center justify-center  h-screen bg-gray-100">
      <h1 className="text-center text-6xl font-bold text-green-600">
        Registration Successful!
      </h1>
      <h2 className="mt-4 text-2xl font-semibold">Activate Your Account</h2>
      <p className="mt-2 text-gray-600">
        A verification email has been sent to your email address. Please check
        your inbox and follow the instructions to activate your account.
      </p>
      <p className="mt-2 text-gray-600">
        If you don't see the email in your inbox, please check your spam folder
        or try resending the verification email.
      </p>
      <Button onClick={handleGoHome} className="mt-6">
        Go to Home
      </Button>
    </div>
  );
};

export default InfoPage2;
