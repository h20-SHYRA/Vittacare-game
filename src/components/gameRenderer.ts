import { BiomeType, CAMPAIGN_PHASES, NURSES, SkinId } from '../data/gameData';
import {
  drawPixelBoss,
  drawPixelClinicaVittacare,
  drawPixelEnemy,
  drawPixelNurse,
} from '../utils/pixelArt';
import {
  BossEntity,
  CheckpointFlag,
  Collectible,
  Enemy,
  FloatingText,
  LightningEffect,
  Particle,
  Platform,
  Projectile,
  QuestionBlock,
} from './gameTypes';

export interface RenderState {
  phaseNum: number;
  biome: BiomeType;
  frame: number;
  cameraX: number;
  worldWidth: number;
  playerX: number;
  playerY: number;
  playerW: number;
  playerH: number;
  playerVx: number;
  playerVy: number;
  facing: 1 | -1;
  grounded: boolean;
  hp: number;
  maxHp: number;
  score: number;
  combo: number;
  collectedCount: number;
  requiredItems: number;
  activeNurseIdx: number;
  goldenSkin: boolean;
  characterSkins?: Record<string, SkinId>;
  invulnFrames: number;
  orbitalShieldTimer: number;
  speedBoostTimer: number;
  emeraldShieldTimer: number;
  slowTimer: number;
  levelCleared: boolean;
  clinicArrivalSequence: boolean;
  clinicDoorProgress: number;
  educationalBanner: string;
  educationalBannerTimer: number;
  platforms: Platform[];
  questionBlocks: QuestionBlock[];
  collectibles: Collectible[];
  checkpoints: CheckpointFlag[];
  enemies: Enemy[];
  projectiles: Projectile[];
  lightningEffects: LightningEffect[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  boss: BossEntity | null;
  goalX: number;
  clinicX: number | null;
}

const BIOME_PALETTES: Record<
  BiomeType,
  {
    skyTop: string;
    skyMid: string;
    skyBot: string;
    hillFar: string;
    hillNear: string;
    groundTop: string;
    groundFill: string;
    brickFill: string;
    brickBorder: string;
    accent: string;
  }
> = {
  GARDEN_MORNING: {
    skyTop: '#062c2b',
    skyMid: '#0d4a46',
    skyBot: '#136f63',
    hillFar: '#0b3b38',
    hillNear: '#0f524c',
    groundTop: '#10b981',
    groundFill: '#064e3b',
    brickFill: '#0f766e',
    brickBorder: '#34d399',
    accent: '#fde047',
  },
  STORM_FORTRESS: {
    skyTop: '#0f172a',
    skyMid: '#1e1b4b',
    skyBot: '#312e81',
    hillFar: '#1e293b',
    hillNear: '#334155',
    groundTop: '#38bdf8',
    groundFill: '#1e293b',
    brickFill: '#3730a3',
    brickBorder: '#818cf8',
    accent: '#38bdf8',
  },
  SUNSET_CITY: {
    skyTop: '#2e1065',
    skyMid: '#701a75',
    skyBot: '#c2410c',
    hillFar: '#3b0764',
    hillNear: '#581c87',
    groundTop: '#f59e0b',
    groundFill: '#451a03',
    brickFill: '#9a3412',
    brickBorder: '#fb923c',
    accent: '#fbbf24',
  },
  CRYSTAL_CAVERN: {
    skyTop: '#090d16',
    skyMid: '#1e1b4b',
    skyBot: '#3b0764',
    hillFar: '#172554',
    hillNear: '#1e3a8a',
    groundTop: '#c084fc',
    groundFill: '#1e1b4b',
    brickFill: '#4c1d95',
    brickBorder: '#a855f7',
    accent: '#e879f9',
  },
  STARLIGHT_VALLEY: {
    skyTop: '#020617',
    skyMid: '#0f172a',
    skyBot: '#155e75',
    hillFar: '#083344',
    hillNear: '#164e63',
    groundTop: '#2dd4bf',
    groundFill: '#0f172a',
    brickFill: '#115e59',
    brickBorder: '#5eead4',
    accent: '#38bdf8',
  },
  ROYAL_CITADEL: {
    skyTop: '#1c1917',
    skyMid: '#422006',
    skyBot: '#064e3b',
    hillFar: '#292524',
    hillNear: '#065f46',
    groundTop: '#facc15',
    groundFill: '#022c22',
    brickFill: '#854d0e',
    brickBorder: '#fde047',
    accent: '#fde047',
  },
};

export function renderPlatformerCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderState
) {
  const pal = BIOME_PALETTES[state.biome] || BIOME_PALETTES.GARDEN_MORNING;
  const bossDefeated = state.boss?.defeated || false;

  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  if (bossDefeated) {
    skyGrad.addColorStop(0, '#042f2e');
    skyGrad.addColorStop(0.55, '#0f766e');
    skyGrad.addColorStop(1, '#10b981');
  } else {
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(0.55, pal.skyMid);
    skyGrad.addColorStop(1, pal.skyBot);
  }
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Biome-Specific Parallax Scenery
  const pSlow = state.cameraX * 0.2;
  const pMed = state.cameraX * 0.45;

  if (state.biome === 'GARDEN_MORNING' || bossDefeated) {
    ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
    ctx.beginPath();
    ctx.arc(width - 140, 88, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(width - 140, 88, 36, 0, Math.PI * 2);
    ctx.fill();
  } else if (state.biome === 'SUNSET_CITY') {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
    ctx.beginPath();
    ctx.arc(width - 180, 140, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(width - 180, 140, 46, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (let i = 0; i < 24; i++) {
      const sx = (((i * 137 - pSlow * 0.5) % width) + width) % width;
      const sy = 24 + ((i * 53) % 160);
      const pulse = Math.sin(state.frame * 0.06 + i) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.25 + pulse * 0.6})`;
      ctx.fillRect(sx, sy, i % 3 === 0 ? 3 : 2, i % 3 === 0 ? 3 : 2);
    }
  }

  for (let i = -1; i < 8; i++) {
    const bx = i * 260 - (pSlow % 260);
    if (state.biome === 'SUNSET_CITY') {
      const bh = 130 + ((i * 47) % 80);
      ctx.fillStyle = pal.hillFar;
      ctx.fillRect(bx, 420 - bh, 110, bh);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
      for (let wy = 420 - bh + 16; wy < 400; wy += 22) {
        for (let wx = bx + 14; wx < bx + 92; wx += 24) {
          ctx.fillRect(wx, wy, 10, 12);
        }
      }
    } else if (state.biome === 'CRYSTAL_CAVERN') {
      ctx.fillStyle = pal.hillFar;
      ctx.beginPath();
      ctx.moveTo(bx + 20, 420);
      ctx.lineTo(bx + 75, 210);
      ctx.lineTo(bx + 130, 420);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (state.biome === 'ROYAL_CITADEL') {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.14)';
      ctx.fillRect(bx + 30, 170, 28, 250);
      ctx.fillRect(bx + 20, 160, 48, 12);
      ctx.fillRect(bx + 130, 170, 28, 250);
      ctx.fillRect(bx + 120, 160, 48, 12);
    } else {
      ctx.fillStyle = pal.hillFar;
      ctx.beginPath();
      ctx.arc(bx + 130, 420, 150, Math.PI, 0);
      ctx.fill();
    }
  }

  for (let i = -1; i < 9; i++) {
    const nx = i * 210 - (pMed % 210);
    ctx.fillStyle = pal.hillNear;
    ctx.beginPath();
    ctx.arc(nx + 105, 420, 95, Math.PI, 0);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(-Math.round(state.cameraX), 0);

  // 3. Platforms
  for (const plat of state.platforms) {
    if (plat.x + plat.w < state.cameraX - 80 || plat.x > state.cameraX + width + 80) {
      continue;
    }

    if (plat.kind === 'ground') {
      ctx.fillStyle = pal.groundFill;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = pal.groundTop;
      ctx.fillRect(plat.x, plat.y, plat.w, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      for (let tx = plat.x + 12; tx < plat.x + plat.w - 16; tx += 36) {
        ctx.fillRect(tx, plat.y + 18, 20, 8);
      }
    } else if (plat.kind === 'brick' || plat.kind === 'moving') {
      ctx.fillStyle = plat.kind === 'moving' ? '#0284c7' : pal.brickFill;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.strokeStyle = plat.kind === 'moving' ? '#38bdf8' : pal.brickBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

      if (plat.kind === 'moving') {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(plat.x + 8, plat.y + 8, plat.w - 16, 4);
      }
      if (plat.label) {
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(plat.label, plat.x + plat.w / 2, plat.y - 5);
      }
    } else if (plat.kind === 'pipe') {
      ctx.fillStyle = '#059669';
      ctx.fillRect(plat.x + 4, plat.y + 14, plat.w - 8, plat.h - 14);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(plat.x, plat.y, plat.w, 16);
      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.w, 16);
    } else if (plat.kind === 'spring') {
      ctx.fillStyle = '#475569';
      ctx.fillRect(plat.x + 6, plat.y + 14, plat.w - 12, 18);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(plat.x, plat.y, plat.w, 14);
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(plat.x + 4, plat.y + 3, plat.w - 8, 4);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▲ MOLA', plat.x + plat.w / 2, plat.y - 4);
    }
  }

  // 4. Checkpoints
  for (const cp of state.checkpoints) {
    const poleX = cp.x;
    const poleTopY = cp.y - 92;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(poleX, poleTopY, 5, 92);

    ctx.fillStyle = cp.reached ? '#10b981' : '#64748b';
    ctx.beginPath();
    ctx.moveTo(poleX + 5, poleTopY + 6);
    ctx.lineTo(poleX + 52, poleTopY + 20);
    ctx.lineTo(poleX + 5, poleTopY + 34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(poleX + 16, poleTopY + 14, 4, 12);
    ctx.fillRect(poleX + 12, poleTopY + 18, 12, 4);

    ctx.fillStyle = cp.reached ? '#6ee7b7' : '#cbd5e1';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      cp.reached ? '✓ CHECKPOINT ATIVO' : 'CHECKPOINT',
      poleX + 18,
      poleTopY - 6
    );
  }

  // 5. Question Blocks [?]
  for (const qb of state.questionBlocks) {
    const drawY = qb.y + qb.bounceY;
    ctx.fillStyle = qb.hit ? '#475569' : '#f59e0b';
    ctx.fillRect(qb.x, drawY, qb.w, qb.h);
    ctx.strokeStyle = qb.hit ? '#94a3b8' : '#fef08a';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(qb.x, drawY, qb.w, qb.h);

    ctx.fillStyle = qb.hit ? '#cbd5e1' : '#ffffff';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(qb.hit ? '✓' : '?', qb.x + qb.w / 2, drawY + 26);
  }

  // 6. Collectibles
  for (const col of state.collectibles) {
    if (col.collected) continue;
    const floatY = col.y + Math.sin(state.frame * 0.09 + col.x * 0.05) * 5;
    const cx = col.x + col.w / 2;
    const cy = floatY + col.h / 2;

    ctx.fillStyle =
      col.kind === 'prenatal'
        ? 'rgba(16, 185, 129, 0.28)'
        : col.kind === 'info'
        ? 'rgba(245, 158, 11, 0.28)'
        : 'rgba(236, 72, 153, 0.28)';
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle =
      col.kind === 'prenatal'
        ? '#10b981'
        : col.kind === 'info'
        ? '#f59e0b'
        : col.kind === 'union'
        ? '#eab308'
        : '#ec4899';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', cx, cy + 4);
  }

  // 7. Boss Pedestals (Phases 10 & 17)
  if (state.boss && state.boss.pedestals.length > 0 && !state.boss.defeated) {
    for (const ped of state.boss.pedestals) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(ped.x - 24, ped.y, 48, 35);
      ctx.strokeStyle = ped.hp > 40 ? '#10b981' : '#f43f5e';
      ctx.lineWidth = 2;
      ctx.strokeRect(ped.x - 24, ped.y, 48, 35);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ped.x - 26, ped.y - 12, 52, 6);
      ctx.fillStyle = ped.hp > 40 ? '#10b981' : '#ef4444';
      ctx.fillRect(ped.x - 26, ped.y - 12, (52 * Math.max(0, ped.hp)) / 100, 6);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ped.name, ped.x, ped.y - 16);
    }
  }

  // 8. Enemies (FIXED EXACT SIGNATURE for drawPixelEnemy)
  for (const en of state.enemies) {
    if (!en.alive) continue;
    if (en.x + en.w < state.cameraX - 80 || en.x > state.cameraX + width + 80) {
      continue;
    }

    drawPixelEnemy(
      ctx,
      en.x,
      en.y,
      en.kind,
      en.vx >= 0 ? 1 : -1,
      state.frame
    );

    if (en.maxHp > 1) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(en.x, en.y - 10, en.w, 5);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(en.x, en.y - 10, (en.w * en.hp) / en.maxHp, 5);
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    const labelW = Math.max(68, en.label.length * 5.5);
    ctx.fillRect(en.x + en.w / 2 - labelW / 2, en.y - 24, labelW, 13);
    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(en.label, en.x + en.w / 2, en.y - 14);
  }

  // 9. Boss Rendering (FIXED EXACT SIGNATURE for drawPixelBoss)
  if (state.boss && state.boss.active && !state.boss.defeated) {
    const b = state.boss;
    const bossPhaseNum: 5 | 10 | 17 =
      b.type === 'PRESSAO' ? 5 : b.type === 'DESCUIDO' ? 10 : 17;
    drawPixelBoss(
      ctx,
      b.x,
      b.y,
      b.w,
      b.h,
      bossPhaseNum,
      b.invulnTimer,
      b.stage,
      state.frame
    );
  }

  // 10. Goal Portal (Phases 1–16) OR Grand Finish Line + Clínica Vittacare (Phase 17 ONLY)
  if (state.phaseNum < 17) {
    const gx = state.goalX;
    const unlocked =
      state.collectedCount >= state.requiredItems &&
      (!state.boss || state.boss.defeated);

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(gx, 240, 8, 180);

    ctx.fillStyle = unlocked ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(gx + 8, 245);
    ctx.lineTo(gx + 86, 275);
    ctx.lineTo(gx + 8, 305);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      unlocked ? 'PORTAL ABERTO!' : `META: ${state.collectedCount}/${state.requiredItems}`,
      gx + 36,
      228
    );
  } else {
    // PHASE 17 EXCLUSIVE: GRAND FINISH LINE & CLÍNICA VITTACARE
    const gx = state.goalX;
    const cx = state.clinicX || gx + 180;
    const bossCleared = !state.boss || state.boss.defeated;

    // Finish Line Posts & Checkered Banner
    ctx.fillStyle = '#facc15';
    ctx.fillRect(gx - 6, 230, 10, 190);
    ctx.fillRect(gx + 116, 230, 10, 190);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(gx - 10, 205, 140, 32);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(gx - 10, 205, 140, 32);

    for (let sq = 0; sq < 6; sq++) {
      ctx.fillStyle = sq % 2 === 0 ? '#ffffff' : '#0f172a';
      ctx.fillRect(gx - 6 + sq * 21, 237, 21, 8);
    }

    ctx.fillStyle = bossCleared ? '#4ade80' : '#fde047';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏁 LINHA DE CHEGADA', gx + 60, 225);

    // Detailed Pixel-Art Clínica Vittacare Building
    drawPixelClinicaVittacare(
      ctx,
      cx,
      220,
      state.clinicDoorProgress,
      state.frame
    );

    // Waiting companions celebrating outside the Clinic when boss is defeated
    if (bossCleared) {
      const companions = ['stephanie', 'marcelo', 'bianca', 'leticia', 'vivian', 'barbara'] as const;
      companions.forEach((cid, idx) => {
        if (NURSES[state.activeNurseIdx]?.id === cid) return;
        const nx = cx - 45 + idx * 54;
        const bounce = Math.abs(Math.sin(state.frame * 0.12 + idx)) * 6;
        const companionSkin: SkinId =
          state.characterSkins?.[cid] || (state.goldenSkin ? 'dourada' : 'padrao');
        drawPixelNurse(
          ctx,
          nx,
          420 - 60 - bounce,
          cid,
          -1,
          state.frame * 0.18,
          false,
          companionSkin,
          2.5
        );
      });
    }
  }

  // 11. Player Character (FIXED EXACT SIGNATURE for drawPixelNurse)
  const activeNurse = NURSES[state.activeNurseIdx] || NURSES[0];
  const activeSkinId: SkinId =
    state.characterSkins?.[activeNurse.id] ||
    (state.goldenSkin ? 'dourada' : 'padrao');

  if (state.speedBoostTimer > 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      state.playerX + state.playerW / 2,
      state.playerY + state.playerH / 2,
      36,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  if (state.emeraldShieldTimer > 0) {
    ctx.fillStyle = 'rgba(20, 184, 166, 0.22)';
    ctx.beginPath();
    ctx.arc(
      state.playerX + state.playerW / 2,
      state.playerY + state.playerH / 2,
      40,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  const flicker = state.invulnFrames > 0 && Math.floor(state.invulnFrames / 3) % 2 === 0;
  if (!flicker) {
    const walkAnimTick = Math.abs(state.playerVx) > 0.2 ? state.frame * 0.22 : 0;
    drawPixelNurse(
      ctx,
      state.playerX,
      state.playerY,
      activeNurse.id,
      state.facing,
      walkAnimTick,
      !state.grounded,
      activeSkinId,
      2.5
    );
  }

  // Marcelo's 360° Orbital Shields
  if (state.orbitalShieldTimer > 0) {
    const centerX = state.playerX + state.playerW / 2;
    const centerY = state.playerY + state.playerH / 2;
    for (let i = 0; i < 3; i++) {
      const ang = state.frame * 0.14 + (i * Math.PI * 2) / 3;
      const ox = centerX + Math.cos(ang) * 44;
      const oy = centerY + Math.sin(ang) * 44;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ox, oy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Player Name Tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(state.playerX - 10, state.playerY - 18, state.playerW + 20, 14);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    activeNurse.name,
    state.playerX + state.playerW / 2,
    state.playerY - 8
  );

  // 12. Projectiles
  for (const proj of state.projectiles) {
    ctx.save();
    ctx.fillStyle = proj.color;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, proj.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (proj.powerStyle === 'pierce_wave') {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.r + 6, -0.7, 0.7);
      ctx.stroke();
    } else if (proj.powerStyle === 'boomerang') {
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(proj.x - 6, proj.y - 6, 12, 12);
    } else if (proj.powerStyle === 'emerald_dragon') {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
      ctx.fillRect(proj.x - 24, proj.y - 8, 48, 16);
    }
    ctx.restore();
  }

  // 13. Samara Mkt's Violet Lightning Bolts
  for (const bolt of state.lightningEffects) {
    ctx.strokeStyle = bolt.color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(bolt.x1, bolt.y1);
    const midY = (bolt.y1 + bolt.y2) / 2;
    ctx.lineTo(bolt.x1 - 14, midY - 15);
    ctx.lineTo(bolt.x2 + 14, midY + 15);
    ctx.lineTo(bolt.x2, bolt.y2);
    ctx.stroke();
  }

  // 14. Particles & Floating Texts
  for (const pt of state.particles) {
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
  }

  for (const ft of state.floatingTexts) {
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }

  ctx.restore();

  // 15. Slim Unobtrusive Top HUD Bar (28px height, translucent)
  const phaseObj =
    CAMPAIGN_PHASES.find((p) => p.phaseNumber === state.phaseNum) ||
    CAMPAIGN_PHASES[0];

  ctx.fillStyle = 'rgba(9, 13, 22, 0.55)';
  ctx.fillRect(10, 6, width - 20, 28);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 6, width - 20, 28);

  // Left: Character + HP Bar
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${activeNurse.name}`, 18, 24);

  const hpBarX = 115;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(hpBarX, 13, 100, 12);
  const hpPct = Math.max(0, Math.min(1, state.hp / state.maxHp));
  ctx.fillStyle = hpPct > 0.5 ? '#10b981' : hpPct > 0.25 ? '#f59e0b' : '#ef4444';
  ctx.fillRect(hpBarX, 13, 100 * hpPct, 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${Math.ceil(state.hp)}HP`, hpBarX + 106, 23);

  // Center: Stage Progress
  const progW = 210;
  const progX = width / 2 - progW / 2;
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `FASE ${state.phaseNum}/17 · ${phaseObj.biomeName}`,
    width / 2,
    18
  );

  const stageRatio = Math.max(
    0,
    Math.min(1, state.playerX / Math.max(1, state.goalX))
  );
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(progX, 22, progW, 6);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(progX, 22, progW * stageRatio, 6);

  // Right: Items & Score
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(
    `ITENS: ${state.collectedCount}/${state.requiredItems}  |  PTS: ${state.score}`,
    width - 18,
    24
  );

  if (state.boss && state.boss.active && !state.boss.defeated) {
    const bw = 320;
    const bx = width / 2 - bw / 2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(bx, 38, bw, 24);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, 38, bw, 24);

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `⚠️ ${state.boss.name} (ETAPA ${state.boss.stage})`,
      width / 2,
      50
    );

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx + 12, 54, bw - 24, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(
      bx + 12,
      54,
      ((bw - 24) * Math.max(0, state.boss.hp)) / state.boss.maxHp,
      5
    );
  }

  // Educational Banner placed strictly inside the underground band (y=464..494) so it NEVER blocks gameplay!
  if (state.educationalBannerTimer > 0 && state.educationalBanner) {
    const tw = Math.min(width - 40, 640);
    const tx = width / 2 - tw / 2;
    ctx.fillStyle = 'rgba(6, 78, 59, 0.92)';
    ctx.fillRect(tx, height - 34, tw, 28);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tx, height - 34, tw, 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.educationalBanner, width / 2, height - 16);
  }
}
