import React from 'react';
import { Users, FileQuestion, Award, CheckCircle } from 'lucide-react';

const StatsCounter = () => {
  const stats = [
    {
      icon: <Users size={32} color="#ffffff" />,
      value: '2,500+',
      label: 'Học viên đã tham gia',
    },
    {
      icon: <FileQuestion size={32} color="#ffffff" />,
      value: '5,000+',
      label: 'Câu hỏi luyện tập chọn lọc',
    },
    {
      icon: <Award size={32} color="#ffffff" />,
      value: '95%',
      label: 'Đạt chuẩn đầu ra Đại học',
    },
    {
      icon: <CheckCircle size={32} color="#ffffff" />,
      value: '100%',
      label: 'Bám sát ngân hàng đề ETS',
    },
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((item, idx) => (
            <div key={idx} className="stat-box">
              <div className="stat-icon-wrap">{item.icon}</div>
              <div className="stat-number">{item.value}</div>
              <div className="stat-title">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
