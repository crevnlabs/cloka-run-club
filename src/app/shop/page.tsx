import Header from '@/components/Header';
import Shop from '@/components/Shop';
import Footer from '@/components/Footer';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

// Define the product type for the API response
interface ApiProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    inStock: boolean;
    createdAt: Date;
}

export const metadata = {
    title: 'Official Merch Store - CLOKA',
    description: 'Shop exclusive, limited-edition CLOKA merchandise. Each piece is a numbered, limited-edition creation.',
};

// Fetch products from the API
async function getProducts(): Promise<ApiProduct[]> {
    try {
        // In a real production environment, you would use the full URL
        // For local development with Next.js, we can use a relative URL
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/products`, {
            cache: 'no-store', // Don't cache this data
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });

        if (!res.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await res.json();
        return data.products || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export default async function ShopPage() {
    // Fetch products from the API
    const products = await getProducts();

    // If no products are returned, use fallback data
    const shopProducts = products.length > 0 ? products.map((product: ApiProduct) => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description
    })) : [
        {
            id: 'product-1',
            name: 'CLOKA Classic T-Shirt',
            price: 1499,
            image: '/images/product-1.jpg',
            description: 'Premium cotton t-shirt with the iconic CLOKA logo. Limited edition, numbered piece.',
        },
        {
            id: 'product-2',
            name: 'Heritage Runner Cap',
            price: 999,
            image: '/images/product-2.jpg',
            description: 'Lightweight, breathable cap featuring traditional Indian motifs. Perfect for your morning runs.',
        },
        {
            id: 'product-3',
            name: 'CLOKA Performance Shorts',
            price: 1899,
            image: '/images/product-3.jpg',
            description: 'High-performance running shorts with moisture-wicking technology and hidden pocket.',
        },
        {
            id: 'product-4',
            name: 'Artisan Crafted Hoodie',
            price: 2499,
            image: '/images/product-4.jpg',
            description: 'Hand-embroidered hoodie featuring designs inspired by traditional Indian art forms.',
        },
        {
            id: 'product-5',
            name: 'CLOKA Water Bottle',
            price: 799,
            image: '/images/product-5.jpg',
            description: 'Stainless steel water bottle with the CLOKA logo. Keeps your water cold for up to 24 hours.',
        },
        {
            id: 'product-6',
            name: 'Limited Edition Running Shoes',
            price: 4999,
            image: '/images/product-6.jpg',
            description: 'Collaboration with top shoe designers. Features unique patterns inspired by Indian heritage.',
        },
        {
            id: 'product-7',
            name: 'CLOKA Sports Bag',
            price: 1999,
            image: '/images/product-7.jpg',
            description: 'Spacious sports bag with multiple compartments. Perfect for your running gear.',
        },
        {
            id: 'product-8',
            name: 'Heritage Collection Jacket',
            price: 3499,
            image: '/images/product-8.jpg',
            description: 'Lightweight jacket featuring designs inspired by different regions of India.',
        },
        {
            id: 'product-9',
            name: 'CLOKA Running Socks (3 Pack)',
            price: 699,
            image: '/images/product-9.jpg',
            description: 'Anti-blister running socks with arch support and moisture-wicking technology.',
        },
    ];

    return (
        <main>
            <Header />
            <div className="pt-20 pb-10 bg-black">
                <div className="luxury-container">
                    <h1 className="text-4xl md:text-6xl font-bold text-white text-center">Official Merch Store</h1>
                    <p className="text-white text-center mt-4 max-w-2xl mx-auto luxury-text">
                        Exclusive, limited-edition merchandise that embodies the CLOKA spirit.
                    </p>
                </div>
            </div>

            <Shop products={shopProducts} />

            <Footer />
        </main>
    );
} 