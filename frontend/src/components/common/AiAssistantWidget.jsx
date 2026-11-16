import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  CircleX,
  ChevronRight,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Lightbulb,
  Languages,
  Mic,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { TOBY_IMAGES, TobyAvatar } from './TobyMascot';
import nunaBgImage from '../../assets/img/mascot/anh_cho_ban_sung.jpg';
import {
  MAX_VOICE_AUDIO_BYTES,
  MAX_VOICE_RECORD_SECONDS,
  buildHistoryPayload,
  convertAudioBlobToWav,
  detectSpeechLocale,
  formatRecordingDuration,
  getSpeechRecognitionConstructor,
  getVoiceCapabilities,
  normalizeSpokenVietnameseNumbers,
  pickSupportedRecorderMimeType,
  sanitizeMarkdownForSpeech,
  selectSpeechVoice,
  splitTextIntoSpeechChunks,
} from '../../utils/aiVoiceHelpers';

/**
 * Lightweight, safe Markdown-to-JSX renderer for AI responses
 * Supports ### / #### headings, horizontal rules (---), bullet lists (- / + / *),
 * numbered lists, blockquotes (>), and **bold** / *italic* / `code`
 */
const renderInlineFormatting = (text) => {
  if (!text) return null;
  const tokens = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-bold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="rounded-md border border-blue-200/80 bg-blue-50/80 px-1.5 py-0.5 text-[12.5px] font-semibold text-[#1D4ED8]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2 && !token.startsWith('**')) {
      return (
        <em key={idx} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
};

const AiMarkdownMessage = ({ content }) => {
  const lines = String(content || '').split('\n');
  const elements = [];
  let listItems = [];
  let listType = 'ul';

  const flushList = (keySuffix) => {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(
        <ol
          key={`list-${keySuffix}`}
          className="my-2.5 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-800 marker:font-bold marker:text-[#1D4ED8]"
        >
          {listItems.map((item, i) => (
            <li key={i} className="pl-0.5">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul
          key={`list-${keySuffix}`}
          className="my-2.5 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-slate-800 marker:text-[#1D4ED8]"
        >
          {listItems.map((item, i) => (
            <li key={i} className="pl-0.5">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
    }
    listItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList(index);
      return;
    }

    // Horizontal rule (---, ***, ___)
    if (/^([-*_])\1{2,}$/.test(line)) {
      flushList(index);
      elements.push(<hr key={index} className="my-3.5 border-t border-slate-200/90" />);
      return;
    }

    if (line.startsWith('#### ')) {
      flushList(index);
      elements.push(
        <h4
          key={index}
          className="mt-3.5 mb-1.5 flex items-center gap-1.5 text-[13px] font-bold tracking-wide text-[#1D4ED8] uppercase"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
          {renderInlineFormatting(line.slice(5))}
        </h4>
      );
      return;
    }

    if (line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ')) {
      flushList(index);
      const titleText = line.replace(/^#{1,3}\s+/, '');
      elements.push(
        <div
          key={index}
          className="mt-3 mb-2 border-b border-slate-200/90 pb-1.5 text-[15px] font-bold text-slate-950 first:mt-0"
        >
          {renderInlineFormatting(titleText)}
        </div>
      );
      return;
    }

    if (line.startsWith('> ')) {
      flushList(index);
      elements.push(
        <blockquote
          key={index}
          className="my-2.5 rounded-r-xl border-l-3 border-[#1D4ED8] bg-[#EFF6FF]/70 px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700 italic"
        >
          {renderInlineFormatting(line.slice(2))}
        </blockquote>
      );
      return;
    }

    const bulletMatch = line.match(/^[-+*]\s+(.*)$/);
    if (bulletMatch) {
      if (listType !== 'ul') {
        flushList(index);
        listType = 'ul';
      }
      listItems.push(bulletMatch[1]);
      return;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList(index);
        listType = 'ol';
      }
      listItems.push(orderedMatch[1]);
      return;
    }

    flushList(index);
    elements.push(
      <p key={index} className="my-1.5 text-[14px] leading-relaxed text-slate-800 first:mt-0 last:mb-0">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  flushList('end');
  return <div className="space-y-1.5">{elements}</div>;
};

const PLATFORM_QUICK_TOPICS = [
  {
    label: 'Cách làm Full Test & Điểm 990',
    subtitle: 'Tự lưu khi F5 & quy đổi thang điểm',
    iconType: 'exam',
    prompt: 'Hướng dẫn chi tiết cách làm bài Full Test 200 câu, cơ chế tự lưu khi F5 và cách quy đổi điểm TOEIC 990 trên trang web.',
  },
  {
    label: 'Nghe chép chính tả Dictation',
    subtitle: 'Cách luyện từng câu & phím tắt nhanh',
    iconType: 'dictation',
    prompt: 'Tính năng luyện nghe chép chính tả (Dictation) trên trang web hoạt động như thế nào và có những phím tắt gì?',
  },
  {
    label: 'Lớp học & Xem trước PDF',
    subtitle: 'Bài tập, tài liệu & mời qua Gmail',
    iconType: 'classroom',
    prompt: 'Hệ thống Lớp học trực tuyến, tính năng Xem trước PDF trực tiếp và Mời học viên qua Gmail hoạt động như thế nào?',
  },
  {
    label: 'Đề thi VIP & Đăng ký Giáo viên',
    subtitle: 'Quyền lợi nâng cấp & thanh toán PayOS',
    iconType: 'vip',
    prompt: 'Đề thi VIP trên hệ thống có quyền lợi gì, cách mua đề VIP hoặc đăng ký Giáo viên qua PayOS như thế nào?',
  },
];

const AUTO_SPEAK_STORAGE_KEY = 'nuna_ai_auto_speak_voice';

const AiAssistantWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const voiceCapabilities = useMemo(() => getVoiceCapabilities(), []);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [focusedQuestion, setFocusedQuestion] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);

  // Voice Input (Hybrid Plan C: Browser Web Speech API primary + Authenticated Gemini Audio fallback/toggle)
  const [voiceMode, setVoiceMode] = useState(() => {
    if (voiceCapabilities.hasWebSpeech) return 'browser';
    if (voiceCapabilities.hasMediaRecorder) return 'gemini';
    return 'browser';
  });
  const [voiceLang, setVoiceLang] = useState('vi-VN');
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'listening' | 'recording'
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceError, setVoiceError] = useState(null);

  // Voice Output (Text-to-Speech via Web SpeechSynthesis)
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [autoSpeakOnVoice, setAutoSpeakOnVoice] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTO_SPEAK_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Chào bạn, mình là **Nuna** — người bạn đồng hành luyện thi TOEIC của bạn.\n\nBạn có thể gõ câu hỏi hoặc bấm nút **Micro** để trò chuyện bằng giọng nói về từng câu (#1–#200), từ vựng, ngữ pháp và cách dùng trang web nhé!',
      suggestedFollowUps: PLATFORM_QUICK_TOPICS,
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Refs for voice capture & TTS lifecycle safety
  const recognitionRef = useRef(null);
  const bgRecognitionRef = useRef(null);
  const bgTranscriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const preVoiceDraftRef = useRef('');
  const finalTranscriptRef = useRef('');
  const combinedTranscriptRef = useRef('');
  const browserDidFinalizeRef = useRef(false);

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const levelRafRef = useRef(null);
  const recordIntervalRef = useRef(null);
  const recordingDurationRef = useRef(0);
  const voiceCancelledRef = useRef(false);
  const speechSessionRef = useRef(0);
  const ttsAudioRef = useRef(null);
  const ttsObjectUrlRef = useRef(null);
  const speakMessageRef = useRef(null);
  const sendMessageRef = useRef(null);
  const sendVoiceAudioRef = useRef(null);

  // Hide AI assistant while taking a live exam to preserve exam integrity
  const isLiveExamRoute = /^\/courses\/[^/]+\/take/i.test(location.pathname);

  // Preload SpeechSynthesis voices when available
  useEffect(() => {
    if (!voiceCapabilities.hasTts) return undefined;
    const synth = window.speechSynthesis;
    const loadVoices = () => {
      try {
        const list = synth.getVoices();
        if (Array.isArray(list) && list.length > 0) {
          setAvailableVoices(list);
        }
      } catch {
        // Ignore browser voice enumeration errors
      }
    };
    loadVoices();
    synth.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, [voiceCapabilities.hasTts]);

  // Clear exam result context when navigating away from /results/:resultId
  useEffect(() => {
    if (!location.pathname.startsWith('/results/')) {
      setExamResult(null);
      setFocusedQuestion(null);
    }
  }, [location.pathname]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 60);
  }, []);

  const buildClientFallbackReply = useCallback((promptText, activeResult, activeQuestion) => {
    const lower = String(promptText || '').toLowerCase();

    if (activeQuestion) {
      const qNum = activeQuestion.questionNumber;
      const partNum = activeQuestion.partNumber || '';
      const selected = activeQuestion.selectedAnswer ? activeQuestion.selectedAnswer : 'Bỏ trống';
      const correct = activeQuestion.correctAnswer || 'N/A';
      const statusText = !activeQuestion.selectedAnswer
        ? 'Bạn chưa chọn đáp án (Bỏ trống)'
        : activeQuestion.correct
          ? 'Bạn đã làm ĐÚNG'
          : 'Bạn đã chọn chưa chính xác';

      const lines = [
        `### Giải thích chi tiết Câu #${qNum}${partNum ? ` (Part ${partNum})` : ''}`,
        `- **Trạng thái bài làm**: ${statusText} — Bạn chọn **${selected}** | Đáp án đúng: **${correct}**`,
      ];

      if (activeQuestion.questionContent) {
        lines.push(`- **Nội dung câu hỏi**: ${activeQuestion.questionContent}`);
      }
      if (activeQuestion.paragraph) {
        lines.push(`\n**Đoạn văn (Passage):**\n> ${String(activeQuestion.paragraph).replace(/\n/g, '\n> ')}`);
      }
      if (activeQuestion.transcript) {
        lines.push(`\n**Lời thoại âm thanh (Transcript):**\n> ${String(activeQuestion.transcript).replace(/\n/g, '\n> ')}`);
      }
      if (activeQuestion.translation) {
        lines.push(`\n**Tạm dịch đoạn văn / hội thoại:**\n${activeQuestion.translation}`);
      }

      const opts = [];
      if (activeQuestion.optionA) opts.push(`- **A.** ${activeQuestion.optionA}${correct === 'A' ? ' *(Đáp án đúng)*' : ''}`);
      if (activeQuestion.optionB) opts.push(`- **B.** ${activeQuestion.optionB}${correct === 'B' ? ' *(Đáp án đúng)*' : ''}`);
      if (activeQuestion.optionC) opts.push(`- **C.** ${activeQuestion.optionC}${correct === 'C' ? ' *(Đáp án đúng)*' : ''}`);
      if (activeQuestion.optionD) opts.push(`- **D.** ${activeQuestion.optionD}${correct === 'D' ? ' *(Đáp án đúng)*' : ''}`);
      if (opts.length > 0) {
        lines.push(`\n**Các phương án lựa chọn:**\n${opts.join('\n')}`);
      }

      if (activeQuestion.explanation) {
        lines.push(`\n**Giải thích & Phân tích chi tiết:**\n${activeQuestion.explanation}`);
      } else {
        lines.push(
          `\n**Phân tích trọng tâm:**\n- Đáp án đúng của Câu #${qNum} là **${correct}**. Bạn hãy đối chiếu từ khóa trong câu hỏi/transcript với phương án **${correct}** để nắm chắc ngữ cảnh.`
        );
      }

      return {
        reply: lines.join('\n'),
        referencedQuestionNumber: qNum,
        suggestedFollowUps: [
          `Từ vựng và cấu trúc ngữ pháp cần nhớ ở câu #${qNum}`,
          `Mẹo tránh bẫy thường gặp ở câu #${qNum}`,
          'Phân tích tổng quan kết quả bài thi này',
        ],
      };
    }

    if (
      lower.includes('bao nhiêu câu') ||
      lower.includes('cấu trúc') ||
      lower.includes('thang điểm') ||
      lower.includes('thời gian làm')
    ) {
      return {
        reply: [
          '### Cấu trúc chuẩn của bài thi TOEIC (Listening & Reading)',
          'Một đề thi **TOEIC Full Test** tiêu chuẩn gồm **200 câu hỏi trắc nghiệm**, thực hiện trong **120 phút** với tổng điểm **10 – 990 điểm**:',
          '1. **Phần Nghe (Listening Comprehension — 100 câu / ~45 phút | 5 – 495 điểm):**',
          '   - **Part 1 (6 câu — Câu 1–6)**: Mô tả tranh (*Photographs*).',
          '   - **Part 2 (25 câu — Câu 7–31)**: Hỏi – Đáp ngắn (*Question – Response*, 3 lựa chọn A/B/C).',
          '   - **Part 3 (39 câu — Câu 32–70)**: Đoạn hội thoại ngắn (*Conversations*, 13 đoạn × 3 câu).',
          '   - **Part 4 (30 câu — Câu 71–100)**: Bài nói ngắn (*Short Talks*, 10 bài × 3 câu).',
          '2. **Phần Đọc (Reading Comprehension — 100 câu / 75 phút | 5 – 495 điểm):**',
          '   - **Part 5 (30 câu — Câu 101–130)**: Điền vào câu chưa hoàn chỉnh (*Incomplete Sentences*).',
          '   - **Part 6 (16 câu — Câu 131–146)**: Điền vào đoạn văn (*Text Completion*, 4 đoạn × 4 câu).',
          '   - **Part 7 (54 câu — Câu 147–200)**: Đọc hiểu đoạn đơn và đoạn kép/ba (*Reading Comprehension*).',
        ].join('\n'),
        referencedQuestionNumber: null,
        suggestedFollowUps: [
          'Chiến thuật phân bổ thời gian làm Reading (Part 5, 6, 7)',
          'Mẹo nghe hiệu quả cho Part 2 và Part 3',
          'Cách làm bài thi TOEIC trên trang web như thế nào?',
        ],
      };
    }

    if (activeResult) {
      const total = activeResult.totalQuestions || activeResult.questions?.length || 0;
      const correctCount = activeResult.correctCount || 0;
      const accuracy = total > 0 ? Math.round((correctCount * 100) / total) : 0;
      return {
        reply: [
          `### Tổng quan bài làm: **${activeResult.testTitle || 'Đề thi TOEIC'}**`,
          `- **Điểm quy đổi**: **${activeResult.score || 0}** điểm (Listening: **${activeResult.listeningScore || 0}** | Reading: **${activeResult.readingScore || 0}**)`,
          `- **Độ chính xác**: **${correctCount}/${total}** câu đúng (**${accuracy}%**)`,
          '',
          'Bạn có thể chọn bất kỳ câu nào ở thanh **"Ngữ cảnh đang hỏi"** phía trên hoặc gõ trực tiếp số câu (ví dụ: *"Giải thích câu 8"*, *"Nội dung câu 15 là gì"*) để mình phân tích chi tiết!',
        ].join('\n'),
        referencedQuestionNumber: null,
        suggestedFollowUps: [
          'Giải thích câu 1 giúp mình',
          'Giải thích câu 8 giúp mình',
          'Gợi ý lộ trình cải thiện điểm từ kết quả này',
        ],
      };
    }

    if (
      lower.includes('lớp học') ||
      lower.includes('classroom') ||
      lower.includes('pdf') ||
      lower.includes('xem trước') ||
      lower.includes('gmail') ||
      lower.includes('email')
    ) {
      return {
        reply: [
          '### Hệ thống Lớp học trực tuyến, Xem trước PDF & Thông báo Gmail (`/classrooms`)',
          '- **4 tab trực quan**: **Bảng tin**, **Bài tập trên lớp**, **Mọi người**, và **Điểm số**.',
          '- **Xem trước tài liệu PDF trực tiếp**: Ở mỗi tài liệu PDF trong lớp, bạn bấm nút **"Xem trước"** để mở cửa sổ đọc PDF trực tiếp ngay trên trình duyệt, hoặc bấm **"Tải PDF"** để tải về máy.',
          '- **Mời học viên hàng loạt qua Gmail**: Giáo viên bấm **"Mời qua Gmail"** và nhập danh sách địa chỉ Gmail; học viên đã có tài khoản sẽ được **duyệt thẳng vào lớp**, đồng thời nhận email lời mời kèm Mã lớp (`Class Code`).',
          '- **Thông báo bài tập qua Gmail**: Khi Giáo viên giao bài tập mới, đổi hạn nộp hoặc đăng thông báo Bảng tin, hệ thống tự động gửi email thông báo tới Gmail của toàn bộ học viên trong lớp.',
        ].join('\n'),
        referencedQuestionNumber: null,
        suggestedFollowUps: [
          'Đề thi VIP và Đăng ký Giáo viên qua PayOS hoạt động thế nào?',
          'Hướng dẫn luyện nghe chép chính tả Dictation',
          'Cách làm Full Test 200 câu và tự động lưu khi F5',
        ],
      };
    }

    if (
      lower.includes('vip') ||
      lower.includes('payos') ||
      lower.includes('thanh toán') ||
      lower.includes('giáo viên') ||
      lower.includes('hết hạn')
    ) {
      return {
        reply: [
          '### Đề thi VIP & Đăng ký Giáo viên qua Cổng thanh toán PayOS',
          '- **Mua Đề VIP (Mua 1 lần — Sở hữu vĩnh viễn)**: Mỗi đề VIP có giá VND riêng do Admin thiết lập; quét mã QR VietQR qua **PayOS**, hệ thống xác nhận tự động qua Webhook và mở khóa vĩnh viễn đề đó.',
          '- **Đăng ký Giáo viên (`/teacher/application`)**: Lệ phí xét duyệt là **2.000 ₫** qua PayOS. Nếu link thanh toán cũ hết hạn, bạn chỉ cần bấm tạo lại mã QR PayOS mới ngay trên trang để tiếp tục thanh toán; sau khi thanh toán xong, hồ sơ chuyển sang chờ Admin phê duyệt cấp quyền `ROLE_TEACHER`.',
          '- **Tra cứu giao dịch**: Xem lịch sử biên nhận tại **Hồ sơ cá nhân (`/profile?tab=payments`)**.',
        ].join('\n'),
        referencedQuestionNumber: null,
        suggestedFollowUps: [
          'Hệ thống Lớp học, Xem trước PDF và Mời qua Gmail hoạt động thế nào?',
          'Kho đề thi có bao nhiêu bộ đề ETS và YBM?',
          'Hướng dẫn cách tính điểm TOEIC 990 trên web',
        ],
      };
    }

    return null;
  }, []);

  const stopSpeaking = useCallback(() => {
    speechSessionRef.current += 1;
    if (ttsAudioRef.current) {
      try {
        ttsAudioRef.current.pause();
        ttsAudioRef.current.removeAttribute('src');
        ttsAudioRef.current.load();
      } catch {
        // Ignore HTMLAudioElement pause errors
      }
    }
    if (ttsObjectUrlRef.current) {
      try {
        URL.revokeObjectURL(ttsObjectUrlRef.current);
      } catch {
        // Ignore URL revoke errors
      }
      ttsObjectUrlRef.current = null;
    }
    if (voiceCapabilities.hasTts) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore TTS cancel errors
      }
    }
    setSpeakingMsgId(null);
  }, [voiceCapabilities.hasTts]);

  const speakWithBrowserFallback = useCallback(
    (sessionId, plainText, targetLocale) => {
      if (!voiceCapabilities.hasTts || speechSessionRef.current !== sessionId) {
        setSpeakingMsgId(null);
        return;
      }
      const chunks = splitTextIntoSpeechChunks(plainText, 220);
      if (chunks.length === 0) {
        setSpeakingMsgId(null);
        return;
      }

      const synth = window.speechSynthesis;
      const voicesNow = availableVoices.length > 0 ? availableVoices : synth.getVoices?.() || [];
      const chosenVoice = selectSpeechVoice(voicesNow, targetLocale);

      if (!chosenVoice && targetLocale.toLowerCase().startsWith('vi')) {
        setSpeakingMsgId(null);
        setVoiceError({
          message:
            'Trình duyệt trên máy chưa có gói giọng đọc Tiếng Việt và tạm thời không kết nối được máy chủ đọc giọng nói.',
        });
        return;
      }

      try {
        synth.cancel();
      } catch {
        // Ignore cancel error
      }

      setTimeout(() => {
        if (speechSessionRef.current !== sessionId) return;
        try {
          synth.resume?.();
        } catch {
          // Ignore resume error
        }

        const speakChunkAt = (index) => {
          if (speechSessionRef.current !== sessionId || index >= chunks.length) {
            if (speechSessionRef.current === sessionId) {
              setSpeakingMsgId(null);
            }
            return;
          }
          const utterance = new SpeechSynthesisUtterance(chunks[index]);
          utterance.lang = chosenVoice?.lang || targetLocale;
          if (chosenVoice) {
            utterance.voice = chosenVoice;
          }
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.onend = () => {
            if (speechSessionRef.current !== sessionId) return;
            speakChunkAt(index + 1);
          };
          utterance.onerror = () => {
            if (speechSessionRef.current === sessionId) {
              setSpeakingMsgId(null);
            }
          };
          synth.speak(utterance);
        };

        speakChunkAt(0);
      }, 75);
    },
    [availableVoices, voiceCapabilities.hasTts]
  );

  const speakMessage = useCallback(
    async (msgId, rawText) => {
      if (speakingMsgId === msgId) {
        stopSpeaking();
        return;
      }

      const plainText = sanitizeMarkdownForSpeech(rawText);
      if (!plainText) return;

      stopSpeaking();
      const sessionId = speechSessionRef.current;
      const targetLocale = detectSpeechLocale(plainText, voiceLang);
      const langCode = targetLocale.toLowerCase().startsWith('en') ? 'en' : 'vi';

      setSpeakingMsgId(msgId);
      setVoiceError(null);

      try {
        const audioBlob = await aiService.synthesizeSpeech({
          text: plainText,
          lang: langCode,
        });
        if (speechSessionRef.current !== sessionId) return;

        if (audioBlob && audioBlob.size > 128) {
          const objectUrl = URL.createObjectURL(audioBlob);
          ttsObjectUrlRef.current = objectUrl;
          const player = new Audio(objectUrl);
          player.rate = 1.0;
          player.onended = () => {
            if (speechSessionRef.current === sessionId) {
              setSpeakingMsgId(null);
            }
          };
          player.onerror = () => {
            if (speechSessionRef.current === sessionId) {
              speakWithBrowserFallback(sessionId, plainText, targetLocale);
            }
          };
          ttsAudioRef.current = player;
          await player.play();
          return;
        }
      } catch {
        // Fall back to browser SpeechSynthesis if backend TTS is unreachable or autoplay blocked
      }

      if (speechSessionRef.current === sessionId) {
        speakWithBrowserFallback(sessionId, plainText, targetLocale);
      }
    },
    [speakingMsgId, speakWithBrowserFallback, stopSpeaking, voiceLang]
  );

  useEffect(() => {
    speakMessageRef.current = speakMessage;
  }, [speakMessage]);

  const cleanupRecordingResources = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (bgRecognitionRef.current) {
      try {
        bgRecognitionRef.current.abort?.();
        bgRecognitionRef.current.stop?.();
      } catch {
        // Ignore background recognition stop error
      }
      bgRecognitionRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (levelRafRef.current) {
      cancelAnimationFrame(levelRafRef.current);
      levelRafRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignore AudioContext close error
      }
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop error
        }
      });
      mediaStreamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const cancelVoiceCapture = useCallback(() => {
    voiceCancelledRef.current = true;
    browserDidFinalizeRef.current = true;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort?.();
        recognitionRef.current.stop?.();
      } catch {
        // Ignore SpeechRecognition abort error
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore MediaRecorder stop error
      }
    }
    cleanupRecordingResources();
    setVoiceState('idle');
    setRecordingSeconds(0);
    recordingDurationRef.current = 0;
    if (preVoiceDraftRef.current !== undefined) {
      setInputValue(preVoiceDraftRef.current);
      preVoiceDraftRef.current = '';
    }
  }, [cleanupRecordingResources]);

  const resolveActiveExamTarget = useCallback(
    (overrideContext = {}, textForQuestionMatch = '') => {
      const activeResult = overrideContext.result !== undefined ? overrideContext.result : examResult;
      let activeQuestion =
        overrideContext.question !== undefined ? overrideContext.question : focusedQuestion;

      if (textForQuestionMatch && activeResult?.questions?.length) {
        const normalizedMatchText = normalizeSpokenVietnameseNumbers(textForQuestionMatch);
        const match = normalizedMatchText.match(/(?:câu|cau|question|q|#)\s*(\d{1,3})\b/i);
        if (match) {
          const parsedNum = Number(match[1]);
          const matchedFromPrompt = activeResult.questions.find(
            (q) => Number(q.questionNumber) === parsedNum
          );
          if (matchedFromPrompt) {
            activeQuestion = matchedFromPrompt;
            setFocusedQuestion(matchedFromPrompt);
          }
        }
      }

      const routeResultIdMatch = location.pathname.match(/^\/results\/([^/?#]+)/i);
      const resolvedResultId =
        activeResult?.testResultId || (routeResultIdMatch ? routeResultIdMatch[1] : null);

      return { activeResult, activeQuestion, resolvedResultId };
    },
    [examResult, focusedQuestion, location.pathname]
  );

  const sendMessage = useCallback(
    async (rawPrompt, overrideContext = {}) => {
      const promptText = String(rawPrompt || '').trim();
      if (!promptText || loading) return;

      const viaVoice = Boolean(overrideContext.viaVoice);
      const { activeResult, activeQuestion, resolvedResultId } = resolveActiveExamTarget(
        overrideContext,
        promptText
      );

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: promptText,
        viaVoiceAudio: viaVoice,
        questionBadge: activeQuestion ? `Câu #${activeQuestion.questionNumber}` : null,
      };

      const historyPayload = buildHistoryPayload(messages);

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      preVoiceDraftRef.current = '';
      combinedTranscriptRef.current = '';
      finalTranscriptRef.current = '';
      setVoiceError(null);
      setLoading(true);
      scrollToBottom();

      try {
        const response = await aiService.chat({
          message: promptText,
          resultId: resolvedResultId,
          questionId: activeQuestion?.questionId || null,
          questionNumber: activeQuestion?.questionNumber || null,
          pageContext: location.pathname,
          history: historyPayload,
        });

        const data = response?.data;
        const replyText =
          data?.reply ||
          'Mình đã ghi nhận câu hỏi của bạn nhưng phản hồi hiện đang trống. Bạn vui lòng thử hỏi lại nhé!';

        if (data?.referencedQuestionNumber && activeResult?.questions) {
          const matchedQ = activeResult.questions.find(
            (q) => Number(q.questionNumber) === Number(data.referencedQuestionNumber)
          );
          if (matchedQ) {
            setFocusedQuestion(matchedQ);
          }
        }

        const aiMsgId = `ai-${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            role: 'assistant',
            content: replyText,
            referencedQuestionNumber:
              data?.referencedQuestionNumber || activeQuestion?.questionNumber || null,
            suggestedFollowUps: Array.isArray(data?.suggestedFollowUps) ? data.suggestedFollowUps : [],
          },
        ]);

        if (viaVoice && autoSpeakOnVoice) {
          speakMessageRef.current?.(aiMsgId, replyText);
        }
      } catch (err) {
        const localFallback = buildClientFallbackReply(promptText, activeResult, activeQuestion);
        if (localFallback) {
          const fallbackMsgId = `ai-fallback-${Date.now()}`;
          setMessages((prev) => [
            ...prev,
            {
              id: fallbackMsgId,
              role: 'assistant',
              content: localFallback.reply,
              referencedQuestionNumber: localFallback.referencedQuestionNumber,
              suggestedFollowUps: localFallback.suggestedFollowUps,
            },
          ]);
          if (viaVoice && autoSpeakOnVoice) {
            speakMessageRef.current?.(fallbackMsgId, localFallback.reply);
          }
        } else {
          const errMsg =
            err?.response?.data?.message ||
            'Hiện tại kết nối tới Trợ lý AI đang bận. Bạn vui lòng thử lại sau giây lát nhé.';
          setMessages((prev) => [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: 'assistant',
              isError: true,
              content: errMsg,
            },
          ]);
        }
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [
      autoSpeakOnVoice,
      buildClientFallbackReply,
      loading,
      location.pathname,
      messages,
      resolveActiveExamTarget,
      scrollToBottom,
    ]
  );

  const sendVoiceAudio = useCallback(
    async (audioBlob, fileName, durationSec, clientTranscript = '') => {
      if (!audioBlob || loading) return;
      if (!isAuthenticated) {
        setVoiceError({
          message: 'Tính năng ghi âm gửi trực tiếp cho AI chỉ dành cho tài khoản đã đăng nhập.',
          actionLabel: 'Đăng nhập ngay',
          actionType: 'login',
        });
        return;
      }

      const trimmedClientTranscript = String(clientTranscript || '').trim();
      const { activeResult, activeQuestion, resolvedResultId } = resolveActiveExamTarget(
        {},
        trimmedClientTranscript
      );
      const tempUserMsgId = `user-voice-${Date.now()}`;
      const historyPayload = buildHistoryPayload(messages);

      setMessages((prev) => [
        ...prev,
        {
          id: tempUserMsgId,
          role: 'user',
          content:
            trimmedClientTranscript ||
            `Đang gửi câu hỏi giọng nói (${formatRecordingDuration(durationSec)})...`,
          viaVoiceAudio: true,
          questionBadge: activeQuestion ? `Câu #${activeQuestion.questionNumber}` : null,
        },
      ]);
      setInputValue('');
      preVoiceDraftRef.current = '';
      setVoiceError(null);
      setLoading(true);
      scrollToBottom();

      try {
        const response = await aiService.voiceChat({
          audioBlob,
          fileName,
          resultId: resolvedResultId,
          questionId: activeQuestion?.questionId || null,
          questionNumber: activeQuestion?.questionNumber || null,
          pageContext: location.pathname,
          history: historyPayload,
          languageHint: voiceLang.startsWith('en') ? 'en' : 'vi',
          clientTranscript: trimmedClientTranscript,
        });

        const data = response?.data;
        const transcriptText = data?.userTranscript
          ? String(data.userTranscript).trim()
          : trimmedClientTranscript || '(Tin nhắn thoại)';
        const replyText =
          data?.reply ||
          'Mình đã nghe đoạn ghi âm nhưng chưa tạo được phản hồi. Bạn vui lòng thử lại nhé!';

        if (data?.referencedQuestionNumber && activeResult?.questions) {
          const matchedQ = activeResult.questions.find(
            (q) => Number(q.questionNumber) === Number(data.referencedQuestionNumber)
          );
          if (matchedQ) {
            setFocusedQuestion(matchedQ);
          }
        }

        const resolvedQuestionBadge = data?.referencedQuestionNumber
          ? `Câu #${data.referencedQuestionNumber}`
          : activeQuestion
            ? `Câu #${activeQuestion.questionNumber}`
            : null;

        const aiMsgId = `ai-voice-${Date.now()}`;
        setMessages((prev) => [
          ...prev.map((m) =>
            m.id === tempUserMsgId
              ? {
                ...m,
                content: transcriptText,
                questionBadge: resolvedQuestionBadge,
              }
              : m
          ),
          {
            id: aiMsgId,
            role: 'assistant',
            content: replyText,
            referencedQuestionNumber:
              data?.referencedQuestionNumber || activeQuestion?.questionNumber || null,
            suggestedFollowUps: Array.isArray(data?.suggestedFollowUps)
              ? data.suggestedFollowUps
              : [],
          },
        ]);

        if (autoSpeakOnVoice) {
          speakMessageRef.current?.(aiMsgId, replyText);
        }
      } catch (err) {
        // Client-side fallback if voice-chat endpoint fails but we captured clientTranscript
        if (trimmedClientTranscript) {
          const localFallback = buildClientFallbackReply(
            trimmedClientTranscript,
            activeResult,
            activeQuestion
          );
          if (localFallback) {
            const fallbackMsgId = `ai-voice-fallback-${Date.now()}`;
            setMessages((prev) => [
              ...prev.map((m) =>
                m.id === tempUserMsgId ? { ...m, content: trimmedClientTranscript } : m
              ),
              {
                id: fallbackMsgId,
                role: 'assistant',
                content: localFallback.reply,
                referencedQuestionNumber: localFallback.referencedQuestionNumber,
                suggestedFollowUps: localFallback.suggestedFollowUps,
              },
            ]);
            if (autoSpeakOnVoice) {
              speakMessageRef.current?.(fallbackMsgId, localFallback.reply);
            }
            return;
          }
        }

        const errCode = Number(err?.response?.data?.code);
        const errMsg =
          err?.response?.data?.message ||
          'Không thể xử lý đoạn ghi âm lúc này. Bạn vui lòng thử lại hoặc dùng nhận diện nhanh.';

        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsgId));
        if (errCode === 3018 && voiceCapabilities.hasWebSpeech) {
          setVoiceError({
            message: errMsg,
            actionLabel: 'Dùng nhận diện trình duyệt',
            actionType: 'switch-browser',
          });
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `err-voice-${Date.now()}`,
              role: 'assistant',
              isError: true,
              content: errMsg,
            },
          ]);
        }
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [
      autoSpeakOnVoice,
      buildClientFallbackReply,
      isAuthenticated,
      loading,
      location.pathname,
      messages,
      resolveActiveExamTarget,
      scrollToBottom,
      voiceCapabilities.hasWebSpeech,
      voiceLang,
    ]
  );

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    sendVoiceAudioRef.current = sendVoiceAudio;
  }, [sendVoiceAudio]);

  const stopVoiceInput = useCallback(
    (cancelOnly = false) => {
      voiceCancelledRef.current = Boolean(cancelOnly);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (voiceState === 'listening' && recognitionRef.current) {
        try {
          if (cancelOnly) {
            recognitionRef.current.abort?.();
          } else {
            recognitionRef.current.stop?.();
          }
        } catch {
          setVoiceState('idle');
        }
        return;
      }

      if (voiceState === 'recording' && mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          try {
            mediaRecorderRef.current.stop();
          } catch {
            cleanupRecordingResources();
            setVoiceState('idle');
          }
        } else {
          cleanupRecordingResources();
          setVoiceState('idle');
        }
      }
    },
    [cleanupRecordingResources, voiceState]
  );

  const startGeminiVoiceRecording = useCallback(async () => {
    if (!isAuthenticated) {
      setVoiceError({
        message: 'Chế độ ghi âm gửi trực tiếp cho AI chỉ dành cho người dùng đã đăng nhập.',
        actionLabel: 'Đăng nhập ngay',
        actionType: 'login',
      });
      return;
    }
    if (!voiceCapabilities.hasMediaRecorder) {
      setVoiceError({
        message: 'Trình duyệt của bạn không hỗ trợ ghi âm Micro (MediaRecorder).',
      });
      return;
    }

    stopSpeaking();
    setVoiceError(null);
    voiceCancelledRef.current = false;
    preVoiceDraftRef.current = inputValue;
    bgTranscriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeOption = pickSupportedRecorderMimeType();
      const recorder = mimeOption.mimeType
        ? new MediaRecorder(stream, { mimeType: mimeOption.mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recordingDurationRef.current = 0;
      setRecordingSeconds(0);
      mediaRecorderRef.current = recorder;

      // Run parallel background SpeechRecognition if supported for live preview & resilient fallback
      const SpeechRecCtor = getSpeechRecognitionConstructor();
      if (SpeechRecCtor) {
        try {
          const bgRec = new SpeechRecCtor();
          bgRec.lang = voiceLang;
          bgRec.interimResults = true;
          bgRec.continuous = true;
          bgRec.maxAlternatives = 1;
          bgRec.onresult = (event) => {
            let textAcc = '';
            for (let i = 0; i < event.results.length; i += 1) {
              textAcc += `${event.results[i][0]?.transcript || ''} `;
            }
            const cleaned = textAcc.replace(/\s+/g, ' ').trim();
            if (cleaned) {
              bgTranscriptRef.current = cleaned;
              setInputValue(cleaned);
            }
          };
          bgRec.onerror = () => {
            // Ignore background speech recognition errors while MediaRecorder is active
          };
          bgRec.start();
          bgRecognitionRef.current = bgRec;
        } catch {
          // Ignore if background recognition cannot start simultaneously
        }
      }

      // Live volume bar via Web Audio API
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          const sourceNode = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          sourceNode.connect(analyser);
          audioContextRef.current = audioCtx;
          const dataArr = new Uint8Array(analyser.frequencyBinCount);
          const updateMeter = () => {
            if (!audioContextRef.current) return;
            analyser.getByteFrequencyData(dataArr);
            let sum = 0;
            for (let i = 0; i < dataArr.length; i += 1) {
              sum += dataArr[i];
            }
            const avg = sum / dataArr.length;
            setAudioLevel(Math.min(100, Math.round((avg / 95) * 100)));
            levelRafRef.current = requestAnimationFrame(updateMeter);
          };
          levelRafRef.current = requestAnimationFrame(updateMeter);
        }
      } catch {
        // Keep recording working even if AudioContext meter is blocked
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const capturedDuration = Math.max(1, recordingDurationRef.current);
        const wasCancelled = voiceCancelledRef.current;
        const capturedBgTranscript = bgTranscriptRef.current;
        cleanupRecordingResources();
        setVoiceState('idle');
        setRecordingSeconds(0);
        recordingDurationRef.current = 0;

        if (wasCancelled) {
          setInputValue(preVoiceDraftRef.current || '');
          preVoiceDraftRef.current = '';
          return;
        }

        const blobType = recorder.mimeType || mimeOption.mimeType || 'audio/webm';
        const rawBlob = new Blob(audioChunksRef.current, { type: blobType });
        audioChunksRef.current = [];

        if (rawBlob.size < 256 && !capturedBgTranscript) {
          setVoiceError({
            message: 'Đoạn ghi âm quá ngắn. Hãy nói ít nhất 1 giây rồi bấm Dừng & Gửi.',
          });
          return;
        }

        // Convert to 16kHz mono PCM WAV for universal Vertex AI & Gemini compatibility
        const { blob: finalAudioBlob, fileExt: finalExt } = await convertAudioBlobToWav(
          rawBlob,
          mimeOption.fileExt
        );

        if (finalAudioBlob.size > MAX_VOICE_AUDIO_BYTES) {
          setVoiceError({
            message: 'Đoạn ghi âm vượt quá giới hạn 4 MB. Vui lòng nói ngắn gọn hơn dưới 45 giây.',
          });
          return;
        }

        const fileName = `nuna-voice-${Date.now()}.${finalExt}`;
        sendVoiceAudioRef.current?.(
          finalAudioBlob,
          fileName,
          capturedDuration,
          capturedBgTranscript
        );
      };

      recorder.start(250);
      setVoiceState('recording');

      recordIntervalRef.current = setInterval(() => {
        recordingDurationRef.current += 1;
        setRecordingSeconds(recordingDurationRef.current);
        if (recordingDurationRef.current >= MAX_VOICE_RECORD_SECONDS) {
          voiceCancelledRef.current = false;
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
              mediaRecorderRef.current.stop();
            } catch {
              cleanupRecordingResources();
              setVoiceState('idle');
            }
          }
        }
      }, 1000);
    } catch (err) {
      cleanupRecordingResources();
      setVoiceState('idle');
      const errName = err?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setVoiceError({
          message: 'Trình duyệt chưa được cấp quyền Micro. Vui lòng cho phép Micro rồi thử lại.',
        });
      } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        setVoiceError({
          message: 'Không tìm thấy thiết bị Micro trên máy của bạn.',
        });
      } else {
        setVoiceError({
          message: 'Không thể khởi động Micro ghi âm. Vui lòng kiểm tra thiết bị hoặc nhập chữ.',
        });
      }
    }
  }, [
    cleanupRecordingResources,
    inputValue,
    isAuthenticated,
    stopSpeaking,
    voiceCapabilities.hasMediaRecorder,
    voiceLang,
  ]);

  const startBrowserRecognition = useCallback(() => {
    const SpeechRecCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecCtor) {
      if (voiceCapabilities.hasMediaRecorder) {
        if (isAuthenticated) {
          setVoiceMode('gemini');
          startGeminiVoiceRecording();
        } else {
          setVoiceError({
            message:
              'Trình duyệt này chưa hỗ trợ nhận diện giọng nói nhanh. Hãy đăng nhập để dùng Micro AI ghi âm song ngữ.',
            actionLabel: 'Đăng nhập ngay',
            actionType: 'login',
          });
        }
      } else {
        setVoiceError({
          message: 'Trình duyệt của bạn hiện chưa hỗ trợ nhập liệu bằng giọng nói.',
        });
      }
      return;
    }

    stopSpeaking();
    setVoiceError(null);
    voiceCancelledRef.current = false;
    browserDidFinalizeRef.current = false;
    preVoiceDraftRef.current = inputValue;
    finalTranscriptRef.current = '';
    combinedTranscriptRef.current = '';

    try {
      const recognition = new SpeechRecCtor();
      recognition.lang = voiceLang;
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        let finalSeg = '';
        let interimSeg = '';
        for (let i = 0; i < event.results.length; i += 1) {
          const transcriptPiece = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            finalSeg += `${transcriptPiece} `;
          } else {
            interimSeg += transcriptPiece;
          }
        }
        finalTranscriptRef.current = finalSeg.trim();
        const combined = `${finalSeg}${interimSeg}`.replace(/\s+/g, ' ').trim();
        combinedTranscriptRef.current = combined;
        setInputValue(combined);

        // Reset 1.8s silence auto-submit timer whenever user speaks new words
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        if (combined.length > 0) {
          silenceTimerRef.current = setTimeout(() => {
            if (recognitionRef.current && !voiceCancelledRef.current) {
              try {
                recognitionRef.current.stop();
              } catch {
                // Ignore stop error
              }
            }
          }, 1800);
        }
      };

      recognition.onerror = (event) => {
        const code = event?.error || '';
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (voiceCancelledRef.current || code === 'aborted') {
          return;
        }
        recognitionRef.current = null;
        setVoiceState('idle');

        if (code === 'not-allowed' || code === 'service-not-allowed') {
          setVoiceError({
            message: 'Trình duyệt chưa được cấp quyền Micro. Vui lòng cho phép quyền Micro trên thanh địa chỉ.',
          });
          return;
        }
        if (code === 'audio-capture') {
          setVoiceError({
            message: 'Không tìm thấy hoặc không thể truy cập thiết bị Micro.',
          });
          return;
        }
        if (code === 'no-speech') {
          setVoiceError({
            message: 'Nuna chưa nghe thấy tiếng nói. Hãy bấm Micro và thử nói lại rõ hơn nhé.',
          });
          return;
        }

        // Hybrid automatic fallback: immediately start Gemini recording if authenticated
        if (voiceCapabilities.hasMediaRecorder && isAuthenticated) {
          browserDidFinalizeRef.current = true;
          setVoiceMode('gemini');
          startGeminiVoiceRecording();
        } else if (voiceCapabilities.hasMediaRecorder && !isAuthenticated) {
          setVoiceError({
            message:
              'Nhận diện nhanh trình duyệt gặp lỗi mạng. Đăng nhập để dùng chế độ Ghi âm AI (Song ngữ).',
            actionLabel: 'Đăng nhập ngay',
            actionType: 'login',
          });
        } else {
          setVoiceError({
            message: 'Nhận diện giọng nói tạm thời gián đoạn. Vui lòng thử lại hoặc nhập chữ.',
          });
        }
      };

      recognition.onend = () => {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        if (browserDidFinalizeRef.current) return;
        browserDidFinalizeRef.current = true;
        recognitionRef.current = null;
        setVoiceState('idle');

        if (voiceCancelledRef.current) {
          setInputValue(preVoiceDraftRef.current);
          preVoiceDraftRef.current = '';
          return;
        }

        const spokenText = (combinedTranscriptRef.current || finalTranscriptRef.current || '').trim();
        if (spokenText) {
          sendMessageRef.current?.(spokenText, { viaVoice: true });
        } else if (preVoiceDraftRef.current) {
          setInputValue(preVoiceDraftRef.current);
          preVoiceDraftRef.current = '';
        }
      };

      recognition.start();
      setVoiceState('listening');
    } catch {
      recognitionRef.current = null;
      setVoiceState('idle');
      setVoiceError({
        message: 'Không thể khởi động nhận diện giọng nói. Vui lòng thử lại hoặc chuyển sang Ghi âm AI.',
      });
    }
  }, [
    inputValue,
    isAuthenticated,
    startGeminiVoiceRecording,
    stopSpeaking,
    voiceCapabilities.hasMediaRecorder,
    voiceLang,
  ]);

  const primeTtsAudioElement = useCallback(() => {
    if (!ttsAudioRef.current && typeof Audio !== 'undefined') {
      ttsAudioRef.current = new Audio();
    }
  }, []);

  const handleMicButtonClick = useCallback(() => {
    if (loading) return;
    primeTtsAudioElement();
    if (voiceState !== 'idle') {
      stopVoiceInput(false);
      return;
    }
    if (voiceMode === 'gemini') {
      startGeminiVoiceRecording();
    } else {
      startBrowserRecognition();
    }
  }, [
    loading,
    primeTtsAudioElement,
    startBrowserRecognition,
    startGeminiVoiceRecording,
    stopVoiceInput,
    voiceMode,
    voiceState,
  ]);

  const handleComposerSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (loading) return;
      primeTtsAudioElement();

      if (voiceState === 'recording') {
        stopVoiceInput(false);
        return;
      }

      if (voiceState === 'listening') {
        const textToSubmit = (
          inputValue ||
          combinedTranscriptRef.current ||
          finalTranscriptRef.current ||
          ''
        ).trim();
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        voiceCancelledRef.current = true;
        browserDidFinalizeRef.current = true;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop?.();
          } catch {
            // Ignore stop error
          }
          recognitionRef.current = null;
        }
        setVoiceState('idle');
        if (textToSubmit) {
          sendMessage(textToSubmit, { viaVoice: true });
        }
        return;
      }

      sendMessage(inputValue);
    },
    [inputValue, loading, primeTtsAudioElement, sendMessage, stopVoiceInput, voiceState]
  );

  const handleSwitchVoiceMode = useCallback(
    (nextMode) => {
      if (voiceState !== 'idle') return;
      setVoiceError(null);
      if (nextMode === 'gemini') {
        if (!voiceCapabilities.hasMediaRecorder) {
          setVoiceError({ message: 'Trình duyệt của bạn không hỗ trợ ghi âm MediaRecorder.' });
          return;
        }
        if (!isAuthenticated) {
          setVoiceError({
            message: 'Chế độ Ghi âm gửi trực tiếp cho AI chỉ dành cho người dùng đã đăng nhập.',
            actionLabel: 'Đăng nhập ngay',
            actionType: 'login',
          });
          return;
        }
        setVoiceMode('gemini');
      } else {
        if (!voiceCapabilities.hasWebSpeech) {
          setVoiceError({
            message: 'Trình duyệt hiện tại không hỗ trợ nhận diện nhanh Web Speech API.',
          });
          return;
        }
        setVoiceMode('browser');
      }
    },
    [isAuthenticated, voiceCapabilities.hasMediaRecorder, voiceCapabilities.hasWebSpeech, voiceState]
  );

  const handleToggleAutoSpeak = useCallback(() => {
    setAutoSpeakOnVoice((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(AUTO_SPEAK_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage errors
      }
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  }, [stopSpeaking]);

  // Stop voice & TTS if panel closes or user navigates into live exam route
  useEffect(() => {
    if (!isOpen || isLiveExamRoute) {
      cancelVoiceCapture();
      stopSpeaking();
    }
  }, [cancelVoiceCapture, isLiveExamRoute, isOpen, stopSpeaking]);

  // Ensure hardware mic stream & TTS stop on unmount
  useEffect(() => {
    return () => {
      cancelVoiceCapture();
      stopSpeaking();
    };
  }, [cancelVoiceCapture, stopSpeaking]);

  // Listen to custom events from TestResultPage or any other page
  useEffect(() => {
    const handleSyncResult = (event) => {
      const incomingResult = event.detail?.result || null;
      setExamResult(incomingResult);
    };

    const handleOpenAssistant = (event) => {
      const detail = event.detail || {};
      const nextResult = detail.result !== undefined ? detail.result : examResult;
      const nextQuestion = detail.question !== undefined ? detail.question : focusedQuestion;

      if (detail.result !== undefined) {
        setExamResult(detail.result);
      }
      if (detail.question !== undefined) {
        setFocusedQuestion(detail.question);
      }

      setIsOpen(true);

      if (detail.autoPrompt) {
        setTimeout(() => {
          sendMessage(detail.autoPrompt, {
            result: nextResult,
            question: nextQuestion,
          });
        }, 80);
      } else {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 120);
      }
    };

    window.addEventListener('toeic:sync-ai-exam-result', handleSyncResult);
    window.addEventListener('toeic:open-ai-assistant', handleOpenAssistant);
    return () => {
      window.removeEventListener('toeic:sync-ai-exam-result', handleSyncResult);
      window.removeEventListener('toeic:open-ai-assistant', handleOpenAssistant);
    };
  }, [examResult, focusedQuestion, sendMessage]);

  // Escape key cancels active recording first, otherwise closes panel
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (voiceState !== 'idle') {
          cancelVoiceCapture();
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelVoiceCapture, isOpen, voiceState]);

  const resultQuestions = useMemo(
    () => (Array.isArray(examResult?.questions) ? examResult.questions : []),
    [examResult]
  );

  if (isLiveExamRoute) {
    return null;
  }

  const handleCopyMessage = (msgId, text) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(String(text || '')).then(() => {
      setCopiedMsgId(msgId);
      setTimeout(() => {
        setCopiedMsgId((prev) => (prev === msgId ? null : prev));
      }, 1800);
    });
  };

  const handleResetConversation = () => {
    cancelVoiceCapture();
    stopSpeaking();
    setVoiceError(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: examResult
          ? `Gâu gâu! Nuna đang kết nối với bài làm **${examResult.testTitle || 'Đề thi TOEIC'}** của bạn rồi! 🐾\nBạn có thể bấm nút **Micro** để hỏi bằng giọng nói hoặc chọn bất kỳ câu nào từ **#1 – #${resultQuestions.length}** nhé!`
          : 'Nuna đã làm mới cuộc trò chuyện rồi! 🐾 Bạn có thể gõ chữ hoặc bấm **Micro** để trò chuyện cùng Nuna về TOEIC và trang web nhé.',
        suggestedFollowUps: examResult
          ? [
            'Phân tích điểm mạnh, điểm yếu của tôi trong bài thi này',
            'Tôi nên ưu tiên ôn tập Part nào trước để tăng điểm?',
            'Hướng dẫn cách luyện lại các câu làm sai hiệu quả',
          ]
          : PLATFORM_QUICK_TOPICS,
      },
    ]);
  };

  const renderTopicIcon = (iconType) => {
    switch (iconType) {
      case 'exam':
        return <BookOpen size={14} />;
      case 'dictation':
        return <Languages size={14} />;
      case 'classroom':
        return <Lightbulb size={14} />;
      default:
        return <Sparkles size={14} />;
    }
  };

  const headerTobyMood = loading
    ? 'thinking'
    : focusedQuestion
      ? focusedQuestion.isCorrect
        ? 'trophy'
        : 'studying'
      : examResult
        ? 'studying'
        : 'laptop';

  return (
    <>
      {/* Floating Trigger Button featuring Nuna the Puppy Mascot */}
      {!isOpen && (
        <div className="ai-assistant-launcher fixed right-5 bottom-5 z-40 flex flex-col items-end gap-2">
          {examResult && (
            <div className="toby-speech-nudge hidden items-center gap-2 rounded-2xl border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-lg sm:flex">
              <img
                src={TOBY_IMAGES.encouragement}
                alt="Nuna khích lệ"
                className="h-8 w-10 object-contain"
              />
              <span>Gâu! Có câu nào khó cứ bấm hỏi Nuna nhé! 🐾</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 120);
            }}
            className="ai-launcher-btn group relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white p-1 shadow-[0_10px_28px_-6px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(15,23,42,0.28)]"
            aria-label="Mở Trợ lý AI Nuna — Bạn đồng hành TOEIC"
          >
            <span className="toby-launcher-avatar relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#FFFDF9]">
              <img
                src={examResult ? TOBY_IMAGES.studying : TOBY_IMAGES.cheering}
                alt="Chú cún Nuna — Trợ lý AI TOEIC"
                className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-110"
              />
            </span>
            <span className="absolute right-0.5 bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </button>
        </div>
      )}

      {/* Slide-over / Floating AI Assistant Panel */}
      {isOpen && (
        <aside
          aria-label="Cửa sổ Trợ lý AI Nuna TOEIC Learning"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(255, 253, 249, 0.80) 0%, rgba(248, 250, 252, 0.86) 55%, rgba(255, 253, 249, 0.92) 100%), url(${nunaBgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
          className={`ai-assistant-panel fixed z-50 flex flex-col overflow-hidden transition-all duration-300 ${isExpanded
            ? 'inset-3 sm:inset-6 lg:left-auto lg:w-[680px]'
            : 'inset-x-0 bottom-0 h-[86vh] sm:right-5 sm:bottom-5 sm:left-auto sm:h-[670px] sm:max-h-[calc(100vh-36px)] sm:w-[454px]'
            }`}
        >
          {/* Panel Header */}
          <header className="ai-assistant-header flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <TobyAvatar
                mood={headerTobyMood}
                size="md"
                showOnlineDot
                className="ai-header-avatar bg-[#FFFDF9]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="ai-assistant-title truncate text-[16px] font-bold tracking-tight text-slate-900">
                    Trợ lý Nuna
                  </span>
                  <span className="ai-online-badge inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>Sẵn sàng</span>
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-600">
                  {examResult
                    ? `Đang đồng hành: ${examResult.testTitle || 'Bài thi TOEIC'}`
                    : 'Bạn đồng hành giải đáp TOEIC & hướng dẫn trang web'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={handleResetConversation}
                title="Làm mới hội thoại"
                className="ai-header-icon-btn flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Thu gọn khung chat' : 'Mở rộng khung chat'}
                className="ai-header-icon-btn hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all sm:inline-flex"
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng Trợ lý AI (Esc)"
                aria-label="Đóng Trợ lý AI"
                className="ai-header-icon-btn ai-header-close-btn flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Sleek Exam Review Context Bar (Visible when viewing a completed exam on TestResultPage) */}
          {examResult && (
            <div className="ai-assistant-context px-4 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100/90 text-[#1D4ED8]">
                    <BookOpen size={13} />
                  </span>
                  {focusedQuestion ? (
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-900 tabular-nums">
                        Câu #{focusedQuestion.questionNumber} · Part {focusedQuestion.partNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${focusedQuestion.isCorrect
                          ? 'bg-emerald-100/90 text-emerald-800'
                          : 'bg-rose-100/90 text-rose-800'
                          }`}
                      >
                        {focusedQuestion.isCorrect ? <CheckCircle2 size={11} /> : <CircleX size={11} />}
                        Chọn: {focusedQuestion.selectedAnswer || 'Trống'} · Đúng: {focusedQuestion.correctAnswer}
                      </span>
                    </div>
                  ) : (
                    <span className="truncate text-xs font-bold text-slate-800">
                      Ngữ cảnh: Toàn bộ đề thi ({resultQuestions.length} câu)
                    </span>
                  )}
                </div>

                <select
                  aria-label="Chọn câu hỏi cần hỏi Trợ lý AI"
                  value={focusedQuestion?.questionId || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setFocusedQuestion(null);
                    } else {
                      const found = resultQuestions.find((q) => q.questionId === val);
                      setFocusedQuestion(found || null);
                    }
                  }}
                  className="max-w-[165px] shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-bold text-[#1D4ED8] tabular-nums transition-colors focus:outline-none"
                >
                  <option value="">Cả đề ({resultQuestions.length} câu)</option>
                  {resultQuestions.map((q) => (
                    <option key={q.questionId} value={q.questionId}>
                      Câu #{q.questionNumber} · P{q.partNumber} ({q.isCorrect ? 'Đúng' : q.selectedAnswer ? 'Sai' : 'Trống'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Action Pill Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {focusedQuestion ? (
                  <>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        sendMessage(
                          `Giải thích chi tiết vì sao câu ${focusedQuestion.questionNumber} (Part ${focusedQuestion.partNumber}) chọn đáp án ${focusedQuestion.correctAnswer} và phân tích các phương án còn lại.`
                        )
                      }
                      className="ai-context-chip-primary inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-white transition-all disabled:opacity-50"
                    >
                      <Sparkles size={11} />
                      <span>Giải thích đáp án</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        sendMessage(
                          `Trích lọc các từ vựng, cụm từ (collocations) và cấu trúc ngữ pháp quan trọng trong câu ${focusedQuestion.questionNumber}.`
                        )
                      }
                      className="ai-context-chip inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors disabled:opacity-50"
                    >
                      <Languages size={11} className="text-[#1D4ED8]" />
                      <span>Từ vựng & Ngữ pháp</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        sendMessage(
                          `Chỉ ra bẫy thường gặp trong câu ${focusedQuestion.questionNumber} (Part ${focusedQuestion.partNumber}) và mẹo làm nhanh dạng bài này.`
                        )
                      }
                      className="ai-context-chip inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors disabled:opacity-50"
                    >
                      <Lightbulb size={11} className="text-amber-600" />
                      <span>Mẹo tránh bẫy</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        sendMessage(
                          'Hãy phân tích tổng quan kết quả bài thi này của tôi, chỉ ra Part nào tôi đang làm tốt, Part nào yếu nhất và gợi ý chiến lược cải thiện.'
                        )
                      }
                      className="ai-context-chip inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-[#1D4ED8] transition-colors disabled:opacity-50"
                    >
                      <Sparkles size={11} />
                      <span>Phân tích điểm mạnh & yếu</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        sendMessage('Tóm tắt các dạng câu hỏi tôi làm sai nhiều nhất trong bài thi này và cách khắc phục.')
                      }
                      className="ai-context-chip inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-slate-700 transition-colors disabled:opacity-50"
                    >
                      <Lightbulb size={11} className="text-amber-600" />
                      <span>Tổng hợp lỗi sai cần tránh</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Conversation Messages List */}
          <div className="ai-assistant-body flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const followUps = Array.isArray(msg.suggestedFollowUps) ? msg.suggestedFollowUps : [];
              const hasTopicCards = followUps.some((item) => item && typeof item === 'object');
              return (
                <div key={msg.id} className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Meta Row */}
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5 px-0.5 text-[11px] font-semibold text-slate-700">
                    {isUser ? (
                      <>
                        {msg.questionBadge && (
                          <span className="ai-meta-pill rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#1D4ED8] tabular-nums">
                            {msg.questionBadge}
                          </span>
                        )}
                        {msg.viaVoiceAudio && (
                          <span className="ai-meta-pill inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                            <Mic size={11} className="text-[#1D4ED8]" />
                            <span>Giọng nói</span>
                          </span>
                        )}
                        <span className="ai-sender-badge rounded-full px-2.5 py-0.5 text-slate-700">Bạn</span>
                      </>
                    ) : (
                      <>
                        <div className="ai-sender-nuna inline-flex items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-1">
                          <img
                            src={msg.id === 'welcome' ? TOBY_IMAGES.cheering : TOBY_IMAGES.studying}
                            alt="Nuna"
                            className="h-5 w-5 rounded-full bg-[#FFF7ED] object-contain p-0.5"
                          />
                          <span className="font-bold text-slate-800">Nuna</span>
                        </div>
                        {msg.referencedQuestionNumber && (
                          <span className="ai-meta-pill rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#1D4ED8] tabular-nums">
                            Câu #{msg.referencedQuestionNumber}
                          </span>
                        )}
                        {!msg.isError && (
                          <button
                            type="button"
                            onClick={() => speakMessage(msg.id, msg.content)}
                            title={speakingMsgId === msg.id ? 'Dừng đọc câu trả lời' : 'Đọc thành tiếng câu trả lời'}
                            aria-label={
                              speakingMsgId === msg.id
                                ? 'Dừng đọc câu trả lời của Nuna'
                                : 'Đọc thành tiếng câu trả lời của Nuna'
                            }
                            className={`ai-speak-btn inline-flex cursor-pointer items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold transition-all ${speakingMsgId === msg.id ? 'is-speaking' : ''}`}
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX size={11} />
                                <span>Dừng đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={11} />
                                <span>Nghe Nuna đọc</span>
                              </>
                            )}
                          </button>
                        )}
                        {!msg.isError && msg.id !== 'welcome' && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            title="Sao chép câu trả lời"
                            className="ai-copy-btn inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 transition-all sm:opacity-80 sm:group-hover:opacity-100"
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check size={11} className="text-emerald-600" />
                                <span className="text-emerald-600">Đã chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[94%] ${isUser
                      ? 'ai-msg-bubble-user px-4 py-2.5 text-[14px] leading-relaxed text-white'
                      : msg.isError
                        ? 'ai-msg-bubble-error px-4 py-3 text-sm text-red-900'
                        : 'ai-msg-bubble-assistant px-4 py-3.5 text-slate-900'
                      }`}
                  >
                    {!isUser && msg.id === 'welcome' && (
                      <div className="ai-welcome-greeting mb-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
                        <Sparkles size={12} className="shrink-0 text-[#1D4ED8]" />
                        <span>Góc học tập TOEIC cùng Nuna</span>
                      </div>
                    )}
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white">{msg.content}</p>
                    ) : (
                      <AiMarkdownMessage content={msg.content} />
                    )}
                  </div>

                  {/* Follow-up Suggestion Chips / Friendly Topic Cards */}
                  {!isUser && followUps.length > 0 && (
                    <div className="mt-3 w-full max-w-[96%]">
                      {hasTopicCards ? (
                        <div>
                          <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-600">
                            <Sparkles size={12} className="text-[#1D4ED8]" />
                            <span>Chủ đề gợi ý nhanh — chạm để hỏi ngay:</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {followUps.map((item, idx) => {
                              const label = typeof item === 'object' ? item.label : item;
                              const subtitle = typeof item === 'object' ? item.subtitle : '';
                              const promptText = typeof item === 'object' ? item.prompt : item;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  disabled={loading}
                                  onClick={() => sendMessage(promptText)}
                                  className="ai-topic-card group/card flex cursor-pointer items-start gap-2.5 p-3 text-left transition-all disabled:opacity-50"
                                >
                                  <span className="ai-topic-card-icon mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                                    {renderTopicIcon(item?.iconType)}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="ai-topic-card-title block text-[13px] leading-snug font-semibold text-slate-800">
                                      {label}
                                    </span>
                                    {subtitle && (
                                      <span className="ai-topic-card-sub mt-0.5 block truncate text-[11.5px] text-slate-500">
                                        {subtitle}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {followUps.map((followUp, idx) => {
                            const label = typeof followUp === 'object' ? followUp.label : followUp;
                            const promptText = typeof followUp === 'object' ? followUp.prompt : followUp;
                            return (
                              <button
                                key={idx}
                                type="button"
                                disabled={loading}
                                onClick={() => sendMessage(promptText)}
                                className="ai-quick-chip inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-left text-xs font-medium text-slate-700 transition-all disabled:opacity-50"
                              >
                                <ChevronRight size={13} className="shrink-0 text-[#1D4ED8]" />
                                <span>{label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <img
                  src={TOBY_IMAGES.thinking}
                  alt="Nuna đang suy nghĩ"
                  className="ai-thinking-avatar h-11 w-11 shrink-0 object-contain p-1"
                />
                <div className="ai-msg-bubble-assistant flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-slate-700">
                  <LoaderCircle size={16} className="animate-spin text-[#1D4ED8]" />
                  <span>Nuna đang suy nghĩ và phân tích câu trả lời cho bạn...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Streamlined Floating Composer Footer */}
          <form
            onSubmit={handleComposerSubmit}
            className="ai-composer-footer px-4 pt-2.5 pb-3"
          >
            {focusedQuestion && (
              <div className="mb-1.5 flex items-center justify-between px-1">
                <span className="ai-focused-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-[#1D4ED8] tabular-nums">
                  <span>🐾 Đang hỏi về Câu #{focusedQuestion.questionNumber}</span>
                  <button
                    type="button"
                    onClick={() => setFocusedQuestion(null)}
                    title="Bỏ ghim câu này để hỏi chung cả đề"
                    className="ml-0.5 inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-blue-600 hover:bg-blue-100"
                  >
                    <X size={10} />
                  </button>
                </span>
              </div>
            )}

            {voiceError && (
              <div
                role="alert"
                className="ai-voice-error-bar mb-2 flex items-start justify-between gap-2 px-3 py-2 text-xs"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-medium leading-snug">{voiceError.message}</p>
                  {voiceError.actionType === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceError(null);
                        setIsOpen(false);
                        navigate('/login');
                      }}
                      className="inline-flex cursor-pointer items-center rounded-full bg-[#1D4ED8] px-2.5 py-0.5 text-[11px] font-bold text-white hover:bg-blue-800"
                    >
                      {voiceError.actionLabel || 'Đăng nhập ngay'}
                    </button>
                  )}
                  {voiceError.actionType === 'switch-browser' && (
                    <button
                      type="button"
                      onClick={() => {
                        setVoiceMode('browser');
                        setVoiceError(null);
                      }}
                      className="inline-flex cursor-pointer items-center rounded-full border border-amber-400 bg-white px-2.5 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-50"
                    >
                      {voiceError.actionLabel || 'Chuyển sang nhận diện nhanh'}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  aria-label="Đóng thông báo micro"
                  className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-amber-800 hover:bg-amber-200/60"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {voiceState !== 'idle' && (
              <div
                role="status"
                aria-live="polite"
                className={`ai-voice-recording-bar mb-2 flex items-center justify-between gap-2.5 px-3 py-2 text-xs ${voiceState === 'listening' ? 'is-browser' : ''}`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className={`ai-voice-pulse inline-block h-2.5 w-2.5 shrink-0 rounded-full ${voiceState === 'recording' ? 'animate-pulse bg-[#DC2626]' : 'animate-pulse bg-[#1D4ED8]'}`}
                  />
                  {voiceState === 'recording' ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span className="truncate font-semibold">
                        Đang ghi âm ({formatRecordingDuration(recordingSeconds)} / {formatRecordingDuration(MAX_VOICE_RECORD_SECONDS)})
                      </span>
                      <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-red-200/80">
                        <div
                          className="h-full rounded-full bg-[#DC2626] transition-all duration-100"
                          style={{ width: `${Math.max(10, audioLevel)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="truncate font-semibold">
                      Đang lắng nghe ({voiceLang === 'en-US' ? 'Tiếng Anh' : 'Tiếng Việt'}) — bấm Dừng để gửi
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => stopVoiceInput(true)}
                  className="shrink-0 cursor-pointer rounded-full border border-current/25 bg-white/85 px-2.5 py-0.5 text-[11px] font-bold hover:bg-white"
                >
                  Hủy
                </button>
              </div>
            )}

            <div className="ai-composer-box flex items-end gap-2 px-3.5 py-2 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    handleComposerSubmit(e);
                  }
                }}
                placeholder={
                  voiceState === 'recording'
                    ? 'Đang thu âm câu hỏi của bạn (bấm Dừng hoặc Gửi để hoàn tất)...'
                    : voiceState === 'listening'
                      ? 'Đang chuyển giọng nói thành chữ (tự gửi khi ngừng nói hoặc bấm Gửi)...'
                      : focusedQuestion
                        ? `Hỏi Nuna về Câu #${focusedQuestion.questionNumber} (gõ hoặc bấm Micro)...`
                        : examResult
                          ? 'Hỏi Nuna bất kỳ câu nào (gõ hoặc bấm Micro)...'
                          : 'Nhắn hoặc bấm Micro trò chuyện với Nuna...'
                }
                disabled={loading || voiceState === 'recording'}
                className="max-h-28 min-h-[26px] flex-1 resize-none border-0 bg-transparent p-0 text-[14px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
              />

              {(voiceCapabilities.hasWebSpeech || voiceCapabilities.hasMediaRecorder) && (
                <button
                  type="button"
                  onClick={handleMicButtonClick}
                  disabled={loading}
                  aria-label={
                    voiceState !== 'idle'
                      ? 'Dừng micro và gửi câu hỏi'
                      : 'Bật micro để hỏi Nuna bằng giọng nói'
                  }
                  title={
                    voiceState !== 'idle'
                      ? 'Dừng & Gửi câu hỏi giọng nói'
                      : voiceMode === 'gemini'
                        ? 'Nhấn để ghi âm gửi AI nghe song ngữ'
                        : 'Nhấn để nói (nhận diện nhanh)'
                  }
                  className={`ai-mic-btn inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center transition-all disabled:cursor-not-allowed ${voiceState !== 'idle' ? 'is-active' : ''}`}
                >
                  {voiceState !== 'idle' ? <Square size={14} /> : <Mic size={16} />}
                </button>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  (voiceState !== 'recording' && !inputValue.trim())
                }
                aria-label="Gửi câu hỏi cho Trợ lý AI Nuna"
                className="ai-send-btn inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-white transition-all disabled:cursor-not-allowed"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 px-0.5 text-[11px] text-slate-600">
              <div className="flex flex-wrap items-center gap-1.5">
                {(voiceCapabilities.hasWebSpeech || voiceCapabilities.hasMediaRecorder) && (
                  <div className="ai-voice-mode-group inline-flex items-center p-0.5">
                    {voiceCapabilities.hasWebSpeech && (
                      <button
                        type="button"
                        disabled={voiceState !== 'idle'}
                        onClick={() => handleSwitchVoiceMode('browser')}
                        title="Chế độ nhận diện giọng nói nhanh trực tiếp trên trình duyệt"
                        className={`ai-voice-segment-btn cursor-pointer transition-all disabled:opacity-50 ${voiceMode === 'browser' ? 'is-active' : ''}`}
                      >
                        Nói nhanh
                      </button>
                    )}

                    {voiceCapabilities.hasMediaRecorder && (
                      <button
                        type="button"
                        disabled={voiceState !== 'idle'}
                        onClick={() => handleSwitchVoiceMode('gemini')}
                        title={
                          isAuthenticated
                            ? 'Chế độ ghi âm gửi trực tiếp cho Nuna AI nghe hiểu song ngữ Việt–Anh'
                            : 'Cần đăng nhập để dùng chế độ ghi âm gửi AI'
                        }
                        className={`ai-voice-segment-btn cursor-pointer transition-all disabled:opacity-50 ${voiceMode === 'gemini' ? 'is-active' : ''}`}
                      >
                        AI Song ngữ{!isAuthenticated ? ' · Đăng nhập' : ''}
                      </button>
                    )}
                  </div>
                )}

                {(voiceCapabilities.hasWebSpeech || voiceCapabilities.hasMediaRecorder) && (
                  <button
                    type="button"
                    disabled={voiceState !== 'idle'}
                    onClick={() => setVoiceLang((prev) => (prev === 'vi-VN' ? 'en-US' : 'vi-VN'))}
                    title="Chuyển ngôn ngữ ưu tiên khi nói (Tiếng Việt / Tiếng Anh)"
                    className="ai-voice-toolbar-btn cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {voiceLang === 'en-US' ? '🇬🇧 English' : '🇻🇳 Tiếng Việt'}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleToggleAutoSpeak}
                title="Tự động đọc thành tiếng câu trả lời khi hỏi bằng micro"
                className={`ai-voice-toolbar-btn inline-flex cursor-pointer items-center gap-1 transition-colors ${autoSpeakOnVoice ? 'is-active' : ''}`}
              >
                {autoSpeakOnVoice ? <Volume2 size={11} /> : <VolumeX size={11} />}
                <span>{autoSpeakOnVoice ? 'Tự đọc' : 'Tắt đọc'}</span>
              </button>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};

export default AiAssistantWidget;
