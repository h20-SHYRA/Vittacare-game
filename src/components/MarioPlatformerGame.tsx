import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Sparkles,
  Shield,
  Heart,
  Zap,
  RotateCcw,
  ChevronRight,
  Lock,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Award,
  Flag,
  Shirt,
  Smartphone,
  Music,
} from 'lucide-react';
import {
  CAMPAIGN_PHASES,
  CharacterId,
  NURSES,
  PHASE5_EDUCATIONAL_MESSAGES,
  PHASE10_EDUCATIONAL_MESSAGES,
  PHASE17_EDUCATIONAL_MESSAGES,
  SkinId,
} from '../data/gameData';
import { PixelNurseAvatar } from './PixelNurseAvatar';
import { soundFX } from '../utils/sound';
import {
  buildLevelData,
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
import { renderPlatformerCanvas } from './gameRenderer';

interface MarioPlatformerGameProps {
  phaseNumber: number;
  maxUnlockedPhase: number;
  completedPhases: number[];
  goldenSkinEquipped: boolean;
  characterSkins: Record<CharacterId, SkinId>;
  selectedCharacterIdx: number;
  onSelectCharacterIdx: (idx: number) => void;
  onPhaseComplete: (phaseNum: number) => void;
  onSelectPhase: (phaseNum: number) => void;
  onOpenFinale: () => void;
  onOpenWardrobe: () => void;
  onToggleGoldenSkin: () => void;
}

const CANVAS_W = 960;
const CANVAS_H = 500;

export const MarioPlatformerGame: React.FC<MarioPlatformerGameProps> = ({
  phaseNumber,
  maxUnlockedPhase,
  completedPhases,
  goldenSkinEquipped,
  characterSkins,
  selectedCharacterIdx,
  onSelectCharacterIdx,
  onPhaseComplete,
  onSelectPhase,
  onOpenFinale,
  onOpenWardrobe,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeNurseIndex, setActiveNurseIndex] = useState<number>(selectedCharacterIdx);
  const [hpUI, setHpUI] = useState<number>(100);
  const [scoreUI, setScoreUI] = useState<number>(0);
  const [collectedUI, setCollectedUI] = useState<number>(0);
  const [requiredUI, setRequiredUI] = useState<number>(4);
  const [objectiveTextUI, setObjectiveTextUI] = useState<string>('');
  const [checkpointReachedUI, setCheckpointReachedUI] = useState<boolean>(false);
  const [levelClearedUI, setLevelClearedUI] = useState<boolean>(false);
  const [educationalBannerUI, setEducationalBannerUI] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isRotated90, setIsRotated90] = useState<boolean>(false);
  const [lofiEnabled, setLofiEnabled] = useState<boolean>(soundFX.musicEnabled);
  const [joystickVec, setJoystickVec] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentPhaseMeta =
    CAMPAIGN_PHASES.find((p) => p.phaseNumber === phaseNumber) || CAMPAIGN_PHASES[0];
  const activeNurse = NURSES[activeNurseIndex] || NURSES[0];

  const gameRef = useRef<{
    phaseNum: number;
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
    jumpsUsed: number;
    hp: number;
    maxHp: number;
    score: number;
    combo: number;
    collectedCount: number;
    requiredItems: number;
    respawnX: number;
    respawnY: number;
    activeNurseIdx: number;
    goldenSkin: boolean;
    invulnFrames: number;
    skillCooldown: number;
    orbitalShieldTimer: number;
    speedBoostTimer: number;
    emeraldShieldTimer: number;
    slowTimer: number;
    levelCleared: boolean;
    clinicArrivalSequence: boolean;
    clinicDoorProgress: number;
    educationalBanner: string;
    educationalBannerTimer: number;
    keys: { left: boolean; right: boolean; up: boolean };
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
  }>({
    phaseNum: phaseNumber,
    frame: 0,
    cameraX: 0,
    worldWidth: 2400,
    playerX: 80,
    playerY: 320,
    playerW: 45,
    playerH: 60,
    playerVx: 0,
    playerVy: 0,
    facing: 1,
    grounded: false,
    jumpsUsed: 0,
    hp: 100,
    maxHp: 100,
    score: 0,
    combo: 1,
    collectedCount: 0,
    requiredItems: 4,
    respawnX: 80,
    respawnY: 320,
    activeNurseIdx: selectedCharacterIdx,
    goldenSkin: goldenSkinEquipped,
    invulnFrames: 0,
    skillCooldown: 0,
    orbitalShieldTimer: 0,
    speedBoostTimer: 0,
    emeraldShieldTimer: 0,
    slowTimer: 0,
    levelCleared: false,
    clinicArrivalSequence: false,
    clinicDoorProgress: 0,
    educationalBanner: '',
    educationalBannerTimer: 0,
    keys: { left: false, right: false, up: false },
    platforms: [],
    questionBlocks: [],
    collectibles: [],
    checkpoints: [],
    enemies: [],
    projectiles: [],
    lightningEffects: [],
    particles: [],
    floatingTexts: [],
    boss: null,
    goalX: 2100,
    clinicX: null,
  });

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count = 10) => {
      const g = gameRef.current;
      for (let i = 0; i < count; i++) {
        const ang = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        const spd = 1.5 + Math.random() * 3.5;
        g.particles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.2,
          color,
          size: 4 + Math.random() * 3,
          life: 26 + Math.floor(Math.random() * 14),
        });
      }
    },
    []
  );

  const addFloatingText = useCallback((x: number, y: number, text: string, color = '#fde047') => {
    gameRef.current.floatingTexts.push({ x, y, text, color, life: 45 });
  }, []);

  const showEducationalMessage = useCallback((msg: string) => {
    const g = gameRef.current;
    g.educationalBanner = msg;
    g.educationalBannerTimer = 210;
    setEducationalBannerUI(msg);
  }, []);

  const initLevel = useCallback(
    (targetPhase: number) => {
      const data = buildLevelData(targetPhase);
      const g = gameRef.current;
      g.phaseNum = targetPhase;
      g.frame = 0;
      g.cameraX = 0;
      g.worldWidth = data.worldWidth;
      g.playerX = 80;
      g.playerY = 320;
      g.playerVx = 0;
      g.playerVy = 0;
      g.facing = 1;
      g.grounded = false;
      g.jumpsUsed = 0;
      g.hp = 100;
      g.maxHp = 100;
      g.combo = 1;
      g.collectedCount = 0;
      g.requiredItems = data.requiredItems;
      g.respawnX = 80;
      g.respawnY = 320;
      g.invulnFrames = 0;
      g.skillCooldown = 0;
      g.orbitalShieldTimer = 0;
      g.speedBoostTimer = 0;
      g.emeraldShieldTimer = 0;
      g.slowTimer = 0;
      g.levelCleared = false;
      g.clinicArrivalSequence = false;
      g.clinicDoorProgress = 0;
      g.platforms = data.platforms;
      g.questionBlocks = data.questionBlocks;
      g.collectibles = data.collectibles;
      g.checkpoints = data.checkpoints;
      g.enemies = data.enemies;
      g.projectiles = [];
      g.lightningEffects = [];
      g.particles = [];
      g.floatingTexts = [];
      g.boss = data.boss;
      g.goalX = data.goalX;
      g.clinicX = data.clinicX;

      const phaseMeta =
        CAMPAIGN_PHASES.find((p) => p.phaseNumber === targetPhase) ||
        CAMPAIGN_PHASES[0];
      showEducationalMessage(`Fase ${targetPhase}: ${phaseMeta.educationalTip}`);

      setHpUI(100);
      setCollectedUI(0);
      setRequiredUI(data.requiredItems);
      setObjectiveTextUI(data.objectiveTitle);
      setCheckpointReachedUI(false);
      setLevelClearedUI(false);

      soundFX.startLoFiMusic(targetPhase);
    },
    [showEducationalMessage]
  );

  useEffect(() => {
    initLevel(phaseNumber);
    const unlockAudio = () => {
      if (soundFX.musicEnabled && !soundFX.muted) {
        soundFX.startLoFiMusic(phaseNumber);
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, [phaseNumber, initLevel]);

  useEffect(() => {
    return () => {
      soundFX.stopLoFiMusic();
    };
  }, []);

  useEffect(() => {
    gameRef.current.goldenSkin = goldenSkinEquipped;
  }, [goldenSkinEquipped]);

  useEffect(() => {
    gameRef.current.activeNurseIdx = selectedCharacterIdx;
    setActiveNurseIndex(selectedCharacterIdx);
  }, [selectedCharacterIdx]);

  // ==================== PLAYER JUMP & 10 UNIQUE CHARACTER POWERS ====================
  const handleJump = useCallback(() => {
    const g = gameRef.current;
    if (g.levelCleared) return;
    if (g.grounded || g.jumpsUsed < 2) {
      g.playerVy = g.jumpsUsed === 0 ? -12.4 : -10.8;
      g.grounded = false;
      g.jumpsUsed += 1;
      soundFX.playJump();
      spawnParticles(g.playerX + g.playerW / 2, g.playerY + g.playerH, '#6ee7b7', 6);
    }
  }, [spawnParticles]);

  const handleUseSkill = useCallback(() => {
    const g = gameRef.current;
    if (g.levelCleared || g.skillCooldown > 0) return;

    const nurse = NURSES[g.activeNurseIdx] || NURSES[0];
    g.skillCooldown = 24;
    soundFX.playNurseSkill(nurse.pitchOffset);

    const startX = g.facing === 1 ? g.playerX + g.playerW + 6 : g.playerX - 6;
    const startY = g.playerY + g.playerH * 0.45;
    const dir = g.facing;

    // Register contribution for Boss Union Stages
    if (g.boss && !g.boss.defeated) {
      if (!g.boss.unionContributors.includes(nurse.id)) {
        g.boss.unionContributors.push(nurse.id);
      }
    }

    switch (nurse.id) {
      case 'stephanie': {
        // 1. Stephanie: Piercing Emerald Heartbeat Wave + Heal +18 HP + Cleanse Slow
        g.slowTimer = 0;
        g.hp = Math.min(g.maxHp, g.hp + 18);
        setHpUI(g.hp);
        g.projectiles.push({
          x: startX,
          y: startY,
          vx: dir * 9.5,
          vy: 0,
          r: 13,
          color: '#10b981',
          fromPlayer: true,
          nurseId: nurse.id,
          powerStyle: 'pierce_wave',
          piercing: true,
          damage: 14,
          life: 65,
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Onda Vital +18 HP!', '#34d399');
        break;
      }

      case 'marcelo': {
        // 2. Marcelo: 360° Orbital Shields + Precision Laser
        g.orbitalShieldTimer = 240;
        g.projectiles.push({
          x: startX,
          y: startY,
          vx: dir * 11.5,
          vy: 0,
          r: 9,
          color: '#0ea5e9',
          fromPlayer: true,
          nurseId: nurse.id,
          powerStyle: 'laser_orb',
          damage: 13,
          life: 55,
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Escudo Orbital 360°!', '#38bdf8');
        break;
      }

      case 'bianca': {
        // 3. Bianca: 3-Way Solar Star Spread + Remote Question Block Trigger
        [-3.2, 0, 3.2].forEach((vyVal) => {
          g.projectiles.push({
            x: startX,
            y: startY,
            vx: dir * 9.0,
            vy: vyVal,
            r: 9,
            color: '#f59e0b',
            fromPlayer: true,
            nurseId: nurse.id,
            powerStyle: 'star_spread',
            damage: 10,
            life: 55,
          });
        });
        // Activate nearby unhit question blocks
        for (const qb of g.questionBlocks) {
          if (!qb.hit && Math.abs(qb.x - g.playerX) < 320) {
            qb.hit = true;
            qb.bounceY = -10;
            g.collectedCount += 1;
            g.score += 150;
            setCollectedUI(g.collectedCount);
            setScoreUI(g.score);
            showEducationalMessage(qb.rewardText);
          }
        }
        addFloatingText(g.playerX, g.playerY - 14, 'Tríade do Saber!', '#fde047');
        break;
      }

      case 'leticia': {
        // 4. Leticia: Returning Magnetic Boomerang + Pull Collectibles
        g.projectiles.push({
          x: startX,
          y: startY,
          vx: dir * 10.5,
          vy: 0,
          r: 11,
          color: '#ec4899',
          fromPlayer: true,
          nurseId: nurse.id,
          powerStyle: 'boomerang',
          piercing: true,
          returning: true,
          damage: 12,
          life: 80,
        });
        for (const col of g.collectibles) {
          if (!col.collected && Math.abs(col.x - g.playerX) < 340) {
            col.x += (g.playerX - col.x) * 0.45;
            col.y += (g.playerY - col.y) * 0.45;
          }
        }
        addFloatingText(g.playerX, g.playerY - 14, 'Bumerangue Magnético!', '#f472b6');
        break;
      }

      case 'ronald': {
        // 5. Ronald Mkt: Expanding Sonic Ring + Speed Boost
        g.speedBoostTimer = 210;
        g.projectiles.push({
          x: startX,
          y: startY,
          vx: dir * 9.2,
          vy: 0,
          r: 16,
          color: '#3b82f6',
          fromPlayer: true,
          nurseId: nurse.id,
          powerStyle: 'sonic_ring',
          piercing: true,
          damage: 14,
          life: 60,
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Onda Sônica & Turbo!', '#60a5fa');
        break;
      }

      case 'nina': {
        // 6. Nina Mkt: 3 Homing Fireballs
        [-2.5, 0, 2.5].forEach((vyOffset) => {
          g.projectiles.push({
            x: startX,
            y: startY,
            vx: dir * 8.2,
            vy: vyOffset,
            r: 9,
            color: '#ea580c',
            fromPlayer: true,
            nurseId: nurse.id,
            powerStyle: 'homing_fire',
            homing: true,
            damage: 10,
            life: 75,
          });
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Chamas Teleguiadas!', '#fb923c');
        break;
      }

      case 'samara': {
        // 7. Samara Mkt: Sky Violet Lightning Bolts + Pedestal Restore
        let targetsHit = 0;
        for (const en of g.enemies) {
          if (en.alive && Math.abs(en.x - g.playerX) < 460 && targetsHit < 3) {
            en.hp -= 2;
            targetsHit++;
            g.lightningEffects.push({
              x1: en.x + en.w / 2,
              y1: 20,
              x2: en.x + en.w / 2,
              y2: en.y + en.h / 2,
              color: '#a855f7',
              life: 18,
            });
            if (en.hp <= 0) {
              en.alive = false;
              g.score += 180;
            }
          }
        }
        if (g.boss && !g.boss.defeated && Math.abs(g.boss.x - g.playerX) < 620) {
          g.boss.hp = Math.max(0, g.boss.hp - 12);
          g.lightningEffects.push({
            x1: g.boss.x + g.boss.w / 2,
            y1: 20,
            x2: g.boss.x + g.boss.w / 2,
            y2: g.boss.y + 40,
            color: '#c084fc',
            life: 20,
          });
          for (const ped of g.boss.pedestals) {
            ped.hp = Math.min(100, ped.hp + 25);
          }
        }
        g.projectiles.push({
          x: startX,
          y: startY,
          vx: dir * 10,
          vy: 0,
          r: 10,
          color: '#8b5cf6',
          fromPlayer: true,
          nurseId: nurse.id,
          powerStyle: 'lightning_bolt',
          damage: 11,
          life: 50,
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Trovão de Engajamento!', '#c084fc');
        break;
      }

      case 'leticia_mkt': {
        // 8. Letícia Mkt: Quadruple Viral Arrow Burst
        [0, 1, 2, 3].forEach((idx) => {
          g.projectiles.push({
            x: startX - dir * idx * 16,
            y: startY + (idx % 2 === 0 ? -4 : 4),
            vx: dir * 12.2,
            vy: 0,
            r: 7,
            color: '#06b6d4',
            fromPlayer: true,
            nurseId: nurse.id,
            powerStyle: 'viral_arrow',
            damage: 7,
            life: 55,
          });
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Rajada Viral 4x!', '#22d3ee');
        break;
      }

      case 'vivian': {
        // 9. Vivian (Sócia): Royal Star Meteor Shower + Heal +15 HP
        g.hp = Math.min(g.maxHp, g.hp + 15);
        setHpUI(g.hp);
        for (let m = 0; m < 5; m++) {
          g.projectiles.push({
            x: g.playerX - 100 + m * 110,
            y: 40,
            vx: dir * 3.2,
            vy: 7.5,
            r: 12,
            color: '#eab308',
            fromPlayer: true,
            nurseId: nurse.id,
            powerStyle: 'royal_meteor',
            piercing: true,
            damage: 14,
            life: 65,
          });
        }
        addFloatingText(g.playerX, g.playerY - 14, 'Chuva Real Vittacare!', '#fde047');
        break;
      }

      case 'barbara': {
        // 10. Bárbara (Sócia): Sovereign Emerald-Gold Beam + Royal Shield
        g.emeraldShieldTimer = 220;
        g.projectiles.push({
          x: startX,
          y: startY,
          vx: dir * 13.0,
          vy: 0,
          r: 15,
          color: '#14b8a6',
          fromPlayer: true,
          nurseId: nurse.id,
          powerStyle: 'emerald_dragon',
          piercing: true,
          damage: 18,
          life: 65,
        });
        addFloatingText(g.playerX, g.playerY - 14, 'Raio Soberano & Escudo!', '#2dd4bf');
        break;
      }
    }
  }, [addFloatingText, showEducationalMessage]);

  const handleSwitchNurse = useCallback(
    (idx: number) => {
      const safeIdx = ((idx % NURSES.length) + NURSES.length) % NURSES.length;
      gameRef.current.activeNurseIdx = safeIdx;
      setActiveNurseIndex(safeIdx);
      onSelectCharacterIdx(safeIdx);
      soundFX.playCollect();
      const chosen = NURSES[safeIdx];
      addFloatingText(
        gameRef.current.playerX,
        gameRef.current.playerY - 18,
        `${chosen.name}: ${chosen.skillName}`,
        chosen.baseColor
      );
    },
    [addFloatingText, onSelectCharacterIdx]
  );

  // ==================== KEYBOARD CONTROLS ====================
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        g.keys.left = true;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        g.keys.right = true;
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'Enter') {
        e.preventDefault();
        handleUseSkill();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        handleSwitchNurse(g.activeNurseIdx + 1);
      } else if (e.code.startsWith('Digit')) {
        const d = parseInt(e.code.replace('Digit', ''), 10);
        if (d >= 1 && d <= 9) handleSwitchNurse(d - 1);
        if (d === 0) handleSwitchNurse(9);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        g.keys.left = false;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        g.keys.right = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleJump, handleUseSkill, handleSwitchNurse]);

  // ==================== MAIN GAME LOOP ====================
  useEffect(() => {
    let animId = 0;

    const updateGame = () => {
      const g = gameRef.current;
      g.frame += 1;

      if (g.invulnFrames > 0) g.invulnFrames -= 1;
      if (g.skillCooldown > 0) g.skillCooldown -= 1;
      if (g.orbitalShieldTimer > 0) g.orbitalShieldTimer -= 1;
      if (g.speedBoostTimer > 0) g.speedBoostTimer -= 1;
      if (g.emeraldShieldTimer > 0) g.emeraldShieldTimer -= 1;
      if (g.slowTimer > 0) g.slowTimer -= 1;
      if (g.educationalBannerTimer > 0) g.educationalBannerTimer -= 1;

      // Update Moving Platforms
      for (const plat of g.platforms) {
        if (plat.kind === 'moving' && plat.baseX !== undefined && plat.baseY !== undefined) {
          const spd = plat.moveSpeed || 0.04;
          if (plat.moveRangeX) {
            plat.x = plat.baseX + Math.sin(g.frame * spd) * plat.moveRangeX;
          }
          if (plat.moveRangeY) {
            plat.y = plat.baseY + Math.cos(g.frame * spd) * plat.moveRangeY;
          }
        }
      }

      // Phase 17 Clinic Walk-In Finale Animation
      if (g.clinicArrivalSequence) {
        g.clinicDoorProgress = Math.min(1, g.clinicDoorProgress + 0.025);
        const targetX = (g.clinicX || g.goalX + 180) + 135;
        if (g.playerX < targetX) {
          g.playerX += 2.8;
          g.playerVx = 2.8;
          g.facing = 1;
        } else {
          g.playerVx = 0;
          if (!g.levelCleared) {
            g.levelCleared = true;
            setLevelClearedUI(true);
            soundFX.playVictoryFanfare();
            onPhaseComplete(g.phaseNum);
          }
        }
        g.cameraX = Math.max(
          0,
          Math.min(g.worldWidth - CANVAS_W, g.playerX - CANVAS_W * 0.42)
        );
        return;
      }

      if (!g.levelCleared) {
        // Horizontal Movement
        const baseSpeed = g.speedBoostTimer > 0 ? 6.4 : g.slowTimer > 0 ? 2.8 : 4.7;
        if (g.keys.left) {
          g.playerVx = -baseSpeed;
          g.facing = -1;
        } else if (g.keys.right) {
          g.playerVx = baseSpeed;
          g.facing = 1;
        } else {
          g.playerVx *= 0.78;
          if (Math.abs(g.playerVx) < 0.1) g.playerVx = 0;
        }

        // Apply Horizontal & Vertical Physics
        g.playerX = Math.max(12, Math.min(g.worldWidth - 60, g.playerX + g.playerVx));
        g.playerVy = Math.min(14, g.playerVy + 0.58);
        const prevBottom = g.playerY + g.playerH;
        g.playerY += g.playerVy;
        g.grounded = false;

        // Platform Collisions
        for (const plat of g.platforms) {
          const withinX =
            g.playerX + g.playerW > plat.x + 4 && g.playerX < plat.x + plat.w - 4;
          if (
            withinX &&
            prevBottom <= plat.y + 16 &&
            g.playerY + g.playerH >= plat.y &&
            g.playerVy >= 0
          ) {
            if (plat.kind === 'spring') {
              g.playerY = plat.y - g.playerH;
              g.playerVy = -16.2;
              g.jumpsUsed = 1;
              soundFX.playJump();
              spawnParticles(plat.x + plat.w / 2, plat.y, '#fda4af', 10);
              addFloatingText(plat.x + plat.w / 2, plat.y - 12, 'SUPER SALTO!', '#fda4af');
            } else {
              g.playerY = plat.y - g.playerH;
              g.playerVy = 0;
              g.grounded = true;
              g.jumpsUsed = 0;
            }
          }
        }

        // Question Block Hits from below
        for (const qb of g.questionBlocks) {
          if (qb.bounceY < 0) qb.bounceY += 1;
          const withinX = g.playerX + g.playerW > qb.x - 4 && g.playerX < qb.x + qb.w + 4;
          if (
            !qb.hit &&
            withinX &&
            g.playerY <= qb.y + qb.h + 8 &&
            g.playerY + g.playerH >= qb.y &&
            g.playerVy < 0
          ) {
            qb.hit = true;
            qb.bounceY = -10;
            g.playerVy = 2;
            g.collectedCount += 1;
            g.score += 150;
            g.hp = Math.min(g.maxHp, g.hp + 10);
            setCollectedUI(g.collectedCount);
            setScoreUI(g.score);
            setHpUI(g.hp);
            soundFX.playCollect();
            showEducationalMessage(qb.rewardText);
            spawnParticles(qb.x + qb.w / 2, qb.y, '#fde047', 12);
          }
        }

        // Checkpoints
        for (const cp of g.checkpoints) {
          if (!cp.reached && Math.abs(g.playerX - cp.x) < 42) {
            cp.reached = true;
            g.respawnX = cp.x;
            g.respawnY = cp.y - g.playerH - 10;
            g.hp = Math.min(g.maxHp, g.hp + 25);
            setHpUI(g.hp);
            setCheckpointReachedUI(true);
            soundFX.playCheckpoint();
            spawnParticles(cp.x, cp.y - 60, '#10b981', 16);
            addFloatingText(cp.x, cp.y - 95, 'CHECKPOINT SALVO! +25 HP', '#34d399');
          }
        }

        // Collectibles
        for (const col of g.collectibles) {
          if (col.collected) continue;
          const dx = g.playerX + g.playerW / 2 - (col.x + col.w / 2);
          const dy = g.playerY + g.playerH / 2 - (col.y + col.h / 2);
          if (Math.hypot(dx, dy) < 34) {
            col.collected = true;
            g.collectedCount += 1;
            g.score += 100 * g.combo;
            g.hp = Math.min(g.maxHp, g.hp + 6);
            setCollectedUI(g.collectedCount);
            setScoreUI(g.score);
            setHpUI(g.hp);
            soundFX.playCollect();
            spawnParticles(col.x + col.w / 2, col.y + col.h / 2, '#10b981', 8);
            addFloatingText(col.x, col.y - 8, `+${col.label}`, '#6ee7b7');
          }
        }

        // Pit Fall Respawn at Checkpoint
        if (g.playerY > CANVAS_H + 50) {
          g.hp = Math.max(25, g.hp - 20);
          setHpUI(g.hp);
          g.playerX = g.respawnX;
          g.playerY = g.respawnY;
          g.playerVx = 0;
          g.playerVy = 0;
          g.invulnFrames = 60;
          soundFX.playDamage();
          addFloatingText(g.playerX, g.playerY - 20, 'Retornando ao Checkpoint!', '#fda4af');
        }

        // Update Enemies
        for (const en of g.enemies) {
          if (!en.alive) continue;
          en.x += en.vx;
          if (en.x <= en.minX || en.x >= en.maxX) {
            en.vx *= -1;
          }
          if (en.kind === 'jumper') {
            en.y = en.baseY - Math.abs(Math.sin(g.frame * 0.08)) * 42;
          } else if (en.kind === 'flyer') {
            en.y = en.baseY + Math.sin(g.frame * 0.07) * 28;
          }

          // Ranged Mage Shots
          if (en.kind === 'mage' && Math.abs(en.x - g.playerX) < 380) {
            en.shootTimer -= 1;
            if (en.shootTimer <= 0) {
              en.shootTimer = 110;
              const dir = g.playerX > en.x ? 1 : -1;
              g.projectiles.push({
                x: en.x + en.w / 2,
                y: en.y + 18,
                vx: dir * 5.2,
                vy: 0,
                r: 7,
                color: '#c084fc',
                fromPlayer: false,
                powerStyle: 'enemy_shot',
                life: 70,
              });
            }
          }

          // Marcelo's Orbital Shield Contact Damage
          if (g.orbitalShieldTimer > 0) {
            const dist = Math.hypot(
              en.x + en.w / 2 - (g.playerX + g.playerW / 2),
              en.y + en.h / 2 - (g.playerY + g.playerH / 2)
            );
            if (dist < 56) {
              en.alive = false;
              g.score += 150;
              setScoreUI(g.score);
              soundFX.playCollect();
              spawnParticles(en.x + en.w / 2, en.y + en.h / 2, '#38bdf8', 10);
              continue;
            }
          }

          // Player vs Enemy Collision
          const overlapX = g.playerX + g.playerW > en.x + 4 && g.playerX < en.x + en.w - 4;
          const overlapY = g.playerY + g.playerH > en.y + 4 && g.playerY < en.y + en.h - 4;
          if (overlapX && overlapY) {
            // Mario Stomp from above (unless spiker)
            if (g.playerVy > 0 && g.playerY + g.playerH - g.playerVy <= en.y + 18 && en.kind !== 'spiker') {
              en.hp -= 1;
              g.playerVy = -10.5;
              g.combo += 1;
              if (en.hp <= 0) {
                en.alive = false;
                g.score += 120 * g.combo;
                setScoreUI(g.score);
                spawnParticles(en.x + en.w / 2, en.y + en.h / 2, '#34d399', 12);
                addFloatingText(en.x, en.y - 10, `Purificado! x${g.combo}`, '#fde047');
              }
              soundFX.playCollect();
            } else if (g.invulnFrames <= 0 && g.emeraldShieldTimer <= 0) {
              g.hp = Math.max(0, g.hp - 14);
              g.invulnFrames = 55;
              g.combo = 1;
              setHpUI(g.hp);
              soundFX.playDamage();
              addFloatingText(g.playerX, g.playerY - 15, '-14 Saúde', '#ef4444');
              if (g.hp <= 0) {
                g.hp = 100;
                setHpUI(100);
                g.playerX = g.respawnX;
                g.playerY = g.respawnY;
                addFloatingText(g.playerX, g.playerY - 24, 'Recomeçando no Checkpoint!', '#fde047');
              }
            }
          }
        }

        // ==================== BOSS AI (PHASES 5, 10, 17) ====================
        if (g.boss && g.boss.active && !g.boss.defeated) {
          const b = g.boss;
          if (b.invulnTimer > 0) b.invulnTimer -= 1;

          // Boss Stage Transitions
          if (b.hp <= 25) b.stage = 4;
          else if (b.hp <= 50) b.stage = 3;
          else if (b.hp <= 75) b.stage = 2;
          else b.stage = 1;

          // Boss Movement
          b.x += b.vx;
          const minArenaX = 1280;
          const maxArenaX = g.goalX - 180;
          if (b.x <= minArenaX || b.x >= maxArenaX) {
            b.vx *= -1;
          }

          // Boss Projectiles & Waves
          b.attackTimer -= 1;
          if (b.attackTimer <= 0) {
            b.attackTimer = Math.max(38, 78 - b.stage * 10);
            const dir = g.playerX < b.x ? -1 : 1;
            g.projectiles.push({
              x: b.x + b.w / 2,
              y: b.y + b.h * 0.55,
              vx: dir * (5.2 + b.stage * 0.6),
              vy: (Math.random() - 0.5) * 2.2,
              r: 11,
              color:
                b.type === 'PRESSAO'
                  ? '#ef4444'
                  : b.type === 'DESCUIDO'
                  ? '#a855f7'
                  : '#eab308',
              fromPlayer: false,
              powerStyle: 'enemy_shot',
              life: 90,
            });

            // Show educational message periodically during boss fight
            const msgPool =
              b.type === 'PRESSAO'
                ? PHASE5_EDUCATIONAL_MESSAGES
                : b.type === 'DESCUIDO'
                ? PHASE10_EDUCATIONAL_MESSAGES
                : PHASE17_EDUCATIONAL_MESSAGES;
            const msg = msgPool[Math.floor(Math.random() * msgPool.length)];
            showEducationalMessage(msg);
          }

          // Stomp Boss from Above
          const hitBossX = g.playerX + g.playerW > b.x + 10 && g.playerX < b.x + b.w - 10;
          const hitBossY = g.playerY + g.playerH > b.y + 10 && g.playerY < b.y + b.h - 10;
          if (hitBossX && hitBossY) {
            if (g.playerVy > 0 && g.playerY + g.playerH - g.playerVy <= b.y + 32 && b.invulnTimer <= 0) {
              b.hp = Math.max(0, b.hp - 12);
              b.invulnTimer = 24;
              g.playerVy = -12.5;
              soundFX.playBossHit();
              spawnParticles(b.x + b.w / 2, b.y + 20, '#fde047', 16);
              addFloatingText(b.x + b.w / 2, b.y - 12, '-12 CHEFÃO!', '#fde047');
              if (b.hp <= 0) {
                b.defeated = true;
                g.score += 1000;
                setScoreUI(g.score);
                soundFX.playVictoryFanfare();
                showEducationalMessage('Chefão Derrotado! O caminho da saúde está iluminado!');
              }
            } else if (g.invulnFrames <= 0 && g.emeraldShieldTimer <= 0) {
              g.hp = Math.max(10, g.hp - 16);
              g.invulnFrames = 60;
              g.playerVx = g.playerX < b.x ? -8 : 8;
              g.playerVy = -7;
              setHpUI(g.hp);
              soundFX.playDamage();
            }
          }
        }

        // ==================== UPDATE PROJECTILES ====================
        for (let i = g.projectiles.length - 1; i >= 0; i--) {
          const p = g.projectiles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;

          // Leticia's Returning Boomerang
          if (p.returning && p.life === 40) {
            p.vx *= -1;
          }

          // Nina's Homing Fireballs
          if (p.homing && p.fromPlayer) {
            let targetX: number | null = null;
            let targetY: number | null = null;
            for (const en of g.enemies) {
              if (en.alive && Math.abs(en.x - p.x) < 350) {
                targetX = en.x + en.w / 2;
                targetY = en.y + en.h / 2;
                break;
              }
            }
            if (targetX === null && g.boss && !g.boss.defeated) {
              targetX = g.boss.x + g.boss.w / 2;
              targetY = g.boss.y + g.boss.h / 2;
            }
            if (targetX !== null && targetY !== null) {
              p.vx += Math.sign(targetX - p.x) * 0.45;
              p.vy += Math.sign(targetY - p.y) * 0.35;
            }
          }

          if (p.fromPlayer) {
            // Hit regular enemies
            for (const en of g.enemies) {
              if (!en.alive) continue;
              if (
                p.x + p.r > en.x &&
                p.x - p.r < en.x + en.w &&
                p.y + p.r > en.y &&
                p.y - p.r < en.y + en.h
              ) {
                en.hp -= p.damage ? Math.ceil(p.damage / 6) : 1;
                spawnParticles(p.x, p.y, p.color, 8);
                if (en.hp <= 0) {
                  en.alive = false;
                  g.score += 120;
                  setScoreUI(g.score);
                  addFloatingText(en.x, en.y - 10, '+120 Purificado!', '#6ee7b7');
                }
                if (!p.piercing) {
                  p.life = 0;
                  break;
                }
              }
            }

            // Hit Boss
            if (g.boss && g.boss.active && !g.boss.defeated && p.life > 0) {
              const b = g.boss;
              if (
                p.x + p.r > b.x &&
                p.x - p.r < b.x + b.w &&
                p.y + p.r > b.y &&
                p.y - p.r < b.y + b.h &&
                b.invulnTimer <= 0
              ) {
                const dmg = p.damage || 10;
                b.hp = Math.max(0, b.hp - dmg);
                b.invulnTimer = 14;
                soundFX.playBossHit();
                spawnParticles(p.x, p.y, '#fde047', 12);
                addFloatingText(b.x + b.w / 2, b.y - 10, `-${dmg} HP!`, '#fde047');
                if (!p.piercing) p.life = 0;
                if (b.hp <= 0) {
                  b.defeated = true;
                  g.score += 1200;
                  setScoreUI(g.score);
                  soundFX.playVictoryFanfare();
                  showEducationalMessage('Chefão Derrotado! Avance até a chegada!');
                }
              }
            }
          } else {
            // Enemy Projectile hitting Player or Orbital Shield
            const distPlayer = Math.hypot(
              p.x - (g.playerX + g.playerW / 2),
              p.y - (g.playerY + g.playerH / 2)
            );
            if (g.orbitalShieldTimer > 0 && distPlayer < 48) {
              p.life = 0;
              spawnParticles(p.x, p.y, '#38bdf8', 6);
            } else if (
              distPlayer < 26 &&
              g.invulnFrames <= 0 &&
              g.emeraldShieldTimer <= 0
            ) {
              p.life = 0;
              g.hp = Math.max(10, g.hp - 12);
              g.invulnFrames = 45;
              g.slowTimer = 90;
              setHpUI(g.hp);
              soundFX.playDamage();
              addFloatingText(g.playerX, g.playerY - 12, 'Onda de Pressão!', '#fda4af');
            }
          }

          if (p.life <= 0) {
            g.projectiles.splice(i, 1);
          }
        }

        // ==================== CHECK GOAL / FINISH LINE ====================
        if (g.playerX + g.playerW >= g.goalX) {
          const bossCleared = !g.boss || g.boss.defeated;
          if (!bossCleared) {
            g.playerX = g.goalX - g.playerW - 4;
            showEducationalMessage('Derrote o Chefão primeiro para liberar a passagem!');
          } else if (g.collectedCount < g.requiredItems) {
            // Auto-grant remaining items if boss is defeated or inform player
            if (g.boss && g.boss.defeated) {
              g.collectedCount = g.requiredItems;
              setCollectedUI(g.collectedCount);
            } else {
              g.playerX = g.goalX - g.playerW - 4;
              showEducationalMessage(
                `Colete pelo menos ${g.requiredItems} itens de cuidado (${g.collectedCount}/${g.requiredItems})!`
              );
            }
          } else {
            // Stage Complete!
            if (g.phaseNum === 17) {
              g.clinicArrivalSequence = true;
              showEducationalMessage(
                'LINHA DE CHEGADA ALCANÇADA! Bem-vindos à Clínica Vittacare!'
              );
            } else {
              g.levelCleared = true;
              setLevelClearedUI(true);
              soundFX.playVictoryFanfare();
              onPhaseComplete(g.phaseNum);
            }
          }
        }
      }

      // Update Particles, Lightning & Floating Text
      for (let i = g.lightningEffects.length - 1; i >= 0; i--) {
        g.lightningEffects[i].life -= 1;
        if (g.lightningEffects[i].life <= 0) g.lightningEffects.splice(i, 1);
      }
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life -= 1;
        if (pt.life <= 0) g.particles.splice(i, 1);
      }
      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 0.75;
        ft.life -= 1;
        if (ft.life <= 0) g.floatingTexts.splice(i, 1);
      }

      // Camera Follow
      g.cameraX = Math.max(
        0,
        Math.min(g.worldWidth - CANVAS_W, g.playerX - CANVAS_W * 0.36)
      );
    };

    const loop = () => {
      updateGame();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderPlatformerCanvas(ctx, CANVAS_W, CANVAS_H, {
            ...gameRef.current,
            biome: currentPhaseMeta.biome,
            characterSkins,
          });
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [
    currentPhaseMeta.biome,
    characterSkins,
    addFloatingText,
    onPhaseComplete,
    showEducationalMessage,
    spawnParticles,
  ]);

  // ==================== HORIZONTAL ARCADE MODE (AUTO-LANDSCAPE & 90° ROTATION) ====================
  useEffect(() => {
    const checkLandscape = () => {
      if (window.innerWidth > window.innerHeight && window.innerHeight < 560) {
        setIsFullscreen(true);
        setIsRotated90(false);
      }
    };
    checkLandscape();
    window.addEventListener('resize', checkLandscape);
    return () => window.removeEventListener('resize', checkLandscape);
  }, []);

  const toggleHorizontalMode = async () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    // If user is on a portrait phone (height > width), automatically rotate 90° so it plays horizontally!
    if (nextState && window.innerHeight > window.innerWidth) {
      setIsRotated90(true);
    } else if (!nextState) {
      setIsRotated90(false);
    }

    const el = containerRef.current;
    if (el) {
      try {
        if (nextState && !document.fullscreenElement && el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (!nextState && document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        // Ignore iframe fullscreen restrictions; CSS fixed overlay + 90deg rotation handles it!
      }
    }
  };

  const toggleRotate90 = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      setIsRotated90(true);
    } else {
      setIsRotated90((prev) => !prev);
    }
  };

  const handleJoystickStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    joystickTouchIdRef.current = e.pointerId;
    joystickCenterRef.current = { x: cx, y: cy };
    updateJoystickByPoint(e.clientX, e.clientY);
  };

  const handleJoystickMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current !== e.pointerId) return;
    e.preventDefault();
    updateJoystickByPoint(e.clientX, e.clientY);
  };

  const handleJoystickEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (joystickTouchIdRef.current !== e.pointerId) return;
    e.preventDefault();
    joystickTouchIdRef.current = null;
    setJoystickVec({ x: 0, y: 0 });
    gameRef.current.keys.left = false;
    gameRef.current.keys.right = false;
  };

  const updateJoystickByPoint = (clientX: number, clientY: number) => {
    const maxR = 38;
    const rawDx = clientX - joystickCenterRef.current.x;
    const rawDy = clientY - joystickCenterRef.current.y;

    // When container is rotated 90 degrees clockwise on a portrait phone, remap screen X/Y to local game X/Y!
    const dx = isRotated90 ? rawDy : rawDx;
    const dy = isRotated90 ? -rawDx : rawDy;

    const dist = Math.min(maxR, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx);
    const nx = Math.cos(ang) * (dist / maxR);
    const ny = Math.sin(ang) * (dist / maxR);
    setJoystickVec({ x: nx, y: ny });

    const g = gameRef.current;
    g.keys.left = nx < -0.22;
    g.keys.right = nx > 0.22;
    if (ny < -0.62) {
      handleJump();
    }
  };

  const containerStyle: React.CSSProperties = isRotated90
    ? {
        position: 'fixed',
        top: 0,
        left: '100vw',
        width: '100vh',
        height: '100vw',
        transformOrigin: 'top left',
        transform: 'rotate(90deg)',
        zIndex: 60,
      }
    : {};

  return (
    <section
      ref={containerRef}
      style={containerStyle}
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#070b12] overflow-hidden flex flex-row items-stretch justify-between select-none touch-none'
          : 'max-w-[1320px] mx-auto px-2.5 sm:px-6 py-2.5 space-y-2.5 select-none'
      }
    >
      {/* ==================== HORIZONTAL / FULLSCREEN MODE: LEFT JOYPAD COLUMN ==================== */}
      {isFullscreen && (
        <div className="w-[116px] sm:w-[134px] shrink-0 bg-slate-950/95 border-r border-slate-800/90 p-2 flex flex-col items-center justify-between z-30 touch-none select-none">
          {/* Top-Left Mini Status & Quick Actions */}
          <div className="w-full space-y-1.5">
            <div className="px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold text-center truncate">
              FASE {phaseNumber}/17
            </div>
            <button
              type="button"
              onClick={toggleRotate90}
              className={`w-full px-2 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer border ${
                isRotated90
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900 text-amber-300 border-amber-400/40'
              }`}
            >
              <Smartphone className="w-3 h-3 rotate-90 shrink-0" />
              <span>{isRotated90 ? 'Desvirar' : 'Girar 90°'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsFullscreen(false);
                setIsRotated90(false);
                onOpenWardrobe();
              }}
              className="w-full px-2 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Shirt className="w-3 h-3 shrink-0" />
              <span>Skins</span>
            </button>
          </div>

          {/* Center-Left: Virtual Analog Joystick */}
          <div
            onPointerDown={handleJoystickStart}
            onPointerMove={handleJoystickMove}
            onPointerUp={handleJoystickEnd}
            onPointerCancel={handleJoystickEnd}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900 border-2 border-emerald-500/60 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
          >
            <div className="absolute inset-1.5 rounded-full border border-slate-800 pointer-events-none" />
            <div
              style={{
                transform: `translate(${joystickVec.x * 18}px, ${joystickVec.y * 18}px)`,
              }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-white/80" />
            </div>
          </div>

          {/* Bottom-Left: Direct D-Pad Buttons */}
          <div className="grid grid-cols-3 gap-1 w-full">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                gameRef.current.keys.left = true;
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                gameRef.current.keys.left = false;
              }}
              onPointerLeave={() => {
                gameRef.current.keys.left = false;
              }}
              className="h-10 rounded-lg bg-slate-800 active:bg-emerald-500 active:text-slate-950 border-b-2 border-slate-950 text-white font-bold text-sm flex items-center justify-center cursor-pointer touch-none"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleJump();
              }}
              className="h-10 rounded-lg bg-slate-800 active:bg-amber-400 active:text-slate-950 border-b-2 border-slate-950 text-amber-300 font-bold text-sm flex items-center justify-center cursor-pointer touch-none"
            >
              ▲
            </button>
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                gameRef.current.keys.right = true;
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                gameRef.current.keys.right = false;
              }}
              onPointerLeave={() => {
                gameRef.current.keys.right = false;
              }}
              className="h-10 rounded-lg bg-slate-800 active:bg-emerald-500 active:text-slate-950 border-b-2 border-slate-950 text-white font-bold text-sm flex items-center justify-center cursor-pointer touch-none"
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* ==================== NORMAL MODE TOP BARS (Compact 1-Line Strips) ==================== */}
      {!isFullscreen && (
        <>
          <div className="rounded-2xl bg-slate-900/95 border border-slate-800 p-2.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shrink-0">
                  FASE {phaseNumber}/17
                </span>
                <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                  {currentPhaseMeta.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {checkpointReachedUI && (
                  <span className="px-2 py-1 rounded-md bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[11px] font-semibold flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Checkpoint
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const next = soundFX.toggleLoFiMusic();
                    setLofiEnabled(next);
                  }}
                  title={soundFX.getTrackName(phaseNumber)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    lofiEnabled
                      ? 'bg-teal-500/20 border-teal-400/50 text-teal-200 hover:bg-teal-500/30'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-teal-300" />
                  <span className="hidden md:inline">{soundFX.getTrackName(phaseNumber)}</span>
                  <span className="md:hidden">{lofiEnabled ? 'Lo-Fi ON' : 'Lo-Fi OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenWardrobe}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Guarda-Roupa (Skins)</span>
                </button>

                <button
                  type="button"
                  onClick={() => initLevel(phaseNumber)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reiniciar</span>
                </button>

                <button
                  type="button"
                  onClick={toggleRotate90}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer border bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-400/40"
                >
                  <Smartphone className="w-3.5 h-3.5 rotate-90" />
                  <span>Girar 90° (Celular)</span>
                </button>

                <button
                  type="button"
                  onClick={toggleHorizontalMode}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer shadow"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Tela Cheia Horizontal
                </button>
              </div>
            </div>

            {/* 17 Levels Single-Row Scroll Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {CAMPAIGN_PHASES.map((p) => {
                const isUnlocked = p.phaseNumber <= maxUnlockedPhase;
                const isCompleted = completedPhases.includes(p.phaseNumber);
                const isCurrent = p.phaseNumber === phaseNumber;
                const isBoss = p.type !== 'CARE_STAGE';

                return (
                  <button
                    key={p.phaseNumber}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      if (isUnlocked) onSelectPhase(p.phaseNumber);
                    }}
                    title={
                      isUnlocked
                        ? `Fase ${p.phaseNumber}: ${p.title}`
                        : `Fase ${p.phaseNumber} Bloqueada — Conclua a Fase ${p.phaseNumber - 1} primeiro!`
                    }
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-amber-300 shadow-md cursor-pointer'
                        : isCompleted
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 cursor-pointer'
                        : isUnlocked
                        ? isBoss
                          ? 'bg-amber-950/90 text-amber-300 border border-amber-500/50 hover:bg-amber-900 cursor-pointer'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer'
                        : 'bg-slate-950/80 text-slate-600 border border-slate-800/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {!isUnlocked ? (
                      <Lock className="w-2.5 h-2.5 text-slate-500" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    ) : null}
                    <span>
                      {p.phaseNumber}
                      {p.phaseNumber === 5
                        ? '·BOSS1'
                        : p.phaseNumber === 10
                        ? '·BOSS2'
                        : p.phaseNumber === 17
                        ? '·FINAL🏥'
                        : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Single-Row Compact Character Strip (Does not push screen down on mobile!) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-800/80">
              {NURSES.map((n, idx) => {
                const isSelected = idx === activeNurseIndex;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleSwitchNurse(idx);
                    }}
                    className={`px-2 py-1 rounded-xl border text-left transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/95 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <PixelNurseAvatar
                      nurseId={n.id}
                      skinId={characterSkins[n.id]}
                      golden={goldenSkinEquipped}
                      size={24}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-white leading-tight">
                        {n.name}
                      </div>
                      <div className="text-[9px] text-emerald-300 leading-tight">
                        {n.skillName}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ==================== CENTER GAME VIEWPORT (100% UNOBSTRUCTED CANVAS) ==================== */}
      <div
        className={
          isFullscreen
            ? 'relative flex-1 h-full min-w-0 bg-slate-950 flex items-center justify-center overflow-hidden'
            : 'relative rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl'
        }
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className={
            isFullscreen
              ? 'w-full h-full object-contain block'
              : 'w-full h-auto block aspect-[960/500] max-h-[68vh] object-contain mx-auto'
          }
        />

        {/* Victory / Next Phase Overlay Modal */}
        {levelClearedUI && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-30">
            <div className="max-w-md w-full rounded-2xl bg-slate-900 border-2 border-amber-400 p-5 text-center space-y-3 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400 mx-auto flex items-center justify-center">
                <Award className="w-7 h-7 text-amber-300" />
              </div>
              <div className="text-xs font-mono uppercase tracking-widest text-emerald-300">
                {phaseNumber === 17
                  ? 'GRANDE LINHA DE CHEGADA · CLÍNICA VITTACARE!'
                  : `FASE ${phaseNumber} CONCLUÍDA COM SUCESSO!`}
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                {phaseNumber === 5
                  ? '🏅 Medalha Cuidado na Gestação Conquistada!'
                  : phaseNumber === 10
                  ? '✨ Sombra do Descuido Derrotada!'
                  : phaseNumber === 17
                  ? '🏆 Jornada Concluída na Clínica Vittacare!'
                  : currentPhaseMeta.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentPhaseMeta.educationalTip}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                {phaseNumber < 17 ? (
                  <button
                    type="button"
                    onClick={() => onSelectPhase(phaseNumber + 1)}
                    className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Avançar para Fase {phaseNumber + 1}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenFinale}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Cerimônia Final Vittacare</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => initLevel(phaseNumber)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
                >
                  Jogar Novamente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== HORIZONTAL / FULLSCREEN MODE: RIGHT JOYPAD COLUMN ==================== */}
      {isFullscreen && (
        <div className="w-[116px] sm:w-[134px] shrink-0 bg-slate-950/95 border-l border-slate-800/90 p-2 flex flex-col items-center justify-between z-30 touch-none select-none">
          {/* Top-Right Exit & Restart */}
          <div className="w-full space-y-1.5">
            <button
              type="button"
              onClick={toggleHorizontalMode}
              className="w-full px-2 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer shadow"
            >
              <Minimize2 className="w-3 h-3 shrink-0" />
              <span>Sair Tela Cheia</span>
            </button>
            <button
              type="button"
              onClick={() => initLevel(phaseNumber)}
              className="w-full px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>Reiniciar</span>
            </button>
          </div>

          {/* Right Thumb Console Action Buttons (Never overlapping canvas!) */}
          <div className="w-full space-y-2 my-auto">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleJump();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 active:translate-y-0.5 border-b-4 border-amber-700 text-slate-950 font-extrabold text-xs shadow-lg flex flex-col items-center justify-center cursor-pointer touch-none"
            >
              <span>▲ PULAR</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleUseSkill();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-500 active:translate-y-0.5 border-b-4 border-teal-800 text-slate-950 font-extrabold text-xs shadow-lg flex flex-col items-center justify-center cursor-pointer touch-none"
            >
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> PODER
              </span>
              <span className="text-[9px] font-mono opacity-85 truncate max-w-[96px]">
                {activeNurse.skillName}
              </span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleSwitchNurse(activeNurseIndex + 1);
              }}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 active:translate-y-0.5 border-b-4 border-indigo-900 text-white font-bold text-[11px] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer touch-none"
            >
              <PixelNurseAvatar
                nurseId={activeNurse.id}
                skinId={characterSkins[activeNurse.id]}
                golden={goldenSkinEquipped}
                size={20}
              />
              <span>TROCAR</span>
            </button>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center truncate w-full">
            {activeNurse.name}
          </div>
        </div>
      )}

      {/* ==================== NORMAL MODE BOTTOM CONTROL DOCK (Outside Canvas) ==================== */}
      {!isFullscreen && (
        <div className="rounded-2xl bg-slate-900/95 border border-slate-800 px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 touch-none select-none">
          {/* Left: Virtual Analog Joystick + Direct Touch Buttons */}
          <div className="flex items-center gap-2.5">
            <div
              onPointerDown={handleJoystickStart}
              onPointerMove={handleJoystickMove}
              onPointerUp={handleJoystickEnd}
              onPointerCancel={handleJoystickEnd}
              className="relative w-16 h-16 rounded-full bg-slate-950 border-2 border-emerald-500/60 shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
            >
              <div className="absolute inset-1.5 rounded-full border border-slate-800 pointer-events-none" />
              <div
                style={{
                  transform: `translate(${joystickVec.x * 18}px, ${joystickVec.y * 18}px)`,
                }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 border-2 border-white shadow-lg pointer-events-none flex items-center justify-center"
              >
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  gameRef.current.keys.left = true;
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  gameRef.current.keys.left = false;
                }}
                onPointerLeave={() => {
                  gameRef.current.keys.left = false;
                }}
                className="w-11 h-11 text-base rounded-xl bg-slate-800 active:bg-emerald-500 active:text-slate-950 border-b-4 border-slate-950 text-white font-bold flex items-center justify-center cursor-pointer touch-none"
              >
                ◀
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleJump();
                }}
                className="w-11 h-11 text-base rounded-xl bg-slate-800 active:bg-amber-400 active:text-slate-950 border-b-4 border-slate-950 text-amber-300 font-bold flex items-center justify-center cursor-pointer touch-none"
              >
                ▲
              </button>
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  gameRef.current.keys.right = true;
                }}
                onPointerUp={(e) => {
                  e.preventDefault();
                  gameRef.current.keys.right = false;
                }}
                onPointerLeave={() => {
                  gameRef.current.keys.right = false;
                }}
                className="w-11 h-11 text-base rounded-xl bg-slate-800 active:bg-emerald-500 active:text-slate-950 border-b-4 border-slate-950 text-white font-bold flex items-center justify-center cursor-pointer touch-none"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Center: Compact Active Nurse Info */}
          <div className="flex-1 min-w-[200px] rounded-xl bg-slate-950/90 border border-slate-800 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300">
                {activeNurse.name} · {activeNurse.skillName}
              </span>
              <span className="text-[11px] font-mono text-amber-300">
                Meta: {collectedUI}/{requiredUI}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 truncate">
              🎯 {objectiveTextUI}
            </p>
          </div>

          {/* Right: 3D Console Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleJump();
              }}
              className="px-3.5 py-2.5 min-w-[72px] rounded-2xl bg-gradient-to-b from-amber-400 to-amber-500 active:translate-y-0.5 border-b-4 border-amber-700 text-slate-950 font-bold text-xs shadow-lg flex flex-col items-center cursor-pointer touch-none"
            >
              <span>PULAR</span>
              <span className="text-[10px] font-mono opacity-80">(Espaço)</span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleUseSkill();
              }}
              className="px-3.5 py-2.5 min-w-[96px] rounded-2xl bg-gradient-to-b from-emerald-400 to-teal-500 active:translate-y-0.5 border-b-4 border-teal-800 text-slate-950 font-bold text-xs shadow-lg flex flex-col items-center cursor-pointer touch-none"
            >
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> PODER
              </span>
              <span className="text-[10px] font-mono opacity-80 truncate max-w-[88px]">
                {activeNurse.skillName}
              </span>
            </button>

            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                handleSwitchNurse(activeNurseIndex + 1);
              }}
              className="px-3 py-2.5 min-w-[70px] rounded-2xl bg-gradient-to-b from-indigo-500 to-indigo-600 active:translate-y-0.5 border-b-4 border-indigo-900 text-white font-bold text-xs shadow-lg flex flex-col items-center cursor-pointer touch-none"
            >
              <span>TROCAR</span>
              <span className="text-[10px] font-mono opacity-80">(Tab)</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
