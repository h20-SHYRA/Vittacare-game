export type CharacterId =
  | 'stephanie'
  | 'marcelo'
  | 'bianca'
  | 'leticia'
  | 'ronald'
  | 'nina'
  | 'samara'
  | 'leticia_mkt'
  | 'vivian'
  | 'barbara';

export type CharacterGroup = 'ENFERMAGEM' | 'MARKETING' | 'SOCIAS';

export type BiomeType =
  | 'GARDEN_MORNING'
  | 'STORM_FORTRESS'
  | 'SUNSET_CITY'
  | 'CRYSTAL_CAVERN'
  | 'STARLIGHT_VALLEY'
  | 'ROYAL_CITADEL';

export interface NurseCharacter {
  id: CharacterId;
  name: string;
  group: CharacterGroup;
  groupLabel: string;
  role: string;
  specialty: string;
  skillName: string;
  skillDescription: string;
  quote: string;
  baseColor: string;
  goldenSkinName: string;
  goldenSkinDescription: string;
  pitchOffset: number;
}

export interface CampaignPhase {
  phaseNumber: number;
  title: string;
  subtitle: string;
  type: 'CARE_STAGE' | 'BOSS_PRESSAO' | 'BOSS_DESCUIDO' | 'BOSS_SILENCIO';
  biome: BiomeType;
  biomeName: string;
  themeFocus: string;
  educationalTip: string;
}

export const IMAGES = {
  bossPressao: '/src/assets/images/boss_sombra_pressao_1791415668716.jpg',
  bossDescuido: '/src/assets/images/boss_sombra_descuido_1791415679036.jpg',
  nursesTeam: '/src/assets/images/equipe_enfermeiros_vittacare_1791415687582.jpg',
  clinicaFinale: '/src/assets/images/clinica_vittacare_final_1791415696629.jpg',
};

export const NURSES: NurseCharacter[] = [
  // ==================== ENFERMAGEM VITTACARE (4) ====================
  {
    id: 'stephanie',
    name: 'Stephanie',
    group: 'ENFERMAGEM',
    groupLabel: 'Enfermagem Vittacare',
    role: 'Enfermeira Obstétrica Sênior',
    specialty: 'Equilíbrio Gestacional',
    skillName: 'Onda Vital Esmeralda',
    skillDescription:
      'PODER ÚNICO: Dispara uma onda cardíaca esmeralda perfurante que atravessa vários inimigos, remove lentidão e cura +18 de Saúde.',
    quote: '“Cada consulta do pré-natal é um passo de amor e segurança para mãe e bebê.”',
    baseColor: '#10b981',
    goldenSkinName: 'Manto Aurora Vittacare',
    goldenSkinDescription: 'Uniforme cerimonial branco e dourado com insígnia luminosa de proteção materna.',
    pitchOffset: 0,
  },
  {
    id: 'marcelo',
    name: 'Marcelo',
    group: 'ENFERMAGEM',
    groupLabel: 'Enfermagem Vittacare',
    role: 'Enfermeiro de Monitoramento Vital',
    specialty: 'Vigilância da Pressão Arterial',
    skillName: 'Orbe Escudo 360°',
    skillDescription:
      'PODER ÚNICO: Ativa 3 esferas orbitais protetoras ao redor do corpo por 4 segundos e dispara um feixe laser ciano de precisão.',
    quote: '“Monitorar a pressão arterial regularmente previne surpresas e garante tranquilidade.”',
    baseColor: '#0ea5e9',
    goldenSkinName: 'Armadura Guardião Solar',
    goldenSkinDescription: 'Traje tático hospitalar com detalhes em ouro vivo e visor de precisão vital.',
    pitchOffset: 45,
  },
  {
    id: 'bianca',
    name: 'Bianca',
    group: 'ENFERMAGEM',
    groupLabel: 'Enfermagem Vittacare',
    role: 'Enfermeira de Educação em Saúde',
    specialty: 'Clareza & Informação Segura',
    skillName: 'Tríade Solar do Saber',
    skillDescription:
      'PODER ÚNICO: Lança um leque triplo de estrelas douradas em diferentes ângulos que ativam blocos [?] à distância e iluminam sombras.',
    quote: '“Informação também é cuidado: quando a mulher conhece sua saúde, ela ganha autonomia.”',
    baseColor: '#f59e0b',
    goldenSkinName: 'Túnica Farol do Saber',
    goldenSkinDescription: 'Traje especial com filigranas douradas que irradiam clareza contra sombras de dúvida.',
    pitchOffset: 90,
  },
  {
    id: 'leticia',
    name: 'Leticia',
    group: 'ENFERMAGEM',
    groupLabel: 'Enfermagem Vittacare',
    role: 'Enfermeira de Prevenção Integral',
    specialty: 'Rastreamento & Cuidado Contínuo',
    skillName: 'Bumerangue Magnético',
    skillDescription:
      'PODER ÚNICO: Arremessa um coração bumerangue que vai e volta causando dano duplo e puxa automaticamente todos os itens do mapa até você.',
    quote: '“Prevenção faz parte da saúde. Não deixe seus exames e cuidados para depois!”',
    baseColor: '#ec4899',
    goldenSkinName: 'Insígnia Estrela da Vida',
    goldenSkinDescription: 'Uniforme de gala Vittacare com detalhes em esmeralda imperial e aura dourada.',
    pitchOffset: 135,
  },

  // ==================== MARKETING DA CLÍNICA (4 - Todos com "Mkt" no nome; Meninas de Terno e Saia) ====================
  {
    id: 'ronald',
    name: 'Ronald Mkt',
    group: 'MARKETING',
    groupLabel: 'Marketing Vittacare',
    role: 'Diretor de Estratégia & Marketing',
    specialty: 'Alcance & Mobilização em Saúde',
    skillName: 'Onda Sônica Executiva',
    skillDescription:
      'PODER ÚNICO: Dispara um mega-anel sônico gigante que cresce pelo caminho, destrói barreiras sombrias e concede Super Velocidade.',
    quote: '“Levar informação de qualidade a cada família é o primeiro passo para transformar vidas.”',
    baseColor: '#3b82f6',
    goldenSkinName: 'Terno Executivo Imperial',
    goldenSkinDescription: 'Terno executivo de gala com lapela dourada e insígnia de inovação Vittacare.',
    pitchOffset: 170,
  },
  {
    id: 'nina',
    name: 'Nina Mkt',
    group: 'MARKETING',
    groupLabel: 'Marketing Vittacare',
    role: 'Especialista Sênior de Marca & Conteúdo',
    specialty: 'Comunicação Empática',
    skillName: 'Chamas Teleguiadas',
    skillDescription:
      'PODER ÚNICO: Conjura 3 esferas de fogo ruivo teleguiadas que perseguem automaticamente os inimigos e chefões na tela!',
    quote: '“Comunicar com empatia aproxima a mulher do cuidado que ela merece.”',
    baseColor: '#ea580c',
    goldenSkinName: 'Tailleur & Saia Solar',
    goldenSkinDescription: 'Conjunto executivo de blazer e saia lápis com acabamento dourado Vittacare.',
    pitchOffset: 210,
  },
  {
    id: 'samara',
    name: 'Samara Mkt',
    group: 'MARKETING',
    groupLabel: 'Marketing Vittacare',
    role: 'Gestora Sênior de Comunidade & Eventos',
    specialty: 'Conexão com Pacientes',
    skillName: 'Trovão de Engajamento',
    skillDescription:
      'PODER ÚNICO: Invoca raios violetas do céu que atingem até 3 inimigos simultaneamente na tela e restauram os pedestais de saúde.',
    quote: '“Quando criamos conexão verdadeira, ninguém caminha sozinho no cuidado com a saúde.”',
    baseColor: '#8b5cf6',
    goldenSkinName: 'Tailleur & Saia Ametista Ouro',
    goldenSkinDescription: 'Terno feminino acinturado e saia executiva com detalhes em ouro e ametista.',
    pitchOffset: 250,
  },
  {
    id: 'leticia_mkt',
    name: 'Letícia Mkt',
    group: 'MARKETING',
    groupLabel: 'Marketing Vittacare',
    role: 'Coordenadora de Campanhas Preventivas',
    specialty: 'Educação & Mobilização',
    skillName: 'Rajada Quádrupla Viral',
    skillDescription:
      'PODER ÚNICO: Dispara uma rajada veloz de 4 flechas luminosas consecutivas que causam alto dano em chefões e dobram os pontos.',
    quote: '“Campanhas educativas salvam vidas ao lembrar que prevenir é um ato de amor.”',
    baseColor: '#06b6d4',
    goldenSkinName: 'Tailleur & Saia Safira Dourada',
    goldenSkinDescription: 'Conjunto executivo de blazer e saia de alta performance com acabamento dourado.',
    pitchOffset: 290,
  },

  // ==================== SÓCIAS DA CLÍNICA VITTACARE (2 - Alta Costura Chique de Gala) ====================
  {
    id: 'vivian',
    name: 'Vivian',
    group: 'SOCIAS',
    groupLabel: 'Sócia da Clínica Vittacare',
    role: 'Sócia-Fundadora & Diretora Executiva',
    specialty: 'Excelência & Acolhimento Humanizado',
    skillName: 'Chuva Real de Estrelas',
    skillDescription:
      'PODER ÚNICO SUPREMO: Invoca uma chuva de 5 meteoros dourados da Clínica Vittacare do céu que purificam toda a tela e curam +15 HP!',
    quote: '“A Clínica Vittacare nasceu para ser um porto seguro de saúde, respeito e cuidado integral.”',
    baseColor: '#eab308',
    goldenSkinName: 'Alta Costura Imperial Vittacare',
    goldenSkinDescription: 'Vestido e blazer cape de gala bordô-imperial com joias de diamante e ouro puro.',
    pitchOffset: 330,
  },
  {
    id: 'barbara',
    name: 'Bárbara',
    group: 'SOCIAS',
    groupLabel: 'Sócia da Clínica Vittacare',
    role: 'Sócia-Diretora & Gestão Estratégica',
    specialty: 'Visão Estratégica & Bem-Estar',
    skillName: 'Raio Soberano Esmeralda',
    skillDescription:
      'PODER ÚNICO SUPREMO: Dispara um feixe duplo gigante de esmeralda e ouro que atravessa toda a tela horizontalmente e cria um Escudo Real!',
    quote: '“Excelência no cuidar é garantir que cada mulher seja acolhida com dignidade e prevenção.”',
    baseColor: '#14b8a6',
    goldenSkinName: 'Gala Diamante & Esmeralda',
    goldenSkinDescription: 'Alta costura em cetim esmeralda imperial com colar de diamantes e scarpin dourado.',
    pitchOffset: 370,
  },
];

