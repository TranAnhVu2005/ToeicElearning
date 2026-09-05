import React from 'react';
import { Target, Award, Users, BookOpen, Compass, CheckCircle2 } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: 8 }}>Về chúng tôi</span>
          <h1 className="page-title">Hệ Thống Luyện Thi TOEIC Trực Tuyến TOEIC PRO</h1>
          <p className="page-subtitle">
            Dự án nghiên cứu và phát triển thuộc Niên luận ngành Công nghệ Thông tin - Trường Công nghệ Thông tin & Truyền thông, Đại học Cần Thơ.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        {/* Mission & Vision */}
        <div className="about-intro-grid">
          <div className="about-text-content">
            <h2 className="section-title">Sứ Mệnh & Tầm Nhìn</h2>
            <p className="text-muted" style={{ lineHeight: 1.8, marginBottom: 16 }}>
              Tiếng Anh TOEIC là chuẩn đầu ra thiết yếu đối với sinh viên các trường đại học và là tấm vé thông hành quan trọng khi gia nhập thị trường lao động công nghệ.
            </p>
            <p className="text-muted" style={{ lineHeight: 1.8, marginBottom: 24 }}>
              Hệ thống TOEIC PRO được xây dựng nhằm cung cấp giải pháp tự học, tự ôn luyện toàn diện, trực quan và dễ tiếp cận nhất. Chúng tôi số hóa các bài tập, phân tích cấu trúc 7 phần thi TOEIC, cung cấp môi trường luyện đề chuẩn xác giúp học viên phát triển toàn diện cả hai kỹ năng Listening và Reading.
            </p>

            <div className="about-highlights">
              <div className="highlight-item">
                <CheckCircle2 size={20} color="var(--primary)" />
                <span>Kho bài tập bám sát format đề thi ETS mới nhất</span>
              </div>
              <div className="highlight-item">
                <CheckCircle2 size={20} color="var(--primary)" />
                <span>Giao diện hiện đại, tối ưu trải nghiệm học trên máy tính và điện thoại</span>
              </div>
              <div className="highlight-item">
                <CheckCircle2 size={20} color="var(--primary)" />
                <span>Nền tảng được bảo chứng kỹ thuật với Spring Boot và ReactJS</span>
              </div>
            </div>
          </div>

          <div className="about-image-card">
            <img
              src="/images/course-2.webp"
              alt="Học nhóm TOEIC"
              className="about-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80';
              }}
            />
          </div>
        </div>

        {/* Core Values */}
        <div style={{ marginTop: 60 }}>
          <div className="section-header">
            <span className="section-subtitle">GIÁ TRỊ CỐT LÕI</span>
            <h2 className="section-title">Cam Kết Chất Lượng Đào Tạo</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Target size={28} color="var(--primary)" />
              </div>
              <h3 className="feature-title">Định hướng mục tiêu rõ ràng</h3>
              <p className="feature-desc">
                Cung cấp lộ trình luyện thi theo từng thang điểm từ 450, 650 đến 850+, giúp bạn định hình rõ năng lực hiện tại.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Award size={28} color="var(--primary)" />
              </div>
              <h3 className="feature-title">Chuẩn chất lượng học thuật</h3>
              <p className="feature-desc">
                Nội dung câu hỏi, audio và giải thích được biên soạn cẩn thận, sát với thực tế đề thi tại IIG Việt Nam.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Compass size={28} color="var(--primary)" />
              </div>
              <h3 className="feature-title">Tiện lợi & Linh hoạt</h3>
              <p className="feature-desc">
                Học mọi lúc mọi nơi trên mọi thiết bị. Giao diện được tối ưu hóa cho tốc độ tải cực nhanh và mượt mà.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
