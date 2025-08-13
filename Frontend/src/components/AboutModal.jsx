import React from "react";

const AboutModal = ({ title, content, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">

            <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full relative ">
                <button onClick={onClose} className="absolute top-2 right-4 text-xl font-bold">
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="text-gray-700 whitespace-pre-line">{content}</p>
            </div>
        </div>
    );
};

export default AboutModal;
