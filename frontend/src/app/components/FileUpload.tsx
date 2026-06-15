/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useRef } from "react";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export default function FileUpload({ onUpload, isUploading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith(".xlsx")) {
      setError("Invalid file type. Please upload an .xlsx file.");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("File is too large. Maximum size is 50MB.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        onUpload(file);
      }
    },
    [onUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div
        className={`dropzone p-12 text-center ${isDragOver ? "drag-over" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload Excel file"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleInputChange}
          className="hidden"
          id="file-upload"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            {/* Animated spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-400 animate-spin-slow" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-cyan-400 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "2s" }} />
            </div>
            <p className="text-white/70 font-medium">
              Analyzing dataset...
            </p>
            <p className="text-white/40 text-sm">
              Running statistical computations
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Upload icon */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDragOver ? "gradient-emerald" : "bg-white/5"} transition-all duration-300`}>
              <svg
                className={`w-8 h-8 transition-all duration-300 ${isDragOver ? "text-white scale-110" : "text-white/40"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <div>
              <p className="text-white/80 font-medium mb-1">
                {isDragOver
                  ? "Drop your file here"
                  : "Drag & drop your KoboToolbox export"}
              </p>
              <p className="text-white/40 text-sm">
                or click to browse • .xlsx files only
              </p>
            </div>

            {selectedFile && !error && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-emerald-300 text-sm font-medium">
                  {selectedFile.name}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/20 animate-fade-in-up">
          <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-rose-300 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
