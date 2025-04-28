'use client';

import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/apiUtils';
import Button from './Button';
import EventCard, { EventCardProps } from './EventCard';

// Type for the event data from the API
type ApiEventData = {
    _id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    createdAt: string;
    bannerImageURL?: string | null;
};

// Props for the UpcomingEvents component
interface UpcomingEventsProps {
    serverEvents?: EventCardProps[];
}

const UpcomingEvents = ({ serverEvents }: UpcomingEventsProps) => {
    const [events, setEvents] = useState<EventCardProps[]>(serverEvents || []);
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
                        bannerImageURL: event.bannerImageURL,
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
                    <Button
                        href="/events"
                        variant="luxury"
                        className="inline-block"
                    >
                        View All Events
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default UpcomingEvents; 