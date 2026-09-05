import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';

const ToeicPartsSection = () => {
  const listeningParts = [
    {
      part: 'Part 1',
      title: 'Photographs (Mô tả tranh)',
      count: '6 câu hỏi',
      desc: 'Quan sát tranh hình ảnh hoạt động của con người hoặc đồ vật, chọn câu miêu tả chính xác nhất.',
    },
    {
      part: 'Part 2',
      title: 'Question - Response (Hỏi - Đáp)',
      count: '25 câu hỏi',
      desc: 'Lắng nghe câu hỏi hoặc câu nhận định ngắn và chọn câu trả lời phản hồi logic nhất trong 3 lựa chọn.',
    },
    {
      part: 'Part 3',
      title: 'Short Conversations (Hội thoại ngắn)',
      count: '39 câu hỏi (13 đoạn)',
      desc: 'Nghe đoạn đối thoại giữa 2-3 người và trả lời 3 câu hỏi cho mỗi bài nghe về nội dung, suy luận.',
    },
    {
      part: 'Part 4',
      title: 'Short Talks (Bài nói chuyện ngắn)',
      count: '30 câu hỏi (10 bài)',
      desc: 'Lắng nghe các bài thông báo, quảng cáo, tin tức một người nói và trả lời câu hỏi chi tiết.',
    },
  ];

  const readingParts = [
    {
      part: 'Part 5',
      title: 'Incomplete Sentences (Điền vào câu)',
      count: '30 câu hỏi',
      desc: 'Kiểm tra kiến thức từ vựng, ngữ pháp cốt lõi và từ loại trong môi trường làm việc quốc tế.',
    },
    {
      part: 'Part 6',
      title: 'Text Completion (Hoàn thành đoạn văn)',
      count: '16 câu hỏi (4 đoạn)',
      desc: 'Đọc các bức thư, email, thông báo nội bộ và điền từ vựng hoặc câu hoàn chỉnh vào chỗ trống.',
    },
    {
      part: 'Part 7',
      title: 'Reading Comprehension (Đọc hiểu)',
      count: '54 câu hỏi',
      desc: 'Gồm đoạn đơn, đoạn đôi và đoạn ba. Kiểm tra khả năng tổng hợp thông tin, nắm ý chính và suy luận.',
    },
  ];

  return (
    <section className="section-padding toeic-parts-section">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">CHƯƠNG TRÌNH ÔN LUYỆN</span>
          <h2 className="section-title">Luyện Tập 7 Phần Thi TOEIC Chuẩn</h2>
          <p className="section-desc">
            Phân loại rõ ràng 2 kỹ năng Nghe hiểu (Listening 100 câu) và Đọc hiểu (Reading 100 câu) với hệ thống ngân hàng câu hỏi đa dạng.
          </p>
        </div>

        <div className="parts-category-block">
          <div className="category-header">
            <div className="category-title-icon">
              <Headphones size={22} color="var(--primary)" />
              <h3 className="category-title">Listening Comprehension (Kỹ năng Nghe - 100 câu / 45 phút)</h3>
            </div>
            <span className="badge badge-primary">Format mới</span>
          </div>

          <div className="parts-grid">
            {listeningParts.map((item, idx) => (
              <div key={idx} className="part-card">
                <div className="part-card-top">
                  <span className="part-tag">{item.part}</span>
                  <span className="part-count">{item.count}</span>
                </div>
                <h4 className="part-name">{item.title}</h4>
                <p className="part-desc">{item.desc}</p>
                <Link to="/practice" className="part-action-link">
                  Luyện tập ngay <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="parts-category-block" style={{ marginTop: '40px' }}>
          <div className="category-header">
            <div className="category-title-icon">
              <BookOpen size={22} color="var(--accent)" />
              <h3 className="category-title">Reading Comprehension (Kỹ năng Đọc - 100 câu / 75 phút)</h3>
            </div>
            <span className="badge badge-warning">Đòi hỏi tốc độ</span>
          </div>

          <div className="parts-grid">
            {readingParts.map((item, idx) => (
              <div key={idx} className="part-card">
                <div className="part-card-top">
                  <span className="part-tag" style={{ background: '#fef3c7', color: '#b45309' }}>{item.part}</span>
                  <span className="part-count">{item.count}</span>
                </div>
                <h4 className="part-name">{item.title}</h4>
                <p className="part-desc">{item.desc}</p>
                <Link to="/practice" className="part-action-link">
                  Luyện tập ngay <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToeicPartsSection;
