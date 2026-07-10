import type { PartySize } from './types';

const MAX_PARTY_SIZE = 8;

export class PlayerNameStore {
  private readonly names = Array.from({ length: MAX_PARTY_SIZE }, () => '');

  set(index: number, name: string): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.names.length) return;
    this.names[index] = name;
  }

  valuesFor(partySize: PartySize): string[] {
    return this.names.slice(0, partySize);
  }
}
