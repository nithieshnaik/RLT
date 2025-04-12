import React, { useState, useEffect } from 'react'
import BackgroundImage from '../assets/backgroundImage.png'
import LeftSidePane from '../components/LeftSidePane'

const Setting = () => {
    // Get initial values from localStorage or use defaults


    const [isCallDetails, setIsCallDetails] = useState(() => {
        const saved = localStorage.getItem('isCallDetails')
        return saved !== null ? JSON.parse(saved) : false
    })

    const [isCallTranslate, setIsCallTranslate] = useState(() => {
        const saved = localStorage.getItem('isCallTranslate')
        return saved !== null ? JSON.parse(saved) : true
    })

    const [isReport, setIsReport] = useState(() => {
        const saved = localStorage.getItem('isReport')
        return saved !== null ? JSON.parse(saved) : true
    })

    const [selectedLanguage, setSelectedLanguage] = useState('English')
    const languages = ['English', 'Hindi', 'Punjabi', 'Haryanvi', 'Bhojpuri', 'Maithli', 'Odia']

    // Update localStorage whenever settings change
    useEffect(() => {

        localStorage.setItem('isCallDetails', JSON.stringify(isCallDetails))
        localStorage.setItem('isCallTranslate', JSON.stringify(isCallTranslate))
        localStorage.setItem('isReport', JSON.stringify(isReport))

        // Dispatch a custom event so other components can listen to these changes
        const event = new CustomEvent('navigationSettingsChanged', {
            detail: {
                isCallDetails,
                isCallTranslate,
                isReport
            }
        })
        window.dispatchEvent(event)
    }, [isCallDetails, isCallTranslate, isReport])

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value)
    }

    return (
        <div className='flex bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane

                showCallDetails={isCallDetails}
                showCallTranslate={isCallTranslate}
                showReport={isReport}
            />

            {/* Main Content Area */}
            <div className="flex-1 p-5 flex flex-col mb-10">
                {/* Header */}
                <div className="flex justify-between items-center mt-15">
                    <h1 className="text-4xl font-bold "style={{color: "#1C398E"}}>Setting</h1>
                    {/* Language Dropdown */}
                    <div className="relative inline-block text-left">
                        <select
                            className="border border-gray-300 rounded-md p-2 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                        >
                            {languages.map((language) => (
                                <option key={language} value={language}>{language}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="bg-white rounded-lg shadow-lg p-6 flex-1 flex flex-col mt-6 overflow-hidden">
                    {/* Toggle Settings */}
                    <div className="flex flex-col space-y-4">

                        {/* Call Translator Toggle */}
                        <div className="bg-red-500 text-white rounded-lg p-4 flex justify-between items-center">
                            <span className="text-xl font-medium">Call Translator</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isCallTranslate}
                                    onChange={() => setIsCallTranslate(!isCallTranslate)}
                                />
                                <div className="w-11 h-6 bg-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-red-500 after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        {/* Call Details Toggle */}
                        <div className="bg-red-500 text-white rounded-lg p-4 flex justify-between items-center">
                            <span className="text-xl font-medium">Call Details</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isCallDetails}
                                    onChange={() => setIsCallDetails(!isCallDetails)}
                                />
                                <div className="w-11 h-6 bg-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-red-500 after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>



                        {/* Report Toggle */}
                        <div className="bg-red-500 text-white rounded-lg p-4 flex justify-between items-center">
                            <span className="text-xl font-medium">Report</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isReport}
                                    onChange={() => setIsReport(!isReport)}
                                />
                                <div className="w-11 h-6 bg-white rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-red-500 after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                    </div>

                    {/* Edit Profile Button */}
                    <div className="flex justify-end mt-8">
                        <button className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-300">
                            Edit Profile
                        </button>
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center mt-auto pt-8">
                        <div className="flex space-x-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-2">
                        <div className="flex space-x-3">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Setting