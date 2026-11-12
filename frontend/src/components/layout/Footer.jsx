import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import brandLogo from '../../assets/img/logo1.png';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand & About */}
          <div className="footer-col">
            <div className="footer-brand">
              <div className="footer-logo-mark">
                <img src={brandLogo} alt="" />
              </div>
              <span className="logo-title">
                TOEIC <span>ELearning</span>
              </span>
            </div>
            <p className="footer-desc">
              TOEIC Learning hỗ trợ luyện theo từng phần, làm toàn bộ bài thi và xem lại kết quả làm bài.
            </p>
          </div>


          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Liên kết nhanh</h4>
            <ul className="footer-links">
              <li><Link to="/"><ArrowRight size={14} /> Trang chủ</Link></li>
              <li><Link to="/courses"><ArrowRight size={14} /> Kho đề thi TOEIC</Link></li>
              <li><Link to="/classrooms"><ArrowRight size={14} /> Không gian Lớp học</Link></li>
              <li><Link to="/about"><ArrowRight size={14} /> Giới thiệu dự án</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} /> Liên hệ & Hỗ trợ</Link></li>
              <li><Link to="/login"><ArrowRight size={14} /> Đăng nhập hệ thống</Link></li>
              <li><Link to="/register"><ArrowRight size={14} /> Đăng ký tài khoản</Link></li>
            </ul>
          </div>


          {/* Col 4: Learning paths and support */}
          <div className="footer-col">
            <h4 className="footer-heading">Bắt đầu học</h4>
            <p className="footer-desc">
              Chọn đề thi phù hợp để làm full test hoặc luyện tập từng phần theo mục tiêu cá nhân.
            </p>
            <ul className="footer-links">
              <li><Link to="/courses"><ArrowRight size={14} /> Khám phá đề thi</Link></li>
              <li><Link to="/contact"><ArrowRight size={14} /> Liên hệ hỗ trợ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} TOEIC Learning - Trần Anh Vũ - Zalo: 0359906510
          </p>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