export const CAMPAIGN_PHASES: CampaignPhase[] = [
  // BIOMA 1: JARDIM SOLAR DA GESTAÇÃO (Fases 1–3)
  {
    phaseNumber: 1,
    title: 'Início do Pré-Natal',
    subtitle: 'Primeira Consulta & Caderneta da Gestante',
    type: 'CARE_STAGE',
    biome: 'GARDEN_MORNING',
    biomeName: 'Jardim Solar da Gestação',
    themeFocus: 'Acolhimento precoce e registro clínico completo',
    educationalTip: 'Iniciar o pré-natal o quanto antes permite acompanhar cada trimestre com segurança.',
  },
  {
    phaseNumber: 2,
    title: 'Hidratação e Nutrição Materna',
    subtitle: 'Pontes Floridas do Equilíbrio Vital',
    type: 'CARE_STAGE',
    biome: 'GARDEN_MORNING',
    biomeName: 'Jardim Solar da Gestação',
    themeFocus: 'Alimentação equilibrada e redução do excesso de sódio',
    educationalTip: 'Manter boa hidratação e alimentação equilibrada auxilia no controle da pressão arterial.',
  },
  {
    phaseNumber: 3,
    title: 'Escuta Ativa e Sinais do Corpo',
    subtitle: 'Colinas do Acolhimento Obstétrico',
    type: 'CARE_STAGE',
    biome: 'GARDEN_MORNING',
    biomeName: 'Jardim Solar da Gestação',
    themeFocus: 'Atenção a dores de cabeça persistentes, inchaço súbito ou alterações visuais',
    educationalTip: 'Conhecer os sinais de alerta na gestação é um ato de proteção e autonomia.',
  },

  // BIOMA 2: FORTALEZA TEMPESTUOSA DA PRESSÃO (Fases 4–5)
  {
    phaseNumber: 4,
    title: 'Vigilância da Pressão Arterial',
    subtitle: 'Muralhas Elétricas da Prevenção',
    type: 'CARE_STAGE',
    biome: 'STORM_FORTRESS',
    biomeName: 'Fortaleza da Pressão',
    themeFocus: 'Aferição regular e acompanhamento pré-natal estruturado',
    educationalTip: 'A pressão arterial deve ser acompanhada durante a gestação em todas as consultas.',
  },
  {
    phaseNumber: 5,
    title: '1º Chefão: A Sombra da Pressão',
    subtitle: 'Hipertensão na Gestação & Acompanhamento Pré-Natal',
    type: 'BOSS_PRESSAO',
    biome: 'STORM_FORTRESS',
    biomeName: 'Arena da Sombra da Pressão',
    themeFocus: 'Superar ondas pulsantes de desequilíbrio com itens de acompanhamento e poderes únicos',
    educationalTip: 'O acompanhamento pré-natal é importante. A pressão arterial deve ser acompanhada durante a gestação.',
  },

  // BIOMA 3: CIDADE CREPUSCULAR DA INFORMAÇÃO (Fases 6–8)
  {
    phaseNumber: 6,
    title: 'Avenida da Informação Segura',
    subtitle: 'Vencendo Mitos sobre a Saúde da Mulher',
    type: 'CARE_STAGE',
    biome: 'SUNSET_CITY',
    biomeName: 'Metrópole Crepuscular',
    themeFocus: 'Educação em saúde baseada em evidências',
    educationalTip: 'Informação também é cuidado. Buscar fontes confiáveis protege sua saúde.',
  },
  {
    phaseNumber: 7,
    title: 'Exames Preventivos em Dia',
    subtitle: 'Torres de Rastreamento e Diagnóstico Precoce',
    type: 'CARE_STAGE',
    biome: 'SUNSET_CITY',
    biomeName: 'Metrópole Crepuscular',
    themeFocus: 'Papanicolau, exame clínico das mamas e check-ups regulares',
    educationalTip: 'Prevenção faz parte da saúde: exames periódicos cuidam do seu futuro.',
  },
  {
    phaseNumber: 8,
    title: 'Imunização e Proteção Contínua',
    subtitle: 'Passarelas Suspensas da Vacinação',
    type: 'CARE_STAGE',
    biome: 'SUNSET_CITY',
    biomeName: 'Metrópole Crepuscular',
    themeFocus: 'Vacinas atualizadas em todas as fases da vida',
    educationalTip: 'Manter a caderneta de vacinação atualizada protege você e quem você ama.',
  },

  // BIOMA 4: LABIRINTO DE CRISTAL DO DESCUIDO (Fases 9–10)
  {
    phaseNumber: 9,
    title: 'Travessia de Cristal do Autocuidado',
    subtitle: 'Superando os Fragmentos da Falta de Tempo',
    type: 'CARE_STAGE',
    biome: 'CRYSTAL_CAVERN',
    biomeName: 'Santuário de Cristal',
    themeFocus: 'Superar o adiamento dos próprios cuidados de saúde',
    educationalTip: 'Não deixe seus cuidados para depois. Sua saúde merece prioridade hoje.',
  },
  {
    phaseNumber: 10,
    title: '2º Chefão: A Sombra do Descuido',
    subtitle: 'As 4 Etapas: Informação, Prevenção, Cuidado e União',
    type: 'BOSS_DESCUIDO',
    biome: 'CRYSTAL_CAVERN',
    biomeName: 'Arena da Sombra do Descuido',
    themeFocus: 'Derrotar o colosso da falta de acompanhamento nas 4 etapas educativas',
    educationalTip: 'Informação também é cuidado. Prevenção faz parte da saúde. Não deixe seus cuidados para depois.',
  },

  // BIOMA 5: VALE DAS ESTRELAS & SAÚDE INTEGRAL (Fases 11–14)
  {
    phaseNumber: 11,
    title: 'Saúde Hormonal e Bem-Estar',
    subtitle: 'Viaduto Estelar do Equilíbrio Feminino',
    type: 'CARE_STAGE',
    biome: 'STARLIGHT_VALLEY',
    biomeName: 'Vale das Estrelas',
    themeFocus: 'Acompanhamento ginecológico e qualidade de vida',
    educationalTip: 'O cuidado integral acompanha a mulher em cada ciclo e fase da sua vida.',
  },
  {
    phaseNumber: 12,
    title: 'Saúde Emocional e Rede de Apoio',
    subtitle: 'Plataformas da Escuta e Acolhimento',
    type: 'CARE_STAGE',
    biome: 'STARLIGHT_VALLEY',
    biomeName: 'Vale das Estrelas',
    themeFocus: 'Acolhimento humanizado e saúde mental materna e feminina',
    educationalTip: 'Cuidar da mente e contar com uma rede de apoio fortalece a saúde física e emocional.',
  },
  {
    phaseNumber: 13,
    title: 'Planejamento Reprodutivo Consciente',
    subtitle: 'Constelação da Autonomia Feminina',
    type: 'CARE_STAGE',
    biome: 'STARLIGHT_VALLEY',
    biomeName: 'Vale das Estrelas',
    themeFocus: 'Orientação individualizada e escolhas informadas',
    educationalTip: 'Autonomia em saúde nasce do diálogo aberto com profissionais de confiança.',
  },
  {
    phaseNumber: 14,
    title: 'Check-up Ginecológico Completo',
    subtitle: 'Pontes de Aurora da Longevidade',
    type: 'CARE_STAGE',
    biome: 'STARLIGHT_VALLEY',
    biomeName: 'Vale das Estrelas',
    themeFocus: 'Rotina anual de exames laboratoriais e de imagem',
    educationalTip: 'O acompanhamento regular permite detectar alterações silenciosas antes que causem sintomas.',
  },

  // BIOMA 6: CITADELA DO TEMPO & AVENIDA CLÍNICA VITTACARE (Fases 15–17)
  {
    phaseNumber: 15,
    title: 'Quebrando o Tabu do Silêncio',
    subtitle: 'Torres Douradas do Diálogo Aberto',
    type: 'CARE_STAGE',
    biome: 'ROYAL_CITADEL',
    biomeName: 'Citadela Dourada Vittacare',
    themeFocus: 'Nunca ignorar sintomas ou adiar consultas por medo ou vergonha',
    educationalTip: 'Falar sobre sintomas sem tabus é essencial para um diagnóstico rápido e seguro.',
  },
  {
    phaseNumber: 16,
    title: 'Avenida Principal Vittacare',
    subtitle: 'O Último Caminho antes do Guardião Final',
    type: 'CARE_STAGE',
    biome: 'ROYAL_CITADEL',
    biomeName: 'Citadela Dourada Vittacare',
    themeFocus: 'União entre Enfermagem, Marketing e Sócias pela saúde da mulher',
    educationalTip: 'Prevenção, informação e acompanhamento profissional constroem uma vida mais saudável.',
  },
  {
    phaseNumber: 17,
    title: '3º Chefão Final: O Soberano do Silêncio & Adiamento',
    subtitle: 'Batalha Suprema + Chegada Real à Clínica Vittacare',
    type: 'BOSS_SILENCIO',
    biome: 'ROYAL_CITADEL',
    biomeName: 'Santuário & Clínica Vittacare',
    themeFocus: 'Vencer o Soberano do Adiamento e entrar pelas portas abertas da Clínica Vittacare!',
    educationalTip: 'Não deixe seus cuidados para depois! Cuidar também é prevenir — Bem-vinda à Clínica Vittacare!',
  },
];

export const PHASE5_EDUCATIONAL_MESSAGES = [
  '“O acompanhamento pré-natal é importante.”',
  '“A pressão arterial deve ser acompanhada durante a gestação.”',
];

export const PHASE10_EDUCATIONAL_MESSAGES = [
  '“Informação também é cuidado.”',
  '“Prevenção faz parte da saúde.”',
  '“Não deixe seus cuidados para depois.”',
];

export const PHASE17_EDUCATIONAL_MESSAGES = [
  '“Jamais silencie os sinais do seu corpo: procurar cuidado é um ato de coragem.”',
  '“O tempo é precioso: não adie seus exames e consultas preventivas.”',
  '“Cuidar também é prevenir — A Clínica Vittacare está de portas abertas para você!”',
];
