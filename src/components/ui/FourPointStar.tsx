import React from 'react';
import { cn } from '../../lib/utils';

interface FourPointStarProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  fill?: string;
  size?: number | string;
  strokeWidth?: number | string;
}

export const FourPointStar = ({ className, fill = "none", size = 24, strokeWidth = 1.5, ...props }: FourPointStarProps) => {
  return (
    <svg 
      width={size}
      height={size}
      viewBox="0 0 24 24" 
      fill={fill} 
      stroke="currentColor" 
      strokeWidth={strokeWidth}
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={cn("", className)}
      {...props}
    >
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );
};
