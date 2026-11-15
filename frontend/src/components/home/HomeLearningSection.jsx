import React, { useState } from 'react';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import vocabularyPhoto from '../../assets/img/home-optimized/lambai.jpg';
import { TOBY_IMAGES } from '../common/TobyMascot';
import { openAiAssistant } from '../../services/aiService';

const TOBY_HOME_MOODS = [
  {
    key: 'cheering',
    img: TOBY_IMAGES.cheering,
    badge: '🐾 Nuna Chào Đón',
    title: 'Luôn cổ vũ bạn mỗi ngày',
    desc: 'Giữ chuỗi Streak học tập, nhận lời khen khi hoàn thành đề thi và nhắc nhở ôn tập nhẹ nhàng.',
  },
  {
    key: 'studying',
    img: TOBY_IMAGES.studying,
    badge: '📘 Nuna Giải Đề',
    title: 'Chữa chi tiết từng câu Part 1–7',
    desc: 'Bấm vào bất kỳ câu hỏi nào sau khi nộp bài để Nuna phân tích ngữ pháp, từ vựng và bẫy TOEIC.',
  },
  {
    key: 'laptop',
    img: TOBY_IMAGES.laptop,
    badge: '💻 Nuna Trực Tuyến 24/7',
    title: 'Hỏi đáp tức thì mọi lúc',
    desc: 'Thắc mắc về cấu trúc đề thi, mẹo phân bổ thời gian hay cách dùng website? Cứ hỏi Nuna ngay!',
  },
  {
    key: 'trophy',
    img: TOBY_IMAGES.trophy,
    badge: '🏆 Nuna Săn Cúp',
    title: 'Chinh phục kỷ lục điểm số mới',
    desc: 'Theo dõi tiến độ qua từng lần thi thử và ăn mừng mỗi khi bạn vượt qua cột mốc mục tiêu.',
  },
];

const HomeLearningSection = () => {
  const [activeMoodIndex, setActiveMoodIndex] = useState(0);
  const currentMood = TOBY_HOME_MOODS[activeMoodIndex];

  return (
    <section className="home-learning-section">
      <div className="container">
        <header className="home-learning-heading">
          <span className="section-subtitle">TOEIC LISTENING &amp; READING</span>
          <h2>Luyện thi với lộ trình rõ ràng</h2>
          <p>Nền tảng cho phép luyện tập theo từng đề, từng phần, hỗ trợ chấm chữa câu sai và có trợ lý AI Nuna đồng hành hỏi đáp.</p>
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
              <li>03 - Improve: Nhìn lại kết quả và tiến bộ cùng Nuna AI</li>
            </ul>
            <div className="home-learning-actions">
              <Link to="/courses" className="home-learning-primary">Bắt đầu làm bài ngay <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link to="/courses" className="home-learning-secondary">Xem danh sách đề thi</Link>
            </div>
          </div>
        </div>

        {/* Nuna Companion Showcase Strip */}
        <div className="mt-10 rounded-2xl border border-[#BFDBFE] bg-gradient-to-r from-[#EFF6FF] via-white to-[#F8FAFC] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <button
                type="button"
                onClick={() => setActiveMoodIndex((prev) => (prev + 1) % TOBY_HOME_MOODS.length)}
                className="group relative h-28 w-28 shrink-0 rounded-2xl border-2 border-[#93C5FD] bg-white p-2 shadow-md transition-transform hover:scale-105 cursor-pointer"
                title="Bấm vào Nuna để đổi biểu cảm!"
              >
                <img
                  src={currentMood.img}
                  alt={currentMood.title}
                  className="h-full w-full object-contain"
                />
              </button>

              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                  <span>Gặp gỡ Nuna — Bạn đồng hành TOEIC của bạn</span>
                </div>
                <h3 className="mt-2 font-serif text-2xl font-bold text-[#0F172A]">
                  {currentMood.title}
                </h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#475569]">
                  {currentMood.desc}
                </p>

              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  openAiAssistant({
                    autoPrompt: 'Chào Nuna! Hãy giới thiệu lộ trình luyện thi TOEIC hiệu quả trên trang web cho mình nhé.',
                  })
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1E40AF] transition-colors cursor-pointer"
              >
                <MessageSquareText size={16} />
                <span>Trò chuyện với Nuna ngay</span>
              </button>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-5 py-2.5 text-xs font-bold text-[#0F172A] hover:border-[#1D4ED8] hover:text-[#1D4ED8] transition-colors"
              >
                <span>Khám phá kho đề cùng Nuna</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLearningSection;
