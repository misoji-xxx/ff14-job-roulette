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
      <dialog id="${this.ids.modal}" aria-labelledby="excludeModalHeading">
        <h2 id="excludeModalHeading">除外ジョブ設定</h2>
        <p>選択したジョブは割り当てから除外されます。</p>
        <div id="${this.ids.jobGrid}"></div>
        <button type="button" id="${this.ids.clearBtn}">クリア</button>
        <button type="button" id="${this.ids.saveBtn}">保存</button>
        <button type="button" id="${this.ids.closeBtn}">閉じる</button>
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

    jobGrid.innerHTML = ALL_JOBS.map(
      (job) => `
        <button
          type="button"
          data-job-id="${job.id}"
          aria-pressed="${this.tempExcludedJobIds.includes(job.id)}"
        >
          ${job.name}${this.tempExcludedJobIds.includes(job.id) ? '（除外中）' : ''}
        </button>
      `
    ).join('');

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
        const job = ALL_JOBS.find((item) => item.id === btn.dataset.jobId);
        btn.setAttribute('aria-pressed', 'false');
        if (job) btn.textContent = job.name;
      });
    }
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

    const job = ALL_JOBS.find((item) => item.id === jobId);
    if (job) {
      const isExcluded = this.tempExcludedJobIds.includes(jobId);
      btn.textContent = `${job.name}${isExcluded ? '（除外中）' : ''}`;
    }
  }

  isOpen(): boolean {
    return this.currentPlayerIndex >= 0;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }
}
