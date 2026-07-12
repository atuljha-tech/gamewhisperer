export default function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      {/* Waveform animation */}
      <div className="flex items-end gap-1.5 h-16">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="wave-bar h-12" />
        ))}
      </div>

      {/* Status text */}
      <div className="text-center space-y-2">
        <p className="text-purple-300 text-xl font-semibold tracking-wide">
          Analyzing your screenshot...
        </p>
        <p className="text-gray-500 text-sm">
          The AI is listening to your game
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex flex-col gap-2 w-64">
        {[
          { label: "Uploading image", done: true },
          { label: "Vision analysis", done: true },
          { label: "Crafting SFX brief", done: false },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <span
              className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border ${
                done
                  ? "border-purple-500 bg-purple-900/60"
                  : "border-gray-600 bg-transparent"
              }`}
            >
              {done && (
                <svg className="w-2.5 h-2.5 text-purple-400" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className={done ? "text-purple-400" : "text-gray-500 animate-pulse"}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
