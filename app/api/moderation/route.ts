import { NextResponse } from 'next/server'
import { model } from '@/lib/gemini'

export async function POST(request: Request) {
    try {
        const { content } = await request.json()

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const prompt = `
    다음 메모 내용이 부적절한지 판단해줘.
    부적절한 내용: 욕설, 혐오 표현, 성적 표현, 폭력적 표현, 남을 비방하는 표현
    
    메모 내용: ${content}
    
    응답 형식 (JSON):
    {
      "is_inappropriate": true/false,
      "reason": "이유 (부적절한 경우만, 한국어로 짧게)"
    }
    `

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
            }
        })

        const responseText = result.response.text()
        const responseJson = JSON.parse(responseText)

        return NextResponse.json(responseJson)
    } catch (error) {
        console.error('Moderation error:', error)
        return NextResponse.json(
            { error: 'Failed to moderate content' },
            { status: 500 }
        )
    }
}
