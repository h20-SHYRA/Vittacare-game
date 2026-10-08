import { BiomeType, CAMPAIGN_PHASES } from '../data/gameData';
import { EnemyPixelType } from '../utils/pixelArt';

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'ground' | 'brick' | 'pipe' | 'pedestal' | 'moving' | 'spring';
  label?: string;
  baseX?: number;
  baseY?: number;
  moveRangeX?: number;
  moveRangeY?: number;
  moveSpeed?: number;
}

export interface QuestionBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hit: boolean;
  rewardText: string;
  rewardType: 'PRENATAL' | 'INFO' | 'PREVENTION' | 'HEART';
  bounceY: number;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  kind: 'prenatal' | 'info' | 'prevention' | 'heart' | 'union';
  label: string;
}

export interface CheckpointFlag {
  id: string;
  x: number;
  y: number;
  reached: boolean;
  label: string;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  minX: number;
  maxX: number;
  baseY: number;
  kind: EnemyPixelType;
  alive: boolean;
  hp: number;
  maxHp: number;
  label: string;
  shootTimer: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  fromPlayer: boolean;
  nurseId?: string;
  powerStyle?:
    | 'pierce_wave'
    | 'laser_orb'
    | 'star_spread'
    | 'boomerang'
    | 'sonic_ring'
    | 'homing_fire'
    | 'lightning_bolt'
    | 'viral_arrow'
    | 'royal_meteor'
    | 'emerald_dragon'
    | 'enemy_shot';
  piercing?: boolean;
  returning?: boolean;
  homing?: boolean;
  damage?: number;
  life: number;
  label?: string;
}

export interface LightningEffect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  life: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export interface PedestalIndicator {
  id: string;
  name: string;
  x: number;
  y: number;
  hp: number;
}

export interface BossEntity {
  active: boolean;
  type: 'PRESSAO' | 'DESCUIDO' | 'SILENCIO';
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  hp: number;
  maxHp: number;
  stage: 1 | 2 | 3 | 4;
  attackTimer: number;
  waveTimer: number;
  invulnTimer: number;
  defeated: boolean;
  unionContributors: string[];
  pedestals: PedestalIndicator[];
}

export interface LevelSetupResult {
  worldWidth: number;
  biome: BiomeType;
  platforms: Platform[];
  questionBlocks: QuestionBlock[];
  collectibles: Collectible[];
  checkpoints: CheckpointFlag[];
  enemies: Enemy[];
  boss: BossEntity | null;
  goalX: number;
  clinicX: number | null;
  requiredItems: number;
  objectiveTitle: string;
}

const HEALTH_CHALLENGE_LABELS: Record<EnemyPixelType, string[]> = {
  walker: ['Falta de Pré-Natal', 'Consulta Adiada', 'Desatenção aos Sinais'],
  jumper: ['Pico de Estresse', 'Salto de Ansiedade', 'Sobrecarga Materna'],
  flyer: ['Mito sem Fonte', 'Fake News em Saúde', 'Dúvida Não Esclarecida'],
  shield_knight: ['Resistência ao Check-up', 'Barreira do Medo', 'Bloqueio Preventivo'],
  spiker: ['Excesso de Sódio', 'Hábito de Risco', 'Sinal Ignorado'],
  mage: ['Sombra da Desinformação', 'Boato Antivacina', 'Neblina do Descuido'],
  wave: ['Onda de Hipertensão', 'Pulso Desregulado', 'Pressão Instável'],
  fragment: ['Fragmento do Adiamento', 'Exame Esquecido', 'Tabu do Silêncio'],
  meteor: ['Meteoro do Silêncio', 'Impacto do Adiamento', 'Crise Evitável'],
};

function pickEnemyLabel(kind: EnemyPixelType, idx: number): string {
  const list = HEALTH_CHALLENGE_LABELS[kind] || ['Obstáculo à Saúde'];
  return list[idx % list.length];
}

