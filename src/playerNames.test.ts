import { describe, expect, it } from 'vitest';
import { PlayerNameStore } from './playerNames';

describe('PlayerNameStore', () => {
  it('4人と8人を切り替えても表示済み・非表示の名前を維持する', () => {
    const store = new PlayerNameStore();
    store.set(0, 'アルファ');
    store.set(7, 'シータ');

    expect(store.valuesFor(4)).toEqual(['アルファ', '', '', '']);
    expect(store.valuesFor(8)).toEqual(['アルファ', '', '', '', '', '', '', 'シータ']);
    expect(store.valuesFor(4)).toEqual(['アルファ', '', '', '']);
  });
});
