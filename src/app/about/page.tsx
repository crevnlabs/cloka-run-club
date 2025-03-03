import Header from '@/components/Header';
import About from '@/components/About';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Cloka\'s Story - CLOKA',
    description: 'Learn about the journey and mission of CLOKA, a premium clothing brand rooted in the soul of India.',
};

export default function AboutPage() {
    return (
        <main>
            <Header />
            <div className="pt-20 bg-black">
                <div className="luxury-container">
                    <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Cloka&apos;s Story</h1>
                </div>
            </div>
            <About />
            <Footer />
        </main>
    );
} 