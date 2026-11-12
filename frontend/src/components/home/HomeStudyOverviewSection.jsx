import React from 'react';

const overviewRows = [
  {
    group: 'Listening',
    content: 'Part 1: Mô tả ảnh, Part 2: Hỏi đáp, Part 3: Hội thoại, Part 4: Bài nói',
    scope: '100 câu - 45 phút',
  },
  {
    group: 'Reading',
    content: 'Part 5: Ngữ pháp và từ vựng, Part 6: Hoàn thành văn bản, Part 7: Đọc hiểu',
    scope: '100 câu - 75 phút',
  },
];

const HomeStudyOverviewSection = () => (
  <section className="section-padding home-study-overview" aria-labelledby="home-study-title">
    <div className="container">
      <header className="home-study-heading">
        <div>
          <span className="section-subtitle">CẤU TRÚC BÀI THI TOEIC</span>
        </div>
      </header>

      <div className="home-study-table-scroll" role="region" aria-label="Tổng quan cấu trúc bài thi và quy trình ôn tập" tabIndex="0">
        <table className="home-study-table">
          <caption className="sr-only">Tổng quan Listening, Reading và quy trình ôn tập TOEIC</caption>
          <thead>
            <tr>
              <th scope="col">PHẦN THI</th>
              <th scope="col">NỘI DUNG THI</th>
              <th scope="col">SỐ LƯỢNG CÂU - THỜI GIAN</th>
              <th scope="col"><span className="src-only"></span></th>
            </tr>
          </thead>
          <tbody>
            {overviewRows.map((row) => (
              <tr key={row.group}>
                <th scope="row"><span>{row.group}</span></th>
                <td>{row.content}</td>
                <td>{row.scope}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default HomeStudyOverviewSection;
