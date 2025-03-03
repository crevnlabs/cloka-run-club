import Loader from '@/components/Loader';

export default function RunnerOfTheWeekLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader
                size="large"
                variant="pulse"
                text="Loading runner of the week..."
            />
        </div>
    );
} 