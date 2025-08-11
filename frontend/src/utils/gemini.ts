export type GenerateParams = {
    destination: string
    startDate: string
    endDate: string
    budgetUsd: number
  }
  
  // Transforms Gemini text into a Suggestion-like object. For now, we simulate a structure
  // and allow the model to fill narrative bits. You can tune the prompt and parsing further.
  export async function generateSuggestionWithGemini(apiKey: string, params: GenerateParams) {
    const prompt = `Create a concise JSON for a trip suggestion to ${params.destination} from ${params.startDate} to ${params.endDate} with a budget of ${params.budgetUsd} USD. The JSON must match this TypeScript shape exactly (no extra prose):
  {
    "id": string,
    "title": string,
    "location": string,
    "imageUrl": string,
    "dateRange": { "start": string, "end": string },
    "totalCostUsd": number,
    "badges": string[],
    "details": {
      "overview": string,
      "totals": { "label": string, "amountUsd": number }[],
      "flights": { "route": string, "airline": string, "depart": string, "arrive": string }[],
      "itineraryDays": { "title": string, "date": string, "city": string, "activities": { "time": string, "name": string, "type": "sightseeing" | "food" | "museum" | "nature" | "shopping" | "other" }[] }[],
      "pricing": { "label": string, "amountUsd": number, "note"?: string }[]
    }
  }
  Ensure dates align with the provided range and costs roughly fit within the budget.`
  
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    })
  
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(`Gemini error: ${res.status} ${msg}`)
    }
    const data = await res.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('No content from Gemini')
  
    // Try to extract JSON
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) throw new Error('Gemini response did not include JSON')
    const jsonString = text.slice(jsonStart, jsonEnd + 1)
    return JSON.parse(jsonString)
  }
  
  
  