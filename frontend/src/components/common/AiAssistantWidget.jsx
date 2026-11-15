import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { TOBY_IMAGES, TobyAvatar } from './TobyMascot';
import nunaBgImage from '../../assets/img/mascot/anh_cho_ban_sung.jpg';

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
    label: 'Lớp học, Xem trước PDF & Mời Gmail',
    prompt: 'Hệ thống Lớp học trực tuyến, tính năng Xem trước PDF trực tiếp và Mời học viên qua Gmail hoạt động như thế nào?',
  },
  {
    label: 'Đề thi VIP, Đăng ký GV & PayOS',
    prompt: 'Đề thi VIP trên hệ thống có quyền lợi gì, cách mua đề VIP hoặc đăng ký Giáo viên qua PayOS như thế nào?',
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
        'Chào bạn, mình là **Nuna** — trợ lý luyện thi TOEIC của bạn.\n\nBạn có thể hỏi mình về từng câu hỏi (#1–#200), từ vựng, ngữ pháp hoặc cách dùng các tính năng trên trang web.',
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
          ? `Gâu gâu! Nuna đang kết nối với bài làm **${examResult.testTitle || 'Đề thi TOEIC'}** của bạn rồi! 🐾\nBạn có thể chọn bất kỳ câu hỏi nào từ **#1 – #${resultQuestions.length}** hoặc bấm các gợi ý bên dưới để Nuna giải thích chi tiết nhé!`
          : 'Nuna đã làm mới cuộc trò chuyện rồi! 🐾 Bạn muốn hỏi Nuna về câu hỏi TOEIC hay cách sử dụng tính năng nào trên trang web?',
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
            backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(248, 250, 252, 0.36) 55%, rgba(255, 255, 255, 0.48) 100%), url(${nunaBgImage})`,
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
            <div className="flex min-w-0 items-center gap-2.5">
              <TobyAvatar
                mood={headerTobyMood}
                size="md"
                showOnlineDot
                className="ai-header-avatar bg-[#FFFDF9]"
              />
              <div className="min-w-0">
                <div className="ai-assistant-title truncate text-[15px] font-bold tracking-tight text-slate-900">
                  Trợ lý Nuna
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-600">
                  {examResult
                    ? `Đang xem: ${examResult.testTitle || 'Bài thi TOEIC'}`
                    : 'Giải đáp TOEIC & hướng dẫn trang web'}
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
          <div className="ai-assistant-body flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Meta Row */}
                  <div className="mb-1 flex items-center gap-1.5 px-1 text-[11px] font-semibold text-slate-700">
                    {isUser ? (
                      <>
                        {msg.questionBadge && (
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8] tabular-nums">
                            {msg.questionBadge}
                          </span>
                        )}
                        <span className="rounded bg-white/75 px-1.5 py-0.5 text-slate-700">Bạn</span>
                      </>
                    ) : (
                      <>
                        <span className="rounded bg-white/75 px-1.5 py-0.5 font-bold text-slate-800">Nuna</span>
                        {msg.referencedQuestionNumber && (
                          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8] tabular-nums">
                            Câu #{msg.referencedQuestionNumber}
                          </span>
                        )}
                        {!msg.isError && msg.id !== 'welcome' && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            title="Sao chép câu trả lời"
                            className="ai-copy-btn ml-1 inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-500 opacity-0 transition-all group-hover:opacity-100"
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
                    className={`max-w-[92%] ${isUser
                      ? 'ai-msg-bubble-user px-4 py-2.5 text-[14px] leading-relaxed text-white'
                      : msg.isError
                        ? 'ai-msg-bubble-error px-4 py-3 text-sm text-red-900'
                        : 'ai-msg-bubble-assistant px-4 py-3.5 text-slate-900'
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
                    <div className="mt-2.5 flex max-w-[96%] flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((followUp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={loading}
                          onClick={() => sendMessage(followUp)}
                          className="ai-quick-chip inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-1.5 text-left text-xs font-semibold text-slate-700 transition-all disabled:opacity-50"
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
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(inputValue);
            }}
            className="ai-composer-footer px-4 pt-2 pb-3.5"
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

            <div className="ai-composer-box flex items-end gap-2.5 px-4 py-2.5 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
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
                    ? `Hỏi Nuna về Câu #${focusedQuestion.questionNumber} (hoặc gõ "câu 15")...`
                    : examResult
                      ? 'Hỏi Nuna bất kỳ câu nào (VD: "Giải thích câu 8", "Part 5")...'
                      : 'Nhắn cho Nuna bất kỳ điều gì về TOEIC hoặc trang web...'
                }
                disabled={loading}
                className="max-h-28 min-h-[26px] flex-1 resize-none border-0 bg-transparent p-0 text-[14px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading || !inputValue.trim()}
                aria-label="Gửi câu hỏi cho Trợ lý AI Nuna"
                className="ai-send-btn inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-white transition-all disabled:cursor-not-allowed"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between px-1.5 text-[11px] text-slate-600">
              <span>Enter để gửi · Shift + Enter xuống dòng</span>
            </div>
          </form>
        </aside>
      )}
    </>
  );
};

export default AiAssistantWidget;
