import { JOB_EMOJIS } from '../data/jobs';
import type { PartyMember } from '../roulette';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

type ResultCardAnimation = 'enter' | 'reroll';

function renderResultCard(
  member: PartyMember,
  index: number,
  animation: ResultCardAnimation
): string {
  const jobIcon = member.job?.icon || '';
  const jobName = member.job?.name || '未定';
  const animationStyle = animation === 'enter'
    ? ` style="--result-delay: ${index * 65}ms"`
    : '';

  return `
    <article class="result-card result-card--${animation}" data-result-index="${index}"${animationStyle}>
      <div class="result-card__job-icon-wrap" aria-hidden="true">
        <img
          class="result-card__job-icon"
          src="${jobIcon}"
          alt=""
          width="64"
          height="64"
        />
      </div>

      <div class="result-card__content">
        <p class="result-card__player-name">${escapeHtml(member.name)}</p>
        <p class="result-card__job-name">
          <strong>${escapeHtml(jobName)}</strong>
        </p>
      </div>

      <button
        class="result-card__reroll"
        type="button"
        data-action="reroll"
        data-index="${index}"
        aria-label="プレイヤー${index + 1}のジョブを再抽選"
      >
        再抽選
      </button>
    </article>
  `;
}

export function renderResults(
  container: HTMLElement,
  members: PartyMember[]
): void {
  let cardsHtml = '';

  for (let i = 0; i < members.length; i++) {
    cardsHtml += renderResultCard(members[i], i, 'enter');
  }

  container.innerHTML = `
    <div class="results-grid">
      ${cardsHtml}
    </div>
    <footer class="results-footer">
      <button class="copy-results-button" type="button" id="copyResultsBtn">
        <span class="copy-results-button__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" />
          </svg>
        </span>
        <span data-copy-label>結果をコピー</span>
      </button>
    </footer>
  `;
}

export function renderSingleResult(
  container: HTMLElement,
  member: PartyMember,
  index: number
): void {
  const card = container.querySelector<HTMLElement>(`[data-result-index="${index}"]`);
  if (!card) return;
  card.outerHTML = renderResultCard(member, index, 'reroll');
}

export function renderError(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="results-error" role="alert">
      <span class="results-error__icon" aria-hidden="true">!</span>
      <div class="results-error__content">
        <p class="results-error__title">抽選できませんでした</p>
        <p class="results-error__message">${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

export function showResultsSection(): void {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.hidden = false;
    resultsSection.classList.remove('is-revealed');
    void resultsSection.offsetWidth;
    resultsSection.classList.add('is-revealed');
  }
}

export function hideResultsSection(): void {
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.hidden = true;
    resultsSection.classList.remove('is-revealed');
  }
}
