import {
  ROLE_LABELS,
  SLOT_ROLE_4_LABELS,
  SLOT_ROLE_8_LABELS,
  JOB_EMOJIS,
} from '../data/jobs';
import type { PartyMember } from '../roulette';
import type { PartySize } from '../types';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export interface ResultsRendererOptions {
  isAdvancedMode: boolean;
  partySize: PartySize;
  useSubRoleForFree: boolean;
  rerollIndex?: number;
}

function getRoleLabel(
  member: PartyMember,
  options: ResultsRendererOptions
): string {
  const { isAdvancedMode, partySize, useSubRoleForFree } = options;

  if (!isAdvancedMode) {
    return ROLE_LABELS[member.role];
  }
  if (member.wasFreeSlot) {
    if (useSubRoleForFree && member.slotRole) {
      const labels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;
      return labels[member.slotRole as keyof typeof labels] || ROLE_LABELS[member.role];
    }
    return ROLE_LABELS[member.role];
  }
  if (member.slotRole) {
    const labels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;
    return labels[member.slotRole as keyof typeof labels] || ROLE_LABELS[member.role];
  }
  return ROLE_LABELS[member.role];
}

export function resultsToText(members: PartyMember[]): string {
  const lines: string[] = [];
  for (const member of members) {
    const jobName = member.job?.name || '未定';
    const emoji = member.job ? JOB_EMOJIS[member.job.id] || '' : '';
    lines.push(`${member.name}: ${emoji}${jobName}`);
  }
  return lines.join('\n');
}

export function renderResults(
  container: HTMLElement,
  members: PartyMember[],
  options: ResultsRendererOptions
): void {
  const { rerollIndex } = options;
  const isReroll = rerollIndex !== undefined;

  let html = '';
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const roleLabel = getRoleLabel(member, options);

    const jobIcon = member.job?.icon || '';
    const shouldAnimate = !isReroll || i === rerollIndex;
    const delay = isReroll ? 0 : i * 0.05;
    const animationClass = shouldAnimate ? '' : ' no-animation';
    html += `
      <div class="result-card role-${member.role}${animationClass}" style="animation-delay: ${delay}s">
        <img src="${jobIcon}" alt="${member.job?.name || ''}" class="job-icon" />
        <div class="result-info">
          <div class="result-player">${escapeHtml(member.name)}</div>
          <div class="result-job">${member.job?.name || '未定'}</div>
        </div>
        <div class="result-role">${roleLabel}</div>
        <button type="button" class="reroll-btn" data-index="${i}" aria-label="${escapeHtml(member.name)}のジョブを再抽選">
          <svg class="reroll-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 4v6h6M23 20v-6h-6"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
      </div>
    `;
  }

  html += `
    <button type="button" class="copy-results-btn" id="copyResultsBtn" aria-label="結果をクリップボードにコピー">
      <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span class="copy-text">結果をコピー</span>
    </button>
  `;

  container.innerHTML = html;
}

export function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="error-message">
      <span class="error-icon">⚠️</span>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

export function showResultsSection(): void {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.classList.add('visible');
  }
}

export function hideResultsSection(): void {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.classList.remove('visible');
  }
}
