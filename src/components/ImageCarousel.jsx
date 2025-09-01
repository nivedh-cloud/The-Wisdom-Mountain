import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaPause, FaPlay } from 'react-icons/fa';
import './ImageCarousel.css';

const ImageCarousel = ({ images, autoPlayInterval = 8000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play functionality with smoother transitions
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
        setIsTransitioning(false);
      }, 150);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, images.length, autoPlayInterval]);

  const goToPrevious = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      setIsTransitioning(false);
    }, 150);
  };

  const goToNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      setIsTransitioning(false);
    }, 150);
  };

  const goToSlide = (index) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 150);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  if (!images || images.length === 0) {
    return <div className="carousel-container">No images to display</div>;
  }

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        {/* Main Image Display */}
        <div className="carousel-image-container">
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            className={`carousel-image ${isTransitioning ? 'transitioning' : ''}`}
          />
          
          {/* Image Overlay with Text */}
          <div className="carousel-overlay">
            <div className="carousel-content">
              <h2 
                className={`carousel-title ${isTransitioning ? 'slide-out' : 'slide-in'}`}
                key={`title-${currentIndex}`}
              >
                {images[currentIndex].title}
              </h2>
              <p 
                className={`carousel-description ${isTransitioning ? 'slide-out' : 'slide-in'}`}
                key={`desc-${currentIndex}`}
              >
                {images[currentIndex].description}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          className="carousel-arrow carousel-arrow-left"
          onClick={goToPrevious}
          aria-label="Previous image"
        >
          <FaChevronLeft />
        </button>
        
        <button 
          className="carousel-arrow carousel-arrow-right"
          onClick={goToNext}
          aria-label="Next image"
        >
          <FaChevronRight />
        </button>

        {/* Auto-play Control */}
        <button 
          className="carousel-autoplay-toggle"
          onClick={toggleAutoPlay}
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? <FaPause /> : <FaPlay />}
        </button>

        {/* Dot Indicators */}
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
