import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from '../assets/backgroundImage.png';
import LeftSidePane from '../components/LeftSidePane';

const Profile = () => {
  const [user, setUser] = useState({ name: '', email: '', phone: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : '';
  };

  return (
    <div
      className="flex flex-row h-screen w-screen overflow-hidden bg-no-repeat bg-cover"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <LeftSidePane />
      <div className="flex flex-1 px-10 py-6 mt-5">
        <div className="relative w-[80%] flex flex-col justify-center">
          {/* Header */}
          <h1 className="text-5xl font-bold text-blue-900 mb-5">Profile</h1>

          {/* Card */}
          <div className="relative bg-white shadow-2xl p-6 rounded-2xl h-[75%]">
            <div className="mb-7 flex items-center gap-2 px-4 py-2 w-full">
              <div className="bg-white rounded-full h-13 w-13 flex items-center justify-center text-blue-900 font-bold text-3xl border border-blue-900">
                {getFirstLetter(user.name)}
              </div>
              <h2 className="text-2xl font-medium ml-3 text-blue-900">{user.name}</h2>
            </div>

            <div className="flex flex-row justify-between mb-3 font-semibold">
              <div className="flex flex-col text-2xl ml-25">
                <p>Name</p>
                <p>Email</p>
                <p>Contact</p>
              </div>
              <div className="flex flex-col text-2xl mr-5 items-center">
                <p>{user.name}</p>
                <p>{user.email}</p>
                <p>{user.phone}</p>
              </div>
            </div>

            {/* Edit Button */}
            <button className="absolute bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full bottom-6 right-6">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;