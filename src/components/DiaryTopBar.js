'use client';

import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

/**
 * Fixed topbar for diary entry modal
 * Displays date and close button, stays visible during scroll
 */
export default function DiaryTopBar({ date, onClose }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="sticky top-0 z-50 bg-[#FFFBF0] border-b-2 border-[#E07A5F]/30 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif text-[#8B7355]"
            style={{fontFamily: "var(--font-quicksand"}}>
          {formatDate(date)}
        </h2>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-[#E07A5F]/10"
        >
          <XIcon className="h-5 w-5 text-[#8B7355]" />
        </Button>
      </div>
    </div>
  );
}
