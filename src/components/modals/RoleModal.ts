import {
  SLOT_ROLE_4_LABELS,
  SLOT_ROLE_8_LABELS,
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
      <dialog id="${this.ids.modal}" aria-labelledby="roleModalHeading">
        <h2 id="roleModalHeading">ロール設定</h2>
        <div id="${this.ids.roleGrid}"></div>
        <button type="button" id="${this.ids.closeBtn}">閉じる</button>
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
      return `
        <button
          type="button"
          data-role="${role}"
          aria-pressed="${isSelected}"
        >
          ${roleLabels[role as keyof typeof roleLabels]}${isSelected ? '（選択中）' : ''}
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
