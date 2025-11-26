import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  try {
    const { tasks, sessions, diary, timeframe } = await req.json();

    const prompt = `
      Act as an elite Productivity Data Scientist for 'TaskGlyph'.
      Analyze the user's ${timeframe.toUpperCase()} data:

      DATA:
      - Tasks: ${tasks.completed} done, ${tasks.overdue} overdue.
      - Focus: ${sessions.totalMinutes} mins.
      - Mood: ${diary.mood || "Neutral"}, Energy: ${diary.energy || 5}/10.

      RETURN JSON (no markdown) with these 9 keys:
      1. "score": (0-100) Productivity Score.
      2. "analysis": Deep insight into their workflow patterns (2 sentences).
      3. "action": Specific command for next session.
      4. "burnout_risk": "Low", "Medium", or "High".
      5. "peak_hours": Best 2hr window (e.g. "9AM-11AM").
      6. "hidden_pattern": One subtle habit noticed.
      7. "sustainability": "Sustainable", "Overload", or "Underload".
      8. "momentum": "Rising 🚀", "Falling 📉", or "Stable ➖".
      9. "work_mode": Classify their style today (e.g., "Sniper", "Grinder", "Explorer", "Scatter").

      Tone: Futuristic, precise, data-driven.
    `;

    // Use the stable Flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanJson = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      {
        score: 0,
        analysis: "Neural link unstable.",
        action: "Standby.",
        burnout_risk: "Low",
        peak_hours: "--",
        hidden_pattern: "--",
        sustainability: "--",
        momentum: "--",
        work_mode: "--",
      },
      { status: 500 }
    );
  }
}
