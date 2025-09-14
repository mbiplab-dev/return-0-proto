// PhoneFrame.tsx
import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="
        w-[360px] 
        h-[90vh] max-h-[800px]
        bg-white rounded-[2.5rem] shadow-xl border-4 border-gray-300 
        relative overflow-hidden
      ">
        <div className="h-full overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
};

export default PhoneFrame;
