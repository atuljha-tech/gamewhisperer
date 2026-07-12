import { NextResponse } from "next/server"

const GROQ_API_KEY = process.env.GROQ_API_KEY!
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

const PROMPT = `this is a game. give me a list of possible sound effects for this game.
for each sound effect, give me a unique audio "name", "description" for how it should sound like, and "why" you think its necessary.
respond with a json object that has a key "fx" that contains this list/array.
do not output markdown and only output plain text.`

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Convert image to base64 for Groq vision
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    if (!groqResponse.ok) {
      const err = await groqResponse.text()
      console.error("Groq error:", err)
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 })
    }

    const groqData = await groqResponse.json()
    const content = groqData.choices?.[0]?.message?.content ?? ""

    // Strip any accidental markdown fences
    const cleaned = content.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
