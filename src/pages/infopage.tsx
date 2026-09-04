// src/pages/infopage.ts

import { Button } from "@/components/ui/button";
import React from "react";
import { useNavigate } from "react-router-dom";
import pixelShrinkIcon from "@/assets/pixel_shrink.webp";

const InfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirect to the home page
  };

  return (
    <div className="flex flex-col items-center justify-center   bg-gray-100 dark:bg-black h-screen">
      <img
        src={pixelShrinkIcon}
        alt="Pixel Shrink"
        className="h-64 w-64 rounded-2xl shadow-lg mb-4"
      />
      <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
        Pixel Shrink v1.0
      </h1>
      <h2 className="mt-4 text-2xl font-semibold">
        Image Converter and Optimizer
      </h2>
      <p className="mt-2 text-gray-600 dark:text-white">
        © 2026 oocak. All rights reserved.
      </p>
      <p className="mt-2 text-gray-600 dark:text-white">
        https://www.oocak.com
      </p>
      <Button onClick={handleGoHome} className="mt-6">
        Go to Home
      </Button>
    </div>
  );
};

export default InfoPage;
