/**
 * Helper utilities for Nuna AI hybrid voice commands (Web Speech API + MediaRecorder)
 * and Text-to-Speech (SpeechSynthesis) playback.
 */

export const MAX_VOICE_RECORD_SECONDS = 45;
export const MAX_VOICE_AUDIO_BYTES = 4 * 1024 * 1024; // Must match backend 4 MiB limit

const VIETNAMESE_CHAR_REGEX =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function getVoiceCapabilities() {
  const hasWebSpeech = Boolean(getSpeechRecognitionConstructor());
  const hasMediaRecorder = Boolean(
    typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
  );
  const hasTts = Boolean(
    typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined'
  );

  return { hasWebSpeech, hasMediaRecorder, hasTts };
}

export function pickSupportedRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') {
    return { mimeType: '', fileExt: 'webm' };
  }
  const candidates = [
    { mimeType: 'audio/webm;codecs=opus', fileExt: 'webm' },
    { mimeType: 'audio/webm', fileExt: 'webm' },
    { mimeType: 'audio/ogg;codecs=opus', fileExt: 'ogg' },
    { mimeType: 'audio/ogg', fileExt: 'ogg' },
    { mimeType: 'audio/mp4', fileExt: 'm4a' },
  ];

  if (typeof MediaRecorder.isTypeSupported !== 'function') {
    return { mimeType: '', fileExt: 'webm' };
  }

  for (const item of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(item.mimeType)) {
        return item;
      }
    } catch {
      // Try next supported MIME type
    }
  }
  return { mimeType: '', fileExt: 'webm' };
}

