import React, { useState } from "react";
import ReactDOM from "react-dom";

export default function Modal({ title, children, triggerText }) {
  const [open, setOpen] = useState(false);

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="text-gray-700 dark:text-gray-300">{children}</div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {triggerText && (
        <button
          onClick={() => setOpen(true)}
          className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {triggerText}
        </button>
      )}
      {open && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
}
