import Loader from '@/components/Loader';

export default function AdminLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader
                size="large"
                variant="spinner"
                text="Loading admin panel..."
            />
        </div>
    );
} 