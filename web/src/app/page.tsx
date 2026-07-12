import ImageUpload from "./components/ImageUpload"

export default function Home() {
  return (
    <main className="animated-bg dot-grid relative flex min-h-screen flex-col items-center justify-center py-12 px-4 overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />

      {/* Header */}
      <div className="text-center mb-10 z-10">
        {/* Logo badge */}
        <div className="fade-in-up fade-in-up-delay-1 inline-flex items-center gap-2 bg-purple-900/50 border border-purple-500/40 rounded-full px-4 py-1.5 mb-6 text-sm text-purple-300 font-medium tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="pulse-ring absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          AI-Powered Sound Design
        </div>

        <h1 className="fade-in-up fade-in-up-delay-2 text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
          <span className="glow-text bg-clip-text text-transparent bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400">
            Game Whisperer
          </span>
        </h1>

        <p className="fade-in-up fade-in-up-delay-3 text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed">
          Drop a screenshot of your game. Our AI agent will craft a complete
          <span className="text-purple-300 font-semibold"> sound effects brief</span> in seconds.
        </p>

        {/* Feature pills */}
        <div className="fade-in-up fade-in-up-delay-3 flex flex-wrap justify-center gap-2 mt-6">
          {["ElevenLabs SFX", "fal.ai Vision", "Godot 4 Ready", "One-Click Import"].map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-800/80 border border-gray-700 text-gray-400 rounded-full px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main upload widget */}
      <div className="z-10 w-full max-w-2xl fade-in-up fade-in-up-delay-3">
        <ImageUpload />
      </div>

      {/* Footer */}
      <p className="z-10 mt-10 text-xs text-gray-600">
        Powered by{" "}
        <a
          href="https://elevenlabs.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-400 transition-colors"
        >
          ElevenLabs
        </a>{" "}
        &amp;{" "}
        <a
          href="https://fal.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-400 transition-colors"
        >
          fal.ai
        </a>
      </p>
    </main>
  )
}
