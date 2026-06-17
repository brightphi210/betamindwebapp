import React from 'react';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import Button from './Button';

export interface EventCardProps {
  title: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  isVirtual?: boolean;
  onJoin?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  title, 
  date, 
  time, 
  location, 
  image, 
  isVirtual, 
  onJoin 
}) => {
  return (
    <div className="bg-[var(--color-surface)] border border-[rgba(255,255,255,0.05)] rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-[rgba(255,255,255,0.15)] group">
      {/* Image Header */}
      <div className="h-40 w-full bg-[#111] relative overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a3a1a] to-[var(--color-background)] flex items-center justify-center opacity-80 group-hover:scale-105 transition-transform duration-500">
             <FiCalendar className="w-8 h-8 text-[var(--color-primary)] opacity-50" />
          </div>
        )}
        {isVirtual && (
          <div className="absolute top-3 left-3 bg-[var(--color-background)]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] text-xs text-[var(--color-primary)] font-medium">
            Virtual
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-[var(--color-text-primary)] font-bold text-lg mb-4 line-clamp-2">{title}</h3>
        
        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <FiCalendar className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <FiClock className="w-4 h-4 text-[var(--color-primary)]" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <FiMapPin className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <Button fullWidth onClick={onJoin} variant="outline" className="hover:bg-[var(--color-primary)] hover:text-black hover:border-[var(--color-primary)]">
            Register Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
