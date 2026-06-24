
import React, { useState, useRef } from "react";

export const UploadVideo = ({ onClose, onUploadComplete }) => {
  // UI Interaction States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState("idle"); // idle | signing | uploading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  // Data States
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // --- Drag and Drop Handlers ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setSelectedFile(file);
        setUploadState("idle");
        setErrorMessage("");
      } else {
        setErrorMessage("Please select a valid video file.");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadState("idle");
      setErrorMessage("");
    }
  };

  // --- Utility ---
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- API Logic ---
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState("signing");
      setErrorMessage("");

      // 1. Get Signature
      const signRes = await fetch("http://localhost:5000/api/uploadsignature", {
        credentials: "include"
      });

      if (!signRes.ok) throw new Error("Failed to authenticate upload.");
      const auth = await signRes.json();

      // 2. Prepare Form Data
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("timestamp", auth.timestamp);
      fd.append("signature", auth.signature);
      fd.append("api_key", auth.apiKey);
      fd.append("folder", auth.folder);

      setUploadState("uploading");

      // 3. Upload to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${auth.cloudName}/video/upload`,
        {
          method: "POST",
          body: fd
        }
      );

      const data = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(data.error?.message || "Upload to cloud failed.");
      }

      setUploadState("success");

      const thumbnailUrl = `https://res.cloudinary.com/${auth.cloudName}/video/upload/so_1/${data.public_id}.jpg`;


      // Optional: trigger a callback to parent component with the secure_url
      data.thumbnailUrl = thumbnailUrl;
      onUploadComplete(data);

    } catch (error) {
      console.error(error);
      setUploadState("error");
      setErrorMessage(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 transition-all">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl ring-1 ring-gray-200 animate-in fade-in zoom-in-95 duration-200">

        {/* Header & Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Video Solution</h2>
            <p className="text-sm text-gray-500 mt-1">Submit your Spark response.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Banners */}
        {uploadState === 'error' && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200 flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
            {errorMessage}
          </div>
        )}

        {uploadState === 'success' && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 border border-green-200 flex items-center gap-2">
            <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM16.707 5.293a1 1 0 00-1.414 0L9 11.586 4.707 7.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
            Video uploaded successfully!
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative mt-2 flex cursor-pointer justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-all ${isDragging
              ? "border-orange-500 bg-orange-50"
              : selectedFile
                ? "border-gray-300 bg-gray-50 hover:bg-gray-100"
                : "border-gray-300 px-6 py-14 hover:border-orange-400 hover:bg-gray-50"
            }`}
        >
          <input
            type="file"
            accept="video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            disabled={uploadState === 'uploading' || uploadState === 'signing'}
          />

          <div className="text-center">
            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="rounded-full bg-orange-100 p-3 mb-3 text-orange-600">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                {uploadState === 'idle' && (
                  <p className="text-xs text-orange-600 mt-3 font-medium hover:underline">Click to change file</p>
                )}
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                  <span className="relative cursor-pointer rounded-md bg-transparent font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500">
                    Upload a file
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-500 mt-1">MP4, WebM, or MOV up to 100MB</p>
              </>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            disabled={!selectedFile || uploadState === 'uploading' || uploadState === 'signing' || uploadState === 'success'}
            onClick={handleUpload}
            className="inline-flex w-32 items-center justify-center rounded-xl bg-orange-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {(uploadState === 'signing' || uploadState === 'uploading') ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {uploadState === 'signing' ? 'Preparing...' : 'Uploading...'}
              </>
            ) : uploadState === 'success' ? (
              'Done'
            ) : (
              'Upload Video'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

