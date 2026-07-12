"use client"

import Image from "next/image"
import { useState } from "react"

interface SoundEffect {
  name: string
  description: string
  why: string
}

interface TextBoxProps {
  soundEffects: SoundEffect[]
  preview?: string | null
}

export default function TextBox({ soundEffects, preview }: TextBoxProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify({ fx: soundEffects }, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="glow-purple bg-gray-900/80 backdrop-blur-sm border border-purple-500/40 rounded-2xl overflow-hidden w-full">
      {/* Header with optional screenshot thumbnail */}
      <div className="relative border-b border-gray-800 px-6 py-5 flex items-center justify-between gap-4">
        {preview && (
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <Image src={preview} alt="" fill className="object-cover" />
          </div>
        )}
        <div className="relative flex items-center gap-3">
          {/* Animated checkmark badge */}
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/60 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Analysis Complete</h2>
            <p className="text-xs text-gray-500">{soundEffects.length} sound effects identified</p>
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="relative flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500/60 hover:bg-gray-700 transition-all text-sm font-medium text-gray-300 hover:text-white"
          aria-label="Copy JSON"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy JSON
            </>
          )}
        </button>
      </div>

      {/* SFX cards grid */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        <div className="grid gap-3">
          {soundEffects.map((effect, index) => (
            <div
              key={effect.name}
              className="card-hover fade-in-up group relative bg-gray-800/60 border border-gray-700/60 hover:border-purple-500/50 rounded-xl p-4 transition-all duration-200"
              style={{ animationDelay: `${index * 0.04}s`, opacity: 0, animationFillMode: "forwards" }}
            >
              <div className="flex items-start gap-4">
                {/* Index badge */}
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-700/50 text-purple-400 text-xs font-bold flex items-center justify-center font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex-1 min-w-0">
                  {/* Name row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-purple-300 font-mono font-semibold text-sm truncate">
                      {effect.name}
                    </span>
                    {/* Sound wave icon */}
                    <svg className="flex-shrink-0 w-3.5 h-3.5 text-purple-600 group-hover:text-purple-400 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 19V5l12 3v11M9 19c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2zm12-3c0 1.1-1.34 2-3 2s-3-.9-3-2 1.34-2 3-2 3 .9 3 2z"/>
                    </svg>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm leading-relaxed mb-2">{effect.description}</p>

                  {/* Why badge */}
                  <p className="text-xs text-gray-500 flex items-start gap-1.5">
                    <span className="text-purple-700 mt-0.5 flex-shrink-0">💡</span>
                    <span>{effect.why}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t border-gray-800 px-6 py-3 flex items-center gap-2 text-xs text-gray-600">
        <svg className="w-3.5 h-3.5 text-purple-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Use the JSON with <span className="text-purple-700 mx-1">ElevenSFX</span> nodes in Godot to generate audio in one click
      </div>
    </div>
  )
}
