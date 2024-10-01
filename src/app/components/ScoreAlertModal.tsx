import React, { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-gray-600 text-6xl" onClick={onClose}>
          &times;
        </button>
        {/* Modal Content */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
