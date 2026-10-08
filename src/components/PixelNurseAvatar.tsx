import React, { useEffect, useRef } from 'react';
import { drawPixelNurse, NurseId } from '../utils/pixelArt';

interface PixelNurseAvatarProps {
  nurseId: NurseId;
  goldenSkin?: boolean;
  scale?: number;
  animate?: boolean;
  className?: string;
}

export const PixelNurseAvatar: React.FC<PixelNurseAvatarProps> = ({
  nurseId,
  goldenSkin = false,
  scale = 3,
  animate = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const w = 18 * scale;
  const h = 24 * scale;

  useEffect(() => {
    let animId: number;
    let tick = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      drawPixelNurse(ctx, 0, 0, nurseId, 1, animate ? tick : 0, false, goldenSkin, scale);
      tick += 0.08;
      if (animate) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [nurseId, goldenSkin, scale, animate, w, h]);

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      style={{ imageRendering: 'pixelated' }}
      className={className}
    />
  );
};
