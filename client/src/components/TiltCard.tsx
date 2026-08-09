import React, { useEffect, useRef } from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxRotateX?: number;
  maxRotateY?: number;
  smoothing?: number;
  glowColor?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxRotateX = 12,
  maxRotateY = 16,
  smoothing = 0.12,
  glowColor = 'rgba(79, 70, 229, 0.2)',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = 0;
    let targetY = 0;
    let rotX = 0;
    let rotY = 0;
    let rafId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

      const dist = Math.hypot(dx, dy);
      const falloff = dist <= 1 ? 1 : Math.max(0, 1 - (dist - 1) / 2);

      targetX = Math.max(-1, Math.min(1, dy)) * maxRotateX * falloff;
      targetY = -Math.max(-1, Math.min(1, dx)) * maxRotateY * falloff;

      const cursorX = ((e.clientX - rect.left) / rect.width) * 100;
      const cursorY = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${cursorX}%`);
      card.style.setProperty('--mouse-y', `${cursorY}%`);
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const animate = () => {
      rotX += (targetX - rotX) * smoothing;
      rotY += (targetY - rotY) * smoothing;

      card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

      rafId = requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [maxRotateX, maxRotateY, smoothing]);

  return (
    <div
      ref={containerRef}
      className={`tilt-card-container ${className}`}
      style={{ perspective: '1000px', height: '100%', display: 'flex', flexDirection: 'column' }}
      {...props}
    >
      <div
        ref={cardRef}
        className="tilt-card-inner"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out, box-shadow 0.3s ease',
          ['--glow-color' as any]: glowColor,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}
      >
        <div className="tilt-card-spotlight" />
        <div className="tilt-card-content" style={{ transform: 'translateZ(10px)', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
};
