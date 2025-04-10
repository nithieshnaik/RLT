import React from 'react'
import BackgroundImage from '../assets/backgroundImage.png'

const Home = () => {
    return (
        <div className=' flex justify-center items-center bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <div className='flex inset-0 w-180 bg-amber-200 rounded-lg' style={{height: "80vh"}}>
                {/* left side pane */}
                <div className='w-1/3 border-2 gap-1'></div>
                {/* Right Side pane */}
                <div className='w-2/3 '></div>
            </div>


        </div>
    )
}
export default Home