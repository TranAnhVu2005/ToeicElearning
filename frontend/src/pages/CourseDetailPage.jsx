import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  Award,
  CheckCircle2,
  PlayCircle,
  Headphones,
  FileText,
  Layers,
  ArrowLeft,
  Shield,
  HelpCircle,
  AlertCircle,
  Calendar,
  Share2,
  Edit2,
  Trash2,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

const CourseDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, canManageTests } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'curriculum' | 'rules'

  // Admin Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDeleteTest = async () => {
    try {
      setActionLoading(true);
      const res = await examService.deleteTest(testId);
      if (res.code === 1000) {
        navigate('/courses', { state: { message: `Đã xóa đề thi "${test?.titleTest}" thành công!` } });
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xóa đề thi.' });
      }
    } catch (err) {
      console.error('Delete test error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa đề thi.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishTestNow = async () => {
    try {
      setActionLoading(true);
      const res = await examService.publishTest(testId);
      if (res.code === 1000) {
        setTest((prev) => ({ ...prev, status: 'PUBLISHED' }));
        setToast({ type: 'success', message: 'Xuất bản đề thi thành công! Học viên đã có thể tham gia thi.' });
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xuất bản đề thi.' });
      }
    } catch (err) {
      console.error('Publish error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xuất bản đề thi.' });
    } finally {
      setActionLoading(false);
    }
  };


  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getTestDetail(testId);
        if (res.code === 1000 && res.data) {
          setTest(res.data);
        } else {
          setError(res.message || 'Không tìm thấy thông tin đề thi');
        }
      } catch (err) {
        console.error('Error fetching test detail:', err);
        setError('Lỗi kết nối máy chủ khi tải chi tiết bài thi.');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchDetail();
    }
  }, [testId]);

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              border: '4px solid var(--border-light)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Đang tải thông tin đề thi...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container section-padding" style={{ textAlign: 'center', minHeight: '60vh' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>Không tìm thấy đề thi</h2>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 24px 0' }}>{error || 'Đề thi không tồn tại hoặc đã bị xóa.'}</p>
        <Link to="/courses" className="btn btn-primary">
          <ArrowLeft size={16} /> Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  const contextQuestions = test.contextQuestions || [];

  return (
    <div className="course-detail-page" style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Top Banner & Breadcrumbs (Academica .course-header) */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          borderBottom: '1px solid var(--border-light)',
          padding: '28px 0',
        }}
      >
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 14 }}>
            <Link to="/" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/courses" style={{ color: 'var(--gray-500)', textDecoration: 'none' }}>
              Khóa học & Đề thi
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{test.titleTest}</span>
          </div>

          {/* Badges & Actions Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="badge badge-primary">TOEIC Full Test</span>
              <span className="badge badge-primary" style={{ backgroundColor: '#0d6efd' }}>
                Format ETS Mới Nhất
              </span>
              <span className="badge badge-primary" style={{ backgroundColor: '#eab308' }}>
                Miễn Phí 100%
              </span>
              {test.status === 'DRAFT' && (
                <span className="badge badge-warning text-xs font-bold inline-flex items-center gap-1">
                  <Clock size={13} /> Bản nháp (DRAFT)
                </span>
              )}
            </div>

            {/* Quick Admin / Teacher Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {test.status === 'DRAFT' && canManageTests && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm inline-flex items-center gap-1.5 font-bold"
                  onClick={handlePublishTestNow}
                  disabled={actionLoading}
                >
                  <CheckCircle2 size={15} /> Xuất bản ngay
                </button>
              )}

              {canManageTests && (
                <Link
                  to={`/admin/tests?editId=${test.id}`}
                  className="btn btn-outline btn-sm inline-flex items-center gap-1.5 font-bold"
                  title="Mở trình soạn thảo và chỉnh sửa toàn bộ đề thi"
                >
                  <Edit2 size={15} /> Chỉnh sửa đề thi
                </Link>
              )}

              {isAdmin && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm inline-flex items-center gap-1.5 font-bold text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 size={15} /> Xóa đề thi
                </button>
              )}
            </div>
          </div>


          {/* Title */}
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main, #1e293b)', margin: '0 0 14px 0', lineHeight: 1.3 }}>
            {test.titleTest}
          </h1>

          {/* Subtitle / Lead text */}
          <p style={{ fontSize: '1rem', color: 'var(--text-muted, #64748b)', maxWidth: 800, lineHeight: 1.6, margin: '0 0 20px 0' }}>
            Bộ đề thi thử trực tuyến hoàn chỉnh gồm cả 2 kỹ năng Listening (Phần Nghe) và Reading (Phần Đọc) với đầy đủ file âm thanh bản xứ, hình ảnh, bài đọc hiểu và đáp án giải thích.
          </p>

          {/* Meta Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--gray-600)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="var(--primary)" /> Thời gian: <strong>120 phút</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="var(--primary)" /> Số phần thi: <strong>{contextQuestions.length} cụm câu hỏi</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={16} color="#eab308" /> Thang điểm: <strong>0 - 990 điểm ETS</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="var(--gray-500)" /> Ngày tạo:{' '}
              {test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : 'Mới cập nhật'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Layout (Academica .course-details) */}
      <div className="container section-padding">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 36, alignItems: 'start' }}>
          {/* Left Column: Tabs & Detailed Info */}
          <div>
            {/* Tab Navigation Buttons */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                borderBottom: '2px solid var(--border-light)',
                marginBottom: 28,
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'overview' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'overview' ? 'var(--primary)' : 'var(--gray-600)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginBottom: -2,
                }}
              >
                Tổng quan đề thi
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'curriculum' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'curriculum' ? 'var(--primary)' : 'var(--gray-600)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginBottom: -2,
                }}
              >
                Cấu trúc đề ({contextQuestions.length} cụm câu hỏi)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rules')}
                style={{
                  padding: '12px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'rules' ? '3px solid var(--primary)' : '3px solid transparent',
                  color: activeTab === 'rules' ? 'var(--primary)' : 'var(--gray-600)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginBottom: -2,
                }}
              >
                Quy chế làm bài
              </button>
            </div>

            {/* TAB 1: Overview */}
            {activeTab === 'overview' && (
              <div
                style={{
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 32,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
                  Giới thiệu về bài thi TOEIC Quốc Tế
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
                  Bài thi TOEIC (Test of English for International Communication) là chuẩn đánh giá năng lực tiếng Anh trong môi trường giao tiếp quốc tế được công nhận bởi hơn 14.000 tổ chức tại 160 quốc gia trên thế giới.
                </p>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                  Mục tiêu điểm số tương ứng:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 28 }}>
                  <div style={{ padding: 14, backgroundColor: 'var(--bg-page)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: 4 }}>
                      450 - 550 Điểm
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      Chuẩn đầu ra tốt nghiệp của các trường Đại học, Cao đẳng.
                    </span>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--bg-page)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                    <span style={{ fontWeight: 800, color: '#0d6efd', display: 'block', marginBottom: 4 }}>
                      650 - 750 Điểm
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      Giao tiếp tốt trong công việc và ứng tuyển doanh nghiệp đa quốc gia.
                    </span>
                  </div>
                  <div style={{ padding: 14, backgroundColor: 'var(--bg-page)', borderRadius: 10, border: '1px solid var(--border-light)' }}>
                    <span style={{ fontWeight: 800, color: '#eab308', display: 'block', marginBottom: 4 }}>
                      850 - 990 Điểm
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      Trình độ cao cấp, thành thạo như người bản xứ.
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 14 }}>
                  Lợi ích khi làm đề thi này:
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Làm quen với áp lực thời gian thực 120 phút liên tục không gián đoạn.',
                    'File nghe giọng đọc chuẩn bản xứ (Anh - Mỹ, Anh - Anh, Úc, Canada).',
                    'Đoạn văn đọc hiểu cập nhật các chủ đề kinh tế, tài chính, công nghệ và thương mại.',
                    'Hệ thống tự động chấm điểm và quy đổi sang bảng điểm chuẩn ETS (0 - 990 điểm).',
                    'Xem lại chi tiết bài làm kèm bản dịch song ngữ và giải thích ngữ pháp.',
                  ].map((benefit, bIdx) => (
                    <li key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                      <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* TAB 2: Curriculum / Structure */}
            {activeTab === 'curriculum' && (
              <div
                style={{
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 32,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
                  Danh Sách Cụm Câu Hỏi Trong Đề Thi ({contextQuestions.length})
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
                  Dữ liệu được lấy trực tiếp từ hệ thống bài thi của bạn. Mỗi cụm câu hỏi tương ứng với file âm thanh hoặc đoạn văn đọc hiểu.
                </p>

                {contextQuestions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--gray-500)' }}>
                    Bộ đề này hiện chưa có cụm câu hỏi nào được thêm vào.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {contextQuestions.map((cq, idx) => {
                      const partName = cq.part?.namePart || `Cụm #${idx + 1}`;
                      return (
                        <div
                          key={cq.id || idx}
                          style={{
                            padding: '16px 20px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--bg-page)',
                            border: '1px solid var(--border-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                                {partName}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                Cụm câu hỏi {idx + 1}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 6, display: 'flex', gap: 14 }}>
                              {cq.audioUrl && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--primary)' }}>
                                  <Headphones size={13} /> Có file Audio
                                </span>
                              )}
                              {cq.imageUrl && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0d6efd' }}>
                                  <BookOpen size={13} /> Có hình ảnh
                                </span>
                              )}
                              {cq.paragraph && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#eab308' }}>
                                  <FileText size={13} /> Có bài đọc
                                </span>
                              )}
                              {cq.transcript && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                                  Transcript: {cq.transcript.substring(0, 45)}...
                                </span>
                              )}
                            </div>
                          </div>

                          <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)', fontFamily: 'monospace' }}>
                            #{cq.id?.substring(0, 8)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Examination Rules */}
            {activeTab === 'rules' && (
              <div
                style={{
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 32,
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 16 }}>
                  Quy Chế & Hướng Dẫn Phòng Thi Trực Tuyến
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Shield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span><strong>1. Thời gian làm bài:</strong> Bài thi kéo dài đúng <strong>120 phút</strong>. Đồng hồ đếm ngược sẽ tự động thu bài khi hết giờ.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Shield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span><strong>2. Âm thanh phần Nghe:</strong> Hãy kiểm tra tai nghe và âm lượng máy tính trước khi bấm bắt đầu làm bài.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Shield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span><strong>3. Điều hướng câu hỏi:</strong> Bạn có thể sử dụng Bảng câu hỏi bên phải để chuyển nhanh đến câu hỏi bất kỳ hoặc gắn cờ câu cần xem lại.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <Shield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span><strong>4. Nộp bài:</strong> Khi hoàn thành bài thi, bấm nút <strong>"Nộp bài thi"</strong> để hệ thống chấm điểm và xuất bảng phân tích kết quả.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Pricing / Start Exam Card (Academica .pricing-card) */}
          <div
            style={{
              position: 'sticky',
              top: 100,
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid var(--primary)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Header / Thumbnail */}
            <div style={{ height: 180, position: 'relative', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
              <img
                src="/images/courses-2.webp"
                alt={test.titleTest}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 70%)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 16,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                }}
              >
                MIỄN PHÍ
              </span>
            </div>

            {/* Pricing Features */}
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, fontSize: '0.88rem', color: 'var(--gray-700)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Clock size={16} color="var(--primary)" />
                  <span>Thời lượng thi: <strong>120 phút</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BookOpen size={16} color="var(--primary)" />
                  <span>2 kỹ năng: <strong>Listening & Reading</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Award size={16} color="var(--primary)" />
                  <span>Chứng nhận điểm thi: <strong>Format ETS</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>Có giải thích chi tiết đáp án</span>
                </div>
              </div>

              {/* Big CTA Button */}
              <Link
                to={`/courses/${test.id}/take`}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '14px 0',
                  fontSize: '1rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 6px 18px rgba(25, 135, 84, 0.35)',
                }}
              >
                <PlayCircle size={20} /> BẮT ĐẦU LÀM BÀI THI
              </Link>

              <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--gray-500)', margin: '12px 0 0 0' }}>
                Hỗ trợ lưu bài và xem lại kết quả mọi lúc mọi nơi
              </p>

              {/* Admin Quick Action Box (Only for Admin) */}
              {isAdmin && (
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} color="#16a34a" /> Quản lý đề thi (Admin)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Link
                      to={`/admin/tests?editId=${test.id}`}
                      className="btn btn-outline btn-sm inline-flex items-center justify-center gap-1.5 font-bold"
                      title="Mở trình soạn thảo và chỉnh sửa toàn bộ đề thi"
                    >
                      <Edit2 size={15} /> Sửa đề
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm inline-flex items-center justify-center gap-1.5 font-bold text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => setDeleteModalOpen(true)}
                    >
                      <Trash2 size={15} /> Xóa đề
                    </button>
                  </div>
                  <Link
                    to="/admin/tests"
                    style={{ display: 'block', textAlign: 'center', fontSize: '0.82rem', color: '#16a34a', marginTop: 10, fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Đến trang Quản trị tất cả đề thi &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN ACTION MODALS */}
      {isAdmin && (
        <>
          {/* DELETE TEST MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa đề thi"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#0f172a' }}>
            Bạn có chắc chắn muốn xóa bài thi này?
          </h4>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#64748b' }}>
            Đề thi <strong>"{test?.titleTest}"</strong> cùng toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn khỏi hệ thống.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              type="button"
              className="btn btn-outline"
              disabled={actionLoading}
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actionLoading}
              onClick={handleDeleteTest}
              style={{ gap: 6 }}
            >
              <Trash2 size={16} /> {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
            </div>
          </div>
        </Modal>
      </>
    )}

      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;
