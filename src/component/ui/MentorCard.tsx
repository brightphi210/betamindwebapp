import React from "react";
import { FiMessageSquare, FiStar } from "react-icons/fi";
import Button from "./Button";

export interface MentorCardProps {
  name: string;
  role: string;
  company: string;
  rating?: number;
  avatar?: string;
  tags?: string[];
  onBook?: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({
  name,
  role,
  company,
  rating = 5.0,
  avatar,
  tags = [],
  onBook,
}) => {
  return (
    <div className="bg-surface border border-[rgba(255,255,255,0.05)] rounded-2xl p-5 transition-all duration-300 hover:border-[rgba(255,255,255,0.15)] flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-text-secondary text-xl font-bold">
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-text-primary font-bold text-lg">{name}</h3>
            <p className="text-text-secondary text-sm">
              {role} @ <span className="text-primary">{company}</span>
            </p>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded-lg flex items-center gap-1">
          <FiStar className="w-3 h-3 text-[#FFC107] fill-[#FFC107]" />
          <span className="text-xs text-white font-medium">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] text-xs px-2.5 py-1 rounded-md"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] text-xs px-2.5 py-1 rounded-md">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-3">
        <Button onClick={onBook} fullWidth variant="primary" className="py-2.5">
          Book Session
        </Button>
        <button className="w-11 h-11 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.15)] text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-colors flex-shrink-0">
          <FiMessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MentorCard;
