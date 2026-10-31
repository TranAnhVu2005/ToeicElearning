import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & About */}
          <div className="footer-col">
            <div className="footer-brand">
              <div className="logo-icon-wrapper" style={{ width: 36, height: 36 }}>
                <BookOpen size={20} />
              </div>
              <span className="logo-title" style={{ color: '#ffffff', fontSize: '1.4rem' }}>
                Toeic<span style={{ color: '#FF5B93' }}>Learning</span>
              </span>
            </div>
            <p className="footer-desc">
              TOEIC Learning hỗ trợ luyện theo từng Part, làm full test và xem lại kết quả trên cùng một nền tảng.
            </p>
          </div>


          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/"><ArrowRight size={14} /> Trang chủ</Link></li>
              <li><Link to="/courses"><ArrowRight size={14} /> Khóa học & Đề thi</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Luyện tập theo Part</Link></li>
              <li><Link to="/about"><ArrowRight size={14} /> Giới thiệu dự án</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} /> Liên hệ & Hỗ trợ</Link></li>
              <li><Link to="/login"><ArrowRight size={14} /> Đăng nhập hệ thống</Link></li>
              <li><Link to="/register"><ArrowRight size={14} /> Đăng ký tài khoản</Link></li>
            </ul>
          </div>

          {/* Col 3: TOEIC Parts */}
          <div className="footer-col">
            <h4 className="footer-heading">Cấu trúc 7 Parts TOEIC</h4>
            <ul className="footer-links">
              <li><Link to="/practice"><ArrowRight size={14} /> Part 1: Mô tả hình ảnh</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Part 2: Hỏi & Đáp</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Part 3: Đoạn hội thoại</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Part 4: Bài nói ngắn</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Part 5: Hoàn thành câu</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Part 6 & 7: Đọc hiểu</Link></li>
            </ul>
          </div>

          {/* Col 4: Learning paths and support */}
          <div className="footer-col">
            <h4 className="footer-heading">Bắt đầu học</h4>
            <p className="footer-desc">
              Chọn một phần để luyện, mở đề đã phát hành hoặc gửi câu hỏi cho nhóm dự án.
            </p>
            <ul className="footer-links">
              <li><Link to="/practice"><ArrowRight size={14} /> Luyện theo Part</Link></li>
              <li><Link to="/courses"><ArrowRight size={14} /> Khám phá đề thi</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} /> Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} TOEIC Learning · Nền tảng luyện tập TOEIC.
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
