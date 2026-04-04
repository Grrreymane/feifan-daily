// ============================================================
// engine.js — 鼠鼠修仙 v0.3 全系统游戏引擎
// 装备掉落 / 丹药炼制 / 功法技能 / 灵兽养成
// 秘境探索 / 镇妖塔 / 渡劫 / 奇遇事件
// ============================================================

const GameEngine = (() => {

  const SAVE_KEY = 'mouse_cultivation_save_v3';
  const TICK_INTERVAL = 2000;
  const MAX_LOG = 50;

  // ========== 修仙境界体系 ==========
  const REALMS = [
    { name: '炼气期', minLevel: 1,  maxLevel: 9,  color: '#8B7355' },
    { name: '筑基期', minLevel: 10, maxLevel: 19, color: '#DAA520' },
    { name: '金丹期', minLevel: 20, maxLevel: 29, color: '#2E8B57' },
    { name: '元婴期', minLevel: 30, maxLevel: 39, color: '#4169E1' },
    { name: '化神期', minLevel: 40, maxLevel: 49, color: '#8A2BE2' },
    { name: '大乘期', minLevel: 50, maxLevel: 99, color: '#DC143C' },
  ];

  // ========== 怪物模板 ==========
  const MONSTER_TEMPLATES = [
    [ { name: '灵鼠', hp: 10, atk: 2, exp: 5, gold: 3, trait: null },
      { name: '毒蛙', hp: 15, atk: 3, exp: 8, gold: 5, trait: 'poison' },
      { name: '野狐', hp: 25, atk: 5, exp: 12, gold: 8, trait: 'dodge' } ],
    [ { name: '石傀儡', hp: 100, atk: 15, exp: 50, gold: 30, trait: 'thorns' },
      { name: '妖蛇', hp: 150, atk: 25, exp: 80, gold: 50, trait: 'poison' },
      { name: '魔猿', hp: 200, atk: 35, exp: 100, gold: 80, trait: 'berserk' } ],
    [ { name: '冰魄蛛', hp: 800, atk: 100, exp: 400, gold: 250, trait: 'slow' },
      { name: '火鸦', hp: 1200, atk: 150, exp: 600, gold: 400, trait: 'burn' },
      { name: '雷豹', hp: 1500, atk: 200, exp: 800, gold: 500, trait: 'critBoost' } ],
    [ { name: '幽冥鬼将', hp: 8000, atk: 600, exp: 4000, gold: 2500, trait: 'lifesteal' },
      { name: '妖龙', hp: 12000, atk: 900, exp: 6000, gold: 4000, trait: 'burn' },
      { name: '魔修', hp: 15000, atk: 1100, exp: 8000, gold: 5000, trait: 'dodge' } ],
    [ { name: '天魔', hp: 80000, atk: 5000, exp: 40000, gold: 25000, trait: 'thorns' },
      { name: '九尾妖狐', hp: 120000, atk: 7000, exp: 60000, gold: 40000, trait: 'charm' },
      { name: '血煞魔尊', hp: 200000, atk: 10000, exp: 100000, gold: 80000, trait: 'berserk' } ],
    [ { name: '天劫雷兽', hp: 1000000, atk: 50000, exp: 500000, gold: 300000, trait: 'critBoost' },
      { name: '混沌古兽', hp: 2000000, atk: 80000, exp: 1000000, gold: 600000, trait: 'lifesteal' },
      { name: '太古魔神', hp: 5000000, atk: 150000, exp: 2500000, gold: 1500000, trait: 'berserk' } ],
  ];

  // ========== 装备系统 ==========
  const EQUIP_SLOTS = ['weapon', 'armor', 'accessory', 'boots'];
  const EQUIP_SLOT_NAMES = { weapon: '武器', armor: '衣服', accessory: '饰品', boots: '鞋子' };
  const EQUIP_QUALITIES = [
    { name: '白', color: '#CCCCCC', affixCount: 0, statMult: 1.0 },
    { name: '绿', color: '#44CC44', affixCount: 1, statMult: 1.3 },
    { name: '蓝', color: '#4488FF', affixCount: 2, statMult: 1.7 },
    { name: '紫', color: '#AA55FF', affixCount: 3, statMult: 2.2 },
    { name: '橙', color: '#FF8800', affixCount: 4, statMult: 3.0 },
    { name: '红', color: '#FF2222', affixCount: 5, statMult: 4.5 },
  ];
  const EQUIP_AFFIXES = [
    { name: '攻击', stat: 'attack', type: 'flat', range: [3, 50] },
    { name: '攻击', stat: 'attack', type: 'percent', range: [3, 15] },
    { name: '防御', stat: 'defense', type: 'flat', range: [2, 30] },
    { name: '生命', stat: 'maxHp', type: 'flat', range: [10, 200] },
    { name: '生命', stat: 'maxHp', type: 'percent', range: [3, 12] },
    { name: '暴击率', stat: 'critRate', type: 'flat', range: [1, 5] },
    { name: '暴击伤害', stat: 'critDamage', type: 'flat', range: [5, 20] },
    { name: '吸血', stat: 'lifesteal', type: 'flat', range: [1, 8] },
    { name: '闪避', stat: 'dodge', type: 'flat', range: [1, 6] },
    { name: '攻速', stat: 'atkSpeed', type: 'flat', range: [3, 10] },
  ];

  // 装备名称池
  const EQUIP_NAMES = {
    weapon: ['木剑', '铁剑', '飞剑', '灵剑', '神剑', '天剑', '青锋', '赤霄', '墨渊', '星辰'],
    armor: ['布衣', '道袍', '法袍', '灵甲', '仙袍', '天衣', '玄铁甲', '龙鳞袍', '紫金铠'],
    accessory: ['铜环', '玉佩', '灵珠', '乾坤镯', '天机链', '混沌珠', '太极印', '凤凰翎'],
    boots: ['草鞋', '布靴', '云步靴', '踏风靴', '追风靴', '天行靴', '凌霄靴', '虚空步'],
  };

  // 视觉装备（境界对应坐骑/宠物展示用）
  const VISUAL_EQUIP = {
    weapon: ['木剑', '铁剑', '飞剑', '灵剑', '神剑', '天剑'],
    armor:  ['布衣', '道袍', '法袍', '华服', '仙袍', '天衣'],
    mount:  [null, null, '仙鹤', '仙鹤', '麒麟', '麒麟'],
    pet:    [null, '小蛇', '小蛇', '蛟龙', '蛟龙', '神龙'],
  };

  function generateEquipment(level, forcedQuality) {
    const realmIdx = getRealmIndex(level);
    const slot = EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)];

    // 品质概率（越高级越稀有）
    let qualityIdx;
    if (forcedQuality !== undefined) {
      qualityIdx = forcedQuality;
    } else {
      const roll = Math.random();
      if (roll < 0.40) qualityIdx = 0;       // 白 40%
      else if (roll < 0.70) qualityIdx = 1;   // 绿 30%
      else if (roll < 0.88) qualityIdx = 2;   // 蓝 18%
      else if (roll < 0.96) qualityIdx = 3;   // 紫 8%
      else if (roll < 0.993) qualityIdx = 4;  // 橙 3.3%
      else qualityIdx = 5;                     // 红 0.7%
    }

    const quality = EQUIP_QUALITIES[qualityIdx];
    const names = EQUIP_NAMES[slot];
    const name = names[Math.min(realmIdx, names.length - 1)];

    // 基础属性
    const baseStat = Math.floor((5 + level * 3) * quality.statMult);
    const baseAttr = {};
    if (slot === 'weapon') baseAttr.attack = baseStat;
    else if (slot === 'armor') baseAttr.defense = Math.floor(baseStat * 0.6);
    else if (slot === 'accessory') baseAttr.maxHp = Math.floor(baseStat * 3);
    else if (slot === 'boots') { baseAttr.dodge = Math.floor(baseStat * 0.1); baseAttr.atkSpeed = Math.floor(baseStat * 0.15); }

    // 随机词条
    const affixes = [];
    const usedStats = new Set();
    for (let i = 0; i < quality.affixCount; i++) {
      let affix, tries = 0;
      do {
        affix = EQUIP_AFFIXES[Math.floor(Math.random() * EQUIP_AFFIXES.length)];
        tries++;
      } while (usedStats.has(affix.stat + affix.type) && tries < 20);
      usedStats.add(affix.stat + affix.type);

      const levelScale = 1 + level * 0.12;
      const value = Math.floor(
        (affix.range[0] + Math.random() * (affix.range[1] - affix.range[0])) * levelScale
      );
      affixes.push({ ...affix, value });
    }

    return {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: quality.name === '白' ? name : `${name}(${quality.name})`,
      slot,
      qualityIdx,
      quality: quality.name,
      qualityColor: quality.color,
      level,
      baseAttr,
      affixes,
      enhanceLevel: 0,
    };
  }

  function getEquipScore(equip) {
    if (!equip) return 0;
    let score = 0;
    const mult = 1 + equip.enhanceLevel * 0.1;
    for (const [k, v] of Object.entries(equip.baseAttr)) {
      score += v * mult;
    }
    for (const a of equip.affixes) {
      score += a.value * (a.type === 'percent' ? 5 : 1) * mult;
    }
    return Math.floor(score);
  }

  function getEquipEnhanceCost(equip) {
    if (!equip) return Infinity;
    return Math.floor(100 * Math.pow(1.8, equip.enhanceLevel) * (equip.qualityIdx + 1));
  }

  // ========== 丹药系统 ==========
  const PILL_RECIPES = [
    { id: 'exp_pill', name: '聚灵丹', desc: '经验翻倍30秒', icon: '💊',
      materials: { herb: 3 }, gold: 50, effect: { type: 'expBoost', mult: 2, duration: 30 }, minRealm: 0 },
    { id: 'atk_pill', name: '狂暴丹', desc: '攻击翻倍30秒', icon: '🔴',
      materials: { herb: 2, ore: 2 }, gold: 80, effect: { type: 'atkBoost', mult: 2, duration: 30 }, minRealm: 0 },
    { id: 'heal_pill', name: '回春丹', desc: '立即回满生命', icon: '💚',
      materials: { herb: 5 }, gold: 30, effect: { type: 'heal', value: 1.0 }, minRealm: 0 },
    { id: 'trib_pill', name: '渡劫丹', desc: '渡劫成功率+20%', icon: '⚡',
      materials: { herb: 5, ore: 5, essence: 1 }, gold: 200, effect: { type: 'tribBoost', value: 0.2 }, minRealm: 1 },
    { id: 'crit_pill', name: '破妄丹', desc: '暴击率+30% 30秒', icon: '💥',
      materials: { herb: 3, essence: 1 }, gold: 150, effect: { type: 'critBoost', value: 0.3, duration: 30 }, minRealm: 2 },
    { id: 'super_exp', name: '天灵丹', desc: '经验x5 60秒', icon: '🌟',
      materials: { herb: 10, essence: 3 }, gold: 500, effect: { type: 'expBoost', mult: 5, duration: 60 }, minRealm: 3 },
  ];

  // ========== 功法系统 ==========
  const SKILL_TREE = [
    { id: 'basic_sword', name: '基础剑诀', desc: '攻击+10%', icon: '🗡️',
      realm: 0, cost: 3, maxLevel: 10, effect: { stat: 'attack', type: 'percent', perLevel: 10 } },
    { id: 'basic_body', name: '炼体术', desc: '生命+10%', icon: '💪',
      realm: 0, cost: 3, maxLevel: 10, effect: { stat: 'maxHp', type: 'percent', perLevel: 10 } },
    { id: 'iron_skin', name: '铁皮功', desc: '防御+10%', icon: '🛡️',
      realm: 0, cost: 3, maxLevel: 10, effect: { stat: 'defense', type: 'percent', perLevel: 10 } },
    { id: 'swift_strike', name: '疾风斩', desc: '攻速+5%', icon: '💨',
      realm: 1, cost: 5, maxLevel: 8, effect: { stat: 'atkSpeed', type: 'percent', perLevel: 5 } },
    { id: 'golden_core', name: '金丹大法', desc: '全属性+5%', icon: '✨',
      realm: 2, cost: 8, maxLevel: 5, effect: { stat: 'all', type: 'percent', perLevel: 5 } },
    { id: 'crit_mastery', name: '会心一击', desc: '暴击率+2%', icon: '🎯',
      realm: 1, cost: 5, maxLevel: 10, effect: { stat: 'critRate', type: 'flat', perLevel: 2 } },
    { id: 'life_drain', name: '吸星大法', desc: '吸血+2%', icon: '🩸',
      realm: 2, cost: 8, maxLevel: 5, effect: { stat: 'lifesteal', type: 'flat', perLevel: 2 } },
    { id: 'dodge_wind', name: '御风术', desc: '闪避+2%', icon: '🌀',
      realm: 1, cost: 5, maxLevel: 8, effect: { stat: 'dodge', type: 'flat', perLevel: 2 } },
    { id: 'crit_damage', name: '破天击', desc: '暴伤+15%', icon: '⚔️',
      realm: 3, cost: 10, maxLevel: 5, effect: { stat: 'critDamage', type: 'flat', perLevel: 15 } },
    { id: 'gold_find', name: '寻宝术', desc: '灵石+15%', icon: '💰',
      realm: 1, cost: 4, maxLevel: 5, effect: { stat: 'goldBonus', type: 'percent', perLevel: 15 } },
  ];

  // ========== 灵兽系统 ==========
  const BEAST_TEMPLATES = [
    { id: 'fire_cat', name: '火灵猫', icon: '🔥🐱', baseAtk: 5, baseDef: 2, skill: '火球术：额外10%火焰伤害',
      captureChance: 0.08, minRealm: 0 },
    { id: 'ice_wolf', name: '冰狼', icon: '❄️🐺', baseAtk: 8, baseDef: 5, skill: '冰甲：防御+15%',
      captureChance: 0.06, minRealm: 1 },
    { id: 'thunder_eagle', name: '雷鹰', icon: '⚡🦅', baseAtk: 12, baseDef: 3, skill: '雷击：15%概率双倍攻击',
      captureChance: 0.04, minRealm: 2 },
    { id: 'shadow_serpent', name: '暗影蛇', icon: '🌑🐍', baseAtk: 10, baseDef: 8, skill: '暗袭：闪避+10%',
      captureChance: 0.03, minRealm: 2 },
    { id: 'jade_dragon', name: '玉龙', icon: '🐲💎', baseAtk: 20, baseDef: 15, skill: '龙息：攻击+25%',
      captureChance: 0.015, minRealm: 3 },
    { id: 'phoenix', name: '凤凰', icon: '🔥🦚', baseAtk: 25, baseDef: 20, skill: '涅槃：每击回复1%生命',
      captureChance: 0.01, minRealm: 4 },
  ];

  // ========== 秘境系统 ==========
  const SECRET_REALMS = [
    { name: '灵草谷', desc: '产出大量灵草', minRealm: 0, bossTier: 0,
      rewards: { herb: [5, 12], gold: [50, 150], equipChance: 0.3 } },
    { name: '矿脉洞', desc: '产出矿石材料', minRealm: 1, bossTier: 1,
      rewards: { ore: [5, 12], gold: [100, 300], equipChance: 0.4 } },
    { name: '万妖林', desc: '有机会捕获灵兽', minRealm: 2, bossTier: 2,
      rewards: { herb: [3, 8], essence: [1, 3], beastChance: 0.15, equipChance: 0.5 } },
    { name: '天机阁', desc: '稀有装备与精华', minRealm: 3, bossTier: 3,
      rewards: { essence: [2, 5], gold: [500, 1500], equipChance: 0.7, equipQualityMin: 2 } },
    { name: '混沌秘境', desc: '极品掉落', minRealm: 4, bossTier: 4,
      rewards: { essence: [3, 8], gold: [2000, 5000], equipChance: 0.9, equipQualityMin: 3 } },
  ];

  // ========== 镇妖塔 ==========
  function getTowerMonster(floor) {
    const tier = Math.min(5, Math.floor(floor / 10));
    const monsters = MONSTER_TEMPLATES[tier];
    const template = monsters[Math.floor(Math.random() * monsters.length)];
    const scale = 1 + floor * 0.2;
    return {
      name: `${template.name}(塔${floor}层)`,
      displayName: template.name,
      hp: Math.floor(template.hp * scale),
      maxHp: Math.floor(template.hp * scale),
      atk: Math.floor((template.atk || 5) * scale),
      exp: Math.floor(template.exp * scale * 0.3),
      gold: Math.floor(template.gold * scale * 0.5),
      trait: template.trait,
      isTower: true,
    };
  }

  // ========== 奇遇事件 ==========
  const ENCOUNTER_EVENTS = [
    { id: 'herb_find', name: '发现灵草', desc: '路边发现一株灵草！',
      weight: 30, rewards: { herb: [1, 5] } },
    { id: 'ore_find', name: '天降陨铁', desc: '一块散发灵气的陨铁！',
      weight: 20, rewards: { ore: [1, 4] } },
    { id: 'gold_rain', name: '灵石矿脉', desc: '踩到了一处灵石矿脉！',
      weight: 25, rewards: { gold: [50, 500] } },
    { id: 'essence_drop', name: '天材地宝', desc: '发现一颗灵气精华！',
      weight: 5, rewards: { essence: [1, 2] } },
    { id: 'random_equip', name: '前辈遗物', desc: '一位前辈的储物袋里...',
      weight: 8, rewards: { equip: true } },
    { id: 'exp_bonus', name: '悟道', desc: '鼠鼠在打坐中突然顿悟！',
      weight: 12, rewards: { expPercent: [5, 20] } },
  ];

  // ========== 渡劫系统 ==========
  function getTribulationChance(state) {
    let base = 0.6; // 基础60%
    // 装备分加成
    const totalScore = EQUIP_SLOTS.reduce((s, slot) => s + getEquipScore(state.equipment[slot]), 0);
    base += Math.min(0.15, totalScore * 0.00005);
    // 丹药加成
    if (state.buffs && state.buffs.tribBoost) {
      base += state.buffs.tribBoost.value;
    }
    // 灵兽加成
    if (state.activeBeast) base += 0.03;
    return Math.min(0.95, base);
  }

  // ========== 状态管理 ==========
  function getDefaultState() {
    return {
      level: 1,
      exp: 0,
      gold: 0,
      baseAttack: 5,
      baseDefense: 1,
      baseMaxHp: 100,
      hp: 100,
      baseCritRate: 5, // 百分比整数
      baseCritDamage: 150,
      killCount: 0,
      totalGold: 0,
      totalExp: 0,
      createdAt: Date.now(),
      lastTickTime: Date.now(),
      currentMonster: null,
      battleLog: [],
      statPoints: 0,

      // 装备
      equipment: { weapon: null, armor: null, accessory: null, boots: null },
      inventory: [], // 装备背包（最多30件）
      inventoryMax: 30,

      // 材料
      materials: { herb: 0, ore: 0, essence: 0 },

      // 丹药背包
      pills: {},

      // 功法等级
      skills: {},

      // 灵兽
      beasts: [],
      activeBeastId: null,

      // Buff
      buffs: {},

      // 秘境
      secretRealmCharges: 3,
      secretRealmMaxCharges: 3,
      lastRealmRefresh: Date.now(),

      // 镇妖塔
      towerFloor: 1,
      towerBestFloor: 0,
      towerDailyRewardClaimed: false,
      lastTowerReset: Date.now(),

      // 渡劫
      needTribulation: false,
      tribulationCooldown: 0,

      // 奇遇
      lastEncounterTime: 0,
    };
  }

  let state = null;
  let tickTimer = null;
  let onBattleEvent = null;

  function loadState() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        state = JSON.parse(saved);
        migrateState();
        return;
      }
      // 尝试旧存档迁移
      const oldSave = localStorage.getItem('mouse_cultivation_save');
      if (oldSave) {
        const old = JSON.parse(oldSave);
        state = getDefaultState();
        state.level = old.level || 1;
        state.exp = old.exp || 0;
        state.gold = old.gold || 0;
        state.baseAttack = old.attack || 5;
        state.baseDefense = old.defense || 1;
        state.baseMaxHp = old.maxHp || 100;
        state.hp = old.hp || state.baseMaxHp;
        state.baseCritRate = Math.floor((old.critRate || 0.05) * 100);
        state.baseCritDamage = Math.floor((old.critDamage || 1.5) * 100);
        state.killCount = old.killCount || 0;
        state.totalGold = old.totalGold || 0;
        state.totalExp = old.totalExp || 0;
        state.statPoints = old.statPoints || 0;
        state.lastTickTime = old.lastTickTime || Date.now();
        state.battleLog = old.battleLog || [];
        addLog('💫 存档迁移成功！欢迎来到v0.3大版本！');
        saveState();
        return;
      }
    } catch (e) {
      console.error('存档加载失败:', e);
    }
    state = getDefaultState();
  }

  function migrateState() {
    const def = getDefaultState();
    for (const key of Object.keys(def)) {
      if (state[key] === undefined) state[key] = def[key];
    }
    if (!state.materials) state.materials = { herb: 0, ore: 0, essence: 0 };
    if (!state.pills) state.pills = {};
    if (!state.skills) state.skills = {};
    if (!state.beasts) state.beasts = [];
    if (!state.buffs) state.buffs = {};
    if (!state.equipment || Array.isArray(state.equipment)) {
      state.equipment = { weapon: null, armor: null, accessory: null, boots: null };
    }
    if (!state.inventory) state.inventory = [];
  }

  function saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('存档保存失败:', e);
    }
  }

  function resetState() {
    state = getDefaultState();
    localStorage.removeItem('mouse_cultivation_save');
    saveState();
  }

  // ========== 计算属性（装备+功法+灵兽+buff） ==========
  function getComputedStats() {
    let attack = state.baseAttack;
    let defense = state.baseDefense;
    let maxHp = state.baseMaxHp;
    let critRate = state.baseCritRate;
    let critDamage = state.baseCritDamage;
    let lifesteal = 0;
    let dodge = 0;
    let atkSpeed = 0;
    let goldBonus = 0;
    let expBonus = 0;

    // 装备加成
    for (const slot of EQUIP_SLOTS) {
      const eq = state.equipment[slot];
      if (!eq) continue;
      const mult = 1 + eq.enhanceLevel * 0.1;
      for (const [k, v] of Object.entries(eq.baseAttr)) {
        const val = Math.floor(v * mult);
        if (k === 'attack') attack += val;
        else if (k === 'defense') defense += val;
        else if (k === 'maxHp') maxHp += val;
        else if (k === 'critRate') critRate += val;
        else if (k === 'critDamage') critDamage += val;
        else if (k === 'lifesteal') lifesteal += val;
        else if (k === 'dodge') dodge += val;
        else if (k === 'atkSpeed') atkSpeed += val;
      }
      for (const a of eq.affixes) {
        const val = Math.floor(a.value * mult);
        if (a.type === 'percent') {
          if (a.stat === 'attack') attack = Math.floor(attack * (1 + val / 100));
          else if (a.stat === 'maxHp') maxHp = Math.floor(maxHp * (1 + val / 100));
        } else {
          if (a.stat === 'attack') attack += val;
          else if (a.stat === 'defense') defense += val;
          else if (a.stat === 'maxHp') maxHp += val;
          else if (a.stat === 'critRate') critRate += val;
          else if (a.stat === 'critDamage') critDamage += val;
          else if (a.stat === 'lifesteal') lifesteal += val;
          else if (a.stat === 'dodge') dodge += val;
          else if (a.stat === 'atkSpeed') atkSpeed += val;
        }
      }
    }

    // 功法加成
    for (const sk of SKILL_TREE) {
      const lv = state.skills[sk.id] || 0;
      if (lv <= 0) continue;
      const eff = sk.effect;
      const totalVal = eff.perLevel * lv;
      if (eff.stat === 'all') {
        attack = Math.floor(attack * (1 + totalVal / 100));
        defense = Math.floor(defense * (1 + totalVal / 100));
        maxHp = Math.floor(maxHp * (1 + totalVal / 100));
      } else if (eff.type === 'percent') {
        if (eff.stat === 'attack') attack = Math.floor(attack * (1 + totalVal / 100));
        else if (eff.stat === 'defense') defense = Math.floor(defense * (1 + totalVal / 100));
        else if (eff.stat === 'maxHp') maxHp = Math.floor(maxHp * (1 + totalVal / 100));
        else if (eff.stat === 'atkSpeed') atkSpeed += totalVal;
        else if (eff.stat === 'goldBonus') goldBonus += totalVal;
      } else {
        if (eff.stat === 'critRate') critRate += totalVal;
        else if (eff.stat === 'critDamage') critDamage += totalVal;
        else if (eff.stat === 'lifesteal') lifesteal += totalVal;
        else if (eff.stat === 'dodge') dodge += totalVal;
      }
    }

    // 灵兽加成
    const beast = getActiveBeast();
    if (beast) {
      const beastMult = 1 + beast.level * 0.15;
      attack += Math.floor(beast.baseAtk * beastMult);
      defense += Math.floor(beast.baseDef * beastMult);
    }

    // Buff加成
    const now = Date.now();
    if (state.buffs.atkBoost && now < state.buffs.atkBoost.until) {
      attack = Math.floor(attack * state.buffs.atkBoost.mult);
    }
    if (state.buffs.critBoost && now < state.buffs.critBoost.until) {
      critRate += state.buffs.critBoost.value * 100;
    }

    return {
      attack, defense, maxHp,
      critRate: Math.min(80, critRate),
      critDamage,
      lifesteal: Math.min(30, lifesteal),
      dodge: Math.min(50, dodge),
      atkSpeed: Math.min(50, atkSpeed),
      goldBonus,
      expBonus: state.buffs.expBoost && now < state.buffs.expBoost.until ? (state.buffs.expBoost.mult - 1) * 100 : 0,
    };
  }

  function getActiveBeast() {
    if (!state.activeBeastId || !state.beasts) return null;
    return state.beasts.find(b => b.id === state.activeBeastId) || null;
  }

  // ========== 游戏逻辑 ==========
  function getRealmIndex(level) {
    for (let i = REALMS.length - 1; i >= 0; i--) {
      if (level >= REALMS[i].minLevel) return i;
    }
    return 0;
  }

  function getRealm(level) {
    return REALMS[getRealmIndex(level)];
  }

  function getExpToNextLevel(level) {
    return Math.floor(50 * Math.pow(1.35, level - 1));
  }

  function spawnMonster(level) {
    const realmIdx = getRealmIndex(level);
    const monsters = MONSTER_TEMPLATES[realmIdx];
    const template = monsters[Math.floor(Math.random() * monsters.length)];
    const levelScale = 1 + (level - REALMS[realmIdx].minLevel) * 0.15;
    return {
      name: template.name,
      hp: Math.floor(template.hp * levelScale),
      maxHp: Math.floor(template.hp * levelScale),
      atk: Math.floor((template.atk || 5) * levelScale),
      exp: Math.floor(template.exp * levelScale),
      gold: Math.floor(template.gold * levelScale),
      trait: template.trait,
    };
  }

  function processCombatTick() {
    if (!state) return;

    // 渡劫阻挡
    if (state.needTribulation) {
      if (!state._tribWarnShown) {
        addLog('⛈️ 天劫将至！需要渡劫才能继续修炼！');
        state._tribWarnShown = true;
      }
      state.lastTickTime = Date.now();
      saveState();
      return;
    }

    // 刷新buff
    cleanExpiredBuffs();

    // 刷新秘境次数
    refreshRealmCharges();

    // 刷怪
    if (!state.currentMonster || state.currentMonster.hp <= 0) {
      state.currentMonster = spawnMonster(state.level);
      addLog(`🐾 ${state.currentMonster.name} 出现了！`);
      emit('spawn', { monster: state.currentMonster });
    }

    const stats = getComputedStats();

    // 闪避检测（怪物攻击鼠鼠）
    const monsterAtk = state.currentMonster.atk || 0;
    if (monsterAtk > 0) {
      const dodgeRoll = Math.random() * 100;
      if (dodgeRoll >= stats.dodge) {
        let monsterDmg = Math.max(1, monsterAtk - stats.defense * 0.3);
        monsterDmg = Math.floor(monsterDmg * (0.8 + Math.random() * 0.4));
        // 怪物特性
        if (state.currentMonster.trait === 'berserk') monsterDmg = Math.floor(monsterDmg * 1.5);
        if (state.currentMonster.trait === 'burn') monsterDmg = Math.floor(monsterDmg * 1.2);
        state.hp = Math.max(1, state.hp - monsterDmg);
        emit('monsterAttack', { damage: monsterDmg });
      } else {
        emit('dodge', {});
      }
    }

    // 鼠鼠攻击
    const isCrit = Math.random() * 100 < stats.critRate;
    let damage = stats.attack * (isCrit ? stats.critDamage / 100 : 1);
    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

    // 怪物闪避（野狐、魔修）
    if (state.currentMonster.trait === 'dodge' && Math.random() < 0.15) {
      addLog(`💨 ${state.currentMonster.name} 闪避了攻击！`);
      emit('monsterDodge', {});
    } else {
      // 荆棘反伤
      if (state.currentMonster.trait === 'thorns') {
        const thornDmg = Math.floor(damage * 0.1);
        state.hp = Math.max(1, state.hp - thornDmg);
      }

      state.currentMonster.hp = Math.max(0, state.currentMonster.hp - damage);

      // 吸血
      if (stats.lifesteal > 0) {
        const heal = Math.floor(damage * stats.lifesteal / 100);
        state.hp = Math.min(stats.maxHp, state.hp + heal);
      }

      if (isCrit) {
        addLog(`⚔️ 暴击！鼠鼠对 ${state.currentMonster.name} 造成 ${formatNumber(damage)} 伤害！`);
      } else {
        addLog(`⚔️ 鼠鼠对 ${state.currentMonster.name} 造成 ${formatNumber(damage)} 伤害`);
      }
      emit('attack', { damage, isCrit, monsterName: state.currentMonster.name });
    }

    // 怪物死亡
    if (state.currentMonster.hp <= 0) {
      const goldMult = 1 + stats.goldBonus / 100;
      const expMult = 1 + stats.expBonus / 100;
      let expGain = Math.floor(state.currentMonster.exp * expMult);
      let goldGain = Math.floor(state.currentMonster.gold * goldMult);

      state.exp += expGain;
      state.gold += goldGain;
      state.totalExp += expGain;
      state.totalGold += goldGain;
      state.killCount++;

      addLog(`💀 ${state.currentMonster.name} 被击败！+${formatNumber(expGain)}经验 +${formatNumber(goldGain)}灵石`);
      emit('kill', { monster: state.currentMonster, expGain, goldGain });

      // === 掉落 ===
      processDrops(state.currentMonster);

      // === 奇遇 ===
      tryEncounter();

      // === 灵兽捕获 ===
      tryCaptureBeast();

      // === 升级 ===
      checkLevelUp();

      // 刷新下一只
      state.currentMonster = spawnMonster(state.level);
      addLog(`🐾 ${state.currentMonster.name} 出现了！`);
      emit('spawn', { monster: state.currentMonster });
    }

    // 生命回复
    if (state.hp < stats.maxHp) {
      state.hp = Math.min(stats.maxHp, state.hp + Math.floor(stats.maxHp * 0.02));
    }

    state.lastTickTime = Date.now();
    saveState();
  }

  function processDrops(monster) {
    // 材料掉落
    if (Math.random() < 0.35) {
      const matType = Math.random() < 0.5 ? 'herb' : (Math.random() < 0.7 ? 'ore' : 'essence');
      const amount = matType === 'essence' ? 1 : Math.floor(1 + Math.random() * 3);
      state.materials[matType] = (state.materials[matType] || 0) + amount;
      const matNames = { herb: '灵草', ore: '矿石', essence: '精华' };
      addLog(`🎁 掉落 ${matNames[matType]} x${amount}`);
      emit('drop', { type: matType, amount });
    }

    // 装备掉落（5%基础概率）
    const dropRate = 0.05 + getRealmIndex(state.level) * 0.01;
    if (Math.random() < dropRate) {
      const equip = generateEquipment(state.level);
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(equip);
        addLog(`📦 获得装备 <span style="color:${equip.qualityColor}">[${equip.name}]</span>！`);
        emit('equipDrop', { equip });
      } else {
        // 背包满了自动转化为灵石
        const sellGold = getEquipScore(equip) * 2;
        state.gold += sellGold;
        addLog(`📦 背包已满，装备自动转化为 ${formatNumber(sellGold)} 灵石`);
      }
    }
  }

  function tryEncounter() {
    const now = Date.now();
    if (now - state.lastEncounterTime < 30000) return; // 30秒冷却
    if (Math.random() > 0.08) return; // 8%触发率

    state.lastEncounterTime = now;
    const totalWeight = ENCOUNTER_EVENTS.reduce((s, e) => s + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let event = ENCOUNTER_EVENTS[0];
    for (const e of ENCOUNTER_EVENTS) {
      roll -= e.weight;
      if (roll <= 0) { event = e; break; }
    }

    addLog(`🎲 奇遇！${event.desc}`);
    const r = event.rewards;
    if (r.herb) state.materials.herb += randRange(r.herb);
    if (r.ore) state.materials.ore += randRange(r.ore);
    if (r.essence) state.materials.essence += randRange(r.essence);
    if (r.gold) { const g = randRange(r.gold); state.gold += g; addLog(`  → +${formatNumber(g)} 灵石`); }
    if (r.expPercent) {
      const pct = randRange(r.expPercent);
      const exp = Math.floor(getExpToNextLevel(state.level) * pct / 100);
      state.exp += exp;
      addLog(`  → +${formatNumber(exp)} 经验(${pct}%)`);
    }
    if (r.equip) {
      const equip = generateEquipment(state.level, Math.min(5, 1 + Math.floor(Math.random() * 3)));
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(equip);
        addLog(`  → 获得 <span style="color:${equip.qualityColor}">[${equip.name}]</span>！`);
      }
    }
    emit('encounter', { event });
  }

  function tryCaptureBeast() {
    const realmIdx = getRealmIndex(state.level);
    for (const tmpl of BEAST_TEMPLATES) {
      if (realmIdx < tmpl.minRealm) continue;
      if (state.beasts.find(b => b.templateId === tmpl.id)) continue; // 已有
      if (Math.random() < tmpl.captureChance) {
        const beast = {
          id: Date.now().toString(36),
          templateId: tmpl.id,
          name: tmpl.name,
          icon: tmpl.icon,
          baseAtk: tmpl.baseAtk,
          baseDef: tmpl.baseDef,
          skill: tmpl.skill,
          level: 1,
          feedCount: 0,
        };
        state.beasts.push(beast);
        if (!state.activeBeastId) state.activeBeastId = beast.id;
        addLog(`🐾 捕获了灵兽 ${tmpl.icon} ${tmpl.name}！`);
        emit('beastCapture', { beast });
        break;
      }
    }
  }

  function checkLevelUp() {
    while (state.exp >= getExpToNextLevel(state.level)) {
      state.exp -= getExpToNextLevel(state.level);
      state.level++;
      state.baseAttack = Math.floor(state.baseAttack * 1.12 + 2);
      state.baseDefense = Math.floor(state.baseDefense * 1.08 + 1);
      state.baseMaxHp = Math.floor(state.baseMaxHp * 1.1 + 10);
      state.hp = getComputedStats().maxHp;
      state.statPoints += 3;

      const realm = getRealm(state.level);
      const prevRealm = getRealm(state.level - 1);

      if (realm.name !== prevRealm.name) {
        // 境界突破 -> 需要渡劫
        state.needTribulation = true;
        state._tribWarnShown = false;
        state.level--; // 回退等级，等渡劫成功再升
        state.exp += getExpToNextLevel(state.level); // 把经验还回去
        addLog(`⛈️ 即将突破【${realm.name}】！需要渡劫！`);
        emit('tribulationReady', { realm: realm.name });
        break;
      } else {
        addLog(`⬆️ 升级！Lv.${state.level}（${realm.name}）`);
        emit('levelup', { level: state.level, realm: realm.name });
      }
    }
  }

  // ========== 渡劫 ==========
  function attemptTribulation() {
    if (!state.needTribulation) return { success: false, msg: '当前无需渡劫' };
    if (state.tribulationCooldown > Date.now()) {
      const secs = Math.ceil((state.tribulationCooldown - Date.now()) / 1000);
      return { success: false, msg: `渡劫冷却中（${secs}秒）` };
    }

    const chance = getTribulationChance(state);
    const roll = Math.random();
    const success = roll < chance;

    if (success) {
      state.needTribulation = false;
      state.level++;
      const realm = getRealm(state.level);
      state.baseAttack = Math.floor(state.baseAttack * 2);
      state.baseDefense = Math.floor(state.baseDefense * 1.5);
      state.baseMaxHp = Math.floor(state.baseMaxHp * 2);
      state.hp = getComputedStats().maxHp;
      state.baseCritRate = Math.min(80, state.baseCritRate + 3);
      state.baseCritDamage += 20;
      state.statPoints += 10;
      addLog(`🌟🌟🌟 渡劫成功！鼠鼠晋升【${realm.name}】！🌟🌟🌟`);
      emit('breakthrough', { realm: realm.name, level: state.level });
      saveState();
      return { success: true, msg: `渡劫成功！晋升${realm.name}！`, chance };
    } else {
      state.tribulationCooldown = Date.now() + 15000; // 15秒冷却
      addLog(`💥 渡劫失败！天劫反噬！15秒后可重试`);
      state.hp = Math.max(1, Math.floor(state.hp * 0.3));
      emit('tribulationFail', {});
      saveState();
      return { success: false, msg: '渡劫失败！15秒后可重试', chance };
    }
  }

  // ========== 秘境 ==========
  function refreshRealmCharges() {
    const now = Date.now();
    const hoursPassed = (now - state.lastRealmRefresh) / 3600000;
    if (hoursPassed >= 1) {
      const charges = Math.floor(hoursPassed);
      state.secretRealmCharges = Math.min(state.secretRealmMaxCharges,
        state.secretRealmCharges + charges);
      state.lastRealmRefresh = now;
    }
  }

  function enterSecretRealm(realmIndex) {
    if (state.secretRealmCharges <= 0) return { success: false, msg: '秘境次数不足' };
    const realm = SECRET_REALMS[realmIndex];
    if (!realm) return { success: false, msg: '秘境不存在' };
    if (getRealmIndex(state.level) < realm.minRealm) return { success: false, msg: '境界不足' };

    state.secretRealmCharges--;
    const rewards = [];

    // BOSS战（简化：直接判定胜负）
    const stats = getComputedStats();
    const bossHp = MONSTER_TEMPLATES[realm.bossTier]?.[0]?.hp * 3 || 500;
    const win = stats.attack * 15 > bossHp; // 简化：15回合能打死就算赢

    if (!win) {
      addLog(`🏔️ 秘境【${realm.name}】挑战失败！BOSS太强了！`);
      saveState();
      return { success: false, msg: '挑战失败！BOSS太强了' };
    }

    // 材料奖励
    const r = realm.rewards;
    if (r.herb) { const n = randRange(r.herb); state.materials.herb += n; rewards.push(`灵草x${n}`); }
    if (r.ore) { const n = randRange(r.ore); state.materials.ore += n; rewards.push(`矿石x${n}`); }
    if (r.essence) { const n = randRange(r.essence); state.materials.essence += n; rewards.push(`精华x${n}`); }
    if (r.gold) { const g = randRange(r.gold); state.gold += g; rewards.push(`灵石${formatNumber(g)}`); }

    // 装备奖励
    if (Math.random() < (r.equipChance || 0)) {
      const minQ = r.equipQualityMin || 0;
      const equip = generateEquipment(state.level, Math.min(5, minQ + Math.floor(Math.random() * 3)));
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(equip);
        rewards.push(`[${equip.name}]`);
      }
    }

    // 灵兽
    if (r.beastChance && Math.random() < r.beastChance) {
      tryCaptureBeast();
    }

    addLog(`🏔️ 秘境【${realm.name}】通关！获得：${rewards.join('、')}`);
    emit('secretRealmClear', { realm: realm.name, rewards });
    saveState();
    return { success: true, msg: `通关！获得：${rewards.join('、')}`, rewards };
  }

  // ========== 镇妖塔 ==========
  function challengeTower() {
    const floor = state.towerFloor;
    const monster = getTowerMonster(floor);
    const stats = getComputedStats();

    // 简化战斗：模拟回合制
    let mouseHp = stats.maxHp;
    let monsterHp = monster.maxHp;
    let rounds = 0;
    const maxRounds = 30;

    while (mouseHp > 0 && monsterHp > 0 && rounds < maxRounds) {
      rounds++;
      // 鼠鼠攻击
      const isCrit = Math.random() * 100 < stats.critRate;
      let dmg = stats.attack * (isCrit ? stats.critDamage / 100 : 1);
      dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));
      monsterHp -= dmg;
      if (stats.lifesteal > 0) mouseHp = Math.min(stats.maxHp, mouseHp + Math.floor(dmg * stats.lifesteal / 100));

      if (monsterHp <= 0) break;

      // 怪物攻击
      if (Math.random() * 100 >= stats.dodge) {
        let mDmg = Math.max(1, monster.atk - stats.defense * 0.3);
        mDmg = Math.floor(mDmg * (0.8 + Math.random() * 0.4));
        mouseHp -= mDmg;
      }
    }

    if (monsterHp <= 0) {
      // 胜利
      const goldReward = Math.floor(50 * Math.pow(1.5, floor));
      const expReward = Math.floor(100 * Math.pow(1.4, floor));
      state.gold += goldReward;
      state.exp += expReward;
      state.towerFloor++;
      if (state.towerFloor - 1 > state.towerBestFloor) {
        state.towerBestFloor = state.towerFloor - 1;
      }
      checkLevelUp();
      addLog(`🗼 镇妖塔第${floor}层通关！+${formatNumber(expReward)}经验 +${formatNumber(goldReward)}灵石`);
      emit('towerClear', { floor, goldReward, expReward });
      saveState();
      return { success: true, floor, msg: `第${floor}层通关！`, goldReward, expReward, monsterName: monster.displayName };
    } else {
      addLog(`🗼 镇妖塔第${floor}层挑战失败！`);
      saveState();
      return { success: false, floor, msg: `第${floor}层失败，需要更强！`, monsterName: monster.displayName };
    }
  }

  function claimTowerReward() {
    if (state.towerDailyRewardClaimed) return { success: false, msg: '今日已领取' };
    if (state.towerBestFloor <= 0) return { success: false, msg: '尚未通关任何层' };

    const gold = state.towerBestFloor * 100;
    const herbs = Math.floor(state.towerBestFloor / 3) + 1;
    state.gold += gold;
    state.materials.herb += herbs;
    state.towerDailyRewardClaimed = true;
    addLog(`🗼 领取镇妖塔奖励：${formatNumber(gold)}灵石 + ${herbs}灵草`);
    saveState();
    return { success: true, msg: `领取成功！+${formatNumber(gold)}灵石 +${herbs}灵草` };
  }

  // ========== 装备操作 ==========
  function equipItem(inventoryIndex) {
    const item = state.inventory[inventoryIndex];
    if (!item) return false;

    // 卸下旧装备
    const old = state.equipment[item.slot];
    if (old) {
      state.inventory.push(old);
    }
    state.equipment[item.slot] = item;
    state.inventory.splice(inventoryIndex, 1);
    state.hp = Math.min(state.hp, getComputedStats().maxHp);
    saveState();
    emit('equipChange', {});
    return true;
  }

  function unequipItem(slot) {
    const item = state.equipment[slot];
    if (!item) return false;
    if (state.inventory.length >= state.inventoryMax) return false;
    state.inventory.push(item);
    state.equipment[slot] = null;
    saveState();
    return true;
  }

  function sellItem(inventoryIndex) {
    const item = state.inventory[inventoryIndex];
    if (!item) return 0;
    const gold = Math.max(1, getEquipScore(item) * 2);
    state.gold += gold;
    state.inventory.splice(inventoryIndex, 1);
    saveState();
    return gold;
  }

  function enhanceEquip(slot) {
    const item = state.equipment[slot];
    if (!item) return { success: false, msg: '无装备' };
    const cost = getEquipEnhanceCost(item);
    if (state.gold < cost) return { success: false, msg: `灵石不足（需要${formatNumber(cost)}）` };
    if (item.enhanceLevel >= 15) return { success: false, msg: '已满级' };

    state.gold -= cost;
    item.enhanceLevel++;
    addLog(`✨ ${item.name} 强化到+${item.enhanceLevel}！`);
    saveState();
    return { success: true, msg: `强化成功！+${item.enhanceLevel}` };
  }

  // ========== 丹药操作 ==========
  function craftPill(recipeId) {
    const recipe = PILL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { success: false, msg: '配方不存在' };
    if (getRealmIndex(state.level) < recipe.minRealm) return { success: false, msg: '境界不足' };
    if (state.gold < recipe.gold) return { success: false, msg: '灵石不足' };
    for (const [mat, need] of Object.entries(recipe.materials)) {
      if ((state.materials[mat] || 0) < need) return { success: false, msg: `材料不足（${mat}）` };
    }

    state.gold -= recipe.gold;
    for (const [mat, need] of Object.entries(recipe.materials)) {
      state.materials[mat] -= need;
    }
    state.pills[recipeId] = (state.pills[recipeId] || 0) + 1;
    addLog(`🧪 炼制成功：${recipe.icon} ${recipe.name}`);
    saveState();
    return { success: true, msg: `炼制成功！` };
  }

  function usePill(recipeId) {
    if ((state.pills[recipeId] || 0) <= 0) return { success: false, msg: '数量不足' };
    const recipe = PILL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { success: false, msg: '配方不存在' };

    state.pills[recipeId]--;
    const eff = recipe.effect;
    const now = Date.now();

    if (eff.type === 'heal') {
      const stats = getComputedStats();
      state.hp = stats.maxHp;
      addLog(`💚 使用${recipe.name}，生命恢复满！`);
    } else if (eff.type === 'tribBoost') {
      state.buffs.tribBoost = { value: eff.value, until: now + 60000 };
      addLog(`⚡ 使用${recipe.name}，渡劫成功率+${eff.value * 100}%！`);
    } else if (eff.type === 'expBoost') {
      state.buffs.expBoost = { mult: eff.mult, until: now + eff.duration * 1000 };
      addLog(`💊 使用${recipe.name}，经验x${eff.mult} ${eff.duration}秒！`);
    } else if (eff.type === 'atkBoost') {
      state.buffs.atkBoost = { mult: eff.mult, until: now + eff.duration * 1000 };
      addLog(`🔴 使用${recipe.name}，攻击x${eff.mult} ${eff.duration}秒！`);
    } else if (eff.type === 'critBoost') {
      state.buffs.critBoost = { value: eff.value, until: now + eff.duration * 1000 };
      addLog(`💥 使用${recipe.name}，暴击+${eff.value * 100}% ${eff.duration}秒！`);
    }

    emit('pillUse', { recipe });
    saveState();
    return { success: true, msg: `使用成功！` };
  }

  // ========== 功法操作 ==========
  function upgradeSkill(skillId) {
    const sk = SKILL_TREE.find(s => s.id === skillId);
    if (!sk) return { success: false, msg: '功法不存在' };
    if (getRealmIndex(state.level) < sk.realm) return { success: false, msg: '境界不足' };
    const curLv = state.skills[skillId] || 0;
    if (curLv >= sk.maxLevel) return { success: false, msg: '已满级' };
    if (state.statPoints < sk.cost) return { success: false, msg: '修炼点不足' };

    state.statPoints -= sk.cost;
    state.skills[skillId] = curLv + 1;
    addLog(`📜 功法【${sk.name}】升至${curLv + 1}级！`);
    saveState();
    return { success: true, msg: `${sk.name} 升至${curLv + 1}级！` };
  }

  // ========== 灵兽操作 ==========
  function feedBeast(beastId) {
    const beast = state.beasts.find(b => b.id === beastId);
    if (!beast) return { success: false, msg: '灵兽不存在' };
    const cost = Math.floor(50 * Math.pow(1.5, beast.level));
    if (state.gold < cost) return { success: false, msg: `灵石不足（需要${formatNumber(cost)}）` };

    state.gold -= cost;
    beast.feedCount++;
    if (beast.feedCount >= beast.level * 3) {
      beast.level++;
      beast.feedCount = 0;
      beast.baseAtk = Math.floor(beast.baseAtk * 1.25 + 2);
      beast.baseDef = Math.floor(beast.baseDef * 1.2 + 1);
      addLog(`🐾 ${beast.name} 升至${beast.level}级！`);
    } else {
      addLog(`🐾 喂养${beast.name}（${beast.feedCount}/${beast.level * 3}）`);
    }
    saveState();
    return { success: true, msg: `喂养成功` };
  }

  function setActiveBeast(beastId) {
    if (!state.beasts.find(b => b.id === beastId)) return false;
    state.activeBeastId = beastId;
    saveState();
    return true;
  }

  // ========== 加点 ==========
  function upgrade(stat) {
    if (!state || state.statPoints <= 0) return false;
    switch (stat) {
      case 'attack':
        state.baseAttack += Math.floor(state.baseAttack * 0.05 + 3);
        break;
      case 'defense':
        state.baseDefense += Math.floor(state.baseDefense * 0.05 + 2);
        break;
      case 'hp':
        state.baseMaxHp += Math.floor(state.baseMaxHp * 0.05 + 10);
        state.hp = getComputedStats().maxHp;
        break;
      case 'crit':
        state.baseCritRate = Math.min(80, state.baseCritRate + 1);
        state.baseCritDamage += 5;
        break;
      default:
        return false;
    }
    state.statPoints--;
    saveState();
    return true;
  }

  // ========== 离线补算 ==========
  function processOfflineGains() {
    if (!state) return null;
    const now = Date.now();
    const offlineMs = now - state.lastTickTime;
    const offlineSeconds = Math.floor(offlineMs / 1000);
    if (offlineSeconds < 30) return null;

    // 渡劫中不产出
    if (state.needTribulation) {
      state.lastTickTime = now;
      saveState();
      return { offlineSeconds, totalKills: 0, totalExp: 0, totalGold: 0, levelUps: 0, note: '渡劫中' };
    }

    const tickCount = Math.floor(offlineSeconds / (TICK_INTERVAL / 1000));
    const realmIdx = getRealmIndex(state.level);
    const monsters = MONSTER_TEMPLATES[realmIdx];
    const avgExp = monsters.reduce((sum, m) => sum + m.exp, 0) / monsters.length;
    const avgGold = monsters.reduce((sum, m) => sum + m.gold, 0) / monsters.length;
    const avgHp = monsters.reduce((sum, m) => sum + m.hp, 0) / monsters.length;
    const levelScale = 1 + (state.level - REALMS[realmIdx].minLevel) * 0.15;
    const stats = getComputedStats();

    const killsPerTick = Math.max(0.1, stats.attack / (avgHp * levelScale));
    const totalKills = Math.floor(killsPerTick * tickCount);
    const totalExp = Math.floor(totalKills * avgExp * levelScale);
    const totalGold = Math.floor(totalKills * avgGold * levelScale);

    // 离线材料
    const offlineHerbs = Math.floor(totalKills * 0.15);
    const offlineOre = Math.floor(totalKills * 0.1);
    state.materials.herb += offlineHerbs;
    state.materials.ore += offlineOre;

    state.exp += totalExp;
    state.gold += totalGold;
    state.totalExp += totalExp;
    state.totalGold += totalGold;
    state.killCount += totalKills;

    let levelUps = 0;
    while (state.exp >= getExpToNextLevel(state.level)) {
      const realm = getRealm(state.level + 1);
      const prevRealm = getRealm(state.level);
      if (realm.name !== prevRealm.name) {
        state.needTribulation = true;
        state._tribWarnShown = false;
        break;
      }
      state.exp -= getExpToNextLevel(state.level);
      state.level++;
      state.baseAttack = Math.floor(state.baseAttack * 1.12 + 2);
      state.baseDefense = Math.floor(state.baseDefense * 1.08 + 1);
      state.baseMaxHp = Math.floor(state.baseMaxHp * 1.1 + 10);
      state.hp = getComputedStats().maxHp;
      state.statPoints += 3;
      levelUps++;
    }

    // 离线装备掉落
    const offlineEquips = Math.floor(totalKills * 0.02);
    let equipsGained = 0;
    for (let i = 0; i < Math.min(offlineEquips, 5); i++) {
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(generateEquipment(state.level));
        equipsGained++;
      }
    }

    state.lastTickTime = now;
    state.currentMonster = spawnMonster(state.level);
    saveState();

    return { offlineSeconds, totalKills, totalExp, totalGold, levelUps, offlineHerbs, offlineOre, equipsGained };
  }

  // ========== 辅助 ==========
  function cleanExpiredBuffs() {
    const now = Date.now();
    for (const key of Object.keys(state.buffs)) {
      if (state.buffs[key].until && now >= state.buffs[key].until) {
        delete state.buffs[key];
      }
    }
  }

  function randRange(arr) {
    return Math.floor(arr[0] + Math.random() * (arr[1] - arr[0] + 1));
  }

  function addLog(msg) {
    if (!state) return;
    state.battleLog.push(msg);
    if (state.battleLog.length > MAX_LOG) {
      state.battleLog = state.battleLog.slice(-MAX_LOG);
    }
  }

  function emit(eventType, data) {
    if (onBattleEvent) onBattleEvent(eventType, data);
  }

  function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(1) + '兆';
    if (num >= 1e8) return (num / 1e8).toFixed(1) + '亿';
    if (num >= 1e4) return (num / 1e4).toFixed(1) + '万';
    return Math.floor(num).toString();
  }

  // ========== 启动/停止 ==========
  function start(eventCallback) {
    onBattleEvent = eventCallback;
    loadState();
    if (!state.currentMonster) {
      state.currentMonster = spawnMonster(state.level);
    }
    saveState();
    tickTimer = setInterval(processCombatTick, TICK_INTERVAL);
  }

  function stop() {
    if (tickTimer) clearInterval(tickTimer);
    tickTimer = null;
  }

  // ========== 公开接口 ==========
  function getState() {
    if (!state) return null;
    const realmIdx = getRealmIndex(state.level);
    const realm = REALMS[realmIdx];
    const expToNext = getExpToNextLevel(state.level);
    const stats = getComputedStats();

    return {
      ...state,
      realmIndex: realmIdx,
      realm: realm.name,
      realmColor: realm.color,
      expToNext,
      expPercent: Math.min(100, Math.floor((state.exp / expToNext) * 100)),
      computed: stats,
      visualEquip: {
        weapon: VISUAL_EQUIP.weapon[realmIdx],
        armor: VISUAL_EQUIP.armor[realmIdx],
        mount: VISUAL_EQUIP.mount[realmIdx],
        pet: VISUAL_EQUIP.pet[realmIdx],
      },
      activeBeast: getActiveBeast(),
      tribChance: state.needTribulation ? getTribulationChance(state) : null,
    };
  }

  return {
    start, stop, getState, upgrade, resetState, processOfflineGains, formatNumber,
    // 装备
    equipItem, unequipItem, sellItem, enhanceEquip, getEquipScore, getEquipEnhanceCost,
    // 丹药
    craftPill, usePill, PILL_RECIPES,
    // 功法
    upgradeSkill, SKILL_TREE,
    // 灵兽
    feedBeast, setActiveBeast, BEAST_TEMPLATES,
    // 秘境
    enterSecretRealm, SECRET_REALMS,
    // 镇妖塔
    challengeTower, claimTowerReward,
    // 渡劫
    attemptTribulation,
    // 常量
    REALMS, EQUIP_QUALITIES, EQUIP_SLOT_NAMES,
  };

})();

if (typeof module !== 'undefined') module.exports = GameEngine;
