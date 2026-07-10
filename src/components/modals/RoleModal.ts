import {
  SLOT_ROLE_4_LABELS,
  SLOT_ROLE_8_LABELS,
  SLOT_ROLE_ICONS,
  getRoleClass,
  type SlotRole4,
  type SlotRole8,
} from '../../data/jobs';
import type { PartySize } from '../../types';

export interface RoleModalCallbacks {
  onSelect: (playerIndex: number, role: SlotRole4 | SlotRole8) => void;
  onClose: () => void;
}

export interface RoleModalIds {
  modal: string;
  roleGrid: string;
  closeBtn: string;
}

const DEFAULT_IDS: RoleModalIds = {
  modal: 'roleModal',
  roleGrid: 'roleGrid',
  closeBtn: 'roleModalClose',
};

export class RoleModal {
  private currentPlayerIndex: number = -1;
  private callbacks: RoleModalCallbacks | null = null;
  private ids: RoleModalIds;

  constructor(ids: Partial<RoleModalIds> = {}) {
    this.ids = { ...DEFAULT_IDS, ...ids };
  }

  getIds(): RoleModalIds {
    return this.ids;
  }

  renderHTML(): string {
    return `
      <dialog id="${this.ids.modal}" class="app-dialog app-dialog--role" aria-labelledby="roleModalHeading">
        <div class="dialog-shell">
          <header class="dialog-header">
            <div>
              <h2 id="roleModalHeading">ロール設定</h2>
              <p class="dialog-description">このプレイヤーに割り当てるロールを選択します。</p>
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
            <div
              id="${this.ids.roleGrid}"
              class="role-grid"
              role="group"
              aria-label="割り当てるロール"
            ></div>
          </div>

        </div>
      </dialog>
    `;
  }

  open(
    playerIndex: number,
    currentRole: SlotRole4 | SlotRole8,
    partySize: PartySize,
    callbacks: RoleModalCallbacks
  ): void {
    this.currentPlayerIndex = playerIndex;
    this.callbacks = callbacks;

    const modal = document.getElementById(this.ids.modal) as HTMLDialogElement | null;
    const roleGrid = document.getElementById(this.ids.roleGrid);

    if (!modal || !roleGrid) return;

    const roleLabels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;

    const renderRoleButton = (role: SlotRole4 | SlotRole8) => {
      const isSelected = role === currentRole;
      const roleClass = getRoleClass(role);
      const roleLabel = roleLabels[role as keyof typeof roleLabels];
      return `
        <button
          type="button"
          class="role-card role-card--${roleClass}"
          data-role="${role}"
          data-role-class="${roleClass}"
          aria-pressed="${isSelected}"
        >
          <span class="role-card__icon-wrap" aria-hidden="true">
            <img
              class="role-card__icon"
              src="${SLOT_ROLE_ICONS[role]}"
              alt=""
              width="44"
              height="44"
            />
          </span>
          <span class="role-card__content">
            <span class="role-card__label">${roleLabel}</span>
          </span>
          <span class="role-card__selected" aria-hidden="true">
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
        </button>
      `;
    };

    const roles: (SlotRole4 | SlotRole8)[] = partySize === 4
      ? ['tank', 'healer', 'dps', 'free']
      : ['tank', 'healer', 'pureHealer', 'barrierHealer', 'dps', 'melee', 'ranged', 'caster', 'free'];

    roleGrid.innerHTML = roles.map(renderRoleButton).join('');
    modal.oncancel = (event) => {
      event.preventDefault();
      this.close();
    };
    modal.showModal();
  }

  close(): void {
    const modal = document.getElementById(this.ids.modal) as HTMLDialogElement | null;
    if (modal?.open) modal.close();
    if (modal) modal.oncancel = null;

    this.callbacks?.onClose();
    this.currentPlayerIndex = -1;
    this.callbacks = null;
  }

  selectRole(role: SlotRole4 | SlotRole8): void {
    if (this.currentPlayerIndex < 0 || !this.callbacks) return;

    this.callbacks.onSelect(this.currentPlayerIndex, role);
    this.close();
  }

  isOpen(): boolean {
    return this.currentPlayerIndex >= 0;
  }

  getCurrentPlayerIndex(): number {
    return this.currentPlayerIndex;
  }
}
