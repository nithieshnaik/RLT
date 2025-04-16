import React, { useState, useEffect } from 'react';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';
import { Doughnut } from 'react-chartjs-2';
import BarChart from '../components/BarChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import UploadIcon from '../assets/image-10.png';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
    // State for all call metrics
    const [callMetrics, setCallMetrics] = useState({
        totalCalls: 0,
        totalCallDuration: 0,
        avgCallDuration: 0,
        lastCallDuration: 0,
        holdDuration: 0,
        sentimentData: {
            positive: 0,
            neutral: 0,
            negative: 0
        },
        npsScore: 0,
        changePercentage: 0,
        callHistory: null,
        sentimentTrends: []
    });

    // State for loading and errors
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedDuration, setUploadedDuration] = useState(0);
    const [uploadedHoldDuration, setUploadedHoldDuration] = useState(0);

    // Fetch initial call data when component mounts
    useEffect(() => {
        fetchCallData();
    }, []);

    // Function to fetch call data from API
    const fetchCallData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.warn('No authentication token found');
                setLoading(false);
                return;
            }
            
            const response = await axios.get('/api/calls/analytics', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Call data received:', response.data);
            
            // Update state with fetched data
            setCallMetrics({
                totalCalls: response.data.totalCalls || 0,
                // Convert seconds to minutes and ensure proper rounding
                totalCallDuration: Math.round(response.data.totalDuration / 60) || 0,
                avgCallDuration: response.data.totalCalls > 0 
                    ? Math.round(response.data.totalDuration / response.data.totalCalls / 60) 
                    : 0,
                lastCallDuration: response.data.calls && response.data.calls.length > 0 
                    ? Math.round(response.data.calls[0].duration / 60) 
                    : 0,
                holdDuration: response.data.calls && response.data.calls.length > 0 
                    ? Math.round(response.data.calls[0].holdDuration / 60) 
                    : 0,
                sentimentData: response.data.sentimentData || {
                    positive: 60,
                    neutral: 25,
                    negative: 15
                },
                npsScore: response.data.npsScore || 45,
                changePercentage: response.data.changePercentage || 15,
                callHistory: processCallTrendsForChart(response.data.callTrends || []),
                sentimentTrends: response.data.sentimentTrends || []
            });
            
            // If we have new uploaded durations, set them as the last call/hold duration
            if (uploadedDuration > 0) {
                setCallMetrics(prev => ({
                    ...prev,
                    lastCallDuration: Math.round(uploadedDuration / 60),
                    holdDuration: Math.round(uploadedHoldDuration / 60)
                }));
                
                // Reset uploaded values
                setUploadedDuration(0);
                setUploadedHoldDuration(0);
            }
        } catch (err) {
            console.error('Error fetching call data:', err);
            setError('Failed to load call analytics data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format call trends data for the bar chart
    const processCallTrendsForChart = (callTrends) => {
        // Sort by date if needed
        const sortedTrends = [...callTrends].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return {
            labels: sortedTrends.map(trend => {
                const date = new Date(trend.date);
                return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
            }),
            avgCalls: sortedTrends.map(trend => trend.avgCount || Math.floor(trend.count / 2)),
            totalCalls: sortedTrends.map(trend => trend.count)
        };
    };

    // Function to handle audio file upload
    const handleAudioUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setUploadSuccess(false);
        
        // Create form data
        const formData = new FormData();
        formData.append('audioFile', file);
        
        // Use random values for demonstration purposes
        // In a real app, you'd calculate these from the audio file
        const callDuration = Math.floor(Math.random() * 300) + 60; // Between 1-6 minutes in seconds
        const holdDuration = Math.floor(Math.random() * callDuration / 2); // Up to half the call duration
        
        // Store these for immediate UI update
        setUploadedDuration(callDuration);
        setUploadedHoldDuration(holdDuration);
        
        formData.append('duration', callDuration.toString());
        formData.append('holdDuration', holdDuration.toString());
        formData.append('transcription', 'This is a transcription of the call. The customer was satisfied with the service.');

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication required. Please log in again.');
                setLoading(false);
                return;
            }
            
            console.log('Uploading audio file...');
            console.log('Call duration:', callDuration, 'Hold duration:', holdDuration);
            
            // Upload the audio file
            const response = await axios.post('/api/calls/record', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload response:', response.data);
            setUploadSuccess(true);
            
            // Update call metrics immediately before refreshing data
            setCallMetrics(prev => {
                const newTotalCalls = prev.totalCalls + 1;
                const newTotalDuration = prev.totalCallDuration * 60 + callDuration; // Convert mins back to seconds, add new duration
                
                return {
                    ...prev,
                    totalCalls: newTotalCalls,
                    totalCallDuration: Math.round(newTotalDuration / 60), // Convert back to minutes
                    avgCallDuration: Math.round(newTotalDuration / newTotalCalls / 60), // Calculate new average in minutes
                    lastCallDuration: Math.round(callDuration / 60), // Last call duration in minutes
                    holdDuration: Math.round(holdDuration / 60) // Hold duration in minutes
                };
            });
            
            // Refresh call data after successful upload
            setTimeout(fetchCallData, 1000); // Small delay to ensure server processes the upload
        } catch (err) {
            console.error('Error uploading audio file:', err);
            setError('Failed to upload audio file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Format sentiment data for doughnut chart
    const sentimentChartData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
            {
                data: [
                    callMetrics.sentimentData.positive, 
                    callMetrics.sentimentData.neutral, 
                    callMetrics.sentimentData.negative
                ],
                backgroundColor: ['#00AAFF', '#41B8D5', '#2D8BBA'],
                hoverBackgroundColor: ['#00AAFF', '#41B8D5', '#2D8BBA'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        cutout: '55%',
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Show upload success message
    useEffect(() => {
        if (uploadSuccess) {
            const timer = setTimeout(() => {
                setUploadSuccess(false);
            }, 3000);
            
            return () => clearTimeout(timer);
        }
    }, [uploadSuccess]);

    return (
        <div className='flex flex-row justify-center items-center h-screen w-[50%] overflow-hidden bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />
            <div className='flex-1 flex flex-row px-10 mt-17'>
                <div className="flex-col justify-center items-center h-full w-[85%]">
                    <h1 className="text-4xl font-bold text-blue-900 mb-2">Call Center Analytics</h1>
                    
                    {/* Error message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
                            {error}
                        </div>
                    )}
                    
                    {/* Upload success message */}
                    {uploadSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                            Call uploaded successfully! Analytics updated.
                        </div>
                    )}
                    
                    {/* Loading indicator */}
                    {loading && (
                        <div className="text-blue-700 mb-4">
                            Loading...
                        </div>
                    )}
                    
                    <div className="grid grid-cols-4 gap-6 mb-2">
                        <div className="bg-white shadow-lg p-4 rounded-xl text-center w-full h-full flex flex-col justify-center items-center">
                            <h2 className="text-xl font-semibold text-gray-700">Total Calls</h2>
                            <p className="text-7xl font-bold text-blue-900">{callMetrics.totalCalls}</p>
                            <p className="text-green-500 text-xl">⬆ {callMetrics.changePercentage}% from last month</p>
                        </div>
                        <div className="grid grid-rows-2 gap-6 mb-6 h-full">
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl text-blue-900 font-semibold">Total Call Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">{callMetrics.totalCallDuration} MINS</p>
                            </div>
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl font-semibold text-blue-900">Average Call Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">{callMetrics.avgCallDuration} MINS</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-2 gap-6 mb-6 h-full">
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl font-semibold text-blue-900">Call Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">{callMetrics.lastCallDuration} MINS</p>
                            </div>
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl font-semibold text-blue-900">Hold Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">{callMetrics.holdDuration} MINS</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-lg p-4 rounded-xl text-center w-full h-full flex flex-col justify-center items-center">
                            <h2 className="text-xl font-semibold text-gray-700">Overall Sentiment</h2>
                            <div className="w-48 h-48 mb-4">
                                <Doughnut data={sentimentChartData} options={chartOptions} />
                            </div>
                            <div className="text-xl font-semibold text-blue-900">
                                NPS Score: {callMetrics.npsScore}
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-6 mb-6'>
                            <BarChart callHistory={callMetrics.callHistory} />
                            <div className='bg-white shadow-lg p-4 rounded-xl text-center ml-140 h-[27vh] w-50'>
                                <label htmlFor="audio-upload" className="cursor-pointer">
                                    <div className="px-6 py-2 bg-blue-900 text-white font-semibold rounded-xl hover:bg-blue-700 inline-block">
                                        {loading ? 'UPLOADING...' : 'UPLOAD'}
                                    </div>
                                    <input 
                                        id="audio-upload" 
                                        type="file" 
                                        accept="audio/*" 
                                        className="hidden"
                                        onChange={handleAudioUpload}
                                        disabled={loading}
                                    />
                                </label>
                                <img src={UploadIcon} alt="Upload" className='w-[80%] h-[60%] object-contain ml-5' />
                                <h1 className='font-bold text-blue-900'>Voice Call</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;