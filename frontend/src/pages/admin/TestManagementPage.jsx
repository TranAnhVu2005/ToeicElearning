import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  RefreshCw,
  PlusCircle,
  UploadCloud,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  Eye,
  Link2,
  Check,
  Headphones,
  MessageSquare,
  HelpCircle,
  Radio,
  Languages,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { examService } from '../../services/examService';
import { uploadMediaFile } from '../../services/uploadService';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';

import Toast from '../../components/common/Toast';
import {
  ETS_PART_DIRECTIONS,
  ETS_GENERAL_DIRECTIONS,
} from '../../constants/etsDirections';

// CẤU TRÚC ĐỀ THI TOEIC LISTENING & READING CHUẨN ETS MỚI NHẤT
export const ETS_STRUCTURE_SPECS = {
  1: {
    partNumber: 1,
    name: 'Part 1: Mô tả hình ảnh (Photographs)',
    skill: 'Listening',
    standardQuestions: 6,
    questionsPerContext: 1,
    totalContexts: 6,
    optionsCount: 4,
    hasImage: true,
    hasAudio: true,
    hasParagraph: false,
    hasTranscript: true,
    badgeColor: '#10b981',
    description:
      'Thí sinh xem 1 bức hình và nghe 4 câu mô tả A, B, C, D qua audio, chọn 1 câu đúng nhất mô tả đồ vật hoặc hành động người trong tranh.',
  },
  2: {
    partNumber: 2,
    name: 'Part 2: Hỏi & Đáp (Question - Response)',
    skill: 'Listening',
    standardQuestions: 25,
    questionsPerContext: 1,
    totalContexts: 25,
    optionsCount: 3, // ĐẶC BIỆT: CHỈ CÓ 3 LỰA CHỌN A, B, C THEO CHUẨN ETS!
    hasImage: false,
    hasAudio: true,
    hasParagraph: false,
    hasTranscript: true,
    badgeColor: '#0ea5e9',
    description:
      'Thí sinh nghe 1 câu hỏi/nhận định và 3 câu phản hồi A, B, C. LƯU Ý CHUẨN ETS: Chỉ có 3 lựa chọn A, B, C (KHÔNG có đáp án D).',
  },
  3: {
    partNumber: 3,
    name: 'Part 3: Đoạn hội thoại ngắn (Short Conversations)',
    skill: 'Listening',
    standardQuestions: 39,
    questionsPerContext: 3,
    totalContexts: 13, // 13 đoạn x 3 câu = 39 câu
    optionsCount: 4,
    hasImage: true, // Biểu đồ / hình ảnh đính kèm nếu có
    hasAudio: true,
    hasParagraph: false,
    hasTranscript: true,
    badgeColor: '#8b5cf6',
    description:
      '13 đoạn hội thoại (2-3 người đối thoại), mỗi đoạn kèm đúng 3 câu hỏi trắc nghiệm A, B, C, D.',
  },
  4: {
    partNumber: 4,
    name: 'Part 4: Bài nói ngắn / Độc thoại (Short Talks)',
    skill: 'Listening',
    standardQuestions: 30,
    questionsPerContext: 3,
    totalContexts: 10, // 10 bài độc thoại x 3 câu = 30 câu
    optionsCount: 4,
    hasImage: true,
    hasAudio: true,
    hasParagraph: false,
    hasTranscript: true,
    badgeColor: '#f59e0b',
    description:
      '10 bài nói chuyện ngắn / thông báo độc thoại, mỗi bài kèm đúng 3 câu hỏi trắc nghiệm A, B, C, D.',
  },
  5: {
    partNumber: 5,
    name: 'Part 5: Hoàn chỉnh câu (Incomplete Sentences)',
    skill: 'Reading',
    standardQuestions: 30,
    questionsPerContext: 1,
    totalContexts: 30,
    optionsCount: 4,
    hasImage: false,
    hasAudio: false,
    hasParagraph: false,
    hasTranscript: false,
    badgeColor: '#059669',
    description:
      '30 câu hỏi độc lập đánh giá ngữ pháp và từ vựng thực tế trong môi trường doanh nghiệp, 4 lựa chọn A, B, C, D.',
  },
  6: {
    partNumber: 6,
    name: 'Part 6: Hoàn chỉnh đoạn văn (Text Completion)',
    skill: 'Reading',
    standardQuestions: 16,
    questionsPerContext: 4,
    totalContexts: 4, // 4 đoạn văn x 4 câu = 16 câu
    optionsCount: 4,
    hasImage: false,
    hasAudio: false,
    hasParagraph: true,
    hasTranscript: false,
    badgeColor: '#0284c7',
    description:
      '4 đoạn văn (thư tín, thông báo, bản tin), mỗi đoạn gồm 4 chỗ trống cần điền từ/câu, tổng cộng 16 câu.',
  },
  7: {
    partNumber: 7,
    name: 'Part 7: Đọc hiểu văn bản (Reading Comprehension)',
    skill: 'Reading',
    standardQuestions: 54, // 29 câu đoạn đơn + 25 câu đoạn đa
    questionsPerContext: 4,
    totalContexts: 15, // 10 bài đơn + 5 bài kép/ba
    optionsCount: 4,
    hasImage: true,
    hasAudio: false,
    hasParagraph: true,
    hasTranscript: false,
    badgeColor: '#dc2626',
    description:
      '54 câu hỏi: Gồm 10 bài đọc đơn (29 câu) và 5 nhóm bài đọc đôi/ba (25 câu: 2 bài đoạn đôi và 3 bài đoạn ba).',
  },
};

const PART_DEFINITIONS = Object.fromEntries(
  Object.entries(ETS_STRUCTURE_SPECS).map(([num, spec]) => [
    num,
    {
      name: spec.name,
      type: spec.skill.toLowerCase(),
      defaultQCount: spec.questionsPerContext,
    },
  ])
);

const createFreshQuestion = (qNum = 1, partNumber = 1) => {
  const isPart2 = partNumber === 2;

  let defaultContent = '';
  let defaultOptA = '';
  let defaultOptB = '';
  let defaultOptC = '';
  let defaultOptD = '';
  let defaultCorrectAnswer = 'A';
  let defaultExplanation = '';

  if (partNumber === 1) {
    // Theo chuẩn ETS: Đề thi không in câu hỏi chữ và 4 lựa chọn cho Part 1
    defaultContent = 'Select the statement that best describes what you see in the picture.';
    defaultOptA = '(A)';
    defaultOptB = '(B)';
    defaultOptC = '(C)';
    defaultOptD = '(D)';
    defaultCorrectAnswer = 'A';
    defaultExplanation = '';
  } else if (isPart2) {
    // Theo chuẩn ETS: Đề thi không in câu hỏi chữ cho Part 2, chỉ có 3 phương án A, B, C
    defaultContent = 'Mark your answer on your answer sheet.';
    defaultOptA = '(A)';
    defaultOptB = '(B)';
    defaultOptC = '(C)';
    defaultOptD = '';
    defaultCorrectAnswer = 'A';
    defaultExplanation = '';
  }

  return {
    questionContent: defaultContent,
    optionA: defaultOptA,
    optionB: defaultOptB,
    optionC: defaultOptC,
    optionD: isPart2 ? '' : defaultOptD,
    correctAnswer: defaultCorrectAnswer,
    explanation: defaultExplanation,
  };
};

const createFreshContextQuestion = (partNumber = 1) => {
  const spec = ETS_STRUCTURE_SPECS[partNumber] || ETS_STRUCTURE_SPECS[1];
  const qCount = spec.questionsPerContext || 1;

  const questions = Array.from({ length: qCount }, (_, i) =>
    createFreshQuestion(i + 1, partNumber)
  );

  return {
    audioUrl: '',
    imageUrl: '',
    paragraph: '',
    transcript: '',
    translation: '',
    questions,
  };
};

// Khởi tạo Part 1 có sẵn đúng 6 câu trống chuẩn ETS (6 Audio, 6 Ảnh, 4 đáp án cố định A, B, C, D)
export const createFreshPart1Blank = () => ({
  partNumber: 1,
  contextQuestions: Array.from({ length: 6 }, (_, i) => ({
    audioUrl: '',
    imageUrl: '',
    paragraph: '',
    transcript: '',
    translation: '',
    questions: [
      {
        questionContent: 'Select the statement that best describes what you see in the picture.',
        optionA: '(A)',
        optionB: '(B)',
        optionC: '(C)',
        optionD: '(D)',
        correctAnswer: 'A',
        explanation: '',
      },
    ],
  })),
});

// Khởi tạo Part 2 có sẵn đúng 25 câu trống chuẩn ETS (Câu 7 -> 31, mỗi câu 1 Audio lẻ, KHÔNG ẢNH, 3 đáp án cố định A, B, C)
export const createFreshPart2Blank = () => ({
  partNumber: 2,
  contextQuestions: Array.from({ length: 25 }, (_, i) => ({
    audioUrl: '',
    imageUrl: '',
    paragraph: '',
    transcript: '',
    translation: '',
    questions: [
      {
        questionContent: 'Mark your answer on your answer sheet.',
        optionA: '(A)',
        optionB: '(B)',
        optionC: '(C)',
        optionD: '',
        correctAnswer: 'A',
        explanation: '',
      },
    ],
  })),
});

// Khởi tạo Part 3 có sẵn đúng 13 bài nghe (Câu 32 -> 70, mỗi bài 1 Audio chung + 3 câu hỏi có nội dung A, B, C, D)
export const createFreshPart3Blank = () => ({
  partNumber: 3,
  contextQuestions: Array.from({ length: 13 }, (_, i) => ({
    audioUrl: '',
    imageUrl: '', // Ảnh biểu đồ/lịch trình tùy chọn
    paragraph: '',
    transcript: '',
    translation: '',
    questions: Array.from({ length: 3 }, (_, qIdx) => ({
      questionContent: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
    })),
  })),
});

// Khởi tạo Part 4 có sẵn đúng 10 bài nghe (Câu 71 -> 100, mỗi bài 1 Audio chung + 3 câu hỏi có nội dung A, B, C, D)
export const createFreshPart4Blank = () => ({
  partNumber: 4,
  contextQuestions: Array.from({ length: 10 }, (_, i) => ({
    audioUrl: '',
    imageUrl: '', // Ảnh minh họa/bảng biểu tùy chọn
    paragraph: '',
    transcript: '',
    translation: '',
    questions: Array.from({ length: 3 }, (_, qIdx) => ({
      questionContent: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
    })),
  })),
});

// Khởi tạo trọn bộ 100 câu Listening (Part 1 -> Part 4) trống chuẩn ETS
export const createFreshListening100Blank = () => [
  createFreshPart1Blank(),
  createFreshPart2Blank(),
  createFreshPart3Blank(),
  createFreshPart4Blank(),
];

const createFreshPart = (partNumber = 1) => {
  if (partNumber === 1) return createFreshPart1Blank();
  if (partNumber === 2) return createFreshPart2Blank();
  if (partNumber === 3) return createFreshPart3Blank();
  if (partNumber === 4) return createFreshPart4Blank();
  return {
    partNumber,
    contextQuestions: [createFreshContextQuestion(partNumber)],
  };
};

// Hàm tạo trọn bộ 1 Part theo số lượng câu chuẩn ETS
export const createFullETSPart = (partNumber = 1) => {
  const spec = ETS_STRUCTURE_SPECS[partNumber] || ETS_STRUCTURE_SPECS[1];
  const contexts = [];

  if (partNumber === 1) {
    // 6 ảnh x 1 câu = 6 câu có sẵn chỗ trống chuẩn bị up 6 audio và 6 ảnh
    return createFreshPart1Blank();
  } else if (partNumber === 2) {
    // 25 câu hỏi x 1 câu = 25 câu (3 lựa chọn A, B, C)
    return createFreshPart2Blank();
  } else if (partNumber === 3) {
    // 13 đoạn hội thoại x 3 câu = 39 câu
    return createFreshPart3Blank();
  } else if (partNumber === 4) {
    // 10 bài độc thoại x 3 câu = 30 câu
    return createFreshPart4Blank();
  } else if (partNumber === 5) {
    // 30 câu độc lập = 30 câu
    for (let i = 1; i <= 30; i++) {
      contexts.push({
        audioUrl: '',
        imageUrl: '',
        paragraph: '',
        transcript: '',
        questions: [createFreshQuestion(i + 100, 5)],
      });
    }
  } else if (partNumber === 6) {
    // 4 đoạn văn x 4 câu = 16 câu
    for (let i = 1; i <= 4; i++) {
      contexts.push({
        audioUrl: '',
        imageUrl: '',
        paragraph: '',
        transcript: '',
        questions: [
          createFreshQuestion(1, 6),
          createFreshQuestion(2, 6),
          createFreshQuestion(3, 6),
          createFreshQuestion(4, 6),
        ],
      });
    }
  } else if (partNumber === 7) {
    // 54 câu: 10 bài đơn (29 câu) + 5 bài đôi/ba (25 câu)
    const singlePassageQCounts = [2, 2, 3, 3, 3, 3, 3, 3, 3, 4]; // 29 câu
    singlePassageQCounts.forEach((qCount) => {
      contexts.push({
        audioUrl: '',
        imageUrl: '',
        paragraph: '',
        transcript: '',
        questions: Array.from({ length: qCount }, (_, qIdx) => createFreshQuestion(qIdx + 1, 7)),
      });
    });

    // 5 bài đọc đa đoạn (2 bài đoạn đôi + 3 bài đoạn ba): mỗi bài đúng 5 câu = 25 câu
    for (let i = 1; i <= 5; i++) {
      contexts.push({
        audioUrl: '',
        imageUrl: '',
        paragraph: '',
        transcript: '',
        questions: Array.from({ length: 5 }, (_, qIdx) => createFreshQuestion(qIdx + 1, 7)),
      });
    }
  }

  return {
    partNumber,
    contextQuestions: contexts,
  };
};

// Hàm khởi tạo toàn bộ Full Test 200 câu chuẩn ETS mới nhất 100%
export const createFull200QuestionETSTest = () => {
  return [1, 2, 3, 4, 5, 6, 7].map((pNum) => createFullETSPart(pNum));
};

// Hàm khởi tạo Mini Test rút gọn 50 câu theo đúng tỷ lệ chuẩn ETS (hoàn toàn trống sẵn sàng nhập)
export const createMiniETSTest50Questions = () => {
  return [
    {
      partNumber: 1,
      contextQuestions: Array.from({ length: 3 }, () => ({
        ...createFreshContextQuestion(1),
        transcript: '',
      })),
    },
    {
      partNumber: 2,
      contextQuestions: Array.from({ length: 7 }, () => ({
        ...createFreshContextQuestion(2),
        transcript: '',
      })),
    },
    {
      partNumber: 3,
      contextQuestions: Array.from({ length: 3 }, () => ({
        ...createFreshContextQuestion(3),
        transcript: '',
      })),
    },
    {
      partNumber: 4,
      contextQuestions: Array.from({ length: 2 }, () => ({
        ...createFreshContextQuestion(4),
        transcript: '',
      })),
    },
    {
      partNumber: 5,
      contextQuestions: Array.from({ length: 8 }, () => ({
        ...createFreshContextQuestion(5),
      })),
    },
    {
      partNumber: 6,
      contextQuestions: [createFreshContextQuestion(6)],
    },
    {
      partNumber: 7,
      contextQuestions: [
        {
          ...createFreshContextQuestion(7),
          paragraph: '',
          questions: [createFreshQuestion(1, 7), createFreshQuestion(2, 7), createFreshQuestion(3, 7)],
        },
        {
          ...createFreshContextQuestion(7),
          paragraph: '',
          questions: [createFreshQuestion(1, 7), createFreshQuestion(2, 7), createFreshQuestion(3, 7)],
        },
        {
          ...createFreshContextQuestion(7),
          paragraph: '',
          questions: [createFreshQuestion(1, 7), createFreshQuestion(2, 7)],
        },
        {
          ...createFreshContextQuestion(7),
          paragraph: '',
          questions: Array.from({ length: 5 }, (_, idx) => createFreshQuestion(idx + 1, 7)),
        },
      ],
    },
  ];
};