export function formatRecordingDuration(totalSeconds) {
  const safeSec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const mins = String(Math.floor(safeSec / 60)).padStart(2, '0');
  const secs = String(safeSec % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export function sanitizeMarkdownForSpeech(rawText) {
  if (!rawText) return '';
  const cleanedLines = String(rawText)
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ')
    .split('\n')
    .map((line) => {
      let s = line.trim();
      if (!s || /^([-*_])\1{2,}$/.test(s)) return '';
      s = s.replace(/^#{1,6}\s+/, '');
      s = s.replace(/^>\s*/, '');
      s = s.replace(/^[-+*]\s+/, '');
      s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
      s = s.replace(/\*([^*\n]+)\*/g, '$1');
      s = s.replace(/`([^`]+)`/g, '$1');
      s = s.replace(/\s+/g, ' ').trim();
      if (!s) return '';
      if (!/[.!?:;]$/.test(s)) {
        s += '.';
      }
      return s;
    })
    .filter(Boolean);

  return cleanedLines.join(' ').replace(/\s+/g, ' ').trim();
}

export function detectSpeechLocale(text, preferredLocale = 'vi-VN') {
  const sample = String(text || '').trim();
  if (!sample) return preferredLocale;
  if (VIETNAMESE_CHAR_REGEX.test(sample)) {
    return 'vi-VN';
  }
  if (preferredLocale.toLowerCase().startsWith('en') || /[a-z]{3,}/i.test(sample)) {
    return 'en-US';
  }
  return preferredLocale;
}

export function selectSpeechVoice(voices, targetLocale) {
  if (!Array.isArray(voices) || voices.length === 0) return null;
  const targetLower = String(targetLocale || 'vi-VN').toLowerCase();
  const baseLang = targetLower.split('-')[0];

  const exactMatches = voices.filter(
    (v) => String(v.lang || '').toLowerCase() === targetLower
  );
  if (exactMatches.length > 0) {
    return (
      exactMatches.find((v) => /natural|google|microsoft/i.test(v.name || '')) ||
      exactMatches[0]
    );
  }

  const baseMatches = voices.filter((v) =>
    String(v.lang || '')
      .toLowerCase()
      .startsWith(baseLang)
  );
  if (baseMatches.length > 0) {
    return (
      baseMatches.find((v) => /natural|google|microsoft/i.test(v.name || '')) ||
      baseMatches[0]
    );
  }

  return null;
}

export function splitTextIntoSpeechChunks(text, maxChunkLength = 220) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  if (normalized.length <= maxChunkLength) return [normalized];

  const sentences = normalized.match(/[^.!?]+[.!?]*/g) || [normalized];
  const chunks = [];
  let buffer = '';

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;
    if (!buffer) {
      if (sentence.length <= maxChunkLength) {
        buffer = sentence;
      } else {
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const w of words) {
          if (wordChunk && wordChunk.length + 1 + w.length > maxChunkLength) {
            chunks.push(wordChunk);
            wordChunk = w;
          } else {
            wordChunk = wordChunk ? `${wordChunk} ${w}` : w;
          }
        }
        if (wordChunk) buffer = wordChunk;
      }
      continue;
    }

    if (buffer.length + 1 + sentence.length <= maxChunkLength) {
      buffer = `${buffer} ${sentence}`;
    } else {
      chunks.push(buffer);
      buffer = sentence.length <= maxChunkLength ? sentence : '';
      if (!buffer) {
        const words = sentence.split(' ');
        let wordChunk = '';
        for (const w of words) {
          if (wordChunk && wordChunk.length + 1 + w.length > maxChunkLength) {
            chunks.push(wordChunk);
            wordChunk = w;
          } else {
            wordChunk = wordChunk ? `${wordChunk} ${w}` : w;
          }
        }
        if (wordChunk) buffer = wordChunk;
      }
    }
  }
  if (buffer) {
    chunks.push(buffer);
  }
  return chunks;
}

export function buildHistoryPayload(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
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
}

export function normalizeSpokenVietnameseNumbers(rawText) {
  if (!rawText) return '';
  let normalized = String(rawText).replace(/\b(câu|cau)\s+số\b/giu, 'câu');
  const pairs = [
    ['hai trăm', '200'],
    ['một trăm', '100'],
    ['chín mươi', '90'],
    ['tám mươi', '80'],
    ['bảy mươi', '70'],
    ['sáu mươi', '60'],
    ['năm mươi', '50'],
    ['bốn mươi', '40'],
    ['ba mươi', '30'],
    ['hai mươi', '20'],
    ['mười chín', '19'],
    ['mười tám', '18'],
    ['mười bảy', '17'],
    ['mười sáu', '16'],
    ['mười lăm', '15'],
    ['mười bốn', '14'],
    ['mười ba', '13'],
    ['mười hai', '12'],
    ['mười một', '11'],
    ['mười', '10'],
    ['chín', '9'],
    ['tám', '8'],
    ['bảy', '7'],
    ['sáu', '6'],
    ['năm', '5'],
    ['bốn', '4'],
    ['tư', '4'],
    ['ba', '3'],
    ['hai', '2'],
    ['một', '1'],
  ];

  for (const [word, digit] of pairs) {
    const regex = new RegExp(`\\b(câu|cau|part|phần)\\s+${word}\\b`, 'giu');
    normalized = normalized.replace(regex, `$1 ${digit}`);
  }
  return normalized;
}

function encodeMonoPcm16Wav(samples, sampleRate) {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeAscii = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeAscii(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format = 1
  view.setUint16(22, 1, true); // Mono = 1 channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // 16-bit
  writeAscii(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(
      offset,
      clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff,
      true
    );
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Converts a browser-recorded audio Blob (e.g. audio/webm) into a 16kHz mono 16-bit PCM WAV Blob
 * for universal compatibility with both Google Cloud Vertex AI and Google AI Studio.
 */
export async function convertAudioBlobToWav(audioBlob, fallbackExt = 'webm') {
  if (!audioBlob || typeof window === 'undefined') {
    return { blob: audioBlob, fileExt: fallbackExt };
  }
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return { blob: audioBlob, fileExt: fallbackExt };
  }

  let audioCtx = null;
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    audioCtx = new AudioCtx();
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const targetSampleRate = 16000;

    let monoSamples = null;
    if (typeof OfflineAudioContext !== 'undefined') {
      const targetLength = Math.max(
        1,
        Math.ceil(decodedBuffer.duration * targetSampleRate)
      );
      const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);
      const source = offlineCtx.createBufferSource();
      source.buffer = decodedBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);
      const renderedBuffer = await offlineCtx.startRendering();
      monoSamples = renderedBuffer.getChannelData(0);
    } else {
      monoSamples = decodedBuffer.getChannelData(0);
    }

    const wavBlob = encodeMonoPcm16Wav(
      monoSamples,
      typeof OfflineAudioContext !== 'undefined'
        ? targetSampleRate
        : decodedBuffer.sampleRate
    );
    if (wavBlob.size > 64 && wavBlob.size <= MAX_VOICE_AUDIO_BYTES) {
      return { blob: wavBlob, fileExt: 'wav' };
    }
  } catch {
    // Fall back to original recorded blob if decoding is unsupported
  } finally {
    if (audioCtx) {
      try {
        await audioCtx.close();
      } catch {
        // Ignore close error
      }
    }
  }

  return { blob: audioBlob, fileExt: fallbackExt };
}
