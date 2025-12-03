'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MemoColor } from '@/types/memo.types'
import { Paperclip, X } from 'lucide-react'

export default function MemoEditor({
    onSubmit
}: {
    onSubmit: (content: string, color: string, mediaUrl?: string | null) => void
}) {
    const supabase = createClient()
    const [content, setContent] = useState('')
    const [color, setColor] = useState<MemoColor>('yellow')
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        if (!isImage && !isVideo) {
            alert('이미지 또는 동영상 파일만 업로드 가능합니다.')
            return
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('파일 크기는 50MB 이하여야 합니다.')
            return
        }

        setUploadedFile(file)
    }

    const uploadFile = async (file: File): Promise<string> => {
        // Sanitize filename: use timestamp + random string + extension
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

        const { error } = await supabase.storage
            .from('memo-uploads')
            .upload(fileName, file)

        if (error) {
            console.error('Upload error:', error)
            throw new Error('파일 업로드 실패')
        }

        const { data: { publicUrl } } = supabase.storage
            .from('memo-uploads')
            .getPublicUrl(fileName)

        return publicUrl
    }

    const handleSubmit = async () => {
        if (!content.trim() && !uploadedFile) return
        setIsSubmitting(true)

        try {
            // Removed: finalContent replacement logic. We now handle mediaUrl separately.

            if (content.trim() && !uploadedFile) {
                const moderationRes = await fetch('/api/moderation', {
                    method: 'POST',
                    body: JSON.stringify({ content }),
                })

                if (moderationRes.ok) {
                    const result = await moderationRes.json()
                    if (result.is_inappropriate) {
                        alert(`부적절한 내용이 감지되었습니다: ${result.reason}`)
                        setIsSubmitting(false)
                        return
                    }
                }
            }

            // Pass both content and mediaUrl (if any)
            // If uploadedFile exists, finalContent is the media URL from uploadFile()
            // BUT we want to support text + media. 
            // So we need to change the onSubmit signature or how we pass data.
            // For now, let's assume the parent handles it, but we need to pass both.
            // Let's modify the onSubmit prop signature first.

            let mediaUrl = null
            if (uploadedFile) {
                mediaUrl = await uploadFile(uploadedFile)
            }

            onSubmit(content, color, mediaUrl)

            setContent('')
            setUploadedFile(null)
            setUploadProgress(0)
        } catch (e) {
            console.error(e)
            alert('오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-wood px-5 sm:px-6 py-2.5 sm:py-3 text-white shadow-lg hover:bg-opacity-90 transition-all transform hover:scale-105 font-bold z-40 text-sm sm:text-base"
            >
                메모 작성하기
            </button>
        )
    }

    return (
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-80">
            <div className="rounded-lg bg-white p-3 sm:p-4 shadow-2xl">
                {uploadedFile ? (
                    <div className="mb-3 p-3 bg-gray-100 rounded-lg relative">
                        <button
                            onClick={() => setUploadedFile(null)}
                            className="absolute top-2 right-2 p-1.5 sm:p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                            <X size={16} />
                        </button>
                        <p className="text-sm text-gray-700 truncate pr-8">{uploadedFile.name}</p>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="mt-2 w-full rounded bg-wood px-4 py-3 sm:py-2 text-white hover:bg-opacity-90 disabled:opacity-50 font-bold"
                        >
                            {isSubmitting ? '업로드 중...' : '메모 붙이기'}
                        </button>
                    </div>
                ) : (
                    <>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onKeyPress={handleKeyPress}
                            maxLength={500}
                            placeholder="메모 입력 (Enter로 작성)"
                            className={`h-32 w-full resize-none p-3 rounded shadow-inner focus:outline-none whitespace-pre-wrap break-words overflow-x-hidden ${color === 'yellow' ? 'bg-memo-yellow' :
                                color === 'pink' ? 'bg-memo-pink' :
                                    color === 'green' ? 'bg-memo-green' : 'bg-memo-blue'
                                } font-handwriting text-base sm:text-lg`}
                            autoFocus
                        />

                        <div className="mt-2 flex justify-between items-center">
                            <div className="flex gap-2">
                                {(['yellow', 'pink', 'green', 'blue'] as MemoColor[]).map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`h-8 w-8 sm:h-6 sm:w-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-gray-600 scale-110' : 'border-transparent'
                                            } ${c === 'yellow' ? 'bg-memo-yellow' :
                                                c === 'pink' ? 'bg-memo-pink' :
                                                    c === 'green' ? 'bg-memo-green' : 'bg-memo-blue'
                                            }`}
                                    />
                                ))}
                            </div>

                            <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-2 sm:px-2 sm:py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm sm:text-xs transition-colors">
                                <Paperclip size={18} className="sm:w-[14px]" />
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="mt-2 w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                        >
                            닫기
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
