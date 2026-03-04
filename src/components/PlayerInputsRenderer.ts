import {
  FREE_ICON,
  SLOT_ROLE_4_LABELS,
  SLOT_ROLE_8_LABELS,
  SLOT_ROLE_ICONS,
  getRoleClass,
  type SlotRole8,
} from '../data/jobs';
import type { AdvancedModeSettings, PartySize } from '../types';

export interface PlayerInputsOptions {
  partySize: PartySize;
  isAdvancedMode: boolean;
  advancedSettings?: AdvancedModeSettings;
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
        <div class="player-input-row">
          <span class="role-badge role-free">
            <img src="${FREE_ICON}" alt="free" class="role-icon" />
          </span>
          <input
            type="text"
            class="player-input"
            data-index="${i}"
            placeholder="プレイヤー${i + 1}"
          />
        </div>
      `;
    }
  } else if (advancedSettings) {
    const roleLabels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;

    for (let i = 0; i < partySize; i++) {
      const player = advancedSettings.players[i];
      const currentRole = player.role;
      const iconSrc = SLOT_ROLE_ICONS[currentRole as SlotRole8] || FREE_ICON;
      const excludedCount = player.excludedJobIds.length;

      const roleClass = getRoleClass(currentRole as SlotRole8);
      const roleLabel = roleLabels[currentRole as keyof typeof roleLabels];

      html += `
        <div class="player-input-row advanced">
          <button type="button" class="role-select-btn role-${roleClass}" data-index="${i}" title="ロール設定">
            <img src="${iconSrc}" alt="${currentRole}" class="role-icon" />
            <span class="role-label">${roleLabel}</span>
          </button>
          <input
            type="text"
            class="player-input"
            data-index="${i}"
            placeholder="プレイヤー${i + 1}"
            value="${player.name}"
          />
          <button type="button" class="exclude-btn ${excludedCount > 0 ? 'has-excluded' : ''}" data-index="${i}" data-tooltip="割り当てたくないジョブを除外">
            <span class="exclude-icon">🚫</span>
            ${excludedCount > 0 ? `<span class="exclude-count">${excludedCount}</span>` : ''}
          </button>
        </div>
      `;
    }
  }

  container.innerHTML = html;
  return Array.from(container.querySelectorAll('.player-input'));
}
