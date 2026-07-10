import { ALL_JOBS } from '../../data/jobs';

export interface ExcludeJobModalCallbacks {
  onSave: (playerIndex: number, excludedJobIds: string[]) => void;
  onClose: () => void;
}

export interface ExcludeJobModalIds {
  modal: string;
  jobGrid: string;
  closeBtn: string;
  saveBtn: string;
  clearBtn: string;
}

const DEFAULT_IDS: ExcludeJobModalIds = {
  modal: 'excludeModal',
  jobGrid: 'jobGrid',
  closeBtn: 'modalClose',
  saveBtn: 'modalSave',
  clearBtn: 'modalClear',
};

export class ExcludeJobModal {
  private currentPlayerIndex: number = -1;
  private tempExcludedJobIds: string[] = [];
  private callbacks: ExcludeJobModalCallbacks | null = null;
  private boundHandleJobToggle: (e: Event) => void;
  private ids: ExcludeJobModalIds;

  constructor(ids: Partial<ExcludeJobModalIds> = {}) {
    this.ids = { ...DEFAULT_IDS, ...ids };
    this.boundHandleJobToggle = this.handleJobToggle.bind(this);
  }

  getIds(): ExcludeJobModalIds {
    return this.ids;
  }

  renderHTML(): string {
    return `
      <dialog id="${this.ids.modal}" class="app-dialog app-dialog--jobs" aria-labelledby="excludeModalHeading">
        <div class="dialog-shell">
          <header class="dialog-header">
            <div>
              <h2 id="excludeModalHeading">除外ジョブ設定</h2>
              <p class="dialog-description">選択したジョブは割り当てから除外されます。</p>
            </div>
            <button
              type="button"
              id="${this.ids.closeBtn}"
              class="dialog-close"
              aria-label="閉じる"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div class="dialog-body">
            <div class="dialog-selection-summary" aria-live="polite">
              <strong data-excluded-count="0">0</strong>
              <span>ジョブを除外</span>
            </div>
            <div
              id="${this.ids.jobGrid}"
              class="job-grid"
              role="group"
              aria-label="除外するジョブ"
            ></div>
          </div>

          <footer class="dialog-footer">
            <div class="dialog-footer__actions">
              <button type="button" id="${this.ids.clearBtn}" class="button button--secondary">
                クリア
              </button>
              <button type="button" id="${this.ids.saveBtn}" class="button button--primary">
                保存
              </button>
            </div>
          </footer>
        </div>
      </dialog>
    `;
  }

  open(playerIndex: number, excludedJobIds: string[], callbacks: ExcludeJobModalCallbacks): void {
    this.currentPlayerIndex = playerIndex;
    this.tempExcludedJobIds = [...excludedJobIds];
    this.callbacks = callbacks;

    const modal = document.getElementById(this.ids.modal) as HTMLDialogElement | null;
    const jobGrid = document.getElementById(this.ids.jobGrid);

    if (!modal || !jobGrid) return;

    jobGrid.innerHTML = ALL_JOBS.map((job) => {
      const isExcluded = this.tempExcludedJobIds.includes(job.id);
      return `
        <button
          type="button"
          class="job-card job-card--${job.role}"
          data-job-id="${job.id}"
          aria-pressed="${isExcluded}"
        >
          <span class="job-card__check" aria-hidden="true">
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              focusable="false"
            >
              <path d="M4 10.5l3.5 3.5L16 5.5" />
            </svg>
          </span>
          <img class="job-card__icon" src="${job.icon}" alt="" width="48" height="48" />
          <span class="job-card__content">
            <span class="job-card__name">${job.name}</span>
          </span>
        </button>
      `;
    }).join('');

    this.updateSelectionCount();
    jobGrid.addEventListener('click', this.boundHandleJobToggle);
    modal.oncancel = (event) => {
      event.preventDefault();
      this.close();
    };
    modal.showModal();
  }

  close(): void {
    const modal = document.getElementById(this.ids.modal) as HTMLDialogElement | null;
    const jobGrid = document.getElementById(this.ids.jobGrid);
    if (modal?.open) modal.close();
    if (modal) modal.oncancel = null;
    if (jobGrid) jobGrid.removeEventListener('click', this.boundHandleJobToggle);

    this.callbacks?.onClose();
    this.currentPlayerIndex = -1;
    this.tempExcludedJobIds = [];
    this.callbacks = null;
  }

  save(): void {
    if (this.currentPlayerIndex < 0 || !this.callbacks) return;

    this.callbacks.onSave(this.currentPlayerIndex, [...this.tempExcludedJobIds]);
    this.close();
  }

  clear(): void {
    this.tempExcludedJobIds = [];
    const jobGrid = document.getElementById(this.ids.jobGrid);
    if (jobGrid) {
      jobGrid.querySelectorAll<HTMLButtonElement>('[data-job-id]').forEach((btn) => {
        btn.setAttribute('aria-pressed', 'false');
      });
    }
    this.updateSelectionCount();
  }

  private handleJobToggle(e: Event): void {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-job-id]') as HTMLButtonElement;
    if (!btn) return;

    const jobId = btn.dataset.jobId;
    if (!jobId) return;

    if (this.tempExcludedJobIds.includes(jobId)) {
      this.tempExcludedJobIds = this.tempExcludedJobIds.filter((id) => id !== jobId);
      btn.setAttribute('aria-pressed', 'false');
    } else {
      this.tempExcludedJobIds.push(jobId);
      btn.setAttribute('aria-pressed', 'true');
    }

    this.updateSelectionCount();
  }

  private updateSelectionCount(): void {
    const modal = document.getElementById(this.ids.modal);
    const countElement = modal?.querySelector<HTMLElement>('[data-excluded-count]');
    if (countElement) {
      const count = String(this.tempExcludedJobIds.length);
      countElement.textContent = count;
      countElement.dataset.excludedCount = count;
    }
  }

  isOpen(): boolean {
    return this.currentPlayerIndex >= 0;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }
}
