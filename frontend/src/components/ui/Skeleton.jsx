import React from 'react';
// Skeleton not spinner (per ux-standards "Performance")
export default function Skeleton({ className = '', count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`shimmer rounded h-4 mb-2 ${className}`} />
  ));
}
