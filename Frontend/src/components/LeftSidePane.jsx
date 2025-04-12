import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BackgroundImage from '../assets/backgroundImage.png'; // Adjust the path as necessary

const LeftSidePane = ({ showAgents, showCallDetails, showCallTranslate, showReport }) => {
    // State to track which navigation item is active
    const [activeItem, setActiveItem] = useState('');
    const navigate = useNavigate(); // Hook to programmatically navigate
    const location = useLocation(); // Get current location

    // State for navigation settings
    const [navSettings, setNavSettings] = useState({
        showAgents: true,
        showCallDetails: true,
        showCallTranslate: true,
        showReport: true
    });

    // Function to handle menu item clicks
    const handleMenuClick = (menuItem) => {
        setActiveItem(menuItem);
    };

    // Helper function to determine if a menu item is active
    const isActive = (menuItem) => activeItem === menuItem || location.pathname === `/${menuItem.toLowerCase().replace(/\s+/g, '-')}`;

    // Listen for direct props or for global event changes
    useEffect(() => {
        // If props are directly provided, use them
        if (showAgents !== undefined) {
            setNavSettings({
                showAgents: showAgents,
                showCallDetails: showCallDetails,
                showCallTranslate: showCallTranslate,
                showReport: showReport
            });
        } else {
            // Otherwise, try to read from localStorage
            const savedAgents = localStorage.getItem('isAgentsToggled');
            const savedCallDetails = localStorage.getItem('isCallDetails');
            const savedCallTranslate = localStorage.getItem('isCallTranslate');
            const savedReport = localStorage.getItem('isReport');
            
            setNavSettings({
                showAgents: savedAgents !== null ? JSON.parse(savedAgents) : true,
                showCallDetails: savedCallDetails !== null ? JSON.parse(savedCallDetails) : true,
                showCallTranslate: savedCallTranslate !== null ? JSON.parse(savedCallTranslate) : true,
                showReport: savedReport !== null ? JSON.parse(savedReport) : true
            });
        }

        // Also listen for global changes
        const handleSettingsChange = (event) => {
            setNavSettings({
                showAgents: event.detail.isAgentsToggled,
                showCallDetails: event.detail.isCallDetails,
                showCallTranslate: event.detail.isCallTranslate,
                showReport: event.detail.isReport
            });
        };

        window.addEventListener('navigationSettingsChanged', handleSettingsChange);
        
        return () => {
            window.removeEventListener('navigationSettingsChanged', handleSettingsChange);
        };
    }, [showAgents, showCallDetails, showCallTranslate, showReport]);

    // Set active item based on current location on mount
    useEffect(() => {
        const path = location.pathname.substring(1); // Remove leading slash
        if (path === 'home') setActiveItem('Home');
        else if (path === 'calltranslate' || path === 'call-translate') setActiveItem('Call Translate');
        else if (path === 'agentdetails' || path === 'agent-details') setActiveItem('Agent Details');
        else if (path === 'report') setActiveItem('Report');
        else if (path === 'setting' || path === 'settings') setActiveItem('Setting');
        else if (path === 'login' || path === 'logout') setActiveItem('Sign out');
    }, [location]);

    return (
        <div className="ml-42 flex justify-center items-center w-1/6 " >
            <div className="mt-7 flex flex-col justify-between items-start w-full bg-red-500 text-white rounded-r-3xl rounded-l-3xl py-4 px-4" style={{ height: "80vh" }}>
                {/* Upper Div */}
                <div onClick={()=>navigate('/profile')} className="mb-7 flex items-center gap-2 px-4 py-2 w-full">
                    <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center text-blue-900 font-bold">
                        N
                    </div>
                    <h2 className="text-xl font-medium">Nithiesh</h2>
                </div>

                {/* Middle Div */}
                <div className="flex flex-col w-full">
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Home') ? 'bg-white text-black' : 'hover:bg-red-600'}`}
                        onClick={() => {
                            handleMenuClick('Home');
                            navigate('/home');
                        }}
                    >
                        <HomeIcon className={isActive('Home') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Home') ? 'text-black' : 'text-white'}`}>Home</p>
                    </div>
                    
                    {navSettings.showCallTranslate && (
                        <div
                            className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Call Translate') ? 'bg-white text-black' : 'hover:bg-red-600'}`}
                            onClick={() => {
                                handleMenuClick('Call Translate');
                                navigate('/calltranslate');
                            }}
                        >
                            <CallIcon className={isActive('Call Translate') ? 'text-black' : 'text-white'} />
                            <p className={`font-medium ${isActive('Call Translate') ? 'text-black' : 'text-white'}`}>Call Translate</p>
                        </div>
                    )}
                    
                    {navSettings.showCallDetails && (
                        <div
                            className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Agent Details') ? 'bg-white text-black' : 'hover:bg-red-600'}`}
                            onClick={() => {
                                handleMenuClick('Call Details');
                                navigate('/calldetails');
                            }}
                        >
                            <PersonIcon className={isActive('Agent Details') ? 'text-black' : 'text-white'} />
                            <p className={`font-medium ${isActive('Agent Details') ? 'text-black' : 'text-white'}`}>Call Details</p>
                        </div>
                    )}
                    
                    {navSettings.showReport && (
                        <div
                            className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Report') ? 'bg-white text-black' : 'hover:bg-red-600'}`}
                            onClick={() => {
                                handleMenuClick('Report');
                                navigate('/report');
                            }}
                        >
                            <AssessmentIcon className={isActive('Report') ? 'text-black' : 'text-white'} />
                            <p className={`font-medium ${isActive('Report') ? 'text-black' : 'text-white'}`}>Report</p>
                        </div>
                    )}
                </div>

                {/* Lower Div */}
                <div className="flex flex-col justify-center items-center w-full mt-auto">
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Setting') ? 'bg-white text-black' : 'hover:bg-red-600'}`}
                        onClick={() => {
                            handleMenuClick('Setting');
                            navigate('/setting');
                        }}
                    >
                        <SettingsIcon className={isActive('Setting') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Setting') ? 'text-black' : 'text-white'}`}>Setting</p>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Sign out') ? 'bg-white text-black' : 'hover:bg-red-600'}`}
                        onClick={() => {
                            handleMenuClick('Sign out');
                            navigate('/login');
                        }}
                    >
                        <LogoutIcon className={isActive('Sign out') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Sign out') ? 'text-black' : 'text-white'}`}>Sign out</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftSidePane;