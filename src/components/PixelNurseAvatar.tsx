import React, { useEffect, useRef } from 'react';
import { SkinId } from '../data/gameData';
import { drawPixelNurse, NurseId } from '../utils/pixelArt';

interface PixelNurseAvatarProps {
  nurseId: NurseId;
  skinId?: SkinId;
  goldenSkin?: boolean;
  golden?: boolean;
  scale?: number;
  size?: number;
  animate?: boolean;
  className?: string;
}

export const PixelNurseAvatar: React.FC<PixelNurseAvatarProps> = ({
  nurseId,
  skinId,
  goldenSkin,
  golden,
  scale,
  size,
  animate = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resolvedSkin: SkinId =
    skinId || (goldenSkin || golden ? 'dourada' : 'padrao');
  const resolvedScale = scale ?? (size ? Math.max(1.5, size / 22) : 3);
  const w = Math.round(18 * resolvedScale);
  const h = Math.round(24 * resolvedScale);

  useEffect(() => {
    let animId: number;
    let tick = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      drawPixelNurse(
        ctx,
        0,
        0,
        nurseId,
        1,
        animate ? tick : 0,
        false,
        resolvedSkin,
        resolvedScale
      );
      tick += 0.08;
      if (animate) {
        animId = requestAnimationFrame(render);
      }
    };

    render();
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [nurseId, resolvedSkin, resolvedScale, animate, w, h]);

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
