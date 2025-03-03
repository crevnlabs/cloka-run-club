'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/apiUtils';

type EventProps = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    registrationLink?: string;
};

// Type for the event data from the API
type ApiEventData = {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    image?: string;
    registrationLink?: string;
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
                <span className="text-sm uppercase tracking-wider text-accent">{event.date} • {event.time}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-sm mb-4">
                <span className="font-medium">Location:</span> {event.location}
            </p>
            <p className="luxury-text mb-6">{event.description}</p>
            <Link
                href={event.registrationLink || `/register?event=${event.id}`}
                className="luxury-button text-sm inline-block"
            >
                Register Now
            </Link>
        </motion.div>
    );
};

const UpcomingEvents = ({ serverEvents }: UpcomingEventsProps) => {
    const [events, setEvents] = useState<EventProps[]>(serverEvents || []);
    const [isLoading, setIsLoading] = useState(!serverEvents);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If server events are provided, use them instead of fetching
        if (serverEvents) {
            return;
        }

        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(getApiUrl('/api/events'));

                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const data = await response.json();

                // Transform the data to match the EventProps type
                const formattedEvents = data.events.map((event: ApiEventData) => {
                    // Format the date from ISO string to display format
                    const eventDate = new Date(event.date);
                    const formattedDate = eventDate.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    });

                    // Extract time or use a default
                    const formattedTime = eventDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    return {
                        id: event._id,
                        title: event.title,
                        date: formattedDate,
                        time: formattedTime,
                        location: event.location,
                        description: event.description,
                        registrationLink: event.registrationLink
                    };
                });

                setEvents(formattedEvents);
                setError(null);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [serverEvents]);

    return (
        <section className="py-16 bg-black text-white mt-10">
            <div className="luxury-container">


                {isLoading ? (
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