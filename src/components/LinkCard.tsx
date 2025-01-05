import React from 'react';
import { X } from 'lucide-react';
import { detectLinkInfo } from '../lib/linkDetector';

interface LinkCardProps {
  url: string;
  title: string;
  onDelete?: () => void;
  isEditing: boolean;
  theme?: {
    primary: string;
    secondary: string;
  };
}

export const LinkCard: React.FC<LinkCardProps> = ({
  url,
  title,
  onDelete,
  isEditing,
  theme
}) => {
  const linkInfo = detectLinkInfo(url);
  const Icon = linkInfo.icon;

  return (
    <a
      href={isEditing ? undefined : url}
      target={isEditing ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      style={{ borderLeft: theme ? `4px solid ${theme.primary}` : undefined }}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${linkInfo.color}`} />
        <span className="flex-1 font-medium">
          {title || linkInfo.name}
        </span>
        {isEditing && onDelete && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            className="p-1 rounded-full hover:bg-red-100 text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </a>
  );
};