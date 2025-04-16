import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundImage from '../assets/backgroundImage.png';
import communication from '../assets/communication.png';
import '../components/ToggleButton.css';
import axios from 'axios';
// Import the Google OAuth components
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isToggled, setIsToggled] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Google Client ID - replace with your actual Client ID from Google Cloud Console
    const GOOGLE_CLIENT_ID = "521647966541-bpamcibjkjfdekv3f4pfjadn6a320r42.apps.googleusercontent.com";

    // Check for remembered credentials on component mount
    useEffect(() => {
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
            setIsToggled(true);
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            if (userData.email) {
                setEmail(userData.email);
            }
            
            // For security reasons, we don't store the actual password in localStorage
            // Instead, we just pre-fill the email and set the toggle
            
            // Optionally, you could store an encrypted version of the password
            // and decrypt it here, but that approach has security implications
        }
    }, []);

    const handleToggle = () => {
        setIsToggled(!isToggled);
        
        // If toggling off, clear the rememberMe flag
        if (isToggled) {
            localStorage.removeItem('rememberMe');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password,
            });

            // Store the token in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                
                // Store user data including email for remember me feature
                const userData = {...response.data, email};
                localStorage.setItem('userData', JSON.stringify(userData));

                // If remember me is toggled, set the flag
                if (isToggled) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }

                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Google login success
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            setIsLoading(true);
            
            // Get the credential token
            const { credential } = credentialResponse;
            
            // Send to your backend
            const response = await axios.post('http://localhost:5000/api/users/google-login', {
                token: credential,
            });
            
            // Store the token and user data
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data));
                
                if (isToggled) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                
                navigate('/home');
            }
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.response?.data?.message || 'Failed to login with Google.');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle Google login error
    const handleGoogleLoginError = () => {
        setError('Google sign-in was unsuccessful. Please try again.');
    };

    return (
        <div className='relative bg-no-repeat bg-cover' style={{ backgroundImage: `url(${BackgroundImage})`, height: '100vh', width: '100vw' }}>
            <div className='absolute inset-0 flex justify-center items-center h-screen'>
                <div className='flex w-200 h-120 bg-white z-10 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),_6px_0_6px_-3px_rgba(0,0,0,0.1),_-6px_0_6px_-3px_rgba(0,0,0,0.1)]'>
                    {/* Left side with illustration */}
                    <div className='w-1/2 p-2'>
                        <img src={communication} alt="Communication" className='w-full h-full object-contain' />
                    </div>

                    {/* Right side with form */}
                    <div className='w-1/2 flex flex-col px-4 py-8 relative'>
                        {/* Sign up button */}
                        <div className='absolute top-2 right-2'>
                            <button
                                onClick={() => navigate('/signup')}
                                className='text-gray-700 px-4 py-2 mt-2 mr-2 bg-gray-50 rounded-lg  text-sm font-medium shadow-sm'
                            >
                                Sign up
                            </button>
                        </div>

                        <div className='mt-12 mr-6'>
                            <h1 className='text-3xl font-bold'>Welcome Back !</h1>
                            <p className='text-gray-600 mt-0.1 mb-2' style={{ fontSize: '13px', fontWeight: 600 }}>
                                Enter your email and password
                            </p>

                            {error && (
                                <div className='mb-2 p-1 bg-red-100 border border-red-400 text-red-700 rounded text-xs'>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className='flex flex-col'>
                                <label className='text-gray-700 text-medium font-medium'>Email</label>
                                <div className='relative mb-1'>
                                    <input
                                        type="email"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm'
                                        style={{ height: '32px' }}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <label className='text-gray-700 text-medium font-medium'>Password</label>
                                <div className='relative mb-2'>
                                    <input
                                        type="password"
                                        className='w-full py-1.5 px-2 border border-gray-300 rounded-md text-sm h-6'
                                        style={{ height: '32px' }}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <div className='absolute right-2 top-1.5 text-gray-500'>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                </div>

                                <div className='flex justify-between items-center mb-2'>
                                    <div className='flex items-center'>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={isToggled}
                                                onChange={handleToggle}
                                            />
                                            <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-red-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                        </label>
                                        <span className='text-xs text-gray-700 ml-2 mr-2'>Remember Me</span>
                                    </div>
                                    <span className='text-xs text-gray-700'>Forgot Password ?</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className='bg-red-500 hover:bg-red-600 text-white font-medium text-medium py-1.5 rounded-full mt-1 mb-2'
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>

                                <div className='text-center'>
                                    <div className='flex items-center justify-center py-1'>
                                        <div className='flex-1 border-t border-gray-300'></div>
                                        <span className='mx-2 text-xs text-gray-500'>or</span>
                                        <div className='flex-1 border-t border-gray-300'></div>
                                    </div>

                                    <div className='flex justify-center gap-2 mt-1.5'>
                                        {/* Replace the Google button with Google OAuth Provider */}
                                        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleLoginSuccess}
                                                onError={handleGoogleLoginError}
                                                useOneTap
                                                shape="pill"
                                            />
                                        </GoogleOAuthProvider>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;