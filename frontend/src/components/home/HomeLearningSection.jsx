import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import vocabularyPhoto from '../../assets/img/home-optimized/lambai.jpg';

const HomeLearningSection = () => (
  <section className="home-learning-section">
    <div className="container">
      <header className="home-learning-heading">
        <span className="section-subtitle">TOEIC LISTENING &amp; READING</span>
        <h2>Luyện thi với lộ trình rõ ràng</h2>
        <p>Nền tảng cho phép luyện tập theo từng đề, từng phần, hỗ trợ chấm chữa câu sai và có trợ lý AI để  hỏi đáp.</p>
      </header>

      <div className="home-learning-feature">
        <figure className="home-learning-photo">
          <img src={vocabularyPhoto} alt="Trang từ vựng tiếng Anh được đánh dấu khi ôn tập" loading="lazy" decoding="async" />
          <span className="home-learning-image-tag" aria-hidden="true">YOUR DAILY PRACTICE</span>
          <figcaption>
            <strong>Small step - big progress</strong>
          </figcaption>
        </figure>

        <div className="home-learning-copy">
          <h3>Mỗi câu hỏi là một cơ hội để tiến bộ.</h3>
          <ul className="home-learning-points">
            <li>01 - Explore: Khám phá kỹ năng cần cải thiện</li>
            <li>02 - Practice: Luyện tập và thử thách bản thân</li>
            <li>03 - Improve: Nhìn lại kết quả và tiến bộ</li>
          </ul>
          <div className="home-learning-actions">
            <Link to="/practice" className="home-learning-primary">Bắt đầu luyện tập <ArrowRight size={17} aria-hidden="true" /></Link>
            <Link to="/courses" className="home-learning-secondary">Xem danh sách đề thi</Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HomeLearningSection;
