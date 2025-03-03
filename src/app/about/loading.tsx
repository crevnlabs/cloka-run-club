import Loader from '@/components/Loader';

export default function AboutLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader
                size="large"
                variant="spinner"
                text="Loading about CLOKA..."
            />
        </div>
    );
} 