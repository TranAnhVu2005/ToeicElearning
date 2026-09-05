import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, Clock, CheckCircle2, PlayCircle, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PracticePage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const parts = [
    {
      id: 1,
      part: 'Part 1',
      skill: 'listening',
      name: 'Photographs',
      vnName: 'Mô tả hình ảnh',
      questions: 6,
      duration: '5 phút',
      difficulty: 'Dễ',
      badgeColor: 'badge-primary',
      description: 'Luyện nghe mô tả đồ vật, hành động của người trong tranh. Tránh các bẫy về thì và đại từ.',
    },
    {
      id: 2,
      part: 'Part 2',
      skill: 'listening',
      name: 'Question - Response',
      vnName: 'Hỏi & Đáp',
      questions: 25,
      duration: '10 phút',
      difficulty: 'Trung bình',
      badgeColor: 'badge-primary',
      description: 'Luyện phản xạ nghe nhanh câu hỏi Wh-, Yes/No, câu hỏi đuôi và lựa chọn câu trả lời gián tiếp thông minh.',
    },
    {
      id: 3,
      part: 'Part 3',
      skill: 'listening',
      name: 'Short Conversations',
      vnName: 'Đoạn hội thoại ngắn',
      questions: 39,
      duration: '15 phút',
      difficulty: 'Khó',
      badgeColor: 'badge-warning',
      description: 'Hội thoại 2-3 người về các chủ đề văn phòng, đặt hàng, du lịch. Rèn luyện kỹ năng đọc trước câu hỏi.',
    },
    {
      id: 4,
      part: 'Part 4',
      skill: 'listening',
      name: 'Short Talks',
      vnName: 'Bài nói chuyện ngắn',
      questions: 30,
      duration: '15 phút',
      difficulty: 'Khó',
      badgeColor: 'badge-warning',
      description: 'Nghe độc thoại (thông báo chuyến bay, tin nhắn thoại, bản tin thời tiết). Chú ý các từ khóa then chốt.',
    },
    {
      id: 5,
      part: 'Part 5',
      skill: 'reading',
      name: 'Incomplete Sentences',
      vnName: 'Điền vào câu',
      questions: 30,
      duration: '12 phút',
      difficulty: 'Trung bình',
      badgeColor: 'badge-primary',
      description: 'Tổng hợp ngữ pháp (thì, mệnh đề quan hệ, liên từ) và từ vựng thông dụng trong môi trường công sở.',
    },
    {
      id: 6,
      part: 'Part 6',
      skill: 'reading',
      name: 'Text Completion',
      vnName: 'Hoàn thành đoạn văn',
      questions: 16,
      duration: '8 phút',
      difficulty: 'Trung bình',
      badgeColor: 'badge-primary',
      description: 'Điền từ hoặc chọn câu phù hợp với ngữ cảnh đoạn văn trong email, thư mời, thông cáo báo chí.',
    },
    {
      id: 7,
      part: 'Part 7',
      skill: 'reading',
      name: 'Reading Comprehension',
      vnName: 'Đọc hiểu đoạn văn',
      questions: 54,
      duration: '55 phút',
      difficulty: 'Rất khó',
      badgeColor: 'badge-danger',
      description: 'Đoạn văn đơn, đoạn kép và đoạn ba. Kỹ năng Skimming và Scanning để bắt ý chính và dữ liệu so sánh.',
    },
  ];

  const filteredParts = parts.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.skill === selectedCategory;
  });

  return (
    <div className="practice-page">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: 8 }}>Ngân hàng luyện tập</span>
          <h1 className="page-title">Kho Bài Tập & Đề Thi Thử TOEIC</h1>
          <p className="page-subtitle">
            Lựa chọn từng phần thi để bắt đầu làm bài luyện tập hoặc trải nghiệm đề thi hoàn chỉnh.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        {/* Category Filter Controls */}
        <div className="filter-bar">
          <div className="filter-label">
            <Filter size={18} /> Phân loại kỹ năng:
          </div>
          <div className="filter-buttons">
            <button
              className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tất cả (7 Parts)
            </button>
            <button
              className={`btn btn-sm ${selectedCategory === 'listening' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategory('listening')}
            >
              <Headphones size={15} style={{ marginRight: 4 }} /> Listening (Part 1 - 4)
            </button>
            <button
              className={`btn btn-sm ${selectedCategory === 'reading' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setSelectedCategory('reading')}
            >
              <BookOpen size={15} style={{ marginRight: 4 }} /> Reading (Part 5 - 7)
            </button>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="practice-grid">
          {filteredParts.map((item) => (
            <div key={item.id} className="practice-card">
              <div className="practice-card-header">
                <span className="part-badge">{item.part}</span>
                <span className={`badge ${item.badgeColor}`}>{item.difficulty}</span>
              </div>

              <h3 className="practice-card-title">{item.name}</h3>
              <p className="practice-card-vn">{item.vnName}</p>
              <p className="practice-card-desc">{item.description}</p>

              <div className="practice-meta-row">
                <div className="practice-meta-item">
                  <CheckCircle2 size={16} color="var(--primary)" />
                  <span>{item.questions} câu hỏi</span>
                </div>
                <div className="practice-meta-item">
                  <Clock size={16} color="var(--gray-500)" />
                  <span>~{item.duration}</span>
                </div>
              </div>

              <div className="practice-action-box">
                {isAuthenticated ? (
                  <button className="btn btn-primary" style={{ width: '100%' }}>
                    <PlayCircle size={18} /> Bắt đầu làm bài
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-outline" style={{ width: '100%' }}>
                    Đăng nhập để làm bài
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
