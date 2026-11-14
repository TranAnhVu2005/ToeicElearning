import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CheckCircle2,
  CircleX,
  Clock,
  Headphones,
  Layers,
  RefreshCw,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { examService } from '../services/examService';
import { openAiAssistant, syncAiExamResultContext } from '../services/aiService';

const formatDuration = (seconds = 0) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, '0')}`;
};

const TestResultPage = () => {
  const { resultId } = useParams();
  const [searchParams] = useSearchParams();
  const classroomReview = searchParams.get('classroomReview') === '1';
  const [requestAttempt, setRequestAttempt] = useState(0);
  const [loadState, setLoadState] = useState({ key: '', result: null, error: '' });
  const [failedMedia, setFailedMedia] = useState({});
  const [filterMode, setFilterMode] = useState('ALL'); // ALL | WRONG | PART_1..7
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState(null);
  const highlightTimerRef = useRef(null);
  const requestKey = `${resultId}:${classroomReview ? 'teacher' : 'owner'}:${requestAttempt}`;

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (classroomReview
      ? examService.getAssignmentResultDetail(resultId)
      : examService.getTestResultDetail(resultId))
      .then((response) => {
        if (cancelled) return;
        if (response.code === 1000 && response.data) {
          setLoadState({ key: requestKey, result: response.data, error: '' });
          setFailedMedia({});
        } else {
          setLoadState({
            key: requestKey,
            result: null,
            error: response.message || 'Không tìm thấy kết quả bài làm.',
          });
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setLoadState({
            key: requestKey,
            result: null,
            error: requestError.response?.data?.message || 'Không thể tải kết quả bài làm.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey, resultId, classroomReview]);

  const loading = loadState.key !== requestKey;
  const result = loading ? null : loadState.result;
  const error = loading ? '' : loadState.error;

  useEffect(() => {
    if (result) {
      syncAiExamResultContext(result);
    }
    return () => {
      syncAiExamResultContext(null);
    };
  }, [result]);

  const refreshResult = () => {
    setFailedMedia({});
    setRequestAttempt((attempt) => attempt + 1);
  };

  const questions = useMemo(() => (Array.isArray(result?.questions) ? result.questions : []), [result]);
  const availableParts = useMemo(() => {
    const set = new Set(questions.map((q) => q.partNumber).filter(Boolean));
    return [1, 2, 3, 4, 5, 6, 7].filter((p) => set.has(p));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (filterMode === 'WRONG') {
      return questions.filter((q) => !q.isCorrect);
    }
    if (filterMode.startsWith('PART_')) {
      const pNum = Number(filterMode.replace('PART_', ''));
      return questions.filter((q) => q.partNumber === pNum);
    }
    return questions;
  }, [questions, filterMode]);

  const handleJumpToQuestion = (question) => {
    setMobilePaletteOpen(false);
    setActiveQuestionId(question.questionId);
    setHighlightedQuestionId(null);

    // If the question is currently filtered out, switch filter to show it
    if (filterMode === 'WRONG' && question.isCorrect) {
      setFilterMode('ALL');
    } else if (filterMode.startsWith('PART_') && filterMode !== `PART_${question.partNumber}`) {
      setFilterMode('ALL');
    }

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    setTimeout(() => {
      const el = document.getElementById(`review-q-${question.questionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setHighlightedQuestionId(question.questionId);
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedQuestionId((prev) => (prev === question.questionId ? null : prev));
      }, 1800);
    }, 60);
  };

  if (loading) {
    return (
      <main className="neo-brutal-result min-h-screen bg-white px-4 py-16 text-center text-slate-900">
        <div
          className="mx-auto max-w-xl border border-slate-200 bg-slate-50/70 p-8 text-sm font-medium text-slate-600"
          role="status"
        >
          Đang tải chi tiết kết quả và lời giải...
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="neo-brutal-result min-h-screen bg-white px-4 py-16 text-center text-slate-900">
        <section className="mx-auto max-w-xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Không thể mở kết quả bài làm</h1>
          <p role="alert" className="my-4 border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error || 'Kết quả không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={refreshResult}
              className="inline-flex items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#173ea8]"
            >
              <RefreshCw size={15} /> Thử tải lại
            </button>
            <Link
              to="/courses"
              className="inline-flex items-center border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              Quay lại danh sách đề
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const listening = questions.filter((question) => question.partNumber >= 1 && question.partNumber <= 4);
  const reading = questions.filter((question) => question.partNumber >= 5 && question.partNumber <= 7);
  const correctCount = result.correctCount || 0;
  const totalCount = result.totalCount || questions.length || 0;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const wrongQuestions = questions.filter((question) => !question.isCorrect);
  const skippedCount = questions.filter((q) => !q.selectedAnswer).length;
  const incorrectCount = questions.filter((q) => !q.isCorrect && q.selectedAnswer).length;
  const wrongQuestionIds = encodeURIComponent(wrongQuestions.map((question) => question.questionId).join(','));
  const scoreLabel =
    result.scoreType === 'ESTIMATED_SCALED'
      ? `${result.totalScore} / 990`
      : `${correctCount} / ${totalCount} câu đúng`;

  const renderQuestionPalette = (isMobile = false) => (
    <div className="space-y-4">
      {/* Palette Summary Badges */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="border border-emerald-200 bg-emerald-50 p-2">
          <span className="block text-base font-bold text-emerald-800 tabular-nums">{correctCount}</span>
          <span className="text-[11px] font-semibold text-emerald-700">Đúng</span>
        </div>
        <div className="border border-red-200 bg-red-50 p-2">
          <span className="block text-base font-bold text-red-800 tabular-nums">{incorrectCount}</span>
          <span className="text-[11px] font-semibold text-red-700">Sai</span>
        </div>
        <div className="border border-amber-200 bg-amber-50 p-2">
          <span className="block text-base font-bold text-amber-800 tabular-nums">{skippedCount}</span>
          <span className="text-[11px] font-semibold text-amber-700">Bỏ trống</span>
        </div>
      </div>

      {/* Palette Questions Grouped by Part */}
      <div className="space-y-4">
        {availableParts.map((pNum) => {
          const partQuestions = questions.filter((q) => q.partNumber === pNum);
          if (partQuestions.length === 0) return null;
          const partCorrect = partQuestions.filter((q) => q.isCorrect).length;

          return (
            <div key={pNum} className="border-t border-slate-200 pt-3">
              <div className="mb-2 flex items-center justify-between text-[14px] font-semibold text-slate-700">
                <span>Part {pNum}</span>
                <span className="text-[13px] font-semibold text-slate-500 tabular-nums">
                  {partCorrect}/{partQuestions.length} đúng
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {partQuestions.map((q) => {
                  const isSkipped = !q.selectedAnswer;
                  const isCorrect = q.isCorrect;
                  const isActiveTarget = activeQuestionId === q.questionId;
                  const stateClass = isCorrect
                    ? 'is-correct border-emerald-300 bg-emerald-50 text-emerald-800'
                    : isSkipped
                    ? 'is-skipped border-slate-300 bg-white text-slate-700'
                    : 'is-wrong border-red-300 bg-red-50 text-red-800';

                  return (
                    <button
                      key={q.questionId}
                      type="button"
                      onClick={() => handleJumpToQuestion(q)}
                      aria-current={isActiveTarget ? 'true' : undefined}
                      className={`result-palette-btn flex h-8 cursor-pointer items-center justify-center border text-[13px] font-semibold tabular-nums transition hover:border-[#1D4ED8] hover:text-[#1D4ED8] ${stateClass} ${
                        isActiveTarget ? 'palette-btn-active' : ''
                      }`}
                      title={`Câu ${q.questionNumber} (Part ${q.partNumber}): ${
                        isCorrect ? 'ĐÚNG' : isSkipped ? 'BỎ TRỐNG' : 'CHƯA ĐÚNG'
                      }`}
                    >
                      {q.questionNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column Action Links */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={() => {
            if (isMobile) setMobilePaletteOpen(false);
            openAiAssistant({
              result,
              question: null,
            });
          }}
          className="flex w-full cursor-pointer items-center justify-center gap-2 border border-blue-200 bg-[#EFF6FF] py-2 text-center text-xs font-bold text-[#1D4ED8] transition-colors hover:border-[#1D4ED8] hover:bg-blue-100"
        >
          <Sparkles size={14} /> Hỏi Trợ lý AI về bài thi
        </button>
        {!classroomReview && wrongQuestions.length > 0 && (
          <Link
            to={`/courses/${result.testId}/take?mode=practice&time=0&sourceResultId=${result.testResultId}&questionIds=${wrongQuestionIds}`}
            onClick={() => isMobile && setMobilePaletteOpen(false)}
            className="flex w-full items-center justify-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#173ea8]"
          >
            <RotateCcw size={14} /> Luyện lại {wrongQuestions.length} câu sai
          </Link>
        )}
        <Link
          to={`/courses/${result.testId}/take?mode=full`}
          onClick={() => isMobile && setMobilePaletteOpen(false)}
          className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-white py-2 text-center text-xs font-semibold text-slate-800 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
        >
          Làm lại đề này
        </Link>
      </div>
    </div>
  );

  return (
    <main className="neo-brutal-result min-h-screen bg-[#FDFCFB] px-4 py-8 pb-20 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={classroomReview ? '/classrooms' : `/courses/${result.testId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#1D4ED8]"
          >
            <ArrowLeft size={17} />
            {classroomReview ? 'Quay lại không gian Lớp học' : 'Quay lại thông tin đề thi'}
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobilePaletteOpen(true)}
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 tabular-nums hover:border-[#1D4ED8] hover:text-[#1D4ED8] lg:hidden"
            >
              <Layers size={14} /> Bảng câu hỏi ({correctCount}/{totalCount})
            </button>
            <button
              type="button"
              onClick={refreshResult}
              className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
            >
              <RefreshCw size={13} /> Làm mới dữ liệu
            </button>
          </div>
        </div>

        {/* 2-COLUMN MAIN WORKSPACE */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
          {/* ================= LEFT MAIN WORKSPACE ================= */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Summary Header Card */}
            <section className="border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <p className="editorial-eyebrow text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
                BÁO CÁO KẾT QUẢ & LỜI GIẢI CHI TIẾT
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{result.testTitle}</h1>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="border border-blue-200 bg-[#EFF6FF] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                    {result.scoreType === 'ESTIMATED_SCALED' ? 'Điểm quy đổi ước tính' : 'Kết quả chấm điểm'}
                  </span>
                  <p className="mt-1.5 text-2xl font-bold text-[#1D4ED8] tabular-nums">{scoreLabel}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Độ chính xác: <strong className="tabular-nums">{accuracy}%</strong> ({correctCount}/{totalCount} câu)
                  </p>
                </div>

                {listening.length > 0 && (
                  <div className="border border-slate-200 bg-slate-50/70 p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <Headphones size={13} className="text-[#1D4ED8]" /> Listening
                    </span>
                    <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
                      {result.scoreType === 'ESTIMATED_SCALED'
                        ? `${result.listeningScore} / 495`
                        : `${listening.filter((q) => q.isCorrect).length}/${listening.length} câu`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Đúng {listening.filter((q) => q.isCorrect).length} / {listening.length} câu nghe
                    </p>
                  </div>
                )}

                {reading.length > 0 && (
                  <div className="border border-slate-200 bg-slate-50/70 p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <BookOpen size={13} className="text-[#1D4ED8]" /> Reading
                    </span>
                    <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
                      {result.scoreType === 'ESTIMATED_SCALED'
                        ? `${result.readingScore} / 495`
                        : `${reading.filter((q) => q.isCorrect).length}/${reading.length} câu`}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Đúng {reading.filter((q) => q.isCorrect).length} / {reading.length} câu đọc
                    </p>
                  </div>
                )}

                <div className="border border-slate-200 bg-slate-50/70 p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                    <Clock size={13} className="text-[#1D4ED8]" /> Thời gian hoàn thành
                  </span>
                  <p className="mt-1.5 text-xl font-bold text-slate-900 tabular-nums">
                    {formatDuration(result.totalTime)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Ghi nhận trên máy chủ</p>
                </div>
              </div>

              {result.scoreType === 'ESTIMATED_SCALED' && (
                <p className="mt-3 text-xs text-slate-500">
                  * Điểm quy đổi là mức ước tính phục vụ tham khảo luyện tập, không thay thế phiếu điểm ETS chính thức.
                </p>
              )}

              {result.assignmentId && (
                <div
                  className={`mt-4 border p-3.5 text-sm font-semibold ${
                    result.lateSubmission
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {result.lateSubmission ? 'Bài tập lớp học: Nộp sau thời hạn (Nộp trễ).' : 'Bài tập lớp học: Đã nộp đúng hạn.'}
                </div>
              )}

              {!classroomReview && result.sourceResultId && (
                <div className="mt-4 border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-700">
                  Đây là lượt luyện tập lại câu sai từ{' '}
                  <Link to={`/results/${result.sourceResultId}`} className="font-semibold text-[#1D4ED8] underline">
                    bài làm gốc
                  </Link>
                  .
                </div>
              )}

              {result.teacherComment && (
                <div className="mt-4 border border-blue-200 bg-[#EFF6FF]/60 p-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1D4ED8]">
                    Nhận xét từ Giảng viên phụ trách
                  </h2>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-800">{result.teacherComment}</p>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-5">
                {!classroomReview && wrongQuestions.length > 0 && (
                  <Link
                    to={`/courses/${result.testId}/take?mode=practice&time=0&sourceResultId=${result.testResultId}&questionIds=${wrongQuestionIds}`}
                    className="inline-flex min-h-[42px] items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173ea8]"
                  >
                    <RotateCcw size={15} />
                    Luyện lại {wrongQuestions.length} câu sai / bỏ trống
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() =>
                    openAiAssistant({
                      result,
                      question: null,
                      autoPrompt:
                        'Hãy phân tích tổng quan kết quả bài thi này của tôi, chỉ ra Part nào tôi làm tốt, Part nào cần cải thiện và gợi ý lộ trình ôn tập.',
                    })
                  }
                  className="inline-flex min-h-[42px] cursor-pointer items-center gap-2 border border-blue-300 bg-[#EFF6FF] px-5 py-2.5 text-sm font-bold text-[#1D4ED8] transition-colors hover:border-[#1D4ED8] hover:bg-blue-100"
                >
                  <Sparkles size={16} />
                  Phân tích bài làm cùng Trợ lý AI
                </button>
              </div>
            </section>

            {/* Filter Bar */}
            {questions.length > 0 && (
              <section className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50/70 p-4">
                <span className="text-sm font-semibold text-slate-700">
                  Đang hiển thị <strong className="tabular-nums">{filteredQuestions.length}</strong> / {questions.length} câu hỏi
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterMode('ALL')}
                    className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filterMode === 'ALL'
                        ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                    }`}
                  >
                    Tất cả ({questions.length})
                  </button>
                  {wrongQuestions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterMode('WRONG')}
                      className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        filterMode === 'WRONG'
                          ? 'border-red-600 bg-red-600 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-red-500 hover:text-red-700'
                      }`}
                    >
                      Câu sai / bỏ trống ({wrongQuestions.length})
                    </button>
                  )}
                  {availableParts.map((pNum) => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setFilterMode(`PART_${pNum}`)}
                      className={`border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        filterMode === `PART_${pNum}`
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]'
                      }`}
                    >
                      Part {pNum}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Question Review Cards */}
            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="border border-slate-200 bg-slate-50/50 p-10 text-center text-sm text-slate-600">
                  Không có câu hỏi nào trong bộ lọc này.
                </div>
              ) : (
                filteredQuestions.map((question) => {
                  const isJumpHighlighted = highlightedQuestionId === question.questionId;
                  const isActiveTarget = activeQuestionId === question.questionId;

                  return (
                    <article
                      key={question.questionId}
                      id={`review-q-${question.questionId}`}
                      className={`border border-slate-200 bg-white p-5 sm:p-6 transition-all duration-300 ${
                        isJumpHighlighted
                          ? 'question-jump-highlight ring-2 ring-emerald-500'
                          : isActiveTarget
                          ? 'question-active-target'
                          : ''
                      }`}
                    >
                      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 min-w-[30px] items-center justify-center border px-2 text-xs font-bold tabular-nums transition-colors ${
                              isJumpHighlighted
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : isActiveTarget
                                ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                                : 'border-slate-300 bg-slate-100 text-slate-900'
                            }`}
                          >
                            #{question.questionNumber}
                          </span>
                          <h2 className="text-base font-semibold text-slate-900">
                            Câu {question.questionNumber} · Part {question.partNumber}
                          </h2>
                        </div>
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold ${
                          question.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-red-200 bg-red-50 text-red-800'
                        }`}
                      >
                        {question.isCorrect ? <CheckCircle2 size={14} /> : <CircleX size={14} />}
                        {question.isCorrect ? 'ĐÚNG' : question.selectedAnswer ? 'CHƯA ĐÚNG' : 'BỎ TRỐNG'}
                      </span>
                    </header>

                    {question.audioUrl && (
                      <div className="mb-4 flex items-center gap-3 border border-slate-200 bg-slate-50 p-3">
                        <Headphones size={17} className="shrink-0 text-[#1D4ED8]" />
                        <audio
                          controls
                          preload="none"
                          className="h-9 w-full"
                          onError={() =>
                            setFailedMedia((current) => ({ ...current, [`${question.questionId}:audio`]: true }))
                          }
                        >
                          <source src={question.audioUrl} />
                        </audio>
                      </div>
                    )}

                    {failedMedia[`${question.questionId}:audio`] && (
                      <p role="alert" className="mb-3 border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                        Không tải được audio. Liên kết media có thể đã hết hạn.{' '}
                        <button type="button" onClick={refreshResult} className="ml-1 font-semibold underline">
                          Làm mới liên kết
                        </button>
                      </p>
                    )}

                    {question.imageUrl && !failedMedia[`${question.questionId}:image`] && (
                      <div className="mb-4 border border-slate-200 bg-slate-50/50 p-3 text-center">
                        <img
                          src={question.imageUrl}
                          alt={`Hình câu ${question.questionNumber}`}
                          onError={() =>
                            setFailedMedia((current) => ({ ...current, [`${question.questionId}:image`]: true }))
                          }
                          className="mx-auto max-h-80 object-contain"
                        />
                      </div>
                    )}

                    {failedMedia[`${question.questionId}:image`] && (
                      <p role="alert" className="mb-3 border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
                        Không tải được hình ảnh câu hỏi.{' '}
                        <button type="button" onClick={refreshResult} className="ml-1 font-semibold underline">
                          Thử tải lại
                        </button>
                      </p>
                    )}

                    {(question.paragraph || question.passage) && (
                      <div className="mb-4 border border-slate-200 bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-serif">
                        {question.paragraph || question.passage}
                      </div>
                    )}

                    {(question.questionContent || question.questionText) && (
                      <p className="mb-4 text-base font-medium text-slate-900">
                        {question.questionContent || question.questionText}
                      </p>
                    )}

                    {/* Options list */}
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((optionKey) => {
                        const optionText = question[`option${optionKey}`];
                        if (!optionText && optionKey === 'D' && question.partNumber === 2) {
                          return null;
                        }

                        const isCorrectKey = question.correctAnswer?.toUpperCase() === optionKey;
                        const isSelectedKey = question.selectedAnswer?.toUpperCase() === optionKey;

                        let rowStyle = 'border-slate-200 bg-white text-slate-800';
                        if (isCorrectKey) {
                          rowStyle = 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium';
                        } else if (isSelectedKey && !isCorrectKey) {
                          rowStyle = 'border-red-300 bg-red-50/70 text-red-950';
                        }

                        return (
                          <div
                            key={optionKey}
                            className={`flex items-start justify-between gap-3 border p-3 text-sm transition-colors ${rowStyle}`}
                          >
                            <span className="flex items-start gap-2.5">
                              <span className="font-bold text-slate-700">{optionKey}.</span>
                              <span>{optionText || `(${optionKey})`}</span>
                            </span>

                            <span className="flex shrink-0 items-center gap-1.5 text-xs">
                              {isCorrectKey && (
                                <span className="border border-emerald-300 bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                                  ĐÁP ÁN ĐÚNG
                                </span>
                              )}
                              {isSelectedKey && (
                                <span
                                  className={`border px-2 py-0.5 font-bold ${
                                    isCorrectKey
                                      ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                                      : 'border-red-300 bg-white text-red-800'
                                  }`}
                                >
                                  BẠN CHỌN
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {question.transcript && (
                      <details className="mt-4 border border-slate-200 bg-slate-50/60 p-3.5 text-sm">
                        <summary className="cursor-pointer font-semibold text-slate-800">
                          Xem lời thoại âm thanh (Transcript)
                        </summary>
                        <p className="mt-2.5 whitespace-pre-wrap border-t border-slate-200 pt-2.5 text-slate-700">
                          {question.transcript}
                        </p>
                      </details>
                    )}

                    {question.translation && (
                      <details className="mt-3 border border-slate-200 bg-slate-50/60 p-3.5 text-sm">
                        <summary className="cursor-pointer font-semibold text-slate-800">
                          Xem bản dịch tiếng Việt (Translation)
                        </summary>
                        <p className="mt-2.5 whitespace-pre-wrap border-t border-slate-200 pt-2.5 text-slate-700">
                          {question.translation}
                        </p>
                      </details>
                    )}

                    {question.explanation && (
                      <div className="mt-4 border border-blue-200 bg-[#EFF6FF]/60 p-4 text-sm">
                        <div className="flex items-center gap-2 font-semibold text-[#1D4ED8]">
                          <BookOpen size={15} /> Giải thích đáp án
                        </div>
                        <p className="mt-1.5 whitespace-pre-wrap text-slate-800">{question.explanation}</p>
                      </div>
                    )}

                    {/* AI Tutor Contextual Action Bar for this Question */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-200 pt-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                          <Bot size={14} className="text-[#1D4ED8]" />
                          Trợ lý AI:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openAiAssistant({
                              result,
                              question,
                              autoPrompt: `Giải thích chi tiết vì sao câu ${question.questionNumber} (Part ${question.partNumber}) chọn đáp án ${question.correctAnswer} và vì sao loại các phương án còn lại.`,
                            })
                          }
                          className="cursor-pointer border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-bold text-[#1D4ED8] transition-colors hover:border-[#1D4ED8] hover:bg-blue-100"
                        >
                          Giải thích đáp án
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openAiAssistant({
                              result,
                              question,
                              autoPrompt: `Phân tích cấu trúc ngữ pháp và liệt kê các từ vựng / collocations TOEIC quan trọng trong câu ${question.questionNumber}.`,
                            })
                          }
                          className="cursor-pointer border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        >
                          Từ vựng & Ngữ pháp
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            openAiAssistant({
                              result,
                              question,
                              autoPrompt: `Chỉ ra các bẫy ETS thường gặp ở dạng câu ${question.questionNumber} (Part ${question.partNumber}) này và mẹo làm bài nhanh.`,
                            })
                          }
                          className="cursor-pointer border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
                        >
                          Mẹo tránh bẫy
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openAiAssistant({
                            result,
                            question,
                          })
                        }
                        className="inline-flex cursor-pointer items-center gap-1.5 border border-[#1D4ED8] bg-[#1D4ED8] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#173ea8]"
                      >
                        <Sparkles size={13} />
                        Hỏi bất kỳ điều gì về câu #{question.questionNumber}
                      </button>
                    </div>
                  </article>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT STICKY SIDEBAR ================= */}
          <aside className="sticky top-[88px] hidden h-[calc(100vh-108px)] overflow-y-auto pr-1 lg:block">
            <div className="flex flex-col gap-4 border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Danh sách câu hỏi
                </div>
                <div className="text-xs font-bold text-slate-900 tabular-nums">
                  {questions.length} câu
                </div>
              </div>

              {renderQuestionPalette(false)}
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE QUESTIONS PALETTE DRAWER */}
      {mobilePaletteOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50"
          onClick={() => setMobilePaletteOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-sm flex-col gap-4 overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Danh sách câu hỏi</h3>
                <p className="text-xs text-slate-500">
                  Đã làm đúng {correctCount} / {totalCount} câu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                className="border border-slate-300 bg-white p-1.5 text-slate-700 hover:border-slate-400"
                aria-label="Đóng bảng câu hỏi"
              >
                <X size={18} />
              </button>
            </div>

            {renderQuestionPalette(true)}
          </div>
        </div>
      )}
    </main>
  );
};

export default TestResultPage;
