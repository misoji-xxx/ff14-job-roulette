import {
  FREE_ICON,
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
      <div class="modal-overlay" id="${this.ids.modal}">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h3>ロール設定</h3>
            <button type="button" class="modal-close" id="${this.ids.closeBtn}">&times;</button>
          </div>
          <div class="modal-body">
            <div class="role-grid" id="${this.ids.roleGrid}"></div>
          </div>
        </div>
      </div>
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

    const modal = document.getElementById(this.ids.modal);
    const roleGrid = document.getElementById(this.ids.roleGrid);

    if (!modal || !roleGrid) return;

    const roleLabels = partySize === 4 ? SLOT_ROLE_4_LABELS : SLOT_ROLE_8_LABELS;

    const renderRoleButton = (role: string) => {
      const iconSrc = SLOT_ROLE_ICONS[role as SlotRole8] || FREE_ICON;
      const roleClass = getRoleClass(role as SlotRole8);
      const isSelected = role === currentRole;
      return `
        <button
          type="button"
          class="role-option role-${roleClass} ${isSelected ? 'selected' : ''}"
          data-role="${role}"
        >
          <img src="${iconSrc}" alt="${role}" class="role-option-icon" />
          <span class="role-option-name">${roleLabels[role as keyof typeof roleLabels]}</span>
        </button>
      `;
    };

    if (partySize === 4) {
      roleGrid.innerHTML = `
        <div class="role-category">
          <div class="role-category-header">タンク</div>
          <div class="role-category-options">
            ${renderRoleButton('tank')}
          </div>
        </div>
        <div class="role-category">
          <div class="role-category-header">ヒーラー</div>
          <div class="role-category-options">
            ${renderRoleButton('healer')}
          </div>
        </div>
        <div class="role-category">
          <div class="role-category-header">DPS</div>
          <div class="role-category-options">
            ${renderRoleButton('dps')}
          </div>
        </div>
        <div class="role-category">
          <div class="role-category-header">その他</div>
          <div class="role-category-options">
            ${renderRoleButton('free')}
          </div>
        </div>
      `;
    } else {
      roleGrid.innerHTML = `
        <div class="role-category">
          <div class="role-category-header">タンク</div>
          <div class="role-category-options">
            ${renderRoleButton('tank')}
          </div>
        </div>
        <div class="role-category">
          <div class="role-category-header">ヒーラー</div>
          <div class="role-category-options">
            ${renderRoleButton('healer')}
            ${renderRoleButton('pureHealer')}
            ${renderRoleButton('barrierHealer')}
          </div>
        </div>
        <div class="role-category">
          <div class="role-category-header">DPS</div>
          <div class="role-category-options">
            ${renderRoleButton('dps')}
            ${renderRoleButton('melee')}
            ${renderRoleButton('ranged')}
            ${renderRoleButton('caster')}
          </div>
        </div>
        <div class="role-category">
          <div class="role-category-header">その他</div>
          <div class="role-category-options">
            ${renderRoleButton('free')}
          </div>
        </div>
      `;
    }

    modal.classList.add('visible');
  }

  close(): void {
    const modal = document.getElementById(this.ids.modal);
    if (modal) modal.classList.remove('visible');

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
