import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Heart, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & About */}
          <div className="footer-col">
            <div className="footer-brand">
              <div className="logo-icon-wrapper" style={{ width: 36, height: 36 }}>
                <BookOpen size={20} color="#ffffff" />
              </div>
              <span className="logo-title" style={{ color: '#ffffff', fontSize: '1.4rem' }}>
                TOEIC<span style={{ color: '#48bb78' }}>PRO</span>
              </span>
            </div>
            <p className="footer-desc">
              Hệ thống luyện thi TOEIC trực tuyến chuẩn format quốc tế. Cung cấp bài tập phân loại theo từng Part từ 1 đến 7, giúp học viên nâng cao điểm số vững chắc.
            </p>
            <div className="footer-contact-info">
              <p><MapPin size={16} /> Khu 2, Đ. 3/2, P. Xuân Khánh, Q. Ninh Kiều, TP. Cần Thơ</p>
              <p><Phone size={16} /> +84 (0) 292 3832 663</p>
              <p><Mail size={16} /> toeic.learning@ctu.edu.vn</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/"><ArrowRight size={14} /> Trang chủ</Link></li>
              <li><Link to="/practice"><ArrowRight size={14} /> Luyện thi TOEIC</Link></li>
              <li><Link to="/about"><ArrowRight size={14} /> Giới thiệu trung tâm</Link></li>
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

          {/* Col 4: Newsletter / Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Bản tin học tập</h4>
            <p className="footer-desc">
              Đăng ký nhận mẹo luyện thi TOEIC 800+, chiến thuật giải đề và bộ từ vựng độc quyền hàng tuần.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="form-control"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
              />
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} TOEIC Learning Platform. Phát triển phục vụ Niên luận ngành Công nghệ Thông tin - CTU.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
