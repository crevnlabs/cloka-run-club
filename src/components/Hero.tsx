'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const Hero = () => {
    const [registrationCount, setRegistrationCount] = useState<number>(100);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRegistrationCount = async () => {
            try {
                const response = await fetch('/api/registrations/count');
                if (response.ok) {
                    const data = await response.json();
                    setRegistrationCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching registration count:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegistrationCount();
    }, []);

    return (
        <section className="bg-black text-white">
            <div className="luxury-container">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-wider">
                            <div className="flex items-center mb-4">
                                <Image
                                    src="/run-club.PNG"
                                    alt="CLOKA Text"
                                    width={500}
                                    height={150}
                                    className="h-auto invert -my-10 -mb-[150px] -ml-3 md:-ml-5"
                                    priority
                                />
                            </div>
                            <span className="block mt-2">
                                <Image
                                    src="/beyondtheline.png"
                                    alt="Beyond the Line Text"
                                    width={400}
                                    height={120}
                                    className="h-auto invert md:-mt-15 -ml-3 md:-ml-5"
                                    priority
                                />
                            </span>
                        </h1>
                        <p className="luxury-text text-lg mb-8 text-zinc-300">
                            This isn&apos;t just a run club—it&apos;s your weekend crew. We hit the pavement, then unwind at our favourite café, sharing stories and good vibes. Big things are coming—don&apos;t miss out. See you Saturday?
                        </p>

                        <div className="flex flex-col sm:flex-row justify-start items-center gap-4">
                            <Link href="/register" className="luxury-button bg-transparent border border-white inline-block text-center">
                                Join Cloka Club
                            </Link>
                            <p className="luxury-text text-lg text-zinc-300">
                                {isLoading ? (
                                    <span className="text-white font-bold">100+</span>
                                ) : (
                                    <motion.span
                                        className="text-white font-bold"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        {registrationCount}+
                                    </motion.span>
                                )} registrations
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative h-[400px] md:h-[500px] overflow-hidden rounded-lg"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10 hidden md:block"></div>
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src="/teaser.MP4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero; 