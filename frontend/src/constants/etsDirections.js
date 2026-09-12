// HƯỚNG DẪN (DIRECTIONS) VÀ QUY CÁCH CHUẨN ETS TOEIC MỚI NHẤT (ETS 2026 FORMAT)

export const ETS_GENERAL_DIRECTIONS = {
  listening: {
    title: 'LISTENING TEST',
    duration: '45 minutes',
    questionCount: 100,
    directions:
      'In the Listening test, you will be asked to demonstrate how well you understand spoken English. The entire Listening test will last approximately 45 minutes. There are four parts, and directions are given for each part. You must mark your answers on the separate answer sheet. Do not write your answers in your test book.',
  },
  reading: {
    title: 'READING TEST',
    duration: '75 minutes',
    questionCount: 100,
    directions:
      'In the Reading test, you will read a variety of texts and answer several different types of reading comprehension questions. The entire Reading test will last 75 minutes. There are three parts, and directions are given for each part. You must mark your answers on the separate answer sheet. Do not write your answers in your test book.',
  },
};

export const ETS_PART_DIRECTIONS = {
  1: {
    partNumber: 1,
    skill: 'listening',
    name: 'Part 1: Photographs (Mô tả hình ảnh)',
    questionRange: 'Câu 1 - 6 (6 câu)',
    audioFormatNote: 'Mỗi câu hỏi có 1 FILE NGHE AUDIO RIÊNG LẺ và 1 HÌNH ẢNH TRANH MÔ TẢ.',
    directions:
      'Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture. Then find the number of the question on your answer sheet and mark your answer. The statements will not be printed in your test book and will be spoken only one time.',
    sampleStatement:
      'Statement (C), "They\'re sitting at a table," is the best description of the picture, so you should select answer (C) and mark it on your answer sheet.',
    sampleImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
  },
  2: {
    partNumber: 2,
    skill: 'listening',
    name: 'Part 2: Question - Response (Hỏi & Đáp)',
    questionRange: 'Câu 7 - 31 (25 câu)',
    audioFormatNote: 'Mỗi câu hỏi có 1 FILE NGHE AUDIO RIÊNG LẺ. ĐẶC BIỆT: Chỉ có 3 lựa chọn A, B, C (Không có D).',
    directions:
      'Directions: You will hear a question or statement and three responses spoken in English. They will not be printed in your test book and will be spoken only one time. Select the best response to the question or statement and mark the letter (A), (B), or (C) on your answer sheet.',
    sampleStatement:
      'You will hear: Where is the meeting room? - You will also hear: (A) To meet the new director. (B) It\'s the first room on the right. (C) Yes, at two o\'clock. The best response is choice (B).',
  },
  3: {
    partNumber: 3,
    skill: 'listening',
    name: 'Part 3: Short Conversations (Đoạn hội thoại ngắn)',
    questionRange: 'Câu 32 - 70 (39 câu, 13 đoạn)',
    audioFormatNote: 'Mỗi bài gồm 1 FILE NGHE AUDIO CHUNG DÍNH LIỀN VỚI 3 CÂU HỎI. Có thể kèm hình ảnh biểu đồ/sơ đồ.',
    directions:
      'Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The conversations will not be printed in your test book and will be spoken only one time.',
  },
  4: {
    partNumber: 4,
    skill: 'listening',
    name: 'Part 4: Short Talks (Bài nói ngắn / Độc thoại)',
    questionRange: 'Câu 71 - 100 (30 câu, 10 bài)',
    audioFormatNote: 'Mỗi bài gồm 1 FILE NGHE AUDIO CHUNG DÍNH LIỀN VỚI 3 CÂU HỎI. Có thể kèm bảng biểu/lịch trình.',
    directions:
      'Directions: You will hear some talks given by a single speaker. You will be asked to answer three questions about what the speaker says in each talk. Select the best response to each question and mark the letter (A), (B), (C), or (D) on your answer sheet. The talks will not be printed in your test book and will be spoken only one time.',
  },
  5: {
    partNumber: 5,
    skill: 'reading',
    name: 'Part 5: Incomplete Sentences (Hoàn chỉnh câu)',
    questionRange: 'Câu 101 - 130 (30 câu)',
    audioFormatNote: '30 câu hỏi ngữ pháp và từ vựng độc lập, mỗi câu có 4 phương án lựa chọn A, B, C, D.',
    directions:
      'Directions: A word or phrase is missing in each of the following sentences. Four answer choices are given below each sentence. Select the best answer to complete the sentence. Then mark the letter (A), (B), (C), or (D) on your answer sheet.',
  },
  6: {
    partNumber: 6,
    skill: 'reading',
    name: 'Part 6: Text Completion (Hoàn chỉnh đoạn văn)',
    questionRange: 'Câu 131 - 146 (16 câu, 4 đoạn)',
    audioFormatNote: 'Mỗi bài đọc gồm 1 ĐOẠN VĂN CHUNG KÈM 4 CHỖ TRỐNG TƯƠNG ỨNG 4 CÂU HỎI.',
    directions:
      'Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below the text. Select the best answer to complete the text. Then mark the letter (A), (B), (C), or (D) on your answer sheet.',
  },
  7: {
    partNumber: 7,
    skill: 'reading',
    name: 'Part 7: Reading Comprehension (Đọc hiểu văn bản)',
    questionRange: 'Câu 147 - 200 (54 câu: 10 bài đơn 29 câu + 5 nhóm bài đôi/ba 25 câu)',
    audioFormatNote: 'Mỗi bài gồm ĐOẠN VĂN ĐỌC HIỂU (thông báo, email, bài báo...) kèm nhóm 2 - 5 câu hỏi trắc nghiệm.',
    directions:
      'Directions: In this part you will read a selection of texts, such as magazine and newspaper articles, e-mails, and instant messages. Each text or set of texts is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D) on your answer sheet.',
  },
};
