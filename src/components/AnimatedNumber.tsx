'use client';

import { useEffect, useState } from 'react';

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedNumber({ value, duration = 1200, decimals = 0, suffix = '', className = '' }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const to = value;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {display.toFixed(decimals)}{suffix}
    </span>
  );
}
