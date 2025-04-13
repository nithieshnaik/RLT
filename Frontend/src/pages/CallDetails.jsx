import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';

const CallDetails = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Audio player states
    const [isPlaying, setIsPlaying] = useState({});
    const [currentTime, setCurrentTime] = useState({});
    const [duration, setDuration] = useState({});
    const [audioErrors, setAudioErrors] = useState({});
    const audioRefs = useRef({});
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    useEffect(() => {
        const fetchCalls = async () => {
            try {
                setLoading(true);
                // Get token from localStorage
                const token = localStorage.getItem('token');
                
                if (!token) {
                    throw new Error('No authentication token found');
                }
                
                const response = await axios.get('/api/calls', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                // Ensure we're working with an array of calls
                const callData = Array.isArray(response.data) ? response.data : [];
                console.log('Retrieved call data:', callData);
                
                // Process each call to ensure audio URLs are properly formed
                const processedCallData = callData.map(call => {
                    if (!call.audioUrl) return call;
                    
                    // Clean up the audioUrl
                    let audioUrl = call.audioUrl;
                    
                    // Remove double slashes (except after http: or https:)
                    audioUrl = audioUrl.replace(/([^:])\/\//g, '$1/');
                    
                    // Ensure URL has a leading slash if it's a relative URL
                    if (!audioUrl.startsWith('http') && !audioUrl.startsWith('/')) {
                        audioUrl = '/' + audioUrl;
                    }
                    
                    // Make relative URLs absolute
                    if (!audioUrl.startsWith('http')) {
                        audioUrl = window.location.origin + audioUrl;
                    }
                    
                    // For testing purposes, replace localhost URLs with valid ones if necessary
                    // If in production, you'd want to make sure your audio URLs are actually accessible
                    if (audioUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
                        // console.log('URL contains localhost which may not be accessible in production');
                    }
                    
                    console.log(`Processed audio URL for call ${call._id}: ${audioUrl}`);
                    
                    return {
                        ...call,
                        audioUrl
                    };
                });
                
                setCalls(processedCallData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch calls:', err);
                setError('Failed to load call data. Please try again later.');
                setCalls([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCalls();
    }, []);
    
    // Filter calls by search term and month
    const filteredCalls = Array.isArray(calls) ? calls.filter(call => {
        const matchesSearch = !searchTerm || 
            (call._id && call._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (typeof call.transcription === 'string' && 
             call.transcription.toLowerCase().includes(searchTerm.toLowerCase()));
             
        const matchesMonth = !selectedMonth || 
            (call.createdAt && new Date(call.createdAt).getMonth() === months.indexOf(selectedMonth)) ||
            (call.timestamp && new Date(call.timestamp).getMonth() === months.indexOf(selectedMonth));
            
        return matchesSearch && matchesMonth;
    }) : [];
    
    // Format duration from seconds to minutes
    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return "N/A";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    // Format time for audio player (MM:SS format)
    const formatTime = (timeInSeconds) => {
        if (!timeInSeconds && timeInSeconds !== 0) return "00:00";
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    // Check if audio is playable before attempting to play it
    const isAudioUrlValid = (url) => {
        // Check for empty or undefined URLs
        if (!url) return false;
        
        // Simple check for localhost URLs which might not work in production
        if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
            return false;
        }
        
        // Make sure the URL is properly formatted
        try {
            new URL(url);
            return true;
        } catch (e) {
            console.warn('Invalid URL format:', url);
            return false;
        }
    };
    
    // Mock audio play for demo purposes when real audio can't be played
    const mockAudioPlay = (callId) => {
        console.log(`Mock playing audio for call ${callId}`);
        
        // Create a fake duration if none exists
        if (!duration[callId]) {
            setDuration({...duration, [callId]: 180}); // 3 minutes
        }
        
        // Set as playing
        setIsPlaying({...isPlaying, [callId]: true});
        
        // Simulate audio progress with an interval
        const interval = setInterval(() => {
            setCurrentTime(prev => {
                const current = prev[callId] || 0;
                const max = duration[callId] || 180;
                
                // If reached the end or no longer playing, clear interval
                if (current >= max || !isPlaying[callId]) {
                    clearInterval(interval);
                    
                    if (current >= max) {
                        handleEnded(callId);
                    }
                    
                    return prev;
                }
                
                // Otherwise increment time
                return {...prev, [callId]: current + 1};
            });
        }, 1000);
        
        // Store the interval ID so we can clear it later
        return interval;
    };
    
    // Function to verify audio can be played
    const verifyAudio = (callId) => {
        const audio = audioRefs.current[callId];
        if (!audio) return false;
        
        // Check if the audio element is properly loaded
        if (audio.readyState === 0) {
            console.warn(`Audio for call ${callId} not loaded yet.`);
            // Try reloading the audio
            audio.load();
            return false;
        }

        // Check if the audio has a source
        if (!audio.src) {
            console.error(`No source for audio ${callId}`);
            setAudioErrors({...audioErrors, [callId]: 'No audio source found'});
            return false;
        }
        
        return true;
    };
    
    // Play/Pause toggle function
    const togglePlay = (callId) => {
        const audio = audioRefs.current[callId];
        const call = calls.find(c => c._id === callId) || calls[callId];
        
        if (!call) {
            console.error(`Call data not found for ID ${callId}`);
            return;
        }
        
        // If already playing, pause it
        if (isPlaying[callId]) {
            if (audio) {
                audio.pause();
            }
            setIsPlaying({...isPlaying, [callId]: false});
            return;
        }
        
        // Pause all other playing audio first
        Object.keys(isPlaying).forEach(id => {
            if (id !== callId && isPlaying[id] && audioRefs.current[id]) {
                audioRefs.current[id].pause();
                setIsPlaying(prev => ({ ...prev, [id]: false }));
            }
        });
        
        // Check if the audio URL is valid
        if (!isAudioUrlValid(call.audioUrl)) {
            console.warn(`Audio URL invalid for call ${callId}: ${call.audioUrl}`);
            setAudioErrors({...audioErrors, [callId]: 'Audio not supported'});
            
            // For demonstration purposes, we'll simulate audio playback
            if (process.env.NODE_ENV !== 'production') {
                mockAudioPlay(callId);
            }
            return;
        }
        
        if (!audio) {
            console.error(`Audio ref not found for call ${callId}`);
            setAudioErrors({...audioErrors, [callId]: 'Audio not supported'});
            return;
        }
        
        // Try to play the audio
        try {
            // Clear previous errors
            setAudioErrors({...audioErrors, [callId]: null});
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`Audio for call ${callId} playing successfully`);
                        setIsPlaying({...isPlaying, [callId]: true});
                    })
                    .catch(error => {
                        console.error(`Audio playback failed for call ${callId}:`, error);
                        setAudioErrors({...audioErrors, [callId]: 'Audio not supported'});
                        
                        // For demo purposes, we'll mock audio playback when real audio fails
                        if (process.env.NODE_ENV !== 'production') {
                            mockAudioPlay(callId);
                        }
                    });
            } else {
                // Older browsers might not return a promise
                setIsPlaying({...isPlaying, [callId]: true});
            }
        } catch (error) {
            console.error(`Exception trying to play audio for call ${callId}:`, error);
            setAudioErrors({...audioErrors, [callId]: 'Audio not supported'});
            
            // For demo purposes only
            if (process.env.NODE_ENV !== 'production') {
                mockAudioPlay(callId);
            }
        }
    };
    
    // Time update handler
    const handleTimeUpdate = (callId) => {
        if (audioRefs.current[callId]) {
            setCurrentTime({
                ...currentTime, 
                [callId]: audioRefs.current[callId].currentTime
            });
        }
    };
    
    // Duration change handler
    const handleDurationChange = (callId) => {
        if (audioRefs.current[callId]) {
            const newDuration = audioRefs.current[callId].duration;
            console.log(`Duration for call ${callId} set to ${newDuration}`);
            setDuration({
                ...duration, 
                [callId]: newDuration
            });
        }
    };
    
    // Seek function
    const handleSeek = (e, callId) => {
        if (audioRefs.current[callId]) {
            const seekTime = parseFloat(e.target.value);
            audioRefs.current[callId].currentTime = seekTime;
            setCurrentTime({...currentTime, [callId]: seekTime});
        } else {
            // For mock audio
            const maxDuration = duration[callId] || 180;
            const seekTime = Math.min(parseFloat(e.target.value), maxDuration);
            setCurrentTime({...currentTime, [callId]: seekTime});
        }
    };
    
    // Audio ended handler
    const handleEnded = (callId) => {
        setIsPlaying({...isPlaying, [callId]: false});
        setCurrentTime({...currentTime, [callId]: 0});
    };
    
    // Handle audio error
    const handleAudioError = (callId, e) => {
        // Log this without the full event to avoid excessive console output
        console.error(`Error loading audio for call ${callId}`);
        
        // Simplify the error message for UI
        setAudioErrors({...audioErrors, [callId]: 'Audio not supported'});
        setIsPlaying({...isPlaying, [callId]: false});
    };
    
    // Function to handle audio loading
    const handleAudioCanPlay = (callId) => {
        console.log(`Audio for call ${callId} can play now`);
        setAudioErrors({...audioErrors, [callId]: null});
    };
    
    // Function to determine sentiment display
    const getSentimentDisplay = (sentiment) => {
        if (!sentiment) return "Neutral";
        
        if (sentiment.positive > sentiment.negative) {
            return "Positive";
        } else if (sentiment.negative > sentiment.positive) {
            return "Negative";
        } else {
            return "Neutral";
        }
    };
    
    // Function to get sentiment color
    const getSentimentColor = (sentiment) => {
        if (!sentiment) return "bg-yellow-400";
        
        if (sentiment.positive > sentiment.negative) {
            return "bg-green-400";
        } else if (sentiment.negative > sentiment.positive) {
            return "bg-red-400";
        } else {
            return "bg-yellow-400";
        }
    };
    
    return (
        <div className='flex bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />
            
            {/* Main Content Area */}
            <div className="flex-1 p-5 flex flex-col mb-10 overflow-hidden">
                {/* Header */}
                <div className="flex justify-normal items-center mt-15">
                    <h1 className="text-4xl font-bold " style={{color: "#1C398E"}}>Call Details</h1>
                    {/* Language Dropdown */}
                    <div className="relative inline-block text-left ml-5">
                        <select
                            className="border border-gray-300 rounded-md mt-2 p-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value="English"
                            onChange={() => {}}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Punjabi">Punjabi</option>
                            <option value="Haryanvi">Haryanvi</option>
                            <option value="Bhojpuri">Bhojpuri</option>
                            <option value="Maithli">Maithli</option>
                            <option value="Odia">Odia</option>
                        </select>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="bg-white rounded-lg shadow-lg pb-5 pt-2 pl-6 pr-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between mb-6 mt-4">
                        {/* Search Box */}
                        <div className="relative w-80">
                            <input
                                type="text"
                                placeholder="Search calls..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-md py-1 px-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                        </div>
                        
                        {/* Month Dropdown */}
                        <div className="relative inline-block text-left">
                            <select
                                className="border border-gray-300 rounded-md w-40 focus:outline-none focus:ring-2 focus:ring-blue-500" style={{height: "30px"}}
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Loading and Error States */}
                    {loading && (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-xl">Loading call data...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="flex justify-center items-center h-64">
                            <p className="text-xl text-red-500">{error}</p>
                        </div>
                    )}
                    
                    {/* Call Cards */}
                    <div className="flex-1 overflow-y-auto">
                        {!loading && !error && filteredCalls.length === 0 && (
                            <div className="flex justify-center items-center h-64">
                                <p className="text-xl">No calls found.</p>
                            </div>
                        )}
                        
                        {!loading && !error && filteredCalls.map((call, index) => (
                            <div key={call._id || index} className="bg-white rounded-lg shadow border border-gray-100 p-6 mb-4 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mr-4">
                                        {/* Changed from showing index number to showing "C" + number */}
                                        C{index + 1}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Call {index + 1}</h2>
                                        <div>
                                            <p><span className="font-medium">Call Duration:</span> {formatDuration(call.duration)}</p>
                                            <p><span className="font-medium">Language:</span> English</p>
                                            <p><span className="font-medium">Sentiment:</span> {getSentimentDisplay(call.sentiment)}</p>
                                            {call.holdDuration > 0 && (
                                                <p><span className="font-medium">Hold Duration:</span> {formatDuration(call.holdDuration)}</p>
                                            )}
                                            <p><span className="font-medium">Date:</span> {
                                                call.createdAt ? new Date(call.createdAt).toLocaleDateString() :
                                                call.timestamp ? new Date(call.timestamp).toLocaleDateString() : 'N/A'
                                            }</p>
                                        </div>
                                        <div className="mt-3">
                                            {/* Always render the audio player area, even if we're using mock audio */}
                                            {call.audioUrl && (
                                                <audio 
                                                    ref={el => audioRefs.current[call._id || index] = el}
                                                    src={call.audioUrl}
                                                    preload="metadata"
                                                    onTimeUpdate={() => handleTimeUpdate(call._id || index)}
                                                    onDurationChange={() => handleDurationChange(call._id || index)}
                                                    onEnded={() => handleEnded(call._id || index)}
                                                    onError={(e) => handleAudioError(call._id || index, e)}
                                                    onCanPlay={() => handleAudioCanPlay(call._id || index)}
                                                    controls={false}
                                                    style={{display: 'none'}} // Hide the native audio element
                                                />
                                            )}
                                            
                                            {/* Custom audio player UI */}
                                            <div className="flex flex-col w-full bg-blue-50 p-3 rounded-lg">
                                                <div className="flex items-center mb-1">
                                                    <button 
                                                        onClick={() => togglePlay(call._id || index)}
                                                        className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 focus:outline-none hover:bg-blue-600"
                                                    >
                                                        {isPlaying[call._id || index] ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <rect x="6" y="4" width="4" height="16" />
                                                                <rect x="14" y="4" width="4" height="16" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M8 5v14l11-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    <div className="flex-1 mx-2">
                                                        <input 
                                                            type="range" 
                                                            min="0" 
                                                            max={duration[call._id || index] || 100} 
                                                            value={currentTime[call._id || index] || 0}
                                                            onChange={(e) => handleSeek(e, call._id || index)}
                                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" 
                                                        />
                                                    </div>
                                                    <div className="text-sm text-gray-500 w-20 text-right">
                                                        {formatTime(currentTime[call._id || index] || 0)} / {formatTime(duration[call._id || index] || 0)}
                                                    </div>
                                                </div>
                                                {audioErrors[call._id || index] && (
                                                    <div className="text-red-500 text-sm mt-1">
                                                        {audioErrors[call._id || index]}
                                                    </div>
                                                )}
                                                {/* Don't display the raw audio URL if it's causing errors */}
                                                {!audioErrors[call._id || index] && call.audioUrl && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Audio URL: {call.audioUrl}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-2xl font-bold">NPS : {
                                        // Calculate NPS based on sentiment if available or use a random value
                                        call.sentiment ? 
                                            Math.min(100, Math.max(0, Math.round(
                                                ((call.sentiment.positive - call.sentiment.negative) / 100) * 100
                                            ))) : 
                                            Math.floor(Math.random() * 50) + 20
                                    }</h3>
                                    <div className="mt-2">
                                        <div className={`rounded-full w-16 h-16 ${getSentimentColor(call.sentiment)}`}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallDetails;