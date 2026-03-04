import { describe, it, expect } from 'vitest';
import {
  runAdvancedRoulette,
  canMaintainStandardComposition,
  rerollSingleMember,
  STANDARD_COMPOSITION_8,
} from './roulette';
import type { AdvancedModeSettings8, PlayerSlotConfig8 } from './types';

function createSettings8(
  roles: PlayerSlotConfig8['role'][],
  options: Partial<Pick<AdvancedModeSettings8, 'noJobDuplicates' | 'maintainStandardComposition'>> = {}
): AdvancedModeSettings8 {
  return {
    partySize: 8,
    players: roles.map((role, i) => ({
      name: `プレイヤー${i + 1}`,
      role,
      excludedJobIds: [],
    })),
    noJobDuplicates: options.noJobDuplicates ?? false,
    maintainStandardComposition: options.maintainStandardComposition ?? true,
  };
}

function countResultRoles(members: { slotRole?: string }[]) {
  const count = {
    tank: 0,
    pureHealer: 0,
    barrierHealer: 0,
    melee: 0,
    ranged: 0,
    caster: 0,
  };
  for (const m of members) {
    const role = m.slotRole as keyof typeof count;
    if (role in count) count[role]++;
  }
  return count;
}

describe('標準構成維持', () => {
  describe('ケース1: 元の質問のケース（タンクx1, ピュアx1, ヒーラーx1, メレーx2, レンジx1, DPSx1, フリーx1）', () => {
    it('ヒーラー→バリア、DPS→キャス、フリー→タンクに解決される', () => {
      const settings = createSettings8([
        'tank',
        'pureHealer',
        'healer',
        'melee',
        'melee',
        'ranged',
        'dps',
        'free',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const count = countResultRoles(result.members);
      expect(count).toEqual(STANDARD_COMPOSITION_8);
    });
  });

  describe('ケース2: 汎用ヒーラーx2でピュアとバリアが不足', () => {
    it('汎用ヒーラーが1ピュア+1バリアに解決される', () => {
      const settings = createSettings8([
        'tank',
        'tank',
        'healer',
        'healer',
        'melee',
        'melee',
        'ranged',
        'caster',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const count = countResultRoles(result.members);
      expect(count).toEqual(STANDARD_COMPOSITION_8);
    });
  });

  describe('ケース3: 汎用DPSx4で全DPSサブロールが不足', () => {
    it('汎用DPSが2メレー+1レンジ+1キャスに解決される', () => {
      const settings = createSettings8([
        'tank',
        'tank',
        'pureHealer',
        'barrierHealer',
        'dps',
        'dps',
        'dps',
        'dps',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const count = countResultRoles(result.members);
      expect(count).toEqual(STANDARD_COMPOSITION_8);
    });
  });

  describe('ケース4: フリーx8（全てフリー）', () => {
    it('標準構成に解決される', () => {
      const settings = createSettings8([
        'free',
        'free',
        'free',
        'free',
        'free',
        'free',
        'free',
        'free',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const count = countResultRoles(result.members);
      expect(count).toEqual(STANDARD_COMPOSITION_8);
    });
  });

  describe('ケース5: サブロール全て指定済み', () => {
    it('そのまま維持される', () => {
      const settings = createSettings8([
        'tank',
        'tank',
        'pureHealer',
        'barrierHealer',
        'melee',
        'melee',
        'ranged',
        'caster',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const count = countResultRoles(result.members);
      expect(count).toEqual(STANDARD_COMPOSITION_8);
    });
  });

  describe('ケース6: 汎用ヒーラーx1でバリアのみ不足', () => {
    it('汎用ヒーラーがバリアに解決される', () => {
      const settings = createSettings8([
        'tank',
        'tank',
        'pureHealer',
        'healer',
        'melee',
        'melee',
        'ranged',
        'caster',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const healerSlot = result.members[3];
      expect(healerSlot.slotRole).toBe('barrierHealer');
    });
  });

  describe('ケース7: 汎用DPSx1でキャスのみ不足', () => {
    it('汎用DPSがキャスに解決される', () => {
      const settings = createSettings8([
        'tank',
        'tank',
        'pureHealer',
        'barrierHealer',
        'melee',
        'melee',
        'ranged',
        'dps',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const dpsSlot = result.members[7];
      expect(dpsSlot.slotRole).toBe('caster');
    });
  });

  describe('ケース8: 汎用DPSx2でレンジとキャスが不足', () => {
    it('汎用DPSがレンジとキャスに解決される', () => {
      const settings = createSettings8([
        'tank',
        'tank',
        'pureHealer',
        'barrierHealer',
        'melee',
        'melee',
        'dps',
        'dps',
      ]);

      const result = runAdvancedRoulette(settings);
      expect(result.success).toBe(true);

      const dpsSlots = [result.members[6].slotRole, result.members[7].slotRole];
      expect(dpsSlots.sort()).toEqual(['caster', 'ranged']);
    });
  });
});

describe('canMaintainStandardComposition', () => {
  it('標準構成を超えるサブロールがあるとfalseを返す', () => {
    const settings = createSettings8([
      'tank',
      'tank',
      'tank',
      'pureHealer',
      'barrierHealer',
      'melee',
      'melee',
      'ranged',
    ]);

    expect(canMaintainStandardComposition(settings)).toBe(false);
  });

  it('標準構成内であればtrueを返す', () => {
    const settings = createSettings8([
      'tank',
      'free',
      'pureHealer',
      'healer',
      'melee',
      'dps',
      'ranged',
      'free',
    ]);

    expect(canMaintainStandardComposition(settings)).toBe(true);
  });
});

describe('ジョブ重複禁止', () => {
  it('重複禁止ONで全員異なるジョブが割り当てられる', () => {
    const settings = createSettings8(
      ['tank', 'tank', 'pureHealer', 'barrierHealer', 'melee', 'melee', 'ranged', 'caster'],
      { noJobDuplicates: true }
    );

    const result = runAdvancedRoulette(settings);
    expect(result.success).toBe(true);

    const jobIds = result.members.map((m) => m.job?.id);
    const uniqueJobIds = new Set(jobIds);
    expect(uniqueJobIds.size).toBe(8);
  });
});

describe('rerollSingleMember', () => {
  it('1人分だけ再抽選できる', () => {
    const settings = createSettings8(
      ['tank', 'tank', 'pureHealer', 'barrierHealer', 'melee', 'melee', 'ranged', 'caster'],
      { noJobDuplicates: false }
    );

    const initialResult = runAdvancedRoulette(settings);
    expect(initialResult.success).toBe(true);

    const result = rerollSingleMember(initialResult.members, 0, {
      noJobDuplicates: false,
      excludedJobIds: [],
    });

    expect(result.success).toBe(true);
    expect(result.member).not.toBeNull();
    expect(result.member?.role).toBe('tank');
  });

  it('ジョブ重複禁止ON時に他のメンバーと重複しないジョブが選ばれる', () => {
    const settings = createSettings8(
      ['tank', 'tank', 'pureHealer', 'barrierHealer', 'melee', 'melee', 'ranged', 'caster'],
      { noJobDuplicates: true }
    );

    const initialResult = runAdvancedRoulette(settings);
    expect(initialResult.success).toBe(true);

    const otherJobIds = initialResult.members
      .filter((_, i) => i !== 0)
      .map((m) => m.job?.id);

    const result = rerollSingleMember(initialResult.members, 0, {
      noJobDuplicates: true,
      excludedJobIds: [],
    });

    expect(result.success).toBe(true);
    expect(result.member).not.toBeNull();
    expect(otherJobIds).not.toContain(result.member?.job?.id);
  });

  it('除外ジョブが考慮される', () => {
    const settings = createSettings8(
      ['tank', 'tank', 'pureHealer', 'barrierHealer', 'melee', 'melee', 'ranged', 'caster'],
      { noJobDuplicates: false }
    );

    const initialResult = runAdvancedRoulette(settings);
    expect(initialResult.success).toBe(true);

    const excludedJobIds = ['pld', 'war', 'gnb'];

    const result = rerollSingleMember(initialResult.members, 0, {
      noJobDuplicates: false,
      excludedJobIds,
    });

    expect(result.success).toBe(true);
    expect(result.member).not.toBeNull();
    expect(excludedJobIds).not.toContain(result.member?.job?.id);
  });

  it('無効なインデックスでエラーを返す', () => {
    const settings = createSettings8(
      ['tank', 'tank', 'pureHealer', 'barrierHealer', 'melee', 'melee', 'ranged', 'caster'],
      { noJobDuplicates: false }
    );

    const initialResult = runAdvancedRoulette(settings);
    expect(initialResult.success).toBe(true);

    const result = rerollSingleMember(initialResult.members, 10, {
      noJobDuplicates: false,
      excludedJobIds: [],
    });

    expect(result.success).toBe(false);
    expect(result.member).toBeNull();
  });
});
