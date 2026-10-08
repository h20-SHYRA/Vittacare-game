import { CharacterId, CharacterGroup, SkinId } from '../data/gameData';

export type NurseId = CharacterId;

export type EnemyPixelType =
  | 'walker'
  | 'jumper'
  | 'flyer'
  | 'shield_knight'
  | 'spiker'
  | 'mage'
  | 'wave'
  | 'fragment'
  | 'meteor';

interface CharacterPixelPalette {
  group: CharacterGroup;
  skin: string;
  skinShadow: string;
  hair: string;
  hairHighlight: string;
  hairStyle:
    | 'curly_long'
    | 'short_male'
    | 'ponytail'
    | 'long_straight'
    | 'wavy_elegant'
    | 'sleek_bun';
  outfitPrimary: string;
  outfitSecondary: string;
  accentColor: string;
  bottomColor: string;
  wearsSkirt: boolean;
  shoes: string;
  heelAccent?: string;
  clutchColor?: string;
  eye: string;
  mouth: string;
}

export const CHARACTER_PIXEL_PALETTES: Record<CharacterId, CharacterPixelPalette> = {
  // 1. Stephanie: Parda mais clara (mel/caramelo suave) com cabelo cacheado longo nos ombros
  stephanie: {
    group: 'ENFERMAGEM',
    skin: '#da9f72',
    skinShadow: '#b87d51',
    hair: '#261710',
    hairHighlight: '#543828',
    hairStyle: 'curly_long',
    outfitPrimary: '#f8fafc',
    outfitSecondary: '#059669',
    accentColor: '#10b981',
    bottomColor: '#1e293b',
    wearsSkirt: false,
    shoes: '#0f172a',
    eye: '#111827',
    mouth: '#e11d48',
  },
  // 2. Marcelo: Enfermeiro
  marcelo: {
    group: 'ENFERMAGEM',
    skin: '#d99b72',
    skinShadow: '#b57850',
    hair: '#291d16',
    hairHighlight: '#4a3528',
    hairStyle: 'short_male',
    outfitPrimary: '#f8fafc',
    outfitSecondary: '#0284c7',
    accentColor: '#0ea5e9',
    bottomColor: '#1e293b',
    wearsSkirt: false,
    shoes: '#0f172a',
    eye: '#111827',
    mouth: '#9a3412',
  },
  // 3. Bianca: Enfermeira
  bianca: {
    group: 'ENFERMAGEM',
    skin: '#f1c29b',
    skinShadow: '#d49e73',
    hair: '#78350f',
    hairHighlight: '#b45309',
    hairStyle: 'ponytail',
    outfitPrimary: '#f8fafc',
    outfitSecondary: '#d97706',
    accentColor: '#f59e0b',
    bottomColor: '#1e293b',
    wearsSkirt: false,
    shoes: '#0f172a',
    eye: '#111827',
    mouth: '#e11d48',
  },
  // 4. Leticia: Enfermeira
  leticia: {
    group: 'ENFERMAGEM',
    skin: '#c98a5b',
    skinShadow: '#a36b40',
    hair: '#18181b',
    hairHighlight: '#3f3f46',
    hairStyle: 'long_straight',
    outfitPrimary: '#f8fafc',
    outfitSecondary: '#db2777',
    accentColor: '#ec4899',
    bottomColor: '#1e293b',
    wearsSkirt: false,
    shoes: '#0f172a',
    eye: '#111827',
    mouth: '#be185d',
  },

  // ==================== MARKETING (TERNO EXECUTIVO + SAIA PARA AS MENINAS) ====================
  // 5. Ronald Mkt: Terno Executivo Masculino Completo
  ronald: {
    group: 'MARKETING',
    skin: '#c88c5d',
    skinShadow: '#a1693e',
    hair: '#1c1917',
    hairHighlight: '#44403c',
    hairStyle: 'short_male',
    outfitPrimary: '#1e293b', // Blazer de terno marinho escuro
    outfitSecondary: '#f8fafc', // Camisa social branca
    accentColor: '#3b82f6', // Gravata executiva azul royal
    bottomColor: '#0f172a', // Calça social de terno
    wearsSkirt: false,
    shoes: '#1c1917',
    eye: '#111827',
    mouth: '#9a3412',
  },
  // 6. Nina Mkt: Ruiva de Terno & Saia Lápis Executiva
  nina: {
    group: 'MARKETING',
    skin: '#f5cba7',
    skinShadow: '#d9a77d',
    hair: '#b91c1c', // Cabelo Ruivo vibrante
    hairHighlight: '#f97316', // Reflexos acobreados
    hairStyle: 'long_straight',
    outfitPrimary: '#1e293b', // Terno/Blazer acinturado azul-noite
    outfitSecondary: '#f8fafc', // Camisa social branca
    accentColor: '#ea580c', // Lenço/Gravata feminina terracota
    bottomColor: '#0f172a', // Saia lápis executiva
    wearsSkirt: true,
    shoes: '#991b1b', // Scarpin executivo
    heelAccent: '#fbbf24',
    eye: '#111827',
    mouth: '#e11d48',
  },
  // 7. Samara Mkt: Terno & Saia Lápis Executiva Ametista/Grafite
  samara: {
    group: 'MARKETING',
    skin: '#d29568',
    skinShadow: '#ab7147',
    hair: '#271c15',
    hairHighlight: '#523b2d',
    hairStyle: 'wavy_elegant',
    outfitPrimary: '#27272a', // Terno/Blazer grafite escuro
    outfitSecondary: '#f8fafc', // Camisa social branca
    accentColor: '#8b5cf6', // Gravata/Lenço executivo violeta
    bottomColor: '#18181b', // Saia lápis executiva preta
    wearsSkirt: true,
    shoes: '#4c1d95', // Scarpin violeta escuro
    heelAccent: '#c4b5fd',
    eye: '#111827',
    mouth: '#e11d48',
  },
  // 8. Letícia Mkt: Terno & Saia Lápis Executiva Marinho/Safira
  leticia_mkt: {
    group: 'MARKETING',
    skin: '#e0ab82',
    skinShadow: '#bc855c',
    hair: '#3f2719',
    hairHighlight: '#6b442b',
    hairStyle: 'ponytail',
    outfitPrimary: '#0f172a', // Terno/Blazer executivo marinho
    outfitSecondary: '#f8fafc', // Camisa social branca
    accentColor: '#06b6d4', // Lenço/Crachá executivo safira
    bottomColor: '#1e293b', // Saia lápis executiva marinho
    wearsSkirt: true,
    shoes: '#0e7490', // Scarpin safira
    heelAccent: '#67e8f9',
    eye: '#111827',
    mouth: '#be185d',
  },

  // ==================== SÓCIAS DA CLÍNICA (ALTA COSTURA CHIQUE DE GALA) ====================
  // 9. Vivian (Sócia): Alta Costura Veludo Bordô Imperial, Estola de Seda Marfim, Diamantes, Saia Midi & Scarpin Louboutin + Clutch Dourada
  vivian: {
    group: 'SOCIAS',
    skin: '#f2c49e',
    skinShadow: '#d49f75',
    hair: '#92400e',
    hairHighlight: '#facc15',
    hairStyle: 'wavy_elegant',
    outfitPrimary: '#881337', // Blazer-Cape de Alta Costura Bordô Rubi Imperial
    outfitSecondary: '#fff1f2', // Gola/Estola de seda pérola-marfim
    accentColor: '#fbbf24', // Joias de ouro & diamantes
    bottomColor: '#9f1239', // Saia lápis de alta costura bordô
    wearsSkirt: true,
    shoes: '#18181b', // Scarpin de luxo preto com sola vermelha/ouro
    heelAccent: '#ef4444',
    clutchColor: '#fbbf24', // Bolsa Clutch Chanel/Grife dourada
    eye: '#111827',
    mouth: '#e11d48',
  },
  // 10. Bárbara (Sócia): Alta Costura Cetim Esmeralda Imperial & Preto, Colar de Diamantes, Saia de Gala & Scarpin Ouro + Clutch Pérola
  barbara: {
    group: 'SOCIAS',
    skin: '#eab891',
    skinShadow: '#c79269',
    hair: '#27170e',
    hairHighlight: '#5c3c26',
    hairStyle: 'sleek_bun',
    outfitPrimary: '#064e3b', // Alta Costura Esmeralda Imperial Profundo
    outfitSecondary: '#ecfdf5', // Lapela de seda champanhe-pérola
    accentColor: '#fbbf24', // Cinto e broche de ouro & diamantes
    bottomColor: '#047857', // Saia de gala esmeralda acetinado
    wearsSkirt: true,
    shoes: '#d97706', // Scarpin stiletto dourado
    heelAccent: '#fef08a',
    clutchColor: '#f8fafc', // Bolsa Clutch de grife pérola com fecho dourado
    eye: '#111827',
    mouth: '#e11d48',
  },
};

