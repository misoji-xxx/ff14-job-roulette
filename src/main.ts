import './styles/index.css';
import {
  runRoulette,
  runAdvancedRoulette,
  rerollSingleMember,
  canMaintainStandardComposition,
  type PartyMember,
} from './roulette';
import { type SlotRole4, type SlotRole8, isValidSlotRole4, isValidSlotRole8 } from './data/jobs';
import {
  type PartySize,
  type AdvancedModeSettings,
  type AdvancedModeSettings4,
  type AdvancedModeSettings8,
  createDefaultAdvancedSettings4,
  createDefaultAdvancedSettings8,
} from './types';
import { ExcludeJobModal } from './components/modals/ExcludeJobModal';
import { RoleModal } from './components/modals/RoleModal';
import { renderPlayerInputs } from './components/PlayerInputsRenderer';
import {
  renderResults,
  renderError,
  showResultsSection,
  hideResultsSection,
  resultsToText,
} from './components/ResultsRenderer';

type AppMode = 'simple' | 'advanced';

class JobRouletteApp {
  private partySize: PartySize = 4;
  private appMode: AppMode = 'simple';
  private playerInputs: HTMLInputElement[] = [];
  private resultsContainer: HTMLElement | null = null;
  private advancedSettings4: AdvancedModeSettings4 = createDefaultAdvancedSettings4();
  private advancedSettings8: AdvancedModeSettings8 = createDefaultAdvancedSettings8();
  private lastResults: PartyMember[] = [];

  private excludeJobModal: ExcludeJobModal;
  private roleModal: RoleModal;

  constructor() {
    this.excludeJobModal = new ExcludeJobModal();
    this.roleModal = new RoleModal();
    this.render();
    this.setupEventListeners();
  }

  private get currentAdvancedSettings(): AdvancedModeSettings {
    return this.partySize === 4 ? this.advancedSettings4 : this.advancedSettings8;
  }

  private render(): void {
    const app = document.querySelector<HTMLDivElement>('#app');
    if (!app) {
      throw new Error('App container (#app) not found');
    }
    app.innerHTML = `
      <div class="container">
        <header class="header">
          <h1>FF14 ジョブルーレットβ</h1>
          <p class="subtitle">パーティメンバーのジョブをランダムに決定します</p>
        </header>

        <main class="main">
          <section class="section">
            <div class="mode-toggle-container">
              <button type="button" class="mode-toggle-btn ${this.appMode === 'simple' ? 'active' : ''}" data-mode="simple">
                シンプル
              </button>
              <button type="button" class="mode-toggle-btn ${this.appMode === 'advanced' ? 'active' : ''}" data-mode="advanced">
                高機能
              </button>
            </div>
          </section>

          <section class="section">
            <h2>パーティ人数</h2>
            <div class="party-size-buttons" role="group" aria-label="パーティ人数選択">
              <button type="button" class="party-size-btn ${this.partySize === 4 ? 'active' : ''}" data-size="4" aria-pressed="${this.partySize === 4}">
                4人
              </button>
              <button type="button" class="party-size-btn ${this.partySize === 8 ? 'active' : ''}" data-size="8" aria-pressed="${this.partySize === 8}">
                8人
              </button>
            </div>
          </section>

          ${this.appMode === 'advanced' ? this.renderAdvancedSettings() : ''}

          <section class="section">
            <h2>プレイヤー名${this.appMode === 'advanced' ? ' / ロール設定' : ''}</h2>
            <div class="player-inputs" id="playerInputs"></div>
          </section>

          <button type="button" class="roulette-btn" id="rouletteBtn" aria-label="ルーレットを開始してジョブをランダムに割り当てる">
            ルーレット開始
          </button>

          <section class="section results-section" id="resultsSection">
            <h2>結果</h2>
            <div class="results" id="results"></div>
          </section>
        </main>
      </div>

      ${this.excludeJobModal.renderHTML()}
      ${this.roleModal.renderHTML()}
    `;

    this.resultsContainer = document.getElementById('results');
    this.renderPlayerInputsSection();
  }

  private renderAdvancedSettings(): string {
    const settings = this.currentAdvancedSettings;
    const canMaintain = canMaintainStandardComposition(settings);

    return `
      <section class="section advanced-settings">
        <h2>詳細設定</h2>
        <div class="settings-group">
          <label class="checkbox-label">
            <input type="checkbox" id="noJobDuplicates" ${settings.noJobDuplicates ? 'checked' : ''} />
            <span>ジョブ重複禁止</span>
          </label>
          <label class="checkbox-label ${!canMaintain ? 'disabled' : ''}" data-tooltip="フリー枠を一般的なパーティ構成で埋めます">
            <input
              type="checkbox"
              id="maintainStandardComposition"
              ${settings.maintainStandardComposition ? 'checked' : ''}
              ${!canMaintain ? 'disabled' : ''}
            />
            <span>標準構成を維持${!canMaintain ? '（固定枠が超過）' : ''}</span>
          </label>
        </div>
      </section>
    `;
  }