export function buildLevelData(phaseNum: number): LevelSetupResult {
  const phaseMeta =
    CAMPAIGN_PHASES.find((p) => p.phaseNumber === phaseNum) || CAMPAIGN_PHASES[0];
  const biome = phaseMeta.biome;

  const platforms: Platform[] = [];
  const questionBlocks: QuestionBlock[] = [];
  const collectibles: Collectible[] = [];
  const checkpoints: CheckpointFlag[] = [];
  const enemies: Enemy[] = [];

  // ==================== PHASE 5: 1º BOSS (A SOMBRA DA PRESSÃO) ====================
  if (phaseNum === 5) {
    const worldWidth = 2500;
    platforms.push(
      { x: 0, y: 420, w: 920, h: 80, kind: 'ground' },
      { x: 980, y: 420, w: 1520, h: 80, kind: 'ground' },
      { x: 260, y: 325, w: 130, h: 22, kind: 'brick' },
      { x: 540, y: 290, w: 140, h: 22, kind: 'moving', baseX: 540, baseY: 290, moveRangeX: 90, moveSpeed: 0.04 },
      { x: 860, y: 388, w: 46, h: 32, kind: 'spring', label: 'MOLA' },
      // Boss Arena Platforms
      { x: 1240, y: 320, w: 150, h: 22, kind: 'brick' },
      { x: 1520, y: 255, w: 170, h: 22, kind: 'moving', baseX: 1520, baseY: 255, moveRangeX: 100, moveSpeed: 0.05 },
      { x: 1820, y: 320, w: 150, h: 22, kind: 'brick' }
    );

    checkpoints.push({
      id: 'cp-5-1',
      x: 1040,
      y: 420,
      reached: false,
      label: 'Posto Pré-Natal · Arena da Pressão',
    });

    const bossBlockRewards = [
      'Aferição de Pressão Segura!',
      'Exame Pré-Natal Atualizado!',
      'Controle da Gestação Ativo!',
      'Vigilância Materna Vittacare!',
      'Escudo contra Hipertensão!',
    ];
    bossBlockRewards.forEach((text, i) => {
      questionBlocks.push({
        id: `qb-5-${i}`,
        x: 300 + i * 360,
        y: i % 2 === 0 ? 225 : 185,
        w: 40,
        h: 40,
        hit: false,
        rewardText: text,
        rewardType: i % 2 === 0 ? 'PRENATAL' : 'HEART',
        bounceY: 0,
      });
    });

    for (let i = 0; i < 8; i++) {
      collectibles.push({
        id: `col-5-${i}`,
        x: 220 + i * 240,
        y: i % 2 === 0 ? 365 : 210,
        w: 28,
        h: 28,
        collected: false,
        kind: 'prenatal',
        label: 'Controle de Pressão',
      });
    }

    enemies.push(
      {
        id: 'en-5-1',
        x: 450,
        y: 382,
        w: 40,
        h: 38,
        vx: -1.9,
        vy: 0,
        minX: 250,
        maxX: 780,
        baseY: 382,
        kind: 'wave',
        alive: true,
        hp: 2,
        maxHp: 2,
        label: 'Onda de Pressão',
        shootTimer: 90,
      },
      {
        id: 'en-5-2',
        x: 760,
        y: 380,
        w: 42,
        h: 40,
        vx: -1.6,
        vy: 0,
        minX: 520,
        maxX: 900,
        baseY: 380,
        kind: 'shield_knight',
        alive: true,
        hp: 2,
        maxHp: 2,
        label: 'Barreira Gestacional',
        shootTimer: 110,
      }
    );

    const boss: BossEntity = {
      active: true,
      type: 'PRESSAO',
      name: 'SOMBRA DA PRESSÃO',
      x: 1960,
      y: 250,
      w: 128,
      h: 170,
      vx: -2.0,
      hp: 100,
      maxHp: 100,
      stage: 1,
      attackTimer: 75,
      waveTimer: 110,
      invulnTimer: 0,
      defeated: false,
      unionContributors: [],
      pedestals: [],
    };

    return {
      worldWidth,
      biome,
      platforms,
      questionBlocks,
      collectibles,
      checkpoints,
      enemies,
      boss,
      goalX: 2340,
      clinicX: null,
      requiredItems: 4,
      objectiveTitle: 'Colete 4 Controles de Pressão e derrote a Sombra da Pressão!',
    };
  }

  // ==================== PHASE 10: 2º BOSS (A SOMBRA DO DESCUIDO - 4 ETAPAS) ====================
  if (phaseNum === 10) {
    const worldWidth = 2800;
    platforms.push(
      { x: 0, y: 420, w: 1020, h: 80, kind: 'ground' },
      { x: 1080, y: 420, w: 1720, h: 80, kind: 'ground' },
      { x: 280, y: 320, w: 140, h: 22, kind: 'brick' },
      { x: 580, y: 280, w: 150, h: 22, kind: 'moving', baseX: 580, baseY: 280, moveRangeY: 55, moveSpeed: 0.045 },
      { x: 920, y: 388, w: 46, h: 32, kind: 'spring', label: 'MOLA' },
      // Boss Arena Platforms
      { x: 1320, y: 315, w: 150, h: 22, kind: 'brick', label: 'Informação' },
      { x: 1620, y: 245, w: 180, h: 22, kind: 'moving', baseX: 1620, baseY: 245, moveRangeX: 110, moveSpeed: 0.05, label: 'Prevenção' },
      { x: 1940, y: 315, w: 150, h: 22, kind: 'brick', label: 'União' }
    );

    checkpoints.push({
      id: 'cp-10-1',
      x: 1130,
      y: 420,
      reached: false,
      label: 'Santuário de Cristal · Arena das 4 Etapas',
    });

    const stage10Rewards = [
      'Informação Confiável Ativa!',
      'Exame Preventivo em Dia!',
      'Rastreamento Ginecológico!',
      'Hábito Saudável Conquistado!',
      'Autocuidado Priorizado!',
      'União da Equipe Vittacare!',
    ];
    stage10Rewards.forEach((text, i) => {
      questionBlocks.push({
        id: `qb-10-${i}`,
        x: 260 + i * 330,
        y: i % 2 === 0 ? 220 : 175,
        w: 40,
        h: 40,
        hit: false,
        rewardText: text,
        rewardType: i < 2 ? 'INFO' : i < 4 ? 'PREVENTION' : 'HEART',
        bounceY: 0,
      });
    });

    for (let i = 0; i < 9; i++) {
      collectibles.push({
        id: `col-10-${i}`,
        x: 240 + i * 230,
        y: i % 2 === 0 ? 365 : 195,
        w: 28,
        h: 28,
        collected: false,
        kind: i % 2 === 0 ? 'info' : 'prevention',
        label: i % 2 === 0 ? 'Informação' : 'Prevenção',
      });
    }

    enemies.push(
      {
        id: 'en-10-1',
        x: 480,
        y: 380,
        w: 40,
        h: 40,
        vx: -2.0,
        vy: 0,
        minX: 240,
        maxX: 820,
        baseY: 380,
        kind: 'fragment',
        alive: true,
        hp: 2,
        maxHp: 2,
        label: 'Fragmento do Descuido',
        shootTimer: 85,
      },
      {
        id: 'en-10-2',
        x: 820,
        y: 378,
        w: 42,
        h: 42,
        vx: -1.8,
        vy: 0,
        minX: 540,
        maxX: 980,
        baseY: 378,
        kind: 'mage',
        alive: true,
        hp: 2,
        maxHp: 2,
        label: 'Mago da Desinformação',
        shootTimer: 75,
      }
    );

    const boss: BossEntity = {
      active: true,
      type: 'DESCUIDO',
      name: 'SOMBRA DO DESCUIDO',
      x: 2120,
      y: 235,
      w: 140,
      h: 185,
      vx: -2.2,
      hp: 100,
      maxHp: 100,
      stage: 1,
      attackTimer: 65,
      waveTimer: 95,
      invulnTimer: 0,
      defeated: false,
      unionContributors: [],
      pedestals: [
        { id: 'ped-1', name: 'Pré-Natal', x: 1380, y: 385, hp: 100 },
        { id: 'ped-2', name: 'Exames em Dia', x: 1660, y: 385, hp: 100 },
        { id: 'ped-3', name: 'Bem-Estar', x: 1920, y: 385, hp: 100 },
      ],
    };

    return {
      worldWidth,
      biome,
      platforms,
      questionBlocks,
      collectibles,
      checkpoints,
      enemies,
      boss,
      goalX: 2560,
      clinicX: null,
      requiredItems: 5,
      objectiveTitle: 'Supere as 4 Etapas (Informação, Prevenção, Cuidado e União) contra a Sombra do Descuido!',
    };
  }

  // ==================== PHASE 17: 3º BOSS FINAL + LINHA DE CHEGADA CLÍNICA VITTACARE ====================
  if (phaseNum === 17) {
    const worldWidth = 3450;
    platforms.push(
      { x: 0, y: 420, w: 1050, h: 80, kind: 'ground' },
      { x: 1110, y: 420, w: 2340, h: 80, kind: 'ground' },
      { x: 260, y: 320, w: 140, h: 22, kind: 'brick' },
      { x: 520, y: 265, w: 150, h: 22, kind: 'moving', baseX: 520, baseY: 265, moveRangeX: 100, moveSpeed: 0.05 },
      { x: 820, y: 320, w: 140, h: 22, kind: 'brick' },
      { x: 980, y: 388, w: 46, h: 32, kind: 'spring', label: 'IMPULSO' },
      // Final Boss Royal Arena Platforms
      { x: 1340, y: 315, w: 160, h: 22, kind: 'brick', label: 'Voz Ativa' },
      { x: 1650, y: 235, w: 190, h: 22, kind: 'moving', baseX: 1650, baseY: 235, moveRangeX: 130, moveSpeed: 0.055, label: 'Tempo de Cuidar' },
      { x: 1980, y: 315, w: 160, h: 22, kind: 'brick', label: 'Aliança Vittacare' }
    );

    checkpoints.push({
      id: 'cp-17-1',
      x: 1170,
      y: 420,
      reached: false,
      label: 'Portão Dourado · Arena Final Vittacare',
    });

    const stage17Rewards = [
      'Quebra do Silêncio Ativa!',
      'Diagnóstico Precoce Garantido!',
      'Prevenção sem Adiamento!',
      'Acolhimento Integral Vittacare!',
      'Força das Sócias & Equipe!',
      'Luz Suprema da Saúde Feminina!',
    ];
    stage17Rewards.forEach((text, i) => {
      questionBlocks.push({
        id: `qb-17-${i}`,
        x: 280 + i * 330,
        y: i % 2 === 0 ? 220 : 170,
        w: 40,
        h: 40,
        hit: false,
        rewardText: text,
        rewardType: i % 2 === 0 ? 'PREVENTION' : 'HEART',
        bounceY: 0,
      });
    });

    for (let i = 0; i < 10; i++) {
      collectibles.push({
        id: `col-17-${i}`,
        x: 220 + i * 210,
        y: i % 2 === 0 ? 365 : 190,
        w: 28,
        h: 28,
        collected: false,
        kind: i % 3 === 0 ? 'union' : i % 2 === 0 ? 'prevention' : 'info',
        label: 'Selo Vittacare',
      });
    }

    enemies.push(
      {
        id: 'en-17-1',
        x: 440,
        y: 378,
        w: 42,
        h: 42,
        vx: -2.2,
        vy: 0,
        minX: 220,
        maxX: 760,
        baseY: 378,
        kind: 'shield_knight',
        alive: true,
        hp: 3,
        maxHp: 3,
        label: 'Guardião do Tabu',
        shootTimer: 75,
      },
      {
        id: 'en-17-2',
        x: 780,
        y: 378,
        w: 42,
        h: 42,
        vx: -2.1,
        vy: 0,
        minX: 500,
        maxX: 980,
        baseY: 378,
        kind: 'mage',
        alive: true,
        hp: 3,
        maxHp: 3,
        label: 'Arauto do Adiamento',
        shootTimer: 70,
      }
    );

    const boss: BossEntity = {
      active: true,
      type: 'SILENCIO',
      name: 'SOBERANO DO SILÊNCIO & ADIAMENTO',
      x: 2180,
      y: 220,
      w: 152,
      h: 200,
      vx: -2.5,
      hp: 100,
      maxHp: 100,
      stage: 1,
      attackTimer: 55,
      waveTimer: 82,
      invulnTimer: 0,
      defeated: false,
      unionContributors: [],
      pedestals: [
        { id: 'ped-17-1', name: 'Escuta Sem Tabu', x: 1400, y: 385, hp: 100 },
        { id: 'ped-17-2', name: 'Exames no Tempo Certo', x: 1690, y: 385, hp: 100 },
        { id: 'ped-17-3', name: 'Cuidado Vittacare', x: 1980, y: 385, hp: 100 },
      ],
    };

    return {
      worldWidth,
      biome,
      platforms,
      questionBlocks,
      collectibles,
      checkpoints,
      enemies,
      boss,
      goalX: 2740, // Grand Finish Line Banner
      clinicX: 2920, // Clínica Vittacare Building
      requiredItems: 6,
      objectiveTitle: 'Derrote o Soberano do Silêncio & Adiamento e cruze a Linha de Chegada da Clínica Vittacare!',
    };
  }

  // ==================== STANDARD CAMPAIGN PHASES (1–4, 6–9, 11–16) ====================
  const difficulty = phaseNum;
  const worldWidth = 2400 + difficulty * 95;
  const requiredItems = Math.min(8, 4 + Math.floor(difficulty / 3));

  // Build segmented ground with pits, springs, pipes, and moving platforms
  let cursorX = 0;
  let segIndex = 0;
  while (cursorX < worldWidth - 550) {
    const segW = Math.max(320, 560 - difficulty * 10 + ((segIndex * 73) % 140));
    platforms.push({
      x: cursorX,
      y: 420,
      w: segW,
      h: 80,
      kind: 'ground',
    });

    // Add pipe or spring before gap
    if (segIndex % 2 === 1 && cursorX + segW - 90 > 220) {
      platforms.push({
        x: cursorX + segW - 65,
        y: 388,
        w: 44,
        h: 32,
        kind: 'spring',
        label: 'MOLA',
      });
    } else if (segIndex > 0 && cursorX + 120 < worldWidth - 600) {
      platforms.push({
        x: cursorX + 90,
        y: 356,
        w: 58,
        h: 64,
        kind: 'pipe',
      });
    }

    const gapW = Math.min(135, 78 + Math.floor(difficulty * 2.5));
    cursorX += segW + gapW;
    segIndex++;
  }

  // Final ground segment for goal flag
  platforms.push({
    x: cursorX,
    y: 420,
    w: worldWidth - cursorX + 100,
    h: 80,
    kind: 'ground',
  });

  // Mid-level Checkpoint Flag on a safe ground segment
  const midGround = platforms.find(
    (p) => p.kind === 'ground' && p.x >= worldWidth * 0.42 && p.x <= worldWidth * 0.65
  );
  const cpX = midGround ? midGround.x + 85 : Math.floor(worldWidth * 0.48);
  checkpoints.push({
    id: `cp-${phaseNum}`,
    x: cpX,
    y: 420,
    reached: false,
    label: `Checkpoint · Fase ${phaseNum}`,
  });

  // Elevated bricks & moving platforms
  const elevatedCount = 7 + Math.floor(difficulty / 2);
  for (let i = 0; i < elevatedCount; i++) {
    const px = 250 + i * Math.floor((worldWidth - 650) / elevatedCount);
    const py = i % 3 === 0 ? 310 : i % 3 === 1 ? 245 : 280;
    const isMoving = i % 2 === 1;
    platforms.push({
      x: px,
      y: py,
      w: 135,
      h: 22,
      kind: isMoving ? 'moving' : 'brick',
      baseX: px,
      baseY: py,
      moveRangeX: isMoving && i % 4 === 1 ? 75 + difficulty * 2 : 0,
      moveRangeY: isMoving && i % 4 !== 1 ? 45 : 0,
      moveSpeed: 0.035 + difficulty * 0.0015,
    });

    // Question Block above some platforms
    if (i % 2 === 0) {
      questionBlocks.push({
        id: `qb-${phaseNum}-${i}`,
        x: px + 46,
        y: py - 88,
        w: 40,
        h: 40,
        hit: false,
        rewardText: phaseMeta.educationalTip,
        rewardType:
          phaseNum < 5 ? 'PRENATAL' : phaseNum < 10 ? 'INFO' : 'PREVENTION',
        bounceY: 0,
      });
    }
  }

  // Collectibles placed along the stage
  const totalCollectibles = requiredItems + 4;
  for (let i = 0; i < totalCollectibles; i++) {
    const cx = 210 + i * Math.floor((worldWidth - 580) / totalCollectibles);
    const cy = i % 2 === 0 ? 360 : 200;
    const kind =
      phaseNum < 5 ? 'prenatal' : phaseNum < 10 ? 'info' : 'prevention';
    collectibles.push({
      id: `col-${phaseNum}-${i}`,
      x: cx,
      y: cy,
      w: 28,
      h: 28,
      collected: false,
      kind,
      label:
        kind === 'prenatal'
          ? 'Caderneta Pré-Natal'
          : kind === 'info'
          ? 'Guia de Saúde'
          : 'Exame Preventivo',
    });
  }

  // Diverse Enemies scaled by biome & level difficulty
  const enemyPool: EnemyPixelType[] =
    biome === 'GARDEN_MORNING'
      ? ['walker', 'jumper', 'flyer', 'spiker']
      : biome === 'STORM_FORTRESS'
      ? ['wave', 'shield_knight', 'jumper', 'flyer']
      : biome === 'SUNSET_CITY'
      ? ['walker', 'mage', 'flyer', 'spiker', 'shield_knight']
      : biome === 'CRYSTAL_CAVERN'
      ? ['fragment', 'mage', 'shield_knight', 'jumper']
      : biome === 'STARLIGHT_VALLEY'
      ? ['flyer', 'mage', 'shield_knight', 'spiker', 'jumper']
      : ['shield_knight', 'mage', 'fragment', 'wave', 'spiker'];

  const groundSegments = platforms.filter((p) => p.kind === 'ground' && p.x > 160);
  groundSegments.forEach((seg, idx) => {
    const kind = enemyPool[(idx + phaseNum) % enemyPool.length];
    const isFlyer = kind === 'flyer';
    const ey = isFlyer ? 255 : 380;
    const hp = kind === 'shield_knight' || kind === 'mage' || phaseNum >= 11 ? 2 : 1;
    const speed = 1.35 + difficulty * 0.08;

    enemies.push({
      id: `en-${phaseNum}-${idx}`,
      x: seg.x + Math.min(seg.w - 60, 180),
      y: ey,
      w: 40,
      h: 40,
      vx: idx % 2 === 0 ? -speed : speed,
      vy: 0,
      minX: seg.x + 24,
      maxX: seg.x + seg.w - 54,
      baseY: ey,
      kind,
      alive: true,
      hp,
      maxHp: hp,
      label: pickEnemyLabel(kind, idx + phaseNum),
      shootTimer: 90 + (idx % 3) * 30,
    });
  });

  const itemLabel =
    phaseNum < 5
      ? 'Itens de Pré-Natal'
      : phaseNum < 10
      ? 'Guias de Informação'
      : 'Exames de Prevenção';

  return {
    worldWidth,
    biome,
    platforms,
    questionBlocks,
    collectibles,
    checkpoints,
    enemies,
    boss: null,
    goalX: worldWidth - 220,
    clinicX: null,
    requiredItems,
    objectiveTitle: `Colete pelo menos ${requiredItems} ${itemLabel} e alcance o Portal Vittacare!`,
  };
}