/**
 * Draws a detailed 16-bit style pixel-art character sprite (18x24 virtual pixels scaled by `scale`).
 * - Stephanie: Lighter warm parda skin + cascading curly hair down shoulders.
 * - Marketing Women (Nina Mkt, Samara Mkt, Letícia Mkt): Tailored Suit Blazer + Dress Shirt + Tie/Scarf + Executive Pencil Skirt + Bare Legs + High Heels!
 * - Sócias (Vivian, Bárbara): High-contrast Luxury Haute Couture Cape-Blazer & Dress Skirt, Pearl/Silk Collar, Sparkling Diamond Choker, Gold Belt, Stiletto Heels & Designer Clutch Bag!
 */
export function drawPixelNurse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  charId: CharacterId,
  facing: 1 | -1,
  animTick: number,
  isJumping: boolean,
  skinOption: boolean | SkinId = 'padrao',
  scale: number = 3
) {
  const pal = CHARACTER_PIXEL_PALETTES[charId] || CHARACTER_PIXEL_PALETTES.stephanie;
  const skinId: SkinId =
    typeof skinOption === 'boolean'
      ? skinOption
        ? 'dourada'
        : 'padrao'
      : skinOption || 'padrao';

  let primaryOutfit = pal.outfitPrimary;
  let secondaryOutfit = pal.outfitSecondary;
  let accent = pal.accentColor;
  let bottomCol = pal.bottomColor;
  let shoeCol = pal.shoes;
  let capeColor: string | null = null;
  let visorColor: string | null = null;
  let crownColor: string | null = null;
  let sparkleColor: string | null = null;

  switch (skinId) {
    case 'dourada':
      primaryOutfit = '#fef08a';
      secondaryOutfit = '#f59e0b';
      accent = '#d97706';
      bottomCol = '#b45309';
      shoeCol = '#78350f';
      crownColor = '#fde047';
      sparkleColor = '#fde047';
      break;
    case 'esmeralda':
      primaryOutfit = '#065f46';
      secondaryOutfit = '#a7f3d0';
      accent = '#34d399';
      bottomCol = '#022c22';
      shoeCol = '#10b981';
      sparkleColor = '#6ee7b7';
      break;
    case 'super_heroi':
      primaryOutfit = '#1d4ed8';
      secondaryOutfit = '#fde047';
      accent = '#ef4444';
      bottomCol = '#1e3a8a';
      shoeCol = '#dc2626';
      capeColor = '#dc2626';
      visorColor = '#38bdf8';
      break;
    case 'cyber_neon':
      primaryOutfit = '#0f172a';
      secondaryOutfit = '#22d3ee';
      accent = '#f43f5e';
      bottomCol = '#1e1b4b';
      shoeCol = '#06b6d4';
      visorColor = '#22d3ee';
      sparkleColor = '#22d3ee';
      break;
    case 'gala_diamante':
      primaryOutfit = '#1e1b4b';
      secondaryOutfit = '#f8fafc';
      accent = '#c7d2fe';
      bottomCol = '#090d16';
      shoeCol = '#e2e8f0';
      crownColor = '#e2e8f0';
      sparkleColor = '#ffffff';
      break;
    case 'rosa_quartzo':
      primaryOutfit = '#fce7f3';
      secondaryOutfit = '#ec4899';
      accent = '#f43f5e';
      bottomCol = '#831843';
      shoeCol = '#be185d';
      sparkleColor = '#f9a8d4';
      break;
    case 'chama_real':
      primaryOutfit = '#991b1b';
      secondaryOutfit = '#fde047';
      accent = '#f97316';
      bottomCol = '#450a0a';
      shoeCol = '#ea580c';
      capeColor = '#ea580c';
      crownColor = '#fbbf24';
      sparkleColor = '#fb923c';
      break;
    default:
      break;
  }

  ctx.save();
  const widthPx = 18 * scale;
  ctx.translate(Math.round(x + widthPx / 2), Math.round(y));
  ctx.scale(facing, 1);
  ctx.translate(-Math.round(widthPx / 2), 0);

  const px = (gx: number, gy: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(gx * scale, gy * scale, w * scale, h * scale);
  };

  const walkCycle = Math.floor(animTick) % 4;
  const bounceY = !isJumping && (walkCycle === 1 || walkCycle === 3) ? -1 : 0;

  // Flowing Heroic Cape Behind Character (super_heroi / chama_real)
  if (capeColor) {
    const capeWave = walkCycle === 1 || isJumping ? -1 : walkCycle === 3 ? 1 : 0;
    px(1, 12 + bounceY, 4, 9 + capeWave, capeColor);
    px(0, 15 + bounceY + capeWave, 3, 6, '#fbbf24');
  }

  // Skin Sparkle Pixels
  if (sparkleColor) {
    px(1, 3 + bounceY, 1, 1, sparkleColor);
    px(16, 5 + bounceY, 1, 1, sparkleColor);
    px(2, 16 + bounceY, 1, 1, accent);
    px(15, 14 + bounceY, 1, 1, sparkleColor);
  }

  // ==================== 1. HAIR BACK LAYER ====================
  if (pal.hairStyle === 'curly_long') {
    // Stephanie: Natural fitted crown + cascading curly locks down shoulders
    px(5, 2 + bounceY, 9, 2, pal.hair);
    px(4, 4 + bounceY, 10, 4, pal.hair);
    px(3, 6 + bounceY, 3, 3, pal.hair);
    px(2, 9 + bounceY, 3, 3, pal.hair);
    px(3, 12 + bounceY, 3, 3, pal.hair);
    px(2, 15 + bounceY, 2, 2, pal.hair);
    px(13, 8 + bounceY, 2, 3, pal.hair);
    px(14, 11 + bounceY, 2, 3, pal.hair);
    px(13, 14 + bounceY, 2, 2, pal.hair);
    // Curly wave highlights
    px(3, 7 + bounceY, 2, 1, pal.hairHighlight);
    px(2, 10 + bounceY, 2, 1, pal.hairHighlight);
    px(3, 13 + bounceY, 2, 1, pal.hairHighlight);
    px(14, 9 + bounceY, 1, 2, pal.hairHighlight);
    px(14, 12 + bounceY, 1, 2, pal.hairHighlight);
  } else if (pal.hairStyle === 'short_male') {
    px(4, 2 + bounceY, 10, 3, pal.hair);
    px(4, 4 + bounceY, 3, 5, pal.hair);
    px(6, 2 + bounceY, 4, 1, pal.hairHighlight);
  } else if (pal.hairStyle === 'ponytail') {
    px(4, 2 + bounceY, 10, 4, pal.hair);
    px(2, 5 + bounceY, 3, 5, pal.hair);
    px(1, 7 + bounceY, 2, 5, pal.hairHighlight);
    px(7, 2 + bounceY, 4, 1, pal.hairHighlight);
  } else if (pal.hairStyle === 'wavy_elegant') {
    px(4, 2 + bounceY, 10, 4, pal.hair);
    px(3, 5 + bounceY, 3, 9, pal.hair);
    px(13, 6 + bounceY, 2, 7, pal.hair);
    px(6, 2 + bounceY, 5, 1, pal.hairHighlight);
    px(3, 8 + bounceY, 2, 2, pal.hairHighlight);
    px(13, 9 + bounceY, 2, 2, pal.hairHighlight);
  } else if (pal.hairStyle === 'sleek_bun') {
    px(2, 3 + bounceY, 3, 4, pal.hair);
    px(2, 4 + bounceY, 2, 2, pal.hairHighlight);
    px(4, 2 + bounceY, 10, 4, pal.hair);
    px(13, 6 + bounceY, 2, 6, pal.hair);
  } else {
    px(4, 2 + bounceY, 10, 4, pal.hair);
    px(3, 5 + bounceY, 4, 11, pal.hair);
    px(13, 5 + bounceY, 3, 10, pal.hair);
    px(6, 2 + bounceY, 4, 1, pal.hairHighlight);
    px(3, 8 + bounceY, 2, 3, pal.hairHighlight);
    px(14, 8 + bounceY, 1, 3, pal.hairHighlight);
  }

  // ==================== 2. HEADGEAR / CROWN / LUXURY HAIRPIN ====================
  if (crownColor) {
    px(5, 0 + bounceY, 8, 2, crownColor);
    px(6, -1 + bounceY, 2, 1, '#ffffff');
    px(9, -1 + bounceY, 2, 1, accent);
  } else if (pal.group === 'ENFERMAGEM') {
    px(6, 0 + bounceY, 6, 2, '#ffffff');
    px(8, 0 + bounceY, 2, 2, accent);
  } else if (pal.group === 'SOCIAS') {
    // Chic diamond & gold hair tiara/barrette
    px(6, 1 + bounceY, 5, 1, '#fbbf24');
    px(8, 0 + bounceY, 2, 1, '#ffffff');
  }

  // ==================== 3. HEAD & FACE ====================
  px(5, 4 + bounceY, 9, 7, pal.skin);
  px(5, 10 + bounceY, 9, 1, pal.skinShadow);
  px(5, 4 + bounceY, 2, 6, pal.skinShadow);

  // Hair Bangs
  px(5, 3 + bounceY, 9, 2, pal.hair);
  px(5, 5 + bounceY, 2, 3, pal.hair);
  px(7, 3 + bounceY, 3, 1, pal.hairHighlight);

  // Earrings for Sócias & Marketing Women
  if (pal.group === 'SOCIAS') {
    px(5, 8 + bounceY, 1, 2, '#fef08a');
    px(5, 7 + bounceY, 1, 1, '#ffffff'); // Diamond stud
  } else if (pal.group === 'MARKETING' && pal.wearsSkirt) {
    px(5, 8 + bounceY, 1, 1, '#fbbf24');
  }

  // Eyes / Visor & Lipstick
  if (visorColor) {
    px(8, 6 + bounceY, 6, 2, visorColor);
    px(9, 6 + bounceY, 3, 1, '#ffffff');
  } else {
    px(10, 6 + bounceY, 2, 2, pal.eye);
    px(10, 6 + bounceY, 1, 1, '#ffffff');
  }
  px(10, 5 + bounceY, 2, 1, pal.hair);
  px(10, 9 + bounceY, 2, 1, pal.mouth);

  // Neck
  px(7, 11 + bounceY, 4, 1, pal.skinShadow);

  // ==================== 4. TORSO BY GROUP ====================
  if (pal.group === 'ENFERMAGEM') {
    px(4, 12 + bounceY, 10, 7, primaryOutfit);
    px(7, 12 + bounceY, 4, 2, secondaryOutfit);
    px(8, 14 + bounceY, 2, 1, secondaryOutfit);
    px(4, 18 + bounceY, 10, 1, accent);
    px(10, 15 + bounceY, 3, 2, accent);
    // Stethoscope
    px(6, 12 + bounceY, 1, 4, accent);
    px(11, 12 + bounceY, 1, 4, accent);
    px(6, 15 + bounceY, 2, 2, '#94a3b8');
  } else if (pal.group === 'MARKETING') {
    // Tailored Executive Suit Jacket (Terno) + White Dress Shirt + Tie/Scarf + Gold Button
    px(4, 12 + bounceY, 10, 5, primaryOutfit); // Structured blazer torso
    px(7, 12 + bounceY, 4, 5, secondaryOutfit); // White dress shirt V-center
    // Sharp Suit Lapels
    px(6, 12 + bounceY, 1, 4, '#475569');
    px(11, 12 + bounceY, 1, 4, '#475569');
    // Executive Tie / Silk Scarf & Gold Blazer Button
    px(8, 12 + bounceY, 2, 4, accent);
    px(9, 16 + bounceY, 1, 1, '#fbbf24');
    // Corporate Mkt Pin
    px(11, 14 + bounceY, 2, 1, '#38bdf8');
  } else {
    // SOCIAS (Vivian & Bárbara): Ultra-Chic Haute Couture Ensemble!
    // Structured Luxury Cape-Blazer with sculpted waist + Silk/Fur Lapel Collar + Diamond Choker + Gold Belt
    px(3, 12 + bounceY, 12, 5, primaryOutfit); // Wide shoulder couture cape-blazer
    px(7, 12 + bounceY, 4, 3, pal.skin); // Elegant V-neck décolleté
    // Sparkling Diamond & Gold Choker Necklace
    px(7, 12 + bounceY, 4, 1, '#ffffff');
    px(8, 13 + bounceY, 2, 1, '#fbbf24');
    // Plush Ivory Silk / Fur Shawl Lapels framing shoulders
    px(5, 12 + bounceY, 2, 4, secondaryOutfit);
    px(11, 12 + bounceY, 2, 4, secondaryOutfit);
    // Haute Couture Gold Waist Cinch Belt with Diamond Clasp
    px(4, 16 + bounceY, 10, 1, '#fbbf24');
    px(8, 16 + bounceY, 2, 1, '#ffffff');
  }

  // ==================== 5. ARMS & DESIGNER CLUTCH ====================
  const armOffset = isJumping ? -2 : walkCycle === 1 ? -1 : walkCycle === 3 ? 1 : 0;
  px(2, 12 + bounceY - armOffset, 2, 4, primaryOutfit);
  px(2, 16 + bounceY - armOffset, 2, 2, pal.skinShadow);
  px(14, 12 + bounceY + armOffset, 2, 4, primaryOutfit);
  px(14, 16 + bounceY + armOffset, 2, 2, pal.skin);

  // Chic Designer Handbag / Clutch for the Sócias!
  if (pal.group === 'SOCIAS' && pal.clutchColor) {
    px(13, 17 + bounceY + armOffset, 4, 3, pal.clutchColor);
    px(14, 17 + bounceY + armOffset, 2, 1, '#fbbf24'); // Gold chain clasp
  }

  // ==================== 6. SKIRT & LEGS (FOR MARKETING WOMEN & SÓCIAS) OR TROUSERS ====================
  if (pal.wearsSkirt) {
    // Fitted Pencil Skirt (Saia Executiva / Saia de Alta Costura) from y=17 to y=20
    px(4, 17 + bounceY, 10, 3, bottomCol);
    if (pal.group === 'SOCIAS') {
      // Chic side slit & gold couture trim on skirt hem
      px(4, 19 + bounceY, 10, 1, '#fbbf24');
      px(11, 18 + bounceY, 1, 2, pal.skin);
    } else {
      // Subtle tailored skirt pleat highlight for Marketing women
      px(4, 17 + bounceY, 10, 1, primaryOutfit);
      px(9, 18 + bounceY, 1, 2, '#334155');
    }

    // Bare Legs (Skin) + High-Heel Stiletto Scarpins!
    const heelTip = pal.heelAccent || '#fbbf24';
    if (isJumping) {
      px(5, 20, 3, 2, pal.skinShadow);
      px(4, 22, 4, 2, shoeCol);
      px(4, 23, 1, 1, heelTip);

      px(10, 19, 3, 2, pal.skin);
      px(10, 21, 4, 2, shoeCol);
      px(10, 22, 1, 1, heelTip);
    } else if (walkCycle === 1) {
      px(4, 20, 3, 2, pal.skinShadow);
      px(3, 22, 4, 2, shoeCol);
      px(3, 23, 1, 1, heelTip);

      px(10, 20, 3, 2, pal.skin);
      px(11, 22, 4, 2, shoeCol);
      px(11, 23, 1, 1, heelTip);
    } else if (walkCycle === 3) {
      px(6, 20, 3, 2, pal.skinShadow);
      px(6, 22, 4, 2, shoeCol);

      px(9, 20, 3, 2, pal.skin);
      px(9, 22, 4, 2, shoeCol);
    } else {
      px(5, 20, 3, 2, pal.skinShadow);
      px(5, 22, 4, 2, shoeCol);
      px(5, 23, 1, 1, heelTip);

      px(10, 20, 3, 2, pal.skin);
      px(10, 22, 4, 2, shoeCol);
      px(10, 23, 1, 1, heelTip);
    }
  } else {
    // Full Trousers (Enfermagem & Ronald Mkt)
    if (isJumping) {
      px(4, 19, 4, 3, bottomCol);
      px(3, 22, 4, 2, shoeCol);
      px(10, 18, 4, 3, bottomCol);
      px(11, 21, 4, 2, shoeCol);
    } else if (walkCycle === 1) {
      px(4, 19, 4, 3, bottomCol);
      px(3, 22, 5, 2, shoeCol);
      px(10, 19, 4, 3, bottomCol);
      px(11, 22, 5, 2, shoeCol);
    } else if (walkCycle === 3) {
      px(6, 19, 4, 3, bottomCol);
      px(6, 22, 5, 2, shoeCol);
      px(8, 19, 4, 3, bottomCol);
      px(9, 22, 5, 2, shoeCol);
    } else {
      px(5, 19, 3, 3, bottomCol);
      px(5, 22, 4, 2, shoeCol);
      px(10, 19, 3, 3, bottomCol);
      px(10, 22, 4, 2, shoeCol);
    }
  }

  ctx.restore();
}

