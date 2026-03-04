import {
  TANK_JOBS,
  HEALER_JOBS,
  DPS_JOBS,
  ALL_JOBS,
  type Job,
  type Role,
  type SlotRole4,
  type SlotRole8,
} from './data/jobs';
import type { AdvancedModeSettings } from './types';

export interface PartyMember {
  name: string;
  role: Role;
  job: Job | null;
  slotRole?: string;
  wasFreeSlot?: boolean;
}

export interface PartyComposition {
  tanks: number;
  healers: number;
  dps: number;
}

export const PARTY_COMPOSITIONS: Record<4 | 8, PartyComposition> = {
  4: { tanks: 1, healers: 1, dps: 2 },
  8: { tanks: 2, healers: 2, dps: 4 },
};

export interface DetailedPartyComposition8 {
  tank: number;
  pureHealer: number;
  barrierHealer: number;
  melee: number;
  ranged: number;
  caster: number;
}

export const STANDARD_COMPOSITION_8: DetailedPartyComposition8 = {
  tank: 2,
  pureHealer: 1,
  barrierHealer: 1,
  melee: 2,
  ranged: 1,
  caster: 1,
};

function getRandomItem<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot get random item from empty array');
  }
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getJobsByRole(role: Role): Job[] {
  switch (role) {
    case 'tank':
      return TANK_JOBS;
    case 'healer':
      return HEALER_JOBS;
    case 'dps':
      return DPS_JOBS;
  }
}

function getJobsBySlotRole(slotRole: SlotRole4 | SlotRole8): Job[] {
  switch (slotRole) {
    case 'tank':
      return TANK_JOBS;
    case 'healer':
      return HEALER_JOBS;
    case 'pureHealer':
      return HEALER_JOBS.filter((job) => job.healerSubRole === 'pure');
    case 'barrierHealer':
      return HEALER_JOBS.filter((job) => job.healerSubRole === 'barrier');
    case 'dps':
      return DPS_JOBS;
    case 'melee':
      return DPS_JOBS.filter((job) => job.dpsSubRole === 'melee');
    case 'ranged':
      return DPS_JOBS.filter((job) => job.dpsSubRole === 'ranged');
    case 'caster':
      return DPS_JOBS.filter((job) => job.dpsSubRole === 'caster');
    case 'free':
      return ALL_JOBS;
  }
}

type NonFreeSlotRole = Exclude<SlotRole4 | SlotRole8, 'free'>;

function slotRoleToRole(slotRole: NonFreeSlotRole): Role {
  switch (slotRole) {
    case 'tank':
      return 'tank';
    case 'healer':
    case 'pureHealer':
    case 'barrierHealer':
      return 'healer';
    case 'dps':
    case 'melee':
    case 'ranged':
    case 'caster':
      return 'dps';
  }
}

export function createPartyMembers(
  partySize: 4 | 8,
  playerNames: string[]
): PartyMember[] {
  const composition = PARTY_COMPOSITIONS[partySize];
  const members: PartyMember[] = [];

  const roles: Role[] = shuffle([
    ...Array(composition.tanks).fill('tank' as Role),
    ...Array(composition.healers).fill('healer' as Role),
    ...Array(composition.dps).fill('dps' as Role),
  ]);

  for (let i = 0; i < partySize; i++) {
    const name = playerNames[i]?.trim() || `プレイヤー${i + 1}`;
    members.push({
      name,
      role: roles[i],
      job: null,
    });
  }

  return members;
}

export function assignRandomJobs(members: PartyMember[]): PartyMember[] {
  return members.map((member) => ({
    ...member,
    job: getRandomItem(getJobsByRole(member.role)),
  }));
}

export function runRoulette(
  partySize: 4 | 8,
  playerNames: string[]
): PartyMember[] {
  const members = createPartyMembers(partySize, playerNames);
  return assignRandomJobs(members);
}

// ===== 高機能モード用関数 =====

interface RoleCount {
  tank: number;
  healer: number;
  dps: number;
}

interface DetailedRoleCount8 {
  tank: number;
  healer: number;
  pureHealer: number;
  barrierHealer: number;
  melee: number;
  ranged: number;
  caster: number;
}

function countFixedRoles(settings: AdvancedModeSettings): RoleCount {
  const count: RoleCount = { tank: 0, healer: 0, dps: 0 };

  for (const player of settings.players) {
    const role = player.role;
    if (role === 'free') continue;

    if (role === 'tank') {
      count.tank++;
    } else if (role === 'healer' || role === 'pureHealer' || role === 'barrierHealer') {
      count.healer++;
    } else {
      count.dps++;
    }
  }

  return count;
}

