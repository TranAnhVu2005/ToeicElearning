import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  Headphones,
  FileText,
  ArrowLeft,
  AlertCircle,
  Edit2,
  Trash2,
  Lightbulb,
  Send,
  User,
  ChevronRight,
  Award,
  BarChart3,
  Info,
  Compass,
  LockKeyhole,
} from 'lucide-react';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { vipPurchaseService } from '../services/vipPurchaseService';

// Dữ liệu chủ điểm tham khảo cho 7 Part TOEIC.
const PART_METADATA = [
  {
    partNumber: 1,
    name: 'Part 1',
    questionCount: 6,
    skill: 'Listening',
    title: 'Part 1 (6 câu hỏi)',
    tags: [
      '#[Part 1] Tranh tả người',
      '#[Part 1] Tranh tả vật',
      '#[Part 1] Tranh tả cả người và vật',
    ],
  },
  {
    partNumber: 2,
    name: 'Part 2',
    questionCount: 25,
    skill: 'Listening',
    title: 'Part 2 (25 câu hỏi)',
    tags: [
      '#[Part 2] Câu hỏi WHAT',
      '#[Part 2] Câu hỏi WHO',
      '#[Part 2] Câu hỏi WHEN',
      '#[Part 2] Câu hỏi HOW',
      '#[Part 2] Câu hỏi YES/NO',
      '#[Part 2] Câu hỏi đuôi',
      '#[Part 2] Câu hỏi lựa chọn',
      '#[Part 2] Câu yêu cầu, đề nghị',
    ],
  },
  {
    partNumber: 3,
    name: 'Part 3',
    questionCount: 39,
    skill: 'Listening',
    title: 'Part 3 (39 câu hỏi)',
    tags: [
      '#[Part 3] Câu hỏi về chủ đề, mục đích',
      '#[Part 3] Câu hỏi về danh tính người nói',
      '#[Part 3] Câu hỏi về chi tiết cuộc hội thoại',
      '#[Part 3] Câu hỏi về hành động tương lai',
      '#[Part 3] Câu hỏi kết hợp bảng biểu',
      '#[Part 3] Câu hỏi về hàm ý câu nói',
      '#[Part 3] Chủ đề: Company - Event, Project',
      '#[Part 3] Chủ đề: Company - Facility',
      '#[Part 3] Chủ đề: Shopping, Service',
      '#[Part 3] Chủ đề: Order, delivery',
      '#[Part 3] Chủ đề: Transportation',
      '#[Part 3] Chủ đề: Housing',
      '#[Part 3] Câu hỏi về địa điểm hội thoại',
      '#[Part 3] Câu hỏi về yêu cầu, gợi ý',
    ],
  },
  {
    partNumber: 4,
    name: 'Part 4',
    questionCount: 30,
    skill: 'Listening',
    title: 'Part 4 (30 câu hỏi)',
    tags: [
      '#[Part 4] Câu hỏi về chủ đề, mục đích',
      '#[Part 4] Câu hỏi về danh tính, địa điểm',
      '#[Part 4] Câu hỏi về chi tiết',
      '#[Part 4] Câu hỏi về hành động tương lai',
      '#[Part 4] Câu hỏi kết hợp bảng biểu',
      '#[Part 4] Câu hỏi về hàm ý câu nói',
      '#[Part 4] Dạng bài: Telephone message - Tin nhắn thoại',
      '#[Part 4] Dạng bài: Advertisement - Quảng cáo',
      '#[Part 4] Dạng bài: Announcement - Thông báo',
      '#[Part 4] Dạng bài: Talk - Bài phát biểu, diễn văn',
      '#[Part 4] Dạng bài: Excerpt from a meeting - Trích dẫn từ buổi họp',
      '#[Part 4] Câu hỏi yêu cầu, gợi ý',
    ],
  },
  {
    partNumber: 5,
    name: 'Part 5',
    questionCount: 30,
    skill: 'Reading',
    title: 'Part 5 (30 câu hỏi)',
    tags: [
      '#[Part 5] Câu hỏi từ loại',
      '#[Part 5] Câu hỏi ngữ pháp',
      '#[Part 5] Câu hỏi từ vựng',
      '#[Grammar] Danh từ',
      '#[Grammar] Đại từ',
      '#[Grammar] Tính từ',
      '#[Grammar] Thì',
      '#[Grammar] Thể',
      '#[Grammar] Trạng từ',
      '#[Grammar] Động từ nguyên mẫu có to',
      '#[Grammar] Động từ nguyên mẫu',
      '#[Grammar] Phân từ và Cấu trúc phân từ',
      '#[Grammar] Giới từ',
      '#[Grammar] Liên từ',
      '#[Grammar] Mệnh đề quan hệ',
    ],
  },
  {
    partNumber: 6,
    name: 'Part 6',
    questionCount: 16,
    skill: 'Reading',
    title: 'Part 6 (16 câu hỏi)',
    tags: [
      '#[Part 6] Câu hỏi từ loại',
      '#[Part 6] Câu hỏi ngữ pháp',
      '#[Part 6] Câu hỏi từ vựng',
      '#[Part 6] Câu hỏi điền câu vào đoạn văn',
      '#[Part 6] Hình thức: Bài báo (Article/ Review)',
      '#[Part 6] Hình thức: Quảng cáo (Advertisement)',
      '#[Part 6] Hình thức: Thông báo/ văn bản hướng dẫn (Notice/ Announcement Information)',
      '#[Grammar] Danh từ',
      '#[Grammar] Đại từ',
      '#[Grammar] Tính từ',
      '#[Grammar] Thì',
      '#[Grammar] Thể',
      '#[Grammar] Trạng từ',
    ],
  },
  {
    partNumber: 7,
    name: 'Part 7',
    questionCount: 54,
    skill: 'Reading',
    title: 'Part 7 (54 câu hỏi)',
    tags: [
      '#[Part 7] Câu hỏi tìm thông tin',
      '#[Part 7] Câu hỏi tìm chi tiết sai',
      '#[Part 7] Câu hỏi về chủ đề, mục đích',
      '#[Part 7] Câu hỏi suy luận',
      '#[Part 7] Câu hỏi điền câu',
      '#[Part 7] Cấu trúc: một đoạn',
      '#[Part 7] Cấu trúc: nhiều đoạn',
      '#[Part 7] Dạng bài: Email/ Letter: Thư điện tử/ Thư tay',
      '#[Part 7] Dạng bài: Form - Đơn từ, biểu mẫu',
      '#[Part 7] Dạng bài: Article/ Review: Bài báo/ Bài đánh giá',
      '#[Part 7] Dạng bài: Advertisement - Quảng cáo',
      '#[Part 7] Dạng bài: Announcement/ Notice: Thông báo',
      '#[Part 7] Dạng bài: Text message chain - Chuỗi tin nhắn',
      '#[Part 7] Câu hỏi tìm từ đồng nghĩa',
      '#[Part 7] Câu hỏi về hàm ý câu nói',
      '#[Part 7] Dạng bài: Schedule - Lịch trình, thời gian biểu',
      '#[Part 7] Dạng bài: Instructions: Văn bản hướng dẫn',
    ],
  },
];