const TestManagementPage = () => {
  const { isAdmin, isTeacher } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Status Tab Filter: 'PUBLISHED' | 'DRAFT'
  const [statusTab, setStatusTab] = useState('PUBLISHED');

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
  const [formStatus, setFormStatus] = useState('PUBLISHED'); // 'DRAFT' | 'PUBLISHED'
  const [formParts, setFormParts] = useState([createFreshPart(1), createFreshPart(5)]);
  const [activePartIndex, setActivePartIndex] = useState(0);

  // ETS Guide Modal State
  const [etsGuideOpen, setEtsGuideOpen] = useState(false);
  const [showPartDirections, setShowPartDirections] = useState(true);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // File Uploading State
  const [uploadingKey, setUploadingKey] = useState(null);

  // Modal phóng to xem ảnh sắc nét
  const [previewImageModalUrl, setPreviewImageModalUrl] = useState(null);

  // Toggle ẩn/hiện ô dán link URL thủ công
  const [showUrlInputs, setShowUrlInputs] = useState({});
  const toggleShowUrl = (key) => {
    setShowUrlInputs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-Save and Draft Recovery (Hybrid Architecture: 5s Client LocalStorage + 30s Smart Server Sync)
  const AUTOSAVE_STORAGE_KEY = 'toeic_exam_studio_autosave';
  const isDirtyRef = useRef(false);
  const markDirty = () => {
    isDirtyRef.current = true;
  };
  const [autoSaveState, setAutoSaveState] = useState({
    status: 'idle', // 'idle' | 'saving' | 'saved' | 'synced_server'
    savedAt: null,
  });
  const [recoverableDraft, setRecoverableDraft] = useState(null);

  const handleRestoreDraft = () => {
    if (!recoverableDraft) return;
    if (recoverableDraft.formTitle) setFormTitle(recoverableDraft.formTitle);
    if (recoverableDraft.formStatus) setFormStatus(recoverableDraft.formStatus);
    if (recoverableDraft.formParts && Array.isArray(recoverableDraft.formParts)) {
      setFormParts(recoverableDraft.formParts);
    }
    setToast({
      type: 'success',
      message: 'Đã khôi phục toàn bộ nội dung bản nháp từ bộ nhớ trình duyệt!',
    });
    setRecoverableDraft(null);
  };

  const handleDismissDraft = () => {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setRecoverableDraft(null);
  };

  const clearAutosaveDraft = () => {
    try {
      localStorage.removeItem(AUTOSAVE_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setRecoverableDraft(null);
    setAutoSaveState({ status: 'saved', savedAt: new Date() });
  };

  // Tính toán số lượng câu hỏi và đối chiếu chuẩn ETS trực tiếp
  const etsMetrics = useMemo(() => {
    let listeningCount = 0;
    let readingCount = 0;
    const partCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

    formParts.forEach((p) => {
      const pNum = p.partNumber;
      let countInPart = 0;
      (p.contextQuestions || []).forEach((cq) => {
        countInPart += cq.questions?.length || 0;
      });
      partCounts[pNum] = (partCounts[pNum] || 0) + countInPart;
      if (pNum <= 4) {
        listeningCount += countInPart;
      } else {
        readingCount += countInPart;
      }
    });

    const totalCount = listeningCount + readingCount;

    return {
      totalCount,
      listeningCount,
      readingCount,
      partCounts,
      isFullETS:
        totalCount === 200 &&
        listeningCount === 100 &&
        readingCount === 100 &&
        partCounts[1] === 6 &&
        partCounts[2] === 25 &&
        partCounts[3] === 39 &&
        partCounts[4] === 30 &&
        partCounts[5] === 30 &&
        partCounts[6] === 16 &&
        partCounts[7] === 54,
    };
  }, [formParts]);

  // Áp dụng khung đề Full Test 200 câu chuẩn ETS
  const handleApplyFullETSTest = () => {
    markDirty();
    const fullParts = createFull200QuestionETSTest();
    setFormParts(fullParts);
    setActivePartIndex(0);
    setToast({
      type: 'success',
      message: 'Đã khởi tạo khung đề thi FULL TEST 200 câu chuẩn ETS mới nhất (100 câu Listening + 100 câu Reading)!',
    });
  };

  // Áp dụng khung đề Mini Test 50 câu
  const handleApplyMiniETSTest = () => {
    markDirty();
    const miniParts = createMiniETSTest50Questions();
    setFormParts(miniParts);
    setActivePartIndex(0);
    setToast({
      type: 'info',
      message: 'Đã khởi tạo khung Mini Test 50 câu rút gọn theo tỷ lệ chuẩn ETS!',
    });
  };

  // Thêm trọn bộ 1 Part theo chuẩn số câu ETS
  const handleAddFullETSPart = (partNum) => {
    markDirty();
    const fullPart = createFullETSPart(partNum);
    setFormParts((prev) => {
      const filtered = prev.filter((p) => p.partNumber !== partNum);
      return [...filtered, fullPart].sort((a, b) => a.partNumber - b.partNumber);
    });
    const targetIdx = formParts.findIndex((p) => p.partNumber === partNum);
    setActivePartIndex(targetIdx !== -1 ? targetIdx : formParts.length);
    setToast({
      type: 'success',
      message: `Đã khởi tạo trọn bộ Part ${partNum} theo đúng chuẩn số lượng câu hỏi ETS (${ETS_STRUCTURE_SPECS[partNum].standardQuestions} câu)!`,
    });
  };

  // Khởi tạo lại 6 câu trống chuẩn Part 1
  const handleResetPart1To6 = () => {
    markDirty();
    setFormParts((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx !== activePartIndex) return p;
        return createFreshPart1Blank();
      })
    );
    setToast({
      type: 'info',
      message: 'Đã thiết lập Part 1 sẵn sàng với đúng 6 câu hỏi tranh (6 Audio, 6 Ảnh, A-B-C-D trống)!',
    });
  };

  // Khởi tạo lại 25 câu trống chuẩn Part 2 (bảo toàn các câu đã có)
  const handleResetPart2To25 = () => {
    markDirty();
    setFormParts((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx !== activePartIndex) return p;
        const existing = p.contextQuestions || [];
        if (existing.length >= 25) return p;
        const remainingCount = 25 - existing.length;
        const newContexts = Array.from({ length: remainingCount }, () => createFreshContextQuestion(2));
        return {
          ...p,
          contextQuestions: [...existing, ...newContexts],
        };
      })
    );
    setToast({
      type: 'info',
      message: 'Đã bổ sung đủ 25 câu phản hồi chuẩn Part 2 (bảo toàn nguyên vẹn các câu đã có)!',
    });
  };

  // Khởi tạo lại 13 đoạn hội thoại chuẩn Part 3 (39 câu) (bảo toàn các câu đã có)
  const handleResetPart3To13 = () => {
    markDirty();
    setFormParts((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx !== activePartIndex) return p;
        const existing = p.contextQuestions || [];
        if (existing.length >= 13) return p;
        const remainingCount = 13 - existing.length;
        const newContexts = Array.from({ length: remainingCount }, () => createFreshContextQuestion(3));
        return {
          ...p,
          contextQuestions: [...existing, ...newContexts],
        };
      })
    );
    setToast({
      type: 'info',
      message: 'Đã bổ sung đủ 13 đoạn hội thoại chuẩn Part 3 (bảo toàn nguyên vẹn các câu đã có)!',
    });
  };

  // Khởi tạo lại 10 bài nói ngắn chuẩn Part 4 (30 câu) (bảo toàn các câu đã có)
  const handleResetPart4To10 = () => {
    markDirty();
    setFormParts((prev) =>
      prev.map((p, pIdx) => {
        if (pIdx !== activePartIndex) return p;
        const existing = p.contextQuestions || [];
        if (existing.length >= 10) return p;
        const remainingCount = 10 - existing.length;
        const newContexts = Array.from({ length: remainingCount }, () => createFreshContextQuestion(4));
        return {
          ...p,
          contextQuestions: [...existing, ...newContexts],
        };
      })
    );
    setToast({
      type: 'info',
      message: 'Đã bổ sung đủ 10 bài nói ngắn chuẩn Part 4 (bảo toàn nguyên vẹn các câu đã có)!',
    });
  };

  // Chuẩn hóa Part đang chọn về đúng cấu trúc chuẩn ETS
  const handleResetActivePartToBlank = () => {
    const activeP = formParts[activePartIndex];
    if (!activeP) return;
    const pNum = activeP.partNumber;
    if (pNum === 1) handleResetPart1To6();
    else if (pNum === 2) handleResetPart2To25();
    else if (pNum === 3) handleResetPart3To13();
    else if (pNum === 4) handleResetPart4To10();
    else handleAddFullETSPart(pNum);
  };

  // Khởi tạo trọn bộ 100 câu Listening (Part 1 -> Part 4) trống
  const handleResetToListening100Blank = () => {
    markDirty();
    setFormParts(createFreshListening100Blank());
    setActivePartIndex(0);
    setToast({
      type: 'success',
      message: 'Đã khởi tạo trọn bộ 100 câu Listening TOEIC (Part 1, 2, 3, 4) sẵn sàng tải Audio, Ảnh và nhập đáp án!',
    });
  };

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

  // Fetch tests with status filter
  const fetchTests = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const res = await examService.getTests(
          currentPage,
          pageSize,
          debouncedKeyword,
          sortBy,
          direction,
          statusTab
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
    [currentPage, pageSize, debouncedKeyword, sortBy, direction, statusTab]
  );


  useEffect(() => {
    fetchTests(true);
  }, [fetchTests]);

  // Open Create Builder
  const handleOpenCreateModal = () => {
    setBuilderMode('create');
    setSelectedTest(null);
    setFormTitle(`ETS TOEIC 2026 - Test ${(totalElements + 1).toString().padStart(2, '0')}`);
    setFormStatus('PUBLISHED');
    setFormParts([createFreshPart(1), createFreshPart(5)]);
    setActivePartIndex(0);
    setBuilderOpen(true);

    try {
      const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (!parsed.testId || parsed.testId === null) && parsed.savedAt && parsed.formParts?.length > 0) {
          setRecoverableDraft(parsed);
          setFormParts(parsed.formParts);
          if (parsed.formTitle) setFormTitle(parsed.formTitle);
          if (parsed.formStatus) setFormStatus(parsed.formStatus);
          setAutoSaveState({
            status: 'saved',
            savedAt: new Date(parsed.savedAt),
          });
          setToast({
            type: 'info',
            message: `✓ Đã tự động khôi phục bản nháp đang soạn thảo lúc ${new Date(parsed.savedAt).toLocaleTimeString('vi-VN')}!`,
          });
        } else {
          setRecoverableDraft(null);
        }
      } else {
        setRecoverableDraft(null);
      }
    } catch (e) {
      setRecoverableDraft(null);
    }
  };

  // Open Edit Builder
  const handleOpenEditModal = async (test) => {
    setBuilderMode('edit');
    setSelectedTest(test);
    setFormTitle(test.titleTest || '');
    setFormStatus(test.status || 'PUBLISHED');
    setActivePartIndex(0);
    setBuilderOpen(true);

    let localDraft = null;
    try {
      const saved = localStorage.getItem(AUTOSAVE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.testId === test.id && parsed.savedAt && parsed.formParts) {
          localDraft = parsed;
          setRecoverableDraft(parsed);
        } else {
          setRecoverableDraft(null);
        }
      } else {
        setRecoverableDraft(null);
      }
    } catch (e) {
      setRecoverableDraft(null);
    }

    try {
      setActionLoading(true);
      const res = await examService.getTestDetail(test.id);
      if (res.code === 1000 && res.data) {
        const fullTest = res.data;
        setFormTitle(fullTest.titleTest || test.titleTest || '');
        if (fullTest.status) {
          setFormStatus(fullTest.status);
        }

        // Group contextQuestions by partNumber
        const partMap = {};
        (fullTest.contextQuestions || []).forEach((cq, rawIdx) => {
          // Trích xuất Part Number và Thứ tự câu hỏi (Sequence Index / orderIndex)
          let seqIndex = null;
          let parsedPartNumber = null;

          // Ưu tiên 1: Trực tiếp lấy orderIndex đã lưu trong database
          if (cq.orderIndex !== undefined && cq.orderIndex !== null && cq.orderIndex > 0) {
            seqIndex = cq.orderIndex;
          }

          const tagMatch = cq.paragraph?.match(/<!--CQ_SEQ:(?:P(\d+):I)?(\d+)-->/);
          if (tagMatch) {
            if (tagMatch[1]) parsedPartNumber = parseInt(tagMatch[1], 10);
            if (seqIndex === null) seqIndex = parseInt(tagMatch[2], 10);
          }

          let pNum = parsedPartNumber;
          if (!pNum && cq.part?.namePart) {
            pNum = parseInt(cq.part.namePart.replace(/\D/g, '')) || null;
          }

          // Ưu tiên 2: Xác định Part chuẩn xác 100% qua orderIndex hoặc questionNumber (chuẩn ETS 2026)
          if (!pNum) {
            const firstQNum = cq.questions?.[0]?.questionNumber;
            const refNum = (seqIndex && seqIndex > 0) ? seqIndex : (firstQNum && firstQNum > 0 ? firstQNum : null);
            if (refNum && refNum > 0) {
              if (refNum >= 1 && refNum <= 6) pNum = 1;
              else if (refNum >= 7 && refNum <= 31) pNum = 2;
              else if (refNum >= 32 && refNum <= 70) pNum = 3;
              else if (refNum >= 71 && refNum <= 100) pNum = 4;
              else if (refNum >= 101 && refNum <= 130) pNum = 5;
              else if (refNum >= 131 && refNum <= 146) pNum = 6;
              else if (refNum >= 147) pNum = 7;
            }
          }

          if (!pNum) {
            // Heuristic dự phòng cho dữ liệu cũ không có thứ tự
            const q0 = cq.questions?.[0];
            const qCount = cq.questions?.length || 0;
            if (cq.imageUrl && (!cq.paragraph || cq.paragraph.trim() === '') && qCount === 1) {
              pNum = 1;
            } else if (qCount === 1 && (!q0?.optionD || q0?.optionD.trim() === '')) {
              pNum = 2;
            } else if (qCount === 3) {
              pNum = cq.transcript?.toLowerCase().includes('talk') || cq.transcript?.toLowerCase().includes('announcement') ? 4 : 3;
            } else if (qCount === 4 && cq.paragraph) {
              pNum = 6;
            } else if (cq.paragraph && !cq.audioUrl) {
              pNum = 7;
            } else {
              pNum = 5;
            }
          }

          if (!partMap[pNum]) {
            partMap[pNum] = {
              partNumber: pNum,
              contextQuestions: [],
            };
          }

          if (seqIndex === null) {
            // Phục hồi thứ tự thông minh cho các câu hỏi đã lưu trước đây:
            if (pNum === 1) {
              if (cq.imageUrl?.includes('jr8avpv1t07h5onbd1lg') || cq.transcript?.includes('tray of food') || cq.transcript?.includes('wearing a jacket')) {
                seqIndex = 0;
              } else if (cq.imageUrl?.includes('ni7cfw4nrybfiyw7jbno') || cq.transcript?.includes('filing cabinet') || cq.transcript?.includes('looking at a book')) {
                seqIndex = 1;
              } else if (cq.imageUrl?.includes('punzfz0kyesbdmqcmeyp') || cq.transcript?.includes('phone up to her ear') || cq.transcript?.includes('pouring a beverage')) {
                seqIndex = 2;
              } else if (cq.imageUrl?.includes('dzrumhmqeboueoetml2a') || cq.transcript?.includes('wooden crate') || cq.transcript?.includes('vegetables')) {
                seqIndex = 3;
              } else if (cq.imageUrl?.includes('k8za9txlmfok3pxwlfe6') || cq.transcript?.includes('Painting supplies') || cq.transcript?.includes('can of paint')) {
                seqIndex = 4;
              } else if (cq.imageUrl?.includes('rnfufvsgmvyoy7lk1qz7') || cq.transcript?.includes('fallen branches') || cq.transcript?.includes('pooled on a path')) {
                seqIndex = 5;
              }
            } else if (pNum === 2) {
              const qMatch = cq.transcript?.match(/Question #(\d+)/i);
              if (qMatch) seqIndex = parseInt(qMatch[1], 10);
            } else if (pNum === 3) {
              const qMatch = cq.transcript?.match(/Questions? (\d+)/i);
              if (qMatch) seqIndex = parseInt(qMatch[1], 10);
            } else if (pNum === 4) {
              const qMatch = cq.transcript?.match(/Questions? (\d+)/i);
              if (qMatch) seqIndex = parseInt(qMatch[1], 10);
            }
            if (seqIndex === null || isNaN(seqIndex)) {
              seqIndex = rawIdx;
            }
          }

          const cleanParagraph = (cq.paragraph || '').replace(/<!--CQ_SEQ:[^>]+-->\n?/, '');

          const rawTranscript = cq.transcript || '';
          let parsedTranscript = rawTranscript;
          let parsedTranslation = cq.translation || cq.transcriptTranslation || '';
          if (!parsedTranslation && rawTranscript.includes('--- BẢN DỊCH TIẾNG VIỆT ---')) {
            const parts = rawTranscript.split(/---\s*BẢN DỊCH TIẾNG VIỆT\s*---/i);
            parsedTranscript = parts[0]?.trim() || '';
            parsedTranslation = parts[1]?.trim() || '';
          } else if (!parsedTranslation && rawTranscript.includes('<!--TRANSLATION-->')) {
            const parts = rawTranscript.split(/<!--TRANSLATION-->/i);
            parsedTranscript = parts[0]?.trim() || '';
            parsedTranslation = parts[1]?.trim() || '';
          }

          partMap[pNum].contextQuestions.push({
            _seqIndex: seqIndex,
            audioUrl: cq.audioUrl || '',
            imageUrl: cq.imageUrl || '',
            paragraph: cleanParagraph,
            transcript: parsedTranscript,
            translation: parsedTranslation,
            questions:
              cq.questions && cq.questions.length > 0
                ? cq.questions.map((q) => ({
                    questionContent:
                      q.questionContent ||
                      (pNum === 1
                        ? 'Select the statement that best describes what you see in the picture.'
                        : ''),
                    optionA: pNum === 1 ? '(A)' : q.optionA || '',
                    optionB: pNum === 1 ? '(B)' : q.optionB || '',
                    optionC: pNum === 1 ? '(C)' : q.optionC || '',
                    optionD: pNum === 1 ? '(D)' : q.optionD || '',
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
          // Sắp xếp contextQuestions trong từng Part theo đúng thứ tự câu (_seqIndex)
          partsArr.forEach((p) => {
            p.contextQuestions.sort((a, b) => (a._seqIndex ?? 0) - (b._seqIndex ?? 0));
          });

          // LUÔN LUÔN ƯU TIÊN NẠP DỮ LIỆU GỐC MỚI NHẤT TỪ MÁY CHỦ CSDL (Server Database Single Source of Truth)
          setFormParts(partsArr);
          isDirtyRef.current = false;

          // Nếu có bản nháp trên trình duyệt, chỉ bật banner thông báo để người dùng chủ động khôi phục nếu muốn
          if (localDraft && localDraft.formParts && localDraft.formParts.length > 0) {
            setRecoverableDraft(localDraft);
            setToast({
              type: 'info',
              message: `Đã nạp 100% dữ liệu gốc từ máy chủ CSDL. Phát hiện có bản nháp trình duyệt lúc ${new Date(localDraft.savedAt).toLocaleTimeString('vi-VN')} nếu bạn cần khôi phục.`,
            });
          } else {
            setRecoverableDraft(null);
          }
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

  // Tải lại dữ liệu tươi mới từ máy chủ CSDL và xóa sạch bản nháp cache trình duyệt
  const handleReloadFromServer = async () => {
    if (!selectedTest?.id) return;
    try {
      clearAutosaveDraft();
      await handleOpenEditModal(selectedTest);
      setToast({
        type: 'success',
        message: '✓ Đã làm mới 100% dữ liệu từ máy chủ CSDL thành công!',
      });
    } catch (err) {
      console.error('Reload from server error:', err);
      setToast({
        type: 'error',
        message: 'Không thể tải lại dữ liệu từ máy chủ.',
      });
    }
  };

  // Toggle Publish / Draft status
  const handleTogglePublish = async (test) => {
    try {
      setActionLoading(true);
      if (test.status === 'PUBLISHED') {
        const res = await examService.draftTest(test.id);
        if (res.code === 1000) {
          setToast({
            type: 'info',
            message: `Đã thu hồi đề thi "${test.titleTest}" về Bản nháp!`,
          });
          fetchTests(false);
        } else {
          setToast({ type: 'error', message: res.message || 'Không thể chuyển về bản nháp.' });
        }
      } else {
        const res = await examService.publishTest(test.id);
        if (res.code === 1000) {
          setToast({
            type: 'success',
            message: `Đã xuất bản đề thi "${test.titleTest}" thành công!`,
          });
          fetchTests(false);
        } else {
          setToast({ type: 'error', message: res.message || 'Không thể xuất bản đề thi.' });
        }
      }
    } catch (err) {
      console.error('Toggle publish status error:', err);
      setToast({
        type: 'error',
        message: err.response?.data?.message || 'Lỗi khi cập nhật trạng thái đề thi.',
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

  // TẦNG 1: Tự động lưu bản nháp vào LocalStorage mỗi 5s / sau khi ngừng gõ (debounce 1.5s, 0% tải Server)
  useEffect(() => {
    if (!builderOpen) return;
    if (!formTitle && (!formParts || formParts.length === 0)) return;

    setAutoSaveState((prev) => ({ ...prev, status: 'saving' }));
    const timer = setTimeout(() => {
      try {
        const draftData = {
          testId: selectedTest?.id || null,
          builderMode,
          formTitle,
          formStatus,
          formParts,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(draftData));
        setAutoSaveState((prev) => ({
          status: prev.status === 'synced_server' ? 'synced_server' : 'saved',
          savedAt: new Date(),
        }));
      } catch (err) {
        console.warn('Auto-save LocalStorage error:', err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formTitle, formStatus, formParts, builderMode, selectedTest?.id, builderOpen]);

  // TẦNG 2: Đồng bộ ngầm thông minh lên máy chủ sau mỗi 30s (Chỉ chạy khi có thay đổi thực sự isDirty)
  useEffect(() => {
    if (!builderOpen) return;

    const syncTimer = setInterval(() => {
      // Chỉ tự động đồng bộ khi người dùng THỰC SỰ gõ phím/chỉnh sửa (isDirtyRef.current = true)
      if (isDirtyRef.current && formTitle?.trim() && !actionLoading) {
        // Bảo toàn trạng thái hiện tại (formStatus), tuyệt đối KHÔNG ép về DRAFT
        handleSaveExam(null, formStatus, true, true);
        isDirtyRef.current = false;
      }
    }, 30000); // 30s chu kỳ an toàn cho Server Database

    return () => clearInterval(syncTimer);
  }, [builderOpen, formTitle, formStatus, formParts, builderMode, selectedTest, actionLoading]);

  // Phím tắt Ctrl + S để lưu tức thời lên máy chủ (Tầng 3: On-Demand)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        if (builderOpen) {
          e.preventDefault();
          // Lưu bảo toàn đúng trạng thái formStatus (PUBLISHED / DRAFT)
          handleSaveExam(null, formStatus, true, false);
          isDirtyRef.current = false;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [builderOpen, formTitle, formStatus, formParts, builderMode, selectedTest]);

  // Đóng modal an toàn: Cảnh báo người dùng nếu có thay đổi chưa lưu lên máy chủ CSDL
  const handleCloseBuilder = async () => {
    if (isDirtyRef.current && formTitle?.trim() && !actionLoading) {
      const confirmClose = window.confirm(
        'Bạn có những thay đổi chưa được lưu lên máy chủ CSDL. Bạn có muốn lưu trước khi đóng không?\n\n' +
        '• [OK]: Lưu ngay lên máy chủ rồi đóng.\n' +
        '• [Cancel]: Giữ bản nháp trên trình duyệt và đóng.'
      );
      if (confirmClose) {
        try {
          await handleSaveExam(null, formStatus, false, false);
        } catch (err) {
          console.warn('Auto-save on close error:', err);
        }
      }
    }
    isDirtyRef.current = false;
    setBuilderOpen(false);
  };

  // Submit Exam Builder (Create / Edit)
  // forcedStatus: 'DRAFT' | 'PUBLISHED' | null
  // keepOpen: boolean - nếu true thì giữ nguyên modal để tiếp tục nhập liệu
  // isSilent: boolean - nếu true thì không bắn Toast (dùng cho Auto-Sync ngầm máy chủ)
  const handleSaveExam = async (e, forcedStatus = null, keepOpen = false, isSilent = false) => {
    if (e && e.preventDefault) e.preventDefault();

    const targetStatus = forcedStatus || formStatus;

    if (!formTitle?.trim()) {
      if (!isSilent) setToast({ type: 'error', message: 'Vui lòng nhập tên đề thi!' });
      return;
    }

    if (!formParts || formParts.length === 0) {
      if (!isSilent) setToast({ type: 'error', message: 'Bộ đề thi phải có ít nhất 1 phần (Part)!' });
      return;
    }

    // Nếu người dùng chọn Xuất bản (PUBLISHED), kiểm tra xem có câu hỏi nào bị bỏ trống không
    if (targetStatus === 'PUBLISHED') {
      let emptyQuestionsCount = 0;
      for (const part of formParts) {
        if (part.partNumber !== 1 && part.partNumber !== 2) {
          for (const cq of part.contextQuestions || []) {
            for (const q of cq.questions || []) {
              if (
                !q.questionContent?.trim() ||
                !q.optionA?.trim() ||
                !q.optionB?.trim() ||
                !q.optionC?.trim() ||
                (part.partNumber !== 2 && !q.optionD?.trim())
              ) {
                emptyQuestionsCount++;
              }
            }
          }
        }
      }

      if (emptyQuestionsCount > 0) {
        // Cảnh báo thông minh: Đề xuất chuyển thành DRAFT để lưu nháp an toàn
        const confirmSaveAsDraft = window.confirm(
          `Phát hiện có ${emptyQuestionsCount} câu hỏi (trong Part 3, 4 hoặc các phần khác) chưa điền đủ nội dung hoặc phương án.\n\n` +
            `Khuyên dùng: Bạn có muốn lưu dưới dạng BẢN NHÁP (DRAFT) để tiếp tục bổ sung sau không?\n\n` +
            `• Nhấn [OK]: Chuyển sang BẢN NHÁP (DRAFT) và lưu ngay lập tức.\n` +
            `• Nhấn [Cancel]: Ở lại chỉnh sửa tiếp.`
        );
        if (confirmSaveAsDraft) {
          return handleSaveExam(null, 'DRAFT', keepOpen);
        } else {
          return;
        }
      }
    }

    try {
      setActionLoading(true);
      // Clean payload: Đảm bảo Part 2 không mang theo dữ liệu thừa của Option D
      // Đồng thời gắn orderIndex (số câu bắt đầu của cụm: 1..6, 7..31, 32, 35, 38...) và questionNumber (1..200)
      const getPartStartNumber = (pNum) => {
        switch (pNum) {
          case 1: return 1;
          case 2: return 7;
          case 3: return 32;
          case 4: return 71;
          case 5: return 101;
          case 6: return 131;
          case 7: return 147;
          default: return 1;
        }
      };

      const cleanedParts = formParts.map((part) => {
        let runningQNum = getPartStartNumber(part.partNumber);

        const processedContextQuestions = (part.contextQuestions || []).map((cq) => {
          const cleanParagraph = (cq.paragraph || '').replace(/<!--CQ_SEQ:[^>]+-->\n?/, '').trim();
          const startQOfContext = runningQNum;

          const cleanTranscript = (cq.transcript || '').trim();
          const cleanTranslation = (cq.translation || cq.transcriptTranslation || '').trim();

          // Dự phòng kép: Luôn đính kèm bản dịch vào transcript với thẻ chuẩn để bảo toàn 100% trong mọi trường hợp
          let safeTranscript = cleanTranscript;
          if (cleanTranslation && !safeTranscript.includes('--- BẢN DỊCH TIẾNG VIỆT ---')) {
            safeTranscript = `${cleanTranscript}\n\n--- BẢN DỊCH TIẾNG VIỆT ---\n${cleanTranslation}`;
          }

          const questionsWithNumbers = (cq.questions || []).map((q) => {
            const currentQNum = runningQNum++;
            let qContent = (q.questionContent || '').trim();
            let optA = (q.optionA || '').trim();
            let optB = (q.optionB || '').trim();
            let optC = (q.optionC || '').trim();
            let optD = part.partNumber === 2 ? '' : (q.optionD || '').trim();
            let corrAns = q.correctAnswer || 'A';

            if (part.partNumber === 1) {
              // Part 1 theo chuẩn ETS: Thí sinh nhìn hình và nghe audio, đề thi KHÔNG in câu hỏi chữ
              if (!qContent) {
                qContent = 'Select the statement that best describes what you see in the picture.';
              }
              // 4 đáp án Part 1 luôn luôn là 4 giá trị (A), (B), (C), (D) cố định
              optA = '(A)';
              optB = '(B)';
              optC = '(C)';
              optD = '(D)';
            } else if (part.partNumber === 2) {
              // Part 2 theo chuẩn ETS: Câu hỏi và 3 câu đáp án nằm hoàn toàn trong audio
              if (!qContent) {
                qContent = 'Mark your answer on your answer sheet.';
              }
              optA = '(A)';
              optB = '(B)';
              optC = '(C)';
              optD = ''; // Part 2 ETS tuyệt đối KHÔNG có lựa chọn D!
              if (corrAns === 'D') {
                corrAns = 'A';
              }
            }

            return {
              ...q,
              questionNumber: currentQNum,
              questionContent: qContent,
              optionA: optA,
              optionB: optB,
              optionC: optC,
              optionD: optD,
              correctAnswer: corrAns,
              explanation: (q.explanation || '').trim(),
            };
          });

          return {
            ...cq,
            orderIndex: startQOfContext,
            paragraph: cleanParagraph,
            transcript: safeTranscript,
            translation: cleanTranslation,
            questions: questionsWithNumbers,
          };
        });

        return {
          ...part,
          contextQuestions: processedContextQuestions,
        };
      });

      const payload = {
        titleTest: formTitle.trim(),
        status: targetStatus,
        parts: cleanedParts,
      };

      if (builderMode === 'create') {
        const res = await examService.createTest(payload);
        if (res.code === 1000) {
          if (!keepOpen && targetStatus === 'PUBLISHED') {
            clearAutosaveDraft();
          }
          isDirtyRef.current = false;
          if (!isSilent) {
            setToast({
              type: 'success',
              message: `Tạo bộ đề thi "${formTitle.trim()}" (${targetStatus === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}) thành công!`,
            });
          }
          setAutoSaveState({
            status: 'synced_server',
            savedAt: new Date(),
          });
          setFormStatus(targetStatus);
          if (keepOpen) {
            // Chuyển sang edit mode và lấy ID của test vừa tạo
            await fetchTests(false);
            const updatedRes = await examService.getTests(1, 10, formTitle.trim(), 'createdAt', 'DESC');
            if (updatedRes?.code === 1000 && updatedRes?.data?.data?.length > 0) {
              const matchedTest = updatedRes.data.data.find((t) => t.titleTest === formTitle.trim()) || updatedRes.data.data[0];
              setSelectedTest(matchedTest);
              setBuilderMode('edit');
              // Cập nhật lại testId vào draftData để các lần tự lưu tiếp theo chuẩn ID
              try {
                const currentDraft = {
                  testId: matchedTest.id,
                  builderMode: 'edit',
                  formTitle,
                  formStatus: targetStatus,
                  formParts,
                  savedAt: new Date().toISOString(),
                };
                localStorage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(currentDraft));
              } catch (e) {
                console.warn('Update draft after create error:', e);
              }
            }
          } else {
            setBuilderOpen(false);
            fetchTests(false);
          }
        } else {
          if (!isSilent) setToast({ type: 'error', message: res.message || 'Không thể tạo đề thi.' });
        }
      } else {
        const res = await examService.updateTest(selectedTest.id, payload);
        if (res.code === 1000) {
          if (!keepOpen && targetStatus === 'PUBLISHED') {
            clearAutosaveDraft();
          }
          isDirtyRef.current = false;
          if (!isSilent) {
            setToast({
              type: 'success',
              message: `Cập nhật toàn bộ đề thi "${formTitle.trim()}" (${targetStatus === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}) thành công!`,
            });
          }
          setAutoSaveState({
            status: 'synced_server',
            savedAt: new Date(),
          });
          setFormStatus(targetStatus);
          if (!keepOpen) {
            setBuilderOpen(false);
          }
          fetchTests(false);
        } else {
          if (!isSilent) setToast({ type: 'error', message: res.message || 'Không thể cập nhật đề thi.' });
        }
      }
    } catch (err) {
      console.error('Save exam error:', err);
      const msg =
        err.response?.data?.message ||
        'Máy chủ báo lỗi khi lưu đề thi. Vui lòng kiểm tra ràng buộc dữ liệu backend.';
      if (!isSilent) setToast({ type: 'error', message: msg });
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
    markDirty();
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
    markDirty();
    if (formParts.length <= 1) {
      setToast({ type: 'warning', message: 'Bộ đề thi phải có ít nhất 1 phần (Part)!' });
      return;
    }
    setFormParts((prev) => prev.filter((_, idx) => idx !== partIndex));
    setActivePartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleAddContextQuestion = (pIdx) => {
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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
    markDirty();
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

  // GIAO DIỆN CHUYÊN BIỆT CHO PART 1: 6 CÂU HỎI TRANH CHUẨN EDTECH STUDIO QUỐC TẾ
  const renderPart1QuestionsBuilder = () => {
    return (
      <div className="space-y-6">
        {/* Quick Question Navigation Bar & Studio Overview */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm border border-emerald-500/30">
                P1
              </span>
              <div>
                <h4 className="m-0 text-sm font-bold text-white flex items-center gap-2">
                  <span>Part 1: Photographs Studio</span>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    6 Câu hỏi tranh độc lập • Chuẩn ETS 2026
                  </span>
                </h4>
                <p className="m-0 text-xs text-slate-400 mt-0.5">
                  Mỗi câu gồm 1 File MP3 riêng lẻ + 1 Bức tranh. Thí sinh nghe 4 phương án (A, B, C, D).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetPart1To6}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              title="Thiết lập lại đủ 6 câu hỏi tranh có sẵn chỗ trống"
            >
              <RotateCcw size={13} className="text-emerald-400" /> Chuẩn hóa 6 câu Part 1
            </button>
          </div>

          {/* Quick Nav Jump Pills (Câu 1 đến Câu 6) */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400">Chuyển nhanh đến câu:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {activePart.contextQuestions.map((cq, idx) => {
                const q = cq.questions?.[0];
                const isComplete = Boolean(cq.imageUrl && cq.audioUrl && q?.correctAnswer);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`p1-card-${idx}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 border ${
                      isComplete
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isComplete ? 'bg-emerald-400 ring-2 ring-emerald-400/30' : 'bg-amber-400'
                      }`}
                    />
                    <span>Câu {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách 6 Cards Câu Hỏi Tranh Chuyên Nghiệp */}
        <div className="space-y-6">
          {activePart.contextQuestions.map((cq, cqIdx) => {
            const q = cq.questions?.[0] || {
              questionContent: 'Select the statement that best describes what you see in the picture.',
              optionA: '(A)',
              optionB: '(B)',
              optionC: '(C)',
              optionD: '(D)',
              correctAnswer: 'A',
              explanation: '',
            };

            const hasImage = Boolean(cq.imageUrl);
            const hasAudio = Boolean(cq.audioUrl);
            const hasTranscript = Boolean(cq.transcript?.trim());
            const hasExplanation = Boolean(q.explanation?.trim());

            const imageKey = `p1-${cqIdx}-image`;
            const audioKey = `p1-${cqIdx}-audio`;
            const showImageInput = showUrlInputs[imageKey];
            const showAudioInput = showUrlInputs[audioKey];

            return (
              <div
                key={cqIdx}
                id={`p1-card-${cqIdx}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-6 space-y-6 relative border-l-4 border-l-emerald-500"
              >
                {/* Header Card Thanh Lịch */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white font-black text-xs px-3 py-1.5 rounded-lg tracking-wider flex items-center gap-1.5 shadow-xs">
                      <span>CÂU {String(cqIdx + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Photographs Question #{cqIdx + 1}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        1 Audio MP3 • 1 Bức Ảnh • 4 Lựa chọn (A, B, C, D)
                      </span>
                    </div>
                  </div>

                  {/* Status Badges & Quick Action */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasImage
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasImage ? '✓ Đã có ảnh' : 'Chưa có ảnh'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasAudio
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasAudio ? '✓ Đã có audio' : 'Chưa có audio'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasTranscript
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasTranscript ? '✓ Transcript' : 'Chưa transcript'}
                    </span>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                      Đáp án: <strong>({q.correctAnswer || 'A'})</strong>
                    </span>

                    {activePart.contextQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContextQuestion(activePartIndex, cqIdx)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all ml-1"
                        title="Xóa câu hỏi tranh này"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body 2 Cột Cân Đối (Media Studio vs Key & Content) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                  {/* CỘT TRÁI: ĐA PHƯƠNG TIỆN (5/12) */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* 1. Bức Ảnh Minh Họa (Photograph) */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <ImageIcon size={14} className="text-blue-600" />
                          <span>Bức ảnh Câu #{cqIdx + 1}</span>
                          <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                            Bắt buộc
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => toggleShowUrl(imageKey)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1"
                        >
                          <Link2 size={12} />
                          {showImageInput ? 'Ẩn ô dán URL' : 'Dán URL ảnh'}
                        </button>
                      </div>

                      {/* Ô dán URL (chỉ mở ra khi cần, không làm rối màn hình) */}
                      {showImageInput && (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="https://... dán đường dẫn ảnh trực tiếp vào đây..."
                            value={cq.imageUrl || ''}
                            onChange={(e) =>
                              handleUpdateContextField(activePartIndex, cqIdx, 'imageUrl', e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-blue-300 text-xs bg-blue-50/30 outline-none focus:border-blue-500 text-slate-800 font-mono"
                          />
                        </div>
                      )}

                      {/* Khung Ảnh Preview Cao Cấp */}
                      {hasImage ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden shadow-xs relative group">
                          <div className="h-52 w-full flex items-center justify-center p-2 bg-white">
                            <img
                              src={cq.imageUrl}
                              alt={`Bức ảnh câu ${cqIdx + 1}`}
                              className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          </div>

                          {/* Overlay Buttons Bar */}
                          <div className="p-2.5 bg-slate-900/90 backdrop-blur-xs flex items-center justify-between gap-2 border-t border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewImageModalUrl(cq.imageUrl)}
                                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition-all"
                                title="Phóng to xem chi tiết ảnh gốc"
                              >
                                <ZoomIn size={13} /> Phóng to
                              </button>

                              <label className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all">
                                <UploadCloud size={13} />
                                {uploadingKey === `${activePartIndex}-${cqIdx}-image`
                                  ? 'Đang tải...'
                                  : 'Đổi ảnh'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingKey === `${activePartIndex}-${cqIdx}-image`}
                                  onChange={(e) =>
                                    handleFileUpload(e, activePartIndex, cqIdx, 'image')
                                  }
                                />
                              </label>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateContextField(activePartIndex, cqIdx, 'imageUrl', '')
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all"
                              title="Xóa ảnh này"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Dropzone Khi Chưa Có Ảnh */
                        <label
                          className={`rounded-xl border-2 border-dashed p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                            uploadingKey === `${activePartIndex}-${cqIdx}-image`
                              ? 'border-blue-400 bg-blue-50/50'
                              : 'border-slate-300 hover:border-blue-500 bg-slate-50/70 hover:bg-blue-50/30'
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs">
                            <UploadCloud size={24} />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              {uploadingKey === `${activePartIndex}-${cqIdx}-image`
                                ? 'Đang tải ảnh lên Cloudinary...'
                                : `Tải bức ảnh cho Câu #${cqIdx + 1}`}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              Nhấn để chọn file JPG, PNG, WEBP từ máy tính
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingKey === `${activePartIndex}-${cqIdx}-image`}
                            onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'image')}
                          />
                        </label>
                      )}
                    </div>

                    {/* 2. File Âm Thanh Riêng Lẻ (Audio MP3) */}
                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Volume2 size={14} className="text-emerald-600" />
                          <span>File nghe MP3 Câu #{cqIdx + 1}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            Audio lẻ
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => toggleShowUrl(audioKey)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 inline-flex items-center gap-1"
                        >
                          <Link2 size={12} />
                          {showAudioInput ? 'Ẩn ô dán URL' : 'Dán URL MP3'}
                        </button>
                      </div>

                      {/* Ô dán URL audio (nếu cần) */}
                      {showAudioInput && (
                        <input
                          type="text"
                          placeholder="https://... dán link MP3 online vào đây..."
                          value={cq.audioUrl || ''}
                          onChange={(e) =>
                            handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-emerald-300 text-xs bg-emerald-50/30 outline-none focus:border-emerald-500 text-slate-800 font-mono"
                        />
                      )}

                      {/* Trình Phát Audio Hiện Đại */}
                      {hasAudio ? (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                              <Headphones size={13} className="text-emerald-600" /> Audio câu #{cqIdx + 1} sẵn sàng
                            </span>
                            <div className="flex items-center gap-2">
                              <label className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer">
                                {uploadingKey === `${activePartIndex}-${cqIdx}-audio`
                                  ? 'Đang tải...'
                                  : 'Đổi file MP3'}
                                <input
                                  type="file"
                                  accept="audio/*,.mp3,.wav,.m4a"
                                  className="hidden"
                                  disabled={uploadingKey === `${activePartIndex}-${cqIdx}-audio`}
                                  onChange={(e) =>
                                    handleFileUpload(e, activePartIndex, cqIdx, 'audio')
                                  }
                                />
                              </label>
                              <span className="text-slate-300">•</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', '')
                                }
                                className="text-[11px] font-semibold text-red-600 hover:underline"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                          <audio src={cq.audioUrl} controls className="w-full h-8 rounded-lg" />
                        </div>
                      ) : (
                        <label
                          className={`rounded-xl border-2 border-dashed p-4 text-center flex items-center justify-center gap-3 cursor-pointer transition-all ${
                            uploadingKey === `${activePartIndex}-${cqIdx}-audio`
                              ? 'border-emerald-400 bg-emerald-50/50'
                              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/30'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <Volume2 size={18} />
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800 block">
                              {uploadingKey === `${activePartIndex}-${cqIdx}-audio`
                                ? 'Đang tải audio lên...'
                                : `Tải file nghe MP3 Câu #${cqIdx + 1}`}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              Chọn file âm thanh phát 4 câu mô tả A, B, C, D
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a"
                            className="hidden"
                            disabled={uploadingKey === `${activePartIndex}-${cqIdx}-audio`}
                            onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'audio')}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* CỘT PHẢI: TRẮC NGHIỆM & TRANSCRIPT & GIẢI THÍCH (7/12) */}
                  <div className="lg:col-span-7 space-y-5 bg-slate-50/60 p-5 rounded-xl border border-slate-200/80">
                    {/* 1. KHU VỰC CHỌN ĐÁP ÁN ĐÚNG (TINH GỌN, CHUẨN INLINE) */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-200/80">
                      <div>
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle2 size={15} className="text-emerald-600" />
                          <span>Đáp án đúng câu #{cqIdx + 1}:</span>
                        </label>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          Chọn 1 trong 4 phương án cố định (A, B, C, D)
                        </span>
                      </div>

                      {/* 4 Nút Chọn Đáp Án Nhỏ Gọn & Sang Trọng */}
                      <div className="inline-flex p-1 rounded-xl bg-slate-200/70 border border-slate-300/80 gap-1.5 shadow-inner">
                        {['A', 'B', 'C', 'D'].map((opt) => {
                          const isSelected = (q.correctAnswer || 'A') === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'correctAnswer', opt);
                                handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionA', '(A)');
                                handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionB', '(B)');
                                handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionC', '(C)');
                                handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionD', '(D)');
                              }}
                              className={`w-10 h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-700 font-black scale-105'
                                  : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
                              }`}
                              title={`Chọn (${opt}) làm đáp án đúng`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. KHU VỰC LỜI THOẠI ÂM THANH (AUDIO TRANSCRIPT) */}
                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <FileText size={14} className="text-indigo-600" />
                          <span>Lời thoại âm thanh (Audio Transcript)</span>
                        </label>

                        {/* Smart Template Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const template = `(A) \n(B) \n(C) \n(D) `;
                            handleUpdateContextField(
                              activePartIndex,
                              cqIdx,
                              'transcript',
                              cq.transcript ? `${cq.transcript}\n${template}` : template
                            );
                          }}
                          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-all inline-flex items-center gap-1"
                          title="Tự động điền cấu trúc 4 dòng (A), (B), (C), (D) vào ô lời thoại"
                        >
                          <Sparkles size={11} /> + Mẫu nhanh (A)-(B)-(C)-(D)
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        placeholder={`Nhập toàn bộ transcript 4 câu mô tả nghe được trong audio của câu này. Ví dụ:
(A) The woman is carrying a tray of food.
(B) The woman is wearing a jacket.
(C) The woman is tying up her hair.
(D) The woman is removing her hat.`}
                        value={cq.transcript || ''}
                        onChange={(e) =>
                          handleUpdateContextField(activePartIndex, cqIdx, 'transcript', e.target.value)
                        }
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                      />
                    </div>

                    {/* 3. KHU VỰC GIẢI THÍCH CHI TIẾT & DỊCH NGHĨA TIẾNG VIỆT */}
                    <div className="space-y-2 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <BookOpen size={14} className="text-emerald-600" />
                          <span>Giải thích chi tiết & Dịch nghĩa tiếng Việt</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const template = `Dịch nghĩa các phương án:\n(A) \n(B) \n(C) \n(D) \n-> Giải thích: `;
                            handleUpdateQuestionField(
                              activePartIndex,
                              cqIdx,
                              0,
                              'explanation',
                              q.explanation ? `${q.explanation}\n${template}` : template
                            );
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-all inline-flex items-center gap-1"
                        >
                          <Sparkles size={11} /> + Mẫu dịch nghĩa
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Dịch nghĩa tiếng Việt, phân tích vì sao chọn đáp án này, các từ vựng trọng tâm trong bức tranh..."
                        value={q.explanation || ''}
                        onChange={(e) =>
                          handleUpdateQuestionField(
                            activePartIndex,
                            cqIdx,
                            0,
                            'explanation',
                            e.target.value
                          )
                        }
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút thêm câu nếu chưa đủ 6 câu */}
        {activePart.contextQuestions.length < 6 && (
          <div className="p-5 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 text-center space-y-2.5">
            <span className="text-xs font-bold text-emerald-900 block">
              Hiện tại Part 1 đang có {activePart.contextQuestions.length} / 6 câu hỏi tranh chuẩn ETS.
            </span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddContextQuestion(activePartIndex)}
                className="btn btn-primary btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> + Thêm Câu Hỏi Tranh (Câu #{activePart.contextQuestions.length + 1})
              </button>
              <button
                type="button"
                onClick={handleResetPart1To6}
                className="btn btn-outline btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Khởi tạo lại đủ 6 câu trống chuẩn Part 1
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==============================================================================
  // GIAO DIỆN CHUYÊN BIỆT CHO PART 2: 25 CÂU HỎI PHẢN HỒI (CÂU 7 - 31) CHUẨN ETS
  // ==============================================================================
  const renderPart2QuestionsBuilder = () => {
    return (
      <div className="space-y-6">
        {/* Quick Question Navigation Bar & Studio Overview */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-sm border border-sky-500/30">
                P2
              </span>
              <div>
                <h4 className="m-0 text-sm font-bold text-white flex items-center gap-2">
                  <span>Part 2: Question - Response Studio</span>
                  <span className="text-[11px] font-semibold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-500/30">
                    25 Câu hỏi phản hồi ngắn (Câu 07 - 31) • Chuẩn ETS 2026
                  </span>
                </h4>
                <p className="m-0 text-xs text-slate-400 mt-0.5">
                  Mỗi câu gồm 1 File MP3 riêng lẻ. Thí sinh nghe 1 câu hỏi và 3 phương án phản hồi (A, B, C). Không có đáp án D, không có hình ảnh.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetPart2To25}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              title="Khởi tạo lại đủ 25 câu hỏi phản hồi chuẩn Part 2"
            >
              <RotateCcw size={13} className="text-sky-400" /> Chuẩn hóa 25 câu Part 2
            </button>
          </div>

          {/* Quick Nav Jump Pills (Câu 7 đến Câu 31) */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400">Chuyển nhanh đến câu:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePart.contextQuestions.map((cq, idx) => {
                const q = cq.questions?.[0];
                const qNum = idx + 7;
                const isComplete = Boolean(cq.audioUrl && q?.correctAnswer);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`p2-card-${idx}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 border ${
                      isComplete
                        ? 'bg-sky-950/80 text-sky-300 border-sky-500/40 hover:bg-sky-900/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isComplete ? 'bg-sky-400 ring-2 ring-sky-400/30' : 'bg-amber-400'
                      }`}
                    />
                    <span>#{qNum}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách 25 Cards Câu Hỏi Part 2 Tinh Gọn */}
        <div className="space-y-4">
          {activePart.contextQuestions.map((cq, cqIdx) => {
            const q = cq.questions?.[0] || {
              questionContent: 'Mark your answer on your answer sheet.',
              optionA: '(A)',
              optionB: '(B)',
              optionC: '(C)',
              optionD: '',
              correctAnswer: 'A',
              explanation: '',
            };

            const qNum = cqIdx + 7;
            const hasAudio = Boolean(cq.audioUrl);
            const hasTranscript = Boolean(cq.transcript?.trim());
            const hasExplanation = Boolean(q.explanation?.trim());

            const audioKey = `p2-${cqIdx}-audio`;
            const showAudioInput = showUrlInputs[audioKey];

            return (
              <div
                key={cqIdx}
                id={`p2-card-${cqIdx}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all duration-200 p-5 space-y-4 relative border-l-4 border-l-sky-500"
              >
                {/* Header Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-slate-900 text-sky-400 font-black text-xs px-3 py-1 rounded-lg tracking-wider flex items-center gap-1 shadow-2xs">
                      <span>CÂU #{String(qNum).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Question - Response #{qNum}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        1 Audio MP3 riêng lẻ • 3 Lựa chọn (A, B, C)
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasAudio
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasAudio ? '✓ Đã có audio' : 'Chưa có audio'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasTranscript
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasTranscript ? '✓ Transcript' : 'Chưa transcript'}
                    </span>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-sky-100/80 text-sky-800 border border-sky-200">
                      Đáp án: <strong>({q.correctAnswer || 'A'})</strong>
                    </span>

                    {activePart.contextQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContextQuestion(activePartIndex, cqIdx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-all ml-1"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Hàng 1: Audio & Bộ Chọn Đáp Án Đúng (A, B, C) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
                  {/* Cột Trái: Trình Tải & Phát Audio (7/12) */}
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <Volume2 size={14} className="text-sky-600" />
                        <span>File Audio Câu #{qNum} (MP3 riêng lẻ)</span>
                        <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.5 rounded">
                          Bắt buộc
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleShowUrl(audioKey)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 inline-flex items-center gap-1"
                        >
                          <Link2 size={12} />
                          {showAudioInput ? 'Ẩn URL' : 'Dán URL MP3'}
                        </button>

                        <label
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                            uploadingKey === `${activePartIndex}-${cqIdx}-audio`
                              ? 'bg-slate-200 text-slate-400 border-slate-300'
                              : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-700 shadow-2xs'
                          }`}
                        >
                          <UploadCloud size={13} />
                          <span>{uploadingKey === `${activePartIndex}-${cqIdx}-audio` ? 'Đang tải...' : 'Tải MP3 từ máy'}</span>
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a"
                            className="hidden"
                            disabled={uploadingKey === `${activePartIndex}-${cqIdx}-audio`}
                            onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'audio')}
                          />
                        </label>
                      </div>
                    </div>

                    {showAudioInput && (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="https://... dán link mp3 trực tiếp vào đây..."
                          value={cq.audioUrl || ''}
                          onChange={(e) =>
                            handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-sky-300 text-xs bg-sky-50/30 outline-none focus:border-sky-500 text-slate-800 font-mono"
                        />
                      </div>
                    )}

                    {cq.audioUrl ? (
                      <div className="flex items-center gap-2 pt-1">
                        <audio src={cq.audioUrl} controls className="w-full h-8 rounded-md" />
                        <button
                          type="button"
                          onClick={() => handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', '')}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Xóa audio"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-600 block italic">
                        ⚠️ Chưa có file nghe MP3 cho câu #{qNum}. Hãy tải file hoặc dán URL.
                      </span>
                    )}
                  </div>

                  {/* Cột Phải: Bộ Chọn Đáp Án Đúng Chuẩn 3 Lựa Chọn (5/12) */}
                  <div className="lg:col-span-5 flex flex-col justify-center items-start lg:items-end border-t lg:border-t-0 lg:border-l border-slate-200/80 pt-3 lg:pt-0 lg:pl-5 space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 size={14} className="text-sky-600" />
                      <span>Đáp án đúng (Key):</span>
                    </label>
                    <span className="text-[11px] text-slate-400 block mb-1">
                      Part 2 chỉ có 3 phương án (A, B, C)
                    </span>

                    {/* 3 Nút A, B, C Inline Nhỏ Gọn */}
                    <div className="inline-flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/80 gap-1.5 shadow-inner">
                      {['A', 'B', 'C'].map((opt) => {
                        const isSelected = (q.correctAnswer || 'A') === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'correctAnswer', opt);
                              handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionA', '(A)');
                              handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionB', '(B)');
                              handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionC', '(C)');
                              handleUpdateQuestionField(activePartIndex, cqIdx, 0, 'optionD', '');
                            }}
                            className={`w-11 h-8 rounded-lg font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-sky-600 text-white shadow-xs ring-1 ring-sky-700 scale-105'
                                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-transparent'
                            }`}
                            title={`Chọn (${opt}) làm đáp án đúng cho câu #${qNum}`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Hàng 2: Transcript Âm Thanh & Giải Thích Chi Tiết (2 Cột) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                  {/* Transcript Âm Thanh (6/12) */}
                  <div className="lg:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <FileText size={13} className="text-indigo-600" />
                        <span>Lời thoại âm thanh (Transcript)</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const template = `Question: Where is the meeting room located?\n(A) At 10:00 A.M.\n(B) On the second floor, down the hall.\n(C) Yes, I attended it yesterday.`;
                          handleUpdateContextField(
                            activePartIndex,
                            cqIdx,
                            'transcript',
                            cq.transcript ? `${cq.transcript}\n${template}` : template
                          );
                        }}
                        className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-all inline-flex items-center gap-1"
                      >
                        <Sparkles size={11} /> + Mẫu thoại (Q - A - B - C)
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Dán nội dung câu hỏi và các lựa chọn phản hồi trong audio (tùy chọn)..."
                      value={cq.transcript || ''}
                      onChange={(e) =>
                        handleUpdateContextField(activePartIndex, cqIdx, 'transcript', e.target.value)
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                    />
                  </div>

                  {/* Giải Thích & Dịch Nghĩa (6/12) */}
                  <div className="lg:col-span-6 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                        <BookOpen size={13} className="text-sky-600" />
                        <span>Giải thích chi tiết & Bẫy cần tránh</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const template = `Dịch nghĩa: \n-> Phân tích: Đáp án đúng là (${q.correctAnswer || 'A'}) vì...\n-> Bẫy: `;
                          handleUpdateQuestionField(
                            activePartIndex,
                            cqIdx,
                            0,
                            'explanation',
                            q.explanation ? `${q.explanation}\n${template}` : template
                          );
                        }}
                        className="text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200 transition-all inline-flex items-center gap-1"
                      >
                        <Sparkles size={11} /> + Mẫu giải thích
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      placeholder="Dịch nghĩa câu hỏi, phân tích vì sao chọn đáp án này, giải thích bẫy đồng âm / lặp từ / trả lời Yes-No cho câu hỏi Wh-..."
                      value={q.explanation || ''}
                      onChange={(e) =>
                        handleUpdateQuestionField(
                          activePartIndex,
                          cqIdx,
                          0,
                          'explanation',
                          e.target.value
                        )
                      }
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút thêm câu nếu chưa đủ 25 câu */}
        {activePart.contextQuestions.length < 25 && (
          <div className="p-5 rounded-2xl border border-dashed border-sky-300 bg-sky-50/50 text-center space-y-2.5">
            <span className="text-xs font-bold text-sky-900 block">
              Hiện tại Part 2 đang có {activePart.contextQuestions.length} / 25 câu hỏi phản hồi chuẩn ETS.
            </span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddContextQuestion(activePartIndex)}
                className="btn btn-primary btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> + Thêm Câu Hỏi Lẻ (Câu #{activePart.contextQuestions.length + 7})
              </button>
              <button
                type="button"
                onClick={handleResetPart2To25}
                className="btn btn-outline btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Khởi tạo lại đủ 25 câu trống chuẩn Part 2
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==============================================================================
  // GIAO DIỆN CHUYÊN BIỆT CHO PART 3: 13 ĐOẠN HỘI THOẠI (CÂU 32 - 70) CHUẨN ETS
  // ==============================================================================
  const renderPart3QuestionsBuilder = () => {
    return (
      <div className="space-y-6">
        {/* Quick Question Navigation Bar & Studio Overview */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-sm border border-indigo-500/30">
                P3
              </span>
              <div>
                <h4 className="m-0 text-sm font-bold text-white flex items-center gap-2">
                  <span>Part 3: Short Conversations Studio</span>
                  <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    13 Đoạn hội thoại ngắn (Câu 32 - 70) • 39 Câu hỏi • Chuẩn ETS 2026
                  </span>
                </h4>
                <p className="m-0 text-xs text-slate-400 mt-0.5">
                  Mỗi đoạn hội thoại gồm 1 File MP3 phát chung cho cụm đúng 3 câu hỏi trắc nghiệm (A, B, C, D). Có thể đính kèm ảnh biểu đồ/lịch trình (Graphic).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetPart3To13}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              title="Khởi tạo lại đủ 13 đoạn hội thoại chuẩn Part 3"
            >
              <RotateCcw size={13} className="text-indigo-400" /> Chuẩn hóa 13 đoạn Part 3
            </button>
          </div>

          {/* Quick Nav Jump Pills (Đoạn 1 đến Đoạn 13) */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400">Chuyển nhanh đến bài nghe:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePart.contextQuestions.map((cq, idx) => {
                const startQ = 32 + idx * 3;
                const endQ = startQ + 2;
                const isComplete = Boolean(cq.audioUrl && cq.questions?.length >= 3 && cq.questions.every((q) => q.questionContent && q.correctAnswer));
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`p3-card-${idx}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 border ${
                      isComplete
                        ? 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 hover:bg-indigo-900/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isComplete ? 'bg-indigo-400 ring-2 ring-indigo-400/30' : 'bg-amber-400'
                      }`}
                    />
                    <span>Đoạn {idx + 1} ({startQ}-{endQ})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách 13 Đoạn Hội Thoại Part 3 */}
        <div className="space-y-6">
          {activePart.contextQuestions.map((cq, cqIdx) => {
            const startQ = 32 + cqIdx * 3;
            const endQ = startQ + 2;
            const hasAudio = Boolean(cq.audioUrl);
            const hasImage = Boolean(cq.imageUrl);
            const hasTranscript = Boolean(cq.transcript?.trim());
            const hasTranslation = Boolean((cq.translation || cq.transcriptTranslation)?.trim());

            const audioKey = `p3-${cqIdx}-audio`;
            const imageKey = `p3-${cqIdx}-image`;
            const showAudioInput = showUrlInputs[audioKey];
            const showImageInput = showUrlInputs[imageKey];

            return (
              <div
                key={cqIdx}
                id={`p3-card-${cqIdx}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-6 space-y-6 relative border-l-4 border-l-indigo-500"
              >
                {/* Header Đoạn Hội Thoại */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-indigo-400 font-black text-xs px-3 py-1.5 rounded-lg tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>ĐOẠN #{String(cqIdx + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Đoạn hội thoại ngắn #{cqIdx + 1} • Câu {startQ} - {endQ}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        1 File Audio chung cho cả 3 câu • Có thể đính kèm ảnh biểu đồ/lịch trình
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasAudio
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasAudio ? '✓ Đã có Audio' : 'Chưa có Audio'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasImage
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasImage ? '✓ Có ảnh Graphic' : 'Không có ảnh'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasTranscript
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasTranscript ? '✓ Transcript' : 'Chưa transcript'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasTranslation
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasTranslation ? '✓ Đã có bản dịch' : 'Chưa có bản dịch'}
                    </span>

                    {activePart.contextQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContextQuestion(activePartIndex, cqIdx)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all ml-1"
                        title="Xóa bài nghe này"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* KHỐI 1: NGỮ CẢNH BÀI NGHE (AUDIO + ẢNH GRAPHIC TÙY CHỌN + TRANSCRIPT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  {/* Media (Audio & Graphic Image) (6/12) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* File Audio Chung */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Volume2 size={14} className="text-indigo-600" />
                          <span>Audio phát chung cho 3 câu ({startQ} - {endQ})</span>
                          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                            Bắt buộc
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleShowUrl(audioKey)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 inline-flex items-center gap-1"
                          >
                            <Link2 size={12} />
                            {showAudioInput ? 'Ẩn URL' : 'Dán URL MP3'}
                          </button>

                          <label
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                              uploadingKey === `${activePartIndex}-${cqIdx}-audio`
                                ? 'bg-slate-200 text-slate-400 border-slate-300'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                            }`}
                          >
                            <UploadCloud size={13} />
                            <span>{uploadingKey === `${activePartIndex}-${cqIdx}-audio` ? 'Đang tải...' : 'Tải MP3 từ máy'}</span>
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a"
                              className="hidden"
                              disabled={uploadingKey === `${activePartIndex}-${cqIdx}-audio`}
                              onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'audio')}
                            />
                          </label>
                        </div>
                      </div>

                      {showAudioInput && (
                        <input
                          type="text"
                          placeholder="https://... dán link mp3 của đoạn hội thoại vào đây..."
                          value={cq.audioUrl || ''}
                          onChange={(e) =>
                            handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-indigo-300 text-xs bg-indigo-50/30 outline-none focus:border-indigo-500 font-mono"
                        />
                      )}

                      {cq.audioUrl ? (
                        <div className="flex items-center gap-2">
                          <audio src={cq.audioUrl} controls className="w-full h-8 rounded-md" />
                          <button
                            type="button"
                            onClick={() => handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', '')}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Xóa audio"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 block italic">
                          ⚠️ Chưa có audio. Cụm 3 câu hỏi này dùng chung 1 file audio hội thoại.
                        </span>
                      )}
                    </div>

                    {/* Hình Ảnh Graphic (Tùy Chọn) */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <ImageIcon size={14} className="text-blue-600" />
                          <span>Hình ảnh biểu đồ / Lịch trình (Graphic - Tùy chọn)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleShowUrl(imageKey)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1"
                          >
                            <Link2 size={12} />
                            {showImageInput ? 'Ẩn URL' : 'Dán URL ảnh'}
                          </button>

                          <label
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                              uploadingKey === `${activePartIndex}-${cqIdx}-image`
                                ? 'bg-slate-200 text-slate-400 border-slate-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-2xs'
                            }`}
                          >
                            <UploadCloud size={13} />
                            <span>{uploadingKey === `${activePartIndex}-${cqIdx}-image` ? 'Đang tải...' : 'Tải ảnh graphic'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingKey === `${activePartIndex}-${cqIdx}-image`}
                              onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'image')}
                            />
                          </label>
                        </div>
                      </div>

                      {showImageInput && (
                        <input
                          type="text"
                          placeholder="https://... dán link ảnh graphic nếu có..."
                          value={cq.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateContextField(activePartIndex, cqIdx, 'imageUrl', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-blue-300 text-xs bg-blue-50/30 outline-none focus:border-blue-500 font-mono"
                        />
                      )}

                      {cq.imageUrl ? (
                        <div className="relative rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={cq.imageUrl}
                              alt="Graphic"
                              className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                              onClick={() => setPreviewImageModalUrl(cq.imageUrl)}
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                Đã đính kèm ảnh Graphic
                              </span>
                              <button
                                type="button"
                                onClick={() => setPreviewImageModalUrl(cq.imageUrl)}
                                className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold mt-0.5"
                              >
                                <ZoomIn size={12} /> Xem phóng to ảnh gốc
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateContextField(activePartIndex, cqIdx, 'imageUrl', '')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa ảnh này (nếu đoạn thoại không có biểu đồ)"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 block italic">
                          ℹ️ Đoạn thoại này không có ảnh biểu đồ. (Nếu đề bài có hình minh họa "Look at the graphic", hãy bấm nút tải ảnh).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transcript Âm Thanh Của Toàn Bộ Đoạn Hội Thoại (6/12) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* 1. Transcript Tiếng Anh */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <FileText size={14} className="text-indigo-600" />
                          <span>Lời thoại tiếng Anh (Audio Transcript)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const template = `Man: Good morning, Sarah. Did you get a chance to look at the budget proposal for next quarter?\nWoman: Yes, Mark. I reviewed it, but I noticed that travel expenses are much higher than usual.\nMan: That's because our sales team needs to visit clients in Europe next month.\nWoman: I see. In that case, let's schedule a meeting with the department director to approve it.`;
                            handleUpdateContextField(
                              activePartIndex,
                              cqIdx,
                              'transcript',
                              cq.transcript ? `${cq.transcript}\n\n${template}` : template
                            );
                          }}
                          className="text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 transition-all inline-flex items-center gap-1"
                        >
                          <Sparkles size={11} /> + Mẫu đối thoại (Man/Woman)
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Dán toàn bộ lời thoại đối thoại tiếng Anh trong audio này..."
                        value={cq.transcript || ''}
                        onChange={(e) =>
                          handleUpdateContextField(activePartIndex, cqIdx, 'transcript', e.target.value)
                        }
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                      />
                    </div>

                    {/* 2. Bản dịch tiếng Việt */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Languages size={14} className="text-emerald-600" />
                          <span>Bản dịch tiếng Việt (Vietnamese Translation)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const transTemplate = `Nam: Chào buổi sáng, Sarah. Cô đã có dịp xem qua bản dự thảo ngân sách cho quý tới chưa?\nNữ: Vâng, Mark. Tôi đã xem rồi, nhưng tôi nhận thấy chi phí công tác cao hơn nhiều so với bình thường.\nNam: Đó là vì đội ngũ bán hàng của chúng ta cần đi gặp khách hàng ở Châu Âu vào tháng tới.\nNữ: Tôi hiểu rồi. Trong trường hợp đó, chúng ta hãy sắp xếp một cuộc họp với giám đốc bộ phận để phê duyệt nó nhé.`;
                            const curTrans = cq.translation || cq.transcriptTranslation || '';
                            const newTrans = curTrans ? `${curTrans}\n\n${transTemplate}` : transTemplate;
                            handleUpdateContextField(activePartIndex, cqIdx, 'translation', newTrans);
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-all inline-flex items-center gap-1"
                        >
                          <Sparkles size={11} /> + Mẫu bản dịch tiếng Việt
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Dán bản dịch tiếng Việt của đoạn hội thoại vào đây (học viên sẽ xem được sau khi nộp bài)..."
                        value={cq.translation || cq.transcriptTranslation || ''}
                        onChange={(e) =>
                          handleUpdateContextField(activePartIndex, cqIdx, 'translation', e.target.value)
                        }
                        className="w-full p-3 rounded-xl border border-emerald-300 text-xs bg-emerald-50/20 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* KHỐI 2: CỤM ĐÚNG 3 CÂU HỎI TRẮC NGHIỆM */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} className="text-indigo-600" />
                      <span>3 Câu hỏi trắc nghiệm của Đoạn #{cqIdx + 1} (Câu {startQ} - {endQ})</span>
                    </span>

                    {cq.questions.length < 3 && (
                      <button
                        type="button"
                        onClick={() => handleAddQuestion(activePartIndex, cqIdx)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                      >
                        <Plus size={13} /> Thêm câu hỏi
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {cq.questions.map((q, qIdx) => {
                      const itemQNum = startQ + qIdx;
                      return (
                        <div
                          key={qIdx}
                          className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-4 space-y-3 shadow-2xs"
                        >
                          {/* Dòng 1: Tiêu đề câu hỏi & Nội dung câu hỏi */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-indigo-950 bg-indigo-100/90 px-2.5 py-0.5 rounded-md border border-indigo-200">
                                CÂU #{itemQNum}
                              </span>

                              {cq.questions.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(activePartIndex, cqIdx, qIdx)}
                                  className="text-xs text-red-500 hover:text-red-700"
                                  title="Xóa câu này"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              placeholder={`Nhập nội dung câu hỏi #${itemQNum} (ví dụ: Where does the conversation take place?)...`}
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
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>

                          {/* Dòng 2: 4 Đáp án A, B, C, D (Grid 2 cột) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                            {['A', 'B', 'C', 'D'].map((optKey) => (
                              <div key={optKey} className="flex items-center gap-2">
                                <span className="w-5 font-black text-slate-600 text-center">
                                  ({optKey})
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Nội dung lựa chọn (${optKey})`}
                                  value={q[`option${optKey}`] || ''}
                                  onChange={(e) =>
                                    handleUpdateQuestionField(
                                      activePartIndex,
                                      cqIdx,
                                      qIdx,
                                      `option${optKey}`,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-indigo-500"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Dòng 3: Chọn Đáp Án Đúng & Giải Thích Cho Câu Này */}
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-200">
                            {/* Bộ Chọn Đáp Án Đúng (Segmented Button Mini) */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Đáp án đúng:</span>
                              <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 border border-slate-300 gap-1">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                  const isSelected = (q.correctAnswer || 'A') === opt;
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
                                      className={`w-8 h-7 rounded-md font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                                        isSelected
                                          ? 'bg-indigo-600 text-white shadow-2xs font-black scale-105'
                                          : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Ô Lời Giải Thích / Dịch Nghĩa */}
                            <div className="flex-1 min-w-[260px]">
                              <input
                                type="text"
                                placeholder={`Giải thích / Dịch nghĩa vì sao chọn (${q.correctAnswer || 'A'})...`}
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
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút thêm bài nghe nếu chưa đủ 13 bài */}
        {activePart.contextQuestions.length < 13 && (
          <div className="p-5 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 text-center space-y-2.5">
            <span className="text-xs font-bold text-indigo-900 block">
              Hiện tại Part 3 đang có {activePart.contextQuestions.length} / 13 bài nghe (Chuẩn ETS: 13 đoạn hội thoại x 3 câu = 39 câu).
            </span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddContextQuestion(activePartIndex)}
                className="btn btn-primary btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> + Thêm Đoạn Hội Thoại (Đoạn #{activePart.contextQuestions.length + 1})
              </button>
              <button
                type="button"
                onClick={handleResetPart3To13}
                className="btn btn-outline btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Khởi tạo lại đủ 13 đoạn trống chuẩn Part 3
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==============================================================================
  // GIAO DIỆN CHUYÊN BIỆT CHO PART 4: 10 BÀI NÓI CHUYỆN (CÂU 71 - 100) CHUẨN ETS
  // ==============================================================================
  const renderPart4QuestionsBuilder = () => {
    return (
      <div className="space-y-6">
        {/* Quick Question Navigation Bar & Studio Overview */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/30">
                P4
              </span>
              <div>
                <h4 className="m-0 text-sm font-bold text-white flex items-center gap-2">
                  <span>Part 4: Short Talks Studio</span>
                  <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                    10 Bài nói chuyện ngắn (Câu 71 - 100) • 30 Câu hỏi • Chuẩn ETS 2026
                  </span>
                </h4>
                <p className="m-0 text-xs text-slate-400 mt-0.5">
                  Mỗi bài nói gồm 1 File MP3 độc thoại phát chung cho cụm đúng 3 câu hỏi trắc nghiệm (A, B, C, D). Có thể đính kèm ảnh sơ đồ/hóa đơn/lịch trình (Graphic).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetPart4To10}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs"
              title="Khởi tạo lại đủ 10 bài nói ngắn chuẩn Part 4"
            >
              <RotateCcw size={13} className="text-amber-400" /> Chuẩn hóa 10 bài Part 4
            </button>
          </div>

          {/* Quick Nav Jump Pills (Bài 1 đến Bài 10) */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-400">Chuyển nhanh đến bài nói:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePart.contextQuestions.map((cq, idx) => {
                const startQ = 71 + idx * 3;
                const endQ = startQ + 2;
                const isComplete = Boolean(cq.audioUrl && cq.questions?.length >= 3 && cq.questions.every((q) => q.questionContent && q.correctAnswer));
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`p4-card-${idx}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1 border ${
                      isComplete
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isComplete ? 'bg-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-500'
                      }`}
                    />
                    <span>Bài {idx + 1} ({startQ}-{endQ})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Danh sách 10 Bài Nói Chuyện Part 4 */}
        <div className="space-y-6">
          {activePart.contextQuestions.map((cq, cqIdx) => {
            const startQ = 71 + cqIdx * 3;
            const endQ = startQ + 2;
            const hasAudio = Boolean(cq.audioUrl);
            const hasImage = Boolean(cq.imageUrl);
            const hasTranscript = Boolean(cq.transcript?.trim());
            const hasTranslation = Boolean((cq.translation || cq.transcriptTranslation)?.trim());

            const audioKey = `p4-${cqIdx}-audio`;
            const imageKey = `p4-${cqIdx}-image`;
            const showAudioInput = showUrlInputs[audioKey];
            const showImageInput = showUrlInputs[imageKey];

            return (
              <div
                key={cqIdx}
                id={`p4-card-${cqIdx}`}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 p-6 space-y-6 relative border-l-4 border-l-amber-500"
              >
                {/* Header Bài Nói Chuyện */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-amber-400 font-black text-xs px-3 py-1.5 rounded-lg tracking-wider flex items-center gap-1.5 shadow-2xs">
                      <span>BÀI #{String(cqIdx + 1).padStart(2, '0')}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Bài nói chuyện ngắn #{cqIdx + 1} • Câu {startQ} - {endQ}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        1 File Audio độc thoại chung cho cả 3 câu • Có thể đính kèm ảnh sơ đồ/hóa đơn
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasAudio
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasAudio ? '✓ Đã có Audio' : 'Chưa có Audio'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasImage
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasImage ? '✓ Có ảnh Graphic' : 'Không có ảnh'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasTranscript
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasTranscript ? '✓ Transcript' : 'Chưa transcript'}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                        hasTranslation
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {hasTranslation ? '✓ Đã có bản dịch' : 'Chưa có bản dịch'}
                    </span>

                    {activePart.contextQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveContextQuestion(activePartIndex, cqIdx)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-all ml-1"
                        title="Xóa bài nói này"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* KHỐI 1: NGỮ CẢNH BÀI NÓI (AUDIO + ẢNH GRAPHIC TÙY CHỌN + TRANSCRIPT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                  {/* Media (Audio & Graphic Image) (6/12) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* File Audio Chung */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Volume2 size={14} className="text-amber-600" />
                          <span>Audio độc thoại cho 3 câu ({startQ} - {endQ})</span>
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                            Bắt buộc
                          </span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleShowUrl(audioKey)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-amber-600 inline-flex items-center gap-1"
                          >
                            <Link2 size={12} />
                            {showAudioInput ? 'Ẩn URL' : 'Dán URL MP3'}
                          </button>

                          <label
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                              uploadingKey === `${activePartIndex}-${cqIdx}-audio`
                                ? 'bg-slate-200 text-slate-400 border-slate-300'
                                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-2xs'
                            }`}
                          >
                            <UploadCloud size={13} />
                            <span>{uploadingKey === `${activePartIndex}-${cqIdx}-audio` ? 'Đang tải...' : 'Tải MP3 từ máy'}</span>
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a"
                              className="hidden"
                              disabled={uploadingKey === `${activePartIndex}-${cqIdx}-audio`}
                              onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'audio')}
                            />
                          </label>
                        </div>
                      </div>

                      {showAudioInput && (
                        <input
                          type="text"
                          placeholder="https://... dán link mp3 của bài nói chuyện vào đây..."
                          value={cq.audioUrl || ''}
                          onChange={(e) =>
                            handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-amber-50/30 outline-none focus:border-amber-500 font-mono"
                        />
                      )}

                      {cq.audioUrl ? (
                        <div className="flex items-center gap-2">
                          <audio src={cq.audioUrl} controls className="w-full h-8 rounded-md" />
                          <button
                            type="button"
                            onClick={() => handleUpdateContextField(activePartIndex, cqIdx, 'audioUrl', '')}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Xóa audio"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-600 block italic">
                          ⚠️ Chưa có audio. Cụm 3 câu hỏi này dùng chung 1 file audio bài nói.
                        </span>
                      )}
                    </div>

                    {/* Hình Ảnh Graphic (Tùy Chọn) */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <ImageIcon size={14} className="text-blue-600" />
                          <span>Hình ảnh sơ đồ / Hóa đơn (Graphic - Tùy chọn)</span>
                        </label>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleShowUrl(imageKey)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1"
                          >
                            <Link2 size={12} />
                            {showImageInput ? 'Ẩn URL' : 'Dán URL ảnh'}
                          </button>

                          <label
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border ${
                              uploadingKey === `${activePartIndex}-${cqIdx}-image`
                                ? 'bg-slate-200 text-slate-400 border-slate-300'
                                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-2xs'
                            }`}
                          >
                            <UploadCloud size={13} />
                            <span>{uploadingKey === `${activePartIndex}-${cqIdx}-image` ? 'Đang tải...' : 'Tải ảnh graphic'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={uploadingKey === `${activePartIndex}-${cqIdx}-image`}
                              onChange={(e) => handleFileUpload(e, activePartIndex, cqIdx, 'image')}
                            />
                          </label>
                        </div>
                      </div>

                      {showImageInput && (
                        <input
                          type="text"
                          placeholder="https://... dán link ảnh graphic nếu có..."
                          value={cq.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateContextField(activePartIndex, cqIdx, 'imageUrl', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-blue-300 text-xs bg-blue-50/30 outline-none focus:border-blue-500 font-mono"
                        />
                      )}

                      {cq.imageUrl ? (
                        <div className="relative rounded-xl border border-slate-200 bg-white p-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={cq.imageUrl}
                              alt="Graphic"
                              className="w-16 h-16 object-contain rounded-lg border border-slate-200 bg-slate-50 cursor-pointer"
                              onClick={() => setPreviewImageModalUrl(cq.imageUrl)}
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                Đã đính kèm ảnh Graphic
                              </span>
                              <button
                                type="button"
                                onClick={() => setPreviewImageModalUrl(cq.imageUrl)}
                                className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold mt-0.5"
                              >
                                <ZoomIn size={12} /> Xem phóng to ảnh gốc
                              </button>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateContextField(activePartIndex, cqIdx, 'imageUrl', '')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Xóa ảnh này"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 block italic">
                          ℹ️ Bài nói này không có ảnh bảng biểu. (Nếu đề bài có hình minh họa "Look at the graphic", hãy bấm nút tải ảnh).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transcript Âm Thanh Của Toàn Bộ Bài Nói (6/12) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* 1. Transcript Tiếng Anh */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <FileText size={14} className="text-amber-600" />
                          <span>Lời thoại tiếng Anh (Audio Transcript)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const template = `Attention, all airline passengers on Flight 402 to Chicago. Due to severe thunderstorms in the Midwest, our departure has been delayed by approximately 45 minutes. We will begin boarding at Gate B12 as soon as the weather clears. Please check the monitor screens for further gate updates.`;
                            handleUpdateContextField(
                              activePartIndex,
                              cqIdx,
                              'transcript',
                              cq.transcript ? `${cq.transcript}\n\n${template}` : template
                            );
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 transition-all inline-flex items-center gap-1"
                        >
                          <Sparkles size={11} /> + Mẫu bài nói / Thông báo
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Dán toàn bộ lời phát thanh, bài phát biểu hoặc tin nhắn thoại trong audio này..."
                        value={cq.transcript || ''}
                        onChange={(e) =>
                          handleUpdateContextField(activePartIndex, cqIdx, 'transcript', e.target.value)
                        }
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                      />
                    </div>

                    {/* 2. Bản dịch tiếng Việt */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                          <Languages size={14} className="text-emerald-600" />
                          <span>Bản dịch tiếng Việt (Vietnamese Translation)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            const transTemplate = `Xin toàn thể hành khách trên Chuyến bay 402 đến Chicago chú ý. Do bão sấm sét nghiêm trọng ở vùng Trung Tây, giờ khởi hành của chúng ta đã bị hoãn lại khoảng 45 phút. Chúng tôi sẽ bắt đầu cho hành khách lên máy bay tại Cửa B12 ngay khi thời tiết quang đãng. Xin vui lòng theo dõi màn hình hiển thị để cập nhật thông tin cửa ra máy bay mới nhất.`;
                            const curTrans = cq.translation || cq.transcriptTranslation || '';
                            const newTrans = curTrans ? `${curTrans}\n\n${transTemplate}` : transTemplate;
                            handleUpdateContextField(activePartIndex, cqIdx, 'translation', newTrans);
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-all inline-flex items-center gap-1"
                        >
                          <Sparkles size={11} /> + Mẫu bản dịch tiếng Việt
                        </button>
                      </div>

                      <textarea
                        rows={4}
                        placeholder="Dán bản dịch tiếng Việt của bài nói chuyện vào đây (học viên sẽ xem được sau khi nộp bài)..."
                        value={cq.translation || cq.transcriptTranslation || ''}
                        onChange={(e) =>
                          handleUpdateContextField(activePartIndex, cqIdx, 'translation', e.target.value)
                        }
                        className="w-full p-3 rounded-xl border border-emerald-300 text-xs bg-emerald-50/20 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 leading-relaxed text-slate-800 font-sans shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* KHỐI 2: CỤM ĐÚNG 3 CÂU HỎI TRẮC NGHIỆM */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} className="text-amber-600" />
                      <span>3 Câu hỏi trắc nghiệm của Bài nói #{cqIdx + 1} (Câu {startQ} - {endQ})</span>
                    </span>

                    {cq.questions.length < 3 && (
                      <button
                        type="button"
                        onClick={() => handleAddQuestion(activePartIndex, cqIdx)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                      >
                        <Plus size={13} /> Thêm câu hỏi
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {cq.questions.map((q, qIdx) => {
                      const itemQNum = startQ + qIdx;
                      return (
                        <div
                          key={qIdx}
                          className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-4 space-y-3 shadow-2xs"
                        >
                          {/* Dòng 1: Tiêu đề câu hỏi & Nội dung câu hỏi */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-amber-950 bg-amber-100/90 px-2.5 py-0.5 rounded-md border border-amber-200">
                                CÂU #{itemQNum}
                              </span>

                              {cq.questions.length > 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(activePartIndex, cqIdx, qIdx)}
                                  className="text-xs text-red-500 hover:text-red-700"
                                  title="Xóa câu này"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              placeholder={`Nhập nội dung câu hỏi #${itemQNum} (ví dụ: Who most likely is the speaker?)...`}
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
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                            />
                          </div>

                          {/* Dòng 2: 4 Đáp án A, B, C, D (Grid 2 cột) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                            {['A', 'B', 'C', 'D'].map((optKey) => (
                              <div key={optKey} className="flex items-center gap-2">
                                <span className="w-5 font-black text-slate-600 text-center">
                                  ({optKey})
                                </span>
                                <input
                                  type="text"
                                  placeholder={`Nội dung lựa chọn (${optKey})`}
                                  value={q[`option${optKey}`] || ''}
                                  onChange={(e) =>
                                    handleUpdateQuestionField(
                                      activePartIndex,
                                      cqIdx,
                                      qIdx,
                                      `option${optKey}`,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs outline-none focus:border-amber-500"
                                />
                              </div>
                            ))}
                          </div>

                          {/* Dòng 3: Chọn Đáp Án Đúng & Giải Thích Cho Câu Này */}
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-200">
                            {/* Bộ Chọn Đáp Án Đúng (Segmented Button Mini) */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Đáp án đúng:</span>
                              <div className="inline-flex p-0.5 rounded-lg bg-slate-200/80 border border-slate-300 gap-1">
                                {['A', 'B', 'C', 'D'].map((opt) => {
                                  const isSelected = (q.correctAnswer || 'A') === opt;
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
                                      className={`w-8 h-7 rounded-md font-black text-xs transition-all flex items-center justify-center cursor-pointer ${
                                        isSelected
                                          ? 'bg-amber-600 text-white shadow-2xs font-black scale-105'
                                          : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
                                      }`}
                                    >
                                      {opt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Ô Lời Giải Thích / Dịch Nghĩa */}
                            <div className="flex-1 min-w-[260px]">
                              <input
                                type="text"
                                placeholder={`Giải thích / Dịch nghĩa vì sao chọn (${q.correctAnswer || 'A'})...`}
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
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nút thêm bài nói nếu chưa đủ 10 bài */}
        {activePart.contextQuestions.length < 10 && (
          <div className="p-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 text-center space-y-2.5">
            <span className="text-xs font-bold text-amber-900 block">
              Hiện tại Part 4 đang có {activePart.contextQuestions.length} / 10 bài nói chuyện (Chuẩn ETS: 10 bài x 3 câu = 30 câu).
            </span>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleAddContextQuestion(activePartIndex)}
                className="btn btn-primary btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> + Thêm Bài Nói Chuyện (Bài #{activePart.contextQuestions.length + 1})
              </button>
              <button
                type="button"
                onClick={handleResetPart4To10}
                className="btn btn-outline btn-sm text-xs font-bold inline-flex items-center gap-1.5"
              >
                <RotateCcw size={14} /> Khởi tạo lại đủ 10 bài trống chuẩn Part 4
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
        <div className="space-y-3 mb-6">
          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setStatusTab('PUBLISHED');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-2 border transition-all ${
                statusTab === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 size={15} /> Đề Đã Xuất Bản (PUBLISHED)
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusTab('DRAFT');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs inline-flex items-center gap-2 border transition-all ${
                statusTab === 'DRAFT'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Clock size={15} /> Đề Bản Nháp (DRAFT)
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px]">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Tìm kiếm đề thi ${statusTab === 'PUBLISHED' ? 'đã xuất bản' : 'bản nháp'} (ví dụ: ETS 2026)...`}
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
              <h3 className="text-base font-bold text-slate-800 mb-1.5">
                Chưa có đề thi nào trong mục "{statusTab === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}"
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {searchInput
                  ? `Không tìm thấy bài thi phù hợp với từ khóa "${searchInput}".`
                  : 'Hãy bấm nút bên dưới để soạn thảo đề thi mới.'}
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
                    <th className="px-5 py-3.5">Trạng thái</th>
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
                    const isPublished = test.status === 'PUBLISHED';

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
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                              isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
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
                          {isPublished ? (
                            <span className="badge badge-success text-[11px] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 size={12} /> Đã xuất bản
                            </span>
                          ) : (
                            <span className="badge badge-warning text-[11px] font-bold inline-flex items-center gap-1">
                              <Clock size={12} /> Bản nháp
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                            <Layers size={15} className="text-emerald-600" /> {contextCount} cụm phần
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
                            {isPublished ? (
                              <button
                                type="button"
                                title="Thu hồi về bản nháp (ẩn khỏi học viên)"
                                className="btn btn-sm btn-outline px-2.5 py-1.5 text-amber-700 border-amber-300 hover:bg-amber-50 font-bold inline-flex items-center gap-1 text-xs"
                                onClick={() => handleTogglePublish(test)}
                                disabled={actionLoading}
                              >
                                <RotateCcw size={13} /> Về nháp
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Xuất bản đề thi (học viên có thể làm bài)"
                                className="btn btn-sm btn-outline px-2.5 py-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50 font-bold inline-flex items-center gap-1 text-xs"
                                onClick={() => handleTogglePublish(test)}
                                disabled={actionLoading}
                              >
                                <CheckCircle2 size={13} /> Xuất bản
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline px-3 py-1.5 gap-1.5 font-bold inline-flex items-center"
                              onClick={() => handleOpenEditModal(test)}
                            >
                              <Edit2 size={14} /> Sửa đề
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline px-3 py-1.5 gap-1.5 font-bold inline-flex items-center text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleOpenDeleteModal(test)}
                              >
                                <Trash2 size={14} /> Xóa đề
                              </button>
                            )}
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
        onClose={handleCloseBuilder}
        title={
          builderMode === 'create'
            ? 'Soạn thảo & Khởi tạo Đề thi TOEIC mới'
            : `Chỉnh sửa toàn bộ Đề thi: "${selectedTest?.titleTest}"`
        }
        maxWidth="980px"
      >
        <form onSubmit={handleSaveExam} noValidate className="flex flex-col gap-5">
          {/* BANNER KHÔI PHỤC BẢN NHÁP TỰ ĐỘNG LƯU TRÌNH DUYỆT NẾU CÓ */}
          {recoverableDraft && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between flex-wrap gap-2 animate-fadeIn shadow-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold">Phát hiện phiên làm việc chưa lưu trước đó:</span> "{recoverableDraft.formTitle || 'Chưa đặt tên'}" lúc{' '}
                  <span className="font-semibold">
                    {recoverableDraft.savedAt ? new Date(recoverableDraft.savedAt).toLocaleTimeString('vi-VN') : ''}
                  </span>{' '}
                  ngày {recoverableDraft.savedAt ? new Date(recoverableDraft.savedAt).toLocaleDateString('vi-VN') : ''}.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Khôi phục bản nháp này
                </button>
                <button
                  type="button"
                  onClick={handleDismissDraft}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-all cursor-pointer"
                >
                  Bỏ qua & Xóa
                </button>
              </div>
            </div>
          )}

          {/* STICKY QUICK ACTION & AUTOSAVE STATUS BAR */}
          <div className="sticky -top-4 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-extrabold text-slate-800 truncate max-w-[260px]">
                {formTitle || 'Chưa đặt tên đề thi'}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  formStatus === 'PUBLISHED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {formStatus === 'PUBLISHED' ? 'Đang chọn: Xuất bản' : 'Đang chọn: Bản nháp'}
              </span>

              {/* Trạng thái Auto-Save Đa Tầng */}
              {autoSaveState.status === 'saving' && (
                <span className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                  <RefreshCw size={12} className="animate-spin" /> Đang lưu bản nháp...
                </span>
              )}
              {autoSaveState.status === 'saved' && autoSaveState.savedAt && (
                <span
                  className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium"
                  title="Bản nháp được lưu an toàn liên tục vào bộ nhớ trình duyệt mỗi 5s (0% tải máy chủ)"
                >
                  <Check size={13} className="text-emerald-500" /> Tự lưu trình duyệt {autoSaveState.savedAt.toLocaleTimeString('vi-VN')}
                </span>
              )}
              {autoSaveState.status === 'synced_server' && autoSaveState.savedAt && (
                <span
                  className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold"
                  title="Dữ liệu đã được đồng bộ an toàn lên cơ sở dữ liệu MySQL của máy chủ"
                >
                  <CheckCircle2 size={12} className="text-indigo-600" /> Đã đồng bộ máy chủ {autoSaveState.savedAt.toLocaleTimeString('vi-VN')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {builderMode === 'edit' && (
                <button
                  type="button"
                  onClick={handleReloadFromServer}
                  disabled={actionLoading}
                  title="Tải lại toàn bộ dữ liệu mới nhất từ CSDL máy chủ và xóa sạch bản nháp cache trình duyệt"
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <RotateCcw size={13} className="text-slate-500" />
                  Tải lại từ CSDL
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSaveExam(null, 'DRAFT', true)}
                disabled={actionLoading}
                title="Lưu ngay bản nháp lên máy chủ và tiếp tục soạn thảo (phím tắt: Ctrl + S)"
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <Clock size={13} className="text-amber-600" />
                {actionLoading ? 'Đang lưu...' : 'Lưu nháp máy chủ (Ctrl+S)'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveExam(null, 'PUBLISHED', false)}
                disabled={actionLoading}
                title="Kiểm tra và Xuất bản đề thi lên hệ thống"
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              >
                <CheckCircle2 size={13} />
                Xuất bản đề thi
              </button>
            </div>
          </div>
          {/* Test Basic Info & Status */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tên Bộ Đề Thi TOEIC <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: ETS TOEIC 2026 - Test 01"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  markDirty();
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-base font-bold text-slate-900 bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                  Trạng thái lưu trữ / Xuất bản
                </span>
                <p className="text-xs text-slate-500 m-0">
                  {formStatus === 'PUBLISHED'
                    ? '✓ Đề thi sẽ hiển thị ngay cho học viên làm bài.'
                    : '✎ Đề thi lưu ở dạng Bản nháp, chỉ Admin và Giảng viên mới nhìn thấy.'}
                </p>
              </div>

              <div className="inline-flex rounded-lg p-1 bg-slate-200 border border-slate-300">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    formStatus === 'PUBLISHED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    setFormStatus('PUBLISHED');
                    markDirty();
                  }}
                >
                  <CheckCircle2 size={13} className="inline mr-1" /> Xuất bản (PUBLISHED)
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    formStatus === 'DRAFT'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => {
                    setFormStatus('DRAFT');
                    markDirty();
                  }}
                >
                  <Clock size={13} className="inline mr-1" /> Bản nháp (DRAFT)
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BẢNG ĐỐI CHIẾU TIẾN ĐỘ & CẤU TRÚC ĐỀ CHUẨN ETS 2026 (DOL ENGLISH SPEC)    */}
          {/* ========================================================================= */}
          <div className="bg-emerald-950 text-white p-4 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500 text-slate-950 text-[11px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ETS 2026 Format
                </span>
                <span className="font-extrabold text-sm text-emerald-300">
                  Chuẩn đề ETS TOEIC: 200 câu • 120 phút • Thang điểm 10 - 990
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEtsGuideOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-emerald-200 border border-emerald-500/30 transition-all inline-flex items-center gap-1.5"
                >
                  <BookOpen size={13} /> Xem cẩm nang ETS
                </button>
                <button
                  type="button"
                  onClick={handleApplyFullETSTest}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all inline-flex items-center gap-1.5 shadow-sm"
                  title="Tự động sinh khung đầy đủ 7 Part với 200 câu hỏi chuẩn ETS (100 câu Listening + 100 câu Reading)"
                >
                  <Sparkles size={13} /> ⚡ Tạo Full Test 200 câu chuẩn
                </button>
                <button
                  type="button"
                  onClick={handleApplyMiniETSTest}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all inline-flex items-center gap-1.5"
                  title="Tạo khung Mini Test 50 câu rút gọn theo đúng tỷ lệ các Part"
                >
                  ⚡ Mini Test (50 câu)
                </button>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <span>
                  Tiến độ soạn đề: <strong className="text-white text-sm">{etsMetrics.totalCount}</strong> / 200 câu
                  {etsMetrics.isFullETS ? (
                    <span className="text-emerald-400 ml-2 font-black">✓ ĐẠT CHUẨN ETS 100% (200 câu)</span>
                  ) : (
                    <span className="text-amber-300 ml-2 font-normal">
                      (Listening: {etsMetrics.listeningCount}/100 • Reading: {etsMetrics.readingCount}/100)
                    </span>
                  )}
                </span>
                <span className="text-emerald-400 font-mono">
                  {Math.min(100, Math.round((etsMetrics.totalCount / 200) * 100))}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(50, (etsMetrics.listeningCount / 200) * 100)}%` }}
                  title={`Listening: ${etsMetrics.listeningCount}/100 câu`}
                />
                <div
                  className="bg-blue-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(50, (etsMetrics.readingCount / 200) * 100)}%` }}
                  title={`Reading: ${etsMetrics.readingCount}/100 câu`}
                />
              </div>
            </div>

            {/* 7 Parts Mini Badges with Standard Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                const spec = ETS_STRUCTURE_SPECS[pNum];
                const currentCount = etsMetrics.partCounts[pNum] || 0;
                const standard = spec.standardQuestions;
                const isExact = currentCount === standard;
                const isOver = currentCount > standard;

                return (
                  <div
                    key={pNum}
                    className={`p-1.5 rounded-lg border text-center text-[11px] transition-all ${
                      isExact
                        ? 'bg-emerald-900/60 border-emerald-500/50 text-emerald-200'
                        : isOver
                        ? 'bg-red-950/60 border-red-500/50 text-red-200'
                        : currentCount > 0
                        ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                        : 'bg-slate-900/60 border-slate-700/50 text-slate-400'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-center gap-1">
                      <span>P{pNum}</span>
                      {pNum === 2 && <span className="text-[9px] bg-sky-500 text-slate-950 px-1 rounded font-black">3 opts</span>}
                    </div>
                    <div className="font-mono text-[10px] mt-0.5">
                      {currentCount}/{standard} {isExact ? '✓' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Part Selection & Tabs Bar */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Các phần thi trong đề ({formParts.length} phần):
                </span>
                <button
                  type="button"
                  onClick={handleResetToListening100Blank}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all inline-flex items-center gap-1.5 shadow-2xs"
                  title="Khởi tạo sẵn khung đề 100 câu Listening chuẩn ETS (Part 1: 6 câu, Part 2: 25 câu, Part 3: 13 đoạn, Part 4: 10 bài)"
                >
                  <Headphones size={13} /> Khởi tạo chuẩn 100 câu Listening (P1 - P4)
                </button>
              </div>

              {/* Add Part Dropdown / Button */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
                  const isAdded = formParts.some((p) => p.partNumber === pNum);
                  const spec = ETS_STRUCTURE_SPECS[pNum];
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => handleAddFullETSPart(pNum)}
                      className={`text-xs px-2.5 py-1 rounded-md font-bold transition-all ${
                        isAdded
                          ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                      title={`Thêm trọn Part ${pNum} (${spec.standardQuestions} câu chuẩn ETS${pNum === 2 ? ' - 3 options A,B,C' : ''})`}
                    >
                      + Part {pNum} ({spec.standardQuestions}c{pNum === 2 ? '*' : ''})
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
              {/* Part Header & Action */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-base m-0 flex items-center gap-2">
                    <span>{PART_DEFINITIONS[activePart.partNumber]?.name || `Part ${activePart.partNumber}`}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {ETS_PART_DIRECTIONS[activePart.partNumber]?.questionRange}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    {ETS_STRUCTURE_SPECS[activePart.partNumber]?.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetActivePartToBlank}
                    className="btn btn-outline btn-sm text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 hover:bg-slate-100"
                    title={`Khởi tạo lại Part ${activePart.partNumber} với số câu chuẩn ETS`}
                  >
                    <RotateCcw size={13} className="text-emerald-600" />
                    Chuẩn hóa Part {activePart.partNumber}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPartDirections(!showPartDirections)}
                    className="btn btn-outline btn-sm text-xs font-semibold text-slate-600 inline-flex items-center gap-1.5"
                  >
                    <BookOpen size={13} />
                    {showPartDirections ? 'Thu gọn Hướng dẫn' : 'Xem Hướng dẫn ETS'}
                    {showPartDirections ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddContextQuestion(activePartIndex)}
                    className="btn btn-primary btn-sm text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <PlusCircle size={14} />
                    {activePart.partNumber === 1
                      ? '+ Thêm Câu Hỏi Tranh (1 Audio + 1 Ảnh)'
                      : activePart.partNumber === 2
                      ? '+ Thêm Câu Hỏi Lẻ (1 Audio • 3 options)'
                      : activePart.partNumber === 3
                      ? '+ Thêm Đoạn Hội Thoại (1 Audio chung + 3 câu)'
                      : activePart.partNumber === 4
                      ? '+ Thêm Bài Nói Ngắn (1 Audio chung + 3 câu)'
                      : activePart.partNumber === 5
                      ? '+ Thêm Câu Hỏi Điền Từ'
                      : activePart.partNumber === 6
                      ? '+ Thêm Bài Đọc Điền Khuyết (Đoạn văn + 4 câu)'
                      : '+ Thêm Bài Đọc Hiểu (Đoạn văn + Câu hỏi)'}
                  </button>
                </div>
              </div>

              {/* OFFICIAL ETS DIRECTIONS & INSTRUCTIONS BANNER */}
              {showPartDirections && ETS_PART_DIRECTIONS[activePart.partNumber] && (
                <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                          ETS Official Directions
                        </span>
                        <strong className="text-xs text-emerald-300 font-bold uppercase">
                          PART {activePart.partNumber} • Hướng Dẫn Làm Bài Chuẩn Quốc Tế
                        </strong>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-serif italic m-0 pt-1">
                        "{ETS_PART_DIRECTIONS[activePart.partNumber].directions}"
                      </p>
                    </div>
                  </div>

                  {/* Sample Statement for Part 1 */}
                  {activePart.partNumber === 1 && ETS_PART_DIRECTIONS[1].sampleStatement && (
                    <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 space-y-1">
                      <span className="font-bold text-amber-300 block text-[11px]">
                        💡 Ví dụ câu mẫu chuẩn đề ETS (Sample Statement):
                      </span>
                      <p className="m-0 italic text-slate-300">
                        {ETS_PART_DIRECTIONS[1].sampleStatement}
                      </p>
                    </div>
                  )}

                  {/* Audio Format Note for Teacher/Admin */}
                  <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-xs flex items-center gap-2 text-emerald-200">
                    <Volume2 size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <strong className="text-emerald-300">Quy cách định dạng file nghe & câu hỏi: </strong>
                      <span>{ETS_PART_DIRECTIONS[activePart.partNumber].audioFormatNote}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Context Questions List */}
              {activePart.partNumber === 1 ? (
                renderPart1QuestionsBuilder()
              ) : activePart.partNumber === 2 ? (
                renderPart2QuestionsBuilder()
              ) : activePart.partNumber === 3 ? (
                renderPart3QuestionsBuilder()
              ) : activePart.partNumber === 4 ? (
                renderPart4QuestionsBuilder()
              ) : (
                <div className="space-y-6">
                  {activePart.contextQuestions.map((cq, cqIdx) => (
                  <div
                    key={cqIdx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Layers size={14} className="text-emerald-600" />
                        {activePart.partNumber === 1
                          ? `Câu hỏi tranh #${cqIdx + 1} (File nghe & Ảnh riêng lẻ)`
                          : activePart.partNumber === 2
                          ? `Câu hỏi #${cqIdx + 7} (File nghe riêng lẻ • 3 options A, B, C)`
                          : activePart.partNumber === 3
                          ? `Đoạn hội thoại #${cqIdx + 1} (Câu ${31 + cqIdx * 3 + 1} - ${31 + (cqIdx + 1) * 3}) • 1 File Audio phát chung cho 3 câu hỏi`
                          : activePart.partNumber === 4
                          ? `Bài nói ngắn #${cqIdx + 1} (Câu ${70 + cqIdx * 3 + 1} - ${70 + (cqIdx + 1) * 3}) • 1 File Audio phát chung cho 3 câu hỏi`
                          : activePart.partNumber === 5
                          ? `Câu hỏi #${cqIdx + 101} (Ngữ pháp & Từ vựng độc lập)`
                          : activePart.partNumber === 6
                          ? `Bài đọc điền khuyết #${cqIdx + 1} (Câu ${130 + cqIdx * 4 + 1} - ${130 + (cqIdx + 1) * 4}) • 1 Đoạn văn có 4 chỗ trống`
                          : `Bài đọc hiểu #${cqIdx + 1} (${cq.questions.length} câu hỏi)`}
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

                    {/* Audio & Image URLs (Only for Parts that need them) */}
                    {activePart.partNumber <= 4 && (
                      <div className={`grid gap-4 ${activePart.partNumber === 2 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                        {/* Audio URL & Upload */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">
                              {activePart.partNumber <= 2
                                ? `File Audio cho Câu hỏi này (MP3 riêng lẻ):`
                                : `File Audio phát chung cho 3 câu hỏi này (MP3 dính liền):`}
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

                        {/* Image URL & Upload (Part 1 requires image, Part 3, 4 optional for graphic questions, Part 2 has no image) */}
                        {activePart.partNumber !== 2 && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                {activePart.partNumber === 1
                                  ? 'Hình ảnh tranh mô tả (Bắt buộc cho Part 1):'
                                  : 'Hình ảnh biểu đồ / bảng biểu (Graphic Questions nếu có):'}
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
                        )}
                      </div>
                    )}

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
                          {activePart.partNumber === 1
                            ? 'Câu hỏi mô tả tranh:'
                            : activePart.partNumber === 2
                            ? 'Câu hỏi phản hồi (Chỉ 3 đáp án A, B, C):'
                            : activePart.partNumber === 3 || activePart.partNumber === 4
                            ? `Danh sách câu hỏi của bài nghe này (${cq.questions.length} câu - Chuẩn ETS: 3 câu):`
                            : activePart.partNumber === 5
                            ? 'Câu hỏi điền khuyết ngữ pháp / từ vựng:'
                            : activePart.partNumber === 6
                            ? `Danh sách câu hỏi của đoạn văn này (${cq.questions.length} câu - Chuẩn ETS: 4 câu):`
                            : `Danh sách câu hỏi đọc hiểu (${cq.questions.length} câu):`}
                        </span>

                        {activePart.partNumber !== 1 && activePart.partNumber !== 2 && activePart.partNumber !== 5 && (
                          <button
                            type="button"
                            onClick={() => handleAddQuestion(activePartIndex, cqIdx)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                          >
                            <Plus size={13} /> + Thêm câu hỏi vào bài này
                          </button>
                        )}
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

                          {/* ETS Part 2 Notice */}
                          {activePart.partNumber === 2 && (
                            <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-medium flex items-center gap-1.5">
                              <Info size={14} className="text-sky-600 shrink-0" />
                              <span>
                                <strong>Quy chuẩn ETS Part 2:</strong> Phần Hỏi - Đáp chỉ có <strong>3 lựa chọn A, B, C</strong>. Lựa chọn D được tự động ẩn theo đúng cấu trúc bài thi thực tế.
                              </span>
                            </div>
                          )}

                          {/* Options A, B, C, D (Part 2 only has A, B, C) */}
                          <div className={`grid gap-2.5 text-xs ${activePart.partNumber === 2 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
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
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none focus:border-emerald-500"
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
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none focus:border-emerald-500"
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
                                className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none focus:border-emerald-500"
                              />
                            </div>

                            {activePart.partNumber !== 2 && (
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
                                  className="flex-1 px-2.5 py-1.5 rounded-md border border-slate-200 outline-none focus:border-emerald-500"
                                />
                              </div>
                            )}
                          </div>

                          {/* Correct Answer & Explanation */}
                          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Đáp án đúng:</span>
                              {(activePart.partNumber === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D']).map((opt) => {
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
              )}
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 flex-wrap">
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-700">💡 Mẹo:</span> Bạn có thể lưu tạm (DRAFT) bất kỳ lúc nào dù Part 3 & 4 chưa làm xong. Phím tắt <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-md">Ctrl+S</kbd> để lưu nháp nhanh.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-outline text-xs py-2 px-4"
                disabled={actionLoading}
                onClick={handleCloseBuilder}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleSaveExam(null, 'DRAFT', true)}
                className="btn bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                disabled={actionLoading}
                title="Lưu nháp lên máy chủ và tiếp tục làm việc"
              >
                <Clock size={14} />
                Lưu nháp máy chủ (DRAFT)
              </button>
              <button
                type="submit"
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-2 text-xs font-bold cursor-pointer"
                disabled={actionLoading}
              >
                <Save size={15} />
                {actionLoading
                  ? 'Đang lưu dữ liệu...'
                  : formStatus === 'PUBLISHED'
                  ? 'Lưu & Hoàn tất Xuất bản'
                  : 'Lưu & Hoàn tất Bản nháp'}
              </button>
            </div>
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

      {/* ========================================================================= */}
      {/* ETS STRUCTURE GUIDE & HANDBOOK MODAL (DOL ENGLISH STANDARD 2026)          */}
      {/* ========================================================================= */}
      <Modal
        isOpen={etsGuideOpen}
        onClose={() => setEtsGuideOpen(false)}
        title="Cẩm nang Cấu trúc Đề thi TOEIC Listening & Reading Mới Nhất (Chuẩn ETS 2026)"
        maxWidth="900px"
      >
        <div className="space-y-5 text-slate-800 text-xs leading-relaxed max-h-[75vh] overflow-y-auto pr-2">
          {/* Header Overview Banner */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 rounded-xl shadow-xs">
            <h3 className="text-base font-extrabold m-0 text-white flex items-center gap-2">
              <Sparkles size={18} className="text-amber-300" />
              Tổng quan Cấu trúc Đề thi TOEIC Chuẩn Quốc Tế
            </h3>
            <p className="text-emerald-100 text-xs mt-1 mb-3">
              Bài thi TOEIC Listening & Reading gồm đúng <strong>200 câu hỏi trắc nghiệm</strong> làm liên tục trong <strong>120 phút</strong>. Thang điểm từ <strong>10 – 990 điểm</strong> (mỗi phần chấm từ 5 – 495 điểm).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-600/60 text-center">
              <div className="bg-white/10 rounded-lg p-2">
                <span className="block text-[10px] text-emerald-200 uppercase font-bold">Tổng số câu</span>
                <strong className="text-base text-white">200 Câu</strong>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <span className="block text-[10px] text-emerald-200 uppercase font-bold">Thời gian thi</span>
                <strong className="text-base text-white">120 Phút</strong>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <span className="block text-[10px] text-emerald-200 uppercase font-bold">Phần Listening</span>
                <strong className="text-base text-emerald-300">100c / 45 phút</strong>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <span className="block text-[10px] text-emerald-200 uppercase font-bold">Phần Reading</span>
                <strong className="text-base text-sky-300">100c / 75 phút</strong>
              </div>
            </div>
          </div>

          {/* Section 1: Listening Comprehension Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2 m-0">
              <Volume2 size={16} className="text-emerald-600" />
              I. Cấu trúc Phần thi Nghe hiểu (Listening Comprehension - 100 câu / 45 phút)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-950 font-bold border-b border-slate-200">
                    <th className="p-2.5">Phần thi</th>
                    <th className="p-2.5">Nội dung bài thi</th>
                    <th className="p-2.5">Quy cách & Chi tiết yêu cầu</th>
                    <th className="p-2.5 text-center">Số câu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">Part 1</td>
                    <td className="p-2.5 font-semibold text-emerald-700">Hình ảnh (Photographs)</td>
                    <td className="p-2.5 text-slate-600">
                      Xem 1 bức hình và nghe 4 câu mô tả (A, B, C, D) trong audio. Chọn câu mô tả chính xác nhất.
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">6 câu</td>
                  </tr>
                  <tr className="bg-sky-50/50">
                    <td className="p-2.5 font-bold text-sky-900 whitespace-nowrap">Part 2</td>
                    <td className="p-2.5 font-semibold text-sky-700">Hỏi & Đáp (Question - Response)</td>
                    <td className="p-2.5 text-slate-700">
                      Nghe 1 câu hỏi hoặc câu nhận định và 3 câu phản hồi. <strong className="text-sky-800">ĐẶC BIỆT: Chỉ có 3 lựa chọn A, B, C (KHÔNG có đáp án D).</strong>
                    </td>
                    <td className="p-2.5 text-center font-bold text-sky-900 bg-sky-100/50">25 câu</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">Part 3</td>
                    <td className="p-2.5 font-semibold text-emerald-700">Hội thoại (Conversations)</td>
                    <td className="p-2.5 text-slate-600">
                      Nghe 13 đoạn đối thoại (2-3 người). Mỗi đoạn kèm đúng 3 câu hỏi trắc nghiệm (A, B, C, D). Có thể kèm hình ảnh/biểu đồ.
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">39 câu (13 đoạn)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">Part 4</td>
                    <td className="p-2.5 font-semibold text-emerald-700">Độc thoại (Talks)</td>
                    <td className="p-2.5 text-slate-600">
                      Nghe 10 đoạn độc thoại (thông báo, bài phát biểu, tin nhắn thoại). Mỗi đoạn kèm đúng 3 câu hỏi (A, B, C, D).
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">30 câu (10 bài)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Reading Comprehension Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-sm text-blue-900 flex items-center gap-2 m-0">
              <BookOpen size={16} className="text-blue-600" />
              II. Cấu trúc Phần thi Đọc hiểu (Reading Comprehension - 100 câu / 75 phút)
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-blue-50 text-blue-950 font-bold border-b border-slate-200">
                    <th className="p-2.5">Phần thi</th>
                    <th className="p-2.5">Nội dung câu hỏi</th>
                    <th className="p-2.5">Yêu cầu & Mục tiêu đánh giá</th>
                    <th className="p-2.5 text-center">Số câu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">Part 5</td>
                    <td className="p-2.5 font-semibold text-blue-700">Hoàn chỉnh câu (Incomplete Sentences)</td>
                    <td className="p-2.5 text-slate-600">
                      Đánh giá khả năng hiểu cấu trúc ngữ pháp và từ vựng trong ngữ cảnh cụ thể, 4 lựa chọn A, B, C, D.
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">30 câu</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">Part 6</td>
                    <td className="p-2.5 font-semibold text-blue-700">Hoàn chỉnh đoạn văn (Text Completion)</td>
                    <td className="p-2.5 text-slate-600">
                      4 đoạn văn với nhiều chỗ trống (thư từ, email, thông báo). Điền đúng từ hoặc câu phù hợp vào chỗ trống (4 câu/đoạn).
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">16 câu (4 đoạn)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap" rowSpan={2}>
                      Part 7
                    </td>
                    <td className="p-2.5 font-semibold text-blue-700">Đoạn đơn (Single Passages)</td>
                    <td className="p-2.5 text-slate-600">
                      Gồm 10 đoạn văn đơn lẻ (thông báo, hóa đơn, tin nhắn, email...). Mỗi đoạn có từ 2 - 4 câu hỏi.
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">29 câu</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-blue-700">Đoạn đa (Multiple Passages)</td>
                    <td className="p-2.5 text-slate-600">
                      Gồm 5 nhóm đoạn văn liên kết (2 bài đoạn đôi Double Passages + 3 bài đoạn ba Triple Passages). Mỗi bài có đúng 5 câu hỏi.
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-900 bg-slate-50">25 câu (5 bài x 5)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Key Business Topics */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 m-0">
              III. Các Chủ Đề Thực Tế Thường Gặp Trong Bài Thi TOEIC
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">🏢 Môi trường văn phòng:</strong> Cuộc họp, thư từ, email, thông báo nội bộ, thiết bị văn phòng, quy trình làm việc.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">💼 Kinh doanh & Doanh nghiệp:</strong> Hợp đồng, thương lượng giá, tiếp thị, bán hàng, hội nghị, chiến lược kinh doanh.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">👥 Nhân sự & Tuyển dụng:</strong> Phỏng vấn, lương thưởng, thăng chức, nghỉ phép, đào tạo nhân viên mới.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">💰 Tài chính & Ngân sách:</strong> Ngân hàng, kế toán, báo cáo doanh thu, đầu tư, thuế, hóa đơn chi phí.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">📦 Mua hàng & Vận chuyển:</strong> Đặt hàng, theo dõi đơn hàng (tracking), khiếu nại giao nhận, vận chuyển hàng hóa.
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">✈️ Du lịch & Khách sạn:</strong> Đặt vé máy bay, lịch trình di chuyển, phòng khách sạn, hoãn/hủy chuyến bay.
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="btn btn-primary px-5 py-2 font-bold text-xs"
              onClick={() => setEtsGuideOpen(false)}
            >
              Đã hiểu & Đóng cẩm nang
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL XEM ẢNH GỐC SẮC NÉT (LIGHTBOX) */}
      <Modal
        isOpen={Boolean(previewImageModalUrl)}
        onClose={() => setPreviewImageModalUrl(null)}
        title="Chi tiết Bức ảnh Mô tả (Part 1 Photograph)"
        maxWidth="820px"
      >
        <div className="space-y-3 p-1">
          {previewImageModalUrl && (
            <div className="bg-slate-950/5 rounded-2xl p-2 flex items-center justify-center border border-slate-200 overflow-hidden">
              <img
                src={previewImageModalUrl}
                alt="Ảnh phóng to"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex-wrap gap-2">
            <span className="truncate max-w-[550px] font-mono text-[11px] text-slate-400">
              {previewImageModalUrl}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm font-bold text-xs"
              onClick={() => setPreviewImageModalUrl(null)}
            >
              Đóng xem ảnh
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestManagementPage;