interface DetailedRoleCount8WithGeneric extends DetailedRoleCount8 {
  genericHealer: number;
  genericDps: number;
  free: number;
}

function countFixedRolesDetailed8(settings: AdvancedModeSettings): DetailedRoleCount8WithGeneric {
  const count: DetailedRoleCount8WithGeneric = {
    tank: 0,
    healer: 0,
    pureHealer: 0,
    barrierHealer: 0,
    melee: 0,
    ranged: 0,
    caster: 0,
    genericHealer: 0,
    genericDps: 0,
    free: 0,
  };

  for (const player of settings.players) {
    const role = player.role;

    switch (role) {
      case 'tank':
        count.tank++;
        break;
      case 'healer':
        count.genericHealer++;
        break;
      case 'pureHealer':
        count.pureHealer++;
        break;
      case 'barrierHealer':
        count.barrierHealer++;
        break;
      case 'dps':
        count.genericDps++;
        break;
      case 'melee':
        count.melee++;
        break;
      case 'ranged':
        count.ranged++;
        break;
      case 'caster':
        count.caster++;
        break;
      case 'free':
        count.free++;
        break;
    }
  }

  return count;
}

export function canMaintainStandardComposition(settings: AdvancedModeSettings): boolean {
  if (settings.partySize === 4) {
    const standard = PARTY_COMPOSITIONS[4];
    const fixed = countFixedRoles(settings);
    return (
      fixed.tank <= standard.tanks &&
      fixed.healer <= standard.healers &&
      fixed.dps <= standard.dps
    );
  }

  const standard = STANDARD_COMPOSITION_8;
  const fixed = countFixedRolesDetailed8(settings);

  const totalHealerFixed = fixed.healer + fixed.pureHealer + fixed.barrierHealer;
  const totalHealerStandard = standard.pureHealer + standard.barrierHealer;

  return (
    fixed.tank <= standard.tank &&
    totalHealerFixed <= totalHealerStandard &&
    fixed.pureHealer <= standard.pureHealer &&
    fixed.barrierHealer <= standard.barrierHealer &&
    fixed.melee <= standard.melee &&
    fixed.ranged <= standard.ranged &&
    fixed.caster <= standard.caster
  );
}

type ResolvedRole = 'tank' | 'healer' | 'dps' | 'pureHealer' | 'barrierHealer' | 'melee' | 'ranged' | 'caster';

function resolveAllSlotRoles(
  settings: AdvancedModeSettings,
  maintainStandard: boolean
): ResolvedRole[] {
  const resolvedRoles: (ResolvedRole | null)[] = settings.players.map((p) => {
    const role = p.role;
    if (role === 'free' || role === 'healer' || role === 'dps') {
      return null;
    }
    return role as ResolvedRole;
  });

  if (settings.partySize === 4) {
    return resolve4PlayerSlots(settings, resolvedRoles, maintainStandard);
  }

  return resolve8PlayerSlots(settings, resolvedRoles, maintainStandard);
}

function resolve4PlayerSlots(
  settings: AdvancedModeSettings,
  resolvedRoles: (ResolvedRole | null)[],
  maintainStandard: boolean
): ResolvedRole[] {
  const genericIndices: number[] = [];
  for (let i = 0; i < settings.players.length; i++) {
    const role = settings.players[i].role;
    if (role === 'free' || role === 'healer' || role === 'dps') {
      genericIndices.push(i);
    }
  }

  if (!maintainStandard) {
    const allRoles: ResolvedRole[] = ['tank', 'healer', 'dps'];
    for (const idx of genericIndices) {
      resolvedRoles[idx] = getRandomItem(allRoles);
    }
    return resolvedRoles as ResolvedRole[];
  }

  const standard = PARTY_COMPOSITIONS[4];
  const fixed = countFixedRoles(settings);

  const neededRoles: ResolvedRole[] = [];
  for (let i = 0; i < standard.tanks - fixed.tank; i++) neededRoles.push('tank');
  for (let i = 0; i < standard.healers - fixed.healer; i++) neededRoles.push('healer');
  for (let i = 0; i < standard.dps - fixed.dps; i++) neededRoles.push('dps');

  const shuffledNeeded = shuffle(neededRoles);
  let neededIdx = 0;
  for (const idx of genericIndices) {
    resolvedRoles[idx] = shuffledNeeded[neededIdx++] ?? getRandomItem(['tank', 'healer', 'dps']);
  }

  return resolvedRoles as ResolvedRole[];
}

