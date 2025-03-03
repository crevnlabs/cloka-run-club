'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Registration {
    _id: string;
    name: string;
    email: string;
    phone: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    joinCrew: boolean;
    emergencyContact: string;
    instagramUsername?: string;
    approved: boolean | null;
    createdAt: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState<PaginationData>({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
    });
    const [filters, setFilters] = useState({
        gender: '',
        joinCrew: '',
        approved: ''
    });
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState('');
    const [stats, setStats] = useState({
        approved: 0,
        rejected: 0,
        pending: 0,
        total: 0
    });
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        registrationId: string;
        name: string;
        action: 'approve' | 'reject';
    }>({
        show: false,
        registrationId: '',
        name: '',
        action: 'approve'
    });

    const router = useRouter();

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/registrations/stats');

            if (response.status === 401) {
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [router]);

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const queryParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString()
            });

            if (filters.gender) {
                queryParams.append('gender', filters.gender);
            }

            if (filters.joinCrew) {
                queryParams.append('joinCrew', filters.joinCrew);
            }

            if (filters.approved) {
                queryParams.append('approved', filters.approved);
            }

            const response = await fetch(`/api/admin/registrations?${queryParams.toString()}`);

            if (response.status === 401) {
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch registrations');
            }

            const data = await response.json();
            setRegistrations(data.registrations);
            setPagination(prev => ({
                ...prev,
                total: data.total,
                pages: Math.ceil(data.total / prev.limit)
            }));
        } catch (error) {
            setError('Failed to load registrations. Please try again.');
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters, router]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openConfirmDialog = (registrationId: string, name: string, action: 'approve' | 'reject') => {
        setConfirmDialog({
            show: true,
            registrationId,
            name,
            action
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            show: false,
            registrationId: '',
            name: '',
            action: 'approve'
        });
    };

    const confirmAction = async () => {
        const { registrationId, action } = confirmDialog;
        await handleApproval(registrationId, action === 'approve');
        closeConfirmDialog();
    };

    const handleApproval = async (registrationId: string, approved: boolean) => {
        setIsUpdating(registrationId);
        setUpdateError('');

        try {
            const response = await fetch('/api/admin/registrations/approve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ registrationId, approved }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the local state to reflect the change
                setRegistrations(prevRegistrations =>
                    prevRegistrations.map(reg =>
                        reg._id === registrationId ? { ...reg, approved } : reg
                    )
                );
                // Update stats after approval/rejection
                fetchStats();
            } else {
                setUpdateError(data.message || 'Failed to update registration status');
            }
        } catch (error) {
            console.error('Error updating registration:', error);
            setUpdateError('An error occurred while updating registration status');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="bg-black text-white p-4 shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="CLOKA Logo"
                            width={30}
                            height={30}
                            className="h-auto invert"
                        />
                        <Image
                            src="/logo-text-mark.PNG"
                            alt="CLOKA Text"
                            width={80}
                            height={25}
                            className="h-auto invert"
                        />
                        <h1 className="text-xl font-bold ml-2">Admin</h1>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => router.push('/admin/events')}
                            className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                            Events
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="text-sm bg-white text-black px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                        >
                            Back to Site
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto py-8 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Registration Stats */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Registration Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Registrations</div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-green-800 dark:text-green-100">{stats.approved}</div>
                                <div className="text-sm text-green-600 dark:text-green-300">Approved</div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-800 dark:text-red-100">{stats.rejected}</div>
                                <div className="text-sm text-red-600 dark:text-red-300">Rejected</div>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-100">{stats.pending}</div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-300">Pending</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Run Registrations</h2>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 p-4 rounded-md mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="w-full md:w-auto">
                                <label htmlFor="gender" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Filter by Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={filters.gender}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <label htmlFor="joinCrew" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Filter by Crew Status
                                </label>
                                <select
                                    id="joinCrew"
                                    name="joinCrew"
                                    value={filters.joinCrew}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">All</option>
                                    <option value="true">Joined Crew</option>
                                    <option value="false">Not Joined</option>
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <label htmlFor="approved" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Filter by Approval Status
                                </label>
                                <select
                                    id="approved"
                                    name="approved"
                                    value={filters.approved}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">All</option>
                                    <option value="true">Approved</option>
                                    <option value="false">Rejected</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-gray-700 dark:text-gray-300">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
                                <p className="mt-2">Loading registrations...</p>
                            </div>
                        ) : registrations.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No registrations found.
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Age
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Gender
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Instagram
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Crew
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Registered
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {registrations.map((registration) => (
                                                <tr key={registration._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{registration.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">{registration.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">{registration.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">{registration.age}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${registration.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' :
                                                            registration.gender === 'female' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100' :
                                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                                            }`}>
                                                            {registration.gender}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">
                                                            {registration.instagramUsername ? (
                                                                <a
                                                                    href={`https://instagram.com/${registration.instagramUsername}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:underline"
                                                                >
                                                                    @{registration.instagramUsername}
                                                                </a>
                                                            ) : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${registration.joinCrew ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                                                            }`}>
                                                            {registration.joinCrew ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-500 dark:text-gray-300">{formatDate(registration.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${registration.approved === true ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' :
                                                            registration.approved === false ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' :
                                                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                                            }`}>
                                                            {registration.approved === true ? 'Approved' :
                                                                registration.approved === false ? 'Rejected' :
                                                                    'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => openConfirmDialog(registration._id, registration.name, 'approve')}
                                                                disabled={isUpdating === registration._id || registration.approved === true}
                                                                className={`px-3 py-1 rounded-md text-xs font-medium ${registration.approved === true
                                                                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                                                    : 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition-colors'
                                                                    }`}
                                                            >
                                                                {isUpdating === registration._id ? 'Processing...' : 'Approve'}
                                                            </button>
                                                            <button
                                                                onClick={() => openConfirmDialog(registration._id, registration.name, 'reject')}
                                                                disabled={isUpdating === registration._id || registration.approved === false}
                                                                className={`px-3 py-1 rounded-md text-xs font-medium ${registration.approved === false
                                                                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                                                    : 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors'
                                                                    }`}
                                                            >
                                                                {isUpdating === registration._id ? 'Processing...' : 'Reject'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span>{' '}
                                            of <span className="font-medium">{pagination.total}</span> results
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className={`px-3 py-1 rounded ${pagination.page === 1
                                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                    }`}
                                            >
                                                Previous
                                            </button>
                                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 rounded ${pagination.page === page
                                                        ? 'bg-black text-white dark:bg-white dark:text-black'
                                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages}
                                                className={`px-3 py-1 rounded ${pagination.page === pagination.pages
                                                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                                    }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {updateError && (
                                    <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 p-4 rounded-md">
                                        {updateError}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {confirmDialog.action === 'approve' ? 'Approve Registration' : 'Reject Registration'}
                        </h3>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            Are you sure you want to {confirmDialog.action === 'approve' ? 'approve' : 'reject'} the registration for <span className="font-semibold">{confirmDialog.name}</span>?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeConfirmDialog}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 rounded text-white transition-colors ${confirmDialog.action === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {isUpdating === confirmDialog.registrationId ? 'Processing...' : confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 