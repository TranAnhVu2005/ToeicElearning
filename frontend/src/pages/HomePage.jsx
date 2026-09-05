import React from 'react';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import ToeicPartsSection from '../components/home/ToeicPartsSection';
import StatsCounter from '../components/home/StatsCounter';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <StatsCounter />
      <ToeicPartsSection />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
