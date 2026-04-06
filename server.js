// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import buildItineraryPrompt from "./services/itineraryPrompt.js";
//import jsonData from "./services/sampleJson.js";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// ----------------------------
// Generate Travel Itinerary
// ----------------------------
app.post("/generate", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      location,
      location2,
      persons,
      budget,
      interests,
    } = req.body;

    console.log("Received request:", {
      startDate,
      endDate,
      location,
      location2,
      persons,
      budget,
      interests,
    });

    const prompt = await buildItineraryPrompt({
      location,
      location2,
      startDate,
      endDate,
      persons,
      budget,
      interests,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      response_format: { type: "json_object" }, // ✅ FORCE JSON
    });

    // ✅ Extract safely
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({
        error: "Empty response from AI",
      });
    }

    let parsedPlan;

    try {
      parsedPlan = JSON.parse(content); // ✅ SAFE PARSE
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", content);

      return res.status(500).json({
        error: "Invalid JSON from AI",
        raw: content, // 🔥 Debug help
      });
    }

    console.log("✅ Generated plan:", parsedPlan);

    res.status(200).json({
      message: "success",
      plan: parsedPlan,
    });

  } catch (error) {
    console.error("❌ Server Error:", error);

    res.status(500).json({
      error: "Something went wrong",
      details: error.message,
    });
  }
});

// ----------------------------
// Replan / Adjust itinerary
// ----------------------------
app.post("/replan", async (req, res) => {
  try {
    const { existingPlan, changeReason } = req.body;

    const prompt = `
Modify the following travel itinerary based on this reason: ${changeReason}

Existing plan:
${existingPlan}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const updatedPlan = response.choices[0].message.content;

    res.json({ plan: updatedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------
// Health check
// ----------------------------
app.get("/", (req, res) => {
  res.status(200).send("AI Itinerary Backend is running!.. V2");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});