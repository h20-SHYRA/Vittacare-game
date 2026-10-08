import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Trophy,
  RotateCcw,
  ChevronRight,
  ArrowUp,
  Zap,
  Sun,
  Gauge,
  Building2,
  Maximize2,
  Minimize2,
  Users,
} from 'lucide-react';
import {
  CAMPAIGN_PHASES,
  NURSES,
  PHASE5_EDUCATIONAL_MESSAGES,
  CharacterId,
} from '../data/gameData';
import { soundFX } from '../utils/sound';
import {
  drawPixelNurse,
  drawPixelEnemy,
  drawPixelBoss,
  drawPixelClinicaVittacare,
} from '../utils/pixelArt';
import { PixelNurseAvatar } from './PixelNurseAvatar';

interface MarioPlatformerGameProps {
  phaseNumber: number;
  goldenSkinEquipped: boolean;
  selectedCharacterIdx: number;
  onSelectCharacterIdx: (idx: number) => void;
  onPhaseComplete: (phaseNum: number) => void;
  onSelectPhase: (phaseNum: number) => void;
  onOpenFinale: () => void;
  onToggleGoldenSkin: () => void;
}

type DifficultyTier = 'NORMAL' | 'HARD' | 'EXPERT';

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'brick' | 'moving' | 'cloud';
  vx?: number;
  minX?: number;
  maxX?: number;
}

interface QuestionBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hit: boolean;
  bounceY: number;
  itemSymbol: string;
  itemLabel: string;
  eduText: string;
  isTrueInfo?: boolean;
}

interface Collectible {
  id: string;
  x: number;
  y: number;
  vy: number;
  symbol: string;
  label: string;
  collected: boolean;
  floatPhase: number;
}

interface ShadowEnemy {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  minX: number;
  maxX: number;
  alive: boolean;
  type: 'walker' | 'jumper' | 'wave' | 'fragment' | 'meteor';
  label?: string;
  jumpTimer?: number;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  nurseId: string;
  radius: number;
}

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface HealthPedestal {
  id: string;
  x: number;
  y: number;
  label: string;
  nurseName: string;
  color: string;
  hp: number;
  shieldedTimer: number;
}

const CANVAS_W = 1080;
const CANVAS_H = 480;
const GRAVITY = 0.58;

