import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
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
  BookOpen,
} from 'lucide-react';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { vipPurchaseService } from '../services/vipPurchaseService';
import oceanBg from '../assets/img/detailtest/ocean.jpg';

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

  // Test Comments from backend
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [commentUpdating, setCommentUpdating] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [commentDeleting, setCommentDeleting] = useState(false);
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
          setTest({
            id: accessRes.data.testId, titleTest: accessRes.data.title,
            status: accessRes.data.status, isVip: true, vipPriceVnd: accessRes.data.priceVnd
          });
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

  // Load persisted comments for this test
  useEffect(() => {
    let cancelled = false;
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const res = await examService.getTestComments(testId);
        if (!cancelled && res.code === 1000 && Array.isArray(res.data)) {
          setComments(res.data);
        }
      } catch {
        // Keep empty comments on network error
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    };
    if (testId) {
      fetchComments();
    }
    return () => {
      cancelled = true;
    };
  }, [testId]);

  const formatCommentDate = (dateString) => {
    if (!dateString) return 'Vừa xong';
    try {
      const d = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay} ngày trước`;
      return d.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

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

  // Add Comment (Backend API)
  const handleAddComment = async (e) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;
    if (!isAuthenticated) {
      setToast({ type: 'warning', message: 'Vui lòng đăng nhập để gửi bình luận.' });
      navigate('/login', { state: { from: { pathname: `/courses/${testId}` } } });
      return;
    }
    try {
      setCommentSubmitting(true);
      const res = await examService.createTestComment(testId, content);
      if (res.code === 1000 && res.data) {
        setComments((prev) => [res.data, ...prev]);
        setNewComment('');
        setToast({ type: 'success', message: 'Bình luận của bạn đã được đăng thành công.' });
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể đăng bình luận.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi kết nối máy chủ khi gửi bình luận.' });
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Edit Comment Handlers
  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content || '');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleUpdateComment = async (commentId) => {
    const content = editingContent.trim();
    if (!content) return;
    try {
      setCommentUpdating(true);
      const res = await examService.updateTestComment(commentId, content);
      if (res.code === 1000 && res.data) {
        setComments((prev) => prev.map((c) => (c.id === commentId ? res.data : c)));
        setEditingCommentId(null);
        setEditingContent('');
        setToast({ type: 'success', message: 'Cập nhật bình luận thành công.' });
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể cập nhật bình luận.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi cập nhật bình luận.' });
    } finally {
      setCommentUpdating(false);
    }
  };

  // Delete Comment Handlers (with Modal Confirmation)
  const handleOpenDeleteComment = (comment) => {
    setCommentToDelete(comment);
  };

  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      setCommentDeleting(true);
      const res = await examService.deleteTestComment(commentToDelete.id);
      if (res.code === 1000) {
        setComments((prev) => prev.filter((c) => c.id !== commentToDelete.id));
        setCommentToDelete(null);
        setToast({ type: 'success', message: 'Đã xóa bình luận thành công.' });
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xóa bình luận.' });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Lỗi khi xóa bình luận.' });
    } finally {
      setCommentDeleting(false);
    }
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
      <main className="course-detail-page flex min-h-[75vh] items-center justify-center bg-white px-4 text-slate-900">
        <div role="status" className="border border-slate-200 bg-white p-8 text-center">
          <div aria-hidden="true" className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#1D4ED8]" />
          <p className="text-sm font-semibold text-slate-700">Đang tải dữ liệu đề thi TOEIC...</p>
        </div>
      </main>
    );
  }

  if (error || !test) {
    return (
      <main className="course-detail-page flex min-h-[60vh] items-center justify-center bg-white px-4 py-16 text-center text-slate-900">
        <section role="alert" className="max-w-2xl border border-slate-200 bg-white p-7 sm:p-10">
          <AlertCircle size={40} aria-hidden="true" className="mx-auto mb-4 text-red-600" />
          <h2 className="mb-2 text-xl font-bold text-slate-900">Không tìm thấy đề thi</h2>
          <p className="mb-6 text-sm text-slate-600">{error || 'Đề thi không tồn tại hoặc đã bị gỡ bỏ.'}</p>
          <Link
            to="/courses"
            className="editorial-button-primary inline-flex min-h-10 items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <ArrowLeft size={16} /> Quay lại danh sách đề thi
          </Link>
        </section>
      </main>
    );
  }

  if (vipLocked) {
    return (
      <main className="course-detail-page min-h-[75vh] bg-white px-4 py-14 text-slate-900 sm:px-6">
        <section className="mx-auto max-w-3xl border border-slate-200 bg-white p-7 sm:p-10">
          <span className="inline-flex items-center gap-1.5 border border-[#1D4ED8] bg-[#EFF6FF] px-3 py-1 text-xs font-bold uppercase text-[#1D4ED8]">
            <LockKeyhole size={14} /> Đề VIP
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{test.titleTest}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Mua một lần, mở quyền truy cập đề này vĩnh viễn. Nội dung bài thi chỉ được tải sau khi máy chủ xác nhận thanh toán.
          </p>
          <p className="mt-6 inline-block border border-slate-200 bg-[#F8FAFC] px-5 py-3 font-mono text-2xl font-bold text-slate-900">
            {Number(test.vipPriceVnd || 0).toLocaleString('vi-VN')} ₫
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleBuyVipTest}
              disabled={purchaseLoading}
              className="editorial-button-primary px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {purchaseLoading ? 'Đang tạo giao dịch…' : 'Mua đề qua VNPAY'}
            </button>
            <Link to="/courses" className="editorial-button-secondary px-5 py-3 text-sm font-semibold">
              Quay lại danh sách đề
            </Link>
          </div>
          {toast && (
            <p role="alert" className="mt-5 border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
              {toast.message}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="course-detail-page min-h-[100dvh] pb-20 text-slate-800">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* TOP HEADER SECTION WITH OCEAN BACKGROUND */}
      <div
        className="course-detail-header relative pt-8 pb-7 border-b border-slate-200/90 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.76) 0%, rgba(255, 255, 255, 0.58) 45%, rgba(248, 250, 252, 0.94) 100%), url("${oceanBg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumbs */}
          <div className="course-detail-breadcrumbs flex items-center gap-2 text-xs font-semibold mb-4">
            <Link to="/" className="text-slate-600 hover:text-[#1D4ED8] transition-colors">
              Trang chủ
            </Link>
            <span aria-hidden="true" className="text-slate-400">/</span>
            <Link to="/courses" className="text-slate-600 hover:text-[#1D4ED8] transition-colors">
              Đề thi
            </Link>
            <span aria-hidden="true" className="text-slate-400">/</span>
            <span className="course-detail-current truncate max-w-xs text-slate-900 font-bold" aria-current="page">{test.titleTest}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Test Cover Thumbnail */}
            <div className="course-detail-cover relative w-[124px] h-[165px] sm:w-[136px] sm:h-[182px] shrink-0 border border-slate-200/90 bg-white/95 p-1.5 shadow-md rounded-sm flex items-center justify-center overflow-hidden backdrop-blur-xs">
              {test.coverImageUrl ? (
                <img
                  src={test.coverImageUrl}
                  alt={test.titleTest}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-3 text-slate-400 w-full h-full bg-slate-50/80 border border-dashed border-slate-200">
                  <BookOpen size={32} strokeWidth={1.5} className="text-slate-400 mb-1.5" />
                  <span className="text-[11px] font-bold text-slate-600">TOEIC TEST</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Chưa có ảnh bìa</span>
                </div>
              )}
            </div>

            {/* Main Header Info */}
            <div className="flex-1 min-w-0 space-y-3.5">
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="course-detail-label shadow-2xs">
                  BỘ ĐỀ TOEIC
                </span>
                {test.status === 'DRAFT' && (
                  <span className="course-detail-draft inline-flex items-center gap-1 shadow-2xs">
                    <Clock size={11} strokeWidth={1.5} /> DRAFT
                  </span>
                )}
                <span
                  className={`border px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-[2px] shadow-2xs backdrop-blur-xs ${test.isVip
                    ? 'border-blue-300 bg-blue-50/90 text-[#1D4ED8]'
                    : 'border-slate-300/90 bg-white/90 text-slate-700'
                    }`}
                >
                  {test.isVip
                    ? `VIP · ${new Intl.NumberFormat('vi-VN').format(Number(test.vipPriceVnd || 0))} ₫`
                    : 'Miễn phí'}
                </span>
              </div>

              {/* Title & Admin Actions */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h1 className="course-detail-title text-2xl sm:text-3xl text-slate-900 font-extrabold" style={{ textWrap: 'balance' }}>
                  {test.titleTest}
                </h1>

                {/* Quick Admin / Teacher Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {test.status === 'DRAFT' && isAdmin && (
                    <button
                      type="button"
                      onClick={handlePublishTestNow}
                      disabled={actionLoading}
                      className="course-detail-action course-detail-publish px-3.5 py-1.5 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 size={14} /> Xuất bản ngay
                    </button>
                  )}
                  {isAdmin && (
                    <Link
                      to={`/admin/tests?editId=${test.id}`}
                      className="course-detail-action course-detail-edit px-3.5 py-1.5 font-bold text-xs inline-flex items-center gap-1.5 bg-white/95 hover:bg-white border-slate-300 shadow-2xs backdrop-blur-xs"
                    >
                      <Edit2 size={13} strokeWidth={1.5} /> Chỉnh sửa đề thi
                    </Link>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(true)}
                      className="course-detail-action course-detail-delete px-3.5 py-1.5 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-2xs backdrop-blur-xs"
                    >
                      <Trash2 size={13} strokeWidth={1.5} /> Xóa đề
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-buttons: Thông tin đề thi | Đáp án/transcript */}
              <div className="course-detail-subnav flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSubView('info')}
                  className={`course-detail-subtab px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs ${subView === 'info' ? 'is-selected shadow-xs' : 'bg-white/90 hover:bg-white backdrop-blur-xs'
                    }`}
                >
                  Thông tin đề thi
                </button>
                <button
                  type="button"
                  onClick={() => setTranscriptModalOpen(true)}
                  className="course-detail-subtab px-4 py-2 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-xs shadow-2xs"
                >
                  <FileText size={13} strokeWidth={1.5} /> Đáp án/transcript
                </button>
              </div>

              <p className="course-detail-score-note text-xs font-semibold leading-relaxed">
                Điểm quy đổi hiển thị hiện là ước tính; kết quả có thể khác bảng scaled score chính thức của từng đề TOEIC.
              </p>
            </div>
          </div>
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
                Luyện tập từng phần
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
                    className="course-detail-select w-full max-w-sm px-3.5 py-2.5 text-sm cursor-pointer"
                  >
                    <option value="">-- Chọn thời gian (Không giới hạn) --</option>
                    <option value="5">5 phút</option>
                    <option value="10">10 phút</option>
                    <option value="15">15 phút</option>
                    <option value="20">20 phút</option>
                    <option value="30">30 phút</option>
                    <option value="45">45 phút</option>
                    <option value="60">60 phút</option>
                    <option value="75">75 phút</option>
                    <option value="90">90 phút</option>
                    <option value="120">120 phút</option>
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
                    {isFullLengthTest ? <>Sẵn sàng để bắt đầu full test. Bạn cần dành ra <strong className="font-semibold text-slate-800">120 phút</strong> cho bài thi 200 câu.</> : <>Đề hiện có {testQuestionCount}/200 câu hoặc số câu chưa liên tục; chỉ bật full test khi đề có đủ 200 câu theo thứ tự.</>}
                  </p>
                </div>



                {/* Action Button: BẮT ĐẦU THI FULL TEST (Button-in-Button Island CTA) */}
                <div>
                  <button
                    type="button"
                    onClick={handleStartFullTest}
                    disabled={!isFullLengthTest}
                    className="course-detail-cta group px-8 py-3.5 font-extrabold text-sm tracking-wide inline-flex items-center gap-3 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    <span>BẮT ĐẦU THI FULL TEST</span>

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
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Phương pháp nghe chép chính tả (TOEIC Dictation Method)
                    </h4>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">
                      Luyện tập nghe từng câu, gõ lại những gì bạn nghe được để rèn luyện khả năng bắt âm, nối âm, từ vựng và cấu trúc ngữ pháp. Hệ thống đối chiếu kết quả từng từ theo thời gian thực (Smart Diff Checker) giúp bạn phát hiện ngay các lỗi sai.
                    </p>
                  </div>
                </div>

                {/* 4 Listening Parts Selection Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
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
                            <span className="text-xs font-bold text-slate-900 tracking-tight">
                              {item.name}
                            </span>
                            <span className="border border-blue-200 bg-[#EFF6FF] px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8]">
                              {item.count}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
                          <span className="text-[11px] font-medium text-slate-500">Audio đề</span>
                          <Link
                            to={`/courses/${testId}/dictation?part=${item.part}`}
                            className="editorial-button-secondary inline-flex min-h-9 items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                          >
                            Bắt đầu chép <ChevronRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Master Action CTA */}
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
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      Thảo luận về đề thi này ({comments.length})
                    </h3>
                  </div>

                  {!isAuthenticated ? (
                    <div className="border border-blue-200 bg-[#EFF6FF] p-4 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3 rounded-[2px]">
                      <div className="flex items-center gap-2">
                        <Info size={16} className="text-[#1D4ED8] shrink-0" />
                        <span>Đăng nhập để tham gia thảo luận và đặt câu hỏi về đề thi này.</span>
                      </div>
                      <Link
                        to="/login"
                        state={{ from: { pathname: `/courses/${testId}` } }}
                        className="editorial-button-primary px-3.5 py-1.5 text-xs font-semibold shrink-0"
                      >
                        Đăng nhập
                      </Link>
                    </div>
                  ) : (
                    <form onSubmit={handleAddComment} className="space-y-3">
                      <textarea
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ cảm nghĩ, câu hỏi hoặc kinh nghiệm giải đề của bạn..."
                        className="course-detail-textarea w-full p-3 text-sm focus:outline-none"
                      />
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || commentSubmitting}
                          className="course-detail-action course-detail-submit px-5 py-2 font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <Send size={13} strokeWidth={1.5} /> {commentSubmitting ? 'Đang gửi…' : 'Gửi bình luận'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of comments */}
                  <div className="divide-y divide-slate-100 pt-2">
                    {commentsLoading ? (
                      <p className="py-6 text-center text-xs text-slate-500">Đang tải danh sách bình luận...</p>
                    ) : comments.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">
                        Chưa có bình luận nào cho đề thi này. Hãy là người đầu tiên chia sẻ cảm nghĩ!
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="py-4 space-y-1.5 group">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs flex-wrap">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] overflow-hidden shrink-0 border border-blue-200">
                                {c.userAvatar ? (
                                  <img src={c.userAvatar} alt={c.userName} className="w-full h-full object-cover" />
                                ) : (
                                  (c.userName || 'U').substring(0, 2).toUpperCase()
                                )}
                              </div>
                              <span className="font-bold text-slate-900">{c.userName}</span>
                              {c.roleName === 'ADMIN' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-blue-600 text-white font-bold">
                                  Admin
                                </span>
                              )}
                              {c.roleName === 'TEACHER' && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-emerald-600 text-white font-bold">
                                  Giáo viên
                                </span>
                              )}
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400 font-medium text-[11px]">{formatCommentDate(c.createdAt)}</span>
                              {c.updatedAt && c.updatedAt !== c.createdAt && (
                                <span className="text-slate-400 text-[10px] italic">(đã chỉnh sửa)</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {user && user.id === c.userId && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(c)}
                                  className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
                                  title="Chỉnh sửa bình luận"
                                >
                                  <Edit2 size={13} strokeWidth={1.5} />
                                </button>
                              )}
                              {(isAdmin || (user && user.id === c.userId)) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteComment(c)}
                                  className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                  title="Xóa bình luận"
                                >
                                  <Trash2 size={13} strokeWidth={1.5} />
                                </button>
                              )}
                            </div>
                          </div>

                          {editingCommentId === c.id ? (
                            <div className="pl-8 pt-1 space-y-2">
                              <textarea
                                rows={2}
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="course-detail-textarea w-full p-2.5 text-xs focus:outline-none"
                                autoFocus
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={handleCancelEdit}
                                  disabled={commentUpdating}
                                  className="editorial-button-secondary px-3 py-1 text-xs font-semibold"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateComment(c.id)}
                                  disabled={!editingContent.trim() || commentUpdating}
                                  className="course-detail-action course-detail-submit px-3.5 py-1 text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  {commentUpdating ? 'Đang lưu…' : 'Lưu thay đổi'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-700 pl-8 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* BẢNG: KẾT QUẢ LÀM BÀI CỦA BẠN */}
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
                  <div role="alert" className="flex flex-wrap items-center justify-center gap-3 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                    <span>{historyError}</span>
                    <button
                      type="button"
                      onClick={() => setHistoryRetry((retry) => retry + 1)}
                      className="editorial-button-secondary min-h-9 px-3 text-xs font-semibold"
                    >
                      Thử tải lại
                    </button>
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
                      <tbody className="divide-y divide-slate-100">
                        {testHistory.map((h, idx) => (
                          <tr key={h.id || idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-700">
                              <div className="font-semibold text-slate-900">{h.createdAt ? new Date(h.createdAt).toLocaleString('vi-VN') : '—'}</div>
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
                            <td className="py-3 px-4 font-extrabold text-slate-900 text-sm">
                              {h.totalScore} <span className="text-xs font-semibold text-slate-500">{h.scoreType === 'ESTIMATED_SCALED' ? '/ 990 (ước tính)' : `/${h.totalCount} câu`}</span>
                              <div className="text-[11px] font-medium text-slate-500">{h.correctCount}/{h.totalCount} câu đúng</div>
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600">{h.timeSpentFormatted}</td>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Bình luận ({comments.length})
                  </h3>
                  {comments.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('discussion')}
                      className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
                    >
                      Xem tất cả ({comments.length})
                    </button>
                  )}
                </div>

                {!isAuthenticated ? (
                  <div className="border border-blue-200 bg-[#EFF6FF] p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3 rounded-[2px]">
                    <div className="flex items-center gap-2">
                      <Info size={15} className="text-[#1D4ED8] shrink-0" />
                      <span>Đăng nhập để tham gia thảo luận.</span>
                    </div>
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/courses/${testId}` } }}
                      className="editorial-button-primary px-3 py-1 text-xs font-semibold shrink-0"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <textarea
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Chia sẻ cảm nghĩ hoặc thắc mắc của bạn..."
                      className="course-detail-textarea w-full p-3 text-sm focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || commentSubmitting}
                        className="course-detail-action course-detail-submit px-4 py-2 font-bold text-xs inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Send size={13} strokeWidth={1.5} /> {commentSubmitting ? 'Đang gửi…' : 'Gửi bình luận'}
                      </button>
                    </div>
                  </form>
                )}

                {/* List of latest comments */}
                <div className="divide-y divide-slate-100 pt-2">
                  {commentsLoading ? (
                    <p className="py-4 text-center text-xs text-slate-500">Đang tải bình luận...</p>
                  ) : comments.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">Chưa có bình luận nào cho đề thi này.</p>
                  ) : (
                    comments.slice(0, 5).map((c) => (
                      <div key={c.id} className="py-3 space-y-1 group">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[9px] overflow-hidden shrink-0 border border-blue-200">
                              {c.userAvatar ? (
                                <img src={c.userAvatar} alt={c.userName} className="w-full h-full object-cover" />
                              ) : (
                                (c.userName || 'U').substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="font-bold text-slate-800">{c.userName}</span>
                            {c.roleName === 'ADMIN' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-blue-600 text-white font-bold">
                                Admin
                              </span>
                            )}
                            {c.roleName === 'TEACHER' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-[2px] bg-emerald-600 text-white font-bold">
                                Giáo viên
                              </span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-400 text-[11px]">{formatCommentDate(c.createdAt)}</span>
                            {c.updatedAt && c.updatedAt !== c.createdAt && (
                              <span className="text-slate-400 text-[10px] italic">(đã chỉnh sửa)</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {user && user.id === c.userId && (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(c)}
                                className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer"
                                title="Chỉnh sửa bình luận"
                              >
                                <Edit2 size={12} strokeWidth={1.5} />
                              </button>
                            )}
                            {(isAdmin || (user && user.id === c.userId)) && (
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteComment(c)}
                                className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                title="Xóa bình luận"
                              >
                                <Trash2 size={12} strokeWidth={1.5} />
                              </button>
                            )}
                          </div>
                        </div>

                        {editingCommentId === c.id ? (
                          <div className="pl-7 pt-1 space-y-2">
                            <textarea
                              rows={2}
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="course-detail-textarea w-full p-2.5 text-xs focus:outline-none"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={commentUpdating}
                                className="editorial-button-secondary px-3 py-1 text-xs font-semibold"
                              >
                                Hủy
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateComment(c.id)}
                                disabled={!editingContent.trim() || commentUpdating}
                                className="course-detail-action course-detail-submit px-3 py-1 text-xs font-bold inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                {commentUpdating ? 'Đang lưu…' : 'Lưu thay đổi'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 pl-7 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {comments.length > 5 && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab('discussion')}
                      className="editorial-button-secondary inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold"
                    >
                      Xem toàn bộ {comments.length} bình luận <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR COLUMN: USER CARD & BANNERS (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Card */}
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
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]"><Compass size={17} /> Luyện theo mục tiêu</div>
              <h4 className="mt-2 text-lg font-bold text-slate-900">Chọn Part phù hợp</h4>
              <p className="mt-1 text-sm text-slate-600">Bắt đầu với phần bạn muốn cải thiện, rồi xem lại đáp án sau khi hoàn thành.</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#1D4ED8]">Chọn Part <ChevronRight size={16} /></span>
            </button>

            <section className="space-y-2 border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"><Award size={17} className="text-[#1D4ED8]" /> Cách đọc điểm</div>
              <h4 className="text-lg font-bold text-slate-900">Điểm luyện tập là ước tính</h4>
              <p className="text-sm leading-relaxed text-slate-600">Điểm full test được ước tính từ số câu đúng, không phải điểm TOEIC chính thức. ETS quy đổi điểm theo từng đề thi.</p>
            </section>

            <button
              type="button"
              onClick={() => setTranscriptModalOpen(true)}
              className="flex w-full items-start gap-3 border border-slate-200 bg-[#F8FAFC] p-5 text-left text-slate-900 transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF]"
            >
              <Headphones size={20} className="mt-0.5 shrink-0 text-[#1D4ED8]" />
              <span>
                <span className="block font-bold text-slate-900">Nghe lại và xem lời giải</span>
                <span className="mt-1 block text-sm text-slate-600">Mở lịch sử để xem đáp án, giải thích và transcript sau lượt làm.</span>
              </span>
            </button>

            <Link
              to="/profile"
              className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-5 font-bold text-slate-900 transition hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <span className="flex items-center gap-2"><BarChart3 size={18} className="text-[#1D4ED8]" /> Theo dõi lịch sử học</span>
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

          <div className="space-y-3">
            {historyLoading ? (
              <p className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Đang tải lịch sử bài làm…</p>
            ) : historyError ? (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                <span>{historyError}</span>
                <button type="button" onClick={() => setHistoryRetry((retry) => retry + 1)} className="editorial-button-secondary px-3 py-1.5 text-xs font-semibold">Thử lại</button>
              </div>
            ) : isAuthenticated && testHistory.length > 0 ? testHistory.slice(0, 15).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between gap-4 border border-slate-200 bg-white p-4 text-sm">
                <span><strong className="text-slate-900">{attempt.typePractice}</strong> · <span className="font-mono">{attempt.correctCount}/{attempt.totalCount}</span> câu đúng</span>
                <button type="button" onClick={() => { setTranscriptModalOpen(false); navigate(`/results/${attempt.id}`); }} className="editorial-button-primary px-3 py-1.5 text-xs font-semibold">Xem lời giải</button>
              </div>
            )) : (
              <p className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {isAuthenticated ? 'Bạn chưa có lượt làm để xem đáp án.' : 'Đăng nhập và hoàn thành một lượt làm để xem đáp án và lời giải.'}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setTranscriptModalOpen(false)}
              className="editorial-button-secondary px-5 py-2 text-xs font-semibold"
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
          <p className="font-medium leading-relaxed text-slate-700">
            Bạn có chắc muốn gỡ đề <strong>"{test?.titleTest}"</strong> khỏi danh sách không? Nếu đề đã có kết quả, giao dịch hoặc bài tập tham chiếu, hệ thống sẽ chuyển đề về bản nháp để giữ lịch sử liên quan. Chỉ đề chưa được sử dụng mới bị xóa vĩnh viễn.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="editorial-button-secondary min-h-10 px-4 py-2 font-semibold"
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="min-h-10 border border-red-600 bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              onClick={handleDeleteTest}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang gỡ...' : 'Gỡ đề'}
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE COMMENT CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        title="Xóa bình luận"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="font-medium leading-relaxed text-slate-700">
            Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.
          </p>
          {commentToDelete && (
            <div className="p-3 bg-slate-50 border border-slate-200 text-slate-700 text-xs italic line-clamp-3">
              "{commentToDelete.content}"
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="editorial-button-secondary min-h-9 px-4 py-1.5 font-semibold"
              onClick={() => setCommentToDelete(null)}
              disabled={commentDeleting}
            >
              Hủy
            </button>
            <button
              type="button"
              className="min-h-9 border border-red-600 bg-red-600 px-4 py-1.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              onClick={handleConfirmDeleteComment}
              disabled={commentDeleting}
            >
              {commentDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
