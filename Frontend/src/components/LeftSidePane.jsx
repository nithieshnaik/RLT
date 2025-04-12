import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import BackgroundImage from '../assets/backgroundImage.png'; // Adjust the path as necessary

const LeftSidePane = () => {
    // State to track which navigation item is active
    const [activeItem, setActiveItem] = useState('');
    const navigate = useNavigate(); // Hook to programmatically navigate

    // Function to handle menu item clicks
    const handleMenuClick = (menuItem) => {
        setActiveItem(menuItem);
    };

    // Helper function to determine if a menu item is active
    const isActive = (menuItem) => activeItem === menuItem;

    return (
        <div className="ml-42 flex justify-center items-center w-1/6 " >
            <div className="mt-7 flex flex-col justify-between items-start w-full bg-red-500 text-white rounded-r-3xl rounded-l-3xl py-4 px-4" style={{ height: "80vh" }}>
                {/* Upper Div */}
                <div onClick={()=>navigate('/profile')}className="mb-7 flex items-center gap-2 px-4 py-2 w-full">
                    <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center text-blue-900 font-bold">
                        N
                    </div>
                    <h2 className="text-xl font-medium">Nithiesh</h2>
                </div>

                {/* Middle Div */}
                <div className="flex flex-col w-full">
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Home') ? 'bg-white text-black' : 'hover:bg-red-600'
                            }`}
                        onClick={() => {handleMenuClick('Home');
                            navigate('/home');
                        }}
                    >
                        <HomeIcon className={isActive('Home') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Home') ? 'text-black' : 'text-white'}`}>Home</p>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Call Translate') ? 'bg-white text-black' : 'hover:bg-red-600'
                            }`}
                        onClick={() => {handleMenuClick('Call Translate');
                            navigate('/calltranslate');
                        }}
                    >
                        <CallIcon className={isActive('Call Translate') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Call Translate') ? 'text-black' : 'text-white'}`}>Call Translate</p>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Agent Details') ? 'bg-white text-black' : 'hover:bg-red-600'
                            }`}
                        onClick={() => {handleMenuClick('Agent Details');
                            navigate('/agentdetails');
                        }}
                    >
                        <PersonIcon className={isActive('Agent Details') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Agent Details') ? 'text-black' : 'text-white'}`}>Agent Details</p>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Report') ? 'bg-white text-black' : 'hover:bg-red-600'
                            }`}
                        onClick={() => {handleMenuClick('Report');
                            navigate('/report');
                        }}
                    >
                        <AssessmentIcon className={isActive('Report') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Report') ? 'text-black' : 'text-white'}`}>Report</p>
                    </div>
                </div>

                {/* Lower Div */}
                <div className="flex flex-col justify-center items-center w-full mt-auto">
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Setting') ? 'bg-white text-black' : 'hover:bg-red-600'
                            }`}
                        onClick={() => {handleMenuClick('Setting');
                            navigate('/setting');
                        }}
                    >
                        <SettingsIcon className={isActive('Setting') ? 'text-black' : 'text-white'} />
                        <p className={`font-medium ${isActive('Setting') ? 'text-black' : 'text-white'}`}>Setting</p>
                    </div>
                    <div
                        className={`flex items-center gap-2 px-4 py-2 mx-2 cursor-pointer rounded-lg transition duration-200 ${isActive('Sign out') ? 'bg-white text-black' : 'hover:bg-red-600'
                            }`}
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