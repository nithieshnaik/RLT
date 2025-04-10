import React from 'react'
import BackgroundImage from '../assets/backgroundImage.png'
import LeftSidePane from '../components/LeftSidePane'

const Setting = () => {
    return (
        <div className=' flex bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <LeftSidePane />

        </div>
    )
}

export default Setting