  private renderPlayerInputsSection(): void {
    const container = document.getElementById('playerInputs');
    if (!container) {
      throw new Error('Player inputs container not found');
    }

    this.playerInputs = renderPlayerInputs(container, {
      partySize: this.partySize,
      isAdvancedMode: this.appMode === 'advanced',
      advancedSettings: this.appMode === 'advanced' ? this.currentAdvancedSettings : undefined,
    });

    this.setupPlayerInputListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      const modeBtn = target.closest('.mode-toggle-btn') as HTMLButtonElement;
      if (modeBtn) {
        const mode = modeBtn.dataset.mode as AppMode;
        if (mode) this.setAppMode(mode);
        return;
      }

      const sizeBtn = target.closest('.party-size-btn') as HTMLButtonElement;
      if (sizeBtn) {
        const sizeStr = sizeBtn.dataset.size;
        if (sizeStr) {
          const size = parseInt(sizeStr, 10) as PartySize;
          this.setPartySize(size);
        }
        return;
      }

      if (target.closest('#rouletteBtn')) {
        this.executeRoulette();
        return;
      }

      const roleSelectBtn = target.closest('.role-select-btn') as HTMLButtonElement;
      if (roleSelectBtn) {
        const index = parseInt(roleSelectBtn.dataset.index || '0', 10);
        this.openRoleModal(index);
        return;
      }

      const excludeBtn = target.closest('.exclude-btn') as HTMLButtonElement;
      if (excludeBtn) {
        const index = parseInt(excludeBtn.dataset.index || '0', 10);
        this.openExcludeModal(index);
        return;
      }

      const excludeIds = this.excludeJobModal.getIds();
      if (target.closest(`#${excludeIds.closeBtn}`) || target.id === excludeIds.modal) {
        this.excludeJobModal.close();
        return;
      }

      if (target.closest(`#${excludeIds.saveBtn}`)) {
        this.excludeJobModal.save();
        return;
      }

      if (target.closest(`#${excludeIds.clearBtn}`)) {
        this.excludeJobModal.clear();
        return;
      }

      const roleIds = this.roleModal.getIds();
      if (target.closest(`#${roleIds.closeBtn}`) || target.id === roleIds.modal) {
        this.roleModal.close();
        return;
      }

      const roleOption = target.closest('.role-option') as HTMLButtonElement;
      if (roleOption) {
        const roleValue = roleOption.dataset.role;
        if (roleValue) {
          const isValid = this.partySize === 4
            ? isValidSlotRole4(roleValue)
            : isValidSlotRole8(roleValue);
          if (isValid) {
            this.roleModal.selectRole(roleValue as SlotRole4 | SlotRole8);
          }
        }
        return;
      }

      const rerollBtn = target.closest('.reroll-btn') as HTMLButtonElement;
      if (rerollBtn) {
        const index = parseInt(rerollBtn.dataset.index || '0', 10);
        this.executeReroll(index);
        return;
      }

      if (target.closest('#copyResultsBtn')) {
        this.copyResultsToClipboard();
        return;
      }
    });

    document.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;

      if (target.id === 'noJobDuplicates') {
        const checkbox = target as HTMLInputElement;
        this.setNoJobDuplicates(checkbox.checked);
        return;
      }

      if (target.id === 'maintainStandardComposition') {
        const checkbox = target as HTMLInputElement;
        this.setMaintainStandardComposition(checkbox.checked);
        return;
      }
    });
  }

  private setupPlayerInputListeners(): void {
    this.playerInputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (this.appMode === 'advanced') {
          const index = parseInt(input.dataset.index || '0', 10);
          this.updatePlayerName(index, input.value);
        }
      });
    });
  }

  private setAppMode(mode: AppMode): void {
    this.appMode = mode;
    this.render();
  }

  private setPartySize(size: PartySize): void {
    this.partySize = size;
    this.render();
    hideResultsSection();
  }

  private setPlayerRole(index: number, role: SlotRole4 | SlotRole8): void {
    if (this.partySize === 4) {
      this.advancedSettings4.players[index].role = role as SlotRole4;
    } else {
      this.advancedSettings8.players[index].role = role as SlotRole8;
    }
    this.render();
  }

  private updatePlayerName(index: number, name: string): void {
    if (this.partySize === 4) {
      this.advancedSettings4.players[index].name = name;
    } else {
      this.advancedSettings8.players[index].name = name;
    }
  }

  private setNoJobDuplicates(value: boolean): void {
    if (this.partySize === 4) {
      this.advancedSettings4.noJobDuplicates = value;
    } else {
      this.advancedSettings8.noJobDuplicates = value;
    }
  }

  private setMaintainStandardComposition(value: boolean): void {
    if (this.partySize === 4) {
      this.advancedSettings4.maintainStandardComposition = value;
    } else {
      this.advancedSettings8.maintainStandardComposition = value;
    }
  }

  private openExcludeModal(playerIndex: number): void {
    const settings = this.currentAdvancedSettings;
    this.excludeJobModal.open(playerIndex, settings.players[playerIndex].excludedJobIds, {
      onSave: (index, excludedJobIds) => {
        this.saveExcludedJobs(index, excludedJobIds);
      },
      onClose: () => {},
    });
  }

  private saveExcludedJobs(playerIndex: number, excludedJobIds: string[]): void {
    if (this.partySize === 4) {
      this.advancedSettings4.players[playerIndex].excludedJobIds = excludedJobIds;
    } else {
      this.advancedSettings8.players[playerIndex].excludedJobIds = excludedJobIds;
    }
    this.renderPlayerInputsSection();
  }

  private openRoleModal(playerIndex: number): void {
    const settings = this.currentAdvancedSettings;
    const currentRole = settings.players[playerIndex].role;

    this.roleModal.open(playerIndex, currentRole, this.partySize, {
      onSelect: (index, role) => {
        this.setPlayerRole(index, role);
      },
      onClose: () => {},
    });
  }

  private getPlayerNames(): string[] {
    return this.playerInputs.map((input) => input.value);
  }

  private executeRoulette(): void {
    if (this.appMode === 'simple') {
      const playerNames = this.getPlayerNames();
      const results = runRoulette(this.partySize, playerNames);
      this.showResults(results);
    } else {
      const settings = this.currentAdvancedSettings;
      for (let i = 0; i < settings.players.length; i++) {
        settings.players[i].name = this.playerInputs[i]?.value || '';
      }

      const result = runAdvancedRoulette(settings);

      if (!result.success) {
        this.showError(result.error || 'エラーが発生しました');
        return;
      }

      this.showResults(result.members);
    }
  }

  private showResults(members: PartyMember[], rerollIndex?: number): void {
    if (!this.resultsContainer) {
      throw new Error('Results container not found');
    }

    this.lastResults = members;
    showResultsSection();

    const useSubRoleForFree =
      this.appMode === 'advanced' &&
      this.currentAdvancedSettings.maintainStandardComposition &&
      canMaintainStandardComposition(this.currentAdvancedSettings);

    renderResults(this.resultsContainer, members, {
      isAdvancedMode: this.appMode === 'advanced',
      partySize: this.partySize,
      useSubRoleForFree,
      rerollIndex,
    });
  }

  private executeReroll(index: number): void {
    if (this.lastResults.length === 0 || index >= this.lastResults.length) {
      return;
    }

    const noJobDuplicates = this.appMode === 'advanced'
      ? this.currentAdvancedSettings.noJobDuplicates
      : false;

    const excludedJobIds = this.appMode === 'advanced'
      ? this.currentAdvancedSettings.players[index]?.excludedJobIds || []
      : [];

    const result = rerollSingleMember(this.lastResults, index, {
      noJobDuplicates,
      excludedJobIds,
    });

    if (!result.success || !result.member) {
      this.showError(result.error || '再抽選に失敗しました');
      return;
    }

    this.lastResults[index] = result.member;
    this.showResults([...this.lastResults], index);
  }

  private showError(message: string): void {
    if (!this.resultsContainer) return;

    showResultsSection();
    renderError(this.resultsContainer, message);
  }

  private async copyResultsToClipboard(): Promise<void> {
    if (this.lastResults.length === 0) return;

    const text = resultsToText(this.lastResults);

    try {
      await navigator.clipboard.writeText(text);
      const copyBtn = document.getElementById('copyResultsBtn');
      if (copyBtn) {
        copyBtn.classList.add('copied');
        const textSpan = copyBtn.querySelector('.copy-text');
        if (textSpan) textSpan.textContent = 'コピーしました';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (textSpan) textSpan.textContent = '結果をコピー';
        }, 2000);
      }
    } catch {
      this.showError('クリップボードへのコピーに失敗しました');
    }
  }
}

new JobRouletteApp();