/**
 * Draws 8 Distinct Pixel-Art Villains across the 17 phases!
 */
export function drawPixelEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: EnemyPixelType,
  facing: 1 | -1,
  frameCount: number,
  label?: string
) {
  ctx.save();
  const s = 3; // 14x15 pixel grid = 42x45px
  const widthPx = 14 * s;
  ctx.translate(Math.round(x + widthPx / 2), Math.round(y));
  ctx.scale(facing, 1);
  ctx.translate(-Math.round(widthPx / 2), 0);

  const px = (gx: number, gy: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(gx * s, gy * s, w * s, h * s);
  };

  const anim = Math.floor(frameCount / 8) % 2;

  if (type === 'walker' || type === 'fragment') {
    // 1. Espectro Encapuzado com Foice
    px(2, 0, 2, 2, '#f59e0b');
    px(10, 0, 2, 2, '#f59e0b');
    px(3, 1, 8, 5, '#1e1b4b');
    px(2, 3, 10, 5, '#312e81');
    px(4, 3, 7, 4, '#090d16');
    px(5, 4, 2, 2, '#fde047');
    px(8, 4, 2, 2, '#fde047');
    px(1, 7, 12, 5, '#312e81');
    px(3, 8, 8, 4, '#4338ca');
    px(11, 6 + anim, 2, 2, '#cbd5e1');
    px(12, 3 + anim, 1, 7, '#94a3b8');
    px(10, 2 + anim, 4, 2, '#f43f5e');
    if (anim === 0) {
      px(1, 12, 3, 3, '#1e1b4b');
      px(5, 12, 3, 2, '#1e1b4b');
      px(9, 12, 3, 3, '#1e1b4b');
    } else {
      px(2, 12, 3, 2, '#1e1b4b');
      px(6, 12, 3, 3, '#1e1b4b');
      px(10, 12, 3, 2, '#1e1b4b');
    }
  } else if (type === 'jumper') {
    // 2. Gárgula Alada Saltadora
    px(3, 0, 2, 2, '#fbbf24');
    px(9, 0, 2, 2, '#fbbf24');
    px(4, 2, 6, 5, '#881337');
    px(5, 3, 2, 2, '#fef08a');
    px(8, 3, 2, 2, '#fef08a');
    px(5, 6, 1, 1, '#ffffff');
    px(8, 6, 1, 1, '#ffffff');
    const wingY = anim === 0 ? 2 : 6;
    px(0, wingY, 4, 4, '#be123c');
    px(10, wingY, 4, 4, '#be123c');
    px(0, wingY, 4, 1, '#f43f5e');
    px(10, wingY, 4, 1, '#f43f5e');
    px(4, 7, 6, 5, '#9f1239');
    px(5, 8, 4, 3, '#f43f5e');
    px(3, 12, 3, 3, '#4c0519');
    px(8, 12, 3, 3, '#4c0519');
  } else if (type === 'flyer') {
    // 3. Mariposa Sombria do Mito (Aerial Swooping Moth/Harpy)
    const wingFlap = anim === 0 ? -1 : 2;
    // Giant patterned pixel wings
    px(0, 2 + wingFlap, 5, 7, '#701a75');
    px(9, 2 + wingFlap, 5, 7, '#701a75');
    px(1, 3 + wingFlap, 3, 3, '#f472b6'); // Wing eyespots
    px(10, 3 + wingFlap, 3, 3, '#f472b6');
    // Antennae
    px(5, 0, 1, 3, '#fde047');
    px(8, 0, 1, 3, '#fde047');
    // Thorax & Glowing Eyes
    px(5, 3, 4, 8, '#4a044e');
    px(5, 4, 1, 2, '#38bdf8');
    px(8, 4, 1, 2, '#38bdf8');
    // Stinger tail
    px(6, 11, 2, 3, '#f43f5e');
  } else if (type === 'shield_knight') {
    // 4. Sentinela Couraçado da Inércia (Armored Knight with Tower Shield & Spear)
    // Plumed Helmet
    px(5, 0, 4, 2, '#ef4444');
    px(4, 2, 6, 5, '#475569');
    px(5, 4, 4, 1, '#fde047'); // Visor slit
    // Plate Armor Torso
    px(3, 7, 8, 5, '#334155');
    px(5, 8, 4, 3, '#64748b');
    // Heavy Tower Shield in front
    px(10, 4, 4, 9, '#1e293b');
    px(11, 5, 2, 7, '#f59e0b');
    // Long Spear extending forward
    px(8, 9 + anim, 6, 1, '#cbd5e1');
    px(13, 8 + anim, 2, 3, '#ef4444');
    // Greaves
    px(4, 12, 3, 3, '#1e293b');
    px(8, 12, 3, 3, '#1e293b');
  } else if (type === 'spiker') {
    // 5. Aranha Espinhosa da Tensão (Horned Spiked Arachnid)
    // Top Venom Spikes
    px(2, 2 - anim, 2, 3, '#10b981');
    px(6, 1 - anim, 2, 4, '#34d399');
    px(10, 2 - anim, 2, 3, '#10b981');
    // Armored Carapace
    px(2, 5, 10, 5, '#064e3b');
    px(3, 6, 8, 3, '#047857');
    // 4 Glowing Red Eyes
    px(4, 7, 1, 2, '#ef4444');
    px(6, 7, 1, 2, '#fde047');
    px(8, 7, 1, 2, '#fde047');
    px(10, 7, 1, 2, '#ef4444');
    // Articulated Spider Legs
    px(0, 9 + anim, 2, 5, '#022c22');
    px(3, 10 - anim, 2, 5, '#022c22');
    px(9, 10 + anim, 2, 5, '#022c22');
    px(12, 9 - anim, 2, 5, '#022c22');
  } else if (type === 'mage') {
    // 6. Feiticeiro da Desinformação (Floating Arcane Warlock with Staff)
    const floatY = anim === 0 ? 0 : 1;
    // Pointed Wizard Hat
    px(5, 0 + floatY, 4, 2, '#581c87');
    px(4, 2 + floatY, 6, 2, '#7e22ce');
    px(2, 4 + floatY, 10, 1, '#a855f7');
    // Shadow Face & Glowing Cyan Eyes
    px(4, 5 + floatY, 6, 3, '#090d16');
    px(5, 6 + floatY, 1, 1, '#38bdf8');
    px(8, 6 + floatY, 1, 1, '#38bdf8');
    // Arcane Robes
    px(3, 8 + floatY, 8, 6, '#581c87');
    px(5, 8 + floatY, 4, 6, '#c084fc');
    // Floating Orb Staff
    px(12, 3 + floatY, 1, 10, '#fde047');
    px(11, 1 + floatY, 3, 3, '#38bdf8');
  } else if (type === 'wave') {
    // 7. Serpente Dragão de Onda Pulsante
    px(3, 0 + anim, 2, 2, '#f59e0b');
    px(7, 1 - anim, 2, 2, '#f59e0b');
    px(11, 2 + anim, 2, 2, '#f59e0b');
    px(1, 3, 6, 6, '#3730a3');
    px(2, 4, 2, 2, '#fde047');
    px(1, 7, 2, 2, '#ffffff');
    px(6, 5 + anim, 4, 6, '#4f46e5');
    px(10, 7 - anim, 4, 6, '#6366f1');
    px(2, 11, 11, 3, '#818cf8');
  } else {
    // 8. Golem de Cristal (Meteor)
    px(5, 0, 4, 2, '#e879f9');
    px(2, 2, 10, 10, '#581c87');
    px(0, 4, 3, 5, '#7e22ce');
    px(11, 4, 3, 5, '#7e22ce');
    px(4, 5, 6, 2, '#fde047');
    px(5, 9, 4, 3, '#f43f5e');
    px(3, 12, 3, 3, '#3b0764');
    px(8, 12, 3, 3, '#3b0764');
  }

  ctx.restore();

  if (label) {
    ctx.save();
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + widthPx / 2, y - 6);
    ctx.restore();
  }
}