function resolve8PlayerSlots(
  settings: AdvancedModeSettings,
  resolvedRoles: (ResolvedRole | null)[],
  maintainStandard: boolean
): ResolvedRole[] {
  const genericHealerIndices: number[] = [];
  const genericDpsIndices: number[] = [];
  const freeIndices: number[] = [];

  for (let i = 0; i < settings.players.length; i++) {
    const role = settings.players[i].role;
    if (role === 'healer') genericHealerIndices.push(i);
    else if (role === 'dps') genericDpsIndices.push(i);
    else if (role === 'free') freeIndices.push(i);
  }

  if (!maintainStandard) {
    const healerSubRoles: ResolvedRole[] = ['pureHealer', 'barrierHealer'];
    const dpsSubRoles: ResolvedRole[] = ['melee', 'ranged', 'caster'];
    const allRoles: ResolvedRole[] = ['tank', 'pureHealer', 'barrierHealer', 'melee', 'ranged', 'caster'];

    for (const idx of genericHealerIndices) {
      resolvedRoles[idx] = getRandomItem(healerSubRoles);
    }
    for (const idx of genericDpsIndices) {
      resolvedRoles[idx] = getRandomItem(dpsSubRoles);
    }
    for (const idx of freeIndices) {
      resolvedRoles[idx] = getRandomItem(allRoles);
    }
    return resolvedRoles as ResolvedRole[];
  }

  const standard = STANDARD_COMPOSITION_8;
  const fixed = countFixedRolesDetailed8(settings);

  const needed = {
    tank: Math.max(0, standard.tank - fixed.tank),
    pureHealer: Math.max(0, standard.pureHealer - fixed.pureHealer),
    barrierHealer: Math.max(0, standard.barrierHealer - fixed.barrierHealer),
    melee: Math.max(0, standard.melee - fixed.melee),
    ranged: Math.max(0, standard.ranged - fixed.ranged),
    caster: Math.max(0, standard.caster - fixed.caster),
  };

  const healerRolesToAssign: ResolvedRole[] = [];
  for (let i = 0; i < needed.pureHealer; i++) healerRolesToAssign.push('pureHealer');
  for (let i = 0; i < needed.barrierHealer; i++) healerRolesToAssign.push('barrierHealer');
  const shuffledHealerRoles = shuffle(healerRolesToAssign);

  let healerRoleIdx = 0;
  for (const idx of genericHealerIndices) {
    if (healerRoleIdx < shuffledHealerRoles.length) {
      const assignedRole = shuffledHealerRoles[healerRoleIdx++];
      resolvedRoles[idx] = assignedRole;
      if (assignedRole === 'pureHealer') needed.pureHealer--;
      else if (assignedRole === 'barrierHealer') needed.barrierHealer--;
    } else {
      resolvedRoles[idx] = getRandomItem(['pureHealer', 'barrierHealer'] as ResolvedRole[]);
    }
  }

  const dpsRolesToAssign: ResolvedRole[] = [];
  for (let i = 0; i < needed.melee; i++) dpsRolesToAssign.push('melee');
  for (let i = 0; i < needed.ranged; i++) dpsRolesToAssign.push('ranged');
  for (let i = 0; i < needed.caster; i++) dpsRolesToAssign.push('caster');
  const shuffledDpsRoles = shuffle(dpsRolesToAssign);

  let dpsRoleIdx = 0;
  for (const idx of genericDpsIndices) {
    if (dpsRoleIdx < shuffledDpsRoles.length) {
      const assignedRole = shuffledDpsRoles[dpsRoleIdx++];
      resolvedRoles[idx] = assignedRole;
      if (assignedRole === 'melee') needed.melee--;
      else if (assignedRole === 'ranged') needed.ranged--;
      else if (assignedRole === 'caster') needed.caster--;
    } else {
      resolvedRoles[idx] = getRandomItem(['melee', 'ranged', 'caster'] as ResolvedRole[]);
    }
  }

  const remainingNeeded: ResolvedRole[] = [];
  for (let i = 0; i < needed.tank; i++) remainingNeeded.push('tank');
  for (let i = 0; i < needed.pureHealer; i++) remainingNeeded.push('pureHealer');
  for (let i = 0; i < needed.barrierHealer; i++) remainingNeeded.push('barrierHealer');
  for (let i = 0; i < needed.melee; i++) remainingNeeded.push('melee');
  for (let i = 0; i < needed.ranged; i++) remainingNeeded.push('ranged');
  for (let i = 0; i < needed.caster; i++) remainingNeeded.push('caster');
  const shuffledRemaining = shuffle(remainingNeeded);

  let remainingIdx = 0;
  for (const idx of freeIndices) {
    if (remainingIdx < shuffledRemaining.length) {
      resolvedRoles[idx] = shuffledRemaining[remainingIdx++];
    } else {
      resolvedRoles[idx] = getRandomItem(['tank', 'pureHealer', 'barrierHealer', 'melee', 'ranged', 'caster'] as ResolvedRole[]);
    }
  }

  return resolvedRoles as ResolvedRole[];
}

