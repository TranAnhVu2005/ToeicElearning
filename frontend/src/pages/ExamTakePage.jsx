import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  Award,
  BookOpen,
  Headphones,
  Check,
  X,
  FileText,
  Layers,
  ArrowLeft,
  Eye,
  Send,
  Sparkles,
} from 'lucide-react';
import { examService } from '../services/examService';

// Default mock questions generator if contextQuestions don't have questions array yet (backend gotcha)
const generateFallbackQuestions = (cq, baseNum) => {
  const partNum = cq.part?.partNumber || 1;
  const questionsCount = (partNum === 1 || partNum === 2) ? 1 : (partNum === 3 || partNum === 4 || partNum === 6) ? 3 : 4;
  
  const sampleData = {
    1: [
      { q: "Where is the woman standing?", a: "Near the display rack", b: "Next to the cashier counter", c: "Outside the entrance", d: "On the escalators", correct: "A", exp: "Người phụ nữ đang đứng cạnh kệ trưng bày hàng hóa." }
    ],
    2: [
      { q: "When will the quarterly financial report be ready?", a: "By tomorrow afternoon.", b: "Yes, I reported it.", c: "In the conference room.", d: "Mr. David called.", correct: "A", exp: "Câu hỏi 'When' hỏi thời gian, câu trả lời 'By tomorrow afternoon' là chính xác." }
    ],
    3: [
      { q: "What problem does the man mention?", a: "A machine is out of order.", b: "A flight was canceled.", c: "A client changed the order.", d: "Traffic is heavy.", correct: "C", exp: "Khách hàng vừa gọi thông báo thay đổi số lượng đơn hàng." },
      { q: "What does the woman offer to do?", a: "Call the logistics manager.", b: "Print the updated invoice.", c: "Cancel the shipment.", d: "Contact the supplier.", correct: "A", exp: "Người phụ nữ đề nghị liên lạc ngay với giám đốc vận chuyển." },
      { q: "What will happen next week?", a: "A company audit.", b: "A product launch.", c: "A branch opening.", d: "Staff training.", correct: "B", exp: "Tuần sau sẽ diễn ra buổi ra mắt sản phẩm mới." }
    ],
    5: [
      { q: "The regional manager requested that all department heads _______ their monthly summaries by Friday.", a: "submit", b: "submits", c: "submitted", d: "submitting", correct: "A", exp: "Cấu trúc bàng thái cách giả định: request that + S + (should) V-bare." }
    ],
    7: [
      { q: "What is the main purpose of this announcement?", a: "To announce an office renovation schedule.", b: "To introduce a new policy.", c: "To invite staff to a party.", d: "To conduct a survey.", correct: "A", exp: "Đoạn đầu bài đọc thông báo rõ lịch trình cải tạo văn phòng từ tuần sau." },
      { q: "According to the passage, what are employees advised to do?", a: "Work remotely on Tuesday.", b: "Park in the rear lot.", c: "Bring lunch to work.", d: "Attend a mandatory meeting.", correct: "A", exp: "Nhân viên được khuyến khích làm việc từ xa vào thứ Ba khi tầng 3 sơn sửa." }
    ]
  };

  const pool = sampleData[partNum] || sampleData[7];
  return Array.from({ length: questionsCount }).map((_, idx) => {
    const qTemplate = pool[idx % pool.length];
    return {
      id: `gen-${cq.id || cq.contextQuestionID || 'c'}-${baseNum + idx}`,
      questionNumber: baseNum + idx,
      questionContent: qTemplate.q,
      optionA: qTemplate.a,
      optionB: qTemplate.b,
      optionC: qTemplate.c,
      optionD: qTemplate.d,
      correctAnswer: qTemplate.correct,
      explanation: qTemplate.exp,
    };
  });
};

