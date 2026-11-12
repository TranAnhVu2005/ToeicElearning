import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleX,
  Clock,
  Headphones,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { examService } from '../services/examService';

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
  const requestKey = `${resultId}:${classroomReview ? 'teacher' : 'owner'}:${requestAttempt}`;

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
  const wrongQuestionIds = encodeURIComponent(wrongQuestions.map((question) => question.questionId).join(','));
  const scoreLabel =
    result.scoreType === 'ESTIMATED_SCALED'
      ? `${result.totalScore} / 990`
      : `${correctCount} / ${totalCount} câu đúng`;

  return (
    <main className="neo-brutal-result min-h-screen bg-white px-4 py-8 pb-28 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Back Link */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={classroomReview ? '/classrooms' : `/courses/${result.testId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-[#1D4ED8]"
          >
            <ArrowLeft size={17} />
            {classroomReview ? 'Quay lại không gian Lớp học' : 'Quay lại thông tin đề thi'}
          </Link>
          <button
            type="button"
            onClick={refreshResult}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
          >
            <RefreshCw size={13} /> Làm mới dữ liệu
          </button>
        </div>

        {/* Summary Header Card */}
        <section className="border border-slate-200 bg-white p-6 sm:p-8">
          <p className="editorial-eyebrow font-mono text-xs font-semibold uppercase tracking-widest text-[#1D4ED8]">
            BÁO CÁO KẾT QUẢ & LỜI GIẢI CHI TIẾT
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">{result.testTitle}</h1>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border border-blue-200 bg-[#EFF6FF] p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1D4ED8]">
                {result.scoreType === 'ESTIMATED_SCALED' ? 'Điểm quy đổi ước tính' : 'Kết quả chấm điểm'}
              </span>
              <p className="mt-1.5 font-mono text-2xl font-bold text-[#1D4ED8]">{scoreLabel}</p>
              <p className="mt-1 text-xs text-slate-600">
                Độ chính xác: <strong className="font-mono">{accuracy}%</strong> ({correctCount}/{totalCount} câu)
              </p>
            </div>

            {listening.length > 0 && (
              <div className="border border-slate-200 bg-slate-50/70 p-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <Headphones size={13} className="text-[#1D4ED8]" /> Listening
                </span>
                <p className="mt-1.5 font-mono text-xl font-bold text-slate-900">
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
                <p className="mt-1.5 font-mono text-xl font-bold text-slate-900">
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
              <p className="mt-1.5 font-mono text-xl font-bold text-slate-900">
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

          {!classroomReview && wrongQuestions.length > 0 && (
            <div className="mt-5 border-t border-slate-200 pt-5">
              <Link
                to={`/courses/${result.testId}/take?mode=practice&time=0&sourceResultId=${result.testResultId}&questionIds=${wrongQuestionIds}`}
                className="inline-flex min-h-[42px] items-center gap-2 border border-[#1D4ED8] bg-[#1D4ED8] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#173ea8]"
              >
                <RotateCcw size={15} />
                Luyện lại {wrongQuestions.length} câu sai / bỏ trống
              </Link>
            </div>
          )}
        </section>

        {/* Filter Bar */}
        {questions.length > 0 && (
          <section className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-slate-50/70 p-4">
            <span className="text-sm font-semibold text-slate-700">
              Đang hiển thị <strong className="font-mono">{filteredQuestions.length}</strong> / {questions.length} câu hỏi
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
            filteredQuestions.map((question) => (
              <article
                key={question.questionId}
                id={`review-q-${question.questionId}`}
                className="border border-slate-200 bg-white p-5 sm:p-6"
              >
                <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 min-w-[28px] items-center justify-center border border-slate-300 bg-slate-100 px-2 font-mono text-xs font-bold text-slate-900">
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
                    Không tải được hình minh họa.{' '}
                    <button type="button" onClick={refreshResult} className="ml-1 font-semibold underline">
                      Làm mới liên kết
                    </button>
                  </p>
                )}

                {question.paragraph && (
                  <div className="mb-4 whitespace-pre-wrap border border-slate-200 border-l-4 border-l-[#1D4ED8] bg-slate-50/70 p-4 text-sm leading-relaxed text-slate-800">
                    {question.paragraph}
                  </div>
                )}

                {question.questionContent && (
                  <p className="mb-3 text-sm font-semibold text-slate-900">{question.questionContent}</p>
                )}

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {(question.partNumber === 1
                    ? ['A', 'B', 'C', 'D']
                    : question.partNumber === 2
                      ? ['A', 'B', 'C']
                      : ['A', 'B', 'C', 'D'].filter((option) => question[`option${option}`])
                  ).map((option) => {
                    const value = question[`option${option}`];
                    const isCorrect = question.correctAnswer === option;
                    const isSelected = question.selectedAnswer === option;
                    return (
                      <div
                        key={option}
                        className={`flex items-center justify-between gap-2 border p-3 text-sm ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50/80 font-semibold text-emerald-950'
                            : isSelected
                              ? 'border-red-300 bg-red-50/80 font-medium text-red-900'
                              : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span>
                          <strong className="font-mono">{option}.</strong>
                          {value ? ` ${value}` : ''}
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5">
                          {isCorrect && (
                            <span className="border border-emerald-300 bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-800">
                              ĐÁP ÁN ĐÚNG
                            </span>
                          )}
                          {isSelected && (
                            <span
                              className={`border px-2 py-0.5 font-mono text-[11px] font-bold ${
                                isCorrect
                                  ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
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

                {question.explanation && (
                  <div className="mt-4 border border-blue-200 bg-[#EFF6FF]/60 p-4 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-[#1D4ED8]">
                      <BookOpen size={15} /> Giải thích đáp án
                    </div>
                    <p className="mt-1.5 whitespace-pre-wrap text-slate-800">{question.explanation}</p>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* Bottom Floating Quick Jump Bar */}
        {questions.length > 0 && (
          <nav
            className="fixed bottom-4 right-4 z-20 flex max-w-[92vw] items-center gap-1.5 overflow-x-auto border border-slate-300 bg-white p-2.5 shadow-lg"
            aria-label="Điều hướng nhanh câu hỏi"
          >
            {filteredQuestions.map((question) => (
              <button
                key={question.questionId}
                type="button"
                onClick={() =>
                  document
                    .getElementById(`review-q-${question.questionId}`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                className={`min-w-[34px] border px-2 py-1 font-mono text-xs font-bold transition-colors ${
                  question.isCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100'
                }`}
              >
                {question.questionNumber}
              </button>
            ))}
          </nav>
        )}
      </div>
    </main>
  );
};

export default TestResultPage;
