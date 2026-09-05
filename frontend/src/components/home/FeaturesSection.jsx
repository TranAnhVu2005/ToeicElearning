import React from 'react';
import { Target, Clock, ShieldCheck, BarChart3, BookCheck, Users } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Target size={28} color="var(--primary)" />,
      title: 'Luyện tập trọng tâm theo Part',
      desc: 'Dễ dàng ôn luyện theo từng phần thi yếu kém, từ Part 1 mô tả tranh đến Part 7 đọc hiểu đoạn văn phức tạp.',
    },
    {
      icon: <Clock size={28} color="var(--primary)" />,
      title: 'Thi thử bấm giờ chuẩn ETS',
      desc: 'Giao diện phòng thi mô phỏng áp lực phòng thi thật với đồng hồ đếm ngược chính xác.',
    },
    {
      icon: <BarChart3 size={28} color="var(--primary)" />,
      title: 'Thống kê kết quả trực quan',
      desc: 'Theo dõi tiến trình làm bài, tỉ lệ phần trăm câu đúng và gợi ý các bẫy thường gặp.',
    },
    {
      icon: <BookCheck size={28} color="var(--primary)" />,
      title: 'Giải thích chi tiết & Ngữ pháp',
      desc: 'Mỗi câu hỏi đều đi kèm giải thích từ vựng cốt lõi, cấu trúc ngữ pháp và lí do chọn đáp án đúng.',
    },
    {
      icon: <Users size={28} color="var(--primary)" />,
      title: 'Cộng đồng học viên CTU',
      desc: 'Kết nối hàng nghìn sinh viên cùng ôn luyện, chia sẻ kinh nghiệm vượt chuẩn đầu ra tiếng Anh.',
    },
    {
      icon: <ShieldCheck size={28} color="var(--primary)" />,
      title: 'Hệ thống bảo mật & Ổn định',
      desc: 'Quản lý tài khoản bảo mật bằng JWT và Spring Security tiêu chuẩn doanh nghiệp.',
    },
  ];

  return (
    <section className="section-padding features-section bg-gray-50">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">TẠI SAO CHỌN TOEIC PRO?</span>
          <h2 className="section-title">Giải Pháp Luyện Thi Toàn Diện Cho Bạn</h2>
          <p className="section-desc">
            Được thiết kế dựa trên phương pháp học tập khoa học, giúp bạn tiết kiệm 50% thời gian ôn luyện mà vẫn đạt hiệu quả tối đa.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-wrapper">{feat.icon}</div>
              <h3 className="feature-title">{feat.title}</h3>
              <p className="feature-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
