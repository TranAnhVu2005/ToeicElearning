import React, { useState } from 'react';
import { ArrowRight, MessageSquareText } from 'lucide-react';
import { Link } from 'react-router-dom';
import vocabularyPhoto from '../../assets/img/home/lambai.jpg';
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

        {/* Nuna Editorial Companion Strip */}
        <div className="mt-10 border border-[#E4E4E7] bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <button
                type="button"
                onClick={() => setActiveMoodIndex((prev) => (prev + 1) % TOBY_HOME_MOODS.length)}
                className="group relative h-24 w-24 shrink-0 cursor-pointer border border-[#E4E4E7] bg-[#F8FAFC] p-2 transition-colors hover:border-[#1D4ED8]"
                title="Bấm để đổi biểu cảm"
              >
                <img
                  src={currentMood.img}
                  alt={currentMood.title}
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
              </button>

              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1D4ED8]">
                  CÚN NUNA
                </span>
                <h3 className="mt-1.5 font-serif text-xl font-bold tracking-tight text-[#0A0A0A] sm:text-2xl">
                  {currentMood.title}
                </h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#52525B]">
                  {currentMood.desc}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 lg:justify-end">
              <button
                type="button"
                onClick={() =>
                  openAiAssistant({
                    autoPrompt: 'Chào Nuna! Hãy giới thiệu lộ trình luyện thi TOEIC hiệu quả trên trang web cho mình nhé.',
                  })
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF]"
              >
                <MessageSquareText size={16} />
                <span>Trò chuyện với Nuna</span>
              </button>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 border border-[#E4E4E7] bg-white px-5 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                <span>Khám phá kho đề</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeLearningSection;