const getContextPartNumber = (context) => {
  const partLabel = context?.part?.namePart || context?.partName || '';
  const explicitPart = Number(context?.partNumber || partLabel.match(/part\s*(\d+)/i)?.[1]);
  if (explicitPart >= 1 && explicitPart <= 7) return explicitPart;
  const questionNumbers = (context?.questions || []).map((question) => Number(question?.questionNumber)).filter(Number.isFinite);
  const firstQuestion = Number(context?.orderIndex) || (questionNumbers.length ? Math.min(...questionNumbers) : 0);
  if (firstQuestion >= 1 && firstQuestion <= 6) return 1;
  if (firstQuestion >= 7 && firstQuestion <= 31) return 2;
  if (firstQuestion >= 32 && firstQuestion <= 70) return 3;
  if (firstQuestion >= 71 && firstQuestion <= 100) return 4;
  if (firstQuestion >= 101 && firstQuestion <= 130) return 5;
  if (firstQuestion >= 131 && firstQuestion <= 146) return 6;
  if (firstQuestion >= 147 && firstQuestion <= 200) return 7;
  return null;
};

const CourseDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedPracticePart = Number(searchParams.get('practicePart'));
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vipLocked, setVipLocked] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // View state: 'info' (thông tin đề thi) | 'transcript' (đáp án/transcript)
  const [subView, setSubView] = useState('info');

  // Main Tabs: 'practice' (Luyện tập) | 'fulltest' (Làm full test) | 'discussion' (Thảo luận)
  const [activeTab, setActiveTab] = useState('practice');

  // Selected parts are filtered against the content available in this test.
  const [selectedParts, setSelectedParts] = useState(() => (
    Number.isInteger(requestedPracticePart) && requestedPracticePart >= 1 && requestedPracticePart <= 7
      ? [requestedPracticePart]
      : [1, 2, 3, 4, 5, 6, 7]
  ));

  // Selected Time Limit for Practice in minutes (0 = không giới hạn)
  const [timeLimit, setTimeLimit] = useState('');

  // Interface view: 'default'
  const [interfaceType, setInterfaceType] = useState('default');

  // Admin delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Transcript / Answer Key Modal
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  // User Attempts History
  const [historyRetry, setHistoryRetry] = useState(0);
  const [historyState, setHistoryState] = useState({ key: '', items: [], error: '' });
  const historyRequestKey = `${testId}/${isAuthenticated}/${historyRetry}`;
  const historyLoading = isAuthenticated && historyState.key !== historyRequestKey;
  const testHistory = historyState.key === historyRequestKey ? historyState.items : [];
  const historyError = historyState.key === historyRequestKey ? historyState.error : '';

  // Comments stay local to this mounted test detail page.
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const testContexts = Array.isArray(test?.contextQuestions) ? test.contextQuestions : [];
  const testQuestionCount = testContexts.reduce((total, context) => total + (Array.isArray(context?.questions) ? context.questions.length : 0), 0);
  const partQuestionCounts = testContexts.reduce((counts, context) => {
    const partNumber = getContextPartNumber(context);
    if (partNumber) counts[partNumber] = (counts[partNumber] || 0) + (Array.isArray(context?.questions) ? context.questions.length : 0);
    return counts;
  }, {});
  const availableParts = PART_METADATA.filter((part) => partQuestionCounts[part.partNumber] > 0);
  const selectedAvailableParts = selectedParts.filter((partNumber) => partQuestionCounts[partNumber] > 0);
  const questionNumbers = testContexts.flatMap((context) => (context?.questions || []).map((question) => Number(question?.questionNumber)));
  const hasCompleteQuestionSequence = questionNumbers.length === 200
    && new Set(questionNumbers).size === 200
    && questionNumbers.every((number) => Number.isInteger(number) && number >= 1 && number <= 200);
  const isFullLengthTest = testQuestionCount === 200 && availableParts.length === 7 && hasCompleteQuestionSequence;

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Test Data
  useEffect(() => {
    let cancelled = false;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setTest(null);
      setVipLocked(false);
      try {
        const accessRes = await examService.getTestAccess(testId);
        if (cancelled) return;
        if (accessRes.code !== 1000 || !accessRes.data) throw new Error('Không tìm thấy đề thi.');
        if (accessRes.data.vip && !accessRes.data.hasAccess) {
          setTest({ id: accessRes.data.testId, titleTest: accessRes.data.title,
            status: accessRes.data.status, isVip: true, vipPriceVnd: accessRes.data.priceVnd });
          setVipLocked(true);
          return;
        }
        setVipLocked(false);
        const res = await examService.getTestDetail(testId);
        if (cancelled) return;
        if (res.code === 1000 && res.data) {
          setTest(res.data);
        } else {
          setError(res.message || 'Không tìm thấy thông tin đề thi');
        }
      } catch {
        if (cancelled) return;
        setError('Lỗi kết nối máy chủ khi tải chi tiết bài thi.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (testId) {
      fetchDetail();
    }
    return () => { cancelled = true; };
  }, [testId]);

  const handleBuyVipTest = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${testId}` } } });
      return;
    }
    try {
      setPurchaseLoading(true);
      const response = await vipPurchaseService.checkout(testId);
      if (response.code !== 1000 || !response.data?.checkoutUrl) {
        throw new Error(response.message || 'Không thể tạo giao dịch thanh toán.');
      }
      window.location.assign(response.data.checkoutUrl);
    } catch (checkoutError) {
      setToast({ type: 'error', message: checkoutError.response?.data?.message || checkoutError.message || 'Không thể bắt đầu thanh toán.' });
      setPurchaseLoading(false);
    }
  };

  // Load persisted attempts for this account; local demo data is not an exam history.
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) return () => { cancelled = true; };
    const loadHistory = async () => {
      try {
        const response = await examService.getTestHistory(testId);
        if (cancelled) return;
        if (response.code !== 1000 || !Array.isArray(response.data)) {
          throw new Error(response.message || 'Không tải được lịch sử bài làm.');
        }
        setHistoryState({ key: historyRequestKey, items: response.data, error: '' });
      } catch (error) {
        if (!cancelled) setHistoryState({
          key: historyRequestKey,
          items: [],
          error: error.response?.data?.message || error.message || 'Không tải được lịch sử bài làm.',
        });
      }
    };
    loadHistory();
    return () => { cancelled = true; };
  }, [testId, isAuthenticated, historyRequestKey]);

  // Toggle Part Selection
  const handleTogglePart = (partNum) => {
    setSelectedParts((prev) => {
      if (prev.includes(partNum)) {
        return prev.filter((p) => p !== partNum);
      } else {
        return [...prev, partNum].sort((a, b) => a - b);
      }
    });
  };

  const handleSelectAllParts = () => {
    setSelectedParts(availableParts.map((part) => part.partNumber));
  };

  const handleDeselectAllParts = () => {
    setSelectedParts([]);
  };

  // Start Practice
  const handleStartPractice = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${testId}` } } });
      return;
    }
    if (selectedAvailableParts.length === 0) {
      setToast({ type: 'error', message: 'Vui lòng chọn ít nhất 1 phần thi để luyện tập!' });
      return;
    }
    const partsParam = selectedAvailableParts.join(',');
    const timeParam = timeLimit ? parseInt(timeLimit, 10) : 0;
    navigate(`/courses/${testId}/take?mode=practice&parts=${partsParam}&time=${timeParam}`);
  };

  // Start Full Test
  const handleStartFullTest = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${testId}` } } });
      return;
    }
    if (!isFullLengthTest) {
      setToast({ type: 'error', message: 'Đề này chưa có đủ 200 câu liên tục để làm full test.' });
      return;
    }
    navigate(`/courses/${testId}/take?mode=fulltest&time=120`);
  };

  // Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item = {
      id: 'c_' + Date.now(),
      author: user?.userName || user?.userEmail || 'Học viên',
      isOfficial: false,
      date: 'Vừa xong',
      content: newComment.trim(),
      pinned: false,
    };
    setComments((current) => [item, ...current]);
    setNewComment('');
  };

  const handleDeleteTest = async () => {
    try {
      setActionLoading(true);
      const res = await examService.deleteTest(testId);
      if (res.code === 1000) {
        if (res.data === 'ARCHIVED') {
          setTest((previous) => ({ ...previous, status: 'DRAFT' }));
          setToast({ type: 'success', message: 'Đề đã có lịch sử làm bài, hệ thống chuyển về bản nháp để giữ kết quả cũ.' });
        } else {
          navigate('/courses', { state: { message: `Đã xóa đề thi "${test?.titleTest}" thành công!` } });
        }
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xóa đề thi.' });
      }
    } catch (err) {
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
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xuất bản đề thi.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[75vh] items-center justify-center bg-[#fffdf2] px-4 text-[#111]">
        <div role="status" className="border-2 border-black bg-white p-8 text-center shadow-[5px_5px_0_#111]">
          <div aria-hidden="true" className="mx-auto mb-4 h-11 w-11 animate-spin border-4 border-black border-t-[#FFE600]" />
          <p className="font-bold">Đang tải dữ liệu đề thi TOEIC...</p>
        </div>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#fffdf2] px-4 py-16 text-center text-[#111]">
        <section role="alert" className="max-w-2xl border-2 border-black bg-white p-7 shadow-[5px_5px_0_#111] sm:p-10">
        <AlertCircle size={42} aria-hidden="true" className="mx-auto mb-4 text-[#B42318]" />
        <h2 className="mb-2 text-xl font-black">Không tìm thấy đề thi</h2>
        <p className="mb-6 font-medium">{error || 'Đề thi không tồn tại hoặc đã bị gỡ bỏ.'}</p>
        <Link to="/courses" className="inline-flex min-h-11 items-center gap-2 border-2 border-black bg-[#FFE600] px-4 py-2 font-black shadow-[3px_3px_0_#111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FF5B93]">
          <ArrowLeft size={16} /> Quay lại danh sách đề thi
        </Link>
        </section>
      </main>
    );
  }

  if (vipLocked) {
    return (
      <main className="min-h-[75vh] bg-[#fffdf2] px-4 py-14 text-[#111] sm:px-6">
        <section className="mx-auto max-w-3xl border-2 border-black bg-white p-7 shadow-[6px_6px_0_#111] sm:p-10">
          <span className="inline-flex items-center gap-2 border-2 border-black bg-[#FF5B93] px-3 py-1 text-xs font-black uppercase"><LockKeyhole size={15} /> Đề VIP</span>
          <h1 className="mt-5 text-3xl font-black sm:text-4xl">{test.titleTest}</h1>
          <p className="mt-3 max-w-2xl font-semibold">Mua một lần, mở quyền truy cập đề này vĩnh viễn. Nội dung bài thi chỉ được tải sau khi máy chủ xác nhận thanh toán.</p>
          <p className="mt-6 inline-block border-2 border-black bg-[#FFE600] px-4 py-3 text-2xl font-black">{Number(test.vipPriceVnd || 0).toLocaleString('vi-VN')} ₫</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={handleBuyVipTest} disabled={purchaseLoading} className="border-2 border-black bg-[#FFE600] px-5 py-3 font-black shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-0.5 disabled:opacity-60">{purchaseLoading ? 'Đang tạo giao dịch…' : 'Mua đề qua VNPAY'}</button>
            <Link to="/courses" className="border-2 border-black bg-white px-5 py-3 font-black">Quay lại danh sách đề</Link>
          </div>
          {toast && <p role="alert" className="mt-5 border-2 border-black bg-rose-200 p-3 font-bold">{toast.message}</p>}
        </section>
      </main>
    );
  }

  return (
    <div className="course-detail-page min-h-[100dvh] pb-20 text-slate-800">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* TOP HEADER SECTION */}
      <div className="course-detail-header pt-7 pb-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="course-detail-breadcrumbs flex items-center gap-2 text-xs font-semibold mb-3.5">
            <Link to="/">
              Trang chủ
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/courses">
              Đề thi online
            </Link>
            <span aria-hidden="true">/</span>
            <span className="course-detail-current truncate max-w-xs" aria-current="page">{test.titleTest}</span>
          </div>

          {/* Tag, Title, Verified Check */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="course-detail-label">
              BỘ ĐỀ TOEIC
            </span>
            {test.status === 'DRAFT' && (
              <span className="course-detail-draft inline-flex items-center gap-1">
                <Clock size={11} strokeWidth={1.5} /> DRAFT
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="course-detail-title text-2xl sm:text-3xl" style={{ textWrap: 'balance' }}>
                {test.titleTest}
              </h1>
            </div>

            {/* Quick Admin / Teacher Actions */}
            <div className="flex items-center gap-2">
              {test.status === 'DRAFT' && isAdmin && (
                <button
                  type="button"
                  onClick={handlePublishTestNow}
                  disabled={actionLoading}
                  className="course-detail-action course-detail-publish px-3.5 py-1.5 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Xuất bản ngay
                </button>
              )}
              {isAdmin && (
                <Link
                  to={`/admin/tests?editId=${test.id}`}
                  className="course-detail-action course-detail-edit px-3.5 py-1.5 font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Edit2 size={13} strokeWidth={1.5} /> Chỉnh sửa đề thi
                </Link>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="course-detail-action course-detail-delete px-3.5 py-1.5 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} strokeWidth={1.5} /> Xóa đề
                </button>
              )}
            </div>
          </div>

          {/* Sub-buttons: Thông tin đề thi | Đáp án/transcript */}
          <div className="course-detail-subnav flex items-center gap-2.5 mb-4">
            <button
              type="button"
              onClick={() => setSubView('info')}
              className={`course-detail-subtab px-4 py-1.5 text-xs font-bold cursor-pointer ${subView === 'info' ? 'is-selected' : ''}`}
            >
              Thông tin đề thi
            </button>
            <button
              type="button"
              onClick={() => setTranscriptModalOpen(true)}
              className="course-detail-subtab inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileText size={13} strokeWidth={1.5} /> Đáp án/transcript
            </button>
          </div>

          {/* Meta text line */}
          <div className="course-detail-metadata text-xs flex items-center gap-4 flex-wrap mb-3 tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock size={14} strokeWidth={1.5} /> Thời lượng: <strong className="tabular-nums">{isFullLengthTest ? '120 phút · full test' : 'Linh hoạt theo chế độ luyện'}</strong>
            </span>
            <span aria-hidden="true">|</span>
            <span className="tabular-nums">{availableParts.length} phần có câu hỏi</span>
            <span aria-hidden="true">|</span>
            <span className="tabular-nums">{testQuestionCount} câu hỏi</span>
            <span aria-hidden="true">|</span>
            <span className="tabular-nums">{comments.length} bình luận</span>
          </div>
          <p className="course-detail-score-note pl-3 text-xs font-semibold leading-relaxed">
            Điểm quy đổi hiển thị hiện là ước tính; kết quả có thể khác bảng scaled score chính thức của từng đề TOEIC.
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT MAIN COLUMN: TABS & CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TABS NAVIGATION: Luyện tập | Làm full test | Chép chính tả | Thảo luận */}
            <div className="course-detail-tabs flex px-4 overflow-x-auto" aria-label="Hoạt động với đề thi">
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                aria-pressed={activeTab === 'practice'}
                className={`course-detail-tab py-3.5 px-5 text-sm font-bold cursor-pointer whitespace-nowrap ${activeTab === 'practice' ? 'is-active' : ''}`}
              >
                Luyện tập
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fulltest')}
                aria-pressed={activeTab === 'fulltest'}
                className={`course-detail-tab py-3.5 px-5 text-sm font-bold cursor-pointer whitespace-nowrap ${activeTab === 'fulltest' ? 'is-active' : ''}`}
              >
                Làm full test
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dictation')}
                aria-pressed={activeTab === 'dictation'}
                className={`course-detail-tab py-3.5 px-5 text-sm font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'dictation' ? 'is-active' : ''}`}
              >
                <Headphones size={15} strokeWidth={1.5} />
                <span>Chép chính tả</span>
                <span className="course-detail-new-tag px-1.5 py-0.2 text-[10px] font-black uppercase tracking-wider">
                  Mới
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discussion')}
                aria-pressed={activeTab === 'discussion'}
                className={`course-detail-tab py-3.5 px-5 text-sm font-bold cursor-pointer whitespace-nowrap ${activeTab === 'discussion' ? 'is-active' : ''}`}
              >
                Thảo luận ({comments.length})
              </button>
            </div>

            {/* TAB CONTENT: LUYỆN TẬP (Ảnh 2, 3, 4) */}
            {activeTab === 'practice' && (
              <div className="course-detail-panel p-6 space-y-6">
                {/* Pro Tips Banner */}
                <div className="course-detail-tip p-4 flex items-start gap-3">
                  <Lightbulb size={20} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    <strong>Pro tips:</strong> Hình thức luyện tập từng phần và chọn mức thời gian phù hợp sẽ giúp bạn tập trung vào giải đúng các câu hỏi thay vì phải chịu áp lực hoàn thành bài thi.
                  </p>
                </div>

                {/* Chọn phần thi */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      Chọn phần thi bạn muốn làm
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={handleSelectAllParts}
                        className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                      >
                        Chọn tất cả
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllParts}
                        className="text-slate-500 hover:text-slate-700 font-medium hover:underline"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>

                  {/* 7 Parts List with Checkboxes and Tag Chips (Double-Bezel Architecture) */}
                  <div className="space-y-3">
                    {availableParts.map((pm) => {
                      const isChecked = selectedParts.includes(pm.partNumber);
                      return (
                        <div key={pm.partNumber} className={`course-part-option p-1.5 select-none ${isChecked ? 'is-selected' : ''}`}>
                          <div className={`course-part-option-inner p-4 ${isChecked ? 'is-selected' : ''}`}>
                            <div className="flex items-start gap-3.5">
                              <input id={`practice-part-${pm.partNumber}`} type="checkbox" checked={isChecked} onChange={() => handleTogglePart(pm.partNumber)} className="course-part-checkbox mt-1 w-4 h-4 cursor-pointer" />
                              <label htmlFor={`practice-part-${pm.partNumber}`} className="flex-1 space-y-2 cursor-pointer">
                                <div className="flex items-center justify-between gap-2">
                                   <span className="text-sm font-bold text-slate-900 tracking-tight">Part {pm.partNumber} ({partQuestionCounts[pm.partNumber]} câu)</span>
                                  <span className="course-detail-skill-tag text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5">{pm.skill}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {pm.tags.map((tag) => <span key={tag} className="course-detail-topic-tag text-[11px] font-medium px-2 py-0.5">{tag}</span>)}
                                </div>
                              </label>
                              {pm.skill === 'Listening' && <Link to={`/courses/${testId}/dictation?part=${pm.partNumber}`} className="course-detail-dictation-link shrink-0 px-2.5 py-1 font-bold text-[10px] inline-flex items-center gap-1" title={`Luyện nghe chép chính tả ${pm.name}`}><Headphones size={11} strokeWidth={1.5} /> Chép chính tả</Link>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Giới hạn thời gian (Dropdown) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Giới hạn thời gian (Để trống để làm bài không giới hạn)
                  </label>
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                    className="course-detail-select w-full max-w-sm px-3.5 py-2.5 text-sm cursor-pointer tabular-nums"
                  >
                    <option value="">-- Chọn thời gian (Không giới hạn) --</option>
                    <option value="5">5 phút</option>
                    <option value="10">10 phút</option>
                    <option value="15">15 phút</option>
                    <option value="20">20 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút (1 tiếng)</option>
                    <option value="75">75 phút</option>
                    <option value="90">90 phút</option>
                    <option value="120">120 phút (Chuẩn 2 tiếng)</option>
                  </select>
                </div>

                {/* Giao diện */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Giao diện</label>
                  <select
                    value={interfaceType}
                    onChange={(e) => setInterfaceType(e.target.value)}
                    className="course-detail-select w-full max-w-sm px-3.5 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="default">Mặc định</option>
                  </select>
                </div>

                {/* Action Button: LUYỆN TẬP (Button-in-Button Island CTA) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartPractice}
                    className="course-detail-cta group px-7 py-3.5 font-extrabold text-sm tracking-wide inline-flex items-center gap-3 cursor-pointer"
                  >
                    <span>LUYỆN TẬP ({selectedAvailableParts.length} phần đã chọn)</span>
                    <span className="course-detail-cta-icon">
                      <PlayCircle size={18} strokeWidth={1.5} />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LÀM FULL TEST (Ảnh 5) */}
            {activeTab === 'fulltest' && (
              <div className="course-detail-panel p-6 space-y-6">
                {/* Yellow Warning Notice Box */}
                <div className="course-detail-tip p-4 flex items-start gap-3">
                  <Info size={20} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed font-medium">
                    {isFullLengthTest ? <>Sẵn sàng để bắt đầu full test. Bạn cần dành ra <strong className="tabular-nums">120 phút</strong> cho bài thi 200 câu.</> : <>Đề hiện có {testQuestionCount}/200 câu hoặc số câu chưa liên tục; chỉ bật full test khi đề có đủ 200 câu theo thứ tự.</>}
                  </p>
                </div>

                {/* Giao diện */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Giao diện</label>
                  <select
                    value={interfaceType}
                    onChange={(e) => setInterfaceType(e.target.value)}
                    className="course-detail-select w-full max-w-sm px-3.5 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="default">Mặc định</option>
                  </select>
                </div>

                {/* Action Button: BẮT ĐẦU THI FULL TEST (Button-in-Button Island CTA) */}
                <div>
                  <button
                    type="button"
                    onClick={handleStartFullTest}
                    disabled={!isFullLengthTest}
                    className="course-detail-cta group px-8 py-3.5 font-extrabold text-sm tracking-wide inline-flex items-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    <span>BẮT ĐẦU THI FULL TEST (120 PHÚT)</span>
                    <span className="course-detail-cta-icon">
                      <PlayCircle size={18} strokeWidth={1.5} />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CHÉP CHÍNH TẢ (DICTATION) */}
            {activeTab === 'dictation' && (
              <div className="course-detail-panel p-6 space-y-6">
                {/* Intro Banner */}
                <div className="course-detail-tip p-4 flex items-start gap-3.5">
                  <Headphones size={22} strokeWidth={1.5} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-[#111] uppercase tracking-wide">
                      Phương pháp nghe chép chính tả (TOEIC Dictation Method)
                    </h4>
                    <p className="text-xs font-medium text-[#222] leading-relaxed">
                      Luyện tập nghe từng câu, gõ lại những gì bạn nghe được để rèn luyện khả năng bắt âm, nối âm, từ vựng và cấu trúc ngữ pháp. Hệ thống đối chiếu kết quả từng từ theo thời gian thực (Smart Diff Checker) giúp bạn phát hiện ngay các lỗi sai.
                    </p>
                  </div>
                </div>

                {/* 4 Listening Parts Selection Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-[#111] tracking-tight uppercase">
                    Chọn phần nghe muốn chép chính tả:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      {
                        part: 1,
                        name: 'Part 1: Mô tả hình ảnh',
                        desc: '6 câu mô tả tranh đơn lẻ • Luyện nghe chi tiết hành động và đồ vật',
                        count: '6 câu',
                      },
                      {
                        part: 2,
                        name: 'Part 2: Hỏi & Đáp',
                        desc: '25 câu hỏi phản xạ nhanh • Rèn luyện nhận diện từ để hỏi và bẫy gián tiếp',
                        count: '25 câu',
                      },
                      {
                        part: 3,
                        name: 'Part 3: Hội thoại',
                        desc: '39 câu / 13 đoạn hội thoại • Nâng cao khả năng nghe hiểu ngữ cảnh công sở',
                        count: '39 câu',
                      },
                      {
                        part: 4,
                        name: 'Part 4: Bài nói ngắn',
                        desc: '30 câu / 10 bài độc thoại • Làm quen với thông báo, quảng cáo, tin nhắn thoại',
                        count: '30 câu',
                      },
                    ].map((item) => (
                      <div
                        key={item.part}
                        className="course-dictation-option p-4 flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-[#111] tracking-tight">
                              {item.name}
                            </span>
                            <span className="border-2 border-black bg-[#FFE600] px-2 py-0.5 text-[10px] font-black">
                              {item.count}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-[#333] leading-relaxed">{item.desc}</p>
                        </div>

                        <div className="flex items-center justify-between border-t-2 border-black pt-2">
                          <span className="text-[11px] font-semibold text-[#444]">Audio đề</span>
                          <Link
                            to={`/courses/${testId}/dictation?part=${item.part}`}
                            className="inline-flex min-h-10 items-center gap-1.5 border-2 border-black bg-white px-3 py-1.5 text-xs font-black shadow-[2px_2px_0_#111] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#FF5B93] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FFE600]"
                          >
                            Bắt đầu chép <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master Action CTA (Double-Bezel Button-in-Button) */}
                <div className="pt-2">
                  <Link
                    to={`/courses/${testId}/dictation?part=all`}
                    className="course-detail-cta group px-8 py-3.5 font-extrabold text-sm tracking-wide inline-flex items-center gap-3 cursor-pointer"
                  >
                    <span>CHÉP CHÍNH TẢ TOÀN BỘ PHẦN NGHE (PART 1 - 4)</span>
                    <span className="course-detail-cta-icon">
                      <Headphones size={18} strokeWidth={1.5} />
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT: THẢO LUẬN */}
            {activeTab === 'discussion' && (
              <div className="course-detail-panel p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Thảo luận về đề thi này ({comments.length})
                  </h3>
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <p className="border-2 border-black bg-amber-100 p-3 text-xs font-semibold">Thảo luận hiện chỉ lưu trong phiên trình duyệt này, chưa đồng bộ lên máy chủ.</p>
                  <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Chia sẻ cảm nghĩ hoặc câu hỏi của bạn về đề thi..."
                    className="course-detail-textarea w-full p-3 text-sm"
                    />
                    <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                      className="course-detail-action course-detail-submit px-5 py-2 font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Send size={13} /> Gửi bình luận
                      </button>
                    </div>
                  </form>

                  {/* List of comments */}
                  <div className="divide-y divide-slate-100 pt-2">
                    {comments.length === 0 ? <p className="py-5 text-center text-sm font-semibold text-slate-600">Chưa có bình luận trong phiên này.</p> : comments.map((c) => (
                      <div key={c.id} className="py-4 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {c.author.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800">{c.author}</span>
                          {c.isOfficial && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold">
                              Admin
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">{c.date}</span>
                        </div>
                        <p className="text-xs text-slate-700 pl-8 leading-relaxed">{c.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BẢNG: KẾT QUẢ LÀM BÀI CỦA BẠN (Ảnh 1 - Double-Bezel Architecture) */}
              <div className="course-history-card">
              <div className="course-history-content space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Kết quả làm bài của bạn:
                </h3>

                {!isAuthenticated ? (
                  <div className="text-center py-8 text-slate-500 text-xs">Đăng nhập để xem lịch sử làm bài của bạn.</div>
                ) : historyLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500">Đang tải lịch sử bài làm...</div>
                ) : historyError ? (
                  <div role="alert" className="flex flex-wrap items-center justify-center gap-3 border-2 border-black bg-rose-100 p-4 text-sm font-bold">
                    <span>{historyError}</span>
                    <button type="button" onClick={() => setHistoryRetry((retry) => retry + 1)} className="min-h-10 border-2 border-black bg-[#FFE600] px-3 font-black shadow-[2px_2px_0_#111]">Thử tải lại</button>
                  </div>
                ) : testHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Bạn chưa làm đề thi này lần nào. Hãy chọn "Luyện tập" hoặc "Làm full test" ở trên để bắt đầu!
                  </div>
                ) : (
                  <div className="course-history-table overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50/90 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200 tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Ngày làm</th>
                          <th className="py-3 px-4">Kết quả</th>
                          <th className="py-3 px-4">Thời gian làm bài</th>
                          <th className="py-3 px-4 text-right">Chi tiết</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 tabular-nums">
                        {testHistory.map((h, idx) => (
                          <tr key={h.id || idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-700">
                              <div className="font-semibold tabular-nums text-slate-900">{h.createdAt ? new Date(h.createdAt).toLocaleString('vi-VN') : '—'}</div>
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                                  {h.typePractice || 'Luyện tập'}
                                </span>
                                {h.partName && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200/80">
                                    {h.partName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-extrabold text-slate-900 text-sm tabular-nums">
                              {h.totalScore} <span className="text-xs font-semibold text-slate-500">{h.scoreType === 'ESTIMATED_SCALED' ? '/ 990 (ước tính)' : `/${h.totalCount} câu`}</span>
                              <div className="text-[11px] font-medium text-slate-500">{h.correctCount}/{h.totalCount} câu đúng</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">{h.timeSpentFormatted}</td>
                            <td className="py-3 px-4 text-right">
                              <button type="button" onClick={() => navigate(`/results/${h.id}`)} className="course-detail-history-link inline-flex items-center gap-1 font-bold cursor-pointer group">
                                <span>Xem chi tiết</span>
                                <ChevronRight size={13} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* BÌNH LUẬN SECTION (Khi ở tab khác vẫn có thể thấy bình luận) */}
            {activeTab !== 'discussion' && (
              <div className="course-detail-panel p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Bình luận
                </h3>
                <form onSubmit={handleAddComment} className="space-y-3">
                  <p className="border-2 border-black bg-amber-100 p-3 text-xs font-semibold">Thảo luận hiện chỉ lưu trong phiên trình duyệt này, chưa đồng bộ lên máy chủ.</p>
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nghĩ hoặc thắc mắc của bạn..."
                    className="course-detail-textarea w-full p-3 text-sm"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="course-detail-action course-detail-submit px-4 py-2 font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={13} strokeWidth={1.5} /> Gửi bình luận
                    </button>
                  </div>
                </form>

                {/* List of comments */}
                <div className="divide-y divide-slate-100 pt-2">
                  {comments.length === 0 ? <p className="py-4 text-sm text-slate-600">Chưa có bình luận trong phiên này.</p> : comments.slice(0, 5).map((c) => (
                    <div key={c.id} className="py-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-800">{c.author}</span>
                        {c.isOfficial && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold">
                            Admin
                          </span>
                        )}
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-7">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR COLUMN: USER CARD & BANNERS (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Card (Ảnh 1 - Double-Bezel Architecture) */}
            <div className="course-profile-card">
              <div className="course-profile-content text-center space-y-3">
                <div className="course-profile-avatar flex items-center justify-center mx-auto overflow-hidden">
                  {user?.userAvatar ? (
                    <img src={user.userAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 truncate">
                    {user?.userName || user?.userEmail || 'Tài khoản học viên'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ⓘ Bạn chưa tạo mục tiêu cho quá trình luyện thi của mình.{' '}
                    <Link to="/profile" className="course-detail-profile-link font-bold">
                      Tạo ngay.
                    </Link>
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="course-detail-action w-full py-2.5 font-bold text-xs inline-flex items-center justify-center gap-2"
                >
                  <BarChart3 size={15} strokeWidth={1.5} /> Thống kê kết quả
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartPractice}
              className="course-detail-goal-cta w-full p-5 text-left"
            >
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"><Compass size={17} /> Luyện theo mục tiêu</div>
              <h4 className="mt-2 text-lg font-black">Chọn Part phù hợp</h4>
              <p className="mt-1 text-sm font-medium">Bắt đầu với phần bạn muốn cải thiện, rồi xem lại đáp án sau khi hoàn thành.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black">Chọn Part <ChevronRight size={16} /></span>
            </button>

            <section className="space-y-2 border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111]">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"><Award size={17} /> Cách đọc điểm</div>
              <h4 className="text-lg font-black">Điểm luyện tập là ước tính</h4>
              <p className="text-sm leading-relaxed">Điểm full test được ước tính từ số câu đúng, không phải điểm TOEIC chính thức. ETS quy đổi điểm theo từng đề thi.</p>
            </section>

            <button
              type="button"
              onClick={() => setTranscriptModalOpen(true)}
              className="flex w-full items-start gap-3 border-2 border-black bg-[#FFE600] p-5 text-left text-[#111] shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B93]"
            >
              <Headphones size={21} className="mt-0.5 shrink-0" />
              <span><span className="block font-black">Nghe lại và xem lời giải</span><span className="mt-1 block text-sm font-medium">Mở lịch sử để xem đáp án, giải thích và transcript sau lượt làm.</span></span>
            </button>

            <Link to="/profile" className="flex items-center justify-between gap-3 border-2 border-black bg-white p-5 font-black shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#FF5B93]">
              <span className="flex items-center gap-2"><BarChart3 size={18} /> Theo dõi lịch sử học</span>
              <ChevronRight size={17} />
            </Link>
          </div>
        </div>
      </div>

      {/* TRANSCRIPT & ANSWER KEY PREVIEW MODAL */}
      <Modal
        isOpen={transcriptModalOpen}
        onClose={() => setTranscriptModalOpen(false)}
        title={`Đáp án & Transcript - ${test.titleTest}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <p className="text-xs text-slate-500">
            Đáp án và transcript chỉ được mở sau khi bạn hoàn thành một lượt luyện đề này.
          </p>

          <div className="space-y-4">
                {historyLoading ? (
                  <p className="border-2 border-black bg-yellow-100 p-4 text-sm">Đang tải lịch sử bài làm…</p>
                ) : historyError ? (
                  <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-2 border-black bg-rose-100 p-4 text-sm font-bold"><span>{historyError}</span><button type="button" onClick={() => setHistoryRetry((retry) => retry + 1)} className="border-2 border-black bg-[#FFE600] px-3 py-2 font-black">Thử lại</button></div>
                ) : isAuthenticated && testHistory.length > 0 ? testHistory.slice(0, 15).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between gap-4 border-2 border-black bg-yellow-100 p-4 text-sm">
                <span><strong>{attempt.typePractice}</strong> · {attempt.correctCount}/{attempt.totalCount} câu đúng</span>
                <button type="button" onClick={() => { setTranscriptModalOpen(false); navigate(`/results/${attempt.id}`); }} className="border-2 border-black bg-white px-3 py-2 font-black shadow-[3px_3px_0_#111]">Xem lời giải</button>
              </div>
            )) : (
              <p className="border-2 border-black bg-yellow-100 p-4 text-sm">{isAuthenticated ? 'Bạn chưa có lượt làm để xem đáp án.' : 'Đăng nhập và hoàn thành một lượt làm để xem đáp án và lời giải.'}</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setTranscriptModalOpen(false)}
              className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>

      {/* ADMIN DELETE MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Gỡ đề khỏi danh sách"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="font-medium leading-relaxed">
            Bạn có chắc muốn gỡ đề <strong>"{test?.titleTest}"</strong> khỏi danh sách không? Nếu đề đã có kết quả, giao dịch hoặc bài tập tham chiếu, hệ thống sẽ chuyển đề về bản nháp để giữ lịch sử liên quan. Chỉ đề chưa được sử dụng mới bị xóa vĩnh viễn.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="min-h-11 border-2 border-black bg-white px-4 py-2 font-black shadow-[3px_3px_0_#111] hover:bg-[#f1eedf] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FF5B93]"
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="min-h-11 border-2 border-black bg-[#FF5B93] px-4 py-2 font-black shadow-[3px_3px_0_#111] hover:bg-[#ff78a6] focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#FFE600] disabled:opacity-60"
              onClick={handleDeleteTest}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang gỡ...' : 'Gỡ đề'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
