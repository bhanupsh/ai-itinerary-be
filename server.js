// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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
    const { location, budget, interests, days } = req.body;
    console.log("Received request:", { location, budget, interests, days });
    // Clean interests array
    const cleanInterests = interests.map((i) => i.trim()).join(", ");

    const prompt = `
Create a ${days}-day travel itinerary for ${location}. 
Budget: ₹${budget}. 
Interests: ${cleanInterests}. 
Provide a day-wise plan with activities, food, sightseeing, and nightlife if relevant.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // smaller, cheaper GPT-4 variant
      //model: "gpt-4o", // full GPT-4 for better quality,
      //model: "gpt-4", // latest GPT-4 variant with improved reasoning
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const plan = response.choices[0].message.content;

    console.log("Generated plan:", plan);
    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
  res.send("AI Itinerary Backend is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});