import React from 'react';
import HeroSection from '../components/home/HeroSection';
import HomeLearningSection from '../components/home/HomeLearningSection';
import FeaturedCoursesSection from '../components/home/FeaturedCoursesSection';
import HomeStudyOverviewSection from '../components/home/HomeStudyOverviewSection';

const HomePage = () => {
  return (
    <div className="home-page">
      <HeroSection />
      <HomeLearningSection />
      <FeaturedCoursesSection />
      <HomeStudyOverviewSection />
    </div>
  );
};

export default HomePage;
