import {
  SLOT_ROLE_4_LABELS,
  SLOT_ROLE_8_LABELS,
  SLOT_ROLE_ICONS,
  getRoleClass,
} from '../data/jobs';
import type { AdvancedModeSettings, PartySize } from '../types';

export interface PlayerInputsOptions {
  partySize: PartySize;
  isAdvancedMode: boolean;
  playerNames: string[];
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
  const { partySize, isAdvancedMode, playerNames, advancedSettings } = options;

  let cardsHtml = '';

  if (!isAdvancedMode) {
    const roleClass = getRoleClass('free');

    for (let i = 0; i < partySize; i++) {
      const inputId = `player-name-${i}`;

      cardsHtml += `
        <article class="player-card player-card--simple role-${roleClass}">
          <header class="player-card__header">
            <div class="role-select role-select--static">
              <span class="role-select__icon-wrap" aria-hidden="true">
                <img
                  class="role-select__icon"
                  src="${SLOT_ROLE_ICONS.free}"
                  alt=""
                  width="44"
                  height="44"
                />
              </span>
              <span class="role-select__text">
                <strong class="role-select__value">フリー</strong>
              </span>
            </div>
          </header>
          <div class="player-card__body">
            <label class="player-name-label" for="${inputId}">プレイヤー${i + 1}</label>
            <input
              class="player-name-input"
              id="${inputId}"
              type="text"
              data-player-input
              data-index="${i}"
              value="${escapeAttribute(playerNames[i] || '')}"
              placeholder="名前を入力（任意）"
              autocomplete="off"
            />
          </div>
        </article>
      `;
    }
  } else if (advancedSettings) {
    const roleLabels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;

    for (let i = 0; i < partySize; i++) {
      const player = advancedSettings.players[i];
      const currentRole = player.role;
      const excludedCount = player.excludedJobIds.length;
      const roleLabel = roleLabels[currentRole as keyof typeof roleLabels];
      const roleClass = getRoleClass(currentRole);
      const roleIcon = SLOT_ROLE_ICONS[currentRole];
      const inputId = `player-name-${i}`;
      const excludedCountBadge = excludedCount > 0
        ? `<span class="count-badge" aria-label="${excludedCount}件">${excludedCount}</span>`
        : '';

      cardsHtml += `
        <article class="player-card player-card--advanced role-${roleClass}">
          <header class="player-card__header">
            <button
              class="role-select"
              type="button"
              data-action="select-role"
              data-index="${i}"
              aria-label="プレイヤー${i + 1}のロールを変更。現在は${roleLabel}"
            >
              <span class="role-select__icon-wrap" aria-hidden="true">
                <img
                  class="role-select__icon"
                  src="${roleIcon}"
                  alt=""
                  width="44"
                  height="44"
                />
              </span>
              <span class="role-select__text">
                <strong class="role-select__value">${roleLabel}</strong>
              </span>
            </button>
          </header>

          <div class="player-card__body">
            <label class="player-name-label" for="${inputId}">プレイヤー${i + 1}</label>
            <input
              class="player-name-input"
              id="${inputId}"
              type="text"
              data-player-input
              data-index="${i}"
              value="${escapeAttribute(playerNames[i] || '')}"
              placeholder="名前を入力（任意）"
              autocomplete="off"
            />
          </div>

          <footer class="player-card__footer">
            <button
              class="exclude-jobs-button${excludedCount > 0 ? ' has-exclusions' : ''}"
              type="button"
              title="除外ジョブを設定"
              data-action="exclude-jobs"
              data-index="${i}"
              aria-label="プレイヤー${i + 1}の除外ジョブを設定${excludedCount > 0 ? `。現在${excludedCount}件` : ''}"
            >
              <span class="exclude-jobs-button__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <circle cx="12" cy="12" r="8" />
                  <path d="m7.8 7.8 8.4 8.4" />
                </svg>
              </span>
              <span class="visually-hidden">除外ジョブ</span>
              ${excludedCountBadge}
            </button>
          </footer>
        </article>
      `;
    }
  }

  container.innerHTML = `
    <div class="players-grid players-grid--${partySize}">
      ${cardsHtml}
    </div>
  `;
  return Array.from(container.querySelectorAll('[data-player-input]'));
}
