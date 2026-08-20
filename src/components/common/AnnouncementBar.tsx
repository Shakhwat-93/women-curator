import React from 'react';
import { AnnouncementBar as AnnouncementBarType } from '../../types';

interface AnnouncementBarProps {
  data: AnnouncementBarType | null;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ data }) => {
  if (!data || !data.is_active || !data.text) return null;

  return (
    <div
      className="relative z-50 py-2 px-4 text-center text-xs font-semibold tracking-wide transition-colors"
      style={{
        backgroundColor: data.bg_color || '#DE4F3C',
        color: data.text_color || '#FFFFFF'
      }}
    >
      <a href={data.link_url || '#order-form'} className="hover:underline flex items-center justify-center gap-1.5">
        <span>{data.text}</span>
      </a>
    </div>
  );
};
