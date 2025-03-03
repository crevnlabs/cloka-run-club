import Header from '@/components/Header';
import RunnerOfTheWeek from '@/components/RunnerOfTheWeek';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { getApiUrl } from '@/lib/apiUtils';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Runner of the Week - CLOKA',
    description: 'Spotlighting standout community members from the CLOKA Run Club.',
};

// Define the runner type for the API response
interface ApiRunner {
    _id: string;
    name: string;
    image: string;
    story: string;
    achievements: string;
    weekOf: Date;
    createdAt: Date;
}

// Fetch runner of the week from the API
async function getRunnerOfTheWeek(): Promise<ApiRunner | null> {
    try {
        const url = getApiUrl('/api/runner-of-the-week');

        const res = await fetch(url, {
            cache: 'no-store', // Don't cache this data
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!res.ok) {
            throw new Error('Failed to fetch runner of the week');
        }

        const data = await res.json();
        return data.success ? data.runner : null;
    } catch (error) {
        console.error('Error fetching runner of the week:', error);
        return null;
    }
}

// Fetch past runners (for this example, we'll use the same API but limit to past runners)
async function getPastRunners(): Promise<ApiRunner[]> {
    try {
        const url = getApiUrl('/api/runner-of-the-week');

        const res = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 60 }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch past runners');
        }

        const data = await res.json();
        // In a real app, you would have multiple past runners
        // For this example, we'll just use the current runner as a past runner too
        return data.success ? [data.runner] : [];
    } catch (error) {
        console.error('Error fetching past runners:', error);
        return [];
    }
}

export default async function RunnerOfTheWeekPage() {
    // Fetch runner of the week from the API
    const apiRunner = await getRunnerOfTheWeek();

    // If no runner is returned, use fallback data
    const currentRunner = apiRunner ? {
        name: apiRunner.name,
        image: apiRunner.image,
        achievement: apiRunner.achievements,
        quote: apiRunner.story,
        instagram: 'cloka_runner' // This would come from the API in a real app
    } : {
        name: 'Arjun Sharma',
        image: '/images/runner-of-the-week.jpg',
        achievement: 'Completed 50 runs with Cloka Club',
        quote: 'Running with Cloka has transformed not just my fitness, but my entire perspective on community and heritage.',
        instagram: 'arjun_runner',
    };

    // Fetch past runners from the API
    const apiPastRunners = await getPastRunners();

    // If no past runners are returned, use fallback data
    const pastRunners = apiPastRunners.length > 0 ? apiPastRunners.map(runner => ({
        name: runner.name,
        image: runner.image,
        achievement: runner.achievements,
        quote: runner.story,
        instagram: 'cloka_runner' // This would come from the API in a real app
    })) : [
        {
            name: 'Priya Mehta',
            image: '/images/past-runner-1.jpg',
            achievement: 'First female to complete the Midnight Marathon',
            quote: 'The support from the Cloka community pushed me beyond what I thought was possible.',
            instagram: 'priya_runs',
        },
        {
            name: 'Rahul Kapoor',
            image: '/images/past-runner-2.jpg',
            achievement: 'Most consistent runner - 30 consecutive weeks',
            quote: 'Cloka Run Club has become my second family. The discipline I\'ve gained here extends to all areas of my life.',
            instagram: 'rahul_k',
        },
        {
            name: 'Ananya Desai',
            image: '/images/past-runner-3.jpg',
            achievement: 'Raised ₹50,000 in the Charity Marathon',
            quote: 'Using my passion for running to make a difference has been the most rewarding experience.',
            instagram: 'ananya_d',
        },
    ];

    return (
        <main>
            <Header />
            <div className="pt-20 pb-10 bg-black">
                <div className="luxury-container">
                    <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Runner of the Week</h1>
                    <p className="text-white text-center mt-4 max-w-2xl mx-auto luxury-text">
                        Celebrating the outstanding members of our community who embody the CLOKA spirit.
                    </p>
                </div>
            </div>

            {/* Current Runner of the Week */}
            <RunnerOfTheWeek runner={currentRunner} />

            {/* Past Runners Section */}
            <section className="py-16 bg-black text-white">
                <div className="luxury-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">Past Honorees</h2>
                        <div className="w-20 h-1 bg-white mx-auto"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pastRunners.map((runner, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white text-black p-6"
                            >
                                <h3 className="text-xl font-bold mb-2">{runner.name}</h3>
                                <p className="text-sm font-medium mb-4 text-accent">{runner.achievement}</p>
                                <blockquote className="luxury-text text-sm italic mb-4">
                                    &quot;{runner.quote}&quot;
                                </blockquote>
                                {runner.instagram && (
                                    <a
                                        href={`https://instagram.com/${runner.instagram}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-black hover:text-accent transition-colors text-sm"
                                    >
                                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                        @{runner.instagram}
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
} 