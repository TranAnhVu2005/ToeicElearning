import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Headphones,
  FileText,
  Layers,
  ArrowLeft,
  AlertCircle,
  Calendar,
  Share2,
  Edit2,
  Trash2,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Send,
  User,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  BarChart3,
  ExternalLink,
  Info,
  CheckSquare,
  Square,
  Compass,
} from 'lucide-react';
import { examService } from '../services/examService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';

// DỮ LIỆU ĐẶC TẢ CÁC CHỦ ĐIỂM & DẠNG BÀI 7 PART CHUẨN STUDY4 / ETS
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

const DEFAULT_ATTEMPTS = [
  {
    id: 'att_1',
    date: '14/08/2026',
    modeLabel: 'Luyện tập',
    partLabel: 'Part 5',
    score: '22/30',
    timeSpent: '0:19:37',
  },
  {
    id: 'att_2',
    date: '15/09/2026',
    modeLabel: 'Luyện tập',
    partLabel: 'Part 1',
    score: '4/6',
    timeSpent: '0:02:35',
  },
  {
    id: 'att_3',
    date: '15/09/2026',
    modeLabel: 'Luyện tập',
    partLabel: 'Part 2',
    score: '21/25',
    timeSpent: '0:10:10',
  },
  {
    id: 'att_4',
    date: '17/09/2026',
    modeLabel: 'Luyện tập',
    partLabel: 'Part 2',
    score: '24/25',
    timeSpent: '0:18:16',
  },
  {
    id: 'att_5',
    date: '17/09/2026',
    modeLabel: 'Luyện tập',
    partLabel: 'Part 3',
    score: '15/39',
    timeSpent: '0:10:44',
  },
];

const DEFAULT_COMMENTS = [
  {
    id: 'c1',
    author: 'study4',
    isOfficial: true,
    date: 'June 10, 2025',
    content:
      'STUDY4 hiện đã có group cộng đồng chia sẻ kinh nghiệm luyện thi TOEIC cũng như hỗ trợ học viên trên Facebook, mọi người cùng tham gia nhé ^^: https://www.facebook.com/groups/517057750992723',
    pinned: true,
  },
  {
    id: 'c2',
    author: 'duongquynhnhathatinh',
    isOfficial: false,
    date: 'Sept. 20, 2026',
    content: 'lần đầu thử làm đề toeic dc 700 vậy đặt aim 900+ có ảo tưởng quá không ạ',
    pinned: false,
  },
  {
    id: 'c3',
    author: 'chidung210910',
    isOfficial: false,
    date: 'Sept. 20, 2026',
    content: 'nếu được mong study4 cho in file pdf để in ra làm chứ làm máy lâu mỏi mắt mà cũng khó gạch khó tô',
    pinned: false,
  },
  {
    id: 'c4',
    author: 'tamm24301',
    isOfficial: false,
    date: 'Sept. 20, 2026',
    content: 'mình ko có file để in ra làm ^^ em nhìn máy mỏi mắt quá à',
    pinned: false,
  },
];

const CourseDetailPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, canManageTests } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View state: 'info' (thông tin đề thi) | 'transcript' (đáp án/transcript)
  const [subView, setSubView] = useState('info');

  // Main Tabs: 'practice' (Luyện tập) | 'fulltest' (Làm full test) | 'discussion' (Thảo luận)
  const [activeTab, setActiveTab] = useState('practice');

  // Selected Parts for Practice (mặc định chọn Part 1 và Part 2 hoặc Part 1)
  const [selectedParts, setSelectedParts] = useState([1, 2, 3, 4, 5, 6, 7]);

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
  const [testHistory, setTestHistory] = useState([]);

  // Comments state
  const [comments, setComments] = useState(DEFAULT_COMMENTS);
  const [newComment, setNewComment] = useState('');

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Load Test Data
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

  // Load User Test History from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`test_history_${testId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestHistory(parsed);
          return;
        }
      }
      // Mặc định nạp các lần thi mẫu nếu chưa có
      setTestHistory(DEFAULT_ATTEMPTS);
    } catch (e) {
      console.error('Error reading test history:', e);
      setTestHistory(DEFAULT_ATTEMPTS);
    }
  }, [testId]);

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
    setSelectedParts([1, 2, 3, 4, 5, 6, 7]);
  };

  const handleDeselectAllParts = () => {
    setSelectedParts([]);
  };

  // Start Practice
  const handleStartPractice = () => {
    if (selectedParts.length === 0) {
      setToast({ type: 'error', message: 'Vui lòng chọn ít nhất 1 phần thi để luyện tập!' });
      return;
    }
    const partsParam = selectedParts.join(',');
    const timeParam = timeLimit ? parseInt(timeLimit, 10) : 0;
    navigate(`/courses/${testId}/take?mode=practice&parts=${partsParam}&time=${timeParam}`);
  };

  // Start Full Test
  const handleStartFullTest = () => {
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
    setComments([item, ...comments]);
    setNewComment('');
  };

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

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-11 h-11 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium text-sm">Đang tải dữ liệu đề thi TOEIC...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy đề thi</h2>
        <p className="text-slate-500 mb-6">{error || 'Đề thi không tồn tại hoặc đã bị gỡ bỏ.'}</p>
        <Link to="/courses" className="btn btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Quay lại danh sách đề thi
        </Link>
      </div>
    );
  }

  const contextQuestions = test.contextQuestions || [];

  return (
    <div className="bg-[#f8fafc] min-h-[100dvh] pb-20 text-slate-800">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* TOP HEADER SECTION (Chuẩn giao diện Study4 & SKILL.md) */}
      <div className="bg-white border-b border-slate-200/90 pt-7 pb-6 relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-50/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3.5">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <span className="text-slate-300">/</span>
            <Link to="/courses" className="hover:text-blue-600 transition-colors">
              Đề thi online
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-bold truncate max-w-xs">{test.titleTest}</span>
          </div>

          {/* Tag, Title, Verified Check */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="eyebrow-tag bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              #TOEIC ETS 2026
            </span>
            {test.status === 'DRAFT' && (
              <span className="eyebrow-tag bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 shadow-2xs">
                <Clock size={11} strokeWidth={1.5} /> DRAFT
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance', letterSpacing: '-0.025em' }}>
                {test.titleTest}
              </h1>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shadow-xs" title="Đề thi đã kiểm duyệt chuẩn ETS">
                <Check size={14} strokeWidth={3} />
              </span>
            </div>

            {/* Quick Admin / Teacher Actions */}
            <div className="flex items-center gap-2">
              {test.status === 'DRAFT' && canManageTests && (
                <button
                  type="button"
                  onClick={handlePublishTestNow}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle2 size={14} /> Xuất bản ngay
                </button>
              )}
              {canManageTests && (
                <Link
                  to={`/admin/tests?editId=${test.id}`}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 active:scale-[0.98] text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all btn-press"
                >
                  <Edit2 size={13} strokeWidth={1.5} /> Chỉnh sửa đề thi
                </Link>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 active:scale-[0.98] text-red-600 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer btn-press"
                >
                  <Trash2 size={13} strokeWidth={1.5} /> Xóa đề
                </button>
              )}
            </div>
          </div>

          {/* Sub-buttons: Thông tin đề thi | Đáp án/transcript */}
          <div className="flex items-center gap-2.5 mb-4">
            <button
              type="button"
              onClick={() => setSubView('info')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.98] cursor-pointer ${
                subView === 'info'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
              }`}
            >
              Thông tin đề thi
            </button>
            <button
              type="button"
              onClick={() => setTranscriptModalOpen(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.98] cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent hover:text-blue-700 inline-flex items-center gap-1.5 shadow-2xs`}
            >
              <FileText size={13} strokeWidth={1.5} /> Đáp án/transcript
            </button>
          </div>

          {/* Meta text line */}
          <div className="text-xs text-slate-600 flex items-center gap-4 flex-wrap mb-1.5 tabular-nums">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Clock size={14} strokeWidth={1.5} className="text-slate-400" /> Thời gian làm bài: <strong className="tabular-nums">120 phút</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="tabular-nums">7 phần thi</span>
            <span className="text-slate-300">|</span>
            <span className="tabular-nums">200 câu hỏi</span>
            <span className="text-slate-300">|</span>
            <span className="tabular-nums">{comments.length} bình luận</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-3.5">
            <span className="text-slate-400">👤</span>
            <span><strong className="tabular-nums font-bold text-slate-700">402,216</strong> người đã luyện tập đề thi này</span>
          </div>

          {/* Attention Red Note */}
          <p className="text-xs italic text-red-600 font-medium leading-relaxed">
            Chú ý: để được quy đổi sang scaled score (ví dụ trên thang điểm 990 cho TOEIC hoặc 9.0 cho IELTS), vui lòng chọn chế độ làm FULL TEST.
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT MAIN COLUMN: TABS & CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TABS NAVIGATION: Luyện tập | Làm full test | Chép chính tả | Thảo luận */}
            <div className="flex border-b border-slate-200 bg-white px-4 rounded-t-xl overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'practice'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Luyện tập
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('fulltest')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'fulltest'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Làm full test
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dictation')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'dictation'
                    ? 'border-indigo-600 text-indigo-600 font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Headphones size={15} strokeWidth={1.5} />
                <span>Chép chính tả</span>
                <span className="px-1.5 py-0.2 text-[10px] font-black uppercase rounded bg-indigo-100 text-indigo-700 tracking-wider">
                  Mới
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discussion')}
                className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'discussion'
                    ? 'border-blue-600 text-blue-600 font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                Thảo luận ({comments.length})
              </button>
            </div>

            {/* TAB CONTENT: LUYỆN TẬP (Ảnh 2, 3, 4) */}
            {activeTab === 'practice' && (
              <div className="bg-white rounded-b-xl border-x border-b border-slate-200/90 p-6 space-y-6 shadow-xs">
                {/* Pro Tips Banner */}
                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/80 p-4 flex items-start gap-3">
                  <Lightbulb size={20} strokeWidth={1.5} className="text-emerald-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-900 leading-relaxed font-medium">
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
                    {PART_METADATA.map((pm) => {
                      const isChecked = selectedParts.includes(pm.partNumber);
                      return (
                        <div
                          key={pm.partNumber}
                          onClick={() => handleTogglePart(pm.partNumber)}
                          className={`p-1.5 rounded-2xl border transition-all duration-200 cursor-pointer select-none card-interactive ${
                            isChecked
                              ? 'bg-blue-100/60 border-blue-300/90 shadow-xs'
                              : 'bg-slate-100/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <div
                            className={`p-4 rounded-[calc(1rem-0.125rem)] transition-colors ${
                              isChecked ? 'bg-blue-50/70 border border-blue-200/60' : 'bg-white border border-slate-200/50'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Handled by parent div
                                className="mt-1 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                              />
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-slate-900 tracking-tight">
                                    {pm.title}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {pm.skill === 'Listening' && (
                                      <Link
                                        to={`/courses/${testId}/dictation?part=${pm.partNumber}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-2.5 py-0.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center gap-1 border border-indigo-200/80 transition-colors shadow-2xs"
                                        title={`Luyện nghe chép chính tả ${pm.name}`}
                                      >
                                        <Headphones size={11} strokeWidth={1.5} /> Chép chính tả
                                      </Link>
                                    )}
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80">
                                      {pm.skill}
                                    </span>
                                  </div>
                                </div>

                                {/* Tags List */}
                                <div className="flex flex-wrap gap-1.5">
                                  {pm.tags.map((tag, tIdx) => (
                                    <span
                                      key={tIdx}
                                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-600 border border-slate-200/70 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
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
                    className="w-full max-w-sm px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer tabular-nums"
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
                    className="w-full max-w-sm px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="default">Mặc định</option>
                  </select>
                </div>

                {/* Action Button: LUYỆN TẬP (Button-in-Button Island CTA) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleStartPractice}
                    className="btn-island group px-7 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all inline-flex items-center gap-3 cursor-pointer btn-press"
                  >
                    <span>LUYỆN TẬP ({selectedParts.length} phần đã chọn)</span>
                    <span className="btn-icon-bubble bg-white/20">
                      <PlayCircle size={18} strokeWidth={1.5} />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LÀM FULL TEST (Ảnh 5) */}
            {activeTab === 'fulltest' && (
              <div className="bg-white rounded-b-xl border-x border-b border-slate-200/90 p-6 space-y-6 shadow-xs">
                {/* Yellow Warning Notice Box */}
                <div className="rounded-xl bg-amber-50 border border-amber-200/90 p-4.5 flex items-start gap-3">
                  <Info size={20} strokeWidth={1.5} className="text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    Sẵn sàng để bắt đầu làm full test? Để đạt được kết quả tốt nhất, bạn cần dành ra <strong className="tabular-nums">120 phút</strong> cho bài test này.
                  </p>
                </div>

                {/* Giao diện */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Giao diện</label>
                  <select
                    value={interfaceType}
                    onChange={(e) => setInterfaceType(e.target.value)}
                    className="w-full max-w-sm px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="default">Mặc định</option>
                  </select>
                </div>

                {/* Action Button: BẮT ĐẦU THI FULL TEST (Button-in-Button Island CTA) */}
                <div>
                  <button
                    type="button"
                    onClick={handleStartFullTest}
                    className="btn-island group px-8 py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all inline-flex items-center gap-3 cursor-pointer btn-press"
                  >
                    <span>BẮT ĐẦU THI FULL TEST (120 PHÚT)</span>
                    <span className="btn-icon-bubble bg-white/20">
                      <PlayCircle size={18} strokeWidth={1.5} />
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CHÉP CHÍNH TẢ (DICTATION) */}
            {activeTab === 'dictation' && (
              <div className="bg-white rounded-b-xl border-x border-b border-slate-200/90 p-6 space-y-6 shadow-xs">
                {/* Intro Banner */}
                <div className="rounded-xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200/80 p-4 flex items-start gap-3.5">
                  <Headphones size={22} strokeWidth={1.5} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                      Phương pháp nghe chép chính tả (TOEIC Dictation Method)
                    </h4>
                    <p className="text-xs text-indigo-900/90 leading-relaxed">
                      Luyện tập nghe từng câu, gõ lại những gì bạn nghe được để rèn luyện khả năng bắt âm, nối âm, từ vựng và cấu trúc ngữ pháp. Hệ thống đối chiếu kết quả từng từ theo thời gian thực (Smart Diff Checker) giúp bạn phát hiện ngay các lỗi sai.
                    </p>
                  </div>
                </div>

                {/* 4 Listening Parts Selection Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 tracking-tight uppercase">
                    Chọn phần nghe muốn chép chính tả:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {[
                      {
                        part: 1,
                        name: 'Part 1: Mô tả hình ảnh',
                        desc: '6 câu mô tả tranh đơn lẻ • Luyện nghe chi tiết hành động và đồ vật',
                        count: '6 câu',
                        color: 'from-blue-500/10 to-indigo-500/10 border-blue-200 text-blue-800',
                      },
                      {
                        part: 2,
                        name: 'Part 2: Hỏi & Đáp',
                        desc: '25 câu hỏi phản xạ nhanh • Rèn luyện nhận diện từ để hỏi và bẫy gián tiếp',
                        count: '25 câu',
                        color: 'from-indigo-500/10 to-purple-500/10 border-indigo-200 text-indigo-800',
                      },
                      {
                        part: 3,
                        name: 'Part 3: Hội thoại',
                        desc: '39 câu / 13 đoạn hội thoại • Nâng cao khả năng nghe hiểu ngữ cảnh công sở',
                        count: '39 câu',
                        color: 'from-sky-500/10 to-blue-500/10 border-sky-200 text-sky-800',
                      },
                      {
                        part: 4,
                        name: 'Part 4: Bài nói ngắn',
                        desc: '30 câu / 10 bài độc thoại • Làm quen với thông báo, quảng cáo, tin nhắn thoại',
                        count: '30 câu',
                        color: 'from-violet-500/10 to-indigo-500/10 border-violet-200 text-violet-800',
                      },
                    ].map((item) => (
                      <div
                        key={item.part}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 tracking-tight">
                              {item.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                              {item.count}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-400">Audio Cloudinary</span>
                          <Link
                            to={`/courses/${testId}/dictation?part=${item.part}`}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs"
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
                    className="btn-island group px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all inline-flex items-center gap-3 cursor-pointer btn-press"
                  >
                    <span>CHÉP CHÍNH TẢ TOÀN BỘ PHẦN NGHE (PART 1 - 4)</span>
                    <span className="btn-icon-bubble bg-white/20">
                      <Headphones size={18} strokeWidth={1.5} />
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT: THẢO LUẬN */}
            {activeTab === 'discussion' && (
              <div className="bg-white rounded-b-xl border-x border-b border-slate-200/90 p-6 space-y-6 shadow-xs">
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                    Thảo luận về đề thi này ({comments.length})
                  </h3>
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Chia sẻ cảm nghĩ hoặc câu hỏi của bạn về đề thi..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all"
                      >
                        <Send size={13} /> Gửi bình luận
                      </button>
                    </div>
                  </form>

                  {/* List of comments */}
                  <div className="divide-y divide-slate-100 pt-2">
                    {comments.map((c) => (
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
            <div className="p-1.5 rounded-2xl bg-slate-100/60 border border-slate-200/80 shadow-xs">
              <div className="p-6 rounded-[calc(1rem-0.125rem)] bg-white border border-slate-200/50 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Kết quả làm bài của bạn:
                </h3>

                {testHistory.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Bạn chưa làm đề thi này lần nào. Hãy chọn "Luyện tập" hoặc "Làm full test" ở trên để bắt đầu!
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-slate-200/80">
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
                              <div className="font-semibold tabular-nums text-slate-900">{h.date}</div>
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                                  {h.modeLabel || 'Luyện tập'}
                                </span>
                                {h.partLabel && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200/80">
                                    {h.partLabel}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-extrabold text-slate-900 text-sm tabular-nums">
                              {h.score}
                              {h.scaledScore && (
                                <span className="ml-2 text-xs font-semibold text-emerald-600">
                                  ({h.scaledScore})
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">{h.timeSpent}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/courses/${testId}/take?mode=practice&parts=1,2,3,4,5,6,7&review=true`);
                                }}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold hover:underline transition-all cursor-pointer group"
                              >
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
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                  Bình luận
                </h3>
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ cảm nghĩ hoặc thắc mắc của bạn..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Send size={13} strokeWidth={1.5} /> Gửi bình luận
                    </button>
                  </div>
                </form>

                {/* List of comments */}
                <div className="divide-y divide-slate-100 pt-2">
                  {comments.slice(0, 5).map((c) => (
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
            <div className="p-1.5 rounded-2xl bg-slate-100/60 border border-slate-200/80 shadow-xs">
              <div className="p-5 rounded-[calc(1rem-0.125rem)] bg-white border border-slate-200/50 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto text-slate-400 overflow-hidden">
                  {user?.userAvatar ? (
                    <img src={user.userAvatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 truncate">
                    {user?.userName || user?.userEmail || 'trananhvu314159'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ⓘ Bạn chưa tạo mục tiêu cho quá trình luyện thi của mình.{' '}
                    <Link to="/profile" className="text-blue-600 hover:underline font-bold">
                      Tạo ngay.
                    </Link>
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-2 transition-all btn-press"
                >
                  <BarChart3 size={15} strokeWidth={1.5} className="text-blue-600" /> Thống kê kết quả
                </Link>
              </div>
            </div>

            {/* Banner IELTS / TOEIC Combo */}
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-xs group cursor-pointer hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white">
                <div className="text-[10px] font-black uppercase tracking-wider text-red-200">Study4 Intensive</div>
                <h4 className="text-lg font-black mt-1">IELTS & TOEIC MASTER</h4>
                <p className="text-xs text-red-100 mt-1">Combo Intensive: Listening - Reading - Writing - Speaking</p>
              </div>
              <div className="bg-white p-3 text-xs font-bold text-red-600 flex items-center justify-between">
                <span>Khám phá lộ trình</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* Banner Score Calculator */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                <Award size={16} className="text-amber-600" /> SCORE CALCULATOR
              </div>
              <h5 className="text-xs font-bold text-slate-900">
                TÍNH ĐIỂM THI TOEIC CHÍNH XÁC 100%
              </h5>
              <p className="text-[11px] text-slate-600">
                Bảng quy đổi điểm ETS mới nhất giúp bạn ước tính band điểm thực tế.
              </p>
            </div>

            {/* Banner Study4 Extension */}
            <div className="rounded-xl p-4 bg-white border border-slate-200/90 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-slate-800">Tra từ điển, tạo flashcards</div>
                <div className="text-[11px] text-slate-500">Mọi lúc mọi nơi với Study4 Extension</div>
              </div>
            </div>

            {/* Banner Facebook Group (Ảnh 2, 5) */}
            <div className="rounded-xl p-4 bg-blue-600 text-white shadow-sm space-y-2.5 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-100">Tham gia nhóm facebook</div>
              <h5 className="font-extrabold text-sm">Cộng đồng tự học TOEIC trên STUDY4</h5>
              <a
                href="https://www.facebook.com/groups/517057750992723"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-lg shadow-xs transition-all"
              >
                Join group
              </a>
            </div>
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
            Dưới đây là đáp án và transcript của toàn bộ các phần thi trong đề. Bạn có thể tra cứu nhanh sau khi luyện tập.
          </p>

          <div className="space-y-4">
            {contextQuestions.slice(0, 15).map((cq, idx) => (
              <div key={cq.id || idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Cụm câu hỏi #{idx + 1} (order_index: {cq.orderIndex})</span>
                  <span className="text-blue-600">{cq.part?.namePart || `Part`}</span>
                </div>

                {cq.transcript && (
                  <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-700 whitespace-pre-line">
                    <strong className="text-slate-900 block mb-1">Transcript:</strong>
                    {cq.transcript}
                  </div>
                )}

                {cq.questions && cq.questions.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {cq.questions.map((q) => (
                      <div key={q.id} className="p-2 rounded bg-white border border-slate-200 font-medium">
                        Câu {q.questionNumber}: <strong className="text-emerald-600">{q.correctAnswer}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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
        title="Xác nhận xóa đề thi"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn đề thi <strong className="text-slate-900">"{test?.titleTest}"</strong> không? Toàn bộ câu hỏi và dữ liệu liên quan sẽ bị xóa khỏi cơ sở dữ liệu.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold"
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={handleDeleteTest}
              disabled={actionLoading}
            >
              {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;
