import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PageNavigationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  return (
    <>
      {/* Left navigation area */}
      <div
        className="fixed left-0 top-0 w-16 h-full cursor-pointer"
        onMouseEnter={() => setShowLeft(true)}
        onMouseLeave={() => setShowLeft(false)}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
      >
        {showLeft && currentPage > 1 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2B2B2B] opacity-30 hover:opacity-60">
            <FiChevronLeft size={24} />
          </div>
        )}
      </div>

      {/* Right navigation area */}
      <div
        className="fixed right-0 top-0 w-16 h-full cursor-pointer"
        onMouseEnter={() => setShowRight(true)}
        onMouseLeave={() => setShowRight(false)}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
      >
        {showRight && currentPage < totalPages && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2B2B2B] opacity-30 hover:opacity-60">
            <FiChevronRight size={24} />
          </div>
        )}
      </div>

      {/* Page number indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-sm text-[#2B2B2B] opacity-60">
        {currentPage} of {totalPages}
      </div>
    </>
  );
};

export default PageNavigation; 