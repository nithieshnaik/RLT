import React from 'react';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';
import { Doughnut } from 'react-chartjs-2';
import BarChart from '../components/BarChart';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import UploadIcon from '../assets/image-10.png';

ChartJS.register(ArcElement, Tooltip, Legend);


const Home = () => {
    const data = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
            {
                data: [60, 25, 15], // Percentages (adjust based on your data)
                backgroundColor: ['#00AAFF', '#41B8D5', '#2D8BBA'],
                hoverBackgroundColor: ['#00AAFF', '#41B8D5', '#2D8BBA'],
                borderWidth: 0,
            },
        ],
    };
    const options = {
        cutout: '55%', // This makes it a donut chart (hollow center)
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };
    return (
        <div className='flex flex-row justify-center items-center h-screen w-[50%] overflow-hidden bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />
            <div className=' flex-1 flex flex-row px-10 mt-17'>
                <div className="flex-col justify-center items-center h-full w-[85%]">
                    <h1 className="text-4xl font-bold text-blue-900 mb-2">Call Center Analytics</h1>
                    <div className="grid grid-cols-4 gap-6 mb-2 ">
                        <div className="bg-white shadow-lg p-4 rounded-xl text-center w-full h-full flex flex-col justify-center items-center ">
                            <h2 className="text-xl font-semibold text-gray-700">Total Calls</h2>
                            <p className="text-7xl font-bold text-blue-900">15</p>
                            <p className="text-green-500 text-xl">⬆ 15% from yesterday</p>
                        </div>
                        <div className="grid grid-rows-2 gap-6 mb-6 h-full ">
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl text-blue-900 font-semibold">Total Call Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">162 MINS</p>
                                {/* <div className="relative flex items-start h-12">
                                    <p className="text-3xl font-bold text-blue-900">162</p>
                                    <p className="absolute bottom-0 right-0 text-sm font-bold text-blue-900 ml-1">MINS</p>
                                </div> */}
                            </div>
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl font-semibold text-blue-900">Average Call Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">45 MINS</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-2 gap-6 mb-6 h-full ">
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl font-semibold text-blue-900">Call Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">36 MINS</p>
                            </div>
                            <div className="bg-white shadow-lg p-4 rounded-xl text-center">
                                <h2 className="text-xl font-semibold text-blue-900">Hold Duration</h2>
                                <p className="text-3xl font-bold text-blue-900">45 MINS</p>
                            </div>
                        </div>
                        <div className="bg-white shadow-lg p-4 rounded-xl text-center w-full h-full flex flex-col justify-center items-center ">
                            <h2 className="text-xl font-semibold text-gray-700">Overall Sentiment</h2>
                            {/* Donut Chart */}
                            <div className="w-48 h-48 mb-4">
                                <Doughnut data={data} options={options} />
                            </div>

                        </div>

                        <div className='grid grid-cols-2 gap-6 mb-6 '>
                            <BarChart />
                            <div className='bg-white shadow-lg p-4 rounded-xl text-center ml-140 h-[27vh] w-50'>
                                <button
                                    onClick={() => console.log("clicked")}
                                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 "
                                > UPLOAD
                                </button>
                                <img src={UploadIcon} alt="Upload" className='w-[80%] h-[60%] object-contain ml-5' />
                                <h1 className='font-bold text-blue-900'>Voice Call</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Home