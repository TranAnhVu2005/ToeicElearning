import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Layers, PlayCircle } from 'lucide-react';
import { examService } from '../../services/examService';

const FeaturedCoursesSection = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    examService.getTests(1, 2, '', 'createdAt', 'DESC', 'PUBLISHED')
      .then((res) => {
        if (active && res.code === 1000 && res.data) setTests(res.data.content || []);
        else if (active) setError(true);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (!loading && !error && tests.length === 0) return null;

  return (
    <section className="section-padding neo-catalog news-catalog" aria-labelledby="home-news-title">
      <div className="container">
        <header className="news-header">
          <div className="news-title-lockup">
            <h2 id="home-news-title" className="news-title">NEWS</h2>
          </div>
          <Link to="/courses" className="news-all-link">Xem tất cả đề thi <ArrowRight size={17} aria-hidden="true" /></Link>
        </header>

        {loading ? (
          <div className="news-state" role="status" aria-live="polite">Đang tải danh sách đề thi…</div>
        ) : error ? (
          <div className="news-state" role="alert">
            <span>Chưa tải được bản tin đề thi.</span>
            <Link to="/courses">Mở kho đề <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        ) : (
          <div className="news-card-grid">
            {tests.map((test) => {
              const date = test.createdAt ? new Date(test.createdAt).toLocaleDateString('vi-VN') : null;
              return (
                <article key={test.id} className="news-test-card">
                  <div className="news-test-image">
                    {test.coverImageUrl ? (
                      <img src={test.coverImageUrl} alt={`Ảnh bìa: ${test.titleTest}`} loading="lazy" />
                    ) : (
                      <span>Chưa có ảnh</span>
                    )}
                  </div>
                  <div className="news-test-content">
                    <div className="news-test-meta">
                      <span><Layers size={14} aria-hidden="true" /> Đề TOEIC</span>
                      {date && <span><Clock3 size={14} aria-hidden="true" /> {date}</span>}
                    </div>
                    <h3>{test.titleTest}</h3>
                    <div className="news-test-actions">
                      <Link to={`/courses/${test.id}`} className="news-detail-link">Chi tiết đề</Link>
                      <Link to={`/courses/${test.id}/take`} className="news-start-link">Làm bài <PlayCircle size={16} aria-hidden="true" /></Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCoursesSection;
