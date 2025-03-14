'use client';

import { useState } from 'react';
import Button from './Button';

type EventProps = {
    _id: string;
    title: string;
    date: Date;
    location: string;
    description: string;
    formattedDate: string;
};

interface EventsToggleProps {
    allEvents: EventProps[];
    upcomingEvents: EventProps[];
}

const EventsToggle = ({ allEvents, upcomingEvents }: EventsToggleProps) => {
    const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
    const [events, setEvents] = useState<EventProps[]>(upcomingEvents);

    // Toggle between all events and upcoming events
    const toggleEvents = (showUpcoming: boolean) => {
        setShowUpcomingOnly(showUpcoming);
        setEvents(showUpcoming ? upcomingEvents : allEvents);
    };

    return (
        <>
            <div className="flex justify-end mb-6">
                <div className="inline-flex items-center bg-zinc-900 rounded-lg p-1">
                    <Button
                        onClick={() => toggleEvents(false)}
                        variant={!showUpcomingOnly ? 'secondary' : 'primary'}
                        size="small"
                        className={`px-3 py-1 text-xs font-medium transition-colors ${!showUpcomingOnly
                            ? 'bg-transparent text-zinc-400 hover:text-white'
                            : ''
                            }`}
                    >
                        All Events
                    </Button>
                    <Button
                        onClick={() => toggleEvents(true)}
                        variant={showUpcomingOnly ? 'secondary' : 'primary'}
                        size="small"
                        className={`px-3 py-1 text-xs font-medium transition-colors ${showUpcomingOnly
                            ? ''
                            : 'bg-transparent text-zinc-400 hover:text-white'
                            }`}
                    >
                        Upcoming Only
                    </Button>
                </div>
            </div>

            {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <div key={event._id} className="bg-white text-black p-6 luxury-border">
                            <div className="mb-4">
                                <span className="text-sm uppercase tracking-wider text-accent">
                                    {event.formattedDate}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                            <p className="text-sm mb-4">
                                <span className="font-medium">Location:</span> {event.location}
                            </p>
                            <p className="luxury-text mb-6">{event.description}</p>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    href={`/events/${event._id}`}
                                    variant="luxury"
                                    size="small"
                                    className="inline-block"
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <h2 className="text-xl font-bold mb-4">No events found</h2>
                    <p className="text-zinc-400">
                        {showUpcomingOnly
                            ? 'There are no upcoming events at this time. Check back soon for new events or contact us for more information.'
                            : 'No events found. Please check back later or contact us for more information.'}
                    </p>
                </div>
            )}
        </>
    );
};

export default EventsToggle; 