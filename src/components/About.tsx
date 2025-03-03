'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const About = () => {
    return (
        <section className="py-16 bg-white text-black">
            <div className="luxury-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-wider">Cloka&apos;s Story</h2>
                    <div className="w-20 h-1 bg-black mx-auto"></div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-2xl font-bold mb-4">Our Journey</h3>
                        <p className="luxury-text mb-4">
                            At CLOKA, luxury transcends fabric—it&apos;s woven into the stories we unveil. We are This isn’t just a run club—it’s your weekend crew. We hit the pavement, then unwind at our favorite café, sharing stories and good vibes. Big things are coming—don’t miss out. See you Saturday?
                        </p>
                        <p className="luxury-text mb-4">
                            Our designs are more than garments; they are journeys into the hidden narratives cloaked within our culture, brought to life through artistry and craftsmanship. Each piece is a numbered, limited-edition creation, a testament to its uniqueness without rigid boundaries—because true legacy knows no limits.
                        </p>
                        <p className="luxury-text">
                            Inspired by the duality of a &quot;cloak&quot;—that which conceals and reveals—CLOKA blends timeless tradition with modern flair.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative h-[400px] overflow-hidden"
                    >
                        <Image
                            src="/images/about-1.jpg"
                            alt="Cloka's Journey"
                            fill
                            className="object-cover"
                        />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative h-[400px] overflow-hidden md:order-1 order-2"
                    >
                        <Image
                            src="/images/about-2.jpg"
                            alt="Cloka Club"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="md:order-2 order-1"
                    >
                        <h3 className="text-2xl font-bold mb-4">The Cloka Club</h3>
                        <p className="luxury-text mb-4">
                            Yet, CLOKA is more than a brand—it&apos;s a movement. The Cloka Club unites the Indian youth, fostering a thriving community that celebrates culture through action.
                        </p>
                        <p className="luxury-text mb-4">
                            It began with our Run Club, where gatherings spark connection—starting with runs, flowing into café stops, and ending in shared moments of camaraderie. With growing momentum and registrations, we&apos;re expanding into India&apos;s premier sports community, hosting events like pickleball and beyond.
                        </p>
                        <p className="luxury-text">
                            Cloka Club is where heritage meets vitality, empowering a generation to wear their identity with pride.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About; 