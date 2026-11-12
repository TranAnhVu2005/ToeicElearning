import React, { useState } from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ src, alt = '', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const imageUrl = typeof src === 'string' ? src.trim() : '';

  if (!imageUrl || failed) {
    return (
      <span
        className={`${className} inline-flex shrink-0 items-center justify-center bg-[#F1F0ED] text-[#625B6D]`}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : 'true'}
      >
        <User size={18} aria-hidden="true" />
      </span>
    );
  }

  return <img src={imageUrl} alt={alt} className={className} onError={() => setFailed(true)} />;
};

export default UserAvatar;
