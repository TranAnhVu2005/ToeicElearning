import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, and current +/- 1
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="page-item"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Trang trước"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="page-item" aria-hidden="true" style={{ border: 'none', cursor: 'default' }}>
            ...
          </span>
        ) : (
          <button
            type="button"
            key={`page-${p}`}
            className={`page-item ${currentPage === p ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={currentPage === p ? 'page' : undefined}
            aria-label={`Trang ${p}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="page-item"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Trang sau"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
