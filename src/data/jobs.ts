export type Role = 'tank' | 'healer' | 'dps';
export type DpsSubRole = 'melee' | 'ranged' | 'caster';
export type HealerSubRole = 'pure' | 'barrier';

// 高機能モード用のロール選択型
export type SlotRole4 = 'tank' | 'healer' | 'dps' | 'free';
export type SlotRole8 = 'tank' | 'healer' | 'pureHealer' | 'barrierHealer' | 'dps' | 'melee' | 'ranged' | 'caster' | 'free';

export interface Job {
  id: string;
  name: string;
  nameEn: string;
  role: Role;
  icon: string;
  dpsSubRole?: DpsSubRole;
  healerSubRole?: HealerSubRole;
}

export const ROLE_ICONS: Record<Role, string> = {
  tank: '/icons/roles/tank.png',
  healer: '/icons/roles/healer.png',
  dps: '/icons/roles/dps.png',
};

export const FREE_ICON = '/icons/roles/free.png';

export const TANK_JOBS: Job[] = [
  { id: 'pld', name: 'ナイト', nameEn: 'Paladin', role: 'tank', icon: '/icons/jobs/paladin.png' },
  { id: 'war', name: '戦士', nameEn: 'Warrior', role: 'tank', icon: '/icons/jobs/warrior.png' },
  { id: 'drk', name: '暗黒騎士', nameEn: 'Dark Knight', role: 'tank', icon: '/icons/jobs/darkknight.png' },
  { id: 'gnb', name: 'ガンブレイカー', nameEn: 'Gunbreaker', role: 'tank', icon: '/icons/jobs/gunbreaker.png' },
];

export const HEALER_JOBS: Job[] = [
  { id: 'whm', name: '白魔道士', nameEn: 'White Mage', role: 'healer', icon: '/icons/jobs/whitemage.png', healerSubRole: 'pure' },
  { id: 'sch', name: '学者', nameEn: 'Scholar', role: 'healer', icon: '/icons/jobs/scholar.png', healerSubRole: 'barrier' },
  { id: 'ast', name: '占星術師', nameEn: 'Astrologian', role: 'healer', icon: '/icons/jobs/astrologian.png', healerSubRole: 'pure' },
  { id: 'sge', name: '賢者', nameEn: 'Sage', role: 'healer', icon: '/icons/jobs/sage.png', healerSubRole: 'barrier' },
];

export const DPS_JOBS: Job[] = [
  // メレーDPS
  { id: 'mnk', name: 'モンク', nameEn: 'Monk', role: 'dps', icon: '/icons/jobs/monk.png', dpsSubRole: 'melee' },
  { id: 'drg', name: '竜騎士', nameEn: 'Dragoon', role: 'dps', icon: '/icons/jobs/dragoon.png', dpsSubRole: 'melee' },
  { id: 'nin', name: '忍者', nameEn: 'Ninja', role: 'dps', icon: '/icons/jobs/ninja.png', dpsSubRole: 'melee' },
  { id: 'sam', name: '侍', nameEn: 'Samurai', role: 'dps', icon: '/icons/jobs/samurai.png', dpsSubRole: 'melee' },
  { id: 'rpr', name: 'リーパー', nameEn: 'Reaper', role: 'dps', icon: '/icons/jobs/reaper.png', dpsSubRole: 'melee' },
  { id: 'vpr', name: 'ヴァイパー', nameEn: 'Viper', role: 'dps', icon: '/icons/jobs/viper.png', dpsSubRole: 'melee' },
  // レンジDPS
  { id: 'brd', name: '吟遊詩人', nameEn: 'Bard', role: 'dps', icon: '/icons/jobs/bard.png', dpsSubRole: 'ranged' },
  { id: 'mch', name: '機工士', nameEn: 'Machinist', role: 'dps', icon: '/icons/jobs/machinist.png', dpsSubRole: 'ranged' },
  { id: 'dnc', name: '踊り子', nameEn: 'Dancer', role: 'dps', icon: '/icons/jobs/dancer.png', dpsSubRole: 'ranged' },
  // キャスターDPS
  { id: 'blm', name: '黒魔道士', nameEn: 'Black Mage', role: 'dps', icon: '/icons/jobs/blackmage.png', dpsSubRole: 'caster' },
  { id: 'smn', name: '召喚士', nameEn: 'Summoner', role: 'dps', icon: '/icons/jobs/summoner.png', dpsSubRole: 'caster' },
  { id: 'rdm', name: '赤魔道士', nameEn: 'Red Mage', role: 'dps', icon: '/icons/jobs/redmage.png', dpsSubRole: 'caster' },
  { id: 'pct', name: 'ピクトマンサー', nameEn: 'Pictomancer', role: 'dps', icon: '/icons/jobs/pictomancer.png', dpsSubRole: 'caster' },
];

