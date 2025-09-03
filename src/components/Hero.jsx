import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import slide1 from '../assets/Hero section/slide1.jpg';
import slide2 from '../assets/Hero section/slide2.jpg';
import slide3 from '../assets/Hero section/slide3.jpg';

const Hero = () => {
  const images = useMemo(() => [slide1, slide2, slide3], []);
  const [index, setIndex] = useState(0);
  const captions = useMemo(() => [
    {
      title: 'Elevate Your Wardrobe',
      subtitle: 'Timeless silhouettes. Meticulous details. Uncompromising quality.'
    },
    {
      title: 'Crafted for the Modern Icon',
      subtitle: 'Luxury fabrics and precision tailoring for everyday statement dressing.'
    },
    {
      title: 'Luxury, Redefined & Affordable',
      subtitle: 'Essential pieces designed to move with you—season after season.'
    }
  ], []);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2500);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className='relative w-full h-screen overflow-hidden bg-black'>
      

      <AnimatePresence mode='wait'>
        <motion.img
          key={index}
          src={images[index]}
          srcSet={`${images[index]} 1x, ${images[index]} 2x`}
          sizes='100vw'
          alt={`Slide ${index + 1}`}
          className='absolute inset-0 w-full h-full object-cover object-center'
          initial={{ opacity: 0, scale: 1.0 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.0 }}
          transition={{
            opacity: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
          }}
          loading='eager'
          decoding='async'
          fetchpriority='high'
          draggable={false}
          style={{ willChange: 'opacity', imageRendering: 'auto', backgroundColor: '#000', transform: 'translateZ(0)', filter: 'none', WebkitFilter: 'none' }}
        />
      </AnimatePresence>
      

      

      <div className='relative z-10 flex flex-col items-center justify-end h-full text-center text-white p-6 pb-20'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={`caption-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className='max-w-4xl'
          >
            <h2 className='text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight' style={{ fontFamily: 'Playfair Display, ui-serif, Georgia, Cambria, Times New Roman, Times, serif' }}>
              {(() => {
                const t = captions[index].title;
                if (!t.includes('&')) return t;
                const parts = t.split('&');
                const left = parts[0];
                const right = parts.slice(1).join('&');
                return (
                  <>
                    {left}
                    <span style={{ fontFamily: 'Times New Roman, Times, serif' }}> &amp; </span>
                    {right}
                  </>
                );
              })()}
            </h2>
            <p className='mt-3 text-sm sm:text-base md:text-lg text-white/90' style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji' }}>
              {captions[index].subtitle}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className='mt-6'
            >
              <Link
                to='/collection'
                className='group inline-flex items-center gap-3 px-8 py-3 rounded-full border border-white/70 text-white/95 bg-white/5 backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-black'
                style={{
                  WebkitBackdropFilter: 'blur(6px)'
                }}
              >
                <span
                  className='uppercase tracking-[0.22em] text-xs md:text-sm'
                  style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans' }}
                >
                  Shop Now
                </span>
                <FiArrowRight className='w-4 h-4 transition-transform duration-300 group-hover:translate-x-1' />
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Hero
