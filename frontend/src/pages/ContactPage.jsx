import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import Toast from '../components/common/Toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setToast({ type: 'error', message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
      return;
    }

    setSubmitted(true);
    setToast({
      type: 'success',
      message: 'Cảm ơn bạn! Tin nhắn của bạn đã được gửi thành công đến bộ phận hỗ trợ.',
    });
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="contact-page" style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: 8 }}>Liên hệ & Hỗ trợ</span>
          <h1 className="page-title">Kết Nối Với Hệ Thống ToeicElearning</h1>
          <p className="page-subtitle">
            Dự án học tập và luyện thi TOEIC trực tuyến - Sinh viên Trần Anh Vũ, Trường Đại Học Cần Thơ.
          </p>
        </div>
      </div>


      <div className="container section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 36, alignItems: 'start' }}>
          
          {/* Form Column */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              padding: 36,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <span className="badge badge-primary" style={{ fontSize: '0.75rem', marginBottom: 8 }}>Gửi thư trực tuyến</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 8px 0' }}>
                Gửi Tin Nhắn Cho Chúng Tôi
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                Điền thông tin vào biểu mẫu dưới đây, đội ngũ hỗ trợ sẽ phản hồi trong vòng 24 giờ làm việc.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>
                    Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>
                    Địa chỉ Email <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="email@ctu.edu.vn"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.92rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>
                  Tiêu đề cần hỗ trợ
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Ví dụ: Góp ý về câu hỏi Part 3 / Thắc mắc tài khoản..."
                  value={formData.subject}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: 6, color: '#1e293b' }}>
                  Nội dung tin nhắn <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Chi tiết câu hỏi hoặc góp ý của bạn..."
                  value={formData.message}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontWeight: 700 }}
              >
                <Send size={16} /> Gửi tin nhắn ngay
              </button>
            </form>
          </div>

          {/* Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                padding: 28,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
                Thông Tin Liên Hệ
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Trụ sở học thuật</h5>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
                      Trường Đại Học Cần Thơ, Khoa Công nghệ Thông tin - Trường CNTT&TT, Khu II, Đường 3/2, Q. Ninh Kiều, TP. Cần Thơ
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Đường dây nóng</h5>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                      0359906510
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Hộp thư điện tử</h5>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                      trananhvu314159@gmail.com
                    </p>
                  </div>
                </div>


                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Thời gian hỗ trợ</h5>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                      Thứ 2 - Thứ 7: 07:30 - 17:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Box */}
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                height: 220,
              }}
            >
              <iframe
                title="Can Tho University Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.841518442436!2d105.7684266!3d10.0299337!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0895a51d6071f%3A0xb3a22830f30c8bc4!2zxJDhuqFpIGjhu41jIEPhuqduIFRoxqE!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
