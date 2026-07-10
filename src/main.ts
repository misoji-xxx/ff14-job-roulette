import './styles.css';
import {
  runRoulette,
  runAdvancedRoulette,
  rerollSingleMember,
  canMaintainStandardComposition,
  canMaintainAllianceComposition,
  type PartyMember,
} from './roulette';
import {
  type SlotRole4,
  type SlotRole8,
  isValidSlotRole4,
  isValidSlotRole8,
} from './data/jobs';
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
import { PlayerNameStore } from './playerNames';
import {
  renderResults,
  renderSingleResult,
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
  private playerNames = new PlayerNameStore();
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
      <div class="app-shell">
        <main class="main-content">
          <section class="hero" aria-labelledby="pageTitle">
            <div class="hero-copy">
              <h1 id="pageTitle">FFXIV JOB ROULETTE</h1>
              <p class="hero-description">
                パーティーメンバーと条件を設定し、次に使用するジョブをランダムに決定します。
              </p>
            </div>
          </section>

          <div class="content-stack">
            <section class="setup-panel" aria-labelledby="setupHeading">
              <header class="panel-heading">
                <div>
                  <h2 id="setupHeading">抽選設定</h2>
                  <p class="panel-description">抽選条件とプレイヤーを設定します。</p>
                </div>
              </header>

              <div class="configuration-grid">
                <fieldset class="control-group">
                  <legend>抽選モード</legend>
                  <p class="control-description">設定の詳細度を選択します。</p>
                  <div class="segmented-control">
                    <label class="segment-option">
                      <input class="visually-hidden" type="radio" name="appMode" value="simple" ${this.appMode === 'simple' ? 'checked' : ''} />
                      <span class="segment-copy">
                        <strong>シンプル</strong>
                      </span>
                    </label>
                    <label class="segment-option">
                      <input class="visually-hidden" type="radio" name="appMode" value="advanced" ${this.appMode === 'advanced' ? 'checked' : ''} />
                      <span class="segment-copy">
                        <strong>高機能</strong>
                      </span>
                    </label>
                  </div>
                </fieldset>

                <fieldset class="control-group">
                  <legend>パーティー人数</legend>
                  <p class="control-description">対象コンテンツの人数を選択します。</p>
                  <div class="segmented-control segmented-control--party">
                    <label class="segment-option">
                      <input class="visually-hidden" type="radio" name="partySize" value="4" ${this.partySize === 4 ? 'checked' : ''} />
                      <span class="segment-copy">
                        <strong>4人</strong>
                      </span>
                    </label>
                    <label class="segment-option">
                      <input class="visually-hidden" type="radio" name="partySize" value="8" ${this.partySize === 8 ? 'checked' : ''} />
                      <span class="segment-copy">
                        <strong>8人</strong>
                      </span>
                    </label>
                  </div>
                </fieldset>
              </div>

              ${this.appMode === 'advanced' ? this.renderAdvancedSettings() : ''}

              <section class="players-section" aria-labelledby="playersHeading">
                <div class="subsection-heading">
                  <div>
                    <h3 id="playersHeading">プレイヤー${this.appMode === 'advanced' ? '・ロール設定' : ''}</h3>
                  </div>
                  <span class="slot-count">${this.partySize}人</span>
                </div>
                <div id="playerInputs"></div>
              </section>

              <button type="button" id="rouletteBtn" class="roulette-button">
                <span class="roulette-button__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" />
                  </svg>
                </span>
                <span class="roulette-button__copy">
                  <strong>ルーレットを開始</strong>
                </span>
              </button>
            </section>

            <section id="resultsSection" class="results-panel" aria-labelledby="resultsHeading" hidden>
              <header class="panel-heading panel-heading--results">
                <div>
                  <h2 id="resultsHeading">抽選結果</h2>
                </div>
              </header>
              <div id="results"></div>
            </section>
          </div>
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
    const canMaintainAlliance = canMaintainAllianceComposition(settings);
    const allianceSetting = this.partySize === 8
      ? `
          <label class="setting-toggle">
            <input
              class="setting-toggle__input"
              type="checkbox"
              id="maintainAllianceComposition"
              ${settings.maintainAllianceComposition ? 'checked' : ''}
              ${!canMaintainAlliance ? 'disabled' : ''}
            />
            <span class="setting-toggle__control" aria-hidden="true"><span></span></span>
            <span class="setting-toggle__copy">
              <strong>アライアンス構成</strong>
              <small>${!canMaintainAlliance ? '固定枠が構成上限を超過しています' : '1T・2H・5DPSへ調整'}</small>
            </span>
          </label>
        `
      : '';

    return `
      <fieldset class="advanced-settings">
        <div class="advanced-settings__heading">
          <legend>詳細設定</legend>
        </div>
        <div class="settings-grid">
          <label class="setting-toggle">
            <input class="setting-toggle__input" type="checkbox" id="noJobDuplicates" ${settings.noJobDuplicates ? 'checked' : ''} />
            <span class="setting-toggle__control" aria-hidden="true"><span></span></span>
            <span class="setting-toggle__copy">
              <strong>ジョブ重複禁止</strong>
              <small>同一ジョブの重複を回避</small>
            </span>
          </label>
          <label class="setting-toggle">
            <input
              class="setting-toggle__input"
              type="checkbox"
              id="maintainStandardComposition"
              ${settings.maintainStandardComposition ? 'checked' : ''}
              ${!canMaintain ? 'disabled' : ''}
            />
            <span class="setting-toggle__control" aria-hidden="true"><span></span></span>
            <span class="setting-toggle__copy">
              <strong>標準構成を維持</strong>
              <small>${!canMaintain ? '固定枠が構成上限を超過しています' : this.partySize === 4 ? '1T・1H・2DPSへ調整' : '2T・2H・4DPSへ調整'}</small>
            </span>
          </label>
          ${allianceSetting}
        </div>
      </fieldset>
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
      playerNames: this.playerNames.valuesFor(this.partySize),
      advancedSettings: this.appMode === 'advanced' ? this.currentAdvancedSettings : undefined,
    });

    this.setupPlayerInputListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.closest('#rouletteBtn')) {
        this.executeRoulette();
        return;
      }

      const roleSelectBtn = target.closest('[data-action="select-role"]') as HTMLButtonElement;
      if (roleSelectBtn) {
        const index = parseInt(roleSelectBtn.dataset.index || '0', 10);
        this.openRoleModal(index);
        return;
      }

      const excludeBtn = target.closest('[data-action="exclude-jobs"]') as HTMLButtonElement;
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

      const roleOption = target.closest('[data-role]') as HTMLButtonElement;
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

      const rerollBtn = target.closest('[data-action="reroll"]') as HTMLButtonElement;
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

      if (target instanceof HTMLInputElement && target.name === 'appMode') {
        if (target.value === 'simple' || target.value === 'advanced') {
          this.setAppMode(target.value);
        }
        return;
      }

      if (target instanceof HTMLInputElement && target.name === 'partySize') {
        const size = Number(target.value);
        if (size === 4 || size === 8) {
          this.setPartySize(size);
        }
        return;
      }

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

      if (target.id === 'maintainAllianceComposition') {
        const checkbox = target as HTMLInputElement;
        this.setMaintainAllianceComposition(checkbox.checked);
        return;
      }
    });
  }

  private setupPlayerInputListeners(): void {
    this.playerInputs.forEach((input) => {
      input.addEventListener('input', () => {
        const index = parseInt(input.dataset.index || '0', 10);
        this.updatePlayerName(index, input.value);
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
    this.playerNames.set(index, name);

    const player4 = this.advancedSettings4.players[index];
    const player8 = this.advancedSettings8.players[index];
    if (player4) player4.name = name;
    if (player8) player8.name = name;
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
      if (value) {
        this.advancedSettings8.maintainAllianceComposition = false;
        const allianceCheckbox = document.getElementById('maintainAllianceComposition') as HTMLInputElement | null;
        if (allianceCheckbox) allianceCheckbox.checked = false;
      }
    }
  }

  private setMaintainAllianceComposition(value: boolean): void {
    if (this.partySize === 4) {
      this.advancedSettings4.maintainAllianceComposition = false;
    } else {
      this.advancedSettings8.maintainAllianceComposition = value;
      if (value) {
        this.advancedSettings8.maintainStandardComposition = false;
        const standardCheckbox = document.getElementById('maintainStandardComposition') as HTMLInputElement | null;
        if (standardCheckbox) standardCheckbox.checked = false;
      }
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
    this.playerInputs.forEach((input, index) => {
      this.updatePlayerName(index, input.value);
    });
    return this.playerNames.valuesFor(this.partySize);
  }

  private indicateRouletteActivity(): void {
    const button = document.getElementById('rouletteBtn') as HTMLButtonElement | null;
    if (!button) return;

    button.classList.remove('is-rolling');
    void button.offsetWidth;
    button.classList.add('is-rolling');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');

    window.setTimeout(() => {
      button.classList.remove('is-rolling');
      button.disabled = false;
      button.removeAttribute('aria-busy');
    }, 720);
  }

  private executeRoulette(): void {
    this.indicateRouletteActivity();

    if (this.appMode === 'simple') {
      const playerNames = this.getPlayerNames();
      const results = runRoulette(this.partySize, playerNames);
      this.showResults(results, true);
    } else {
      const settings = this.currentAdvancedSettings;
      for (let i = 0; i < settings.players.length; i++) {
        this.updatePlayerName(i, this.playerInputs[i]?.value || '');
      }

      const result = runAdvancedRoulette(settings);

      if (!result.success) {
        this.showError(result.error || 'エラーが発生しました', true);
        return;
      }

      this.showResults(result.members, true);
    }
  }

  private showResults(members: PartyMember[], shouldScroll = false): void {
    if (!this.resultsContainer) {
      throw new Error('Results container not found');
    }

    this.lastResults = members;
    showResultsSection();
    renderResults(this.resultsContainer, members);
    if (shouldScroll) this.scrollToResults();
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
    if (this.resultsContainer) {
      renderSingleResult(this.resultsContainer, result.member, index);
    }
  }

  private showError(message: string, shouldScroll = false): void {
    if (!this.resultsContainer) return;

    showResultsSection();
    renderError(this.resultsContainer, message);
    if (shouldScroll) this.scrollToResults();
  }

  private scrollToResults(): void {
    const resultsSection = document.getElementById('resultsSection');
    if (!resultsSection) return;

    window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      resultsSection.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  }

  private async copyResultsToClipboard(): Promise<void> {
    if (this.lastResults.length === 0) return;

    const text = resultsToText(this.lastResults);

    try {
      await navigator.clipboard.writeText(text);
      const copyBtn = document.getElementById('copyResultsBtn');
      const copyLabel = copyBtn?.querySelector<HTMLElement>('[data-copy-label]');
      if (copyLabel) {
        copyLabel.textContent = 'コピーしました';
        setTimeout(() => {
          copyLabel.textContent = '結果をコピー';
        }, 2000);
      }
    } catch {
      this.showError('クリップボードへのコピーに失敗しました');
    }
  }
}

new JobRouletteApp();
