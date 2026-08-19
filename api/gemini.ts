interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[]
    }
  }[]
  error?: {
    message?: string
  }
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Método não permitido.' }, { status: 405 })
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    return Response.json(
      { error: 'GEMINI_API_KEY não configurada na Vercel.' },
      { status: 500 },
    )
  }

  const { prompt } = (await request.json()) as { prompt?: string }

  if (!prompt?.trim()) {
    return Response.json({ error: 'Prompt não informado.' }, { status: 400 })
  }

  const geminiUrl = new URL(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
  )
  geminiUrl.searchParams.set('key', apiKey)

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })

  const body = (await response.json()) as GeminiResponse

  if (!response.ok) {
    return Response.json(
      { error: body.error?.message ?? 'O Gemini recusou a requisição.' },
      { status: response.status },
    )
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    return Response.json(
      { error: 'O Gemini retornou uma resposta vazia.' },
      { status: 502 },
    )
  }

  return Response.json({ text })
}
