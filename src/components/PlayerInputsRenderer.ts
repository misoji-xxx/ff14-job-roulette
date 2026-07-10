import { SLOT_ROLE_4_LABELS, SLOT_ROLE_8_LABELS } from '../data/jobs';
import type { AdvancedModeSettings, PartySize } from '../types';

export interface PlayerInputsOptions {
  partySize: PartySize;
  isAdvancedMode: boolean;
  advancedSettings?: AdvancedModeSettings;
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function renderPlayerInputs(
  container: HTMLElement,
  options: PlayerInputsOptions
): HTMLInputElement[] {
  const { partySize, isAdvancedMode, advancedSettings } = options;

  let html = '';

  if (!isAdvancedMode) {
    for (let i = 0; i < partySize; i++) {
      html += `
        <p>
          <label>
            プレイヤー${i + 1}
            <input type="text" data-player-input data-index="${i}" />
          </label>
        </p>
      `;
    }
  } else if (advancedSettings) {
    const roleLabels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;

    for (let i = 0; i < partySize; i++) {
      const player = advancedSettings.players[i];
      const currentRole = player.role;
      const excludedCount = player.excludedJobIds.length;
      const roleLabel = roleLabels[currentRole as keyof typeof roleLabels];

      html += `
        <p>
          <button type="button" data-action="select-role" data-index="${i}">ロール: ${roleLabel}</button>
          <label>
            プレイヤー${i + 1}
            <input type="text" data-player-input data-index="${i}" value="${escapeAttribute(player.name)}" />
          </label>
          <button type="button" data-action="exclude-jobs" data-index="${i}">
            除外ジョブ${excludedCount > 0 ? ` (${excludedCount})` : ''}
          </button>
        </p>
      `;
    }
  }

  container.innerHTML = html;
  return Array.from(container.querySelectorAll('[data-player-input]'));
}
