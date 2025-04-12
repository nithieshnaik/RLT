import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackgroundImage from '../assets/backgroundImage.png'
import videocall from '../assets/video-call.png'
import '../components/ToggleButton.css'
import axios from 'axios'

const Signup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/users', {
                name: fullName,
                email,
                password,
                phone
            });

            // Store token in localStorage
            if (response.data.token) {
                localStorage.setItem('userToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data));
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='relative bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <div className='absolute inset-0 flex justify-center items-center h-screen'>
                <div className='flex w-full max-w-5xl bg-white z-10 rounded-xl shadow-lg overflow-hidden'>
                    {/* Left side with form */}
                    <div className='w-2/5 p-6 ml-15 relative'>
                        <div className='absolute top-2 right-2'>
                            <button 
                                onClick={()=>navigate('/login')} 
                                className='px-3 py-1 border border-gray-300 rounded-lg shadow-md text-xl font-medium'
                            >
                                Log in
                            </button>
                        </div>
                        
                        <div className='mt-1 mb-2'>
                            <h1 className='text-3xl font-bold'>Create an account !</h1>
                            <p className='text-gray-600 text-xs mt-0.5 mb-2' style={{fontSize: "18px", fontWeight: 600}}>Enter your Details</p>
                        </div>

                        {error && (
                            <div className='mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm'>
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSignup} className='flex flex-col space-y-2'>
                            <div>
                                <label className='text-medium font-medium'>Full Name</label>
                                <div className='relative mt-0.5'>
                                    <input
                                        type="text"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className='text-medium font-medium'>Email</label>
                                <div className='relative mt-0.5'>
                                    <input
                                        type="email"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className='text-medium font-medium'>Phone No.</label>
                                <div className='relative mt-0.5'>
                                    <input
                                        type="tel"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className='text-medium font-medium'>Password</label>
                                <div className='relative mt-0.5'>
                                    <input
                                        type="password"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className='text-medium font-medium'>Re-type Password</label>
                                <div className='relative mt-0.5'>
                                    <input
                                        type="password"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            
                            <div className='pt-2'>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className='w-full bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-1.5 rounded-full'
                                >
                                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    {/* Right side with illustration */}
                    <div className='w-2.5/5 py-2 flex items-center justify-center'>
                        <img src={videocall} alt="Signup illustration" className='ml-6 w-full h-auto object-contain' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup