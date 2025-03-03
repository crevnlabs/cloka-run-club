'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';


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
    eventId?: string;
    event?: {
        _id: string;
        title: string;
        date: string;
        location: string;
    };
    approved: boolean | null;
    createdAt: string;
}

interface PaginationData {
    total: number;
    page: number;
    limit: number;
    pages: number;
}

interface Event {
    _id: string;
    title: string;
    date: string;
    location: string;
}

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
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
        approved: '',
        eventId: '',
        search: ''
    });
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [updateError, setUpdateError] = useState('');
    const [stats, setStats] = useState({
        approved: 0,
        rejected: 0,
        pending: 0,
        total: 0,
        withEvent: 0,
        withoutEvent: 0
    });
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        registrationId: string;
        name: string;
        action: 'approve' | 'reject' | 'delete';
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

            if (filters.eventId) {
                queryParams.append('eventId', filters.eventId);
            }

            if (filters.search) {
                queryParams.append('search', filters.search);
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
            console.log('API Response:', data);
            console.log('Pagination data:', data.pagination);

            setRegistrations(data.registrations);

            // Handle both possible API response structures
            if (data.pagination) {
                // If pagination data is in a nested 'pagination' object
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination.total || 0,
                    page: data.pagination.page || 1,
                    limit: data.pagination.limit || 10,
                    pages: data.pagination.pages || 0
                }));
            } else {
                // If pagination data is at the root level
                setPagination(prev => ({
                    ...prev,
                    total: data.total || 0,
                    pages: Math.ceil((data.total || 0) / prev.limit)
                }));
            }
        } catch (error) {
            setError('Failed to load registrations. Please try again.');
            console.error('Error fetching registrations:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters, router]);

    const fetchEvents = useCallback(async () => {
        try {
            const response = await fetch('/api/events');

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data.events || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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

    const openConfirmDialog = (registrationId: string, name: string, action: 'approve' | 'reject' | 'delete') => {
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
        if (action === 'delete') {
            await handleDelete(registrationId);
        } else {
            await handleApproval(registrationId, action === 'approve');
        }
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

    const handleDelete = async (registrationId: string) => {
        setIsUpdating(registrationId);
        setUpdateError('');

        try {
            const response = await fetch('/api/admin/registrations/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ registrationId }),
            });

            const data = await response.json();

            if (response.ok) {
                // Update the local state to remove the deleted registration
                setRegistrations(prevRegistrations =>
                    prevRegistrations.filter(reg => reg._id !== registrationId)
                );
                // Update stats after deletion
                fetchStats();
            } else {
                setUpdateError(data.message || 'Failed to delete registration');
            }
        } catch (error) {
            console.error('Error deleting registration:', error);
            setUpdateError('An error occurred while deleting registration');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Registration Stats */}
                    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-4xl font-bold mb-4 text-black dark:text-white">Registration Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white dark:bg-black border border-black dark:border-zinc-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black dark:text-white">{stats.total}</div>
                                <div className="text-sm text-black dark:text-white">Total Registrations</div>
                            </div>
                            <div className="bg-white dark:bg-black border border-black dark:border-zinc-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black dark:text-white">{stats.approved}</div>
                                <div className="text-sm text-black dark:text-white">Approved</div>
                            </div>
                            <div className="bg-white dark:bg-black border border-black dark:border-zinc-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black dark:text-white">{stats.rejected}</div>
                                <div className="text-sm text-black dark:text-white">Rejected</div>
                            </div>
                            <div className="bg-white dark:bg-black border border-black dark:border-zinc-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black dark:text-white">{stats.pending}</div>
                                <div className="text-sm text-black dark:text-white">Pending</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-black border border-black dark:border-zinc-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black dark:text-white">{stats.withEvent}</div>
                                <div className="text-sm text-black dark:text-white">With Event</div>
                            </div>
                            <div className="bg-white dark:bg-black border border-black dark:border-zinc-700 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-black dark:text-white">{stats.withoutEvent}</div>
                                <div className="text-sm text-black dark:text-white">Without Event</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Run Registrations</h2>

                        {error && (
                            <div className="bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white p-4 rounded-md mb-4">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="w-full">
                                <label htmlFor="search" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Search by Name, Email, Phone, or Instagram
                                </label>
                                <input
                                    type="text"
                                    id="search"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Search..."
                                    className="w-full p-2 border border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>

                            <div className="w-full md:w-auto">
                                <label htmlFor="gender" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Filter by Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={filters.gender}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white"
                                >
                                    <option value="">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <label htmlFor="joinCrew" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Filter by Crew Status
                                </label>
                                <select
                                    id="joinCrew"
                                    name="joinCrew"
                                    value={filters.joinCrew}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white"
                                >
                                    <option value="">All</option>
                                    <option value="true">Joined Crew</option>
                                    <option value="false">Not Joined</option>
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <label htmlFor="approved" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Filter by Approval Status
                                </label>
                                <select
                                    id="approved"
                                    name="approved"
                                    value={filters.approved}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white"
                                >
                                    <option value="">All</option>
                                    <option value="true">Approved</option>
                                    <option value="false">Rejected</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>

                            <div className="w-full md:w-auto">
                                <label htmlFor="eventId" className="block text-sm font-medium mb-1 text-black dark:text-white">
                                    Filter by Event
                                </label>
                                <select
                                    id="eventId"
                                    name="eventId"
                                    value={filters.eventId}
                                    onChange={handleFilterChange}
                                    className="w-full md:w-40 p-2 border border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white"
                                >
                                    <option value="">All Events</option>
                                    {events.map((event) => (
                                        <option key={event._id} value={event._id}>
                                            {event.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-8 text-black dark:text-white">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
                                <p className="mt-2">Loading registrations...</p>
                            </div>
                        ) : registrations.length === 0 ? (
                            <div className="text-center py-8 text-black dark:text-white">
                                No registrations found.
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-black dark:divide-zinc-700">
                                        <thead className="bg-white dark:bg-black border-b border-black dark:border-zinc-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Phone
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Age
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Gender
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Instagram
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Crew
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Event
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Registered
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black dark:text-white uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-black divide-y divide-black dark:divide-zinc-700">
                                            {registrations.map((registration) => (
                                                <tr key={registration._id} className="group hover:bg-black dark:hover:bg-zinc-300">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{registration.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{registration.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{registration.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{registration.age}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${registration.gender === 'male'
                                                            ? 'bg-black text-white border-2 border-white dark:bg-white dark:text-black dark:border-black'
                                                            : registration.gender === 'female'
                                                                ? 'bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white'
                                                                : 'bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white'
                                                            } group-hover:bg-white group-hover:text-black group-hover:border-black dark:group-hover:bg-black dark:group-hover:text-white dark:group-hover:border-white`}>
                                                            {registration.gender}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">
                                                            {registration.instagramUsername ? (
                                                                <a
                                                                    href={`https://instagram.com/${registration.instagramUsername}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:underline group-hover:text-white dark:group-hover:text-black"
                                                                >
                                                                    @{registration.instagramUsername}
                                                                </a>
                                                            ) : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">
                                                            {registration.joinCrew ? 'Yes' : 'No'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">
                                                            {registration.event ? (
                                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white">
                                                                    {registration.event.title}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-black dark:text-white group-hover:text-white dark:group-hover:text-black">No event</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-black dark:text-white group-hover:text-white dark:group-hover:text-black">{formatDate(registration.createdAt)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${registration.approved === true
                                                            ? 'bg-white text-black border-2 border-dashed border-black dark:bg-black dark:text-white dark:border-white'
                                                            : registration.approved === false
                                                                ? 'bg-black text-white border-2 border-dashed border-white dark:bg-white dark:text-black dark:border-black'
                                                                : 'bg-white text-black border border-dotted border-black dark:bg-black dark:text-white dark:border-white'
                                                            } group-hover:bg-white group-hover:text-black group-hover:border-black dark:group-hover:bg-black dark:group-hover:text-white dark:group-hover:border-white`}>
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
                                                                    ? 'bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white cursor-not-allowed'
                                                                    : 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white transition-colors'
                                                                    } group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white`}
                                                            >
                                                                {isUpdating === registration._id ? 'Processing...' : 'Approve'}
                                                            </button>
                                                            <button
                                                                onClick={() => openConfirmDialog(registration._id, registration.name, 'reject')}
                                                                disabled={isUpdating === registration._id || registration.approved === false}
                                                                className={`px-3 py-1 rounded-md text-xs font-medium ${registration.approved === false
                                                                    ? 'bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white cursor-not-allowed'
                                                                    : 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white transition-colors'
                                                                    } group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white`}
                                                            >
                                                                {isUpdating === registration._id ? 'Processing...' : 'Reject'}
                                                            </button>
                                                            <button
                                                                onClick={() => openConfirmDialog(registration._id, registration.name, 'delete')}
                                                                disabled={isUpdating === registration._id}
                                                                className="px-3 py-1 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-white hover:text-red-600 hover:border hover:border-red-600 dark:bg-red-600 dark:text-white dark:hover:bg-black dark:hover:text-red-500 dark:hover:border-red-500 transition-colors group-hover:bg-white group-hover:text-red-600 dark:group-hover:bg-black dark:group-hover:text-red-500"
                                                            >
                                                                {isUpdating === registration._id ? 'Processing...' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {registrations.length > 0 && (
                                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                                        <div className="text-sm text-black dark:text-white">
                                            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span>{' '}
                                            of <span className="font-medium">{pagination.total}</span> results
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(pagination.page - 1)}
                                                disabled={pagination.page === 1}
                                                className={`px-3 hover:cursor-pointer py-1 rounded ${pagination.page === 1
                                                    ? 'bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white cursor-not-allowed'
                                                    : 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white'
                                                    }`}
                                            >
                                                Previous
                                            </button>

                                            {(() => {
                                                const pageButtons = [];

                                                // Always show first page
                                                if (pagination.pages > 0) {
                                                    pageButtons.push(
                                                        <button
                                                            key={1}
                                                            onClick={() => handlePageChange(1)}
                                                            className={`px-3 hover:cursor-pointer py-1 rounded ${pagination.page === 1
                                                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                                                : 'bg-white text-black border border-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black'
                                                                }`}
                                                        >
                                                            1
                                                        </button>
                                                    );
                                                }

                                                // Add ellipsis if needed
                                                if (pagination.page > 3) {
                                                    pageButtons.push(
                                                        <span key="ellipsis1" className="px-3 py-1 text-black dark:text-white">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                // Add pages around current page
                                                for (let i = Math.max(2, pagination.page - 1); i <= Math.min(pagination.pages - 1, pagination.page + 1); i++) {
                                                    pageButtons.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => handlePageChange(i)}
                                                            className={`px-3 hover:cursor-pointer py-1 rounded ${pagination.page === i
                                                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                                                : 'bg-white text-black border border-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black'
                                                                }`}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }

                                                // Add ellipsis if needed
                                                if (pagination.page < pagination.pages - 2) {
                                                    pageButtons.push(
                                                        <span key="ellipsis2" className="px-3 py-1 text-black dark:text-white">
                                                            ...
                                                        </span>
                                                    );
                                                }

                                                // Always show last page if there is more than one page
                                                if (pagination.pages > 1) {
                                                    pageButtons.push(
                                                        <button
                                                            key={pagination.pages}
                                                            onClick={() => handlePageChange(pagination.pages)}
                                                            className={`px-3 hover:cursor-pointer py-1 rounded ${pagination.page === pagination.pages
                                                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                                                : 'bg-white text-black border border-black hover:bg-black hover:text-white dark:bg-black dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black'
                                                                }`}
                                                        >
                                                            {pagination.pages}
                                                        </button>
                                                    );
                                                }

                                                return pageButtons;
                                            })()}

                                            <button
                                                onClick={() => handlePageChange(pagination.page + 1)}
                                                disabled={pagination.page === pagination.pages}
                                                className={`px-3 hover:cursor-pointer py-1 rounded ${pagination.page === pagination.pages
                                                    ? 'bg-white text-black border border-black dark:bg-black dark:text-white dark:border-white cursor-not-allowed'
                                                    : 'bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white'
                                                    }`}
                                            >
                                                Next
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <label htmlFor="pageSize" className="text-sm text-black dark:text-white">
                                                Items per page:
                                            </label>
                                            <select
                                                id="pageSize"
                                                value={pagination.limit}
                                                onChange={(e) => {
                                                    const newLimit = parseInt(e.target.value);
                                                    setPagination(prev => ({
                                                        ...prev,
                                                        limit: newLimit,
                                                        page: 1, // Reset to first page when changing limit
                                                        pages: Math.ceil(prev.total / newLimit)
                                                    }));
                                                }}
                                                className="px-2 py-1 border border-black dark:border-white rounded-md bg-white dark:bg-black text-black dark:text-white"
                                            >
                                                <option value="10">10</option>
                                                <option value="25">25</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {updateError && (
                                    <div className="mt-4 bg-white dark:bg-black border border-black dark:border-white text-black dark:text-white p-4 rounded-md">
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
                    <div className="bg-white dark:bg-black rounded-lg p-6 max-w-md w-full border border-black dark:border-white">
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">
                            {confirmDialog.action === 'approve' ? 'Approve Registration' :
                                confirmDialog.action === 'reject' ? 'Reject Registration' : 'Delete Registration'}
                        </h3>
                        <p className="mb-6 text-black dark:text-white">
                            {confirmDialog.action === 'delete' ? (
                                <>Are you sure you want to <span className="font-semibold text-red-600 dark:text-red-500">permanently delete</span> the registration for <span className="font-semibold">{confirmDialog.name}</span>? This action cannot be undone.</>
                            ) : (
                                <>Are you sure you want to {confirmDialog.action === 'approve' ? 'approve' : 'reject'} the registration for <span className="font-semibold">{confirmDialog.name}</span>?</>
                            )}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeConfirmDialog}
                                className="px-4 py-2 bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white rounded hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`px-4 py-2 rounded text-white ${confirmDialog.action === 'delete' ?
                                    'bg-red-600 hover:bg-white hover:text-red-600 hover:border hover:border-red-600 dark:bg-red-600 dark:hover:bg-black dark:hover:text-red-500 dark:hover:border-red-500' :
                                    'bg-black hover:bg-white hover:text-black hover:border hover:border-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white dark:hover:border-white'} transition-colors`}
                            >
                                {isUpdating === confirmDialog.registrationId ? 'Processing...' :
                                    confirmDialog.action === 'approve' ? 'Approve' :
                                        confirmDialog.action === 'reject' ? 'Reject' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 