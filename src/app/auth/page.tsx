'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordInput from '@/components/PasswordInput';

export default function AuthPage() {
    const searchParams = useSearchParams();
    const initialMode = searchParams.get('mode') === 'signup' ? false : true;
    const [isLoginMode, setIsLoginMode] = useState(initialMode);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const redirect = searchParams.get('redirect') || '/profile';
    const { login, signup } = useAuth();

    // Update mode when URL parameters change
    useEffect(() => {
        setIsLoginMode(searchParams.get('mode') !== 'signup');
    }, [searchParams]);

    // Login state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Signup state
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        age: '',
        gender: '',
        emergencyContact: '',
        instagramUsername: '',
        joinCrew: false,
        acceptTerms: false,
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setSignupData({ ...signupData, [name]: newValue });
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(loginData.email, loginData.password);

            if (result.success) {
                router.push(redirect);
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate required fields
        if (!signupData.name || !signupData.email || !signupData.password || !signupData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        // Validate terms acceptance
        if (!signupData.acceptTerms) {
            setError('You must accept the Terms and Conditions to continue');
            return;
        }

        setIsLoading(true);

        try {
            const result = await signup({
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
                phone: signupData.phone,
                age: signupData.age ? parseInt(signupData.age) : undefined,
                gender: signupData.gender as 'male' | 'female' | 'other' | undefined,
                emergencyContact: signupData.emergencyContact || undefined,
                instagramUsername: signupData.instagramUsername || undefined,
                joinCrew: signupData.joinCrew,
            });

            if (result.success) {
                router.push('/profile');
            } else {
                setError(result.message);
            }
        } catch (_err) {
            console.error(_err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        const newMode = !isLoginMode;
        setIsLoginMode(newMode);
        setError('');

        // Update URL to reflect the current mode
        const newUrl = new URL(window.location.href);
        if (!newMode) {
            newUrl.searchParams.set('mode', 'signup');
        } else {
            newUrl.searchParams.delete('mode');
        }

        // Update the URL without refreshing the page
        window.history.pushState({}, '', newUrl.toString());
    };

    return (
        <>
            <Header />
            <div className="bg-black text-white flex items-center justify-center px-4 py-12">
                <div className="container mx-auto max-w-6xl flex flex-col md:flex-row gap-8 items-center">
                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-8 rounded-lg shadow-lg w-full md:w-1/2 border border-zinc-800"
                    >
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setIsLoginMode(true)}
                                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${isLoginMode
                                        ? 'bg-white text-black'
                                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLoginMode(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${!isLoginMode
                                        ? 'bg-white text-black'
                                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-center mb-6">
                            {isLoginMode ? 'Login' : 'Sign Up'}
                        </h1>

                        {error && (
                            <div className="p-4 rounded-md mb-4 bg-red-900/30 border border-red-800 text-red-300">
                                {error}
                            </div>
                        )}

                        {isLoginMode ? (
                            // Login Form
                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={loginData.email}
                                        onChange={handleLoginChange}
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                                        Password
                                    </label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                        required
                                        showHelperText={false}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-md transition-colors bg-white text-black hover:bg-zinc-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>
                        ) : (
                            // Signup Form
                            <form onSubmit={handleSignupSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={signupData.name}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="gender" className="block text-sm font-medium mb-1">
                                            Gender
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={signupData.gender}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="signup-email" className="block text-sm font-medium mb-1">
                                            Email *
                                        </label>
                                        <input
                                            id="signup-email"
                                            name="email"
                                            type="email"
                                            value={signupData.email}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="signup-password" className="block text-sm font-medium mb-1">
                                            Password *
                                        </label>
                                        <PasswordInput
                                            id="signup-password"
                                            name="password"
                                            value={signupData.password}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                            required
                                            minLength={6}
                                        />
                                    </div>


                                </div>

                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-3">
                                        <label htmlFor="age" className="block text-sm font-medium mb-1">
                                            Age
                                        </label>
                                        <input
                                            id="age"
                                            name="age"
                                            type="number"
                                            value={signupData.age}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                        />
                                    </div>

                                    <div className="col-span-9">
                                        <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                            Phone Number *
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={signupData.phone}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="emergencyContact" className="block text-sm font-medium mb-1">
                                            Emergency Contact
                                        </label>
                                        <input
                                            id="emergencyContact"
                                            name="emergencyContact"
                                            type="text"
                                            value={signupData.emergencyContact}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="instagramUsername" className="block text-sm font-medium mb-1">
                                            Instagram Username
                                        </label>
                                        <input
                                            id="instagramUsername"
                                            name="instagramUsername"
                                            type="text"
                                            value={signupData.instagramUsername}
                                            onChange={handleSignupChange}
                                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center mb-3">
                                    <input
                                        id="acceptTerms"
                                        name="acceptTerms"
                                        type="checkbox"
                                        checked={signupData.acceptTerms}
                                        onChange={handleSignupChange}
                                        className="h-4 w-4 text-white focus:ring-white border-zinc-700 rounded"
                                        required
                                    />
                                    <label htmlFor="acceptTerms" className="ml-2 block text-sm">
                                        I accept the <a href="/terms" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Terms and Conditions</a> *
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="joinCrew"
                                        name="joinCrew"
                                        type="checkbox"
                                        checked={signupData.joinCrew}
                                        onChange={handleSignupChange}
                                        className="h-4 w-4 text-white focus:ring-white border-zinc-700 rounded"
                                    />
                                    <label htmlFor="joinCrew" className="ml-2 block text-sm">
                                        I want to join the crew
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full py-3 rounded-md transition-colors bg-white text-black hover:bg-zinc-200 mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {isLoading ? 'Signing up...' : 'Sign Up'}
                                </button>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-zinc-400">
                                {isLoginMode ? "Don't have an account?" : "Already have an account?"}{' '}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="text-white hover:underline"
                                >
                                    {isLoginMode ? 'Sign up' : 'Login'}
                                </button>
                            </p>
                        </div>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="hidden md:block w-full md:w-1/2"
                    >
                        <div className="relative h-full">
                            <div className="rounded-lg overflow-hidden shadow-2xl border border-zinc-800">
                                <img
                                    src="/images/runclub.png"
                                    alt="Run Club"
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 bg-black/70 p-4 rounded-lg backdrop-blur-sm">
                                <h3 className="text-xl font-bold mb-2">Join Our Running Community</h3>
                                <p className="text-zinc-300">Connect with fellow runners, track your progress, and participate in exciting events!</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </>
    );
} 