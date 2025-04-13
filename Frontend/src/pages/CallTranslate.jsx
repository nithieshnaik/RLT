import React, { useState, useEffect } from 'react'
import axios from 'axios'
import BackgroundImage from '../assets/backgroundImage.png'
import LeftSidePane from '../components/LeftSidePane'

const CallTranslate = () => {
    const [sourceLanguage, setSourceLanguage] = useState('English')
    const [targetLanguage, setTargetLanguage] = useState('Hindi')
    const [isProcessing, setIsProcessing] = useState(false)
    const [conversation, setConversation] = useState([])
    const [error, setError] = useState(null) // Add error state for debugging

    const languages = ['English', 'Hindi', 'Punjabi', 'Haryanvi', 'Bhojpuri', 'Maithli', 'Odia']

    // API call to transcribe audio
    const transcribeAudio = async (audioBlob) => {
        try {
            setError(null) // Clear any previous errors
            
            // Create formData
            const formData = new FormData()
            formData.append('audioFile', audioBlob, 'recording.webm')

            // Add metadata about the audio
            formData.append('encoding', 'WEBM_OPUS')
            formData.append('sampleRate', '48000')
            formData.append('languageCode', 'en-US')

            console.log("Sending transcription request with file size:", audioBlob.size)

            const response = await axios.post('/api/transcription/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log("Transcription response:", response.data)

            return response.data.text
        } catch (error) {
            console.error('Transcription error:', error)
            setError('Failed to transcribe audio: ' + error.message)
            throw new Error('Failed to transcribe audio')
        }
    }

    // API call to translate text
    const translateText = async (text, targetLang) => {
        try {
            console.log(`Attempting to translate text to ${targetLang}`)
            
            const response = await axios.post('/api/transcription/translate', {
                text,
                targetLanguage: targetLang,
                sourceLanguage: sourceLanguage
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log("Translation response:", response.data)

            return response.data.translatedText
        } catch (error) {
            console.error('Translation error:', error)
            setError('Failed to translate text: ' + error.message)
            throw new Error('Failed to translate text')
        }
    }

    // Function to handle audio file upload and processing
    const handleAudioUpload = async (file) => {
        if (!file) return

        try {
            setIsProcessing(true)
            setError(null)

            // First, save the call recording to your existing backend
            const formData = new FormData()
            formData.append('audioFile', file)
            formData.append('duration', '60') // Default duration or calculate from audio

            try {
                // Save call recording using your existing endpoint
                await axios.post('/api/calls/record', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                console.log("Call recording saved successfully")
            } catch (recordError) {
                // If this fails, we still want to try transcription
                console.error("Error saving call recording:", recordError)
            }

            // Transcribe the audio to English
            console.log("Starting transcription...")
            const englishText = await transcribeAudio(file)
            console.log("Transcription complete:", englishText)

            // Translate the English text to the target language
            console.log("Starting translation...")
            const translatedText = await translateText(englishText, targetLanguage)
            console.log("Translation complete:", translatedText)

            // Update conversation with new entry
            setConversation(prev => [
                ...prev,
                {
                    speaker: 'P', // Assuming uploaded audio is from the person
                    english: englishText,
                    hindi: translatedText
                }
            ])

        } catch (error) {
            console.error("Error processing audio:", error)
            setError("Failed to process audio: " + error.message)
            alert("Failed to process audio. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    // Handle audio recording directly in the browser
    const [isRecording, setIsRecording] = useState(false)
    const [audioRecorder, setAudioRecorder] = useState(null)
    const [recordingTime, setRecordingTime] = useState(0)
    const [recordingInterval, setRecordingInterval] = useState(null)

    const startRecording = async () => {
        try {
            setError(null)
            // Request microphone access with specific constraints for better audio quality
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                }
            })

            // Create MediaRecorder with specific MIME type and bitrate
            const options = {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000
            }

            const mediaRecorder = new MediaRecorder(stream, options)
            const audioChunks = []

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data)
            })

            mediaRecorder.addEventListener('stop', () => {
                console.log("Recording stopped, processing audio chunks...")
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
                console.log("Created audio blob of size:", audioBlob.size)
                handleAudioUpload(audioBlob)
            })

            mediaRecorder.start(1000) // Collect data in 1-second chunks
            setAudioRecorder(mediaRecorder)
            setIsRecording(true)

            // Set up recording timer
            const interval = setInterval(() => {
                setRecordingTime(prevTime => prevTime + 1)
            }, 1000)
            setRecordingInterval(interval)

            console.log("Recording started successfully")

        } catch (error) {
            console.error("Error starting recording:", error)
            setError("Could not access microphone: " + error.message)
            alert("Could not access microphone. Please check permissions.")
        }
    }

    const stopRecording = () => {
        if (audioRecorder && isRecording) {
            console.log("Stopping recording...")
            audioRecorder.stop()
            setIsRecording(false)
            clearInterval(recordingInterval)
            setRecordingTime(0)

            // Stop all audio tracks
            audioRecorder.stream.getTracks().forEach(track => {
                track.stop()
                console.log("Audio track stopped")
            })
        }
    }

    // Format recording time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            if (recordingInterval) {
                clearInterval(recordingInterval)
            }
            if (audioRecorder && isRecording) {
                audioRecorder.stop()
                audioRecorder.stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [audioRecorder, isRecording, recordingInterval])

    return (
        <div className='flex bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />

            {/* Main Content Area */}
            <div className="flex-1 p-5 flex flex-col mb-10" >
                {/* Header */}
                <div className="flex items-center mt-15">
                    <h1 className="text-4xl font-bold text-navy-900 mr-4">Call Translator</h1>

                    {/* Audio Controls */}
                    <div className="flex items-center space-x-2">
                        {!isRecording ? (
                            <button
                                onClick={startRecording}
                                disabled={isProcessing}
                                className={`flex items-center text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-200 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                style={{ backgroundColor: "#e74c3c" }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <circle cx="10" cy="10" r="6" />
                                </svg>
                                Record Audio
                            </button>
                        ) : (
                            <button
                                onClick={stopRecording}
                                className="flex items-center text-white px-4 py-2 rounded-lg shadow-md bg-gray-700 hover:bg-gray-800 transition duration-200"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <rect x="6" y="6" width="8" height="8" />
                                </svg>
                                Stop Recording ({formatTime(recordingTime)})
                            </button>
                        )}

                        <label
                            htmlFor="audio-upload"
                            className={`cursor-pointer text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ${isProcessing || isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{ backgroundColor: "#1C398E" }}
                        >
                            {isProcessing ? 'Processing...' : 'Upload Audio'}
                        </label>
                        <input
                            id="audio-upload"
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            disabled={isProcessing || isRecording}
                            onChange={(e) => {
                                const file = e.target.files[0]
                                if (file) {
                                    console.log("Uploaded file:", file)
                                    handleAudioUpload(file)
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-2 mb-4" role="alert">
                        <strong>Error: </strong> {error}
                    </div>
                )}

                {/* Translator Box */}
                <div className="bg-white rounded-lg shadow-lg pb-5 pt-2 pl-6 pr-6 flex-1 flex flex-col overflow-hidden mt-4">
                    <div className="text-center text-2xl font-semibold mb-2">Translator</div>

                    <div className="flex gap-4 flex-1 overflow-hidden">
                        {/* Left Column - Source Language */}
                        <div className="w-1/2 flex flex-col overflow-hidden">
                            <div className="relative mb-4">
                                <div className="relative inline-block text-left w-full">
                                    <div>
                                        <select
                                            name="source"
                                            value={sourceLanguage}
                                            onChange={(e) => setSourceLanguage(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {languages.map(lang => (
                                                <option key={`source-${lang}`} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50 flex-1 overflow-y-auto">
                                {/* Conversation */}
                                {conversation.length > 0 ? (
                                    conversation.map((item, index) => (
                                        <div key={`source-${index}`} className={`mb-4 flex ${index === conversation.length - 1 ? 'animate-pulse-once' : ''}`}>
                                            <div className={`${item.speaker === 'P' ? 'bg-blue-900' : 'bg-red-500'} text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0`}>
                                                {item.speaker}
                                            </div>
                                            <div className="flex-1">
                                                <p>{item.english}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-center py-4">
                                        Record or upload audio to start a conversation
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Target Language */}
                        <div className="w-1/2 flex flex-col overflow-hidden">
                            <div className="relative mb-4">
                                <div className="relative inline-block text-left w-full">
                                    <div>
                                        <select
                                            name="target"
                                            value={targetLanguage}
                                            onChange={(e) => setTargetLanguage(e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {languages.map(lang => (
                                                <option key={`target-${lang}`} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50 flex-1 overflow-y-auto">
                                {/* Conversation in Target Language */}
                                {conversation.length > 0 ? (
                                    conversation.map((item, index) => (
                                        <div key={`target-${index}`} className={`mb-4 flex ${index === conversation.length - 1 ? 'animate-pulse-once' : ''}`}>
                                            <div className={`${item.speaker === 'P' ? 'bg-blue-900' : 'bg-red-500'} text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0`}>
                                                {item.speaker}
                                            </div>
                                            <div className="flex-1">
                                                <p>{item.hindi}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-center py-4">
                                        Translations will appear here
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CallTranslate