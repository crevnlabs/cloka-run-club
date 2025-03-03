import Header from '@/components/Header';
import UpcomingEvents from '@/components/UpcomingEvents';
import Footer from '@/components/Footer';
import { getApiUrl } from '@/lib/apiUtils';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Define the event type for the client component
interface EventProps {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
}

export const metadata = {
    title: 'Upcoming Events - CLOKA',
    description: 'Stay updated with all upcoming runs and events organized by CLOKA.',
};

// Define the event type for the API response
interface ApiEvent {
    _id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    createdAt: Date;
}

// Fetch events from the API
async function getEvents(): Promise<ApiEvent[]> {
    try {
        const url = getApiUrl('/api/events');

        const res = await fetch(url, {
            cache: 'no-store', // Don't cache this data
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!res.ok) {
            throw new Error('Failed to fetch events');
        }

        const data = await res.json();
        return data.events || [];
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

// Update the transformEvents function
function transformEvents(events: ApiEvent[]): EventProps[] {
    return events.map(event => {
        const eventDate = new Date(event.date);
        return {
            id: event._id,
            title: event.title,
            date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            location: event.location,
            description: event.description,
        };
    });
}

export default async function EventsPage() {
    // Fetch events from the API
    const apiEvents = await getEvents();

    // Format the events for the UpcomingEvents component
    const formattedEvents: EventProps[] = transformEvents(apiEvents);

    return (
        <main>
            <Header />
            <div className="pt-20 bg-black">
                <div className="luxury-container">
                    <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Upcoming Events</h1>
                </div>
            </div>
            <UpcomingEvents serverEvents={formattedEvents} />
            <Footer />
        </main>
    );
} 