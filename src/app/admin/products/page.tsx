'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Loader from '@/components/Loader';
import ProductModal from '@/components/ProductModal';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    inStock: boolean;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products);
            } else {
                setError(data.message || 'Failed to fetch products');
            }
        } catch {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (response.ok) {
                setProducts(products.filter(p => p._id !== productId));
            } else {
                setError(data.message || 'Failed to delete product');
            }
        } catch {
            setError('Failed to delete product');
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return <Loader size="large" variant="spinner" text="Loading products..." />;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <button
                    onClick={handleAdd}
                    className="bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-md hover:cursor-pointer"
                >
                    Add New Product
                </button>
            </div>

            {error && (
                <div className="bg-zinc-100 border border-black text-black px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-black shadow-sm rounded-lg">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-600">
                        {products.map((product) => (
                            <motion.tr
                                key={product._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="hover:bg-zinc-700 bg-zinc-900"
                            >
                                <td className="px-6 py-4 relative h-12 w-12">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </td>
                                <td className="px-6 py-4">{product.name}</td>
                                <td className="px-6 py-4">₹{(product.price / 100).toFixed(2)}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${product.inStock ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-black'
                                        }`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-zinc-300 hover:text-zinc-400 mr-3 font-medium cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product._id)}
                                        className="text-zinc-300 hover:text-zinc-400 font-medium cursor-pointer"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setIsModalOpen(false)}
                    onSave={async (updatedProduct) => {
                        try {
                            const method = editingProduct ? 'PUT' : 'POST';
                            const url = editingProduct
                                ? `/api/admin/products/${editingProduct._id}`
                                : '/api/admin/products';

                            const response = await fetch(url, {
                                method,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(updatedProduct),
                            });

                            const data = await response.json();

                            if (response.ok) {
                                if (editingProduct) {
                                    setProducts(products.map(p =>
                                        p._id === editingProduct._id ? data.product : p
                                    ));
                                } else {
                                    setProducts([...products, data.product]);
                                }
                                setIsModalOpen(false);
                            } else {
                                setError(data.message || 'Failed to save product');
                            }
                        } catch {
                            setError('Failed to save product');
                        }
                    }}
                />
            )}
        </div>
    );
} 