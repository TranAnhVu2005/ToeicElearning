import React, { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import booksBackground from '../../assets/img/hero/background_sach.jpg';

const TOEIC_STATS = [
  { value: '07', label: 'Phần thi TOEIC' },
  { value: '200', label: 'Câu hỏi' },
  { value: '45′', label: 'Listening' },
  { value: '75′', label: 'Reading' },
];

// Giữ khoảng cách và phần đệm bằng nhau để hai nhóm nối liền tại mốc -50%.
const GROUP_SPACING = 'gap-14 pr-14 sm:gap-20 sm:pr-20 lg:gap-28 lg:pr-28';

const StatsGroup = ({ duplicate = false }) => (
  <div
    className={`gt-group flex shrink-0 items-center ${GROUP_SPACING}`}
    aria-hidden={duplicate ? 'true' : undefined}
    role="list"
  >
    {TOEIC_STATS.map(({ value, label }) => (
      <div key={label} className="gt-item relative flex items-baseline gap-3.5 whitespace-nowrap" role="listitem">
        <strong className="gt-number text-5xl font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-[length:200%_100%] [background-image:linear-gradient(120deg,#fff_10%,#8ec5ff_50%,#c9a7ff_90%)] drop-shadow-[0_0_18px_rgba(142,197,255,0.45)] sm:text-6xl lg:text-8xl">
          {value}
        </strong>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200/85 sm:text-sm lg:text-base">
          {label}
        </span>
        <i aria-hidden="true" className="gt-sep absolute top-1/2 -right-7 not-italic text-sky-300 [text-shadow:0_0_12px_#8ec5ff] text-sm sm:-right-10 sm:text-lg lg:-right-14">
          ✦
        </i>
      </div>
    ))}
  </div>
);

const StatsCounter = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section
      className={`gt-root stats-section neo-facts relative isolate overflow-hidden border-y border-sky-300/20 bg-[#05030f] py-8 sm:py-10 lg:py-14${isPaused ? ' is-paused' : ''}`}
      aria-label="Cấu trúc bài thi TOEIC"
    >
      <span
        aria-hidden="true"
        className="gt-bg absolute inset-y-0 -inset-x-[10%] -z-40 bg-cover bg-center opacity-55 brightness-90 saturate-[1.2]"
        style={{ backgroundImage: `url("${booksBackground}")` }}
      />
      <span aria-hidden="true" className="gt-overlay pointer-events-none absolute inset-0 -z-10" />
      <span aria-hidden="true" className="gt-stars gt-stars-far pointer-events-none absolute inset-0 -z-30" />
      <span aria-hidden="true" className="gt-stars gt-stars-near pointer-events-none absolute inset-0 -z-20" />
      <span aria-hidden="true" className="gt-comet pointer-events-none absolute left-0 top-[18%] -z-20 h-0.5 w-36 rounded-full" />

      <button
        type="button"
        className="gt-toggle absolute right-4 top-3 z-10 inline-flex size-11 items-center justify-center border border-sky-100/40 bg-slate-950/60 text-white transition-colors hover:border-sky-100 hover:text-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-100"
        onClick={() => setIsPaused((paused) => !paused)}
        aria-label={isPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}
        aria-pressed={isPaused}
        title={isPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}
      >
        {isPaused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
      </button>

      <div
        className="gt-viewport relative overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
        role="group"
        aria-label="Thông tin bài thi chạy ngang"
        aria-live="off"
      >
        <div className="gt-track flex w-max">
          <StatsGroup />
          <StatsGroup duplicate />
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
