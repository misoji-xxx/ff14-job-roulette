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
      <div class="modal-overlay" id="${this.ids.modal}">
        <div class="modal">
          <div class="modal-header">
            <h3>除外ジョブ設定</h3>
            <button type="button" class="modal-close" id="${this.ids.closeBtn}">&times;</button>
          </div>
          <div class="modal-body">
            <p class="modal-description">選択したジョブは割り当てから除外されます</p>
            <div class="job-grid" id="${this.ids.jobGrid}"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="modal-btn modal-btn-secondary" id="${this.ids.clearBtn}">クリア</button>
            <button type="button" class="modal-btn modal-btn-primary" id="${this.ids.saveBtn}">保存</button>
          </div>
        </div>
      </div>
    `;
  }

  open(playerIndex: number, excludedJobIds: string[], callbacks: ExcludeJobModalCallbacks): void {
    this.currentPlayerIndex = playerIndex;
    this.tempExcludedJobIds = [...excludedJobIds];
    this.callbacks = callbacks;

    const modal = document.getElementById(this.ids.modal);
    const jobGrid = document.getElementById(this.ids.jobGrid);

    if (!modal || !jobGrid) return;

    jobGrid.innerHTML = ALL_JOBS.map(
      (job) => `
        <button
          type="button"
          class="job-toggle ${this.tempExcludedJobIds.includes(job.id) ? 'excluded' : ''}"
          data-job-id="${job.id}"
        >
          <img src="${job.icon}" alt="${job.name}" class="job-toggle-icon" />
          <span class="job-toggle-name">${job.name}</span>
        </button>
      `
    ).join('');

    jobGrid.addEventListener('click', this.boundHandleJobToggle);
    modal.classList.add('visible');
  }

  close(): void {
    const modal = document.getElementById(this.ids.modal);
    const jobGrid = document.getElementById(this.ids.jobGrid);
    if (modal) modal.classList.remove('visible');
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
      jobGrid.querySelectorAll('.job-toggle').forEach((btn) => {
        btn.classList.remove('excluded');
      });
    }
  }

  private handleJobToggle(e: Event): void {
    const target = e.target as HTMLElement;
    const btn = target.closest('.job-toggle') as HTMLButtonElement;
    if (!btn) return;

    const jobId = btn.dataset.jobId;
    if (!jobId) return;

    if (this.tempExcludedJobIds.includes(jobId)) {
      this.tempExcludedJobIds = this.tempExcludedJobIds.filter((id) => id !== jobId);
      btn.classList.remove('excluded');
    } else {
      this.tempExcludedJobIds.push(jobId);
      btn.classList.add('excluded');
    }
  }

  isOpen(): boolean {
    return this.currentPlayerIndex >= 0;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }
}