export const MarioPlatformerGame: React.FC<MarioPlatformerGameProps> = ({
  phaseNumber,
  goldenSkinEquipped,
  selectedCharacterIdx,
  onSelectCharacterIdx,
  onPhaseComplete,
  onSelectPhase,
  onOpenFinale,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);

  const currentPhaseData =
    CAMPAIGN_PHASES.find((p) => p.phaseNumber === phaseNumber) || CAMPAIGN_PHASES[0];

  const isBoss5 = phaseNumber === 5;
  const isBoss10 = phaseNumber === 10;
  const isBossStage = isBoss5 || isBoss10;

  const [difficultyTier, setDifficultyTier] = useState<DifficultyTier>('NORMAL');
  const [activeNurseIndex, setActiveNurseIndex] = useState<number>(selectedCharacterIdx);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(100);
  const [boss10Stage, setBoss10Stage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [stageProgressText, setStageProgressText] = useState<string>('');
  const [eduBannerText, setEduBannerText] = useState<string>(currentPhaseData.educationalTip);
  const [victoryState, setVictoryState] = useState<boolean>(false);
  const [walkingToClinic, setWalkingToClinic] = useState<boolean>(false);
  const [distanceToGoalMeters, setDistanceToGoalMeters] = useState<number>(100);
  const [isFullscreenLandscape, setIsFullscreenLandscape] = useState<boolean>(false);

  // Virtual Analog Joystick UI State
  const [joyPos, setJoyPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [joyActive, setJoyActive] = useState<boolean>(false);
  const joyJumpTriggeredRef = useRef<boolean>(false);

  const getDifficultyMultiplier = useCallback(
    (phaseNum: number, tier: DifficultyTier) => {
      const phaseScale = 1 + (phaseNum - 1) * 0.11;
      const tierScale = tier === 'NORMAL' ? 1.0 : tier === 'HARD' ? 1.3 : 1.6;
      return phaseScale * tierScale;
    },
    []
  );

  const gameRef = useRef<{
    keys: Record<string, boolean>;
    joyX: number; // -1 to 1 from virtual analog joystick
    activeNurseIdx: number;
    goldenSkin: boolean;
    diffMult: number;
    player: {
      x: number;
      y: number;
      w: number;
      h: number;
      vx: number;
      vy: number;
      facing: 1 | -1;
      onGround: boolean;
      jumpsLeft: number;
      invulnTimer: number;
      slowTimer: number;
      shieldTimer: number;
      animFrame: number;
      hp: number;
    };
    cameraX: number;
    levelWidth: number;
    arenaLockWidth: number;
    platforms: Platform[];
    qBlocks: QuestionBlock[];
    collectibles: Collectible[];
    enemies: ShadowEnemy[];
    projectiles: Projectile[];
    floatingTexts: FloatingText[];
    pedestals: HealthPedestal[];
    unionOrbs: { id: string; x: number; y: number; nurseIdx: number; activated: boolean }[];
    boss: {
      x: number;
      y: number;
      w: number;
      h: number;
      hp: number;
      maxHp: number;
      vx: number;
      vy: number;
      attackTimer: number;
      hitFlash: number;
      stage10: 1 | 2 | 3 | 4 | 5;
      stage1Hits: number;
      stage2Collected: number;
      stage3Timer: number;
      defeated: boolean;
    };
    goalX: number;
    clinicX: number;
    itemsCollected: number;
    score: number;
    skillCd: number;
    victory: boolean;
    finaleWalkMode: boolean;
    clinicDoorOpen: number;
  }>({
    keys: {},
    joyX: 0,
    activeNurseIdx: 0,
    goldenSkin: goldenSkinEquipped,
    diffMult: 1,
    player: {
      x: 80,
      y: 340,
      w: 50,
      h: 70,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      jumpsLeft: 2,
      invulnTimer: 0,
      slowTimer: 0,
      shieldTimer: 0,
      animFrame: 0,
      hp: 100,
    },
    cameraX: 0,
    levelWidth: 2400,
    arenaLockWidth: 1080,
    platforms: [],
    qBlocks: [],
    collectibles: [],
    enemies: [],
    projectiles: [],
    floatingTexts: [],
    pedestals: [],
    unionOrbs: [],
    boss: {
      x: 760,
      y: 130,
      w: 168,
      h: 180,
      hp: 100,
      maxHp: 100,
      vx: 1.8,
      vy: 0,
      attackTimer: 80,
      hitFlash: 0,
      stage10: 1,
      stage1Hits: 0,
      stage2Collected: 0,
      stage3Timer: 0,
      defeated: false,
    },
    goalX: 2200,
    clinicX: 2040,
    itemsCollected: 0,
    score: 0,
    skillCd: 0,
    victory: false,
    finaleWalkMode: false,
    clinicDoorOpen: 0,
  });

  useEffect(() => {
    gameRef.current.goldenSkin = goldenSkinEquipped;
  }, [goldenSkinEquipped]);

  useEffect(() => {
    gameRef.current.activeNurseIdx = selectedCharacterIdx;
    setActiveNurseIndex(selectedCharacterIdx);
  }, [selectedCharacterIdx]);

  // Toggle Fullscreen Horizontal Mode (Mobile & Desktop)
  const handleToggleFullscreen = async () => {
    try {
      if (!isFullscreenLandscape) {
        setIsFullscreenLandscape(true);
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        const scr = window.screen as unknown as {
          orientation?: { lock?: (mode: string) => Promise<void> };
        };
        if (scr?.orientation?.lock) {
          await scr.orientation.lock('landscape').catch(() => {});
        }
      } else {
        setIsFullscreenLandscape(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      setIsFullscreenLandscape((prev) => !prev);
    }
  };

  const initLevel = useCallback(
    (phaseNum: number, tier: DifficultyTier) => {
      const g = gameRef.current;
      const mult = getDifficultyMultiplier(phaseNum, tier);
      g.diffMult = mult;
      g.victory = false;
      g.finaleWalkMode = false;
      g.clinicDoorOpen = 0;
      g.itemsCollected = 0;
      g.projectiles = [];
      g.floatingTexts = [];
      g.enemies = [];
      g.collectibles = [];
      g.pedestals = [];
      g.unionOrbs = [];
      g.skillCd = 0;

      g.player = {
        x: 75,
        y: 320,
        w: 50,
        h: 70,
        vx: 0,
        vy: 0,
        facing: 1,
        onGround: false,
        jumpsLeft: 2,
        invulnTimer: 0,
        slowTimer: 0,
        shieldTimer: 0,
        animFrame: 0,
        hp: 100,
      };
      g.cameraX = 0;

      setVictoryState(false);
      setWalkingToClinic(false);
      setPlayerHp(100);
      setItemsCount(0);
      setBossHp(100);
      setBoss10Stage(1);

      if (phaseNum === 5) {
        g.levelWidth = 1850;
        g.arenaLockWidth = 1080;
        g.goalX = 1660;
        g.platforms = [
          { x: 0, y: 420, w: 1850, h: 60, type: 'ground' },
          { x: 110, y: 310, w: 165, h: 20, type: 'brick' },
          {
            x: 350,
            y: 235,
            w: 190,
            h: 20,
            type: 'moving',
            vx: 1.6 * mult,
            minX: 290,
            maxX: 540,
          },
          { x: 640, y: 310, w: 160, h: 20, type: 'brick' },
          { x: 170, y: 175, w: 140, h: 18, type: 'cloud' },
          { x: 1180, y: 320, w: 160, h: 20, type: 'brick' },
          { x: 1400, y: 250, w: 160, h: 20, type: 'cloud' },
        ];
        g.qBlocks = [
          {
            id: 'qb-5-1',
            x: 165,
            y: 205,
            w: 44,
            h: 44,
            hit: false,
            bounceY: 0,
            itemSymbol: '🩺',
            itemLabel: 'Monitor de Pressão',
            eduText: '“A pressão arterial deve ser acompanhada durante a gestação.”',
          },
          {
            id: 'qb-5-2',
            x: 420,
            y: 130,
            w: 44,
            h: 44,
            hit: false,
            bounceY: 0,
            itemSymbol: '📋',
            itemLabel: 'Caderneta da Gestante',
            eduText: '“O acompanhamento pré-natal é importante.”',
          },
          {
            id: 'qb-5-3',
            x: 695,
            y: 205,
            w: 44,
            h: 44,
            hit: false,
            bounceY: 0,
            itemSymbol: '💚',
            itemLabel: 'Consulta Pré-Natal',
            eduText: '“O acompanhamento pré-natal é importante.”',
          },
        ];
        g.collectibles = [
          { id: 'c-5-1', x: 210, y: 265, vy: 0, symbol: '🩺', label: 'Aferição Regular', collected: false, floatPhase: 0 },
          { id: 'c-5-2', x: 450, y: 190, vy: 0, symbol: '💧', label: 'Hidratação Materna', collected: false, floatPhase: 1.5 },
          { id: 'c-5-3', x: 710, y: 265, vy: 0, symbol: '📋', label: 'Exame Pré-Natal', collected: false, floatPhase: 3 },
        ];
        g.boss = {
          x: 780,
          y: 135,
          w: 168,
          h: 180,
          hp: 100,
          maxHp: 100,
          vx: -1.5 * mult,
          vy: 0,
          attackTimer: Math.max(45, Math.round(85 / mult)),
          hitFlash: 0,
          stage10: 1,
          stage1Hits: 0,
          stage2Collected: 0,
          stage3Timer: 0,
          defeated: false,
        };
        setEduBannerText('“O acompanhamento pré-natal é importante.”');
        setStageProgressText(
          'FASE 5 (CHEFÃO): Use o Joystick para correr, pular as Serpentes de Onda e derrotar a Sombra da Pressão!'
        );
      } else if (phaseNum === 10) {
        g.levelWidth = 2480;
        g.arenaLockWidth = 1080;
        g.clinicX = 2060;
        g.goalX = 2165;

        g.platforms = [
          { x: 0, y: 420, w: 2480, h: 60, type: 'ground' },
          { x: 85, y: 315, w: 160, h: 20, type: 'brick' },
          {
            x: 320,
            y: 245,
            w: 195,
            h: 20,
            type: 'moving',
            vx: 1.9 * mult,
            minX: 250,
            maxX: 520,
          },
          { x: 610, y: 315, w: 160, h: 20, type: 'brick' },
          { x: 190, y: 170, w: 145, h: 18, type: 'cloud' },
          { x: 540, y: 170, w: 145, h: 18, type: 'cloud' },
          { x: 1220, y: 325, w: 150, h: 20, type: 'cloud' },
          { x: 1450, y: 265, w: 160, h: 20, type: 'cloud' },
          { x: 1690, y: 325, w: 150, h: 20, type: 'cloud' },
        ];

        g.qBlocks = [
          {
            id: 'qb-10-1',
            x: 140,
            y: 210,
            w: 46,
            h: 46,
            hit: false,
            bounceY: 0,
            itemSymbol: '💡',
            itemLabel: 'Exames em Dia',
            eduText: '“Informação também é cuidado.”',
            isTrueInfo: true,
          },
          {
            id: 'qb-10-2',
            x: 295,
            y: 135,
            w: 46,
            h: 46,
            hit: false,
            bounceY: 0,
            itemSymbol: '⚠️',
            itemLabel: 'Mito Descartado',
            eduText: 'Mito superado! Procure sempre orientação profissional.',
            isTrueInfo: false,
          },
          {
            id: 'qb-10-3',
            x: 445,
            y: 135,
            w: 46,
            h: 46,
            hit: false,
            bounceY: 0,
            itemSymbol: '📚',
            itemLabel: 'Orientação Segura',
            eduText: '“Prevenção faz parte da saúde.”',
            isTrueInfo: true,
          },
          {
            id: 'qb-10-4',
            x: 660,
            y: 210,
            w: 46,
            h: 46,
            hit: false,
            bounceY: 0,
            itemSymbol: '🩺',
            itemLabel: 'Autonomia Feminina',
            eduText: '“Não deixe seus cuidados para depois.”',
            isTrueInfo: true,
          },
        ];

        g.boss = {
          x: 785,
          y: 130,
          w: 168,
          h: 180,
          hp: 100,
          maxHp: 100,
          vx: -1.6 * mult,
          vy: 0,
          attackTimer: Math.max(40, Math.round(75 / mult)),
          hitFlash: 0,
          stage10: 1,
          stage1Hits: 0,
          stage2Collected: 0,
          stage3Timer: 0,
          defeated: false,
        };
        setEduBannerText('“Informação também é cuidado.”');
        setStageProgressText(
          'FASE 10 — ETAPA 1 (INFORMAÇÃO): Pule por baixo dos 3 Blocos Dourados [?] de Informação Verdadeira ou atire!'
        );
      } else {
        const courseLength = 2100 + phaseNum * 160;
        g.levelWidth = courseLength;
        g.arenaLockWidth = courseLength;
        g.goalX = courseLength - 210;

        const gapWidth = Math.min(135, 65 + phaseNum * 7);
        const segW = Math.floor((courseLength - 500) / 3);

        g.platforms = [
          { x: 0, y: 420, w: segW, h: 60, type: 'ground' },
          { x: segW + gapWidth, y: 420, w: segW, h: 60, type: 'ground' },
          { x: (segW + gapWidth) * 2, y: 420, w: courseLength - (segW + gapWidth) * 2, h: 60, type: 'ground' },
        ];

        const numFloating = 6 + Math.floor(phaseNum / 2);
        for (let i = 0; i < numFloating; i++) {
          const px = 220 + i * Math.floor((courseLength - 520) / numFloating);
          const py = i % 2 === 0 ? 315 : 235;
          const platW = Math.max(115, 180 - phaseNum * 6);
          const isMoving = i % 2 === 1 || phaseNum >= 6;

          g.platforms.push({
            x: px,
            y: py,
            w: platW,
            h: 20,
            type: isMoving ? 'moving' : i % 3 === 0 ? 'brick' : 'cloud',
            vx: isMoving ? (1.2 + phaseNum * 0.18) * (tier === 'NORMAL' ? 1 : 1.3) : 0,
            minX: px - 70,
            maxX: px + platW + 70,
          });
        }

        const careSymbols = [
          { s: '🩺', l: 'Pressão em Dia', t: '“A pressão arterial deve ser acompanhada durante a gestação.”' },
          { s: '📋', l: 'Caderneta Pré-Natal', t: '“O acompanhamento pré-natal é importante.”' },
          { s: '🔬', l: 'Exame Preventivo', t: '“Prevenção faz parte da saúde.”' },
          { s: '💉', l: 'Vacina Atualizada', t: '“Informação também é cuidado.”' },
          { s: '💚', l: 'Autocuidado Hoje', t: '“Não deixe seus cuidados para depois.”' },
        ];

        g.qBlocks = [0, 1, 2, 3].map((idx) => {
          const item = careSymbols[(phaseNum + idx) % careSymbols.length];
          const qx = 280 + idx * Math.floor((courseLength - 650) / 4);
          return {
            id: `qb-${phaseNum}-${idx}`,
            x: qx,
            y: idx % 2 === 0 ? 205 : 140,
            w: 44,
            h: 44,
            hit: false,
            bounceY: 0,
            itemSymbol: item.s,
            itemLabel: item.l,
            eduText: item.t,
          };
        });

        g.collectibles = Array.from({ length: 7 }).map((_, idx) => {
          const item = careSymbols[idx % careSymbols.length];
          return {
            id: `col-${phaseNum}-${idx}`,
            x: 240 + idx * Math.floor((courseLength - 500) / 7),
            y: idx % 2 === 0 ? 270 : 190,
            vy: 0,
            symbol: item.s,
            label: item.l,
            collected: false,
            floatPhase: idx * 0.9,
          };
        });

        const enemyCount = 3 + Math.floor(phaseNum * 0.8);
        const enemyLabels = ['Espectro da Dúvida', 'Gárgula da Pressa', 'Sombra do Adiamento', 'Inércia', 'Mito', 'Tensão'];
        g.enemies = Array.from({ length: enemyCount }).map((_, idx) => {
          const ex = 360 + idx * Math.floor((courseLength - 680) / enemyCount);
          const baseSpeed = (1.1 + phaseNum * 0.22) * (tier === 'NORMAL' ? 1 : tier === 'HARD' ? 1.3 : 1.6);
          const isJumper = phaseNum >= 3 && idx % 2 === 1;
          return {
            id: `en-${phaseNum}-${idx}`,
            x: ex,
            y: 376,
            w: 42,
            h: 44,
            vx: (idx % 2 === 0 ? 1 : -1) * baseSpeed,
            vy: 0,
            minX: Math.max(180, ex - 160),
            maxX: Math.min(courseLength - 260, ex + 160),
            alive: true,
            type: isJumper ? 'jumper' : 'walker',
            label: enemyLabels[idx % enemyLabels.length],
            jumpTimer: 40 + (idx * 25) % 60,
          };
        });

        setEduBannerText(currentPhaseData.educationalTip);
        setStageProgressText(
          `Fase ${phaseNum} (Nível ${phaseNum}/10): Derrote os Espectros e Gárgulas em Pixel Art e chegue à bandeira Vittacare!`
        );
      }
    },
    [currentPhaseData.educationalTip, getDifficultyMultiplier]
  );

  const advanceBoss10ToStage = useCallback((nextStage: 2 | 3 | 4 | 5) => {
    const g = gameRef.current;
    g.boss.stage10 = nextStage;
    setBoss10Stage(nextStage);
    soundFX.playBossPurify();

    if (nextStage === 2) {
      g.boss.hp = 75;
      setBossHp(75);
      setEduBannerText('“Prevenção faz parte da saúde.”');
      setStageProgressText(
        'ETAPA 2 — PREVENÇÃO: Pule pelas plataformas para coletar os 6 Itens de Prevenção!'
      );
      g.collectibles = [
        { id: 's2-1', x: 120, y: 265, vy: 0, symbol: '🔬', label: 'Papanicolau', collected: false, floatPhase: 0 },
        { id: 's2-2', x: 240, y: 125, vy: 0, symbol: '🎗️', label: 'Mamografia', collected: false, floatPhase: 1 },
        { id: 's2-3', x: 390, y: 195, vy: 0, symbol: '💉', label: 'Vacinação', collected: false, floatPhase: 2 },
        { id: 's2-4', x: 585, y: 125, vy: 0, symbol: '🩺', label: 'Pressão Arterial', collected: false, floatPhase: 3 },
        { id: 's2-5', x: 650, y: 265, vy: 0, symbol: '📋', label: 'Check-up', collected: false, floatPhase: 4 },
        { id: 's2-6', x: 460, y: 370, vy: 0, symbol: '🌿', label: 'Autocuidado', collected: false, floatPhase: 5 },
      ];
    } else if (nextStage === 3) {
      g.boss.hp = 50;
      setBossHp(50);
      setEduBannerText('“Não deixe seus cuidados para depois.”');
      setStageProgressText(
        'ETAPA 3 — CUIDADO: Proteja os 4 Indicadores de Saúde contra os Golens de Fragmento!'
      );
      g.pedestals = [
        { id: 'ped-1', x: 130, y: 380, label: 'Pré-Natal', nurseName: 'Stephanie', color: '#10b981', hp: 100, shieldedTimer: 0 },
        { id: 'ped-2', x: 290, y: 380, label: 'Pressão Vital', nurseName: 'Marcelo', color: '#0ea5e9', hp: 100, shieldedTimer: 0 },
        { id: 'ped-3', x: 450, y: 380, label: 'Informação', nurseName: 'Bianca', color: '#f59e0b', hp: 100, shieldedTimer: 0 },
        { id: 'ped-4', x: 610, y: 380, label: 'Prevenção', nurseName: 'Leticia', color: '#ec4899', hp: 100, shieldedTimer: 0 },
      ];
      g.boss.stage3Timer = 0;
    } else if (nextStage === 4) {
      g.boss.hp = 25;
      setBossHp(25);
      g.pedestals = [];
      g.enemies = [];
      setEduBannerText('“Informação também é cuidado.” · “Prevenção faz parte da saúde.”');
      setStageProgressText(
        'ETAPA 4 — UNIÃO: Pule nos 4 Cristais de União para derrotar a Sombra do Descuido e abrir a Clínica Vittacare!'
      );
      g.unionOrbs = [
        { id: 'orb-0', x: 145, y: 255, nurseIdx: 0, activated: false },
        { id: 'orb-1', x: 260, y: 120, nurseIdx: 1, activated: false },
        { id: 'orb-2', x: 430, y: 185, nurseIdx: 2, activated: false },
        { id: 'orb-3', x: 600, y: 120, nurseIdx: 3, activated: false },
      ];
    } else if (nextStage === 5) {
      g.boss.hp = 0;
      g.boss.defeated = true;
      g.enemies = [];
      g.unionOrbs = [];
      g.finaleWalkMode = true;
      g.arenaLockWidth = g.levelWidth;
      setBossHp(0);
      setWalkingToClinic(true);
      soundFX.playVictoryFanfare();
      setEduBannerText('SOMBRA DERROTADA! CORRA PARA A DIREITA ATÉ A CLÍNICA VITTACARE! 🏥');
      setStageProgressText(
        'Use o Joystick para correr para a direita pelo caminho iluminado até entrar na Clínica Vittacare!'
      );
      for (let i = 0; i < 6; i++) {
        g.collectibles.push({
          id: `road-heart-${i}`,
          x: 1180 + i * 145,
          y: i % 2 === 0 ? 360 : 280,
          vy: 0,
          symbol: '💚',
          label: 'Cuidado Vittacare',
          collected: false,
          floatPhase: i * 0.7,
        });
      }
    }
  }, []);

  const triggerNurseSkill = useCallback(() => {
    const g = gameRef.current;
    if (g.skillCd > 0) return;

    const charObj = NURSES[g.activeNurseIdx] || NURSES[0];
    soundFX.playNurseSkill(charObj.pitchOffset);
    g.skillCd = 34;

    const p = g.player;
    g.projectiles.push({
      id: `proj-${Date.now()}-${Math.random()}`,
      x: p.facing === 1 ? p.x + p.w : p.x - 10,
      y: p.y + p.h * 0.42,
      vx: p.facing * 10.5,
      vy: 0,
      color: g.goldenSkin ? '#fbbf24' : charObj.baseColor,
      nurseId: charObj.id,
      radius: 10,
    });

    // Group & Character Special Bonuses
    if (charObj.id === 'stephanie' || charObj.group === 'SOCIAS') {
      p.slowTimer = 0;
      p.hp = Math.min(100, p.hp + 12);
      setPlayerHp(p.hp);
    }
    if (charObj.id === 'marcelo' || charObj.id === 'vivian' || charObj.id === 'barbara') {
      p.shieldTimer = 175;
      p.slowTimer = 0;
      g.pedestals.forEach((ped) => {
        ped.shieldedTimer = 175;
      });
    }
    if (charObj.id === 'bianca' || charObj.group === 'MARKETING') {
      // Double wave projectile for Marketing & Bianca
      g.projectiles.push({
        id: `proj-extra-${Date.now()}`,
        x: p.facing === 1 ? p.x + p.w : p.x - 10,
        y: p.y + p.h * 0.25,
        vx: p.facing * 11.2,
        vy: -1.1,
        color: '#fbbf24',
        nurseId: charObj.id,
        radius: 8,
      });
    }
    if (charObj.id === 'leticia' || charObj.id === 'samara') {
      g.collectibles.forEach((c) => {
        if (!c.collected && Math.hypot(c.x - p.x, c.y - p.y) < 300) {
          c.x += (p.x - c.x) * 0.55;
          c.y += (p.y - c.y) * 0.55;
        }
      });
    }

    g.floatingTexts.push({
      id: `ft-sk-${Date.now()}`,
      x: p.x,
      y: p.y - 12,
      text: `${charObj.skillName}!`,
      color: charObj.baseColor,
      life: 0,
      maxLife: 40,
    });
  }, []);

  const handleJumpAction = useCallback(() => {
    const g = gameRef.current;
    if (g.player.jumpsLeft > 0) {
      g.player.vy = -12.6;
      g.player.onGround = false;
      g.player.jumpsLeft -= 1;
      soundFX.playCollect();
    }
  }, []);

  // Virtual Analog Joystick Handlers
  const updateJoystickFromClientXY = useCallback(
    (clientX: number, clientY: number) => {
      const base = joystickBaseRef.current;
      if (!base) return;
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const maxRadius = rect.width * 0.42;

      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const clampedDist = Math.min(dist, maxRadius);
      const angle = Math.atan2(dy, dx);

      const nx = clampedDist * Math.cos(angle);
      const ny = clampedDist * Math.sin(angle);
      setJoyPos({ x: nx, y: ny });

      const normX = nx / maxRadius;
      const normY = ny / maxRadius;

      gameRef.current.joyX = Math.abs(normX) > 0.18 ? normX : 0;

      // Pushing joystick strongly upward triggers Jump!
      if (normY < -0.58 && !joyJumpTriggeredRef.current) {
        joyJumpTriggeredRef.current = true;
        handleJumpAction();
      } else if (normY > -0.3) {
        joyJumpTriggeredRef.current = false;
      }
    },
    [handleJumpAction]
  );

  const resetJoystick = useCallback(() => {
    setJoyActive(false);
    setJoyPos({ x: 0, y: 0 });
    gameRef.current.joyX = 0;
    joyJumpTriggeredRef.current = false;
  }, []);

  useEffect(() => {
    initLevel(phaseNumber, difficultyTier);
  }, [phaseNumber, difficultyTier, initLevel]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      g.keys[e.code] = true;

      if (e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Space') {
        e.preventDefault();
        handleJumpAction();
      } else if (e.code === 'KeyE' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
        e.preventDefault();
        triggerNurseSkill();
      } else if (e.code === 'KeyQ') {
        const next = (g.activeNurseIdx + 1) % NURSES.length;
        g.activeNurseIdx = next;
        setActiveNurseIndex(next);
        soundFX.playCollect();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameRef.current.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleJumpAction, triggerNurseSkill]);

  // Main 60FPS Game Loop & Pixel-Art Renderer
  useEffect(() => {
    let animId: number;
    let frameCount = 0;

    const updateAndDraw = () => {
      frameCount++;
      const g = gameRef.current;
      const p = g.player;
      const boss = g.boss;

      if (g.skillCd > 0) g.skillCd--;
      if (p.invulnTimer > 0) p.invulnTimer--;
      if (p.slowTimer > 0) p.slowTimer--;
      if (p.shieldTimer > 0) p.shieldTimer--;

      for (const plat of g.platforms) {
        if (plat.type === 'moving' && plat.vx && plat.minX !== undefined && plat.maxX !== undefined) {
          plat.x += plat.vx;
          if (plat.x < plat.minX || plat.x + plat.w > plat.maxX) {
            plat.vx = -plat.vx;
          }
        }
      }

      // Horizontal Movement (Keyboard + Virtual Analog Joystick!)
      const keyLeft = g.keys['ArrowLeft'] || g.keys['KeyA'];
      const keyRight = g.keys['ArrowRight'] || g.keys['KeyD'];
      const maxSpeed = p.slowTimer > 0 ? 2.8 : 5.6;

      if (keyLeft || g.joyX < -0.18) {
        const factor = keyLeft ? 1 : Math.abs(g.joyX);
        p.vx = Math.max(p.vx - 0.9, -maxSpeed * factor);
        p.facing = -1;
        p.animFrame += 0.22;
      } else if (keyRight || g.joyX > 0.18) {
        const factor = keyRight ? 1 : Math.abs(g.joyX);
        p.vx = Math.min(p.vx + 0.9, maxSpeed * factor);
        p.facing = 1;
        p.animFrame += 0.22;
      } else {
        p.vx *= 0.78;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
      }

      p.x += p.vx;
      if (p.x < 16) p.x = 16;
      if (p.x + p.w > g.arenaLockWidth - 16) {
        p.x = g.arenaLockWidth - 16 - p.w;
      }

      if (frameCount % 8 === 0) {
        const distPx = Math.max(0, g.goalX - p.x);
        setDistanceToGoalMeters(Math.ceil(distPx / 12));
      }

      const prevBottom = p.y + p.h;
      const prevTop = p.y;
      p.vy += GRAVITY;
      if (p.vy > 13) p.vy = 13;
      p.y += p.vy;
      p.onGround = false;

      for (const plat of g.platforms) {
        const horizOverlap = p.x + p.w - 8 > plat.x && p.x + 8 < plat.x + plat.w;
        if (horizOverlap && p.vy >= 0 && prevBottom <= plat.y + 14 && p.y + p.h >= plat.y) {
          p.y = plat.y - p.h;
          p.vy = 0;
          p.onGround = true;
          p.jumpsLeft = 2;
          if (plat.type === 'moving' && plat.vx) {
            p.x += plat.vx;
          }
        }
      }

      if (p.y > CANVAS_H + 60) {
        p.y = 140;
        p.vy = 0;
        p.x = Math.max(60, p.x - 160);
        p.hp = Math.max(25, p.hp - 10);
        setPlayerHp(p.hp);
      }

      for (const qb of g.qBlocks) {
        if (qb.bounceY < 0) qb.bounceY += 1.5;

        const horizOverlap = p.x + p.w - 6 > qb.x && p.x + 6 < qb.x + qb.w;
        if (horizOverlap && p.vy >= 0 && prevBottom <= qb.y + 12 && p.y + p.h >= qb.y) {
          p.y = qb.y - p.h;
          p.vy = 0;
          p.onGround = true;
          p.jumpsLeft = 2;
        }
        if (horizOverlap && p.vy < 0 && prevTop >= qb.y + qb.h - 12 && p.y <= qb.y + qb.h) {
          p.y = qb.y + qb.h;
          p.vy = 2.5;
          qb.bounceY = -10;

          if (!qb.hit) {
            qb.hit = true;
            soundFX.playCollect();
            setEduBannerText(qb.eduText);

            if (phaseNumber === 10 && g.boss.stage10 === 1) {
              if (qb.isTrueInfo) {
                g.boss.stage1Hits += 1;
                g.boss.hitFlash = 18;
                g.score += 200;
                setScore(g.score);
                g.floatingTexts.push({
                  id: `ft-qb-${Date.now()}`,
                  x: qb.x,
                  y: qb.y - 16,
                  text: `✓ ${qb.itemLabel}! (${g.boss.stage1Hits}/3)`,
                  color: '#34d399',
                  life: 0,
                  maxLife: 60,
                });
                if (g.boss.stage1Hits >= 3) {
                  advanceBoss10ToStage(2);
                }
              } else {
                g.floatingTexts.push({
                  id: `ft-qb-${Date.now()}`,
                  x: qb.x,
                  y: qb.y - 16,
                  text: 'Mito Descartado!',
                  color: '#fbbf24',
                  life: 0,
                  maxLife: 60,
                });
              }
            } else {
              g.collectibles.push({
                id: `pop-${Date.now()}-${Math.random()}`,
                x: qb.x + 8,
                y: qb.y - 36,
                vy: -4,
                symbol: qb.itemSymbol,
                label: qb.itemLabel,
                collected: false,
                floatPhase: 0,
              });
              g.floatingTexts.push({
                id: `ft-qb-${Date.now()}`,
                x: qb.x - 10,
                y: qb.y - 20,
                text: `+${qb.itemLabel}`,
                color: '#fbbf24',
                life: 0,
                maxLife: 55,
              });
            }
          }
        }
      }

      for (const col of g.collectibles) {
        if (col.collected) continue;
        col.floatPhase += 0.08;
        if (col.vy < 0) {
          col.y += col.vy;
          col.vy += 0.25;
        }
        const dist = Math.hypot(p.x + p.w / 2 - (col.x + 14), p.y + p.h / 2 - (col.y + 14));
        if (dist < 44) {
          col.collected = true;
          soundFX.playCollect();
          g.itemsCollected += 1;
          g.score += 150;
          p.hp = Math.min(100, p.hp + 8);
          p.slowTimer = 0;
          setItemsCount(g.itemsCollected);
          setScore(g.score);
          setPlayerHp(p.hp);

          g.floatingTexts.push({
            id: `ft-col-${Date.now()}-${Math.random()}`,
            x: col.x,
            y: col.y - 10,
            text: `+${col.label}!`,
            color: '#34d399',
            life: 0,
            maxLife: 50,
          });

          if (phaseNumber === 5 && !boss.defeated) {
            boss.hp = Math.max(0, boss.hp - 13);
            boss.hitFlash = 16;
            setBossHp(boss.hp);
            setEduBannerText(
              PHASE5_EDUCATIONAL_MESSAGES[g.itemsCollected % PHASE5_EDUCATIONAL_MESSAGES.length]
            );
            setTimeout(() => {
              if (!gameRef.current.boss.defeated && phaseNumber === 5) {
                const spots = [
                  { x: 150, y: 265, s: '🩺', l: 'Monitor de Pressão' },
                  { x: 430, y: 190, s: '📋', l: 'Caderneta Pré-Natal' },
                  { x: 690, y: 265, s: '💚', l: 'Consulta em Dia' },
                  { x: 200, y: 130, s: '💧', l: 'Equilíbrio Materno' },
                ];
                const pick = spots[Math.floor(Math.random() * spots.length)];
                gameRef.current.collectibles.push({
                  id: `respawn-${Date.now()}`,
                  x: pick.x,
                  y: pick.y,
                  vy: -3,
                  symbol: pick.s,
                  label: pick.l,
                  collected: false,
                  floatPhase: 0,
                });
              }
            }, 2200);
          }

          if (phaseNumber === 10 && boss.stage10 === 2) {
            boss.stage2Collected += 1;
            boss.hp = Math.max(50, 75 - boss.stage2Collected * 4);
            boss.hitFlash = 14;
            setBossHp(boss.hp);
            if (boss.stage2Collected >= 6) {
              advanceBoss10ToStage(3);
            }
          }
        }
      }

      for (let i = g.projectiles.length - 1; i >= 0; i--) {
        const proj = g.projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;

        if (phaseNumber === 10 && boss.stage10 === 1) {
          for (const qb of g.qBlocks) {
            if (
              !qb.hit &&
              proj.x > qb.x &&
              proj.x < qb.x + qb.w &&
              proj.y > qb.y &&
              proj.y < qb.y + qb.h
            ) {
              qb.hit = true;
              qb.bounceY = -10;
              g.projectiles.splice(i, 1);
              if (qb.isTrueInfo) {
                soundFX.playCollect();
                boss.stage1Hits += 1;
                boss.hitFlash = 18;
                setEduBannerText(qb.eduText);
                if (boss.stage1Hits >= 3) advanceBoss10ToStage(2);
              }
              break;
            }
          }
        }

        for (const en of g.enemies) {
          if (
            en.alive &&
            proj.x + proj.radius > en.x &&
            proj.x - proj.radius < en.x + en.w &&
            proj.y + proj.radius > en.y &&
            proj.y - proj.radius < en.y + en.h
          ) {
            en.alive = false;
            g.projectiles.splice(i, 1);
            soundFX.playCollect();
            g.score += 100;
            setScore(g.score);
            g.floatingTexts.push({
              id: `ft-en-${Date.now()}-${Math.random()}`,
              x: en.x,
              y: en.y,
              text: 'Purificado!',
              color: '#38bdf8',
              life: 0,
              maxLife: 40,
            });
            break;
          }
        }

        if (
          isBossStage &&
          !boss.defeated &&
          proj.x + proj.radius > boss.x &&
          proj.x - proj.radius < boss.x + boss.w &&
          proj.y + proj.radius > boss.y &&
          proj.y - proj.radius < boss.y + boss.h
        ) {
          g.projectiles.splice(i, 1);
          boss.hitFlash = 12;
          if (phaseNumber === 5) {
            boss.hp = Math.max(0, boss.hp - 7);
            setBossHp(boss.hp);
            g.floatingTexts.push({
              id: `ft-bh-${Date.now()}-${Math.random()}`,
              x: boss.x + 40,
              y: boss.y + 30,
              text: '-7% Sombra',
              color: '#fbbf24',
              life: 0,
              maxLife: 35,
            });
          } else if (phaseNumber === 10) {
            g.floatingTexts.push({
              id: `ft-bh10-${Date.now()}-${Math.random()}`,
              x: boss.x + 40,
              y: boss.y + 30,
              text: `Luz de ${NURSES[g.activeNurseIdx].name}!`,
              color: '#34d399',
              life: 0,
              maxLife: 35,
            });
          }
        }

        if (proj.x < g.cameraX - 60 || proj.x > g.cameraX + CANVAS_W + 60) {
          g.projectiles.splice(i, 1);
        }
      }

      if (isBossStage && !boss.defeated) {
        if (boss.hitFlash > 0) boss.hitFlash--;

        boss.x += boss.vx;
        if (boss.x < 560) boss.vx = Math.abs(boss.vx);
        if (boss.x + boss.w > 1030) boss.vx = -Math.abs(boss.vx);
        boss.y = 135 + Math.sin(frameCount * 0.045) * 28;

        const bossHoriz = p.x + p.w > boss.x + 14 && p.x < boss.x + boss.w - 14;
        if (bossHoriz && p.vy > 0 && prevBottom <= boss.y + 36 && p.y + p.h >= boss.y) {
          p.vy = -12.6;
          p.jumpsLeft = 2;
          boss.hitFlash = 20;
          soundFX.playBossPurify();
          if (phaseNumber === 5) {
            boss.hp = Math.max(0, boss.hp - 16);
            setBossHp(boss.hp);
            g.floatingTexts.push({
              id: `ft-stomp-${Date.now()}`,
              x: boss.x + 30,
              y: boss.y - 10,
              text: 'Super Pulo! -16%',
              color: '#34d399',
              life: 0,
              maxLife: 50,
            });
          }
        }

        boss.attackTimer--;
        if (boss.attackTimer <= 0) {
          const waveSpeed = 3.8 * Math.min(1.6, g.diffMult * 0.75);
          if (phaseNumber === 5) {
            boss.attackTimer = Math.max(48, Math.round(100 / Math.max(1, g.diffMult * 0.7)));
            const isLowWave = Math.random() > 0.35;
            g.enemies.push({
              id: `wave-${Date.now()}`,
              x: boss.x,
              y: isLowWave ? 374 : 270,
              w: 44,
              h: 46,
              vx: -waveSpeed,
              vy: 0,
              minX: -100,
              maxX: 1200,
              alive: true,
              type: 'wave',
              label: 'Serpente de Pressão',
            });
          } else if (phaseNumber === 10) {
            if (boss.stage10 === 3) {
              boss.attackTimer = Math.max(42, Math.round(78 / Math.max(1, g.diffMult * 0.7)));
              const targetPed = g.pedestals[Math.floor(Math.random() * g.pedestals.length)];
              if (targetPed) {
                g.enemies.push({
                  id: `meteor-${Date.now()}`,
                  x: targetPed.x + 5,
                  y: 30,
                  w: 42,
                  h: 45,
                  vx: 0,
                  vy: 2.8,
                  minX: 0,
                  maxX: 1080,
                  alive: true,
                  type: 'meteor',
                  label: 'Golem de Fragmento',
                });
              }
            } else {
              boss.attackTimer = Math.max(55, Math.round(110 / Math.max(1, g.diffMult * 0.7)));
              g.enemies.push({
                id: `frag-${Date.now()}`,
                x: boss.x,
                y: 374,
                w: 42,
                h: 45,
                vx: -waveSpeed,
                vy: 0,
                minX: -100,
                maxX: 1200,
                alive: true,
                type: 'fragment',
                label: 'Espectro Sombrio',
              });
            }
          }
        }

        if (phaseNumber === 10 && boss.stage10 === 3) {
          boss.stage3Timer += 1;
          for (const ped of g.pedestals) {
            if (ped.shieldedTimer > 0) ped.shieldedTimer--;
            if (Math.hypot(p.x - ped.x, p.y - ped.y) < 60) {
              ped.shieldedTimer = 90;
              ped.hp = Math.min(100, ped.hp + 0.5);
            }
          }
          if (boss.stage3Timer >= 400) {
            advanceBoss10ToStage(4);
          }
        }

        if (phaseNumber === 10 && boss.stage10 === 4) {
          let allActive = true;
          for (const orb of g.unionOrbs) {
            if (!orb.activated) {
              allActive = false;
              const dist = Math.hypot(p.x + p.w / 2 - orb.x, p.y + p.h / 2 - orb.y);
              if (dist < 46) {
                orb.activated = true;
                soundFX.playNurseSkill(NURSES[orb.nurseIdx].pitchOffset);
                g.floatingTexts.push({
                  id: `ft-orb-${Date.now()}`,
                  x: orb.x - 20,
                  y: orb.y - 20,
                  text: `✨ ${NURSES[orb.nurseIdx].name} Unido(a)!`,
                  color: '#fbbf24',
                  life: 0,
                  maxLife: 60,
                });
              }
            }
          }
          if (g.unionOrbs.length === 4 && allActive) {
            advanceBoss10ToStage(5);
          }
        }

        if (phaseNumber === 5 && boss.hp <= 0 && !boss.defeated) {
          boss.defeated = true;
          g.enemies = [];
          g.arenaLockWidth = g.levelWidth;
          soundFX.playVictoryFanfare();
          setEduBannerText(
            'SOMBRA DA PRESSÃO DERROTADA! Corra para a direita até o Posto da Medalha Cuidado na Gestação! 🏅'
          );
          setStageProgressText(
            'A energia escura desapareceu e o cenário se iluminou! Avance na horizontal para a direita até a bandeira!'
          );
        }
      }

      for (let i = g.enemies.length - 1; i >= 0; i--) {
        const en = g.enemies[i];
        if (!en.alive) {
          g.enemies.splice(i, 1);
          continue;
        }

        en.x += en.vx;
        en.y += en.vy;

        if (en.type === 'walker' || en.type === 'jumper') {
          if (en.x < en.minX || en.x + en.w > en.maxX) {
            en.vx = -en.vx;
          }
          if (en.type === 'jumper') {
            en.vy += GRAVITY * 0.85;
            if (en.y >= 376) {
              en.y = 376;
              en.vy = 0;
              en.jumpTimer = (en.jumpTimer || 45) - 1;
              if (en.jumpTimer <= 0) {
                en.vy = -9.5;
                en.jumpTimer = 50;
              }
            }
          }
        } else if (en.type === 'meteor') {
          for (const ped of g.pedestals) {
            if (Math.hypot(en.x - ped.x, en.y - ped.y) < 42) {
              en.alive = false;
              if (ped.shieldedTimer <= 0) {
                ped.hp = Math.max(20, ped.hp - 18);
              }
            }
          }
          if (en.y > 420) en.alive = false;
        } else if (en.x < -80) {
          en.alive = false;
        }

        const overlapX = p.x + p.w - 8 > en.x && p.x + 8 < en.x + en.w;
        const overlapY = p.y + p.h > en.y && p.y < en.y + en.h;

        if (overlapX && overlapY) {
          if (p.vy > 0 && prevBottom <= en.y + 24) {
            en.alive = false;
            p.vy = -10.4;
            p.jumpsLeft = 2;
            soundFX.playCollect();
            g.score += 120;
            setScore(g.score);
            g.floatingTexts.push({
              id: `ft-st-${Date.now()}-${Math.random()}`,
              x: en.x,
              y: en.y - 10,
              text: 'Superado! +120',
              color: '#34d399',
              life: 0,
              maxLife: 40,
            });
            if (phaseNumber === 5 && !boss.defeated) {
              boss.hp = Math.max(0, boss.hp - 8);
              setBossHp(boss.hp);
            }
          } else if (p.shieldTimer > 0) {
            en.alive = false;
            soundFX.playCollect();
          } else if (p.invulnTimer <= 0) {
            p.invulnTimer = 50;
            p.slowTimer = 90;
            const dmg = Math.round(7 * Math.min(1.8, g.diffMult * 0.7));
            p.hp = Math.max(15, p.hp - dmg);
            setPlayerHp(p.hp);
            soundFX.playWavePulse();
            g.floatingTexts.push({
              id: `ft-hit-${Date.now()}`,
              x: p.x,
              y: p.y - 15,
              text: en.type === 'wave' ? 'Onda de Pressão! (Lento)' : `Cuidado! -${dmg} HP`,
              color: '#f87171',
              life: 0,
              maxLife: 50,
            });
          }
        }
      }

      if (phaseNumber !== 10 && !g.victory && p.x + p.w >= g.goalX) {
        g.victory = true;
        setVictoryState(true);
        soundFX.playVictoryFanfare();
        onPhaseComplete(phaseNumber);
      }

      if (phaseNumber === 10 && g.finaleWalkMode) {
        if (p.x > 1780) {
          g.clinicDoorOpen = Math.min(1, g.clinicDoorOpen + 0.035);
        }
        if (!g.victory && p.x + p.w / 2 >= g.goalX) {
          g.victory = true;
          setVictoryState(true);
          soundFX.playVictoryFanfare();
          onPhaseComplete(10);
          setEduBannerText('“JORNADA CONCLUÍDA!” · “Cuidar também é prevenir.”');
          setStageProgressText(
            'CHEGADA À CLÍNICA VITTACARE CONCLUÍDA! 🏆 Troféu Guardião Vittacare, 🎖️ Título Herói do Cuidado e 🎁 Skin Especial Desbloqueados!'
          );
        }
      }

      const targetCamX = Math.max(
        0,
        Math.min(g.arenaLockWidth - CANVAS_W, p.x - CANVAS_W * 0.36)
      );
      g.cameraX += (targetCamX - g.cameraX) * 0.14;

      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 0.7;
        ft.life++;
        if (ft.life >= ft.maxLife) {
          g.floatingTexts.splice(i, 1);
        }
      }

      // ========================================================================
      // RENDER PIXEL-ART WORLD ON CANVAS
      // ========================================================================
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = false;
      ctx.save();
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const isIlluminated =
        (phaseNumber === 5 && boss.defeated) ||
        (phaseNumber === 10 && boss.defeated) ||
        (!isBossStage && g.victory);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      if (isIlluminated) {
        skyGrad.addColorStop(0, '#065f46');
        skyGrad.addColorStop(0.55, '#0d9488');
        skyGrad.addColorStop(1, '#fef08a');
      } else if (phaseNumber === 5) {
        skyGrad.addColorStop(0, '#0f172a');
        skyGrad.addColorStop(0.6, '#1e1b4b');
        skyGrad.addColorStop(1, '#311042');
      } else if (phaseNumber === 10) {
        skyGrad.addColorStop(0, '#090d16');
        skyGrad.addColorStop(0.6, '#2e1065');
        skyGrad.addColorStop(1, '#1e1b4b');
      } else {
        skyGrad.addColorStop(0, '#0c4a6e');
        skyGrad.addColorStop(0.65, '#0f766e');
        skyGrad.addColorStop(1, '#134e4a');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      ctx.fillStyle = isIlluminated ? '#fde047' : 'rgba(248, 250, 252, 0.15)';
      ctx.fillRect(CANVAS_W - 140, 44, 52, 52);
      if (isIlluminated) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.3)';
        ctx.fillRect(CANVAS_W - 152, 32, 76, 76);
      }

      ctx.fillStyle = isIlluminated ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < 8; i++) {
        const cx = ((i * 320 - g.cameraX * 0.2) % (CANVAS_W + 320)) - 80;
        const cy = 60 + (i % 3) * 35;
        ctx.fillRect(cx, cy, 64, 18);
        ctx.fillRect(cx + 12, cy - 10, 40, 10);
      }

      ctx.translate(-Math.round(g.cameraX), 0);

      for (const plat of g.platforms) {
        if (plat.type === 'ground') {
          ctx.fillStyle = isIlluminated ? '#065f46' : '#1e293b';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = isIlluminated ? '#34d399' : '#10b981';
          ctx.fillRect(plat.x, plat.y, plat.w, 12);
          ctx.fillStyle = isIlluminated ? '#047857' : '#334155';
          for (let gx = plat.x + 8; gx < plat.x + plat.w - 12; gx += 28) {
            ctx.fillRect(gx, plat.y + 18, 12, 8);
            ctx.fillRect(gx + 14, plat.y + 30, 12, 8);
          }
        } else if (plat.type === 'brick') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 2;
          for (let bx = plat.x; bx < plat.x + plat.w; bx += 24) {
            ctx.strokeRect(bx, plat.y, Math.min(24, plat.x + plat.w - bx), plat.h);
          }
        } else if (plat.type === 'moving') {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = '#7dd3fc';
          ctx.fillRect(plat.x + 4, plat.y + 4, plat.w - 8, 4);
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(plat.x, plat.y + plat.h - 5, plat.w, 5);
        }
      }

      if (isBossStage && !boss.defeated) {
        ctx.fillStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.fillRect(1065, 0, 16, 420);
        ctx.fillStyle = '#e879f9';
        for (let gy = (frameCount * 3) % 32; gy < 420; gy += 32) {
          ctx.fillRect(1069, gy, 8, 16);
        }
      }

      if (phaseNumber === 10) {
        const signs = [
          { x: 1140, text: 'CLÍNICA VITTACARE →' },
          { x: 1560, text: 'CUIDAR É PREVENIR →' },
          { x: 1910, text: 'CHEGADA VITTACARE →' },
        ];
        for (const sg of signs) {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(sg.x + 48, 370, 8, 50);
          ctx.fillStyle = '#047857';
          ctx.fillRect(sg.x, 344, 110, 28);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.strokeRect(sg.x, 344, 110, 28);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(sg.text, sg.x + 55, 361);
        }
      }

      for (const qb of g.qBlocks) {
        const by = qb.y + qb.bounceY;
        ctx.fillStyle = qb.hit ? '#475569' : '#f59e0b';
        ctx.fillRect(qb.x, by, qb.w, qb.h);
        ctx.strokeStyle = qb.hit ? '#94a3b8' : '#fef08a';
        ctx.lineWidth = 3;
        ctx.strokeRect(qb.x, by, qb.w, qb.h);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(qb.x + 4, by + 4, 4, 4);
        ctx.fillRect(qb.x + qb.w - 8, by + 4, 4, 4);
        ctx.fillRect(qb.x + 4, by + qb.h - 8, 4, 4);
        ctx.fillRect(qb.x + qb.w - 8, by + qb.h - 8, 4, 4);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(qb.hit ? '✓' : '?', qb.x + qb.w / 2, by + 29);
      }

      for (const ped of g.pedestals) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(ped.x - 24, ped.y, 48, 40);
        ctx.strokeStyle = ped.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(ped.x - 24, ped.y, 48, 40);

        if (ped.shieldedTimer > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.strokeRect(ped.x - 32, ped.y - 8, 64, 48);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ped.label, ped.x, ped.y - 12);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`${Math.round(ped.hp)}%`, ped.x, ped.y + 24);
      }

      for (const orb of g.unionOrbs) {
        const nurse = NURSES[orb.nurseIdx];
        ctx.fillStyle = orb.activated ? '#fbbf24' : nurse.baseColor;
        ctx.fillRect(orb.x - 22, orb.y - 22, 44, 44);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(orb.x - 22, orb.y - 22, 44, 44);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(orb.activated ? '✓ UNIDO' : nurse.name, orb.x, orb.y + 4);
      }

      for (const col of g.collectibles) {
        if (col.collected) continue;
        const fy = col.y + Math.sin(col.floatPhase) * 5;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fillRect(col.x - 4, fy - 4, 36, 36);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.strokeRect(col.x - 4, fy - 4, 36, 36);

        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(col.symbol, col.x + 14, fy + 21);
      }

      if (phaseNumber !== 10) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(g.goalX, 160, 8, 260);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(g.goalX + 8, 168, 92, 44);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(g.goalX + 8, 168, 92, 44);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          phaseNumber === 5 ? '🏅 MEDALHA' : `FIM FASE ${phaseNumber}`,
          g.goalX + 54,
          194
        );
      } else {
        drawPixelClinicaVittacare(ctx, g.clinicX, 220, g.clinicDoorOpen, frameCount);

        if (g.finaleWalkMode) {
          let waitSlot = 0;
          NURSES.slice(0, 4).forEach((n, idx) => {
            if (n.id === NURSES[g.activeNurseIdx].id) return;
            const wx = g.clinicX - 45 - waitSlot * 48;
            drawPixelNurse(
              ctx,
              wx,
              348,
              n.id,
              -1,
              frameCount * 0.1,
              false,
              g.goldenSkin,
              3
            );
            waitSlot++;
          });
        }
      }

      // Draw Detailed Pixel-Art Boss (Phase 5 & Phase 10)
      if (isBossStage && !boss.defeated) {
        drawPixelBoss(
          ctx,
          boss.x,
          boss.y,
          boss.w,
          boss.h,
          phaseNumber === 5,
          boss.hitFlash,
          boss.stage10,
          frameCount
        );
      }

      // Draw Detailed Pixel-Art Villains (Never simple round blobs!)
      for (const en of g.enemies) {
        if (!en.alive) continue;
        drawPixelEnemy(
          ctx,
          en.x,
          en.y,
          en.type,
          en.vx >= 0 ? 1 : -1,
          frameCount,
          en.label
        );
      }

      for (const proj of g.projectiles) {
        ctx.fillStyle = proj.color;
        ctx.fillRect(proj.x - 8, proj.y - 8, 16, 16);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(proj.x - 8, proj.y - 8, 16, 16);
      }

      // Draw ONLY the Single Active Character
      const activeChar = NURSES[g.activeNurseIdx] || NURSES[0];
      const isBlinking = p.invulnTimer > 0 && Math.floor(p.invulnTimer / 4) % 2 === 0;

      if (!isBlinking) {
        if (p.shieldTimer > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.strokeRect(p.x - 6, p.y - 6, p.w + 12, p.h + 12);
        }

        drawPixelNurse(
          ctx,
          p.x,
          p.y,
          activeChar.id,
          p.facing,
          p.animFrame,
          !p.onGround,
          g.goldenSkin,
          3
        );
      }

      ctx.fillStyle = g.goldenSkin ? '#fde047' : '#ffffff';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(activeChar.name, p.x + p.w / 2, p.y - 10);

      for (const ft of g.floatingTexts) {
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x + 20, ft.y);
      }

      ctx.restore();

      animId = requestAnimationFrame(updateAndDraw);
    };

    animId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animId);
  }, [phaseNumber, isBossStage, advanceBoss10ToStage, onPhaseComplete]);

  const handleSwitchNurse = (idx: number) => {
    gameRef.current.activeNurseIdx = idx;
    setActiveNurseIndex(idx);
    onSelectCharacterIdx(idx);
    soundFX.playCollect();
  };

  const handleCycleNextNurse = () => {
    const next = (activeNurseIndex + 1) % NURSES.length;
    handleSwitchNurse(next);
  };

  const activeNurseObj = NURSES[activeNurseIndex] || NURSES[0];

  return (
    <div
      ref={containerRef}
      className={
        isFullscreenLandscape
          ? 'fixed inset-0 z-50 w-screen h-screen bg-slate-950 flex flex-col justify-between overflow-hidden select-none'
          : 'max-w-[1280px] mx-auto px-3 sm:px-6 py-3 space-y-4 select-none'
      }
    >
      {/* Top Compact Bar (Visible in Normal Mode, or slim overlay in Fullscreen Mobile) */}
      {!isFullscreenLandscape && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-300 font-medium">
              <span>Fase {phaseNumber} de 10 (Horizontal)</span>
              <span aria-hidden="true">·</span>
              <span>Dificuldade Nível {phaseNumber}/10</span>
              <span aria-hidden="true">·</span>
              <span>
                Personagem: {activeNurseObj.name} ({activeNurseObj.groupLabel})
              </span>
            </div>
            <p className="text-sm sm:text-lg font-display font-bold text-amber-300">
              {eduBannerText}
            </p>
            <p className="text-xs text-slate-300">{stageProgressText}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums shrink-0">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <Gauge className="w-3.5 h-3.5 text-amber-400 ml-2 mr-1" />
              {(
                [
                  { id: 'NORMAL', label: 'Normal' },
                  { id: 'HARD', label: 'Difícil' },
                  { id: 'EXPERT', label: 'Mestre' },
                ] as { id: DifficultyTier; label: string }[]
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficultyTier(d.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition-colors ${
                    difficultyTier === d.id
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">SAÚDE</span>
              <span className="text-sm font-bold text-emerald-400">{playerHp}/100</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">
                {phaseNumber === 10 ? 'CLÍNICA' : 'META'}
              </span>
              <span className="text-sm font-bold text-sky-300">{distanceToGoalMeters}m →</span>
            </div>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-sans font-bold flex items-center gap-1.5 whitespace-nowrap shadow-md"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Tela Cheia Horizontal (Celular)</span>
            </button>

            <button
              type="button"
              onClick={() => initLevel(phaseNumber, difficultyTier)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-semibold flex items-center gap-1.5 whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reiniciar</span>
            </button>
          </div>
        </div>
      )}

      {/* Victory Celebration Modal / Banner */}
      {victoryState && (
        <div
          className={`${
            isFullscreenLandscape
              ? 'absolute top-14 left-4 right-4 z-40'
              : ''
          } rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-emerald-950/95 via-teal-900/95 to-amber-950/95 p-5 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-4`}
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sun className="w-4 h-4" />
              <span>
                {isBoss5
                  ? 'ENERGIA ESCURA DISSIPADA · 🏅 MEDALHA CUIDADO NA GESTAÇÃO'
                  : isBoss10
                  ? '🏥 CHEGADA À CLÍNICA VITTACARE · “JORNADA CONCLUÍDA!” · “Cuidar também é prevenir.”'
                  : `FASE ${phaseNumber} CONCLUÍDA!`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              {isBoss5 && 'Você derrotou a Sombra da Pressão e alcançou a Meta!'}
              {isBoss10 && 'Você chegou à Clínica Vittacare! Jornada Concluída!'}
              {!isBossStage && `Fase ${phaseNumber} Superada com ${activeNurseObj.name}!`}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isBoss10 ? (
              <button
                type="button"
                onClick={() => {
                  setIsFullscreenLandscape(false);
                  onOpenFinale();
                }}
                className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 whitespace-nowrap shadow-lg"
              >
                <Trophy className="w-4 h-4" />
                <span>Ver Cerimônia Final na Clínica Vittacare</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectPhase(Math.min(10, phaseNumber + 1))}
                className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center gap-2 whitespace-nowrap shadow-lg"
              >
                <span>Avançar para Fase {Math.min(10, phaseNumber + 1)}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Horizontal Game Canvas + Overlay Virtual Analog Joystick & Console Arcade Buttons */}
      <div
        className={`relative overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl ${
          isFullscreenLandscape ? 'flex-1 w-full h-full flex flex-col justify-between' : 'rounded-2xl'
        }`}
      >
        {/* Top Floating HUD inside Fullscreen Landscape Mode */}
        {isFullscreenLandscape && (
          <div className="absolute top-2 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-xs flex items-center gap-3 pointer-events-auto">
              <span className="font-bold text-emerald-300">Fase {phaseNumber}/10</span>
              <span className="font-mono text-white">HP: {playerHp}</span>
              <span className="font-mono text-sky-300">Meta: {distanceToGoalMeters}m →</span>
              {isBossStage && (
                <span className="font-mono text-amber-300">Chefão: {bossHp}%</span>
              )}
            </div>

            <div className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-400/40 text-xs font-display font-semibold text-amber-300 truncate max-w-md hidden sm:block">
              {eduBannerText}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => initLevel(phaseNumber, difficultyTier)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-white flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Sair Tela Cheia</span>
              </button>
            </div>
          </div>
        )}

        {/* Pixel-Art Horizontal Canvas */}
        <div className={isFullscreenLandscape ? 'flex-1 flex items-center justify-center bg-slate-950 overflow-hidden' : ''}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ imageRendering: 'pixelated' }}
            className={
              isFullscreenLandscape
                ? 'w-full h-full object-contain block'
                : 'w-full h-auto block'
            }
          />
        </div>

        {/* ====================================================================
            VIRTUAL ANALOG JOYSTICK + SLEEK 3D ARCADE BUTTONS BAR
            (Overlay in Fullscreen Landscape, or docked console deck in regular view)
            ==================================================================== */}
        <div
          className={
            isFullscreenLandscape
              ? 'absolute inset-x-0 bottom-2 z-30 px-5 pointer-events-none flex items-end justify-between'
              : 'bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/90 p-4 flex flex-col lg:flex-row items-center justify-between gap-5'
          }
        >
          {/* LEFT: Interactive Virtual Analog Joystick (Cursor em Joystick) */}
          <div className="flex items-center gap-4 pointer-events-auto">
            <div
              ref={joystickBaseRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setJoyActive(true);
                updateJoystickFromClientXY(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (!joyActive) return;
                updateJoystickFromClientXY(e.clientX, e.clientY);
              }}
              onPointerUp={resetJoystick}
              onPointerCancel={resetJoystick}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-slate-800/90 via-slate-900/95 to-slate-950 border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing"
            >
              {/* Outer directional ticks */}
              <span className="absolute top-1.5 text-[9px] font-mono text-emerald-300/70">▲ PULO</span>
              <span className="absolute bottom-1.5 text-[9px] font-mono text-slate-500">▼</span>
              <span className="absolute left-2 text-[10px] font-mono text-emerald-300/80">◀</span>
              <span className="absolute right-2 text-[10px] font-mono text-emerald-300/80">▶</span>

              {/* Inner ring */}
              <div className="w-16 h-16 rounded-full border border-slate-700/80 bg-slate-950/60" />

              {/* Draggable Thumbstick Knob */}
              <div
                style={{
                  transform: `translate(${joyPos.x}px, ${joyPos.y}px)`,
                }}
                className={`absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 border-2 border-white/80 shadow-[0_4px_15px_rgba(16,185,129,0.6)] flex items-center justify-center transition-transform ${
                  joyActive ? 'duration-0 scale-105' : 'duration-150'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white/30 blur-[1px]" />
              </div>
            </div>

            {!isFullscreenLandscape && (
              <div className="hidden sm:block text-xs text-slate-400 space-y-0.5 max-w-[170px]">
                <div className="font-bold text-white">Joystick Analógico</div>
                <p className="text-[11px] leading-snug">
                  Arraste o cursor para correr na horizontal ou para cima para pular!
                </p>
              </div>
            )}
          </div>

          {/* CENTER: All 10 Playable Characters Selector (Hidden in Fullscreen to keep view clean, replaced by quick switch button) */}
          {!isFullscreenLandscape && (
            <div className="flex-1 max-w-2xl">
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 text-center">
                Escolha seu Personagem em Pixel Art (1 por vez · Enfermagem, Marketing Empresarial & Sócias Elegantes):
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 justify-start sm:justify-center">
                {NURSES.map((char, idx) => {
                  const isSelected = activeNurseIndex === idx;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => handleSwitchNurse(idx)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap border shrink-0 ${
                        isSelected
                          ? 'bg-emerald-950/90 border-emerald-400 text-white shadow-md scale-105'
                          : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <PixelNurseAvatar
                        nurseId={char.id as CharacterId}
                        goldenSkin={goldenSkinEquipped}
                        scale={1.4}
                        animate={isSelected}
                      />
                      <div className="text-left">
                        <div className="font-bold text-[11px] leading-tight">{char.name}</div>
                        <div className="text-[9px] text-emerald-300 leading-tight">
                          {char.skillName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* RIGHT: Sleek 3D Tactile Console Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 pointer-events-auto">
            {/* Switch Character Arcade Button */}
            <button
              type="button"
              onClick={handleCycleNextNurse}
              className="group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 active:translate-y-1 border-2 border-indigo-200/80 shadow-[0_5px_0_#1e1b4b,0_8px_20px_rgba(99,102,241,0.45)] flex flex-col items-center justify-center text-white transition-all"
            >
              <Users className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold tracking-tight uppercase">Trocar</span>
            </button>

            {/* Special Power B-Button */}
            <button
              type="button"
              onClick={triggerNurseSkill}
              className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 hover:from-amber-300 hover:to-orange-500 active:translate-y-1 border-2 border-amber-100 shadow-[0_6px_0_#78350f,0_10px_24px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center text-slate-950 transition-all"
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
              <span className="text-[10px] font-extrabold tracking-tight uppercase">Poder</span>
            </button>

            {/* Jump / Double Jump A-Button */}
            <button
              type="button"
              onClick={handleJumpAction}
              className="group relative w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-700 hover:from-emerald-300 hover:to-teal-600 active:translate-y-1 border-2 border-emerald-100 shadow-[0_6px_0_#064e3b,0_10px_28px_rgba(16,185,129,0.55)] flex flex-col items-center justify-center text-slate-950 transition-all"
            >
              <ArrowUp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              <span className="text-[11px] font-extrabold tracking-tight uppercase">Pular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Level Progression Selector (Hidden when in Fullscreen Mobile Mode) */}
      {!isFullscreenLandscape && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300">
            Fases Horizontais (Nível 1 a 10 com chegada à Clínica Vittacare no Nível 10):
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {CAMPAIGN_PHASES.map((ph) => {
              const isCurrent = ph.phaseNumber === phaseNumber;
              const isBoss = ph.phaseNumber === 5 || ph.phaseNumber === 10;
              return (
                <button
                  key={ph.phaseNumber}
                  type="button"
                  onClick={() => onSelectPhase(ph.phaseNumber)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'bg-emerald-400 text-slate-950 font-bold'
                      : isBoss
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 hover:bg-amber-400/30'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {ph.phaseNumber === 5
                    ? '⚔️ Fase 5 (Pressão)'
                    : ph.phaseNumber === 10
                    ? '🏥 Fase 10 (Descuido + Clínica)'
                    : `Fase ${ph.phaseNumber}`}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
