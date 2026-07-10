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
  let html = '';
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const roleLabel = getRoleLabel(member, options);

    const jobIcon = member.job?.icon || '';
    html += `
      <p>
        <img src="${jobIcon}" alt="" width="38" height="38" />
        <strong>${escapeHtml(member.name)}</strong>: ${member.job?.name || '未定'} (${roleLabel})
        <button type="button" data-action="reroll" data-index="${i}">再抽選</button>
      </p>
    `;
  }

  html += `
    <button type="button" id="copyResultsBtn">結果をコピー</button>
  `;

  container.innerHTML = html;
}

export function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `<p role="alert">${escapeHtml(message)}</p>`;
}

export function showResultsSection(): void {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.hidden = false;
  }
}

export function hideResultsSection(): void {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.hidden = true;
  }
}
