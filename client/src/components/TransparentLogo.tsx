import React, { useEffect, useRef } from 'react';

interface TransparentLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({ size = 48, className, style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png';
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const width = img.naturalWidth || size * 2;
      const height = img.naturalHeight || size * 2;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      // Loop pixels and convert white/near-white pixels to transparent & recolor artwork
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is near-white (threshold > 200), strip background
        if (r > 200 && g > 200 && b > 200) {
          data[i + 3] = 0; // Set Alpha to transparent
        } else {
          // Recolor artwork pixels to vibrant, crisp electric cyan & white
          // Boost dark artwork to crisp, clean bright Cyan (#38BDF8 / #06B6D4)
          data[i] = Math.min(255, Math.max(56, Math.floor(r * 1.5)));
          data[i + 1] = Math.min(255, Math.max(189, Math.floor(g * 1.5)));
          data[i + 2] = Math.min(255, Math.max(248, Math.floor(b * 1.5)));
        }
      }

      ctx.putImageData(imgData, 0, 0);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4))',
        transition: 'transform 0.2s ease',
        ...style,
      }}
    />
  );
};
