import React, { useEffect, useRef, useState } from 'react';
import { HOME_PHOTOS } from './homePhotos';

const HomePhotoAccent = ({
  imageKey,
  alt = '',
  caption,
  className = '',
  loading = 'lazy',
  children,
}) => {
  const photoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const photo = photoRef.current;
    if (!photo) return undefined;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.unobserve(entry.target);
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    observer.observe(photo);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={photoRef}
      className={`home-photo-accent${isVisible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
    >
      <img src={HOME_PHOTOS[imageKey]} alt={alt} loading={loading} decoding="async" />
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default HomePhotoAccent;
