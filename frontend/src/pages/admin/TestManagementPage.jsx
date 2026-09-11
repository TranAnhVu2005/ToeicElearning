import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  PlayCircle,
  Clock,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Volume2,
  Image as ImageIcon,
  Save,
  HelpCircle,
  RefreshCw,
  PlusCircle,
  Check,
  Music,
  ChevronRight,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';
import { examService } from '../../services/examService';
import { uploadMediaFile } from '../../services/uploadService';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

const PART_DEFINITIONS = {
  1: { name: 'Part 1: Mô tả tranh (Photographs)', type: 'listening', defaultQCount: 1 },
  2: { name: 'Part 2: Hỏi - Đáp (Question-Response)', type: 'listening', defaultQCount: 1 },
  3: { name: 'Part 3: Đoạn hội thoại (Short Conversations)', type: 'listening', defaultQCount: 3 },
  4: { name: 'Part 4: Bài nói ngắn (Short Talks)', type: 'listening', defaultQCount: 3 },
  5: { name: 'Part 5: Hoàn thành câu (Incomplete Sentences)', type: 'reading', defaultQCount: 1 },
  6: { name: 'Part 6: Hoàn thành đoạn văn (Text Completion)', type: 'reading', defaultQCount: 4 },
  7: { name: 'Part 7: Đọc hiểu văn bản (Reading Comprehension)', type: 'reading', defaultQCount: 4 },
};

const createFreshQuestion = (qNum = 1, partNumber = 1) => ({
  questionContent:
    partNumber === 1
      ? 'Where is the person standing?'
      : partNumber === 5
      ? 'All team members must submit their evaluation reports _______ Friday.'
      : `Câu hỏi trắc nghiệm số ${qNum}...`,
  optionA: partNumber === 1 ? 'Near the office desk' : partNumber === 5 ? 'before' : 'Lựa chọn A',
  optionB: partNumber === 1 ? 'Outside the building' : partNumber === 5 ? 'prior' : 'Lựa chọn B',
  optionC: partNumber === 1 ? 'In the hallway' : partNumber === 5 ? 'ahead' : 'Lựa chọn C',
  optionD: partNumber === 1 ? 'On the upper roof' : partNumber === 5 ? 'advance' : 'Lựa chọn D',
  correctAnswer: 'A',
  explanation: 'Giải thích chi tiết vì sao đáp án này chính xác...',
});

const createFreshContextQuestion = (partNumber = 1) => ({
  audioUrl:
    partNumber <= 4
      ? 'https://res.cloudinary.com/demo/video/upload/v1/toeic/audio/part1_q1.mp3'
      : '',
  imageUrl:
    partNumber === 1
      ? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80'
      : '',
  paragraph:
    partNumber >= 6
      ? 'MEMORANDUM\nTo: All Department Staff\nFrom: Executive Office\nDate: October 15\nSubject: Office Renovation Schedule\n\nPlease be advised that renovations on the 3rd floor will commence next Monday...'
      : '',
  transcript:
    partNumber <= 4
      ? 'A woman is standing near the office desk reviewing documents with her colleague.'
      : '',
  questions: [createFreshQuestion(1, partNumber)],
});

const createFreshPart = (partNumber = 1) => ({
  partNumber,
  contextQuestions: [createFreshContextQuestion(partNumber)],
});

const TestManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Search & Filter
  const [searchInput, setSearchInput] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [direction, setDirection] = useState('DESC');

  // Exam Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderMode, setBuilderMode] = useState('create'); // 'create' | 'edit'
  const [selectedTest, setSelectedTest] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formParts, setFormParts] = useState([createFreshPart(1), createFreshPart(5)]);
  const [activePartIndex, setActivePartIndex] = useState(0);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // File Uploading State
  const [uploadingKey, setUploadingKey] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch tests
  const fetchTests = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await examService.getTests(
          currentPage,
          pageSize,
          debouncedKeyword,
          sortBy,
          direction
        );
        if (res.code === 1000 && res.data) {
          setTests(res.data.content || []);
          setTotalPages(res.data.totalPages || 1);
          setTotalElements(res.data.totalElements || 0);
        }
      } catch (err) {
        console.error('Fetch tests error:', err);
        setToast({
          type: 'error',
          message: err.response?.data?.message || 'Không thể tải danh sách đề thi.',
        });
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [currentPage, pageSize, debouncedKeyword, sortBy, direction]
  );

  useEffect(() => {
    fetchTests(true);
  }, [fetchTests]);

  // Open Create Builder
  const handleOpenCreateModal = () => {
    setBuilderMode('create');
    setSelectedTest(null);
    setFormTitle(`ETS TOEIC 2026 - Test ${(totalElements + 1).toString().padStart(2, '0')}`);
    setFormParts([createFreshPart(1), createFreshPart(5)]);
    setActivePartIndex(0);
    setBuilderOpen(true);
  };

  // Open Edit Builder
  const handleOpenEditModal = async (test) => {
    setBuilderMode('edit');
    setSelectedTest(test);
    setFormTitle(test.titleTest || '');
    setActivePartIndex(0);
    setBuilderOpen(true);

    try {
      setActionLoading(true);
      const res = await examService.getTestDetail(test.id);
      if (res.code === 1000 && res.data) {
        const fullTest = res.data;
        setFormTitle(fullTest.titleTest || test.titleTest || '');

        // Group contextQuestions by partNumber
        const partMap = {};
        (fullTest.contextQuestions || []).forEach((cq) => {
          const pNum = cq.part?.namePart
            ? parseInt(cq.part.namePart.replace(/\D/g, '')) || 1
            : 1;

          if (!partMap[pNum]) {
            partMap[pNum] = {
              partNumber: pNum,
              contextQuestions: [],
            };
          }

          partMap[pNum].contextQuestions.push({
            audioUrl: cq.audioUrl || '',
            imageUrl: cq.imageUrl || '',
            paragraph: cq.paragraph || '',
            transcript: cq.transcript || '',
            questions:
              cq.questions && cq.questions.length > 0
                ? cq.questions.map((q, qIdx) => ({
                    questionContent: q.questionContent || '',
                    optionA: q.optionA || '',
                    optionB: q.optionB || '',
                    optionC: q.optionC || '',
                    optionD: q.optionD || '',
                    correctAnswer: q.correctAnswer
                      ? String(q.correctAnswer).toUpperCase()
                      : 'A',
                    explanation: q.explanation || '',
                  }))
                : [createFreshQuestion(1, pNum)],
          });
        });

        const partsArr = Object.values(partMap);
        if (partsArr.length > 0) {
          // Sort parts in ascending order (Part 1, Part 2, ... Part 7)
          partsArr.sort((a, b) => a.partNumber - b.partNumber);
          setFormParts(partsArr);
        } else {
          setFormParts([createFreshPart(1), createFreshPart(5)]);
        }
      }
    } catch (err) {
      console.error('Fetch test details error:', err);
      setToast({
        type: 'error',
        message: 'Không thể nạp chi tiết câu hỏi của đề thi.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // URL Query Trigger (e.g. from /courses?action=create or ?editId=...)
  useEffect(() => {
    const action = searchParams.get('action');
    const editId = searchParams.get('editId');
    if (action === 'create') {
      handleOpenCreateModal();
      setSearchParams({});
    } else if (editId) {
      const match = tests.find((t) => t.id === editId) || { id: editId, titleTest: 'Đang nạp...' };
      handleOpenEditModal(match);
      setSearchParams({});
    }
  }, [searchParams, tests, setSearchParams]);

  // Open Delete Modal
  const handleOpenDeleteModal = (test) => {
    setSelectedTest(test);
    setDeleteModalOpen(true);
  };

  // Submit Exam Builder (Create / Edit)
  const handleSaveExam = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập tên đề thi!' });
      return;
    }

    if (!formParts || formParts.length === 0) {
      setToast({ type: 'error', message: 'Bộ đề thi phải có ít nhất 1 phần (Part)!' });
      return;
    }

    // Validate that each question has content and options
    for (const part of formParts) {
      for (const cq of part.contextQuestions || []) {
        for (const q of cq.questions || []) {
          if (!q.questionContent.trim()) {
            setToast({
              type: 'error',
              message: `Vui lòng nhập nội dung cho câu hỏi trong Part ${part.partNumber}!`,
            });
            return;
          }
          if (!q.optionA.trim() || !q.optionB.trim()) {
            setToast({
              type: 'error',
              message: `Các câu hỏi trong Part ${part.partNumber} phải có tối thiểu đáp án A và B!`,
            });
            return;
          }
        }
      }
    }

    try {
      setActionLoading(true);
      const payload = {
        titleTest: formTitle.trim(),
        parts: formParts,
      };

      if (builderMode === 'create') {
        const res = await examService.createTest(payload);
        if (res.code === 1000) {
          setToast({
            type: 'success',
            message: `Tạo bộ đề thi "${formTitle.trim()}" kèm các câu hỏi thành công!`,
          });
          setBuilderOpen(false);
          fetchTests(false);
        } else {
          setToast({ type: 'error', message: res.message || 'Không thể tạo đề thi.' });
        }
      } else {
        const res = await examService.updateTest(selectedTest.id, payload);
        if (res.code === 1000) {
          setToast({
            type: 'success',
            message: `Cập nhật toàn bộ đề thi "${formTitle.trim()}" thành công!`,
          });
          setBuilderOpen(false);
          fetchTests(false);
        } else {
          setToast({ type: 'error', message: res.message || 'Không thể cập nhật đề thi.' });
        }
      }
    } catch (err) {
      console.error('Save exam error:', err);
      const msg =
        err.response?.data?.message ||
        'Máy chủ báo lỗi khi lưu đề thi. Vui lòng kiểm tra ràng buộc dữ liệu backend.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm Delete Test
  const handleConfirmDelete = async () => {
    if (!selectedTest) return;
    try {
      setActionLoading(true);
      const res = await examService.deleteTest(selectedTest.id);
      if (res.code === 1000) {
        setToast({
          type: 'success',
          message: `Đã xóa đề thi "${selectedTest.titleTest}" thành công!`,
        });
        setDeleteModalOpen(false);
        fetchTests(false);
      } else {
        setToast({ type: 'error', message: res.message || 'Không thể xóa đề thi.' });
      }
    } catch (err) {
      console.error('Delete test error:', err);
      const msg =
        err.response?.data?.message ||
        'Lỗi khóa ngoại MySQL: Đề thi có chứa câu hỏi, cần cấu hình ON DELETE CASCADE trong backend để xóa toàn bộ.';
      setToast({ type: 'error', message: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // --- Builder Sub-actions ---
  const handleAddPart = (partNum) => {
    // If part already exists, switch to it
    const existingIdx = formParts.findIndex((p) => p.partNumber === partNum);
    if (existingIdx !== -1) {
      setActivePartIndex(existingIdx);
      setToast({ type: 'info', message: `Đã chuyển sang Part ${partNum} hiện có.` });
      return;
    }
    const newPart = createFreshPart(partNum);
    setFormParts((prev) => [...prev, newPart].sort((a, b) => a.partNumber - b.partNumber));
    setActivePartIndex(formParts.length);
  };

  const handleRemovePart = (partIndex) => {
    if (formParts.length <= 1) {
      setToast({ type: 'warning', message: 'Bộ đề thi phải có ít nhất 1 phần (Part)!' });
      return;
    }
    setFormParts((prev) => prev.filter((_, idx) => idx !== partIndex));
    setActivePartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleAddContextQuestion = (pIdx) => {
    setFormParts((prev) => {
      const copy = [...prev];
      const part = { ...copy[pIdx] };
      part.contextQuestions = [
        ...part.contextQuestions,
        createFreshContextQuestion(part.partNumber),
      ];
      copy[pIdx] = part;
      return copy;
    });
  };

  const handleRemoveContextQuestion = (pIdx, cqIdx) => {
    setFormParts((prev) => {
      const copy = [...prev];
      const part = { ...copy[pIdx] };
      if (part.contextQuestions.length <= 1) {
        setToast({ type: 'warning', message: 'Mỗi phần phải có ít nhất 1 cụm câu hỏi!' });
        return prev;
      }
      part.contextQuestions = part.contextQuestions.filter((_, idx) => idx !== cqIdx);
      copy[pIdx] = part;
      return copy;
    });
  };

  const handleAddQuestion = (pIdx, cqIdx) => {
    setFormParts((prev) => {
      const copy = [...prev];
      const part = { ...copy[pIdx] };
      const cqList = [...part.contextQuestions];
      const cq = { ...cqList[cqIdx] };
      cq.questions = [
        ...cq.questions,
        createFreshQuestion(cq.questions.length + 1, part.partNumber),
      ];
      cqList[cqIdx] = cq;
      part.contextQuestions = cqList;
      copy[pIdx] = part;
      return copy;
    });
  };

  const handleRemoveQuestion = (pIdx, cqIdx, qIdx) => {
    setFormParts((prev) => {
      const copy = [...prev];
      const part = { ...copy[pIdx] };
      const cqList = [...part.contextQuestions];
      const cq = { ...cqList[cqIdx] };
      if (cq.questions.length <= 1) {
        setToast({ type: 'warning', message: 'Cụm câu hỏi phải có ít nhất 1 câu hỏi!' });
        return prev;
      }
      cq.questions = cq.questions.filter((_, idx) => idx !== qIdx);
      cqList[cqIdx] = cq;
      part.contextQuestions = cqList;
      copy[pIdx] = part;
      return copy;
    });
  };

  const handleUpdateQuestionField = (pIdx, cqIdx, qIdx, field, value) => {
    setFormParts((prev) => {
      const copy = [...prev];
      const part = { ...copy[pIdx] };
      const cqList = [...part.contextQuestions];
      const cq = { ...cqList[cqIdx] };
      const qList = [...cq.questions];
      qList[qIdx] = { ...qList[qIdx], [field]: value };
      cq.questions = qList;
      cqList[cqIdx] = cq;
      part.contextQuestions = cqList;
      copy[pIdx] = part;
      return copy;
    });
  };

  const handleUpdateContextField = (pIdx, cqIdx, field, value) => {
    setFormParts((prev) => {
      const copy = [...prev];
      const part = { ...copy[pIdx] };
      const cqList = [...part.contextQuestions];
      cqList[cqIdx] = { ...cqList[cqIdx], [field]: value };
      part.contextQuestions = cqList;
      copy[pIdx] = part;
      return copy;
    });
  };

  // Upload file từ máy tính lên Cloudinary qua Backend API (POST /api/admin/media/upload)
  const handleFileUpload = async (e, pIdx, cqIdx, fieldType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentKey = `${pIdx}-${cqIdx}-${fieldType}`;
    setUploadingKey(currentKey);

    try {
      const currentCq = formParts[pIdx]?.contextQuestions?.[cqIdx];
      const oldUrl = fieldType === 'audio' ? currentCq?.audioUrl : currentCq?.imageUrl;
      const uploadedUrl = await uploadMediaFile(file, formTitle || 'TOEIC Test', fieldType, oldUrl);
      handleUpdateContextField(pIdx, cqIdx, fieldType === 'audio' ? 'audioUrl' : 'imageUrl', uploadedUrl);
      setToast({
        type: 'success',
        message: `Tải lên ${fieldType === 'audio' ? 'file âm thanh' : 'hình ảnh'} thành công!`,
      });
    } catch (err) {
      console.error('Upload media error:', err);
      setToast({
        type: 'error',
        message:
          err.response?.data?.message ||
          err.message ||
          'Lỗi khi tải file lên máy chủ (Vui lòng đảm bảo Backend đã chạy API POST /api/admin/media/upload).',
      });
    } finally {
      setUploadingKey(null);
      e.target.value = ''; // Reset input để có thể chọn lại cùng 1 file
    }
  };

  const activePart = formParts[activePartIndex] || formParts[0];

  return (
    <div className="admin-page py-8 min-h-screen bg-gray-50">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="container">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <BookOpen size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-primary text-xs">Hệ Thống Quản Trị</span>
                  <span className="badge badge-neutral text-xs">Admin Portal</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 m-0">Quản Lý Đề Thi TOEIC</h1>
                <p className="m-0 text-sm text-slate-500">
                  Soạn thảo, tạo mới câu hỏi và cập nhật đề thi thử cho học viên ({totalElements} đề
                  thi hiện có)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/courses" className="btn btn-outline btn-sm inline-flex items-center gap-1.5">
              <ExternalLink size={15} /> Xem thư viện học viên
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm inline-flex items-center gap-1.5 font-bold shadow-sm"
              onClick={handleOpenCreateModal}
            >
              <Plus size={16} /> Soạn đề thi mới
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
          <div className="inline-flex items-center gap-2 px-5 py-3 font-bold text-sm text-emerald-600 border-b-3 border-emerald-600 -mb-0.5 cursor-default">
            <BookOpen size={18} /> Quản lý Đề thi
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-black">
              {totalElements}
            </span>
          </div>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-5 py-3 font-semibold text-sm text-slate-500 hover:text-slate-900 border-b-3 border-transparent -mb-0.5 transition-all"
          >
            <Users size={18} /> Quản lý Người dùng
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đề thi (ví dụ: ETS 2026)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="createdAt">Sắp xếp: Ngày tạo</option>
              <option value="titleTest">Sắp xếp: Tên đề thi</option>
            </select>

            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 outline-none"
            >
              <option value="DESC">Mới nhất trước</option>
              <option value="ASC">Cũ nhất trước</option>
            </select>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => fetchTests(true)}
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Tests Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 rounded-full border-3 border-slate-200 border-t-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Đang nạp danh sách đề thi từ database...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-16 px-4">
              <BookOpen size={48} className="text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Chưa có đề thi nào</h3>
              <p className="text-slate-500 text-sm mb-4">
                Không tìm thấy bài thi phù hợp với từ khóa "{searchInput}".
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
                onClick={handleOpenCreateModal}
              >
                <Plus size={15} /> Soạn đề thi đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase">
                    <th className="px-5 py-3.5 w-20 text-center">STT</th>
                    <th className="px-5 py-3.5">Tên bộ đề thi</th>
                    <th className="px-5 py-3.5">Cụm câu hỏi</th>
                    <th className="px-5 py-3.5">Thời lượng</th>
                    <th className="px-5 py-3.5">Ngày tạo</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const createdStr = test.createdAt
                      ? new Date(test.createdAt).toLocaleDateString('vi-VN')
                      : 'Hệ thống';
                    const contextCount = test.contextQuestions?.length || 0;

                    return (
                      <tr
                        key={test.id}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-5 py-4 text-center font-bold text-slate-500">
                          #{stt.toString().padStart(2, '0')}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                              <FileText size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{test.titleTest}</div>
                              <span className="badge badge-primary text-[10px] px-1.5 py-0.5 mt-0.5">
                                Format ETS TOEIC
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                            <Layers size={15} className="text-emerald-600" /> {contextCount} cụm
                            phần
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={15} className="text-slate-400" /> 120 phút
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={14} /> {createdStr}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              to={`/courses/${test.id}`}
                              title="Xem trang chi tiết"
                              className="btn btn-sm btn-outline p-2"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <Link
                              to={`/courses/${test.id}/take`}
                              title="Làm thử bài thi"
                              className="btn btn-sm btn-outline p-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                              <PlayCircle size={14} />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline px-3 py-1.5 gap-1.5 font-bold inline-flex items-center"
                              onClick={() => handleOpenEditModal(test)}
                            >
                              <Edit2 size={14} /> Sửa đề
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline px-3 py-1.5 gap-1.5 font-bold inline-flex items-center text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleOpenDeleteModal(test)}
                            >
                              <Trash2 size={14} /> Xóa đề
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE TOEIC EXAM BUILDER MODAL (CREATE & EDIT)                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title={
          builderMode === 'create'
            ? 'Soạn thảo & Khởi tạo Đề thi TOEIC mới'
            : `Chỉnh sửa toàn bộ Đề thi: "${selectedTest?.titleTest}"`
        }
        maxWidth="980px"
      >
        <form onSubmit={handleSaveExam} className="flex flex-col gap-5">
          {/* Test Basic Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tên Bộ Đề Thi TOEIC <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: ETS TOEIC 2026 - Test 01"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-base font-bold text-slate-900 bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Part Selection & Tabs Bar */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Các phần thi trong đề ({formParts.length} phần):
              </span>

              {/* Add Part Dropdown / Button */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                  const isAdded = formParts.some((p) => p.partNumber === pNum);
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handleAddPart(pNum)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                        isAdded
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                      title={`Thêm hoặc chuyển tới Part ${pNum}`}
                    >
                      + Part {pNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Part Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-b border-slate-200">
              {formParts.map((part, idx) => {
                const isActive = idx === activePartIndex;
                const totalQInPart = part.contextQuestions.reduce(
                  (acc, cq) => acc + (cq.questions?.length || 0),
                  0
                );

                return (
                  <div
                    key={part.partNumber}
                    onClick={() => setActivePartIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm cursor-pointer border-t border-l border-r transition-all ${
                      isActive
                        ? 'bg-white border-slate-300 text-emerald-700 shadow-xs'
                        : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200/80'
                    }`}
                  >
                    <span>Part {part.partNumber}</span>
                    <span className="bg-slate-200 text-slate-700 text-[11px] px-1.5 py-0.5 rounded-full font-bold">
                      {totalQInPart} câu
                    </span>
                    {formParts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePart(idx);
                        }}
                        className="text-slate-400 hover:text-red-600 ml-1 p-0.5 rounded-sm"
                        title="Xóa phần này khỏi đề thi"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PART DETAILS BUILDER */}
          {activePart && (
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-base m-0">
                    {PART_DEFINITIONS[activePart.partNumber]?.name || `Part ${activePart.partNumber}`}
                  </h4>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    {activePart.partNumber <= 4
                      ? 'Phần thi Nghe hiểu (Listening): Hỗ trợ chèn file âm thanh Audio MP3 và lời thoại Transcript'
                      : 'Phần thi Đọc hiểu (Reading): Hỗ trợ chèn đoạn văn bản Paragraph và câu hỏi ngữ pháp từ vựng'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddContextQuestion(activePartIndex)}
                  className="btn btn-outline btn-sm text-xs font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 inline-flex items-center gap-1.5"
                >
                  <PlusCircle size={14} /> + Thêm Cụm Câu Hỏi (Context)
                </button>
              </div>

              {/* Context Questions List */}
              <div className="space-y-6">
                {activePart.contextQuestions.map((cq, cqIdx) => (
                  <div
                    key={cqIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Layers size={14} className="text-emerald-600" />
                        Cụm câu hỏi #{cqIdx + 1} ({cq.questions.length} câu hỏi)
                      </span>

                      {activePart.contextQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveContextQuestion(activePartIndex, cqIdx)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1"
                        >
                          <Trash2 size={13} /> Xóa cụm này
                        </button>
                      )}
                    </div>

                    {/* Audio & Image URLs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Audio URL & Upload */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-600">
                            Đường dẫn file Audio (URL âm thanh MP3):
                          </label>
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-all shadow-2xs">
                            <UploadCloud size={13} />
                            {uploadingKey === `${activePartIndex}-${cqIdx}-audio` ? 'Đang tải lên...' : 'Tải MP3 từ máy'}
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a"
                              className="hidden"
                              disabled={uploadingKey === `${activePartIndex}-${cqIdx}-audio`}
                              onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'audio')}
                            />
                          </label>
                        </div>
                        <div className="relative">
                          <Volume2
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="https://.../audio.mp3 hoặc bấm nút tải MP3 ở trên"
                            value={cq.audioUrl || ''}
                            onChange={(e) =>
                              handleUpdateContextField(
                                activePartIndex,
                                cqIdx,
                                'audioUrl',
                                e.target.value
                              )
                            }
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs bg-white outline-none"
                          />
                        </div>
                        {cq.audioUrl && (
                          <audio
                            src={cq.audioUrl}
                            controls
                            className="w-full h-8 mt-2 rounded-md"
                          />
                        )}
                      </div>

                      {/* Image URL & Upload */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-600">
                            Đường dẫn Hình ảnh (URL ảnh minh họa):
                          </label>
                          <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition-all shadow-2xs">
                            <UploadCloud size={13} />
                            {uploadingKey === `${activePartIndex}-${cqIdx}-image` ? 'Đang tải lên...' : 'Tải ảnh từ máy'}
                            <input
                              type="file"
                              accept="image/*,.jpg,.jpeg,.png,.webp"
                              className="hidden"
                              disabled={uploadingKey === `${activePartIndex}-${cqIdx}-image`}
                              onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'image')}
                            />
                          </label>
                        </div>
                        <div className="relative">
                          <ImageIcon
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder="https://.../image.jpg hoặc bấm nút tải ảnh ở trên"
                            value={cq.imageUrl || ''}
                            onChange={(e) =>
                              handleUpdateContextField(
                                activePartIndex,
                                cqIdx,
                                'imageUrl',
                                e.target.value
                              )
                            }
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs bg-white outline-none"
                          />
                        </div>
                        {cq.imageUrl && (
                          <img
                            src={cq.imageUrl}
                            alt="Minh họa câu hỏi"
                            className="h-20 object-contain mt-2 border border-slate-200 rounded-md bg-white p-1"
                            onError={(e) => (e.target.style.display = 'none')}
                          />
                        )}
                      </div>
                    </div>

                    {/* Paragraph Reading (Part 6, 7) */}
                    {activePart.partNumber >= 6 && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Đoạn văn đọc hiểu (Reading Passage / Paragraph):
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Nhập nội dung đoạn văn, email, thông báo, bài báo..."
                          value={cq.paragraph || ''}
                          onChange={(e) =>
                            handleUpdateContextField(
                              activePartIndex,
                              cqIdx,
                              'paragraph',
                              e.target.value
                            )
                          }
                          className="w-full p-3 rounded-lg border border-slate-300 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                    )}

                    {/* Transcript (Part 1, 2, 3, 4) */}
                    {activePart.partNumber <= 4 && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Lời thoại nghe (Audio Transcript):
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Lời thoại của người nói trong đoạn ghi âm..."
                          value={cq.transcript || ''}
                          onChange={(e) =>
                            handleUpdateContextField(
                              activePartIndex,
                              cqIdx,
                              'transcript',
                              e.target.value
                            )
                          }
                          className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white outline-none"
                        />
                      </div>
                    )}

                    {/* Questions List Inside This Context */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Danh sách câu hỏi trắc nghiệm ({cq.questions.length} câu):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddQuestion(activePartIndex, cqIdx)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                        >
                          <Plus size={13} /> + Thêm câu hỏi
                        </button>
                      </div>

                      {cq.questions.map((q, qIdx) => (
                        <div
                          key={qIdx}
                          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                              Câu hỏi #{qIdx + 1}
                            </span>
                            {cq.questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveQuestion(activePartIndex, cqIdx, qIdx)
                                }
                                className="text-xs text-red-500 hover:text-red-700"
                                title="Xóa câu hỏi này"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>

                          {/* Question Content */}
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Nhập nội dung câu hỏi (ví dụ: What is the purpose of the email?)..."
                              value={q.questionContent || ''}
                              onChange={(e) =>
                                handleUpdateQuestionField(
                                  activePartIndex,
                                  cqIdx,
                                  qIdx,
                                  'questionContent',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500"
                            />
                          </div>

                          {/* Options A, B, C, D */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-600 w-4">A.</span>
                              <input
                                type="text"
                                required
                                placeholder="Nội dung lựa chọn A"
                                value={q.optionA || ''}
                                onChange={(e) =>
                                  handleUpdateQuestionField(
                                    activePartIndex,
                                    cqIdx,
                                    qIdx,
                                    'optionA',
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-600 w-4">B.</span>
                              <input
                                type="text"
                                required
                                placeholder="Nội dung lựa chọn B"
                                value={q.optionB || ''}
                                onChange={(e) =>
                                  handleUpdateQuestionField(
                                    activePartIndex,
                                    cqIdx,
                                    qIdx,
                                    'optionB',
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-600 w-4">C.</span>
                              <input
                                type="text"
                                placeholder="Nội dung lựa chọn C"
                                value={q.optionC || ''}
                                onChange={(e) =>
                                  handleUpdateQuestionField(
                                    activePartIndex,
                                    cqIdx,
                                    qIdx,
                                    'optionC',
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-600 w-4">D.</span>
                              <input
                                type="text"
                                placeholder="Nội dung lựa chọn D"
                                value={q.optionD || ''}
                                onChange={(e) =>
                                  handleUpdateQuestionField(
                                    activePartIndex,
                                    cqIdx,
                                    qIdx,
                                    'optionD',
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none"
                              />
                            </div>
                          </div>

                          {/* Correct Answer & Explanation */}
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Đáp án đúng:</span>
                              {['A', 'B', 'C', 'D'].map((opt) => {
                                const isCorrect = (q.correctAnswer || 'A') === opt;
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() =>
                                      handleUpdateQuestionField(
                                        activePartIndex,
                                        cqIdx,
                                        qIdx,
                                        'correctAnswer',
                                        opt
                                      )
                                    }
                                    className={`w-7 h-7 rounded-md font-black text-xs transition-all ${
                                      isCorrect
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex-1 min-w-[200px]">
                              <input
                                type="text"
                                placeholder="Lời giải thích / Dịch nghĩa..."
                                value={q.explanation || ''}
                                onChange={(e) =>
                                  handleUpdateQuestionField(
                                    activePartIndex,
                                    cqIdx,
                                    qIdx,
                                    'explanation',
                                    e.target.value
                                  )
                                }
                                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              className="btn btn-outline"
              disabled={actionLoading}
              onClick={() => setBuilderOpen(false)}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary inline-flex items-center gap-2 px-6 font-bold"
              disabled={actionLoading}
            >
              <Save size={16} />
              {actionLoading
                ? 'Đang lưu dữ liệu...'
                : builderMode === 'create'
                ? 'Lưu & Khởi tạo Đề thi'
                : 'Lưu Cập nhật Đề thi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xác nhận xóa đề thi"
        maxWidth="460px"
      >
        <div className="text-center py-3">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-3" />
          <h4 className="m-0 mb-2 text-base font-bold text-slate-900">
            Bạn có chắc chắn muốn xóa bài thi này?
          </h4>
          <p className="m-0 mb-5 text-sm text-slate-500">
            Đề thi <strong>"{selectedTest?.titleTest}"</strong> cùng các câu hỏi sẽ bị xóa khỏi hệ
            thống.
          </p>

          <div className="flex justify-center gap-3">
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
              className="btn btn-danger inline-flex items-center gap-1.5"
              disabled={actionLoading}
              onClick={handleConfirmDelete}
            >
              <Trash2 size={16} /> {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestManagementPage;
