import { describe, expect, it, vi } from 'vitest';
import { createDefaultAdvancedSettings4 } from '../types';
import { renderPlayerInputs } from './PlayerInputsRenderer';

describe('renderPlayerInputs', () => {
  it('除外設定をOSに依存しない線画アイコンで表示する', () => {
    const containerStub = {
      innerHTML: '',
      querySelectorAll: vi.fn(() => []),
    };

    renderPlayerInputs(containerStub as unknown as HTMLElement, {
      partySize: 4,
      isAdvancedMode: true,
      playerNames: ['', '', '', ''],
      advancedSettings: createDefaultAdvancedSettings4(),
    });

    expect(containerStub.innerHTML).toContain('class="exclude-jobs-button__icon"');
    expect(containerStub.innerHTML).toContain('<svg');
    expect(containerStub.innerHTML).not.toContain('🚫');
  });
});
