import Loader from '@/components/Loader';

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader
                size="large"
                variant="spinner"
                text="Loading CLOKA..."
            />
        </div>
    );
} 