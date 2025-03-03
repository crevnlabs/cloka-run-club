'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Product {
    _id?: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    inStock: boolean;
}

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (product: Omit<Product, '_id'>) => Promise<void>;
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
    const [formData, setFormData] = useState<Omit<Product, '_id'>>({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: '',
        inStock: true,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
                category: product.category,
                inStock: product.inStock,
            });
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSave(formData);
        } catch {
            setError('Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 rounded-lg p-8 max-w-lg w-full shadow-2xl border border-zinc-800"
            >
                <h2 className="text-2xl font-bold mb-6 text-white">
                    {product ? 'Edit Product' : 'Add New Product'}
                </h2>

                {error && (
                    <div className="bg-white bg-opacity-5 border border-white text-white px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 shadow-sm focus:border-white focus:ring-white transition-colors px-4 py-3 text-base"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 shadow-sm focus:border-white focus:ring-white transition-colors px-4 py-3 text-base"
                                rows={3}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Price (in paise)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 shadow-sm focus:border-white focus:ring-white transition-colors px-4 py-3 text-base"
                                required
                                min="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Image URL</label>
                            <input
                                type="text"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 shadow-sm focus:border-white focus:ring-white transition-colors px-4 py-3 text-base"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400 shadow-sm focus:border-white focus:ring-white transition-colors px-4 py-3 text-base"
                                required
                            >
                                <option value="">Select a category</option>
                                <option value="Apparel">Apparel</option>
                                <option value="Accessories">Accessories</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.inStock}
                                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                className="h-4 w-4 text-white bg-zinc-800 border-zinc-700 rounded transition-colors focus:ring-white focus:ring-offset-zinc-900"
                            />
                            <label className="ml-2 block text-sm text-white">In Stock</label>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-zinc-700 rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-zinc-900 transition-colors"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
} 