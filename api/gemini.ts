import type { VercelRequest, VercelResponse } from '@vercel/node'

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

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    return response
      .status(500)
      .json({ error: 'GEMINI_API_KEY não configurada na Vercel.' })
  }

  const { prompt } = (request.body ?? {}) as { prompt?: string }

  if (!prompt?.trim()) {
    return response.status(400).json({ error: 'Prompt não informado.' })
  }

  const geminiUrl = new URL(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
  )
  geminiUrl.searchParams.set('key', apiKey)

  try {
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })

    const body = (await geminiResponse.json()) as GeminiResponse

    if (!geminiResponse.ok) {
      return response.status(geminiResponse.status).json({
        error: body.error?.message ?? 'O Gemini recusou a requisição.',
      })
    }

    const text = body.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return response
        .status(502)
        .json({ error: 'O Gemini retornou uma resposta vazia.' })
    }

    return response.status(200).json({ text })
  } catch {
    return response
      .status(502)
      .json({ error: 'Não foi possível conectar ao Gemini.' })
  }
}
