import React from 'react';
import { Target, Clock3, History, BookOpenCheck } from 'lucide-react';

const features = [
  { icon: <Target size={23} />, number: '01', title: 'Chọn Part để luyện', desc: 'Tập trung vào từng phần Listening hoặc Reading theo cấu trúc bài thi TOEIC.' },
  { icon: <Clock3 size={23} />, number: '02', title: 'Làm bài có tính giờ', desc: 'Thực hành full test trong giới hạn 120 phút để rèn nhịp độ làm bài.' },
  { icon: <History size={23} />, number: '03', title: 'Xem lại bài đã làm', desc: 'Mở lịch sử, xem kết quả từng câu và đối chiếu đáp án sau khi nộp.' },
  { icon: <BookOpenCheck size={23} />, number: '04', title: 'Ôn lại câu sai', desc: 'Tạo lượt luyện mới từ những câu sai hoặc bỏ trống trong bài đã làm.' },
];

const FeaturesSection = () => (
  <section className="section-padding features-section neo-features">
    <div className="container">
      <div className="section-header neo-section-heading">
        <span className="section-subtitle">HỌC THEO CÁCH CỦA BẠN</span>
        <h2 className="section-title">Một bước nhỏ. Tiến bộ rõ ràng.</h2>
        <p className="section-desc">Các công cụ luyện tập và xem lại được đặt cùng một nơi để bạn chủ động ôn tập.</p>
      </div>
      <div className="features-grid neo-feature-grid">
        {features.map((feature) => (
          <article key={feature.number} className="feature-card neo-feature-card">
            <div className="neo-feature-top"><span className="neo-feature-icon">{feature.icon}</span><span>{feature.number}</span></div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-desc">{feature.desc}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
