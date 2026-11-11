import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import booksBackground from '../../assets/img/hero/background_sach.jpg';
import blankPageBackground from '../../assets/img/hero/bangtrang.jpg';
import lettersBackground from '../../assets/img/hero/cacChuCai.jpg';
import toeicBackground from '../../assets/img/hero/toeic_980_co_ban_tay.jpg';

const HERO_SLIDES = [
  {
    image: booksBackground,
    alt: 'Sách học ngoại ngữ',
  },
  {
    image: blankPageBackground,
    alt: 'Trang giấy mở ra góc nhìn mới',
  },
  {
    image: lettersBackground,
    alt: 'Những chữ cái của một ngôn ngữ mới',
  },
  {
    image: toeicBackground,
    alt: 'Tài liệu luyện thi TOEIC',
  },
];

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener?.('change', updateMotionPreference);
    return () => motionPreference.removeEventListener?.('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
      }
    }, 7000);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const showSlide = (index) => {
    setActiveSlide((index + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="hero-section editorial-hero home-hero-photo" aria-label="Giới thiệu TOEIC Learning">
      <div className="home-hero-backgrounds" aria-hidden="true">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.image}
            className={`home-hero-background${index === activeSlide ? ' is-active' : ''}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
        ))}
      </div>

      <div className="container editorial-hero-grid">
        <div className="editorial-hero-copy">
          <p className="editorial-eyebrow home-hero-quote">
            To have another language is to possess a second soul.
          </p>
          <h1 className="editorial-hero-title">English<br /><span>is life</span></h1>
          <p className="editorial-hero-description">
            TOEIC Elearning là nền tảng hỗ trợ những người yêu tiếng anh nói chung và những người thi TOEIC nói riêng có
            một công cụ hỗ trợ học tập linh hoạt, tiện lợi và dễ dàng sử dụng.
          </p>
          <div className="editorial-hero-actions">
            <Link to={isAuthenticated ? '/practice' : '/register'} className="editorial-button editorial-button-primary">
              {isAuthenticated ? 'Bắt đầu luyện tập' : 'Tạo tài khoản'} <ArrowRight size={18} />
            </Link>
            <Link to="/courses" className="editorial-button editorial-button-secondary">Khám phá đề thi</Link>
          </div>

          <div className="home-hero-controls" aria-label="Điều khiển ảnh nền">
            <button type="button" className="home-hero-control" onClick={() => showSlide(activeSlide - 1)} aria-label="Ảnh trước" title="Ảnh trước">
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <div className="home-hero-dots" aria-label="Chọn ảnh nền">
              {HERO_SLIDES.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  className={`home-hero-dot${index === activeSlide ? ' is-active' : ''}`}
                  onClick={() => showSlide(index)}
                  aria-label={`Hiện ảnh ${index + 1}: ${slide.alt}`}
                  aria-current={index === activeSlide ? 'true' : undefined}
                />
              ))}
            </div>
            <button type="button" className="home-hero-control" onClick={() => showSlide(activeSlide + 1)} aria-label="Ảnh tiếp theo" title="Ảnh tiếp theo">
              <ChevronRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="home-hero-control home-hero-play-toggle"
              onClick={() => setIsPaused((paused) => !paused)}
              aria-label={isPaused ? 'Tiếp tục tự chuyển ảnh' : 'Tạm dừng tự chuyển ảnh'}
              title={isPaused ? 'Tiếp tục tự chuyển ảnh' : 'Tạm dừng tự chuyển ảnh'}
            >
              {isPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
