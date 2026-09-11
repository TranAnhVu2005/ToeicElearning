import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturedCoursesSection from '../components/home/FeaturedCoursesSection';
import StatsCounter from '../components/home/StatsCounter';
import ToeicPartsSection from '../components/home/ToeicPartsSection';
import FeaturesSection from '../components/home/FeaturesSection';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <StatsCounter />
      <FeaturedCoursesSection />
      <ToeicPartsSection />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
