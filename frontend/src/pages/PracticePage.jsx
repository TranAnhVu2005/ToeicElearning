import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, Clock, CheckCircle2, PlayCircle, Filter, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { examService } from '../services/examService';

const PracticePage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [testsError, setTestsError] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [testSearch, setTestSearch] = useState('');

  const loadTests = useCallback(async () => {
    try {
      const response = await examService.getTests(1, 100, '', 'createdAt', 'DESC', 'PUBLISHED', 'ALL');
      if (response.code === 1000) {
        const availableTests = response.data?.content || [];
        setTests(availableTests);
        setSelectedTestId((current) => current || availableTests[0]?.id || '');
      } else {
        setTestsError(response.message || 'Không thể tải danh sách đề thi.');
      }
    } catch {
      setTestsError('Không thể kết nối máy chủ để tải đề thi.');
    } finally {
      setLoadingTests(false);
    }
  }, []);

  useEffect(() => { loadTests(); }, [loadTests]);

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
  const matchingTests = useMemo(() => {
    const query = testSearch.trim().toLocaleLowerCase('vi');
    return tests.filter((test) => !query || test.titleTest?.toLocaleLowerCase('vi').includes(query));
  }, [tests, testSearch]);

  return (
    <div className="practice-page neo-practice-page">
      {/* Page Header */}
      <div className="page-header-banner">
        <div className="container">
          <span className="practice-eyebrow">Ngân hàng luyện tập</span>
          <h1 className="page-title">Luyện từng phần. Vững cả bài thi.</h1>
          <p className="page-subtitle practice-page-subtitle">
            Lựa chọn từng phần thi để bắt đầu làm bài luyện tập hoặc trải nghiệm đề thi hoàn chỉnh.
          </p>
        </div>
      </div>

      <div className="container section-padding">
        {/* Select the published test used by direct Part practice */}
        <section className="mb-8 border-2 border-black bg-[#FFE600] p-5 shadow-[5px_5px_0_#111]" aria-labelledby="practice-test-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em]">Bắt đầu luyện tập</p>
              <h2 id="practice-test-heading" className="mt-1 text-2xl font-black">Chọn đề thi để luyện theo Part</h2>
              <p className="mt-1 max-w-2xl text-sm font-semibold">Chọn đề đã xuất bản, sau đó bắt đầu trực tiếp phần bạn muốn luyện. Quyền truy cập đề VIP vẫn được xác thực ở máy chủ.</p>
            </div>
            <Link to="/courses" className="inline-flex min-h-11 items-center border-2 border-black bg-[#fffef5] px-4 font-black shadow-[3px_3px_0_#111]">Xem toàn bộ catalog</Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <label className="block text-sm font-black" htmlFor="practice-test-search">
              <span className="mb-1 flex items-center gap-2"><Search size={16} /> Tìm đề</span>
              <input id="practice-test-search" value={testSearch} onChange={(event) => setTestSearch(event.target.value)} placeholder="Nhập tên đề thi" className="min-h-11 w-full border-2 border-black bg-[#fffef5] px-3 font-semibold outline-none focus-visible:ring-4 focus-visible:ring-[#ff5b93]" />
            </label>
            <label className="block text-sm font-black" htmlFor="practice-test-select">
              <span className="mb-1 block">Đề đang chọn</span>
              <select id="practice-test-select" value={selectedTestId} onChange={(event) => setSelectedTestId(event.target.value)} disabled={loadingTests || matchingTests.length === 0} className="min-h-11 w-full border-2 border-black bg-[#fffef5] px-3 font-semibold outline-none focus-visible:ring-4 focus-visible:ring-[#ff5b93] disabled:opacity-60">
                {matchingTests.length === 0 && <option value="">{loadingTests ? 'Đang tải đề thi…' : 'Không tìm thấy đề phù hợp'}</option>}
                {matchingTests.map((test) => <option key={test.id} value={test.id}>{test.titleTest}{test.isVip ? ' · VIP' : ''}</option>)}
              </select>
            </label>
          </div>
          {testsError && <p role="alert" className="mt-3 flex items-center gap-2 border-2 border-black bg-[#ff5b93] p-3 text-sm font-bold"><AlertCircle size={17} />{testsError}<button type="button" className="ml-auto underline" onClick={() => { setLoadingTests(true); setTestsError(''); loadTests(); }}>Thử lại</button></p>}
          {!loadingTests && !testsError && tests.length === 0 && <p className="mt-3 border-2 border-black bg-[#fffef5] p-3 text-sm font-semibold">Chưa có đề đã xuất bản để luyện. Hãy quay lại sau hoặc xem catalog.</p>}
        </section>

        {/* Banner to Full Test Catalog */}
        <div className="practice-fulltest-callout">
          <div className="practice-fulltest-copy">
            <div className="practice-fulltest-kicker">
              <span className="practice-sticker">Gợi ý luyện tập</span>
              <span className="practice-kicker-text">Đề thi hai kỹ năng</span>
            </div>
            <h3 className="practice-fulltest-title">
              Thử sức với bài thi đủ Listening và Reading
            </h3>
            <p className="practice-fulltest-description">
              Chọn một đề đã xuất bản để làm bài có đồng hồ. Điểm luyện tập được tính theo dữ liệu và cách chấm của từng đề.
            </p>
          </div>
          <Link
            to="/courses"
            className="practice-fulltest-link"
          >
            <BookOpen size={18} /> Xem tất cả đề thi & khóa học
          </Link>
        </div>

        {/* Category Filter Controls */}
        <div className="filter-bar practice-filter-bar">
          <div className="filter-label practice-filter-label">
            <Filter size={18} /> Phân loại kỹ năng:
          </div>
          <div className="filter-buttons">
            <button
              className={`btn btn-sm practice-filter-button ${selectedCategory === 'all' ? 'is-active' : ''}`}
              aria-pressed={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              Tất cả (7 Parts)
            </button>
            <button
              className={`btn btn-sm practice-filter-button ${selectedCategory === 'listening' ? 'is-active' : ''}`}
              aria-pressed={selectedCategory === 'listening'}
              onClick={() => setSelectedCategory('listening')}
            >
              <Headphones size={15} style={{ marginRight: 4 }} /> Listening (Part 1 - 4)
            </button>
            <button
              className={`btn btn-sm practice-filter-button ${selectedCategory === 'reading' ? 'is-active' : ''}`}
              aria-pressed={selectedCategory === 'reading'}
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
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{item.questions} câu hỏi</span>
                </div>
                <div className="practice-meta-item">
                  <Clock size={16} aria-hidden="true" />
                  <span>~{item.duration}</span>
                </div>
              </div>

              <div className="practice-action-box">
                {isAuthenticated ? (
                  selectedTestId ? (
                    <Link to={`/courses/${selectedTestId}?practicePart=${item.id}`} className="practice-card-action practice-card-action-primary">
                      <PlayCircle size={18} /> Luyện {item.part} với đề đã chọn
                    </Link>
                  ) : (
                    <button type="button" disabled className="practice-card-action opacity-60">{loadingTests ? 'Đang tải danh sách đề…' : 'Chưa có đề để luyện'}</button>
                  )
                ) : (
                  <Link to="/login" state={{ from: { pathname: '/practice' } }} className="practice-card-action">
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
