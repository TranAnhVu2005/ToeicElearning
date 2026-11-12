import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Layers } from 'lucide-react';
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
                  <Link
                    to={`/courses/${test.id}`}
                    className="news-test-image"
                    title={`Xem chi tiết đề: ${test.titleTest}`}
                    style={{ textDecoration: 'none' }}
                  >
                    {test.coverImageUrl ? (
                      <img src={test.coverImageUrl} alt={`Ảnh bìa: ${test.titleTest}`} loading="lazy" />
                    ) : (
                      <span>Chưa có ảnh</span>
                    )}
                  </Link>
                  <div className="news-test-content">
                    <div className="news-test-meta">
                      <span><Layers size={14} aria-hidden="true" /> Đề TOEIC</span>
                      {date && <span><Clock3 size={14} aria-hidden="true" /> {date}</span>}
                    </div>
                    <h3>
                      <Link
                        to={`/courses/${test.id}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        className="hover:text-[#1D4ED8] transition-colors"
                      >
                        {test.titleTest}
                      </Link>
                    </h3>
                    <div className="news-test-actions">
                      <span className="text-xs text-slate-500 font-medium">Luyện Part hoặc Full Test</span>
                      <Link to={`/courses/${test.id}`} className="news-start-link">
                        Chi tiết đề <ArrowRight size={15} aria-hidden="true" />
                      </Link>
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
