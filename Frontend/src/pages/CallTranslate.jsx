import React, { useState } from 'react'
import BackgroundImage from '../assets/backgroundImage.png'
import LeftSidePane from '../components/LeftSidePane'

const CallTranslate = () => {
    const [sourceLanguage, setSourceLanguage] = useState('English')
    const [targetLanguage, setTargetLanguage] = useState('Hindi')

    const languages = ['English', 'Hindi', 'Punjabi', 'Haryanvi', 'Bhojpuri', 'Maithli', 'Odia']

    return (
        <div className='flex bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />

            {/* Main Content Area */}
            <div className="flex-1 p-5 flex flex-col mb-10" >
                {/* Header */}
                <div className="flex items-center  mt-15">
                    <h1 className="text-4xl font-bold text-navy-900 mr-4">Call Translator</h1>

                    {/* File Upload */}
                    <div className="flex items-center">
                        <label
                            htmlFor="audio-upload"
                            className="cursor-pointer  text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200" style={{ backgroundColor: "#1C398E" }}
                        >
                            Upload Audio
                        </label>
                        <input
                            id="audio-upload"
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    console.log("Uploaded file:", file);
                                    // Add your file handling logic here
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Translator Box */}
                <div className="bg-white rounded-lg shadow-lg pb-5 pt-2 pl-6 pr-6 flex-1 flex flex-col overflow-hidden">

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
                                            <option value="">Language</option>
                                            {languages.map(lang => (
                                                <option key={`source-${lang}`} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50 flex-1 overflow-y-auto">
                                {/* Conversation */}
                                <div className="mb-4 flex">
                                    <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">P</div>
                                    <div className="flex-1">
                                        <p>Hi there! I'm having trouble figuring out how to meal prep for the week. Do you have any suggestions?</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex">
                                    <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">A</div>
                                    <div className="flex-1">
                                        <p>Hello! I'd be happy to help with meal prepping. What kind of meals are you looking for? Any dietary preferences or restrictions I should know about?</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex">
                                    <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">P</div>
                                    <div className="flex-1">
                                        <p>I'm trying to eat more vegetables, and I don't have a lot of time in the evenings to cook.</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex">
                                    <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">A</div>
                                    <div className="flex-1">
                                        <p>That makes sense! You could try roasting a large batch of mixed vegetables on Sunday to use throughout the week. Pair them with pre-cooked proteins like rotisserie chicken or canned beans for quick meals.</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">P</div>
                                    <div className="flex-1">
                                        <p>That's a good idea!</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Target Language - Making it equal size to left column */}
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
                                            <option value="">Language</option>
                                            {languages.map(lang => (
                                                <option key={`target-${lang}`} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 bg-gray-50 flex-1 overflow-y-auto">
                                {/* Conversation in Hindi */}
                                <div className="mb-4 flex">
                                    <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">P</div>
                                    <div className="flex-1">
                                        <p>नमस्ते! मुझे पूरे सप्ताह के लिए मील प्रेप करने में परेशानी हो रही है। क्या आपके पास कोई सुझाव है?</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex">
                                    <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">A</div>
                                    <div className="flex-1">
                                        <p>नमस्ते! मैं मील प्रेप में आपकी मदद करने में खुशी महसूस करूंगा। आप किस प्रकार के भोजन की तलाश कर रहे हैं? कोई आहार संबंधी प्राथमिकताएं या प्रतिबंध हैं जिनके बारे में मुझे जानना चाहिए?</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex">
                                    <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">P</div>
                                    <div className="flex-1">
                                        <p>मैं अधिक सब्जियां खाने की कोशिश कर रहा हूं, और शाम को खाना पकाने के लिए मेरे पास ज्यादा समय नहीं है</p>
                                    </div>
                                </div>

                                <div className="mb-4 flex">
                                    <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">A</div>
                                    <div className="flex-1">
                                        <p>यह समझ में आता है! आप रविवार को मिश्रित सब्जियों का एक बड़ा बैच रोस्ट करके पूरे सप्ताह पर उपयोग कर सकते हैं। जल्दी भोजन के लिए उन्हें पूर्व पके हुए प्रोटीन जैसे रोटिसरी चिकन या टिनबंद फलियों के साथ जोड़ें</p>
                                    </div>
                                </div>

                                <div className="flex">
                                    <div className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 flex-shrink-0">P</div>
                                    <div className="flex-1">
                                        <p>यह एक अच्छा विचार है!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CallTranslate