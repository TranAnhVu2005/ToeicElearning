import React from 'react';

const stats = [
  { value: '07', label: 'Phần thi TOEIC' },
  { value: '200', label: 'Câu TOEIC Listening & Reading' },
  { value: '45′', label: 'Listening' },
  { value: '75′', label: 'Reading' },
];

const StatsCounter = () => (
  <section className="stats-section neo-facts" aria-label="Cấu trúc bài thi TOEIC">
    <div className="container neo-facts-grid">
      {stats.map((item) => (
        <div key={item.label} className="neo-fact">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default StatsCounter;
