import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CircleX, Headphones, BookOpen } from 'lucide-react';
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
  const requestKey = `${resultId}:${classroomReview ? 'teacher' : 'owner'}:${requestAttempt}`;

  useEffect(() => {
    let cancelled = false;
    (classroomReview ? examService.getAssignmentResultDetail(resultId) : examService.getTestResultDetail(resultId))
      .then((response) => {
        if (cancelled) return;
        if (response.code === 1000 && response.data) {
          setLoadState({ key: requestKey, result: response.data, error: '' });
          setFailedMedia({});
        } else {
          setLoadState({ key: requestKey, result: null, error: response.message || 'Không tìm thấy kết quả bài làm.' });
        }
      })
      .catch((requestError) => {
        if (!cancelled) setLoadState({
          key: requestKey,
          result: null,
          error: requestError.response?.data?.message || 'Không thể tải kết quả bài làm.',
        });
      });
    return () => { cancelled = true; };
  }, [requestKey, resultId, classroomReview]);

  const loading = loadState.key !== requestKey;
  const result = loading ? null : loadState.result;
  const error = loading ? '' : loadState.error;
  const refreshResult = () => {
    setFailedMedia({});
    setRequestAttempt((attempt) => attempt + 1);
  };

  if (loading) return <main className="neo-brutal-result min-h-screen bg-[#FFFDF2] px-4 py-16 text-center text-[#111]"><div className="mx-auto max-w-xl border-2 border-black bg-white p-8 font-black shadow-[4px_4px_0_#111]" role="status">Đang tải kết quả...</div></main>;
  if (error || !result) return (
    <main className="neo-brutal-result min-h-screen bg-[#FFFDF2] px-4 py-16 text-center text-[#111]">
      <section className="mx-auto max-w-xl border-2 border-black bg-white p-8 shadow-[4px_4px_0_#111]">
        <h1 className="text-2xl font-black">Không thể mở kết quả</h1>
        <p role="alert" className="my-4 font-semibold">{error || 'Kết quả không tồn tại.'}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={refreshResult} className="border-2 border-black bg-[#FFE600] px-4 py-3 font-black shadow-[3px_3px_0_#111]">Thử tải lại</button>
          <Link to="/courses" className="inline-flex border-2 border-black bg-white px-4 py-3 font-black shadow-[3px_3px_0_#111]">Quay lại danh sách đề</Link>
        </div>
      </section>
    </main>
  );

  const questions = Array.isArray(result.questions) ? result.questions : [];
  const listening = questions.filter((question) => question.partNumber >= 1 && question.partNumber <= 4);
  const reading = questions.filter((question) => question.partNumber >= 5 && question.partNumber <= 7);
  const correctCount = result.correctCount || 0;
  const wrongQuestions = questions.filter((question) => !question.isCorrect);
  const wrongQuestionIds = encodeURIComponent(wrongQuestions.map((question) => question.questionId).join(','));
  const scoreLabel = result.scoreType === 'ESTIMATED_SCALED'
    ? `${result.totalScore} / 990 (điểm ước tính)`
    : `${correctCount} / ${result.totalCount} câu đúng`;

  return (
    <main className="neo-brutal-result min-h-screen bg-[#FFFDF2] px-4 py-8 pb-28 text-[#111] sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to={`/courses/${result.testId}`} className="inline-flex items-center gap-2 font-bold underline underline-offset-4">
          <ArrowLeft size={18} /> Quay lại đề thi
        </Link>
        <section className="border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111]">
          <p className="text-sm font-black uppercase tracking-wide">Kết quả bài làm</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">{result.testTitle}</h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="border-2 border-black bg-[#FFE600] px-3 py-2">Điểm: <strong>{scoreLabel}</strong></span>
            {listening.length > 0 && <span className="border-2 border-black bg-white px-3 py-2">Listening{result.scoreType === 'ESTIMATED_SCALED' ? ' (ước tính)' : ''}: <strong>{result.scoreType === 'ESTIMATED_SCALED' ? `${result.listeningScore} / 495 · ` : ''}{listening.filter((q) => q.isCorrect).length}/{listening.length} câu đúng</strong></span>}
            {reading.length > 0 && <span className="border-2 border-black bg-white px-3 py-2">Reading{result.scoreType === 'ESTIMATED_SCALED' ? ' (ước tính)' : ''}: <strong>{result.scoreType === 'ESTIMATED_SCALED' ? `${result.readingScore} / 495 · ` : ''}{reading.filter((q) => q.isCorrect).length}/{reading.length} câu đúng</strong></span>}
            <span className="border-2 border-black bg-[#F1EEDF] px-3 py-2">Thời gian: <strong>{formatDuration(result.totalTime)}</strong></span>
          </div>
          {result.scoreType === 'ESTIMATED_SCALED' && <p className="mt-3 text-xs font-semibold">Điểm quy đổi là ước tính theo mô hình luyện tập, không phải kết quả thi TOEIC chính thức.</p>}
          {result.assignmentId && <p className={`mt-4 border-2 border-black p-3 font-black ${result.lateSubmission ? 'bg-amber-200' : 'bg-lime-200'}`}>{result.lateSubmission ? 'Bài tập đã nộp trễ.' : 'Bài nộp trong hạn.'}</p>}
          {!classroomReview && result.sourceResultId && <p className="mt-4 border-2 border-black bg-[#F1EEDF] p-3 font-bold">Đây là lượt luyện câu sai từ <Link to={`/results/${result.sourceResultId}`} className="font-black underline">bài làm gốc</Link>.</p>}
          {result.teacherComment && <div className="mt-4 border-2 border-black bg-[#FFDBE6] p-4"><h2 className="font-black">Nhận xét của giáo viên</h2><p className="mt-2 whitespace-pre-wrap">{result.teacherComment}</p></div>}
          {!classroomReview && wrongQuestions.length > 0 && <Link to={`/courses/${result.testId}/take?mode=practice&time=0&sourceResultId=${result.testResultId}&questionIds=${wrongQuestionIds}`} className="mt-5 inline-flex border-2 border-black bg-[#d7f36b] px-4 py-3 font-black shadow-[3px_3px_0_#111]">Luyện lại {wrongQuestions.length} câu sai / bỏ trống</Link>}
        </section>

        <div className="space-y-5">
          {questions.length === 0 ? <div className="border-2 border-dashed border-black bg-white p-8 text-center font-bold">Kết quả này chưa có dữ liệu câu hỏi để xem lại.</div> : questions.map((question) => (
            <article key={question.questionId} id={`review-q-${question.questionId}`} className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#111]">
              <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-3">
                <h2 className="font-black">Câu {question.questionNumber} · Part {question.partNumber}</h2>
                <span className={`inline-flex items-center gap-1.5 border-2 border-black px-2 py-1 text-xs font-black ${question.isCorrect ? 'bg-lime-300' : 'bg-rose-300'}`}>
                  {question.isCorrect ? <CheckCircle2 size={15} /> : <CircleX size={15} />}
                  {question.isCorrect ? 'ĐÚNG' : 'CHƯA ĐÚNG'}
                </span>
              </header>
              {question.audioUrl && (
                <div className="mb-3 flex items-center gap-2 font-bold"><Headphones size={17} />
                  <audio controls preload="none" className="w-full" onError={() => setFailedMedia((current) => ({ ...current, [`${question.questionId}:audio`]: true }))}><source src={question.audioUrl} /></audio>
                </div>
              )}
              {failedMedia[`${question.questionId}:audio`] && <p role="alert" className="mb-3 border-2 border-black bg-amber-200 p-3 text-sm font-bold">Không tải được audio. Liên kết media có thể đã hết hạn. <button type="button" onClick={refreshResult} className="ml-1 underline underline-offset-2">Làm mới liên kết</button></p>}
              {question.imageUrl && !failedMedia[`${question.questionId}:image`] && <img src={question.imageUrl} alt={`Hình câu ${question.questionNumber}`} onError={() => setFailedMedia((current) => ({ ...current, [`${question.questionId}:image`]: true }))} className="mb-3 max-h-80 border-2 border-black object-contain" />}
              {failedMedia[`${question.questionId}:image`] && <p role="alert" className="mb-3 border-2 border-black bg-amber-200 p-3 text-sm font-bold">Không tải được hình. Liên kết media có thể đã hết hạn. <button type="button" onClick={refreshResult} className="ml-1 underline underline-offset-2">Làm mới liên kết</button></p>}
              {question.paragraph && <div className="mb-3 whitespace-pre-wrap border-2 border-black bg-[#fffdf2] p-4">{question.paragraph}</div>}
              {question.questionContent && <p className="mb-3 font-semibold">{question.questionContent}</p>}
              <div className="grid gap-2 sm:grid-cols-2">
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
                    <div key={option} className={`border-2 border-black p-3 ${isCorrect ? 'bg-lime-200' : isSelected ? 'bg-rose-200' : 'bg-white'}`}>
                      <strong>{option}.</strong>{value ? ` ${value}` : ''}
                      {isCorrect && <span className="ml-2 text-xs font-black">ĐÁP ÁN</span>}
                      {isSelected && <span className="ml-2 text-xs font-black">BẠN CHỌN</span>}
                    </div>
                  );
                })}
              </div>
              {question.transcript && <details className="mt-4 border-2 border-black p-3"><summary className="cursor-pointer font-black">Nghe lại transcript</summary><p className="mt-2 whitespace-pre-wrap">{question.transcript}</p></details>}
              {question.explanation && <div className="mt-4 border-2 border-black bg-yellow-200 p-3"><div className="flex items-center gap-2 font-black"><BookOpen size={16} /> Giải thích</div><p className="mt-1 whitespace-pre-wrap">{question.explanation}</p></div>}
            </article>
          ))}
        </div>
        {questions.length > 0 && <nav className="fixed bottom-4 right-4 z-20 flex max-w-[90vw] gap-1 overflow-x-auto border-2 border-black bg-[#FFE600] p-2 shadow-[4px_4px_0_#111]" aria-label="Điều hướng câu hỏi">
          {questions.map((question) => (
            <button key={question.questionId} type="button" onClick={() => document.getElementById(`review-q-${question.questionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className={`min-w-9 border-2 border-black px-2 py-1 text-xs font-black ${question.isCorrect ? 'bg-lime-300' : 'bg-rose-300'}`}>{question.questionNumber}</button>
          ))}
        </nav>}
      </div>
    </main>
  );
};

export default TestResultPage;
