import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackgroundImage from '../assets/backgroundImage.png'
import communication from '../assets/communication.png'
import '../components/ToggleButton.css'
import axios from 'axios'

const Login = () => {
    const [isToggled, setIsToggled] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleToggle = () => {
        setIsToggled(!isToggled);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password
            });

            // Store the token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data));
                
                // If remember me is toggled, set a longer expiration
                if (isToggled) {
                    // The token itself has an expiration, this is just to track the user preference
                    localStorage.setItem('rememberMe', 'true');
                }
                
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='relative bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: "100vh", width: "100vw" }}>
            <div className='absolute inset-0 flex justify-center items-center h-screen'>
                <div className='flex w-200 h-120 bg-white z-10 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_6px_0_6px_-3px_rgba(0,0,0,0.1),_-6px_0_6px_-3px_rgba(0,0,0,0.1)]'>
                    {/* Left side with illustration */}
                    <div className='w-1/2 p-2'>
                        <img src={communication} alt="Communication" className='w-full h-full object-contain' />
                    </div>

                    {/* Right side with form */}
                    <div className='w-1/2 flex flex-col px-4 py-2 relative'>
                        {/* Sign up button */}
                        <div className='absolute top-2 right-2'>
                            <button onClick={() => navigate('/signup')} className='px-2 py-1 mt-2 mr-2 bg-gray-50 rounded-lg text-black text-xs font-medium shadow-sm'>
                                Sign up
                            </button>
                        </div>

                        <div className='mt-12 mr-6'>
                            <h1 className='text-xl font-bold'>Welcome Back !</h1>
                            <p className='text-gray-600 mt-0.1 mb-2' style={{fontSize: "10px", fontWeight: 600}}>Enter your email and password</p>

                            {error && (
                                <div className='mb-2 p-1 bg-red-100 border border-red-400 text-red-700 rounded text-xs'>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className='flex flex-col'>
                                <label className='text-gray-700 text-sm font-medium'>Email</label>
                                <div className='relative mb-1'>
                                    <input
                                        type="email"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        style={{height: "28px"}}
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

                                <label className='text-gray-700 text-sm font-medium'>Password</label>
                                <div className='relative mb-2'>
                                    <input
                                        type="password"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm h-6'
                                        style={{height: "28px"}}
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

                                <div className='flex justify-between items-center mb-2'>
                                    <div className='flex items-center'>
                                        <div className="toggle-container mr-1 scale-75">
                                            <div className={`toggle-button ${isToggled ? 'toggled' : ''}`} onClick={handleToggle}></div>
                                            <div className="toggle-circle"></div>
                                        </div>
                                        <span className='text-xs text-gray-700'>Remember Me</span>
                                    </div>
                                    <span className='text-xs text-gray-700'>Forgot Password ?</span>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading} 
                                    className='bg-red-500 hover:bg-red-600 text-white font-medium text-sm py-1.5 rounded-full mb-2'
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>

                                <div className='text-center'>
                                    <div className='flex items-center justify-center'>
                                        <div className='flex-1 border-t border-gray-300'></div>
                                        <span className='mx-2 text-xs text-gray-500'>or</span>
                                        <div className='flex-1 border-t border-gray-300'></div>
                                    </div>

                                    <div className='flex justify-center gap-2 mt-1.5'>
                                        <button type="button" className='flex items-center justify-center px-2 py-1 border border-gray-200 rounded-full shadow-sm text-xs'>
                                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google
                                        </button>
                                        <button type="button" className='flex items-center justify-center px-2 py-1 border border-gray-200 rounded-full shadow-sm text-xs'>
                                            <svg className="w-3 h-3 mr-1" viewBox="0 0 23 23">
                                                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                                                <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                                                <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                                                <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                                            </svg>
                                            Microsoft
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login