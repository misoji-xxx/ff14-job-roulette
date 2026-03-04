import type { SlotRole4, SlotRole8 } from './data/jobs';

export type PartySize = 4 | 8;

export interface PlayerSlotConfig4 {
  name: string;
  role: SlotRole4;
  excludedJobIds: string[];
}

export interface PlayerSlotConfig8 {
  name: string;
  role: SlotRole8;
  excludedJobIds: string[];
}

export type PlayerSlotConfig = PlayerSlotConfig4 | PlayerSlotConfig8;

export interface AdvancedModeSettings4 {
  partySize: 4;
  players: PlayerSlotConfig4[];
  noJobDuplicates: boolean;
  maintainStandardComposition: boolean;
}

export interface AdvancedModeSettings8 {
  partySize: 8;
  players: PlayerSlotConfig8[];
  noJobDuplicates: boolean;
  maintainStandardComposition: boolean;
}

export type AdvancedModeSettings = AdvancedModeSettings4 | AdvancedModeSettings8;

export function createDefaultPlayerSlot4(): PlayerSlotConfig4 {
  return {
    name: '',
    role: 'free',
    excludedJobIds: [],
  };
}

export function createDefaultPlayerSlot8(): PlayerSlotConfig8 {
  return {
    name: '',
    role: 'free',
    excludedJobIds: [],
  };
}

export function createDefaultAdvancedSettings4(): AdvancedModeSettings4 {
  return {
    partySize: 4,
    players: Array.from({ length: 4 }, () => createDefaultPlayerSlot4()),
    noJobDuplicates: false,
    maintainStandardComposition: true,
  };
}

export function createDefaultAdvancedSettings8(): AdvancedModeSettings8 {
  return {
    partySize: 8,
    players: Array.from({ length: 8 }, () => createDefaultPlayerSlot8()),
    noJobDuplicates: false,
    maintainStandardComposition: true,
  };
}
