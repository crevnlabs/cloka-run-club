'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Event {
    _id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    image?: string;
    registrationLink?: string;
    createdAt: string;
}

export default function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<{
        show: boolean;
        eventId: string;
        title: string;
        action: 'delete';
    }>({
        show: false,
        eventId: '',
        title: '',
        action: 'delete'
    });
    const [eventForm, setEventForm] = useState<{
        show: boolean;
        isEdit: boolean;
        event: Partial<Event>;
    }>({
        show: false,
        isEdit: false,
        event: {
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            location: '',
            image: '',
            registrationLink: ''
        }
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/events');

            if (response.status === 401) {
                // Redirect to login if unauthorized
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            setEvents(data);
        } catch (error) {
            setError('Failed to load events. Please try again.');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const openConfirmDialog = (eventId: string, title: string, action: 'delete') => {
        setConfirmDialog({
            show: true,
            eventId,
            title,
            action
        });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({
            show: false,
            eventId: '',
            title: '',
            action: 'delete'
        });
    };

    const confirmAction = async () => {
        const { eventId, action } = confirmDialog;
        if (action === 'delete') {
            await handleDelete(eventId);
        }
        closeConfirmDialog();
    };

    const handleDelete = async (eventId: string) => {
        setIsDeleting(eventId);
        setDeleteError('');

        try {
            const response = await fetch(`/api/admin/events/${eventId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                // Remove the deleted event from the state
                setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
            } else {
                setDeleteError(data.message || 'Failed to delete event');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            setDeleteError('An error occurred while deleting the event');
        } finally {
            setIsDeleting(null);
        }
    };

    const openEventForm = (isEdit: boolean, event?: Event) => {
        setEventForm({
            show: true,
            isEdit,
            event: isEdit && event ? {
                ...event,
                date: new Date(event.date).toISOString().split('T')[0]
            } : {
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                location: '',
                image: '',
                registrationLink: ''
            }
        });
        setFormError('');
    };

    const closeEventForm = () => {
        setEventForm({
            show: false,
            isEdit: false,
            event: {
                title: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
                location: '',
                image: '',
                registrationLink: ''
            }
        });
        setFormError('');
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventForm(prev => ({
            ...prev,
            event: {
                ...prev.event,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');

        const { isEdit, event } = eventForm;

        // Validate form
        if (!event.title || !event.description || !event.date || !event.location) {
            setFormError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }

        try {
            const url = isEdit ? `/api/admin/events/${event._id}` : '/api/admin/events';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            const data = await response.json();

            if (response.ok) {
                if (isEdit) {
                    // Update the edited event in the state
                    setEvents(prevEvents =>
                        prevEvents.map(e =>
                            e._id === event._id ? data.event : e
                        )
                    );
                } else {
                    // Add the new event to the state
                    setEvents(prevEvents => [...prevEvents, data.event]);
                }
                closeEventForm();
            } else {
                setFormError(data.message || `Failed to ${isEdit ? 'update' : 'create'} event`);
            }
        } catch (error) {
            console.error(`Error ${eventForm.isEdit ? 'updating' : 'creating'} event:`, error);
            setFormError(`An error occurred while ${eventForm.isEdit ? 'updating' : 'creating'} the event`);
        } finally {
            setIsSubmitting(false);
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
                            onClick={() => router.push('/admin/registrations')}
                            className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                        >
                            Registrations
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
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Events</h2>
                            <button
                                onClick={() => openEventForm(false)}
                                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                            >
                                Add New Event
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 p-4 rounded-md mb-4">
                                {error}
                            </div>
                        )}

                        {deleteError && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 p-4 rounded-md mb-4">
                                {deleteError}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-8 text-gray-700 dark:text-gray-300">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black dark:border-white border-r-transparent"></div>
                                <p className="mt-2">Loading events...</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No events found. Click &quot;Add New Event&quot; to create one.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <div key={event._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-md">
                                        {event.image && (
                                            <div className="h-48 overflow-hidden relative">
                                                <Image
                                                    src={event.image}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{event.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                                <span className="font-semibold">Date:</span> {formatDate(event.date)}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                                <span className="font-semibold">Location:</span> {event.location}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                                                {event.description}
                                            </p>
                                            <div className="flex justify-between">
                                                <button
                                                    onClick={() => openEventForm(true, event)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openConfirmDialog(event._id, event.title, 'delete')}
                                                    disabled={isDeleting === event._id}
                                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                >
                                                    {isDeleting === event._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Confirmation Dialog */}
            {confirmDialog.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            Delete Event
                        </h3>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            Are you sure you want to delete the event <span className="font-semibold">{confirmDialog.title}</span>? This action cannot be undone.
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
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                                {isDeleting === confirmDialog.eventId ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Form Dialog */}
            {eventForm.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                            {eventForm.isEdit ? 'Edit Event' : 'Add New Event'}
                        </h3>

                        {formError && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 p-4 rounded-md mb-4">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Title *
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={eventForm.event.title}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="date" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Date *
                                </label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={eventForm.event.date}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Location *
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={eventForm.event.location}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={eventForm.event.description}
                                    onChange={handleFormChange}
                                    rows={4}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Image URL
                                </label>
                                <input
                                    id="image"
                                    name="image"
                                    type="text"
                                    value={eventForm.event.image || ''}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="registrationLink" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Registration Link
                                </label>
                                <input
                                    id="registrationLink"
                                    name="registrationLink"
                                    type="text"
                                    value={eventForm.event.registrationLink || ''}
                                    onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEventForm}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded transition-colors"
                                >
                                    {isSubmitting ? 'Saving...' : eventForm.isEdit ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 