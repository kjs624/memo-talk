'use client'
import { useState, useEffect } from 'react'

export function useTutorial() {
    const [isFirstVisit, setIsFirstVisit] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        // Check if user has completed tutorial
        const tutorialComplete = localStorage.getItem('tutorial_complete')
        if (!tutorialComplete) {
            setIsFirstVisit(true)
        } else {
            setIsComplete(true)
        }
    }, [])

    const nextStep = () => {
        setCurrentStep(prev => prev + 1)
    }

    const skipTutorial = () => {
        localStorage.setItem('tutorial_complete', 'true')
        setIsComplete(true)
        setIsFirstVisit(false)
    }

    const completeTutorial = () => {
        localStorage.setItem('tutorial_complete', 'true')
        setIsComplete(true)
        setIsFirstVisit(false)
    }

    const resetTutorial = () => {
        localStorage.removeItem('tutorial_complete')
        setIsFirstVisit(true)
        setCurrentStep(0)
        setIsComplete(false)
    }

    return {
        isFirstVisit,
        currentStep,
        isComplete,
        nextStep,
        skipTutorial,
        completeTutorial,
        resetTutorial
    }
}
