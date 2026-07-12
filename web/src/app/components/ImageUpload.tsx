"use client"

import type React from "react"
import Image from "next/image"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import LoadingScreen from "./LoadingScreen"
import TextBox from "./TextBox"

export default function ImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [soundEffects, setSoundEffects] = useState([])
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    if (!file) return
    setError(null)
    setIsUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      setSoundEffects(result.fx)
      setIsUploading(false)
      setIsUploaded(true)
    } catch (e) {
      console.error("Upload failed:", e)
      setError("Something went wrong. Please try again.")
      setIsUploading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    handleUpload(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  })

  const handleReset = () => {
    setIsUploaded(false)
    setIsUploading(false)
    setSoundEffects([])
    setPreview(null)
    setError(null)
  }

  if (isUploading) {
    return (
      <div className="glow-purple bg-gray-900/80 border border-purple-500/30 rounded-2xl w-full">
        {preview && (
          <div className="relative w-full h-40 rounded-t-2xl overflow-hidden">
            <Image src={preview} alt="Uploaded screenshot" fill className="object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90" />
          </div>
        )}
        <LoadingScreen />
      </div>
    )
  }

  if (isUploaded) {
    return (
      <div className="space-y-4">
        <TextBox soundEffects={soundEffects} preview={preview} />
        <button
          onClick={handleReset}
          className="w-full py-2 text-sm text-gray-500 hover:text-purple-400 transition-colors"
        >
          ↩ Analyze another screenshot
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        relative scanlines card-hover cursor-pointer
        bg-gray-900/70 backdrop-blur-sm
        border-2 border-dashed rounded-2xl
        p-10 text-center transition-all duration-300
        ${isDragActive
          ? "border-purple-400 bg-purple-900/20 shadow-lg shadow-purple-900/30"
          : "border-gray-700 hover:border-purple-600/70 hover:bg-gray-900/90"
        }
      `}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div className="mx-auto mb-6 relative w-20 h-20">
        <div className={`absolute inset-0 rounded-full bg-purple-900/40 transition-all duration-300 ${isDragActive ? "scale-125 opacity-80" : "scale-100 opacity-50"}`} />
        <div className="relative flex items-center justify-center w-full h-full">
          <svg
            className={`w-10 h-10 transition-colors duration-300 ${isDragActive ? "text-purple-300" : "text-purple-500"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isDragActive ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            )}
          </svg>
        </div>
      </div>

      {/* Text */}
      <p className={`text-lg font-medium mb-2 transition-colors duration-300 ${isDragActive ? "text-purple-300" : "text-gray-300"}`}>
        {isDragActive ? "Drop it — let's hear your game!" : "Drag & drop a game screenshot"}
      </p>
      <p className="text-gray-500 text-sm mb-6">
        or <span className="text-purple-400 underline underline-offset-2">click to browse</span>
      </p>

      {/* Hint chips */}
      <div className="flex flex-wrap justify-center gap-2">
        {["PNG / JPG / WebP", "Any resolution", "Works best with gameplay visible"].map((hint) => (
          <span key={hint} className="text-xs bg-gray-800/60 border border-gray-700/60 text-gray-500 rounded-full px-3 py-1">
            {hint}
          </span>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <p className="mt-4 text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-4 py-2">
          {error}
        </p>
      )}
    </div>
  )
}
