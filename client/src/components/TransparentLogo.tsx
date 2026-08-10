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

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCtx.drawImage(img, 0, 0);
      const rawData = tempCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
      const pixels = rawData.data;

      // Find bounding box of non-transparent logo artwork pixels
      let minX = img.naturalWidth, minY = img.naturalHeight, maxX = 0, maxY = 0;
      let found = false;

      for (let y = 0; y < img.naturalHeight; y++) {
        for (let x = 0; x < img.naturalWidth; x++) {
          const idx = (y * img.naturalWidth + x) * 4;
          const a = pixels[idx + 3];

          if (a > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            found = true;
          }
        }
      }

      if (!found) {
        minX = 0;
        minY = 0;
        maxX = img.naturalWidth - 1;
        maxY = img.naturalHeight - 1;
      }

      // Add small padding around bounding box
      const pad = 6;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(img.naturalWidth - 1, maxX + pad);
      maxY = Math.min(img.naturalHeight - 1, maxY + pad);

      const cropW = maxX - minX + 1;
      const cropH = maxY - minY + 1;

      // High DPI canvas scaling
      const scale = 2;
      canvas.width = size * scale;
      canvas.height = size * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Maintain aspect ratio centered in canvas
      const aspect = cropW / cropH;
      let drawW = canvas.width;
      let drawH = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (aspect > 1) {
        drawH = canvas.width / aspect;
        drawY = (canvas.height - drawH) / 2;
      } else {
        drawW = canvas.height * aspect;
        drawX = (canvas.width - drawW) / 2;
      }

      ctx.drawImage(tempCanvas, minX, minY, cropW, cropH, drawX, drawY, drawW, drawH);

      // Enhance artwork pixels so cyan #06b6d4 is bright, sharp, and 100% visible
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 30) {
          // Boost cyan pixels to electric bright cyan #06B6D4 / #38BDF8
          data[i] = Math.min(255, Math.max(6, Math.floor(r * 1.3)));
          data[i + 1] = Math.min(255, Math.max(182, Math.floor(g * 1.2)));
          data[i + 2] = Math.min(255, Math.max(212, Math.floor(b * 1.1)));
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
        filter: 'drop-shadow(0 2px 8px rgba(6, 182, 212, 0.45))',
        transition: 'transform 0.2s ease',
        ...style,
      }}
    />
  );
};