export const ALL_JOBS: Job[] = [...TANK_JOBS, ...HEALER_JOBS, ...DPS_JOBS];

export const ROLE_LABELS: Record<Role, string> = {
  tank: 'タンク',
  healer: 'ヒーラー',
  dps: 'DPS',
};

export const SLOT_ROLE_4_LABELS: Record<SlotRole4, string> = {
  tank: 'タンク',
  healer: 'ヒーラー',
  dps: 'DPS',
  free: 'フリー',
};

export const SLOT_ROLE_8_LABELS: Record<SlotRole8, string> = {
  tank: 'タンク',
  healer: 'ヒーラー',
  pureHealer: 'ピュアヒーラー',
  barrierHealer: 'バリアヒーラー',
  dps: 'DPS',
  melee: 'メレー',
  ranged: 'レンジ',
  caster: 'キャスター',
  free: 'フリー',
};

export const SLOT_ROLE_4_OPTIONS: SlotRole4[] = ['tank', 'healer', 'dps', 'free'];
export const SLOT_ROLE_8_OPTIONS: SlotRole8[] = ['tank', 'healer', 'pureHealer', 'barrierHealer', 'dps', 'melee', 'ranged', 'caster', 'free'];

export const SLOT_ROLE_ICONS: Record<SlotRole4 | SlotRole8, string> = {
  tank: '/icons/roles/tank.png',
  healer: '/icons/roles/healer.png',
  pureHealer: '/icons/roles/healer.png',
  barrierHealer: '/icons/roles/healer.png',
  dps: '/icons/roles/dps.png',
  melee: '/icons/roles/dps.png',
  ranged: '/icons/roles/dps.png',
  caster: '/icons/roles/dps.png',
  free: '/icons/roles/free.png',
};

export const JOB_EMOJIS: Record<string, string> = {
  pld: '🛡️',
  war: '🪓',
  drk: '🌑',
  gnb: '💥',
  whm: '🤍',
  sch: '🎓️',
  ast: '🌙',
  sge: '💠',
  mnk: '👊',
  drg: '🐉',
  nin: '🥷',
  sam: '👘',
  rpr: '☠️',
  vpr: '🐍',
  brd: '🎵',
  mch: '⚙️',
  dnc: '💃',
  blm: '🔥',
  smn: '🐦‍🔥',
  rdm: '🌹',
  pct: '🎨',
};

export type RoleClass = 'tank' | 'healer' | 'dps' | 'free';

export function getRoleClass(role: SlotRole4 | SlotRole8): RoleClass {
  if (role === 'free') return 'free';
  if (role === 'tank') return 'tank';
  if (role === 'healer' || role === 'pureHealer' || role === 'barrierHealer') return 'healer';
  return 'dps';
}

export function isValidSlotRole4(value: string): value is SlotRole4 {
  return SLOT_ROLE_4_OPTIONS.includes(value as SlotRole4);
}

export function isValidSlotRole8(value: string): value is SlotRole8 {
  return SLOT_ROLE_8_OPTIONS.includes(value as SlotRole8);
}
