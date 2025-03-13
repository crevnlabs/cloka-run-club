'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordInput from '@/components/PasswordInput';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        age: '',
        gender: '',
        emergencyContact: '',
        instagramUsername: '',
        joinCrew: false,
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { signup } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: newValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate required fields
        if (!formData.name || !formData.email || !formData.password || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = await signup({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                age: formData.age ? parseInt(formData.age) : undefined,
                gender: formData.gender as 'male' | 'female' | 'other' | undefined,
                emergencyContact: formData.emergencyContact || undefined,
                instagramUsername: formData.instagramUsername || undefined,
                joinCrew: formData.joinCrew,
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

    return (
        <>
            <Header />
            <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 rounded-lg shadow-lg max-w-md w-full border border-zinc-800"
                >
                    <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

                    {error && (
                        <div className="p-4 rounded-md mb-4 bg-red-900/30 border border-red-800 text-red-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">
                                Full Name *
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Email *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-1">
                                    Password *
                                </label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                                    Confirm Password *
                                </label>
                                <PasswordInput
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                    required
                                    showHelperText={false}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">
                                Phone Number *
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium mb-1">
                                    Age
                                </label>
                                <input
                                    id="age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium mb-1">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="emergencyContact" className="block text-sm font-medium mb-1">
                                Emergency Contact
                            </label>
                            <input
                                id="emergencyContact"
                                name="emergencyContact"
                                type="text"
                                value={formData.emergencyContact}
                                onChange={handleChange}
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
                                value={formData.instagramUsername}
                                onChange={handleChange}
                                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 bg-zinc-900 border-zinc-700"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="joinCrew"
                                name="joinCrew"
                                type="checkbox"
                                checked={formData.joinCrew}
                                onChange={handleChange}
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

                    <div className="mt-6 text-center">
                        <p className="text-zinc-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
            <Footer />
        </>
    );
} 