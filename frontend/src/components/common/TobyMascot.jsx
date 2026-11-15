import React, { useState } from 'react';
import tobyCompletion from '../../assets/img/mascot/toby_completion.png';
import tobyEncouragement from '../../assets/img/mascot/toby_encouragement.png';
import tobyHoldingHeart from '../../assets/img/mascot/toby_holding_heart.png';
import tobyMainCheering from '../../assets/img/mascot/toby_main_cheering.png';
import tobySleeping from '../../assets/img/mascot/toby_sleeping.png';
import tobyStudyingBook from '../../assets/img/mascot/toby_studying_book.png';
import tobyThinking from '../../assets/img/mascot/toby_thinking.png';
import tobyUsingLaptop from '../../assets/img/mascot/toby_using_laptop.png';
import tobyWinningTrophy from '../../assets/img/mascot/toby_winning_trophy.png';

export const TOBY_IMAGES = {
  completion: tobyCompletion,
  encouragement: tobyEncouragement,
  heart: tobyHoldingHeart,
  cheering: tobyMainCheering,
  sleeping: tobySleeping,
  studying: tobyStudyingBook,
  thinking: tobyThinking,
  laptop: tobyUsingLaptop,
  trophy: tobyWinningTrophy,
};

export const MUC_IMAGES = TOBY_IMAGES;
export const NUNA_IMAGES = TOBY_IMAGES;

const MOOD_LABELS = {
  completion: 'Nuna khen: Hoàn thành xuất sắc!',
  encouragement: 'Nuna cổ vũ: Cố lên bạn ơi!',
  heart: 'Nuna thả tim',
  cheering: 'Cùng Nuna chinh phục TOEIC!',
  sleeping: 'Khò khò... Đánh thức Nuna dậy học nhé!',
  studying: 'Nuna đang tập trung ôn luyện',
  thinking: 'Nuna đang suy nghĩ...',
  laptop: 'Trợ lý AI Nuna trực tuyến',
  trophy: 'Cùng Nuna phá kỷ lục điểm số!',
};

/**
 * Circular / Rounded Avatar of Nuna for Chat Headers, Navbar, Message Bubbles, and Badges
 */
export const TobyAvatar = ({
  mood = 'cheering',
  size = 'md',
  className = '',
  showOnlineDot = false,
  alt = 'Chú cún Nuna — Bạn đồng hành TOEIC',
}) => {
  const src = TOBY_IMAGES[mood] || TOBY_IMAGES.cheering;
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-13 w-13',
    xl: 'h-16 w-16',
  };

  return (
    <span
      className={`toby-avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-[#FFFDF9] shadow-2xs select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      title={MOOD_LABELS[mood] || alt}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-contain p-0.5 transition-transform duration-200 hover:scale-110"
        loading="lazy"
      />
      {showOnlineDot && (
        <span
          className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
          title="Nuna đang trực tuyến"
        />
      )}
    </span>
  );
};

export const MucAvatar = TobyAvatar;
export const NunaAvatar = TobyAvatar;

/**
 * Duolingo-style Companion Banner with Nuna's expressive illustration, speech bubble, and interactive mood cycling
 */
export const TobyCompanionBanner = ({
  mood = 'cheering',
  secondaryMood = null,
  badge = 'BẠN ĐỒNG HÀNH NUNA',
  title,
  message,
  quote = null,
  primaryAction = null,
  secondaryAction = null,
  tone = 'blue',
  className = '',
}) => {
  const [activeMood, setActiveMood] = useState(mood);
  const currentImg = TOBY_IMAGES[activeMood] || TOBY_IMAGES.cheering;

  const toneStyles = {
    blue: 'border-blue-200/90 bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-white',
    emerald: 'border-emerald-200/90 bg-gradient-to-r from-emerald-50/90 via-[#F8FAFC] to-white',
    amber: 'border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-[#FFFBEB] to-white',
  };

  const handleToggleMood = () => {
    if (!secondaryMood) return;
    setActiveMood((prev) => (prev === mood ? secondaryMood : mood));
  };

  return (
    <div
      className={`toby-companion-banner relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
        toneStyles[tone] || toneStyles.blue
      } ${className}`}
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          {/* Expressive Nuna Illustration */}
          <button
            type="button"
            onClick={handleToggleMood}
            title={secondaryMood ? 'Bấm vào Nuna để đổi biểu cảm!' : MOOD_LABELS[activeMood]}
            className="toby-mascot-figure group relative flex h-24 w-28 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-blue-200/80 bg-white p-1.5 shadow-xs transition-transform duration-200 hover:-translate-y-0.5"
          >
            <img
              src={currentImg}
              alt="Chú cún Nuna đồng hành học TOEIC"
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
            />
            {secondaryMood && (
              <span className="absolute -bottom-1.5 rounded-full border border-blue-200 bg-white px-2 py-0.2 text-[10px] font-bold text-[#1D4ED8] shadow-2xs">
                Chạm vào Nuna 🐾
              </span>
            )}
          </button>

          {/* Speech Bubble Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100/80 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-[#1D4ED8] uppercase">
                🐾 {badge}
              </span>
              {quote && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                  {quote}
                </span>
              )}
            </div>

            {title && (
              <h3 className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">{title}</h3>
            )}

            {message && (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-700">{message}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(primaryAction || secondaryAction) && (
          <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 sm:flex-col sm:items-end">
            {primaryAction && (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="toby-action-primary inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#1D4ED8] bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#1E40AF]"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="toby-action-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-[#1D4ED8] hover:text-[#1D4ED8]"
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TobyCompanionBanner;