const ExamTakePage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  // Test data & Loading state
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalized Contexts and Flat Question List
  const [contexts, setContexts] = useState([]);
  const [flatQuestions, setFlatQuestions] = useState([]);
  const [currentContextIndex, setCurrentContextIndex] = useState(0);

  // User Interaction State
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); // Set of qIds
  const [timeRemaining, setTimeRemaining] = useState(7200); // 120 minutes = 7200s
  const [timerActive, setTimerActive] = useState(false);

  // Modals & UI States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [paletteDrawerOpen, setPaletteDrawerOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Audio Player State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // 1. Fetch Test Detail
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getTestDetail(testId);
        if (res.code === 1000 && res.data) {
          const testData = res.data;
          setTest(testData);

          // Process contextQuestions
          const rawCqs = testData.contextQuestions || [];
          let qCounter = 1;
          const processedContexts = rawCqs.map((cq, cqIdx) => {
            const partNum = cq.part?.namePart
              ? parseInt(cq.part.namePart.replace(/\D/g, ''), 10) || 1
              : cq.part?.partNumber || (cqIdx < 4 ? cqIdx + 1 : 5);
            
            // Check if backend already has questions
            let questions = [];
            if (cq.questions && Array.isArray(cq.questions) && cq.questions.length > 0) {
              questions = cq.questions.map((q, qIdx) => ({
                id: q.id || q.questionID || `q-${cqIdx}-${qIdx}`,
                questionNumber: qCounter++,
                questionContent: q.questionContent || `Câu hỏi số ${qCounter - 1}`,
                optionA: q.optionA || 'A',
                optionB: q.optionB || 'B',
                optionC: q.optionC || 'C',
                optionD: q.optionD || 'D',
                correctAnswer: q.correctAnswer || 'A',
                explanation: q.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.',
              }));
            } else {
              // Graceful fallback questions to allow taking test seamlessly
              const generated = generateFallbackQuestions(cq, qCounter);
              qCounter += generated.length;
              questions = generated;
            }

            return {
              ...cq,
              contextIndex: cqIdx,
              partNumber: partNum,
              questions,
            };
          });

          setContexts(processedContexts);

          // Create flattened question lookup
          const allQs = [];
          processedContexts.forEach((c) => {
            c.questions.forEach((q) => {
              allQs.push({ ...q, contextIndex: c.contextIndex, partNumber: c.partNumber });
            });
          });
          setFlatQuestions(allQs);

          // Start timer
          setTimerActive(true);
        } else {
          setError(res.message || 'Không thể tải đề thi.');
        }
      } catch (err) {
        console.error('Error fetching test detail:', err);
        setError('Lỗi khi tải đề thi từ máy chủ.');
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchTest();
    }
  }, [testId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!timerActive || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isSubmitted]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Audio Play/Pause helper
  const handleToggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Switch context reset audio
  useEffect(() => {
    setIsPlayingAudio(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [currentContextIndex]);

  // Select option for question
  const handleSelectOption = (qId, option) => {
    if (isSubmitted) return; // locked in review mode
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  // Toggle flag
  const handleToggleFlag = (qId) => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Jump to specific question
  const handleJumpToQuestion = (q) => {
    setCurrentContextIndex(q.contextIndex);
    setPaletteDrawerOpen(false);
  };

  // Submit Exam
  const handleSubmitExam = () => {
    setSubmitModalOpen(false);
    setIsSubmitted(true);
    setTimerActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Score Calculation
  const scoreResults = useMemo(() => {
    if (!isSubmitted || flatQuestions.length === 0) return null;

    let correctCount = 0;
    let listeningCorrect = 0;
    let readingCorrect = 0;
    let listeningTotal = 0;
    let readingTotal = 0;

    flatQuestions.forEach((q) => {
      const isListening = q.partNumber <= 4;
      if (isListening) listeningTotal++;
      else readingTotal++;

      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
        if (isListening) listeningCorrect++;
        else readingCorrect++;
      }
    });

    // Approximate ETS Conversion: Scale to 495 each
    const estimatedListening = listeningTotal > 0
      ? Math.min(495, Math.round((listeningCorrect / listeningTotal) * 495))
      : 250;
    const estimatedReading = readingTotal > 0
      ? Math.min(495, Math.round((readingCorrect / readingTotal) * 495))
      : 250;
    const estimatedTotal = estimatedListening + estimatedReading;
    const accuracy = Math.round((correctCount / flatQuestions.length) * 100);

    return {
      totalQuestions: flatQuestions.length,
      correctCount,
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
      estimatedListening,
      estimatedReading,
      estimatedTotal,
      accuracy,
      timeSpent: 7200 - timeRemaining,
    };
  }, [isSubmitted, flatQuestions, userAnswers, timeRemaining]);

  const currentContext = contexts[currentContextIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestionsCount = flatQuestions.length;
  const progressPercent = totalQuestionsCount > 0 ? Math.round((answeredCount / totalQuestionsCount) * 100) : 0;

  if (loading) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              border: '4px solid var(--border-light)',
              borderTopColor: 'var(--primary)',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Đang nạp đề thi phòng thi...</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vui lòng giữ nguyên kết nối mạng.</p>
        </div>
      </div>
    );
  }

  if (error || !currentContext) {
    return (
      <div style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 24 }}>
        <div style={{ maxWidth: 500, width: '100%', backgroundColor: '#ffffff', borderRadius: 16, padding: 32, textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.3rem', color: '#1e293b', marginBottom: 12 }}>Không thể mở bài thi</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: 24 }}>{error || 'Bài thi không có nội dung câu hỏi hợp lệ.'}</p>
          <Link to="/courses" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Quay lại danh sách đề thi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* 1. TOP STICKY BAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          padding: '12px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1600,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          {/* Left: Test Title & Back Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              to={`/courses/${testId}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={15} /> Rời phòng thi
            </Link>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                {test?.titleTest || 'Bài thi TOEIC'}
              </h1>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                Part {currentContext.partNumber} • Cụm {currentContextIndex + 1}/{contexts.length}
              </span>
            </div>
          </div>

          {/* Center: Countdown Timer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 18px',
              borderRadius: 30,
              backgroundColor: timeRemaining < 300 ? '#fef2f2' : '#f0fdf4',
              border: `1.5px solid ${timeRemaining < 300 ? '#ef4444' : '#198754'}`,
              color: timeRemaining < 300 ? '#b91c1c' : '#15803d',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '1px',
            }}
          >
            <Clock size={20} className={timeRemaining < 300 ? 'pulse-fast' : ''} />
            <span>{isSubmitted ? 'ĐÃ NỘP BÀI' : formatTime(timeRemaining)}</span>
          </div>

          {/* Right: Progress & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => setPaletteDrawerOpen(!paletteDrawerOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#334155',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Layers size={16} color="var(--primary)" />
              <span>Bảng câu hỏi ({answeredCount}/{totalQuestionsCount})</span>
            </button>

            {!isSubmitted ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSubmitModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(25, 135, 84, 0.25)',
                }}
              >
                <Send size={16} /> Nộp bài
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  fontWeight: 600,
                }}
              >
                <Eye size={16} /> {showExplanation ? 'Ẩn lời giải' : 'Xem lời giải'}
              </button>
            )}
          </div>
        </div>

        {/* Mini progress bar under header */}
        <div style={{ height: 3, backgroundColor: '#e2e8f0', margin: '10px -24px -12px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: '#198754',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </header>

      {/* 2. POST-SUBMISSION SCORE CARD (If Submitted) */}
      {isSubmitted && scoreResults && (
        <div style={{ maxWidth: 1400, margin: '24px auto 0', width: '100%', padding: '0 20px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              border: '1.5px solid #86efac',
              padding: 28,
              boxShadow: '0 10px 25px -5px rgba(25, 135, 84, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803d',
                  }}
                >
                  <Award size={32} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>Kết quả thi thử TOEIC</span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      Thời gian làm bài: {Math.floor(scoreResults.timeSpent / 60)} phút {scoreResults.timeSpent % 60} giây
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                    Chúc mừng bạn đã hoàn thành bài thi!
                  </h2>
                </div>
              </div>

              {/* Total Score Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 12, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Điểm TOEIC ước tính</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#15803d', lineHeight: 1.1 }}>
                    {scoreResults.estimatedTotal} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>/ 990</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Headphones size={16} color="#0284c7" />
                    <span>Listening: <strong>{scoreResults.estimatedListening} / 495</strong> ({scoreResults.listeningCorrect}/{scoreResults.listeningTotal} câu)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={16} color="#16a34a" />
                    <span>Reading: <strong>{scoreResults.estimatedReading} / 495</strong> ({scoreResults.readingCorrect}/{scoreResults.readingTotal} câu)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} color="#eab308" />
                    <span>Độ chính xác: <strong>{scoreResults.accuracy}%</strong> ({scoreResults.correctCount}/{scoreResults.totalQuestions} câu)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PART NAVIGATOR TABS */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', margin: isSubmitted ? '16px 0 0 0' : 0 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((partNum) => {
            const firstIndexForPart = contexts.findIndex((c) => c.partNumber === partNum);
            const isAvailable = firstIndexForPart !== -1;
            const isCurrentPart = currentContext.partNumber === partNum;

            return (
              <button
                key={partNum}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && setCurrentContextIndex(firstIndexForPart)}
                style={{
                  padding: '12px 18px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: isCurrentPart ? '3px solid #198754' : '3px solid transparent',
                  color: isCurrentPart ? '#198754' : isAvailable ? '#475569' : '#cbd5e1',
                  fontWeight: isCurrentPart ? 800 : 600,
                  fontSize: '0.9rem',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                Part {partNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. MAIN TEST WORKSPACE (SPLIT SCREEN) */}
      <main style={{ maxWidth: 1400, margin: '20px auto', width: '100%', padding: '0 20px', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>
          
          {/* LEFT COLUMN: CONTEXT MEDIA & PASSAGES */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: 24,
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: 80,
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                Part {currentContext.partNumber} • Ngữ cảnh {currentContextIndex + 1}/{contexts.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Gồm {currentContext.questions.length} câu hỏi
              </span>
            </div>

            {/* AUDIO PLAYER (For Listening Parts) */}
            {currentContext.audioUrl && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <Headphones size={20} color="var(--primary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Đoạn băng nghe Part {currentContext.partNumber}</span>
                </div>
                <audio
                  ref={audioRef}
                  src={currentContext.audioUrl}
                  controls
                  style={{ width: '100%', height: 40, outline: 'none' }}
                  onPlay={() => setIsPlayingAudio(true)}
                  onPause={() => setIsPlayingAudio(false)}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Nhấn Play để bắt đầu nghe. Bạn có thể nghe lại để luyện tập.</span>
                </div>
              </div>
            )}

            {/* IMAGE VIEWER (e.g. Part 1 Photographs or Diagram Questions) */}
            {currentContext.imageUrl && (
              <div
                style={{
                  marginBottom: 20,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#0f172a',
                  textAlign: 'center',
                }}
              >
                <img
                  src={currentContext.imageUrl}
                  alt={`Part ${currentContext.partNumber} context`}
                  style={{ maxWidth: '100%', maxHeight: 420, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/courses-2.webp';
                  }}
                />
              </div>
            )}

            {/* READING PASSAGE / PARAGRAPH (Part 6 & 7) */}
            {currentContext.paragraph && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 20,
                  lineHeight: 1.8,
                  fontSize: '0.98rem',
                  color: '#1e293b',
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  marginBottom: 20,
                }}
              >
                {currentContext.paragraph}
              </div>
            )}

            {/* REVIEW MODE: TRANSCRIPT */}
            {(isSubmitted || showExplanation) && currentContext.transcript && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px dashed #86efac',
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 16,
                }}
              >
                <h5 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} /> Lời thoại âm thanh (Audio Transcript):
                </h5>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {currentContext.transcript}
                </p>
              </div>
            )}

            {/* Navigation Controls between Contexts */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={currentContextIndex === 0}
                onClick={() => setCurrentContextIndex((prev) => Math.max(0, prev - 1))}
                style={{ gap: 6 }}
              >
                <ChevronLeft size={16} /> Ngữ cảnh trước
              </button>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                {currentContextIndex + 1} / {contexts.length}
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={currentContextIndex === contexts.length - 1}
                onClick={() => setCurrentContextIndex((prev) => Math.min(contexts.length - 1, prev + 1))}
                style={{ gap: 6 }}
              >
                Ngữ cảnh kế tiếp <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: QUESTIONS & CHOICES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {currentContext.questions.map((q) => {
              const selectedOption = userAnswers[q.id];
              const isFlagged = flaggedQuestions.has(q.id);
              const isCorrect = selectedOption === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 14,
                    border: isFlagged
                      ? '1.5px solid #f59e0b'
                      : isSubmitted
                      ? isCorrect
                        ? '1.5px solid #22c55e'
                        : '1.5px solid #ef4444'
                      : '1px solid #e2e8f0',
                    padding: 24,
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Question Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {q.questionNumber}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1e293b', lineHeight: 1.5 }}>
                        {q.questionContent}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFlag(q.id)}
                      title="Đánh dấu câu hỏi này để kiểm tra lại"
                      style={{
                        backgroundColor: isFlagged ? '#fef3c7' : 'transparent',
                        border: `1px solid ${isFlagged ? '#f59e0b' : '#cbd5e1'}`,
                        borderRadius: 6,
                        padding: '4px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: isFlagged ? '#b45309' : '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      <Flag size={14} fill={isFlagged ? '#f59e0b' : 'none'} />
                      <span className="hidden-mobile">{isFlagged ? 'Đã ghim' : 'Ghim câu'}</span>
                    </button>
                  </div>

                  {/* Options List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const optText = q[`option${optKey}`];
                      if (!optText && optKey === 'D' && currentContext.partNumber === 2) {
                        // Part 2 only has A, B, C
                        return null;
                      }

                      const isSelected = selectedOption === optKey;
                      const isOptionCorrect = q.correctAnswer === optKey;

                      let optBg = '#ffffff';
                      let optBorder = '#cbd5e1';
                      let optTextColor = '#1e293b';

                      if (isSubmitted) {
                        if (isOptionCorrect) {
                          optBg = '#f0fdf4';
                          optBorder = '#22c55e';
                          optTextColor = '#15803d';
                        } else if (isSelected && !isOptionCorrect) {
                          optBg = '#fef2f2';
                          optBorder = '#ef4444';
                          optTextColor = '#b91c1c';
                        }
                      } else if (isSelected) {
                        optBg = '#eff6ff';
                        optBorder = 'var(--primary)';
                        optTextColor = 'var(--primary)';
                      }

                      return (
                        <div
                          key={optKey}
                          onClick={() => handleSelectOption(q.id, optKey)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '12px 16px',
                            borderRadius: 10,
                            border: `1.5px solid ${optBorder}`,
                            backgroundColor: optBg,
                            cursor: isSubmitted ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: '50%',
                              border: `2px solid ${isSelected || (isSubmitted && isOptionCorrect) ? optBorder : '#94a3b8'}`,
                              backgroundColor: isSelected ? optBorder : 'transparent',
                              color: isSelected ? '#ffffff' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {isSelected ? optKey : optKey}
                          </div>
                          <span style={{ fontSize: '0.93rem', color: optTextColor, fontWeight: isSelected ? 600 : 500, flex: 1 }}>
                            {optText}
                          </span>
                          {isSubmitted && isOptionCorrect && <Check size={18} color="#16a34a" />}
                          {isSubmitted && isSelected && !isOptionCorrect && <X size={18} color="#dc2626" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Review Mode: Detailed Explanation */}
                  {(isSubmitted || showExplanation) && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: '#f8fafc',
                        borderLeft: '4px solid #198754',
                        fontSize: '0.88rem',
                        color: '#334155',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 4 }}>
                        Đáp án đúng: {q.correctAnswer}
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.6 }}>{q.explanation || 'Không có giải thích bổ sung.'}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </main>

      {/* 5. QUESTION PALETTE MODAL / DRAWER */}
      {paletteDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          onClick={() => setPaletteDrawerOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              height: '100%',
              backgroundColor: '#ffffff',
              padding: 24,
              boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Bảng danh sách câu hỏi
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Đã làm {answeredCount} / {totalQuestionsCount} câu ({progressPercent}%)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPaletteDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <X size={22} color="#64748b" />
              </button>
            </div>

            {/* Color Legend */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: '10px 0', borderBottom: '1px solid #e2e8f0', marginBottom: 16, fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#22c55e' }} /> Đã làm
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#f59e0b' }} /> Đã ghim
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#e2e8f0' }} /> Chưa làm
              </span>
            </div>

            {/* Questions Grid */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, alignContent: 'start' }}>
              {flatQuestions.map((q) => {
                const isAnswered = !!userAnswers[q.id];
                const isFlagged = flaggedQuestions.has(q.id);
                const isCurrent = currentContext.questions.some((cqQ) => cqQ.id === q.id);

                let btnBg = '#f1f5f9';
                let btnBorder = '#cbd5e1';
                let btnColor = '#475569';

                if (isFlagged) {
                  btnBg = '#fef3c7';
                  btnBorder = '#f59e0b';
                  btnColor = '#b45309';
                } else if (isAnswered) {
                  btnBg = '#dcfce7';
                  btnBorder = '#86efac';
                  btnColor = '#15803d';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleJumpToQuestion(q)}
                    style={{
                      padding: '10px 0',
                      borderRadius: 8,
                      border: isCurrent ? '2px solid #0f172a' : `1.5px solid ${btnBorder}`,
                      backgroundColor: btnBg,
                      color: btnColor,
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    {q.questionNumber}
                    {isFlagged && <Flag size={10} fill="#f59e0b" />}
                  </button>
                );
              })}
            </div>

            <div style={{ paddingTop: 16, borderTop: '1px solid #e2e8f0', marginTop: 12 }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setPaletteDrawerOpen(false);
                  setSubmitModalOpen(true);
                }}
              >
                Hoàn tất & Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBMISSION CONFIRMATION MODAL */}
      {submitModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 18,
              maxWidth: 480,
              width: '100%',
              padding: 28,
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Send size={28} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Xác nhận nộp bài thi?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '0 0 20px 0' }}>
              Sau khi nộp bài, hệ thống sẽ tự động chấm điểm và bạn có thể tra cứu đáp án chi tiết.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{totalQuestionsCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tổng số câu</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{answeredCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#166534' }}>Đã hoàn thành</div>
              </div>
              <div style={{ padding: 12, borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626' }}>{totalQuestionsCount - answeredCount}</div>
                <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>Chưa làm</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setSubmitModalOpen(false)}
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', gap: 6 }}
                onClick={handleSubmitExam}
              >
                <CheckCircle2 size={16} /> Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTakePage;
