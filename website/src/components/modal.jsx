import React, { useState } from "react";

export default function Modal({ title, children, triggerText }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 bg-gray-400 text-black rounded-lg hover:bg-gray-600"
      >
        {triggerText}
      </button>

      {/* Modal */}
      {open && (
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
      )}
    </>
  );
}
