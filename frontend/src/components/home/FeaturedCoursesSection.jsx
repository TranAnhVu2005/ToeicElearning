import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock3, Layers, PlayCircle } from 'lucide-react';
import { examService } from '../../services/examService';

const FeaturedCoursesSection = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    examService.getTests(1, 3, '', 'createdAt', 'DESC', 'PUBLISHED')
      .then((res) => {
        if (active && res.code === 1000 && res.data) setTests(res.data.content || []);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (!loading && tests.length === 0) return null;

  return (
    <section className="section-padding neo-catalog">
      <div className="container">
        <div className="neo-catalog-heading">
          <div>
            <span className="section-subtitle">BẮT ĐẦU TỪ ĐÂY</span>
            <h2 className="section-title">Đề thi mới nhất</h2>
          </div>
          <Link to="/courses" className="neo-text-link">Xem tất cả đề <ArrowRight size={17} /></Link>
        </div>

        {loading ? (
          <div className="neo-loading" role="status">Đang tải danh sách đề thi…</div>
        ) : (
          <div className="neo-test-grid">
            {tests.map((test, index) => {
              const date = test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : null;
              return (
                <article key={test.id} className={`neo-test-card neo-test-card-${index % 3}`}>
                  <div className="neo-test-card-label"><span>TOEIC PRACTICE</span><span>#{String(index + 1).padStart(2, '0')}</span></div>
                  <div className="neo-test-card-body">
                    <h3>{test.titleTest}</h3>
                    <p>Đề TOEIC đã phát hành. Mở chi tiết để xem thông tin và quyền truy cập.</p>
                    <div className="neo-test-meta">
                      {date && <span><Clock3 size={15} /> {date}</span>}
                      <span><Layers size={15} /> Đề đã phát hành</span>
                    </div>
                    <div className="neo-test-actions">
                      <Link to={`/courses/${test.id}`} className="neo-button neo-button-light">Chi tiết</Link>
                      <Link to={`/courses/${test.id}/take`} className="neo-button neo-button-primary"><PlayCircle size={16} /> Làm bài</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="neo-catalog-footer"><BookOpen size={17} /> Các đề được tải từ danh mục đã xuất bản.</div>
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
