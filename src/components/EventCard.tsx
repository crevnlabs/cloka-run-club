import { motion } from 'framer-motion';
import Button from './Button';

export type EventCardProps = {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    bannerImageURL?: string | null;
};

const EventCard = ({ event }: { event: EventCardProps }) => {
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
            {event.bannerImageURL && (
                <div className="mb-4">
                    <img
                        src={event.bannerImageURL}
                        alt={`${event.title} banner`}
                        className="w-full h-48 object-cover"
                    />
                </div>
            )}
            <p className="luxury-text mb-6">{event.description}</p>
            <div className="flex flex-wrap gap-3">
                <Button
                    href={`/events/${event.id}`}
                    variant="primary"
                    size="large"
                    className="inline-block bg-black text-white text-3xl"
                >
                    View Details
                </Button>
            </div>
        </motion.div>
    );
};

export default EventCard; 