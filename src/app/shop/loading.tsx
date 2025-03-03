import Loader from '@/components/Loader';

export default function ShopLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader
                size="large"
                variant="dots"
                text="Loading products..."
            />
        </div>
    );
} 