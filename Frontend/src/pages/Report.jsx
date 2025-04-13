import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

const Report = () => {
    const [reportData, setReportData] = useState({
        callDuration: 0,
        timeStamps: 0,
        agentPerformance: 0,
        customerSentiment: 0,
        npsScore: 0,
        totalCalls: 0,
        sentiment: {
            positive: 0,
            neutral: 0,
            negative: 0
        },
        callTrends: [],
        sentimentTrends: [],
        recentCalls: []
    });
    const [loading, setLoading] = useState(true);
    
    // Date filter states
    const [dateRange, setDateRange] = useState('week'); // 'day', 'week', 'month', 'year'
    const [startDate, setStartDate] = useState(getDefaultStartDate('week'));
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [customRange, setCustomRange] = useState(false);
    
    // Helper function to calculate NPS from sentiment - MOVED UP HERE
    const calculateNpsFromSentiment = (sentiment) => {
        if (!sentiment) return 0;
        return Math.min(100, Math.max(0, Math.round(
            ((sentiment.positive - sentiment.negative) / 100) * 100
        )));
    };
    
    // Helper function to calculate average metric from calls
    const calculateAvgMetric = (calls, metricName) => {
        if (!calls || calls.length === 0) return 0;
        const sum = calls.reduce((total, call) => total + (call[metricName] || 0), 0);
        return Math.round(sum / calls.length);
    };
    
    // Get default start date based on range
    function getDefaultStartDate(range) {
        const date = new Date();
        switch(range) {
            case 'day':
                return date.toISOString().split('T')[0];
            case 'week':
                date.setDate(date.getDate() - 7);
                return date.toISOString().split('T')[0];
            case 'month':
                date.setMonth(date.getMonth() - 1);
                return date.toISOString().split('T')[0];
            case 'year':
                date.setFullYear(date.getFullYear() - 1);
                return date.toISOString().split('T')[0];
            default:
                date.setDate(date.getDate() - 7);
                return date.toISOString().split('T')[0];
        }
    }
    
    useEffect(() => {
        if (!customRange) {
            setStartDate(getDefaultStartDate(dateRange));
        }
    }, [dateRange, customRange]);
    
    useEffect(() => {
        const fetchReportData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // Include date range params in API request
                const response = await axios.get('/api/calls/analytics', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { startDate, endDate }
                });
                
                // Process the response data
                setReportData({
                    callDuration: response.data.averageCallDuration || 0,
                    timeStamps: response.data.totalDuration ? Math.round(response.data.totalDuration / 60) : 0, // Convert to minutes
                    agentPerformance: response.data.agentPerformance || calculateAvgMetric(response.data.calls, 'agentPerformanceScore'),
                    customerSentiment: response.data.customerSentiment || calculateAvgMetric(response.data.calls, 'customerSentimentScore'),
                    npsScore: response.data.npsScore || 42,
                    totalCalls: response.data.totalCalls || 0,
                    sentiment: {
                        positive: response.data.sentimentData?.positive || 60,
                        neutral: response.data.sentimentData?.neutral || 25,
                        negative: response.data.sentimentData?.negative || 15
                    },
                    callTrends: response.data.callTrends || [],
                    sentimentTrends: response.data.sentimentTrends || generateSampleSentimentTrends(startDate, endDate),
                    recentCalls: response.data.calls || []
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching report data:', error);
                setLoading(false);
            }
        };
        
        fetchReportData();
    }, [startDate, endDate]);
    
    // Sample data function (remove this when backend provides real data)
    const generateSampleSentimentTrends = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const trends = [];
        
        for (let i = 0; i <= diffDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            trends.push({
                date: date.toISOString().split('T')[0],
                positive: 40 + Math.floor(Math.random() * 30),
                neutral: 20 + Math.floor(Math.random() * 20),
                negative: 5 + Math.floor(Math.random() * 20)
            });
        }
        
        return trends;
    };
    
    // Chart data preparation based on the dynamic reportData
    const sentimentData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
            {
                data: [
                    reportData.sentiment.positive, 
                    reportData.sentiment.neutral, 
                    reportData.sentiment.negative
                ],
                backgroundColor: ['#00AAFF', '#41B8D5', '#2D8BBA'],
                hoverBackgroundColor: ['#00AAFF', '#41B8D5', '#2D8BBA'],
                borderWidth: 0,
            },
        ],
    };
    
    const semiCircleData = {
        labels: ['NPS'],
        datasets: [
            {
                data: [reportData.npsScore, 100 - reportData.npsScore], // Dynamic NPS score
                backgroundColor: ['#00AAFF', '#E5F6FD'],
                borderWidth: 0,
            },
        ],
    };
    
    // Call metrics data for supplementary chart
    const callMetricsData = {
        labels: ['Agent Performance', 'Customer Sentiment'],
        datasets: [
            {
                data: [reportData.agentPerformance, reportData.customerSentiment],
                backgroundColor: ['#00AAFF', '#41B8D5'],
                borderWidth: 0,
            },
        ],
    };
    
    // Trend chart data
    const sentimentTrendData = {
        labels: reportData.sentimentTrends.map(trend => trend.date),
        datasets: [
            {
                label: 'Positive',
                data: reportData.sentimentTrends.map(trend => trend.positive),
                fill: false,
                backgroundColor: '#00AAFF',
                borderColor: '#00AAFF',
                tension: 0.1
            },
            {
                label: 'Neutral',
                data: reportData.sentimentTrends.map(trend => trend.neutral),
                fill: false,
                backgroundColor: '#41B8D5',
                borderColor: '#41B8D5',
                tension: 0.1
            },
            {
                label: 'Negative',
                data: reportData.sentimentTrends.map(trend => trend.negative),
                fill: false,
                backgroundColor: '#2D8BBA',
                borderColor: '#2D8BBA',
                tension: 0.1
            }
        ]
    };
    
    // Recent calls NPS data
    const recentCallsNpsData = {
        labels: reportData.recentCalls.slice(0, 5).map((_, index) => `Call ${index + 1}`),
        datasets: [
            {
                label: 'NPS Score',
                data: reportData.recentCalls.slice(0, 5).map(call => calculateNpsFromSentiment(call.sentiment)),
                backgroundColor: '#00AAFF',
            }
        ]
    };
    
    // Chart options
    const options = {
        cutout: '55%',
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };
    
    const semiCircleOptions = {
        rotation: -90,
        circumference: 180,
        cutout: '70%',
        plugins: {
            legend: { display: false },
        },
    };
    
    const lineChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sentiment Trends Over Time',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    };
    
    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'NPS Scores of Recent Calls',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'NPS Score'
                }
            }
        }
    };
    
    // Handle date range changes
    const handleDateRangeChange = (e) => {
        const range = e.target.value;
        setDateRange(range);
        if (range !== 'custom') {
            setCustomRange(false);
        } else {
            setCustomRange(true);
        }
    };
    
    // Handle custom date changes
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };
    
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading report data...</div>;
    }
    
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-no-repeat bg-cover" style={{ backgroundImage: `url(${BackgroundImage})` }}>
            <LeftSidePane />
            <div className="flex flex-1 px-10 py-6 overflow-y-auto mt-15">
                <div className="w-full flex flex-col">
                    {/* Header with Date Filters */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-5xl font-bold text-blue-900">Call Analytics Report</h1>
                        <div className="flex items-center gap-4">
                            <div className="text-blue-900 text-lg font-bold">
                                Total Calls: {reportData.totalCalls}
                            </div>
                            <div>
                                <label htmlFor="dateRange" className="mr-2 text-gray-700">Date Range:</label>
                                <select 
                                    id="dateRange" 
                                    className="p-2 border rounded-md"
                                    value={customRange ? 'custom' : dateRange}
                                    onChange={handleDateRangeChange}
                                >
                                    <option value="day">Today</option>
                                    <option value="week">Last 7 days</option>
                                    <option value="month">Last 30 days</option>
                                    <option value="year">Last year</option>
                                    <option value="custom">Custom range</option>
                                </select>
                            </div>
                            
                            {customRange && (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="date" 
                                        className="p-2 border rounded-md"
                                        value={startDate}
                                        onChange={handleStartDateChange}
                                    />
                                    <span>to</span>
                                    <input 
                                        type="date" 
                                        className="p-2 border rounded-md"
                                        value={endDate}
                                        onChange={handleEndDateChange}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* First row - Call Info and NPS */}
                    <div className="flex gap-3 mb-4">
                        {/* Left Card - Info + Chart */}
                        <div className="bg-white shadow-lg p-6 rounded-2xl w-1/3 flex flex-col justify-center items-start">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">CALL METRICS</h2>
                            <p className="text-md mb-3 text-gray-800">Total Call Duration: <b>{reportData.timeStamps} Min</b></p>
                            <p className="text-md mb-3 text-gray-800">Average Call Duration: <b>{reportData.callDuration} Min</b></p>
                            <p className="text-md mb-3 text-gray-800">Agent Performance Score: <b>{reportData.agentPerformance}</b></p>
                            <p className="text-md mb-6 text-gray-800">Customer Sentiment Score: <b>{reportData.customerSentiment}</b></p>
                            <div className="w-full flex justify-center">
                                <div className="w-56 h-56 mt-4">
                                    <Doughnut 
                                        data={callMetricsData} 
                                        options={{
                                            ...options,
                                            plugins: {
                                                ...options.plugins,
                                                title: {
                                                    display: true,
                                                    text: 'Performance vs Sentiment',
                                                    font: { size: 16 }
                                                }
                                            }
                                        }} 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Center Card - NPS */}
                        <div className="bg-white shadow-lg p-6 rounded-2xl w-1/3 flex flex-col justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-blue-900">NPS (NET PROMOTER SCORE)</h2>
                            </div>
                            <div className="flex flex-col justify-center items-center h-full">
                                <div className="w-64 h-40 flex justify-center items-center">
                                    <Doughnut data={semiCircleData} options={semiCircleOptions} />
                                </div>
                                <div className="text-6xl font-bold text-blue-900 mt-4">{reportData.npsScore}</div>
                                <p className="text-gray-600 mt-2">Overall NPS Score</p>
                            </div>
                            <div className="w-full mt-4">
                                <Bar data={recentCallsNpsData} options={barChartOptions} height={120} />
                            </div>
                        </div>
                        
                        {/* Right Card - Sentiment */}
                        <div className="bg-white shadow-lg p-6 rounded-2xl w-1/3 flex flex-col">
                            <h2 className="text-2xl font-bold text-blue-900 mb-4">SENTIMENT ANALYSIS</h2>
                            <div className="flex flex-col items-center">
                                <div className="w-56 h-56">
                                    <Doughnut 
                                        data={sentimentData} 
                                        options={{
                                            ...options,
                                            plugins: {
                                                ...options.plugins,
                                                title: {
                                                    display: true,
                                                    text: 'Average Sentiment Breakdown',
                                                    font: { size: 16 }
                                                }
                                            }
                                        }} 
                                    />
                                </div>
                                <div className="text-xl text-blue-900 mt-6 w-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Positive:</span>
                                        <span className="font-bold">{reportData.sentiment.positive}%</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Neutral:</span>
                                        <span className="font-bold">{reportData.sentiment.neutral}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Negative:</span>
                                        <span className="font-bold">{reportData.sentiment.negative}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Second row - Trend Charts */}
                    <div className="bg-white shadow-lg p-6 rounded-2xl mt-6 w-full">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4">SENTIMENT TRENDS OVER TIME</h2>
                        <div className="h-64 w-full flex justify-center items-center">
                            <Line data={sentimentTrendData} options={lineChartOptions} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Report;