'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PasswordInput from '@/components/PasswordInput';

export default function EditProfilePage() {
    const { user, isLoading, isAuthenticated, updateProfile } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        gender: '',
        emergencyContact: '',
        instagramUsername: '',
        joinCrew: false,
        currentPassword: '',
        newPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [changePassword, setChangePassword] = useState(false);

    // Redirect if not authenticated (this is a backup to middleware)
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);

    // Populate form with user data when available
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                age: user.age ? String(user.age) : '',
                gender: user.gender || '',
                emergencyContact: user.emergencyContact || '',
                instagramUsername: user.instagramUsername || '',
                joinCrew: user.joinCrew || false,
                currentPassword: '',
                newPassword: '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData({ ...formData, [name]: newValue });
    };

    // Reset new password when user toggles the change password checkbox
    useEffect(() => {
        if (!changePassword) {
            setFormData(prev => ({ ...prev, newPassword: '' }));
        }
    }, [changePassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate current password
        if (!formData.currentPassword) {
            setError('Current password is required');
            return;
        }

        // Validate new password if changing password
        if (changePassword) {
            if (!formData.newPassword) {
                setError('New password is required');
                return;
            }

            if (formData.newPassword.length < 6) {
                setError('New password must be at least 6 characters');
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const updateData = {
                name: formData.name,
                phone: formData.phone,
                age: formData.age ? parseInt(formData.age) : undefined,
                gender: formData.gender as 'male' | 'female' | 'other' | undefined,
                emergencyContact: formData.emergencyContact,
                instagramUsername: formData.instagramUsername,
                joinCrew: formData.joinCrew,
                newPassword: changePassword ? formData.newPassword : undefined,
            };

            const result = await updateProfile(updateData, formData.currentPassword);

            if (result.success) {
                setSuccess(result.message);
                // Reset password fields
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                });
                setChangePassword(false);
            } else {
                setError(result.message);
            }
        } catch (err: unknown) {
            console.error('Profile update error:', err);
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-black text-white flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
                        <p className="mt-4">Loading...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-black text-white py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold">Edit Profile</h1>
                        <button
                            onClick={() => router.push('/profile')}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                        >
                            Back to Profile
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-900/50 border border-red-500 text-white p-4 rounded-md mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-900/50 border border-green-500 text-white p-4 rounded-md mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label htmlFor="name" className="block mb-2 font-medium">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block mb-2 font-medium">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="age" className="block mb-2 font-medium">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="gender" className="block mb-2 font-medium">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="emergencyContact" className="block mb-2 font-medium">
                                    Emergency Contact
                                </label>
                                <input
                                    type="text"
                                    id="emergencyContact"
                                    name="emergencyContact"
                                    value={formData.emergencyContact}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="instagramUsername" className="block mb-2 font-medium">
                                    Instagram Username
                                </label>
                                <input
                                    type="text"
                                    id="instagramUsername"
                                    name="instagramUsername"
                                    value={formData.instagramUsername}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="joinCrew"
                                    name="joinCrew"
                                    checked={formData.joinCrew}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <label htmlFor="joinCrew" className="font-medium">
                                    I want to join the Cloka Crew
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-6 mb-6">
                            <h2 className="text-xl font-bold mb-4">Password</h2>

                            <div className="mb-4">
                                <label htmlFor="currentPassword" className="block mb-2 font-medium">
                                    Current Password <span className="text-red-500">*</span>
                                </label>
                                <PasswordInput
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                    showHelperText={false}
                                />
                                <p className="text-sm text-zinc-400 mt-1">
                                    Required to save changes
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="changePassword"
                                        checked={changePassword}
                                        onChange={(e) => setChangePassword(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="changePassword" className="font-medium">
                                        Change Password
                                    </label>
                                </div>
                            </div>

                            {changePassword && (
                                <div className="mb-4">
                                    <label htmlFor="newPassword" className="block mb-2 font-medium">
                                        New Password <span className="text-red-500">*</span>
                                    </label>
                                    <PasswordInput
                                        id="newPassword"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
                                        minLength={6}
                                        required={changePassword}
                                        error={changePassword && formData.newPassword.length > 0 && formData.newPassword.length < 6}
                                        errorMessage={formData.newPassword.length > 0 && formData.newPassword.length < 6 ? "Password must be at least 6 characters" : ""}
                                        showHelperText={true}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
} 