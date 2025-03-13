'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiUtils';

type EventProps = {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
};

// Type for the event data from the API
type ApiEventData = {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    createdAt: string;
};

// Props for the UpcomingEvents component
interface UpcomingEventsProps {
    serverEvents?: EventProps[];
}

const EventCard = ({ event }: { event: EventProps }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white text-black p-6 luxury-border"
        >
            <div className="mb-4">
                <span className="text-sm uppercase tracking-wider text-accent">{event.date}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-sm mb-4">
                <span className="font-medium">Location:</span> {event.location}
            </p>
            <p className="luxury-text mb-6">{event.description}</p>
            <div className="flex flex-wrap gap-3">
                <Link
                    href={`/events/${event.id}`}
                    className="hover:cursor-pointer luxury-button text-sm inline-block"
                >
                    View Details
                </Link>
            </div>
        </motion.div>
    );
};

const UpcomingEvents = ({ serverEvents }: UpcomingEventsProps) => {
    const [events, setEvents] = useState<EventProps[]>(serverEvents || []);
    const [loading, setLoading] = useState(!serverEvents);
    const [error, setError] = useState('');

    useEffect(() => {
        if (serverEvents) {
            return; // Skip fetching if server events are provided
        }

        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Explicitly request only upcoming events (default behavior of the API)
                const data = await fetchApi<{ events: ApiEventData[] }>('/api/events');

                // Transform API data to component format
                const formattedEvents = data.events.map((event: ApiEventData) => {
                    const eventDate = new Date(event.date);
                    return {
                        id: event._id,
                        title: event.title,
                        date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
                        location: event.location,
                        description: event.description,
                    };
                });

                setEvents(formattedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
                setError('Failed to load events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [serverEvents]);

    return (
        <section className="py-16 bg-black text-white mt-10">
            <div className="luxury-container">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
                    <h2 className="text-3xl font-bold">Upcoming Events</h2>
                    <p className="text-zinc-400 mt-2 md:mt-0">
                        Join us for our next exclusive gatherings
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4">Loading events...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12">
                        <p>No upcoming events at this time. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}

                <div className="text-center mt-12">
                    <Link href="/events" className="luxury-button inline-block">
                        View All Events
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents; 