export interface AdvancedRouletteResult {
  success: boolean;
  members: PartyMember[];
  error?: string;
}

export interface RerollOptions {
  noJobDuplicates: boolean;
  excludedJobIds: string[];
}

function isGenericSlot(role: string): boolean {
  return role === 'free' || role === 'healer' || role === 'dps';
}

export function runAdvancedRoulette(settings: AdvancedModeSettings): AdvancedRouletteResult {
  const effectiveMaintainStandard =
    settings.maintainStandardComposition && canMaintainStandardComposition(settings);

  const resolvedRoles = resolveAllSlotRoles(settings, effectiveMaintainStandard);

  const resolvedSlots: { name: string; role: ResolvedRole; excludedJobIds: string[]; wasGeneric: boolean; originalRole: string }[] = [];

  for (let i = 0; i < settings.players.length; i++) {
    const player = settings.players[i];
    resolvedSlots.push({
      name: player.name,
      role: resolvedRoles[i],
      excludedJobIds: player.excludedJobIds,
      wasGeneric: isGenericSlot(player.role),
      originalRole: player.role,
    });
  }

  const usedJobIds = new Set<string>();
  const members: PartyMember[] = [];

  for (let i = 0; i < resolvedSlots.length; i++) {
    const slot = resolvedSlots[i];
    const name = slot.name.trim() || `プレイヤー${i + 1}`;
    const baseRole = slotRoleToRole(slot.role);

    let availableJobs = getJobsBySlotRole(slot.role);

    if (slot.excludedJobIds.length > 0) {
      availableJobs = availableJobs.filter(
        (job) => !slot.excludedJobIds.includes(job.id)
      );
    }

    if (settings.noJobDuplicates) {
      availableJobs = availableJobs.filter((job) => !usedJobIds.has(job.id));
    }

    if (availableJobs.length === 0) {
      return {
        success: false,
        members: [],
        error: `${name} に割り当て可能なジョブがありません。除外設定やジョブ重複禁止設定を見直してください。`,
      };
    }

    const selectedJob = getRandomItem(availableJobs);
    usedJobIds.add(selectedJob.id);

    members.push({
      name,
      role: baseRole,
      job: selectedJob,
      slotRole: slot.role,
      wasFreeSlot: slot.wasGeneric,
    });
  }

  return {
    success: true,
    members,
  };
}

export interface RerollResult {
  success: boolean;
  member: PartyMember | null;
  error?: string;
}

export function rerollSingleMember(
  members: PartyMember[],
  targetIndex: number,
  options: RerollOptions
): RerollResult {
  if (targetIndex < 0 || targetIndex >= members.length) {
    return {
      success: false,
      member: null,
      error: '無効なインデックスです',
    };
  }

  const targetMember = members[targetIndex];

  const usedJobIds = new Set<string>();
  if (options.noJobDuplicates) {
    for (let i = 0; i < members.length; i++) {
      if (i !== targetIndex && members[i].job) {
        usedJobIds.add(members[i].job!.id);
      }
    }
  }

  let availableJobs: Job[];
  if (targetMember.slotRole) {
    availableJobs = getJobsBySlotRole(targetMember.slotRole as SlotRole4 | SlotRole8);
  } else {
    availableJobs = getJobsByRole(targetMember.role);
  }

  if (options.excludedJobIds.length > 0) {
    availableJobs = availableJobs.filter(
      (job) => !options.excludedJobIds.includes(job.id)
    );
  }

  if (options.noJobDuplicates) {
    availableJobs = availableJobs.filter((job) => !usedJobIds.has(job.id));
  }

  if (availableJobs.length === 0) {
    return {
      success: false,
      member: null,
      error: `${targetMember.name} に割り当て可能なジョブがありません`,
    };
  }

  const selectedJob = getRandomItem(availableJobs);

  return {
    success: true,
    member: {
      ...targetMember,
      job: selectedJob,
    },
  };
}
