import Loader from '@/components/Loader';

export default function RegisterLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader
                size="large"
                variant="dots"
                text="Loading registration..."
            />
        </div>
    );
} 