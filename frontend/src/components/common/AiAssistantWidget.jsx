import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bot,
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
} from 'lucide-react';
import { aiService } from '../../services/aiService';

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
    prompt: 'Hướng dẫn chi tiết cách làm bài Full Test 200 câu, cơ chế tự lưu khi F5 và cách quy đổi điểm TOEIC 990 trên trang web.',
  },
  {
    label: 'Luyện nghe chép chính tả Dictation',
    prompt: 'Tính năng luyện nghe chép chính tả (Dictation) trên trang web hoạt động như thế nào và có những phím tắt gì?',
  },
  {
    label: 'Đề thi VIP & Thanh toán VNPAY',
    prompt: 'Đề thi VIP trên hệ thống có quyền lợi gì và cách mua đề VIP qua VNPAY như thế nào?',
  },
  {
    label: 'Tham gia Lớp học & Đăng ký Giáo viên',
    prompt: 'Làm sao để tham gia Lớp học bằng mã Join Code hoặc đăng ký trở thành Giáo viên trên TOEIC Learning?',
  },
];

const AiAssistantWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [focusedQuestion, setFocusedQuestion] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Xin chào! Mình là **Trợ lý AI TOEIC Learning**.\n\nMình có thể giúp bạn:\n- **Giải thích chi tiết từng câu hỏi TOEIC** (ngữ pháp, từ vựng, lời thoại Transcript, lý do chọn/loại trừ đáp án) khi bạn xem lại bài thi.\n- **Phân tích kết quả bài làm** theo từng Part và gợi ý lộ trình cải thiện điểm số.\n- **Giải đáp mọi thắc mắc về trang web** (cách làm Full Test, luyện từng Part, nghe chép chính tả Dictation, mua đề VIP, tham gia Lớp học, chuỗi ngày học Streak...).',
      suggestedFollowUps: PLATFORM_QUICK_TOPICS.map((t) => t.prompt),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hide AI assistant while taking a live exam to preserve exam integrity
  const isLiveExamRoute = /^\/courses\/[^/]+\/take/i.test(location.pathname);

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

    return null;
  }, []);

  const sendMessage = useCallback(
    async (rawPrompt, overrideContext = {}) => {
      const promptText = String(rawPrompt || '').trim();
      if (!promptText || loading) return;

      const activeResult = overrideContext.result !== undefined ? overrideContext.result : examResult;
      let activeQuestion =
        overrideContext.question !== undefined ? overrideContext.question : focusedQuestion;

      // Auto-detect question number in promptText (e.g., "câu 8", "#8", "question 15")
      if (activeResult?.questions?.length) {
        const match = promptText.match(/(?:câu|cau|question|q|#)\s*(\d{1,3})\b/i);
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

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: promptText,
        questionBadge: activeQuestion ? `Câu #${activeQuestion.questionNumber}` : null,
      };

      const historyPayload = messages
        .filter(
          (m) =>
            m.id !== 'welcome' &&
            !m.isError &&
            (m.role === 'user' || m.role === 'assistant') &&
            typeof m.content === 'string' &&
            m.content.trim().length > 0
        )
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content.slice(0, 1500),
        }));

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
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

        // If backend resolved a question number from the user's text, sync focusedQuestion
        if (data?.referencedQuestionNumber && activeResult?.questions) {
          const matchedQ = activeResult.questions.find(
            (q) => Number(q.questionNumber) === Number(data.referencedQuestionNumber)
          );
          if (matchedQ) {
            setFocusedQuestion(matchedQ);
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: replyText,
            referencedQuestionNumber: data?.referencedQuestionNumber || activeQuestion?.questionNumber || null,
            suggestedFollowUps: Array.isArray(data?.suggestedFollowUps) ? data.suggestedFollowUps : [],
          },
        ]);
      } catch (err) {
        const localFallback = buildClientFallbackReply(promptText, activeResult, activeQuestion);
        if (localFallback) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-fallback-${Date.now()}`,
              role: 'assistant',
              content: localFallback.reply,
              referencedQuestionNumber: localFallback.referencedQuestionNumber,
              suggestedFollowUps: localFallback.suggestedFollowUps,
            },
          ]);
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
    [buildClientFallbackReply, examResult, focusedQuestion, loading, location.pathname, messages, scrollToBottom]
  );

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

  // Escape key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: examResult
          ? `Mình đang kết nối với bài làm **${examResult.testTitle || 'Đề thi TOEIC'}** của bạn. Bạn có thể chọn bất kỳ câu hỏi nào từ **#1 – #${resultQuestions.length}** hoặc bấm các gợi ý bên dưới để mình giải thích chi tiết nhé!`
          : 'Đã làm mới cuộc trò chuyện. Bạn muốn hỏi mình về câu hỏi TOEIC hay cách sử dụng tính năng nào trên trang web?',
        suggestedFollowUps: examResult
          ? [
              'Phân tích điểm mạnh, điểm yếu của tôi trong bài thi này',
              'Tôi nên ưu tiên ôn tập Part nào trước để tăng điểm?',
              'Hướng dẫn cách luyện lại các câu làm sai hiệu quả',
            ]
          : PLATFORM_QUICK_TOPICS.map((t) => t.prompt),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="ai-assistant-launcher fixed right-5 bottom-5 z-40 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 120);
            }}
            className="ai-launcher-btn group flex cursor-pointer items-center gap-3 rounded-2xl border border-blue-500/30 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#1D4ED8] px-4 py-3 text-white shadow-[0_12px_30px_-6px_rgba(29,78,216,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-6px_rgba(29,78,216,0.6)]"
            aria-label="Mở Trợ lý AI TOEIC Learning"
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/25 bg-white/15 backdrop-blur-xs">
              <Sparkles size={17} className="text-blue-100 transition-transform duration-200 group-hover:scale-110" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0F172A] bg-emerald-400" />
            </span>
            <span className="pr-1 text-left">
              <span className="block text-[10px] font-bold tracking-widest text-blue-200 uppercase">
                Gemini AI Tutor
              </span>
              <span className="block text-sm font-bold leading-snug text-white">
                {examResult ? 'Trợ lý AI Giải đề' : 'Trợ lý AI TOEIC'}
              </span>
            </span>
          </button>
        </div>
      )}

      {/* Slide-over / Floating AI Assistant Panel */}
      {isOpen && (
        <aside
          aria-label="Cửa sổ Trợ lý AI TOEIC Learning"
          className={`ai-assistant-panel fixed z-50 flex flex-col overflow-hidden rounded-t-2xl border border-slate-200/90 bg-white shadow-[0_24px_60px_-12px_rgba(15,23,42,0.28)] transition-all duration-200 sm:rounded-2xl ${
            isExpanded
              ? 'inset-3 sm:inset-6 lg:left-auto lg:w-[680px]'
              : 'inset-x-0 bottom-0 h-[86vh] sm:right-5 sm:bottom-5 sm:left-auto sm:h-[660px] sm:max-h-[calc(100vh-36px)] sm:w-[448px]'
          }`}
        >
          {/* Panel Header */}
          <header className="ai-assistant-header flex items-center justify-between gap-3 border-b border-slate-800 bg-gradient-to-r from-[#0B1120] via-[#111827] to-[#1E3A8A] px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/35 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-sm">
                <Bot size={20} />
                <span
                  className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1120] bg-emerald-400"
                  title="Đang trực tuyến"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="ai-assistant-title truncate text-[15px] font-bold tracking-tight text-white">
                    Trợ lý AI TOEIC Learning
                  </div>
                  <span className="shrink-0 rounded-full border border-blue-300/35 bg-blue-500/25 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-100 uppercase">
                    AI Tutor
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-300">
                  {examResult
                    ? `Đang đồng bộ: ${examResult.testTitle || 'Bài thi TOEIC'}`
                    : 'Giải đáp kiến thức TOEIC & Hướng dẫn hệ thống'}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetConversation}
                title="Làm mới hội thoại"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/10 text-slate-200 transition-colors hover:border-white/30 hover:bg-white/20 hover:text-white"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Thu gọn khung chat' : 'Mở rộng khung chat'}
                className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/10 text-slate-200 transition-colors hover:border-white/30 hover:bg-white/20 hover:text-white sm:inline-flex"
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Đóng Trợ lý AI (Esc)"
                aria-label="Đóng Trợ lý AI"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-white/10 text-slate-200 transition-colors hover:border-red-400/60 hover:bg-red-500/25 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Sleek Exam Review Context Bar (Visible when viewing a completed exam on TestResultPage) */}
          {examResult && (
            <div className="ai-assistant-context border-b border-slate-200/90 bg-gradient-to-b from-[#EFF6FF]/90 to-[#F8FAFC] px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#1D4ED8]">
                    <BookOpen size={13} />
                  </span>
                  {focusedQuestion ? (
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-bold text-slate-900 tabular-nums">
                        Câu #{focusedQuestion.questionNumber} · Part {focusedQuestion.partNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          focusedQuestion.isCorrect
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
                  className="max-w-[165px] shrink-0 cursor-pointer rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-bold text-[#1D4ED8] shadow-2xs tabular-nums transition-colors hover:border-[#1D4ED8] focus:border-[#1D4ED8] focus:outline-none"
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
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-blue-300/80 bg-[#1D4ED8] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition-all hover:bg-[#1E40AF] disabled:opacity-50"
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
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
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
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
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
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8] shadow-2xs transition-colors hover:bg-blue-50 disabled:opacity-50"
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
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8] disabled:opacity-50"
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
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#F8FAFC] px-4 py-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Meta Row */}
                  <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold text-slate-500">
                    {isUser ? (
                      <>
                        {msg.questionBadge && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8] tabular-nums">
                            {msg.questionBadge}
                          </span>
                        )}
                        <span className="text-slate-600">Bạn</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-blue-100 text-[#1D4ED8]">
                          <Sparkles size={11} />
                        </span>
                        <span className="font-bold text-slate-800">Trợ lý AI</span>
                        {msg.referencedQuestionNumber && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8] tabular-nums">
                            Câu #{msg.referencedQuestionNumber}
                          </span>
                        )}
                        {!msg.isError && msg.id !== 'welcome' && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            title="Sao chép câu trả lời"
                            className="ml-1 inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-slate-200/70 hover:text-slate-700"
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
                    className={`max-w-[92%] ${
                      isUser
                        ? 'rounded-2xl rounded-tr-xs bg-gradient-to-br from-[#1D4ED8] to-[#1E40AF] px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-xs'
                        : msg.isError
                          ? 'rounded-2xl rounded-tl-xs border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-900'
                          : 'rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white px-4 py-3.5 text-slate-900 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.06)]'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-white">{msg.content}</p>
                    ) : (
                      <AiMarkdownMessage content={msg.content} />
                    )}
                  </div>

                  {/* Follow-up Suggestion Chips */}
                  {!isUser && Array.isArray(msg.suggestedFollowUps) && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-2.5 flex max-w-[95%] flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((followUp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={loading}
                          onClick={() => sendMessage(followUp)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-left text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#1D4ED8] hover:bg-[#EFF6FF]/80 hover:text-[#1D4ED8] disabled:opacity-50"
                        >
                          <ChevronRight size={12} className="shrink-0 text-[#1D4ED8]" />
                          <span>{followUp}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-2.5 rounded-2xl rounded-tl-xs border border-blue-200/80 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-xs">
                  <LoaderCircle size={16} className="animate-spin text-[#1D4ED8]" />
                  <span>Trợ lý AI đang phân tích và soạn câu trả lời...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Unified Modern Composer Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="border-t border-slate-200/90 bg-white p-3"
          >
            <div className="ai-composer-box flex flex-col rounded-2xl border border-slate-300/90 bg-[#F8FAFC] px-3.5 pt-2.5 pb-2 transition-all focus-within:border-[#1D4ED8] focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-500/10">
              <textarea
                ref={inputRef}
                rows={2}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputValue);
                  }
                }}
                placeholder={
                  focusedQuestion
                    ? `Hỏi bất kỳ điều gì về Câu #${focusedQuestion.questionNumber} (hoặc gõ "câu 15" để chuyển câu)...`
                    : examResult
                      ? 'Hỏi bất kỳ câu nào trong đề (VD: "Giải thích câu 8", "Phân tích Part 5")...'
                      : 'Nhập câu hỏi của bạn về TOEIC hoặc cách sử dụng trang web...'
                }
                disabled={loading}
                className="max-h-28 min-h-[42px] w-full resize-none border-0 bg-transparent p-0 text-[14px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
              />

              <div className="mt-1.5 flex items-center justify-between gap-2 border-t border-slate-200/70 pt-1.5">
                <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
                  {focusedQuestion ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-bold text-[#1D4ED8] tabular-nums">
                      Đang chọn: Câu #{focusedQuestion.questionNumber}
                      <button
                        type="button"
                        onClick={() => setFocusedQuestion(null)}
                        title="Bỏ ghim câu này để hỏi chung cả đề"
                        className="ml-0.5 cursor-pointer rounded-full p-0.5 text-blue-500 hover:bg-blue-100 hover:text-blue-800"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ) : (
                    <span className="truncate font-medium text-slate-400">
                      Nhấn <strong className="font-semibold text-slate-600">Enter</strong> để gửi ·{' '}
                      <strong className="font-semibold text-slate-600">Shift + Enter</strong> xuống dòng
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  aria-label="Gửi câu hỏi cho Trợ lý AI"
                  className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-[#1D4ED8] text-white shadow-xs transition-all hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};

export default AiAssistantWidget;
