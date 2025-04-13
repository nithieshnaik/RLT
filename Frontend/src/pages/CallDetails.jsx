import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';

const CallDetails = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [calls, setCalls] = useState([]); // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
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
                
                // Make sure we're setting an array
                const callData = Array.isArray(response.data) ? response.data : [];
                console.log('Retrieved call data:', callData);
                setCalls(callData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch calls:', err);
                setError('Failed to load call data. Please try again later.');
                // Set calls to empty array on error
                setCalls([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchCalls();
    }, []);
    
    // Filter calls safely - make sure calls is an array first
    const filteredCalls = Array.isArray(calls) ? calls.filter(call => {
        if (!searchTerm) return true;
        // Search by multiple fields for better UX
        return (
            (call._id && call._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (typeof call.transcription === 'string' && 
             call.transcription.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }) : [];
    
    // Format duration from seconds to minutes
    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return "N/A";
        return `${Math.floor(seconds / 60)} mins`;
    };
    
    return (
        <div className='flex bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />
            
            {/* Main Content Area */}
            <div className="flex-1 p-5 flex flex-col mb-10">
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
                            <option value="Haryanvi">Harynavi</option>
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
                                        A{index + 1}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">Call {index + 1}</h2>
                                        <div>
                                            <p><span className="font-medium">Call Duration :</span> {formatDuration(call.duration)}</p>
                                            <p><span className="font-medium">Language :</span> English</p>
                                            <p><span className="font-medium">Sentiment :</span> {
                                                call.sentiment && call.sentiment.positive > (call.sentiment.negative || 0) 
                                                    ? "Positive" 
                                                    : call.sentiment && call.sentiment.negative > (call.sentiment.positive || 0) 
                                                        ? "Negative" 
                                                        : "Neutral"
                                            }</p>
                                            {call.holdDuration > 0 && (
                                                <p><span className="font-medium">Hold Duration :</span> {call.holdDuration}s</p>
                                            )}
                                            <p><span className="font-medium">Date :</span> {
                                                call.timestamp ? new Date(call.timestamp).toLocaleDateString() : 'N/A'
                                            }</p>
                                        </div>
                                        {call.audioUrl && (
                                            <div className="mt-3">
                                                <audio controls src={call.audioUrl} className="w-full" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <h3 className="text-2xl font-bold">NPS : {Math.floor(Math.random() * 50) + 20}</h3>
                                    <div className="mt-2">
                                        <div className={`rounded-full w-16 h-16 ${
                                            call.sentiment && call.sentiment.positive > (call.sentiment.negative || 0) 
                                                ? "bg-green-400" 
                                                : call.sentiment && call.sentiment.negative > (call.sentiment.positive || 0) 
                                                    ? "bg-red-400" 
                                                    : "bg-yellow-400"
                                        }`}></div>
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