import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Layers,
  Award,
  PlayCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { examService } from '../../services/examService';

const courseImages = [
  '/images/courses-2.webp',
  '/images/courses-3.webp',
  '/images/courses-8.webp',
  '/images/courses-12.webp',
];

const FeaturedCoursesSection = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTests = async () => {
      try {
        const res = await examService.getTests(1, 3, '', 'createdAt', 'DESC', 'PUBLISHED');
        if (res.code === 1000 && res.data) {
          setTests(res.data.content || []);
        }

      } catch (err) {
        console.error('Error fetching featured tests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedTests();
  }, []);

  if (!loading && tests.length === 0) {
    return null;
  }

  return (
    <section className="section-padding" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              borderRadius: 20,
              backgroundColor: '#dcfce7',
              color: '#166534',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            <Sparkles size={16} /> Khóa học & Đề thi tiêu biểu
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, margin: '0 0 14px 0' }}>
            Luyện Thi Với Các Bộ Đề Chuẩn Format ETS
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
            Hệ thống ngân hàng đề thi được cập nhật liên tục, bám sát các dạng câu hỏi thực tế trong kỳ thi TOEIC quốc tế gần nhất.
          </p>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                border: '3px solid #e2e8f0',
                borderTopColor: '#198754',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Đang nạp các đề thi nổi bật...</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 28,
            }}
          >
            {tests.map((test, index) => {
              const imageSrc = courseImages[index % courseImages.length];
              const contextCount = test.contextQuestions?.length || 0;
              const formattedDate = test.createdAt
                ? new Date(test.createdAt).toLocaleDateString('vi-VN')
                : 'Mới nhất';

              return (
                <div
                  key={test.id}
                  className="program-card"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Thumbnail Image & Badges */}
                  <div style={{ position: 'relative', height: 210, overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                    <img
                      src={imageSrc}
                      alt={test.titleTest}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: '#198754',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      FREE TEST
                    </span>
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        left: 12,
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      Format ETS
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>TOEIC Full Test</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{formattedDate}</span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: 8, lineHeight: 1.35 }}>
                      {test.titleTest}
                    </h3>

                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6, marginBottom: 18, flex: 1 }}>
                      Đề thi thử đầy đủ các kỹ năng Nghe và Đọc theo chuẩn format kỳ thi TOEIC quốc tế. Có giải thích chi tiết từng câu.
                    </p>

                    {/* Metrics */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderTop: '1px solid #f1f5f9',
                        borderBottom: '1px solid #f1f5f9',
                        marginBottom: 20,
                        fontSize: '0.82rem',
                        color: '#475569',
                        fontWeight: 600,
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={15} color="#198754" /> 120 phút
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Layers size={15} color="#198754" /> {contextCount} cụm phần
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Award size={15} color="#eab308" /> Điểm max 990
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
                      <Link
                        to={`/courses/${test.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ textDecoration: 'none', textAlign: 'center', justifyContent: 'center' }}
                      >
                        Chi tiết đề
                      </Link>
                      <Link
                        to={`/courses/${test.id}/take`}
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: 'none', textAlign: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <PlayCircle size={15} /> Làm bài ngay
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <Link
            to="/courses"
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', fontWeight: 700 }}
          >
            <BookOpen size={18} /> Xem tất cả {tests.length > 0 ? 'đề thi & khóa học' : 'khóa học'} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
