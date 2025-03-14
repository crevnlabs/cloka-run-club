'use client';

import { useState, useEffect } from 'react';
import { TrashIcon, KeyIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Button from "@/components/Button"
import { Loader } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    gender?: 'male' | 'female' | 'other' | null;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface GenderStats {
    male: number;
    female: number;
    other: number;
    unknown: number;
    total: number;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [genderStats, setGenderStats] = useState<GenderStats>({
        male: 0,
        female: 0,
        other: 0,
        unknown: 0,
        total: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0,
    });
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isResettingPassword, setIsResettingPassword] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>("Gender filtering has been implemented! You can now filter users by gender.");

    // Clear the initial success message after 5 seconds
    useEffect(() => {
        if (successMessage === "Gender filtering has been implemented! You can now filter users by gender.") {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Fetch total gender stats
    const fetchTotalGenderStats = async () => {
        try {
            setLoadingStats(true);

            // Try to fetch from the stats endpoint
            try {
                const response = await fetch('/api/admin/users/stats');

                if (response.ok) {
                    const data = await response.json();

                    if (data.success && data.stats && data.stats.gender) {
                        setGenderStats(data.stats.gender);
                        setLoadingStats(false);
                        return; // Successfully got stats, exit the function
                    }
                }
                // If we get here, the stats endpoint failed in some way
                console.warn('Stats endpoint failed, falling back to calculating from all users');
            } catch (statsError) {
                console.warn('Error fetching from stats endpoint:', statsError);
                // Continue to fallback method
            }

            // Fallback: Fetch all users (without pagination) to calculate stats
            const allUsersResponse = await fetch('/api/admin/users?limit=1000&page=1');

            if (!allUsersResponse.ok) {
                throw new Error('Failed to fetch users for statistics');
            }

            const allUsersData = await allUsersResponse.json();

            if (allUsersData.success) {
                // Get the total count from pagination data if available
                const totalUsers = allUsersData.pagination?.total || allUsersData.users.length;

                // Calculate stats from all users
                const stats = {
                    male: 0,
                    female: 0,
                    other: 0,
                    unknown: 0,
                    total: totalUsers
                };

                allUsersData.users.forEach((user: User) => {
                    if (user.gender === 'male') stats.male++;
                    else if (user.gender === 'female') stats.female++;
                    else if (user.gender === 'other') stats.other++;
                    else stats.unknown++;
                });

                setGenderStats(stats);
            } else {
                throw new Error('Failed to calculate user statistics');
            }
        } catch (err) {
            console.error('Error fetching gender stats:', err);
            // Use pagination total as a last resort
            if (pagination.total > 0) {
                setGenderStats(prev => ({
                    ...prev,
                    total: pagination.total
                }));
            }
        } finally {
            setLoadingStats(false);
        }
    };

    // Fetch users
    const fetchUsers = async (page = 1, searchTerm = '', gender = 'all') => {
        try {
            setLoading(true);
            setError(null);

            // Build the query parameters
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: pagination.limit.toString(),
                search: searchTerm
            });

            // Handle gender filter
            const genderParam = getGenderQueryParam(gender);
            if (genderParam !== null) {
                queryParams.append('gender', genderParam);
            }

            // Log the full URL for debugging
            const url = `/api/admin/users?${queryParams.toString()}`;
            console.log('Fetching users with URL:', url);

            // Test the backend query construction
            testBackendQuery(gender);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();

            // Debug the API response
            debugApiResponse(data, `Gender filter: ${gender}`);

            if (data.success) {
                setUsers(data.users);
                setPagination(data.pagination);

                // If we don't have total stats yet, calculate from current page as last resort
                if (genderStats.total === 0) {
                    // Get the total count from pagination data
                    const totalUsers = data.pagination?.total || 0;

                    // This is a temporary fallback until we can get full stats
                    const pageStats = {
                        male: 0,
                        female: 0,
                        other: 0,
                        unknown: 0,
                        total: totalUsers
                    };

                    // Calculate what we can from current page
                    data.users.forEach((user: User) => {
                        if (user.gender === 'male') pageStats.male++;
                        else if (user.gender === 'female') pageStats.female++;
                        else if (user.gender === 'other') pageStats.other++;
                        else pageStats.unknown++;
                    });

                    setGenderStats(pageStats);

                    // Add a note in the console that these are partial stats
                    console.info('Using partial gender stats from current page only');
                }
            } else {
                throw new Error(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Test function to verify backend query construction
    const testBackendQuery = (gender: string) => {
        console.group('Backend Query Test');

        // Add gender filter if provided
        const genderParam = getGenderQueryParam(gender);
        if (genderParam !== null) {
            if (genderParam === 'null') {
                console.log('Using "unknown" gender filter');
                console.log('Expected MongoDB query:', JSON.stringify({
                    gender: { $in: [null, undefined] }
                }));
            } else {
                console.log(`Using "${gender}" gender filter`);
                console.log('Expected MongoDB query:', JSON.stringify({
                    gender: genderParam
                }));
            }
        } else {
            console.log('No gender filter applied');
            console.log('Expected MongoDB query: {}');
        }

        console.groupEnd();
    };

    // Initial fetch
    useEffect(() => {
        // Fetch both users and total stats
        fetchUsers(pagination.page, search, genderFilter);
        fetchTotalGenderStats();
    }, []);

    // Handle search with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchUsers(1, search, genderFilter);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [search]);

    // Debug function to check API response
    // We define a specific type for the API response to avoid using 'any'
    const debugApiResponse = (data: {
        success: boolean;
        users?: User[];
        pagination?: Pagination;
        message?: string;
        stats?: unknown; // For potential stats data
    }, filterType: string): void => {
        console.group(`API Debug - ${filterType}`);
        console.log('Response data:', data);

        if (data.users && Array.isArray(data.users)) {
            // Count genders in the response
            const genderCounts = {
                male: 0,
                female: 0,
                other: 0,
                unknown: 0,
                total: data.users.length
            };

            data.users.forEach((user: User) => {
                if (user.gender === 'male') genderCounts.male++;
                else if (user.gender === 'female') genderCounts.female++;
                else if (user.gender === 'other') genderCounts.other++;
                else genderCounts.unknown++;
            });

            console.log('Gender counts in response:', genderCounts);
            console.log('First few users:', data.users.slice(0, 3));
        }

        console.groupEnd();
    };

    // Handle gender filter change
    const handleGenderFilterChange = (gender: string) => {
        console.log(`Changing gender filter from ${genderFilter} to ${gender}`);
        setGenderFilter(gender);
        // Reset to page 1 when changing filters
        fetchUsers(1, search, gender);
    };

    // Get the gender query parameter for the API
    const getGenderQueryParam = (gender: string): string | null => {
        if (gender === 'all') return null;
        if (gender === 'unknown') return 'null'; // Backend expects "null" string for unknown gender
        return gender;
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= pagination.pages) {
            fetchUsers(newPage, search, genderFilter);
        }
    };

    // Handle delete user
    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            setIsDeleting(userId);

            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('User deleted successfully');
                // Refresh the user list and stats
                fetchUsers(pagination.page, search, genderFilter);
                fetchTotalGenderStats();
            } else {
                throw new Error(data.message || 'Failed to delete user');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsDeleting(null);
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        }
    };

    // Open password reset modal
    const openPasswordResetModal = (userId: string) => {
        setSelectedUserId(userId);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    // Handle password reset
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId || !newPassword) {
            return;
        }

        try {
            setIsResettingPassword(selectedUserId);

            const response = await fetch(`/api/admin/users/${selectedUserId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) {
                throw new Error('Failed to reset password');
            }

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Password reset successfully');
                setShowPasswordModal(false);
            } else {
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsResettingPassword(null);
            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);
        }
    };

    // Generate pagination buttons with limited range
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisiblePages = 5; // Maximum number of page buttons to show

        // Calculate range of pages to show
        let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        buttons.push(
            <Button
                key="prev"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="secondary"
                size="small"
            >
                Prev
            </Button>
        );

        // First page and ellipsis if needed
        if (startPage > 1) {
            buttons.push(
                <Button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    variant={pagination.page === 1 ? "primary" : "secondary"}
                    size="small"
                >
                    1
                </Button>
            );

            if (startPage > 2) {
                buttons.push(
                    <span key="ellipsis-start" className="px-2 py-1">
                        ...
                    </span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <Button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    variant={pagination.page === i ? "primary" : "secondary"}
                    size="small"
                >
                    {i}
                </Button>
            );
        }

        // Last page and ellipsis if needed
        if (endPage < pagination.pages) {
            if (endPage < pagination.pages - 1) {
                buttons.push(
                    <span key="ellipsis-end" className="px-2 py-1">
                        ...
                    </span>
                );
            }

            buttons.push(
                <Button
                    key={pagination.pages}
                    onClick={() => handlePageChange(pagination.pages)}
                    variant={pagination.page === pagination.pages ? "primary" : "secondary"}
                    size="small"
                >
                    {pagination.pages}
                </Button>
            );
        }

        // Next button
        buttons.push(
            <Button
                key="next"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                variant="secondary"
                size="small"
            >
                Next
            </Button>
        );

        return buttons;
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">User Management</h1>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-500 text-white p-4 mb-4 rounded">
                    {successMessage}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="bg-red-500 text-white p-4 mb-4 rounded">
                    {error}
                </div>
            )}

            {/* Gender Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-zinc-800 p-4 rounded shadow relative">
                    <h3 className="text-lg font-semibold mb-1">Total Users</h3>
                    {loadingStats ? (
                        <div className="flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold">{genderStats.total}</p>
                    )}
                    <div className="text-xs text-right absolute bottom-1 right-2 text-zinc-400">
                        All users
                    </div>
                </div>
                <div className="bg-blue-900 p-4 rounded shadow relative">
                    <h3 className="text-lg font-semibold mb-1">Male</h3>
                    {loadingStats ? (
                        <div className="flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold">{genderStats.male}</p>
                            <p className="text-sm opacity-75">
                                {genderStats.total > 0
                                    ? `${Math.round((genderStats.male / genderStats.total) * 100)}%`
                                    : '0%'}
                            </p>
                        </>
                    )}
                    <div className="text-xs text-right absolute bottom-1 right-2 text-blue-300">
                        All users
                    </div>
                </div>
                <div className="bg-pink-900 p-4 rounded shadow relative">
                    <h3 className="text-lg font-semibold mb-1">Female</h3>
                    {loadingStats ? (
                        <div className="flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold">{genderStats.female}</p>
                            <p className="text-sm opacity-75">
                                {genderStats.total > 0
                                    ? `${Math.round((genderStats.female / genderStats.total) * 100)}%`
                                    : '0%'}
                            </p>
                        </>
                    )}
                    <div className="text-xs text-right absolute bottom-1 right-2 text-pink-300">
                        All users
                    </div>
                </div>
                <div className="bg-purple-900 p-4 rounded shadow relative">
                    <h3 className="text-lg font-semibold mb-1">Other</h3>
                    {loadingStats ? (
                        <div className="flex items-center">
                            <Loader className="animate-spin h-4 w-4 mr-2" />
                            <span>Loading...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-2xl font-bold">{genderStats.other}</p>
                            <p className="text-sm opacity-75">
                                {genderStats.total > 0
                                    ? `${Math.round((genderStats.other / genderStats.total) * 100)}%`
                                    : '0%'}
                            </p>
                        </>
                    )}
                    <div className="text-xs text-right absolute bottom-1 right-2 text-purple-300">
                        All users
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or phone"
                        className="w-full p-2 pl-10 border border-zinc-700 bg-zinc-900 text-white rounded"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                </div>

                <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-zinc-400" />
                    <select
                        value={genderFilter}
                        onChange={(e) => handleGenderFilterChange(e.target.value)}
                        className="p-2 border border-zinc-700 bg-zinc-900 text-white rounded"
                        aria-label="Filter by gender"
                    >
                        <option value="all">All Genders</option>
                        <option value="male" className="bg-blue-900">Male</option>
                        <option value="female" className="bg-pink-900">Female</option>
                        <option value="other" className="bg-purple-900">Other</option>
                        <option value="unknown" className="bg-gray-700">Unknown</option>
                    </select>
                    {genderFilter !== 'all' && (
                        <button
                            onClick={() => handleGenderFilterChange('all')}
                            className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800"
                            aria-label="Clear gender filter"
                            title="Clear filter"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Filter indicator */}
            {genderFilter !== 'all' && (
                <div className="mb-4 flex items-center">
                    <span className="text-sm bg-zinc-800 px-3 py-1 rounded-full flex items-center">
                        Filtered by: {genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)}
                        <button
                            onClick={() => handleGenderFilterChange('all')}
                            className="ml-2 text-zinc-400 hover:text-white"
                            aria-label="Clear filter"
                        >
                            ×
                        </button>
                    </span>
                </div>
            )}

            {/* Users table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-zinc-800">
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Gender</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Created At</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="p-3 text-center">
                                    <Loader className="animate-spin inline mr-2 h-5 w-5" />
                                    Loading...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-3 text-center">
                                    No users found
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user._id} className="border-b border-zinc-700 hover:bg-zinc-900">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.phone}</td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${user.gender === 'male' ? 'bg-blue-900' :
                                                user.gender === 'female' ? 'bg-pink-900' :
                                                    user.gender === 'other' ? 'bg-purple-900' : 'bg-gray-700'
                                                }`}
                                        >
                                            {user.gender || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900' : 'bg-zinc-700'
                                                }`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => openPasswordResetModal(user._id)}
                                                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                title="Reset Password"
                                                isLoading={isResettingPassword === user._id}
                                                size="small"
                                            >
                                                {isResettingPassword !== user._id && (
                                                    <KeyIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                                                title="Delete User"
                                                disabled={user.role === 'admin'}
                                                isLoading={isDeleting === user._id}
                                                size="small"
                                                variant="danger"
                                            >
                                                {isDeleting !== user._id && (
                                                    <TrashIcon className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && pagination.pages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {renderPaginationButtons()}
                </div>
            )}

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-zinc-800 p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label htmlFor="newPassword" className="block mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-2 border border-zinc-700 bg-zinc-900 text-white rounded"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    variant="secondary"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isResettingPassword !== null}
                                    loadingText="Resetting..."
                                >
                                    Reset Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 