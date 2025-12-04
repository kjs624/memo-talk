'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface TutorialStep {
    title: string
    content: string
    position: 'top-left' | 'bottom-left' | 'bottom-center' | 'center'
    highlight?: string
}

const steps: TutorialStep[] = [
    {
        title: '🎉 메모톡에 오신 걸 환영합니다!',
        content: '포스트잇처럼 메모를 붙이고 공유하는 재미있는 공간이에요. 짧은 튜토리얼로 사용법을 알려드릴게요!',
        position: 'center'
    },
    {
        title: '📝 메모 작성하기',
        content: '하단의 "메모 작성하기" 버튼을 눌러 메모를 만들어보세요. 글을 쓰고 원하는 위치에 클릭하면 메모가 붙습니다!',
        position: 'bottom-center'
    },
    {
        title: '📸 사진도 올려보세요',
        content: '메모 작성창에서 파일 첨부 버튼(📎)으로 사진이나 영상을 올릴 수 있어요. 글과 함께 올리면 더 풍성한 메모가 됩니다!',
        position: 'bottom-center'
    },
    {
        title: '📦 나의 보관함',
        content: '마음에 드는 메모는 "보관" 버튼(📦)을 눌러 내 보관함으로 이동시킬 수 있어요. 왼쪽 아래 버튼으로 언제든 확인 가능합니다!',
        position: 'bottom-left'
    },
    {
        title: '📋 게시판 탐험',
        content: '우측 상단의 "📋 게시판" 버튼을 눌러 다양한 게시판을 구경하거나 나만의 게시판을 만들어보세요!',
        position: 'top-left'
    },
    {
        title: '✨ 준비 완료!',
        content: '이제 메모톡을 자유롭게 사용하실 수 있어요. 친구들과 재미있는 메모를 공유해보세요!',
        position: 'center'
    }
]

export default function TutorialOverlay({
    currentStep,
    onNext,
    onSkip,
    onComplete
}: {
    currentStep: number
    onNext: () => void
    onSkip: () => void
    onComplete: () => void
}) {
    const step = steps[currentStep]
    const isLastStep = currentStep === steps.length - 1

    if (!step) return null

    const getPositionClass = () => {
        switch (step.position) {
            case 'top-left':
                return 'top-24 left-8'
            case 'bottom-left':
                return 'bottom-24 left-8'
            case 'bottom-center':
                return 'bottom-24 left-1/2 -translate-x-1/2'
            case 'center':
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            default:
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* Dark overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black pointer-events-auto"
                    onClick={onSkip}
                />

                {/* Tutorial card */}
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className={`absolute ${getPositionClass()} w-[90%] sm:w-96 bg-white rounded-2xl shadow-2xl p-6 pointer-events-auto`}
                >
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <h3 className="text-2xl font-bold text-wood mb-3">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed mb-6">{step.content}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1.5">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 rounded-full transition-all ${index === currentStep
                                            ? 'w-8 bg-wood'
                                            : index < currentStep
                                                ? 'w-2 bg-wood/50'
                                                : 'w-2 bg-gray-300'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onSkip}
                                className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                            >
                                건너뛰기
                            </button>
                            <button
                                onClick={isLastStep ? onComplete : onNext}
                                className="bg-wood text-white px-6 py-2 rounded-lg font-bold hover:bg-wood-dark transition-colors"
                            >
                                {isLastStep ? '시작하기' : '다음'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
