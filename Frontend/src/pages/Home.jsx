import React, { useState, useEffect } from 'react';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';
import { Doughnut } from 'react-chartjs-2';
import BarChart from '../components/BarChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import UploadIcon from '../assets/image-10.png';
import axios from 'axios'; // Make sure axios is installed

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
    // State for all call metrics
    const [callMetrics, setCallMetrics] = useState({
        totalCalls: 15, // Default values shown initially
        totalCallDuration: 162,
        avgCallDuration: 45,
        lastCallDuration: 36,
        holdDuration: 45,
        sentimentData: {
            positive: 60,
            neutral: 25,
            negative: 15
        }, // Default sentiment data
        npsScore: 45, // Default NPS score
        changePercentage: 15,
        callHistory: null, // For the bar chart
        sentimentTrends: [] // For sentiment trends
    });

    // State for loading and errors
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Fetch initial call data when component mounts
    useEffect(() => {
        fetchCallData();
    }, []);

    // Function to fetch call data from API
    const fetchCallData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Get token from localStorage - using 'token' consistently
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
                totalCallDuration: Math.round(response.data.totalDuration / 60) || 0, // Convert seconds to minutes
                avgCallDuration: response.data.averageCallDuration || 0, // Already in minutes from backend
                lastCallDuration: response.data.calls && response.data.calls.length > 0 ? 
                    Math.round(response.data.calls[0].duration / 60) : 0, // Most recent call duration
                holdDuration: response.data.calls && response.data.calls.length > 0 ? 
                    Math.round(response.data.calls[0].holdDuration / 60) : 0, // Most recent hold duration
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
        
        // Add duration and hold duration (for demo purposes - in a real app you'd calculate these)
        formData.append('duration', '180'); // 3 minutes in seconds
        formData.append('holdDuration', '60'); // 1 minute in seconds

        try {
            // Use the same token key as in fetchCallData for consistency
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication required. Please log in again.');
                setLoading(false);
                return;
            }
            
            console.log('Uploading audio file...');
            
            // Upload the audio file
            const response = await axios.post('/api/calls/record', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Upload response:', response.data);
            setUploadSuccess(true);
            
            // Refresh call data after successful upload
            fetchCallData();
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