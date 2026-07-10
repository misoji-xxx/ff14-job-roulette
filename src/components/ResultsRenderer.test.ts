import { describe, expect, it, vi } from 'vitest';
import type { PartyMember } from '../roulette';
import { renderResults, renderSingleResult } from './ResultsRenderer';

describe('renderResults', () => {
  it('結果コピー操作を線画アイコンとテキストで表示する', () => {
    const containerStub = { innerHTML: '' };

    renderResults(containerStub as unknown as HTMLElement, []);

    expect(containerStub.innerHTML).toContain('id="copyResultsBtn"');
    expect(containerStub.innerHTML).toContain('class="copy-results-button__icon"');
    expect(containerStub.innerHTML).toContain('<svg');
    expect(containerStub.innerHTML).toContain('結果をコピー');
  });
});

describe('renderSingleResult', () => {
  it('結果全体を変更せず、指定したプレイヤーのカードだけを再表示する', () => {
    const targetCard = { outerHTML: '<article>変更前</article>' };
    const containerStub = {
      innerHTML: '<div>結果全体</div>',
      querySelector: vi.fn((selector: string) =>
        selector === '[data-result-index="1"]' ? targetCard : null
      ),
    };
    const member: PartyMember = {
      name: 'アルファ',
      role: 'tank',
      job: {
        id: 'pld',
        name: 'ナイト',
        nameEn: 'Paladin',
        role: 'tank',
        icon: '/icons/jobs/paladin.png',
      },
    };

    renderSingleResult(containerStub as unknown as HTMLElement, member, 1);

    expect(containerStub.innerHTML).toBe('<div>結果全体</div>');
    expect(containerStub.querySelector).toHaveBeenCalledWith('[data-result-index="1"]');
    expect(targetCard.outerHTML).toContain('data-result-index="1"');
    expect(targetCard.outerHTML).toContain('result-card--reroll');
    expect(targetCard.outerHTML).toContain('ナイト');
  });
});
