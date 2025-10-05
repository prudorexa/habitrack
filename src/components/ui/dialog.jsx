import React from "react";

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        {children}
      </div>
    </div>
  );
};
