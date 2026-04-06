

// services/itineraryPrompt.js

const buildItineraryPrompt = ({
    location,
    location2,
    startDate,
    endDate,
    persons,
    budget,
    interests,
}) => {
    const cleanInterests = Array.isArray(interests)
        ? interests.join(", ")
        : interests;
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return `
        You are an AI Travel Planner.

        Generate a complete day-wise travel itinerary.

        STRICT RULES:
        - Return ONLY valid JSON
        - No markdown
        - No extra text

        INPUT:
        From Location: ${location}
        To Location: ${location2}
        Start Date: ${startDate}
        End Date: ${endDate}
        Days: ${days}
        Travellers: ${persons}
        Budget: ${budget}
        Interests: ${interests}

        FORMAT:
        {
        "trip": [
            {
                "day": 1,
                "date": "YYYY-MM-DD",
                "title": "string",
                "morning": [
                    "✈️ Flight from ${location} to ${location2} via airline (HH:MM - HH:MM) - ₹cost",
                    "🏨 Hotel check-in at hotel (₹price/night)"
                ],
                "afternoon": [
                    "🏖️ Beach visit (₹cost)",
                    "🍽️ Lunch (₹cost)"
                ],
                "evening": [
                    "🌅 Sunset (₹cost)",
                    "🛍️ Shopping (₹cost)"
                ],
                "night": [
                    "🎉 Nightlife (₹cost)",
                    "🍴 Dinner (₹cost)"
                ],
                "hotel": "🏨 hotel details",
                "weather": "☀️ Condition | temp | suggestion",
                "dailyBudget": 0
            }
        ],
        "summary": {
            "totalBudget": 0,
            "estimatedSpent": 0,
            "remaining": 0
        },
        "tips": []
        }

        RULES:
        - Generate exactly ${days} days
        - Focus on: ${interests}
        - Flights only Day 1 & last day
        - 2–3 items per section
        - Keep within budget
    `;
};

export default buildItineraryPrompt;