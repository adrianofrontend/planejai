interface InsightResponse {
  text: string
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: {
    content: string
  }
  suggestions: {
    items: string[]
  }
  extraIncome: {
    items: string[]
  }
  investment: {
    items: string[]
  }
  motivation: {
    content: string
  }
}

const callGeminiAPI = async (prompt: string) => {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(
      `Erro na requisição do Gemini (${response.status}): ${errorBody}`,
    )
  }

  return (await response.json()) as InsightResponse
}

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt)
  return JSON.parse(response.text) as InsightData
}
