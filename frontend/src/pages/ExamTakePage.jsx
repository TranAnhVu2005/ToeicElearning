import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flag,
  Award,
  BookOpen,
  Headphones,
  Check,
  X,
  FileText,
  Layers,
  ArrowLeft,
  Send,
  Eye,
  Highlighter,
} from 'lucide-react';
import { examService } from '../services/examService';
import { ETS_PART_DIRECTIONS } from '../constants/etsDirections';

// Fallback question generator if backend doesn't supply child questions
const generateFallbackQuestions = (cq, baseNum) => {
  const partNum = cq.part?.partNumber || cq._partNum || 1;
  const questionsCount = (partNum === 1 || partNum === 2) ? 1 : (partNum === 3 || partNum === 4 || partNum === 6) ? 3 : 4;
  
  const sampleData = {
    1: [
      { q: "Mô tả hình ảnh (Lắng nghe 4 câu mô tả A, B, C, D qua audio)", a: "A", b: "B", c: "C", d: "D", correct: "A", exp: "Người trong hình đang thực hiện hành động chính xác nhất ở phương án A." }
    ],
    2: [
      { q: "Mark your answer on your answer sheet.", a: "A", b: "B", c: "C", d: "D", correct: "A", exp: "Câu trả lời A phản hồi phù hợp nhất cho ngữ cảnh câu hỏi." }
    ],
    3: [
      { q: "What problem does the speaker mention?", a: "A delivery is delayed.", b: "An item is out of stock.", c: "A client requested a refund.", d: "The software crashed.", correct: "B", exp: "Người nói đề cập đến việc hết hàng trong kho." },
      { q: "What does the woman offer to do?", a: "Call the warehouse manager.", b: "Print updated invoices.", c: "Cancel the shipment.", d: "Contact the supplier.", correct: "A", exp: "Người phụ nữ đề nghị gọi ngay cho quản lý kho." },
      { q: "What will happen next week?", a: "An internal audit.", b: "A product launch.", c: "A team relocation.", d: "Staff training.", correct: "B", exp: "Tuần sau sẽ diễn ra buổi ra mắt sản phẩm mới." }
    ],
    5: [
      { q: "The regional manager requested that all department heads _______ their monthly summaries by Friday.", a: "submit", b: "submits", c: "submitted", d: "submitting", correct: "A", exp: "Cấu trúc bàng thái cách: request that + S + V-bare." }
    ],
    7: [
      { q: "What is the main purpose of this announcement?", a: "To announce an office renovation schedule.", b: "To introduce a new policy.", c: "To invite staff to a party.", d: "To conduct a survey.", correct: "A", exp: "Đoạn đầu bài thông báo rõ lịch trình cải tạo văn phòng." },
      { q: "According to the passage, what are employees advised to do?", a: "Work remotely on Tuesday.", b: "Park in the rear lot.", c: "Bring lunch to work.", d: "Attend a mandatory meeting.", correct: "A", exp: "Nhân viên được khuyến khích làm việc từ xa khi văn phòng sơn sửa." }
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

// STUDY4 Style Custom Audio Player Bar
const AudioPlayerBar = ({ src, id }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [1.0, 1.2, 0.8];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    audioRef.current.playbackRate = nextRate;
  };

  const formatAudioTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs w-full select-none mb-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm transition active:scale-95 cursor-pointer"
        title={isPlaying ? 'Tạm dừng' : 'Phát âm thanh'}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>

      {/* Scrubber / Progress Bar */}
      <div className="flex-1 flex items-center gap-2">
        <span className="font-mono text-slate-500 text-[11px] w-10 text-right">
          {formatAudioTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <span className="font-mono text-slate-400 text-[11px] w-10">
          {formatAudioTime(duration)}
        </span>
      </div>

      {/* Volume Control */}
      <div className="hidden sm:flex items-center gap-1.5">
        <button
          type="button"
          onClick={toggleMute}
          className="text-slate-500 hover:text-slate-700 p-1"
        >
          {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-14 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
        />
      </div>

      {/* Playback Speed Pill */}
      <button
        type="button"
        onClick={cyclePlaybackRate}
        className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 font-bold text-[11px] text-slate-600 transition"
        title="Tốc độ phát"
      >
        {playbackRate}x
      </button>
    </div>
  );
};

const ExamTakePage = () => {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL Params for Practice mode vs Full Test
  const mode = searchParams.get('mode') || 'fulltest';
  const partsParam = searchParams.get('parts');
  const timeParam = searchParams.get('time');

  const targetPartNumbers = useMemo(() => {
    if (mode === 'practice' && partsParam) {
      const parsed = partsParam
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((n) => !isNaN(n));
      return parsed.length > 0 ? parsed : [1, 2, 3, 4, 5, 6, 7];
    }
    return [1, 2, 3, 4, 5, 6, 7];
  }, [mode, partsParam]);

  const initialMinutes = useMemo(() => {
    if (timeParam !== null && timeParam !== undefined && timeParam !== '') {
      const parsed = parseInt(timeParam, 10);
      return isNaN(parsed) ? 120 : parsed;
    }
    return mode === 'practice' ? 0 : 120;
  }, [timeParam, mode]);

  const isStopwatch = initialMinutes === 0;

  // Test data & Loading state
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Normalized Contexts and Flat Question List
  const [contexts, setContexts] = useState([]);
  const [flatQuestions, setFlatQuestions] = useState([]);

  // Active Part tab (1, 2, 3, 4, 5, 6, 7)
  const [activePart, setActivePart] = useState(1);

  // User Interaction State
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: 'A' | 'B' | 'C' | 'D' }
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set()); // Set of qIds
  const [timeRemaining, setTimeRemaining] = useState(isStopwatch ? 0 : initialMinutes * 60);
  const [timerActive, setTimerActive] = useState(false);

  // UI States
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [highlightContent, setHighlightContent] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  // 1. Fetch Test Detail & Process Questions
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await examService.getTestDetail(testId);
        if (res.code === 1000 && res.data) {
          const testData = res.data;
          setTest(testData);

          const rawCqs = testData.contextQuestions || [];

          // Process contextQuestions: Sắp xếp chuẩn xác theo PartNumber và Sequence Index
          let indexedCqs = rawCqs.map((cq, rawIdx) => {
            let seqIndex = null;
            let parsedPartNumber = null;

            if (cq.orderIndex !== undefined && cq.orderIndex !== null && cq.orderIndex > 0) {
              seqIndex = cq.orderIndex;
            }

            const tagMatch = cq.paragraph?.match(/<!--CQ_SEQ:(?:P(\d+):I)?(\d+)-->/);
            if (tagMatch) {
              if (tagMatch[1]) parsedPartNumber = parseInt(tagMatch[1], 10);
              if (seqIndex === null) seqIndex = parseInt(tagMatch[2], 10);
            }

            let partNum = parsedPartNumber;
            if (!partNum && cq.part?.namePart) {
              partNum = parseInt(cq.part.namePart.replace(/\D/g, ''), 10) || null;
            }

            if (!partNum) {
              const firstQNum = cq.questions?.[0]?.questionNumber;
              const refNum = (seqIndex && seqIndex > 0) ? seqIndex : (firstQNum && firstQNum > 0 ? firstQNum : null);
              if (refNum && refNum > 0) {
                if (refNum >= 1 && refNum <= 6) partNum = 1;
                else if (refNum >= 7 && refNum <= 31) partNum = 2;
                else if (refNum >= 32 && refNum <= 70) partNum = 3;
                else if (refNum >= 71 && refNum <= 100) partNum = 4;
                else if (refNum >= 101 && refNum <= 130) partNum = 5;
                else if (refNum >= 131 && refNum <= 146) partNum = 6;
                else if (refNum >= 147) partNum = 7;
              }
            }

            if (!partNum) {
              const q0 = cq.questions?.[0];
              const qCount = cq.questions?.length || 0;
              if (cq.imageUrl && (!cq.paragraph || cq.paragraph.trim() === '') && qCount === 1) {
                partNum = 1;
              } else if (qCount === 1 && (!q0?.optionD || q0?.optionD.trim() === '')) {
                partNum = 2;
              } else if (qCount === 3) {
                partNum = cq.transcript?.toLowerCase().includes('talk') || cq.transcript?.toLowerCase().includes('announcement') ? 4 : 3;
              } else if (qCount === 4 && cq.paragraph) {
                partNum = 6;
              } else if (cq.paragraph && !cq.audioUrl) {
                partNum = 7;
              } else {
                partNum = 5;
              }
            }

            if (seqIndex === null || isNaN(seqIndex)) {
              seqIndex = rawIdx;
            }

            return {
              ...cq,
              _partNum: partNum,
              _seqIndex: seqIndex,
              paragraph: (cq.paragraph || '').replace(/<!--CQ_SEQ:[^>]+-->\n?/, ''),
            };
          });

          // Sắp xếp: Part 1 -> Part 7, và trong từng Part theo đúng thứ tự câu (_seqIndex)
          indexedCqs.sort((a, b) => {
            if (a._partNum !== b._partNum) return a._partNum - b._partNum;
            return (a._seqIndex ?? 0) - (b._seqIndex ?? 0);
          });

          // Nếu ở chế độ Luyện tập theo Part, chỉ giữ lại các cụm bài thuộc các Part đã chọn
          if (mode === 'practice' && targetPartNumbers.length > 0) {
            indexedCqs = indexedCqs.filter((cq) => targetPartNumbers.includes(cq._partNum));
          }

          let qCounter = 1;
          const processedContexts = indexedCqs.map((cq, cqIdx) => {
            const partNum = cq._partNum;

            let questions = [];
            if (cq.questions && Array.isArray(cq.questions) && cq.questions.length > 0) {
              questions = cq.questions.map((q, qIdx) => {
                const assignedQNum = q.questionNumber && q.questionNumber > 0 ? q.questionNumber : qCounter;
                qCounter = assignedQNum + 1;
                return {
                  id: q.id || q.questionID || `q-${cqIdx}-${qIdx}`,
                  questionNumber: assignedQNum,
                  questionContent: q.questionContent || `Câu hỏi số ${assignedQNum}`,
                  optionA: q.optionA || 'A',
                  optionB: q.optionB || 'B',
                  optionC: q.optionC || 'C',
                  optionD: q.optionD || 'D',
                  correctAnswer: q.correctAnswer || 'A',
                  explanation: q.explanation || 'Chưa có lời giải chi tiết cho câu hỏi này.',
                };
              });
            } else {
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

          // Tạo danh sách câu hỏi phẳng
          const allQs = [];
          processedContexts.forEach((c) => {
            c.questions.forEach((q) => {
              allQs.push({ ...q, contextIndex: c.contextIndex, partNumber: c.partNumber });
            });
          });
          setFlatQuestions(allQs);

          // Khởi tạo activePart ban đầu theo Part có trong đề
          const initialPart = processedContexts[0]?.partNumber || targetPartNumbers[0] || 1;
          setActivePart(initialPart);

          // Bắt đầu đếm thời gian
          setTimeRemaining(isStopwatch ? 0 : initialMinutes * 60);
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
  }, [testId, mode, targetPartNumbers, isStopwatch, initialMinutes]);

  // 2. Countdown or Stopwatch Timer
  useEffect(() => {
    if (!timerActive || isSubmitted) return;
    const interval = setInterval(() => {
      if (isStopwatch) {
        setTimeRemaining((prev) => prev + 1);
      } else {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, isSubmitted, isStopwatch]);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Select option for question
  const handleSelectOption = (qId, option) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  // Toggle flag / review
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

  // Jump to question: switches Part if necessary and scrolls directly to question card
  const handleJumpToQuestion = (q) => {
    setMobilePaletteOpen(false);
    if (activePart !== q.partNumber) {
      setActivePart(q.partNumber);
      setTimeout(() => {
        const el = document.getElementById(`q-${q.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-emerald-500');
          setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 1500);
        }
      }, 150);
    } else {
      const el = document.getElementById(`q-${q.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-emerald-500');
        setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-500'), 1500);
      }
    }
  };

  // Submit Exam
  const handleSubmitExam = () => {
    setSubmitModalOpen(false);
    setIsSubmitted(true);
    setTimerActive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      let correct = 0;
      flatQuestions.forEach((q) => {
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      });
      const totalQ = flatQuestions.length;
      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      const totalSpentSecs = isStopwatch ? timeRemaining : Math.max(0, initialMinutes * 60 - timeRemaining);
      const hours = Math.floor(totalSpentSecs / 3600);
      const minutes = Math.floor((totalSpentSecs % 3600) / 60);
      const seconds = totalSpentSecs % 60;
      const timeSpentStr = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const partLabelStr = mode === 'practice'
        ? targetPartNumbers.map((p) => `Part ${p}`).join(', ')
        : 'Full Test';

      const newAttempt = {
        id: 'att_' + Date.now(),
        date: dateStr,
        modeLabel: mode === 'practice' ? 'Luyện tập' : 'Làm full test',
        partLabel: partLabelStr,
        score: `${correct}/${totalQ}`,
        timeSpent: timeSpentStr,
      };

      const historyKey = `test_history_${testId}`;
      const existing = JSON.parse(localStorage.getItem(historyKey) || '[]');
      const updated = [newAttempt, ...(Array.isArray(existing) ? existing : [])];
      localStorage.setItem(historyKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Error saving attempt to history:', err);
    }
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

    const rawL = listeningTotal > 0 ? (listeningCorrect / listeningTotal) * 490 + 5 : 5;
    const estimatedListening = Math.max(5, Math.min(495, Math.round(rawL / 5) * 5));

    const rawR = readingTotal > 0 ? (readingCorrect / readingTotal) * 490 + 5 : 5;
    const estimatedReading = Math.max(5, Math.min(495, Math.round(rawR / 5) * 5));

    const estimatedTotal = estimatedListening + estimatedReading;
    const accuracy = Math.round((correctCount / flatQuestions.length) * 100);
    const timeSpentSecs = isStopwatch ? timeRemaining : Math.max(0, initialMinutes * 60 - timeRemaining);

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
      timeSpent: timeSpentSecs,
    };
  }, [isSubmitted, flatQuestions, userAnswers, timeRemaining, isStopwatch, initialMinutes]);

  // Contexts and questions belonging to currently active Part
  const currentPartContexts = useMemo(() => {
    return contexts.filter((c) => c.partNumber === activePart);
  }, [contexts, activePart]);

  // All available parts in this test
  const availableParts = useMemo(() => {
    const set = new Set(contexts.map((c) => c.partNumber));
    return [1, 2, 3, 4, 5, 6, 7].filter((p) => set.has(p));
  }, [contexts]);

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestionsCount = flatQuestions.length;

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Đang nạp bài thi phòng thi...</h3>
          <p className="text-sm text-slate-500 mt-1">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (error || contexts.length === 0) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-200">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Không thể mở bài thi</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'Bài thi không có nội dung câu hỏi hợp lệ.'}</p>
          <Link to={`/courses/${testId}`} className="btn btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Quay lại thông tin đề thi
          </Link>
        </div>
      </div>
    );
  }

  // Find next/prev parts for bottom navigation
  const currentPartIdx = availableParts.indexOf(activePart);
  const prevPart = currentPartIdx > 0 ? availableParts[currentPartIdx - 1] : null;
  const nextPart = currentPartIdx < availableParts.length - 1 ? availableParts[currentPartIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans">
      {/* 1. TOP STUDY4 HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-2.5 px-4 sm:px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Left: Brand & Test Name */}
          <div className="flex items-center gap-4">
            <Link
              to={`/courses/${testId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition active:scale-95"
            >
              <ArrowLeft size={14} /> Thoát
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-700 tracking-tight text-base sm:text-lg">
                  TOEIC<span className="text-slate-900 font-light">ONLINE</span>
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                <h1 className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[200px] sm:max-w-md">
                  {test?.titleTest || 'ETS TOEIC Practice Test'}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Mobile: Button open questions palette drawer */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobilePaletteOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1"
            >
              <Layers size={14} /> Bảng câu ({answeredCount}/{totalQuestionsCount})
            </button>
            <button
              type="button"
              onClick={() => setSubmitModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
            >
              Nộp
            </button>
          </div>
        </div>
      </header>

      {/* 2. POST-SUBMISSION SCORE CARD (If Submitted) */}
      {isSubmitted && scoreResults && (
        <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 pt-4">
          <div className="bg-white rounded-2xl border-2 border-emerald-300 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Award size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      KẾT QUẢ BÀI THI
                    </span>
                    <span className="text-xs text-slate-500">
                      Thời gian: {Math.floor(scoreResults.timeSpent / 60)}p {scoreResults.timeSpent % 60}s
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    Chúc mừng bạn đã hoàn thành bài thi!
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="text-center px-6 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                    Điểm Ước Tính
                  </div>
                  <div className="text-3xl font-black text-emerald-600">
                    {scoreResults.estimatedTotal} <span className="text-xs text-slate-400 font-semibold">/ 990</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Headphones size={14} className="text-sky-600" />
                    <span>Listening: <strong>{scoreResults.estimatedListening} / 495</strong> ({scoreResults.listeningCorrect}/{scoreResults.listeningTotal} câu)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-600" />
                    <span>Reading: <strong>{scoreResults.estimatedReading} / 495</strong> ({scoreResults.readingCorrect}/{scoreResults.readingTotal} câu)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-amber-500" />
                    <span>Độ chính xác: <strong>{scoreResults.accuracy}%</strong> ({scoreResults.correctCount}/{scoreResults.totalQuestions} câu)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition"
                >
                  <Eye size={15} /> {showExplanation ? 'Ẩn lời giải' : 'Xem chi tiết lời giải'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PART NAVIGATION TABS (STUDY4 PILL BUTTONS ON TOP) */}
      <div className="bg-white border-b border-slate-200 sticky top-[53px] z-40 px-4 sm:px-8 py-2.5 shadow-xs">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Pill Tabs for Parts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {availableParts.map((pNum) => {
              const isActive = activePart === pNum;
              const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
              const partAnswered = partQuestions.filter((q) => !!userAnswers[q.id]).length;

              return (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => {
                    setActivePart(pNum);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-blue-600 border-2 border-blue-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Part {pNum}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {partAnswered}/{partQuestions.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Toolbar (Highlight toggle / Directions) */}
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium ml-auto">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={highlightContent}
                onChange={(e) => setHighlightContent(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded accent-blue-600 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Highlighter size={13} className="text-amber-500" /> Highlight nội dung
              </span>
            </label>

            {ETS_PART_DIRECTIONS[activePart] && (
              <button
                type="button"
                onClick={() => setShowDirections(!showDirections)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <span>Hướng dẫn Part {activePart}</span>
                {showDirections ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ETS DIRECTIONS COLLAPSIBLE */}
      {showDirections && ETS_PART_DIRECTIONS[activePart] && (
        <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 mt-3">
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs leading-relaxed border border-slate-800 shadow-sm">
            <div className="font-bold text-emerald-400 uppercase tracking-wider mb-1">
              {ETS_PART_DIRECTIONS[activePart].name}
            </div>
            <p className="text-slate-300 mb-2">{ETS_PART_DIRECTIONS[activePart].directions}</p>
            {ETS_PART_DIRECTIONS[activePart].sampleStatement && (
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-slate-300">
                <span className="font-bold text-amber-300">Ví dụ: </span>
                {ETS_PART_DIRECTIONS[activePart].sampleStatement}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MAIN TEST AREA: TWO COLUMNS (STUDY4 LAYOUT) */}
      <div className="max-w-[1500px] mx-auto w-full px-4 sm:px-8 py-5 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          
          {/* ================= LEFT MAIN WORKSPACE ================= */}
          {/* ALL QUESTIONS IN ACTIVE PART RENDERED ON ONE VERTICAL PAGE */}
          <main className="flex flex-col gap-6">
            {currentPartContexts.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-slate-500">
                Không tìm thấy câu hỏi nào cho Part {activePart}.
              </div>
            ) : (
              currentPartContexts.map((cq, cqIdx) => {
                const isPart1 = cq.partNumber === 1;
                const isPart2 = cq.partNumber === 2;
                const isPart3Or4 = cq.partNumber === 3 || cq.partNumber === 4;
                const isPart6Or7 = cq.partNumber === 6 || cq.partNumber === 7;

                return (
                  <div
                    key={cq.id || `cq-${cqIdx}`}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 relative transition-all"
                  >
                    {/* Context Audio Player (If listening part) */}
                    {cq.audioUrl && (
                      <div className="mb-4">
                        <AudioPlayerBar src={cq.audioUrl} id={`audio-${cq.id}`} />
                      </div>
                    )}

                    {/* Part 1 Photograph */}
                    {isPart1 && cq.imageUrl && (
                      <div className="mb-5 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-w-xl mx-auto text-center shadow-xs">
                        <img
                          src={cq.imageUrl}
                          alt="Part 1 Photograph"
                          className="w-full max-h-[380px] object-contain mx-auto"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/courses-2.webp';
                          }}
                        />
                      </div>
                    )}

                    {/* Part 6 & 7 Reading Passages (Single / Double / Triple) */}
                    {isPart6Or7 && cq.paragraph && (() => {
                      const rawP = cq.paragraph;
                      const hasSep2 = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*2\s*---\n*/i.test(rawP);
                      const hasSep3 = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*3\s*---\n*/i.test(rawP);

                      if (!hasSep2) {
                        return (
                          <div
                            className={`p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 leading-relaxed font-sans mb-5 whitespace-pre-wrap select-text ${
                              highlightContent ? 'text-base leading-loose bg-amber-50/40 border-amber-200' : 'text-sm'
                            }`}
                          >
                            {rawP}
                          </div>
                        );
                      }

                      // Render Double or Triple Passages
                      const sep2Regex = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*2\s*---\n*/i;
                      const sep3Regex = /\n*---\s*(?:BÀI ĐỌC|VĂN BẢN|PASSAGE)\s*3\s*---\n*/i;
                      const p1 = rawP.split(sep2Regex)[0]?.trim() || '';
                      const rest = rawP.split(sep2Regex)[1] || '';
                      let p2 = rest.trim();
                      let p3 = '';
                      if (hasSep3 && sep3Regex.test(rest)) {
                        p2 = rest.split(sep3Regex)[0]?.trim() || '';
                        p3 = rest.split(sep3Regex)[1]?.trim() || '';
                      }

                      const passages = [
                        { label: 'VĂN BẢN 1', text: p1, border: 'border-l-indigo-500' },
                        { label: 'VĂN BẢN 2', text: p2, border: 'border-l-purple-500' },
                      ];
                      if (p3) {
                        passages.push({ label: 'VĂN BẢN 3', text: p3, border: 'border-l-amber-500' });
                      }

                      return (
                        <div className="flex flex-col gap-3.5 mb-5">
                          {passages.map((psg, pIdx) => (
                            <div
                              key={pIdx}
                              className={`p-4 rounded-xl border border-slate-200 border-l-4 ${psg.border} bg-slate-50 text-slate-800 leading-relaxed font-sans text-sm whitespace-pre-wrap`}
                            >
                              <span className="inline-block text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700 mb-2">
                                {psg.label}
                              </span>
                              <div>{psg.text}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                    {/* Questions belonging to this context */}
                    <div className="flex flex-col gap-5">
                      {cq.questions.map((q) => {
                        const selectedOption = userAnswers[q.id];
                        const isFlagged = flaggedQuestions.has(q.id);
                        const isCorrect = selectedOption === q.correctAnswer;

                        return (
                          <div
                            key={q.id}
                            id={`q-${q.id}`}
                            className={`p-3.5 rounded-xl transition-all ${
                              isFlagged ? 'bg-amber-50/60 border border-amber-200' : ''
                            }`}
                          >
                            {/* Question Title & Number Badge (STUDY4 Circle) */}
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-start gap-2.5 flex-1">
                                <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs border border-blue-200 flex-shrink-0 mt-0.5">
                                  {q.questionNumber}
                                </span>
                                <div className="text-sm font-semibold text-slate-800 leading-relaxed pt-0.5">
                                  {isPart1 ? (
                                    <span className="text-slate-500 italic">Chọn phương án mô tả đúng nhất bức tranh</span>
                                  ) : isPart2 ? (
                                    <span className="text-slate-500 italic">Mark your answer on your answer sheet.</span>
                                  ) : (
                                    q.questionContent
                                  )}
                                </div>
                              </div>

                              {/* Flag / Review button */}
                              <button
                                type="button"
                                onClick={() => handleToggleFlag(q.id)}
                                className={`p-1.5 rounded-lg border transition cursor-pointer text-xs flex items-center gap-1 ${
                                  isFlagged
                                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                                    : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                }`}
                                title="Đánh dấu câu hỏi để xem lại"
                              >
                                <Flag size={13} fill={isFlagged ? '#f59e0b' : 'none'} />
                              </button>
                            </div>

                            {/* Radio Options List (A, B, C, D) */}
                            <div className="flex flex-col gap-2 pl-9">
                              {['A', 'B', 'C', 'D'].map((optKey) => {
                                if (isPart2 && optKey === 'D') return null; // Part 2 only has A, B, C

                                const optText = q[`option${optKey}`];
                                const isSelected = selectedOption === optKey;
                                const isOptionCorrect = q.correctAnswer === optKey;

                                let itemBorder = 'border-transparent';
                                let itemBg = 'hover:bg-slate-50';
                                let circleBg = 'border-slate-300 text-slate-500';

                                if (isSubmitted) {
                                  if (isOptionCorrect) {
                                    itemBorder = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold';
                                    circleBg = 'border-emerald-600 bg-emerald-600 text-white';
                                  } else if (isSelected && !isOptionCorrect) {
                                    itemBorder = 'border-red-300 bg-red-50 text-red-800';
                                    circleBg = 'border-red-500 bg-red-500 text-white';
                                  }
                                } else if (isSelected) {
                                  itemBorder = 'border-blue-200 bg-blue-50/70 font-bold text-blue-900';
                                  circleBg = 'border-blue-600 bg-blue-600 text-white';
                                }

                                return (
                                  <label
                                    key={optKey}
                                    onClick={() => handleSelectOption(q.id, optKey)}
                                    className={`flex items-center gap-3 p-2.5 rounded-lg border ${itemBorder} ${itemBg} cursor-pointer transition select-none`}
                                  >
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 transition ${circleBg}`}
                                    >
                                      {optKey}
                                    </div>
                                    <div className="text-sm text-slate-700 leading-snug flex-1">
                                      {isPart1 || isPart2 ? `${optKey}.` : optText ? `${optKey}. ${optText}` : `${optKey}.`}
                                    </div>
                                    {isSubmitted && isOptionCorrect && (
                                      <Check size={16} className="text-emerald-600 mr-2" />
                                    )}
                                    {isSubmitted && isSelected && !isOptionCorrect && (
                                      <X size={16} className="text-red-500 mr-2" />
                                    )}
                                  </label>
                                );
                              })}
                            </div>

                            {/* Review Mode: Detailed Explanation */}
                            {(isSubmitted || showExplanation) && (
                              <div className="mt-3 ml-9 p-3 rounded-lg bg-slate-50 border-l-4 border-emerald-500 text-xs text-slate-700 leading-relaxed">
                                <div className="font-bold text-emerald-700 mb-1">
                                  Đáp án đúng: {q.correctAnswer}
                                </div>
                                <p className="m-0 text-slate-600">{q.explanation || 'Không có giải thích bổ sung.'}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Review Mode: Audio Transcript & Vietnamese Translation */}
                    {(isSubmitted || showExplanation) && (cq.transcript || cq.translation) && (
                      <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col gap-2.5 text-xs">
                        {cq.transcript && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="font-bold text-indigo-700 flex items-center gap-1.5 mb-1">
                              <FileText size={14} /> Lời thoại âm thanh (Transcript):
                            </span>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed m-0 font-sans">
                              {cq.transcript}
                            </p>
                          </div>
                        )}
                        {cq.translation && (
                          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                            <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                              Bản dịch tiếng Việt:
                            </span>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed m-0 font-sans">
                              {cq.translation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Bottom Part Pagination Navigation */}
            <div className="flex items-center justify-between gap-4 py-4 px-2">
              {prevPart ? (
                <button
                  type="button"
                  onClick={() => {
                    setActivePart(prevPart);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-xs"
                >
                  <ChevronLeft size={16} /> Quay lại Part {prevPart}
                </button>
              ) : <div />}

              {nextPart ? (
                <button
                  type="button"
                  onClick={() => {
                    setActivePart(nextPart);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-sm ml-auto"
                >
                  Chuyển sang Part {nextPart} <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition shadow-sm ml-auto"
                >
                  <CheckCircle2 size={16} /> Hoàn tất & Nộp bài
                </button>
              )}
            </div>
          </main>

          {/* ================= RIGHT STICKY SIDEBAR (STUDY4 LAYOUT) ================= */}
          <aside className="hidden lg:block sticky top-[108px] h-[calc(100vh-130px)] overflow-y-auto pr-1 scrollbar-thin">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col gap-4">
              
              {/* Box 1: Timer & Submit Button */}
              <div>
                <div className="text-xs text-slate-500 font-semibold mb-1">
                  Thời gian làm bài:
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight font-mono mb-3">
                  {isSubmitted
                    ? formatTime(scoreResults?.timeSpent || 0)
                    : formatTime(timeRemaining)}
                </div>

                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-sm tracking-wide transition active:scale-[0.98] cursor-pointer"
                  >
                    NỘP BÀI
                  </button>
                ) : (
                  <div className="w-full py-2 px-3 rounded-lg bg-emerald-100 text-emerald-800 text-center font-bold text-xs">
                    ĐÃ NỘP BÀI
                  </div>
                )}

                <div className="mt-2 text-right">
                  <span className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer">
                    Khôi phục/lưu bài làm
                  </span>
                </div>

                <div className="mt-2.5 p-2 rounded-lg bg-amber-50 text-[11px] text-amber-800 leading-normal border border-amber-200">
                  <strong>Chú ý:</strong> bạn có thể click vào biểu tượng cờ cạnh câu hỏi để đánh dấu xem lại (review).
                </div>
              </div>

              <div className="h-[1px] bg-slate-200" />

              {/* Box 2: Questions Palette by Part */}
              <div className="flex flex-col gap-4">
                {availableParts.map((pNum) => {
                  const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                  if (partQuestions.length === 0) return null;

                  return (
                    <div key={pNum}>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>Part {pNum}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {partQuestions.filter((q) => !!userAnswers[q.id]).length}/{partQuestions.length}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {partQuestions.map((q) => {
                          const isAnswered = !!userAnswers[q.id];
                          const isFlagged = flaggedQuestions.has(q.id);

                          let btnStyle = 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50';

                          if (isSubmitted) {
                            const isCorrect = userAnswers[q.id] === q.correctAnswer;
                            if (isCorrect) {
                              btnStyle = 'bg-emerald-500 border-emerald-500 text-white font-bold';
                            } else if (isAnswered) {
                              btnStyle = 'bg-red-500 border-red-500 text-white font-bold';
                            }
                          } else if (isFlagged) {
                            btnStyle = 'bg-amber-100 border-amber-400 text-amber-800 font-bold';
                          } else if (isAnswered) {
                            btnStyle = 'bg-blue-500 border-blue-500 text-white font-bold shadow-xs';
                          }

                          return (
                            <button
                              key={q.id}
                              type="button"
                              onClick={() => handleJumpToQuestion(q)}
                              className={`h-7 rounded border text-[11px] font-bold flex items-center justify-center transition active:scale-95 cursor-pointer relative ${btnStyle}`}
                            >
                              {q.questionNumber}
                              {isFlagged && !isSubmitted && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </aside>

        </div>
      </div>

      {/* 5. MOBILE QUESTIONS PALETTE DRAWER */}
      {mobilePaletteOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
          onClick={() => setMobilePaletteOpen(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-white p-5 flex flex-col gap-4 overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-800 text-base">Danh sách câu hỏi</h3>
              <button
                type="button"
                onClick={() => setMobilePaletteOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {availableParts.map((pNum) => {
                const partQuestions = flatQuestions.filter((q) => q.partNumber === pNum);
                return (
                  <div key={pNum}>
                    <div className="text-xs font-bold text-slate-700 mb-2">Part {pNum}</div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {partQuestions.map((q) => {
                        const isAnswered = !!userAnswers[q.id];
                        const isFlagged = flaggedQuestions.has(q.id);
                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => handleJumpToQuestion(q)}
                            className={`h-8 rounded border text-xs font-bold flex items-center justify-center ${
                              isAnswered ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 border-slate-200 text-slate-700'
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
          </div>
        </div>
      )}

      {/* 6. SUBMISSION CONFIRMATION MODAL */}
      {submitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Send size={28} />
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-2">Xác nhận nộp bài thi?</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Bạn có chắc chắn muốn nộp bài thi ngay bây giờ? Hệ thống sẽ tự động chấm điểm và hiển thị kết quả chi tiết.
            </p>

            <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-black text-slate-800">{totalQuestionsCount}</div>
                <div className="text-[11px] text-slate-500">Tổng số câu</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-lg font-black text-emerald-700">{answeredCount}</div>
                <div className="text-[11px] text-emerald-800 font-semibold">Đã làm</div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="text-lg font-black text-red-600">{totalQuestionsCount - answeredCount}</div>
                <div className="text-[11px] text-red-700 font-semibold">Chưa làm</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                onClick={() => setSubmitModalOpen(false)}
              >
                Làm tiếp
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                onClick={handleSubmitExam}
              >
                Nộp bài ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTakePage;