/**
 * Draws the 3 Giant Detailed Pixel-Art Bosses:
 * - Phase 5 (bossType = 5): A Sombra da Pressão (Storm Indigo-Amber Colossus)
 * - Phase 10 (bossType = 10): A Sombra do Descuido (Crystal Violet-Magenta Guardian)
 * - Phase 17 (bossType = 17): O Soberano do Silêncio & Adiamento (Crimson-Gold Emperor with 4 Wings, Hourglass Core & Twin Glaives!)
 */
export function drawPixelBoss(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bossPhase: 5 | 10 | 17,
  hitFlash: number,
  stageNum: number,
  frameCount: number
) {
  ctx.save();
  const s = 6; // 28x30 pixel grid = 168x180px
  const bx = Math.round(x);
  const by = Math.round(y);

  const px = (gx: number, gy: number, pw: number, ph: number, color: string) => {
    ctx.fillStyle = hitFlash > 0 ? '#fef08a' : color;
    ctx.fillRect(bx + gx * s, by + gy * s, pw * s, ph * s);
  };

  const armWave = Math.round(Math.sin(frameCount * 0.08) * 2);

  if (bossPhase === 17) {
    // ==================== 3º BOSS FINAL (FASE 17): O SOBERANO DO SILÊNCIO & ADIAMENTO ====================
    // 4 Grand Seraphic Shadow-Crimson Wings
    px(0, 2 - armWave, 6, 9, '#450a0a');
    px(22, 2 + armWave, 6, 9, '#450a0a');
    px(1, 13 + armWave, 5, 11, '#7f1d1d');
    px(22, 13 - armWave, 5, 11, '#7f1d1d');
    px(0, 4 - armWave, 2, 6, '#fbbf24');
    px(26, 4 + armWave, 2, 6, '#fbbf24');

    // Imperial Triple Crown of Time
    px(6, -1, 3, 5, '#fbbf24');
    px(12, -2, 4, 6, '#38bdf8'); // Central Chrono Diamond
    px(19, -1, 3, 5, '#fbbf24');
    px(6, 3, 16, 3, '#991b1b');

    // Armored Emperor Helm & 4 Blazing Eyes
    px(7, 6, 14, 7, '#18181b');
    px(8, 7, 4, 2, '#fde047');
    px(16, 7, 4, 2, '#fde047');
    px(9, 10, 3, 1, '#ef4444');
    px(16, 10, 3, 1, '#ef4444');

    // Royal Pauldrons
    px(3, 11 + armWave, 5, 5, '#991b1b');
    px(2, 10 + armWave, 3, 2, '#fbbf24');
    px(20, 11 - armWave, 5, 5, '#991b1b');
    px(23, 10 - armWave, 3, 2, '#fbbf24');

    // Obsidian Chestplate with Glowing Hourglass of Postponed Time (Ampulheta do Adiamento)!
    px(6, 13, 16, 12, '#450a0a');
    px(8, 14, 12, 10, '#090d16');
    // Golden Hourglass inside Chest
    px(11, 15, 6, 1, '#fbbf24'); // Top frame
    px(11, 16, 6, 2, '#fde047'); // Upper sand bulb
    px(13, 18, 2, 2, '#38bdf8'); // Center time nexus
    px(11, 20, 6, 2, '#f59e0b'); // Lower sand bulb
    px(11, 22, 6, 1, '#fbbf24'); // Bottom frame

    // Twin Plasma Glaives in Hands
    px(1, 16 + armWave, 3, 8, '#dc2626');
    px(0, 12 + armWave, 2, 14, '#fef08a'); // Left energy blade
    px(24, 16 - armWave, 3, 8, '#dc2626');
    px(26, 12 - armWave, 2, 14, '#fef08a'); // Right energy blade

    // Greaves
    px(7, 25, 5, 5, '#18181b');
    px(16, 25, 5, 5, '#18181b');
    px(6, 28, 6, 2, '#fbbf24');
    px(16, 28, 6, 2, '#fbbf24');
  } else {
    // ==================== BOSS 1 (FASE 5) & BOSS 2 (FASE 10) ====================
    const isBoss5 = bossPhase === 5;
    const darkArmor = isBoss5 ? '#1e1b4b' : '#2e1065';
    const midArmor = isBoss5 ? '#3730a3' : '#581c87';
    const trimGlow = isBoss5 ? '#f59e0b' : '#e879f9';
    const coreColor = isBoss5 ? '#ef4444' : '#38bdf8';

    px(1, 5 - armWave, 5, 16, darkArmor);
    px(22, 5 + armWave, 5, 16, darkArmor);
    px(0, 7 - armWave, 2, 10, trimGlow);
    px(26, 7 + armWave, 2, 10, trimGlow);

    px(6, 0, 3, 4, trimGlow);
    px(12, -1, 4, 5, '#fde047');
    px(19, 0, 3, 4, trimGlow);
    px(7, 3, 14, 3, midArmor);

    px(7, 6, 14, 7, darkArmor);
    px(9, 8, 4, 2, '#fde047');
    px(15, 8, 4, 2, '#fde047');
    px(10, 8, 2, 2, '#dc2626');
    px(16, 8, 2, 2, '#dc2626');
    px(9, 11, 10, 2, '#475569');
    px(10, 11, 1, 2, '#ffffff');
    px(13, 11, 2, 2, '#ffffff');
    px(17, 11, 1, 2, '#ffffff');

    px(3, 12 + armWave, 5, 5, midArmor);
    px(2, 11 + armWave, 2, 2, trimGlow);
    px(20, 12 - armWave, 5, 5, midArmor);
    px(24, 11 - armWave, 2, 2, trimGlow);

    px(6, 13, 16, 11, midArmor);
    px(8, 14, 12, 9, darkArmor);
    px(11, 16, 6, 5, trimGlow);
    px(12, 17, 4, 3, coreColor);

    px(1, 17 + armWave, 4, 6, darkArmor);
    px(0, 23 + armWave, 2, 3, '#fde047');
    px(3, 23 + armWave, 2, 3, '#fde047');
    px(23, 17 - armWave, 4, 6, darkArmor);
    px(23, 23 - armWave, 2, 3, '#fde047');
    px(26, 23 - armWave, 2, 3, '#fde047');

    px(7, 24, 5, 5, darkArmor);
    px(16, 24, 5, 5, darkArmor);
    px(6, 28, 6, 2, trimGlow);
    px(16, 28, 6, 2, trimGlow);
  }

  // Labels
  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('▼ PULE NA COROA OU USE SEU PODER ÚNICO ▼', bx + w / 2, by - 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(
    bossPhase === 5
      ? '1º CHEFÃO: SOMBRA DA PRESSÃO'
      : bossPhase === 10
      ? `2º CHEFÃO: SOMBRA DO DESCUIDO (ETAPA ${stageNum}/4)`
      : `3º CHEFÃO FINAL: SOBERANO DO ADIAMENTO (FASE ${stageNum}/3)`,
    bx + w / 2,
    by + h + 20
  );

  ctx.restore();
}

/**
 * Draws the detailed Pixel-Art Clínica Vittacare Building at the end of Level 17!
 */
export function drawPixelClinicaVittacare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  doorOpenRatio: number,
  frameCount: number
) {
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - 20, y + 210, 320, 20);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x - 10, y + 200, 300, 12);

  // Main Facade
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, 280, 200);

  ctx.fillStyle = '#e2e8f0';
  for (let py = y + 24; py < y + 195; py += 20) {
    ctx.fillRect(x + 6, py, 268, 2);
  }

  // Pillars
  ctx.fillStyle = '#0d9488';
  ctx.fillRect(x, y, 20, 200);
  ctx.fillRect(x + 260, y, 20, 200);

  // Roof Sign
  ctx.fillStyle = '#047857';
  ctx.fillRect(x - 14, y - 44, 308, 44);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(x - 14, y - 44, 308, 44);

  // Roof Cross Emblem
  const pulse = Math.sin(frameCount * 0.08) * 3;
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(x + 118, y - 86, 44, 40);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 118, y - 86, 44, 40);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(x + 135, y - 80, 10, 28);
  ctx.fillRect(x + 126, y - 71, 28, 10);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CLÍNICA VITTACARE', x + 140, y - 16);

  // Windows
  const winPositions = [36, 92, 152, 208];
  for (const wx of winPositions) {
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + wx, y + 26, 36, 40);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(x + wx + 4, y + 30, 10, 32);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + wx, y + 26, 36, 40);
  }

  // Sliding Glass Doors
  const doorW = 110;
  const doorH = 110;
  const doorX = x + 85;
  const doorY = y + 90;

  ctx.fillStyle = '#fef08a';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  ctx.fillStyle = `rgba(251, 191, 36, ${0.4 + Math.sin(frameCount * 0.06) * 0.15})`;
  ctx.fillRect(doorX + 10, doorY + 10, doorW - 20, doorH - 10);

  const slideOffset = Math.round(doorOpenRatio * 48);
  ctx.fillStyle = 'rgba(14, 165, 233, 0.82)';
  ctx.fillRect(doorX - slideOffset, doorY, doorW / 2, doorH);
  ctx.fillRect(doorX + doorW / 2 + slideOffset, doorY, doorW / 2, doorH);

  ctx.strokeStyle = '#047857';
  ctx.lineWidth = 5;
  ctx.strokeRect(doorX, doorY, doorW, doorH);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(doorX + 10, doorY - 24 + pulse, 90, 18);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px "JetBrains Mono", monospace';
  ctx.fillText('★ CHEGADA ★', doorX + 55, doorY - 11 + pulse);

  ctx.restore();
}
