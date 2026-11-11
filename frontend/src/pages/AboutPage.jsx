import React from 'react';
import { BookOpenCheck, Clock3, History, Target } from 'lucide-react';
import scoreStudyImage from '../assets/img/hero/toeic_980_co_ban_tay.jpg';

const learningSteps = [
  {
    icon: <Target size={22} aria-hidden="true" />,
    title: 'Chọn nội dung cần luyện',
    description: 'Tìm đề đã phát hành hoặc chọn một Part để tập trung vào kỹ năng đang cần cải thiện.',
  },
  {
    icon: <Clock3 size={22} aria-hidden="true" />,
    title: 'Làm bài theo nhịp độ của bạn',
    description: 'Luyện theo từng phần hoặc làm full test có đồng hồ đếm ngược và lưu phiên làm bài.',
  },
  {
    icon: <History size={22} aria-hidden="true" />,
    title: 'Xem lại và tiếp tục học',
    description: 'Sau khi nộp, xem đáp án, giải thích và transcript phù hợp với từng câu hỏi.',
  },
];

const AboutPage = () => (
  <main className="editorial-about">
    <header className="editorial-page-header">
      <div className="container">
        <p className="editorial-eyebrow">GIỚI THIỆU DỰ ÁN</p>
        <h1>Học TOEIC có cấu trúc,<br />theo dõi được tiến trình.</h1>
        <p className="editorial-lead">
          TOEIC Learning tập hợp bài luyện Listening và Reading, bài thi có tính giờ và phần xem lại kết quả trong cùng một nền tảng.
        </p>
      </div>
    </header>

    <section className="container editorial-about-feature">
      <div className="editorial-about-copy">
        <p className="editorial-eyebrow">MỤC TIÊU SẢN PHẨM</p>
        <h2>Tập trung vào quá trình học</h2>
        <p>
          Người học có thể bắt đầu từ một Part, làm đề đầy đủ hoặc ôn lại câu sai sau khi nộp. Giáo viên có thể tổ chức lớp, giao bài và theo dõi bài nộp; quản trị viên quản lý nội dung đề và tài khoản.
        </p>
        <p>
          Nội dung và quyền truy cập được kiểm tra theo trạng thái thực tế của hệ thống. Điểm luyện tập có thể là ước tính; nền tảng không cam kết điểm thi chính thức.
        </p>
        <div className="editorial-about-note">
          <BookOpenCheck size={20} aria-hidden="true" />
          <span>Listening và Reading · 7 Parts · Luyện tập, thi thử và xem lại</span>
        </div>
      </div>

      <figure className="editorial-about-image">
        <img src={scoreStudyImage} alt="Tài liệu TOEIC được cầm trên tay, ảnh tham khảo cho mục tiêu học tập" />
        <figcaption>Ảnh minh họa tham khảo; không phải kết quả do TOEIC Learning cấp hoặc xác nhận.</figcaption>
      </figure>
    </section>

    <section className="editorial-about-steps">
      <div className="container">
        <div className="editorial-section-heading">
          <p className="editorial-eyebrow">CÁCH HỌC</p>
          <h2>Từ luyện tập đến xem lại</h2>
        </div>
        <div className="editorial-steps-list">
          {learningSteps.map((step, index) => (
            <article className="editorial-step" key={step.title}>
              <span className="editorial-step-number">0{index + 1}</span>
              <span className="editorial-step-icon">{step.icon}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default AboutPage;
