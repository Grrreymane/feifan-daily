// ============================================================
// engine.js — 鼠鼠修仙 v0.8 天机阁抽卡系统
// 日夜循环 / 场景小景 / 伤害弹跳 / Mini-HUD / 连杀特效
// ============================================================

const GameEngine = (() => {

  const SAVE_KEY = 'mouse_cultivation_save_v4';
  const OLD_SAVE_KEY = 'mouse_cultivation_save_v3';
  let TICK_INTERVAL = 2000;
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

  const EQUIP_NAMES = {
    weapon: ['木剑', '铁剑', '飞剑', '灵剑', '神剑', '天剑', '青锋', '赤霄', '墨渊', '星辰'],
    armor: ['布衣', '道袍', '法袍', '灵甲', '仙袍', '天衣', '玄铁甲', '龙鳞袍', '紫金铠'],
    accessory: ['铜环', '玉佩', '灵珠', '乾坤镯', '天机链', '混沌珠', '太极印', '凤凰翎'],
    boots: ['草鞋', '布靴', '云步靴', '踏风靴', '追风靴', '天行靴', '凌霄靴', '虚空步'],
  };

  const VISUAL_EQUIP = {
    weapon: ['木剑', '铁剑', '飞剑', '灵剑', '神剑', '天剑'],
    armor:  ['布衣', '道袍', '法袍', '华服', '仙袍', '天衣'],
    mount:  [null, null, '仙鹤', '仙鹤', '麒麟', '麒麟'],
    pet:    [null, '小蛇', '小蛇', '蛟龙', '蛟龙', '神龙'],
  };

  function generateEquipment(level, forcedQuality) {
    const realmIdx = getRealmIndex(level);
    const slot = EQUIP_SLOTS[Math.floor(Math.random() * EQUIP_SLOTS.length)];
    let qualityIdx;
    if (forcedQuality !== undefined) {
      qualityIdx = forcedQuality;
    } else {
      const roll = Math.random();
      if (roll < 0.40) qualityIdx = 0;
      else if (roll < 0.70) qualityIdx = 1;
      else if (roll < 0.88) qualityIdx = 2;
      else if (roll < 0.96) qualityIdx = 3;
      else if (roll < 0.993) qualityIdx = 4;
      else qualityIdx = 5;
    }
    const quality = EQUIP_QUALITIES[qualityIdx];
    const names = EQUIP_NAMES[slot];
    const name = names[Math.min(realmIdx, names.length - 1)];
    const baseStat = Math.floor((5 + level * 3) * quality.statMult);
    const baseAttr = {};
    if (slot === 'weapon') baseAttr.attack = baseStat;
    else if (slot === 'armor') baseAttr.defense = Math.floor(baseStat * 0.6);
    else if (slot === 'accessory') baseAttr.maxHp = Math.floor(baseStat * 3);
    else if (slot === 'boots') { baseAttr.dodge = Math.floor(baseStat * 0.1); baseAttr.atkSpeed = Math.floor(baseStat * 0.15); }
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
      slot, qualityIdx, quality: quality.name, qualityColor: quality.color,
      level, baseAttr, affixes, enhanceLevel: 0,
    };
  }

  function getEquipScore(equip) {
    if (!equip) return 0;
    let score = 0;
    const mult = 1 + equip.enhanceLevel * 0.1;
    for (const [k, v] of Object.entries(equip.baseAttr)) { score += v * mult; }
    for (const a of equip.affixes) { score += a.value * (a.type === 'percent' ? 5 : 1) * mult; }
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

  // ========== 洞府系统 ==========
  const CAVE_BUILDINGS = [
    { id: 'herb_garden', name: '药园', icon: '🌿', desc: '每分钟自动产出灵草',
      maxLevel: 10, baseCost: 200, costMult: 2.5,
      effect: (lv) => ({ herb_per_min: lv * 0.5 }) },
    { id: 'spirit_array', name: '聚灵阵', icon: '✨', desc: '增加挂机经验速度',
      maxLevel: 10, baseCost: 500, costMult: 3,
      effect: (lv) => ({ exp_bonus_pct: lv * 5 }) },
    { id: 'forge_room', name: '炼丹房', icon: '🔥', desc: '炼丹材料消耗减少',
      maxLevel: 5, baseCost: 800, costMult: 3.5,
      effect: (lv) => ({ pill_mat_reduce_pct: lv * 10 }) },
    { id: 'mine_shaft', name: '矿井', icon: '⛏️', desc: '每分钟自动产出矿石',
      maxLevel: 10, baseCost: 300, costMult: 2.5,
      effect: (lv) => ({ ore_per_min: lv * 0.3 }) },
    { id: 'training_ground', name: '练功场', icon: '🏋️', desc: '加点效果提升',
      maxLevel: 5, baseCost: 1000, costMult: 4,
      effect: (lv) => ({ stat_point_bonus_pct: lv * 15 }) },
  ];

  // ========== 成就系统 ==========
  const ACHIEVEMENTS = [
    { id: 'kill_10', name: '初出茅庐', desc: '击杀10只怪物', icon: '🏅',
      check: (s) => s.killCount >= 10, reward: { attack: 2 } },
    { id: 'kill_100', name: '小有名气', desc: '击杀100只怪物', icon: '🏅',
      check: (s) => s.killCount >= 100, reward: { attack: 5, defense: 3 } },
    { id: 'kill_1000', name: '修仙新星', desc: '击杀1000只怪物', icon: '🎖️',
      check: (s) => s.killCount >= 1000, reward: { attack: 15, maxHp: 100 } },
    { id: 'kill_10000', name: '妖魔克星', desc: '击杀1万只怪物', icon: '🏆',
      check: (s) => s.killCount >= 10000, reward: { attack: 50, critRate: 2 } },
    { id: 'gold_1000', name: '小康之家', desc: '累计获得1000灵石', icon: '💰',
      check: (s) => s.totalGold >= 1000, reward: { goldBonus: 5 } },
    { id: 'gold_100000', name: '灵石大亨', desc: '累计获得10万灵石', icon: '💰',
      check: (s) => s.totalGold >= 100000, reward: { goldBonus: 10 } },
    { id: 'level_10', name: '筑基有成', desc: '达到10级', icon: '⬆️',
      check: (s) => s.level >= 10, reward: { attack: 5, defense: 3, maxHp: 50 } },
    { id: 'level_20', name: '金丹初成', desc: '达到20级', icon: '⬆️',
      check: (s) => s.level >= 20, reward: { attack: 15, defense: 8, maxHp: 150 } },
    { id: 'level_30', name: '元婴显化', desc: '达到30级', icon: '⬆️',
      check: (s) => s.level >= 30, reward: { attack: 40, defense: 20, maxHp: 400 } },
    { id: 'level_50', name: '大乘之境', desc: '达到50级', icon: '👑',
      check: (s) => s.level >= 50, reward: { attack: 100, defense: 50, maxHp: 1000, critRate: 5 } },
    { id: 'tower_10', name: '镇妖勇士', desc: '镇妖塔通过10层', icon: '🗼',
      check: (s) => s.towerBestFloor >= 10, reward: { attack: 10, defense: 5 } },
    { id: 'tower_50', name: '镇妖豪杰', desc: '镇妖塔通过50层', icon: '🗼',
      check: (s) => s.towerBestFloor >= 50, reward: { attack: 30, critDamage: 15 } },
    { id: 'first_beast', name: '灵兽缘分', desc: '捕获第一只灵兽', icon: '🐾',
      check: (s) => s.beasts && s.beasts.length >= 1, reward: { attack: 3, defense: 2 } },
    { id: 'beast_3', name: '万兽之友', desc: '捕获3只灵兽', icon: '🐾',
      check: (s) => s.beasts && s.beasts.length >= 3, reward: { attack: 10, maxHp: 80 } },
    { id: 'first_death', name: '死而复生', desc: '第一次死亡', icon: '💀',
      check: (s) => s.deathCount >= 1, reward: { maxHp: 30 } },
    { id: 'death_10', name: '百折不挠', desc: '死亡10次', icon: '💀',
      check: (s) => s.deathCount >= 10, reward: { defense: 10, maxHp: 100 } },
    { id: 'elite_kill', name: '精英猎手', desc: '击杀10只精英怪', icon: '⭐',
      check: (s) => s.eliteKillCount >= 10, reward: { attack: 8, critRate: 1 } },
    { id: 'elite_50', name: '精英克星', desc: '击杀50只精英怪', icon: '⭐',
      check: (s) => s.eliteKillCount >= 50, reward: { attack: 25, critDamage: 10 } },
  ];

  // ========== 天机阁·抽卡系统 ==========
  const GACHA_COST_SINGLE = 10;  // 单抽10天机令
  const GACHA_COST_TEN = 90;     // 十连90天机令（9折）

  // 品质概率：白30%→绿35%→蓝20%→紫10%→橙4%→红1%
  const GACHA_QUALITY_RATES = [0.30, 0.35, 0.20, 0.10, 0.04, 0.01];
  const GACHA_QUALITY_NAMES = ['凡品','良品','稀有','珍品','极品','传说'];
  const GACHA_QUALITY_COLORS = ['#CCCCCC','#44CC44','#4488FF','#AA55FF','#FF8800','#FF2222'];

  // 武器外观池（20款）
  const WEAPON_SKINS = [
    { id: 'ws_bamboo', name: '翠竹剑', quality: 0, desc: '竹节剑身，清雅脱俗' },
    { id: 'ws_rusty', name: '锈铁剑', quality: 0, desc: '虽锈迹斑斑，却暗含杀机' },
    { id: 'ws_bone', name: '白骨剑', quality: 0, desc: '妖兽骨骼打磨而成' },
    { id: 'ws_jade', name: '碧玉剑', quality: 1, desc: '通体碧绿，灵气流转' },
    { id: 'ws_flame', name: '烈焰刀', quality: 1, desc: '刀身缠绕火焰纹' },
    { id: 'ws_frost', name: '寒霜剑', quality: 1, desc: '剑气凝霜，寒意逼人' },
    { id: 'ws_wind', name: '疾风匕', quality: 1, desc: '小巧轻灵，快如闪电' },
    { id: 'ws_thunder', name: '雷霆锤', quality: 2, desc: '雷光闪烁的战锤' },
    { id: 'ws_blood', name: '嗜血刃', quality: 2, desc: '暗红色刀刃，渗出血光' },
    { id: 'ws_shadow', name: '暗影匕首', quality: 2, desc: '漆黑如墨，隐于虚空' },
    { id: 'ws_starfall', name: '星陨剑', quality: 2, desc: '剑身嵌满星辰碎片' },
    { id: 'ws_dragon', name: '龙牙剑', quality: 3, desc: '龙族之牙铸成的神兵' },
    { id: 'ws_phoenix', name: '凤翎刃', quality: 3, desc: '凤凰羽翎化作的利刃' },
    { id: 'ws_void', name: '虚空裂隙', quality: 3, desc: '撕裂空间的黑色大剑' },
    { id: 'ws_moonlight', name: '月华剑', quality: 3, desc: '银色月光凝成剑身' },
    { id: 'ws_golden_lotus', name: '金莲法杖', quality: 4, desc: '顶端盛开金色莲花' },
    { id: 'ws_chaos', name: '混沌之刃', quality: 4, desc: '混沌之力凝结的异形武器' },
    { id: 'ws_heavenly', name: '天罚雷剑', quality: 4, desc: '引天雷而降的审判之剑' },
    { id: 'ws_primordial', name: '太初神剑', quality: 5, desc: '开天辟地时留存的神器' },
    { id: 'ws_cosmic', name: '寰宇星辰剑', quality: 5, desc: '蕴含整个星河的终极之剑' },
  ];

  // 衣服外观池（20款）
  const ARMOR_SKINS = [
    { id: 'as_patched', name: '补丁布衣', quality: 0, desc: '缝缝补补的粗布衣裳' },
    { id: 'as_farmer', name: '农夫麻衣', quality: 0, desc: '朴实无华的麻布衣' },
    { id: 'as_scholar', name: '书生白袍', quality: 0, desc: '洁白的读书人长袍' },
    { id: 'as_bamboo', name: '竹纹道袍', quality: 1, desc: '绣着竹叶纹的道袍' },
    { id: 'as_cloud', name: '云纹法袍', quality: 1, desc: '飘渺云纹若隐若现' },
    { id: 'as_fire_robe', name: '赤焰袍', quality: 1, desc: '火红色法袍，袖口有火焰' },
    { id: 'as_ice_silk', name: '冰蚕丝甲', quality: 1, desc: '冰蚕丝编织的轻甲' },
    { id: 'as_night', name: '夜行衣', quality: 2, desc: '漆黑夜行者的紧身衣' },
    { id: 'as_dragon_scale', name: '龙鳞战甲', quality: 2, desc: '泛着青色光芒的龙鳞甲' },
    { id: 'as_flower', name: '百花锦袍', quality: 2, desc: '绣满百花的华丽锦袍' },
    { id: 'as_star_robe', name: '星辰法袍', quality: 2, desc: '深蓝底色点缀星光' },
    { id: 'as_blood_armor', name: '血战铠甲', quality: 3, desc: '暗红色重甲，浸满战意' },
    { id: 'as_jade_emperor', name: '玉帝仙袍', quality: 3, desc: '金丝玉线交织的帝王之袍' },
    { id: 'as_ghost', name: '幽冥鬼衣', quality: 3, desc: '半透明的幽绿鬼衣' },
    { id: 'as_thunder_armor', name: '雷霆战甲', quality: 3, desc: '电弧缠绕的金色战甲' },
    { id: 'as_phoenix_robe', name: '凤凰涅槃袍', quality: 4, desc: '浴火凤凰纹的赤金法袍' },
    { id: 'as_void_cloak', name: '虚空披风', quality: 4, desc: '吞噬光线的漆黑披风' },
    { id: 'as_celestial', name: '天神金甲', quality: 4, desc: '天界铸造的纯金神甲' },
    { id: 'as_primordial_robe', name: '鸿蒙道袍', quality: 5, desc: '混沌初开时的至高道袍' },
    { id: 'as_universe', name: '万象天衣', quality: 5, desc: '包罗万象的宇宙级法衣' },
  ];

  const GACHA_POOL = [...WEAPON_SKINS.map(s => ({ ...s, type: 'weapon' })), ...ARMOR_SKINS.map(s => ({ ...s, type: 'armor' }))];

  function rollGachaQuality(guaranteed) {
    // guaranteed: 保底最低品质（十连保底用）
    const roll = Math.random();
    let cumulative = 0;
    for (let i = 0; i < GACHA_QUALITY_RATES.length; i++) {
      cumulative += GACHA_QUALITY_RATES[i];
      if (roll < cumulative) {
        return Math.max(i, guaranteed || 0);
      }
    }
    return Math.max(GACHA_QUALITY_RATES.length - 1, guaranteed || 0);
  }

  function doGachaPull(count) {
    // count: 1=单抽, 10=十连
    const cost = count === 10 ? GACHA_COST_TEN : GACHA_COST_SINGLE * count;
    if ((state.tianjiTokens || 0) < cost) {
      return { success: false, msg: `天机令不足！需要${cost}枚，当前${state.tianjiTokens || 0}枚` };
    }

    state.tianjiTokens -= cost;
    const results = [];
    let hasPurpleOrAbove = false;

    for (let i = 0; i < count; i++) {
      // 十连：第10抽保底紫色(quality>=3)
      const isGuaranteed = (count === 10 && i === 9 && !hasPurpleOrAbove);
      const quality = rollGachaQuality(isGuaranteed ? 3 : 0);
      if (quality >= 3) hasPurpleOrAbove = true;

      // 从对应品质的池子中随机选
      const poolByQuality = GACHA_POOL.filter(item => item.quality === quality);
      if (poolByQuality.length === 0) continue;
      const chosen = poolByQuality[Math.floor(Math.random() * poolByQuality.length)];

      // 检查是否已拥有
      const owned = (state.ownedSkins || []).includes(chosen.id);

      if (owned) {
        // 重复：转换为天机令（品质越高返还越多）
        const refund = [1, 2, 5, 10, 25, 50][quality] || 1;
        state.tianjiTokens += refund;
        results.push({ ...chosen, duplicate: true, refund });
      } else {
        // 新获得
        if (!state.ownedSkins) state.ownedSkins = [];
        state.ownedSkins.push(chosen.id);
        results.push({ ...chosen, duplicate: false, isNew: true });
      }
    }

    // 统计
    state.totalGachaPulls = (state.totalGachaPulls || 0) + count;

    addLog(`🎰 天机阁${count === 10 ? '十连' : '单抽'}！消耗${cost}天机令`);
    for (const r of results) {
      if (r.isNew) {
        addLog(`✨ <span style="color:${GACHA_QUALITY_COLORS[r.quality]}">[${GACHA_QUALITY_NAMES[r.quality]}]${r.name}</span> —— 新获得！`);
      } else if (r.duplicate) {
        addLog(`🔄 ${r.name}（重复→+${r.refund}天机令）`);
      }
    }

    emit('gacha', { results, count });
    saveState();
    return { success: true, results, cost };
  }

  function equipSkin(skinId) {
    if (!state.ownedSkins || !state.ownedSkins.includes(skinId)) {
      return { success: false, msg: '未拥有此外观' };
    }
    const skin = GACHA_POOL.find(s => s.id === skinId);
    if (!skin) return { success: false, msg: '外观不存在' };

    if (skin.type === 'weapon') {
      state.equippedWeaponSkin = skinId;
    } else {
      state.equippedArmorSkin = skinId;
    }
    addLog(`👗 装备外观：${skin.name}`);
    saveState();
    return { success: true, msg: `已装备${skin.name}` };
  }

  function unequipSkin(type) {
    if (type === 'weapon') state.equippedWeaponSkin = null;
    else state.equippedArmorSkin = null;
    saveState();
    return { success: true };
  }

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
    let base = 0.6;
    const totalScore = EQUIP_SLOTS.reduce((s, slot) => s + getEquipScore(state.equipment[slot]), 0);
    base += Math.min(0.15, totalScore * 0.00005);
    if (state.buffs && state.buffs.tribBoost) base += state.buffs.tribBoost.value;
    if (state.activeBeastId) base += 0.03;
    // 成就加成
    base += (state.achievementBonuses?.tribChance || 0);
    return Math.min(0.95, base);
  }

  // ========== 状态管理 ==========
  function getDefaultState() {
    return {
      level: 1, exp: 0, gold: 0,
      baseAttack: 5, baseDefense: 1, baseMaxHp: 100, hp: 100,
      baseCritRate: 5, baseCritDamage: 150,
      killCount: 0, totalGold: 0, totalExp: 0,
      createdAt: Date.now(), lastTickTime: Date.now(),
      currentMonster: null, battleLog: [], statPoints: 0,

      // 装备
      equipment: { weapon: null, armor: null, accessory: null, boots: null },
      inventory: [], inventoryMax: 30,

      // 材料
      materials: { herb: 0, ore: 0, essence: 0 },

      // 丹药/功法/灵兽
      pills: {}, skills: {},
      beasts: [], activeBeastId: null,

      // Buff
      buffs: {},

      // 秘境
      secretRealmCharges: 3, secretRealmMaxCharges: 3, lastRealmRefresh: Date.now(),

      // 镇妖塔
      towerFloor: 1, towerBestFloor: 0,
      towerDailyRewardClaimed: false, lastTowerReset: Date.now(),

      // 渡劫
      needTribulation: false, tribulationCooldown: 0,

      // 奇遇
      lastEncounterTime: 0,

      // === v0.4 新增 ===
      // 死亡/复活
      isDead: false,
      deathCount: 0,
      reviveTime: 0, // 复活时间戳
      consecutiveKills: 0, // 连杀计数（触发精英怪）
      eliteKillCount: 0,

      // 战斗速度
      battleSpeed: 1, // 1x/2x/4x

      // 自动吃药
      autoHealEnabled: false,
      autoHealThreshold: 30, // 百分比

      // DPS统计
      dpsHistory: [], // 最近的伤害记录
      totalDamageDealt: 0,
      combatStartTime: 0,

      // 洞府
      cave: {
        herb_garden: 0,
        spirit_array: 0,
        forge_room: 0,
        mine_shaft: 0,
        training_ground: 0,
      },
      lastCaveProduction: Date.now(),

      // 成就
      achievements: {}, // id -> true
      achievementBonuses: {},

      // 怪物击杀次数（图鉴）
      monsterKills: {},

      // 毒/灼烧DoT
      playerDoTs: [], // { type, damage, ticksLeft }

      // === v0.5 转生系统 ===
      ascensionCount: 0,
      ascensionPoints: 0, // 仙缘点
      ascensionBonuses: {
        atkMult: 0, // 攻击%加成
        defMult: 0, // 防御%加成
        hpMult: 0,  // 生命%加成
        expMult: 0, // 经验%加成
        goldMult: 0, // 灵石%加成
        startLevel: 0, // 起始等级加成
      },
      totalAscensionPointsEarned: 0,

      // === v0.8 天机阁抽卡系统 ===
      tianjiTokens: 0,       // 天机令（抽卡代币）
      ownedSkins: [],        // 已拥有的外观ID列表
      equippedWeaponSkin: null, // 当前装备的武器外观ID
      equippedArmorSkin: null,  // 当前装备的衣服外观ID
      totalGachaPulls: 0,    // 总抽卡次数
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
      // v0.3存档迁移
      const v3Save = localStorage.getItem(OLD_SAVE_KEY);
      if (v3Save) {
        state = JSON.parse(v3Save);
        migrateState();
        addLog('💫 v0.3存档迁移至v0.4成功！新增死亡复活/洞府/成就系统！');
        saveState();
        return;
      }
      // 更旧的存档
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
        addLog('💫 旧存档迁移成功！欢迎来到v0.4大版本！');
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
    // v0.4迁移
    if (state.isDead === undefined) state.isDead = false;
    if (state.deathCount === undefined) state.deathCount = 0;
    if (state.reviveTime === undefined) state.reviveTime = 0;
    if (state.consecutiveKills === undefined) state.consecutiveKills = 0;
    if (state.eliteKillCount === undefined) state.eliteKillCount = 0;
    if (state.battleSpeed === undefined) state.battleSpeed = 1;
    if (state.autoHealEnabled === undefined) state.autoHealEnabled = false;
    if (state.autoHealThreshold === undefined) state.autoHealThreshold = 30;
    if (!state.cave) state.cave = def.cave;
    if (state.lastCaveProduction === undefined) state.lastCaveProduction = Date.now();
    if (!state.achievements) state.achievements = {};
    if (!state.achievementBonuses) state.achievementBonuses = {};
    if (!state.monsterKills) state.monsterKills = {};
    if (!state.playerDoTs) state.playerDoTs = [];
    if (!state.dpsHistory) state.dpsHistory = [];
    if (state.totalDamageDealt === undefined) state.totalDamageDealt = 0;
    if (state.combatStartTime === undefined) state.combatStartTime = Date.now();
    // v0.5迁移
    if (state.ascensionCount === undefined) state.ascensionCount = 0;
    if (state.ascensionPoints === undefined) state.ascensionPoints = 0;
    if (!state.ascensionBonuses) state.ascensionBonuses = { atkMult:0, defMult:0, hpMult:0, expMult:0, goldMult:0, startLevel:0 };
    if (state.totalAscensionPointsEarned === undefined) state.totalAscensionPointsEarned = 0;
    // v0.8 gacha migration
    if (state.tianjiTokens === undefined) state.tianjiTokens = 0;
    if (!state.ownedSkins) state.ownedSkins = [];
    if (state.equippedWeaponSkin === undefined) state.equippedWeaponSkin = null;
    if (state.equippedArmorSkin === undefined) state.equippedArmorSkin = null;
    if (state.totalGachaPulls === undefined) state.totalGachaPulls = 0;
  }

  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { console.error('保存失败:', e); }
  }

  function resetState() {
    state = getDefaultState();
    localStorage.removeItem('mouse_cultivation_save');
    localStorage.removeItem(OLD_SAVE_KEY);
    saveState();
  }

  // ========== 计算属性 ==========
  function getComputedStats() {
    let attack = state.baseAttack;
    let defense = state.baseDefense;
    let maxHp = state.baseMaxHp;
    let critRate = state.baseCritRate;
    let critDamage = state.baseCritDamage;
    let lifesteal = 0, dodge = 0, atkSpeed = 0, goldBonus = 0, expBonus = 0;

    // 装备
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

    // 功法
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

    // 灵兽
    const beast = getActiveBeast();
    if (beast) {
      const beastMult = 1 + beast.level * 0.15;
      attack += Math.floor(beast.baseAtk * beastMult);
      defense += Math.floor(beast.baseDef * beastMult);
    }

    // 成就永久加成
    const ab = state.achievementBonuses || {};
    attack += (ab.attack || 0);
    defense += (ab.defense || 0);
    maxHp += (ab.maxHp || 0);
    critRate += (ab.critRate || 0);
    critDamage += (ab.critDamage || 0);
    goldBonus += (ab.goldBonus || 0);

    // 转生永久加成
    const asc = state.ascensionBonuses || {};
    if (asc.atkMult > 0) attack = Math.floor(attack * (1 + asc.atkMult * 10 / 100));
    if (asc.defMult > 0) defense = Math.floor(defense * (1 + asc.defMult * 10 / 100));
    if (asc.hpMult > 0) maxHp = Math.floor(maxHp * (1 + asc.hpMult * 10 / 100));
    if (asc.expMult > 0) expBonus += asc.expMult * 15;
    if (asc.goldMult > 0) goldBonus += asc.goldMult * 15;

    // 洞府: 聚灵阵经验加成
    const spiritArray = state.cave?.spirit_array || 0;
    if (spiritArray > 0) expBonus += spiritArray * 5;

    // 洞府: 练功场加点加成 (已在upgrade函数里处理)

    // Buff
    const now = Date.now();
    if (state.buffs.atkBoost && now < state.buffs.atkBoost.until) {
      attack = Math.floor(attack * state.buffs.atkBoost.mult);
    }
    if (state.buffs.critBoost && now < state.buffs.critBoost.until) {
      critRate += state.buffs.critBoost.value * 100;
    }
    if (state.buffs.expBoost && now < state.buffs.expBoost.until) {
      expBonus += (state.buffs.expBoost.mult - 1) * 100;
    }

    return {
      attack, defense, maxHp,
      critRate: Math.min(80, critRate),
      critDamage,
      lifesteal: Math.min(30, lifesteal),
      dodge: Math.min(50, dodge),
      atkSpeed: Math.min(50, atkSpeed),
      goldBonus,
      expBonus,
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

  function getRealm(level) { return REALMS[getRealmIndex(level)]; }

  function getExpToNextLevel(level) {
    return Math.floor(50 * Math.pow(1.35, level - 1));
  }

  function spawnMonster(level) {
    const realmIdx = getRealmIndex(level);
    const monsters = MONSTER_TEMPLATES[realmIdx];
    const template = monsters[Math.floor(Math.random() * monsters.length)];
    const levelScale = 1 + (level - REALMS[realmIdx].minLevel) * 0.15;

    // 精英怪机制：每15次连杀生成一只精英
    let isElite = false;
    let eliteMult = 1;
    if (state.consecutiveKills > 0 && state.consecutiveKills % 15 === 0) {
      isElite = true;
      eliteMult = 2.5;
    }
    // 5%概率出现随机精英（不依赖连杀）
    if (!isElite && Math.random() < 0.05) {
      isElite = true;
      eliteMult = 2;
    }

    const monster = {
      name: template.name,
      hp: Math.floor(template.hp * levelScale * eliteMult),
      maxHp: Math.floor(template.hp * levelScale * eliteMult),
      atk: Math.floor((template.atk || 5) * levelScale * (isElite ? 1.5 : 1)),
      exp: Math.floor(template.exp * levelScale * (isElite ? 3 : 1)),
      gold: Math.floor(template.gold * levelScale * (isElite ? 3 : 1)),
      trait: template.trait,
      isElite,
      hpBars: 1, // 多管血条
      currentBar: 1,
    };

    // 精英怪多管血条（每管为maxHp的血量）
    if (isElite) {
      monster.hpBars = 2 + Math.floor(realmIdx * 0.5);
      monster.currentBar = monster.hpBars;
      monster.hp = monster.maxHp; // 当前血管的HP
      monster.totalHp = monster.maxHp * monster.hpBars;
      monster.totalMaxHp = monster.totalHp;
    } else {
      monster.totalHp = monster.maxHp;
      monster.totalMaxHp = monster.maxHp;
    }

    return monster;
  }

  function processCombatTick() {
    if (!state) return;

    // 死亡中 - 等待复活
    if (state.isDead) {
      const now = Date.now();
      if (now >= state.reviveTime) {
        state.isDead = false;
        const stats = getComputedStats();
        state.hp = Math.floor(stats.maxHp * 0.5); // 半血复活
        state.consecutiveKills = 0;
        state.playerDoTs = [];
        addLog('🔄 鼠鼠重生！（半血状态）');
        emit('revive', {});
        // 刷新怪物
        state.currentMonster = spawnMonster(state.level);
        addLog(`🐾 ${state.currentMonster.name}${state.currentMonster.isElite ? ' ⭐精英' : ''} 出现了！`);
        emit('spawn', { monster: state.currentMonster });
      }
      state.lastTickTime = Date.now();
      saveState();
      return;
    }

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

    cleanExpiredBuffs();
    refreshRealmCharges();
    processCaveProduction();

    // 刷怪
    if (!state.currentMonster || (state.currentMonster.hp <= 0 && state.currentMonster.currentBar <= 1)) {
      state.currentMonster = spawnMonster(state.level);
      const eliteTag = state.currentMonster.isElite ? ' ⭐精英' : '';
      addLog(`🐾 ${state.currentMonster.name}${eliteTag} 出现了！`);
      emit('spawn', { monster: state.currentMonster });
    }

    const stats = getComputedStats();

    // === 自动吃药 ===
    if (state.autoHealEnabled) {
      const hpPct = state.hp / stats.maxHp * 100;
      if (hpPct <= state.autoHealThreshold && (state.pills['heal_pill'] || 0) > 0) {
        state.pills['heal_pill']--;
        state.hp = stats.maxHp;
        addLog('💚 自动使用回春丹！');
        emit('autoHeal', {});
      }
    }

    // === 处理DoT（毒/灼烧） ===
    let dotDamage = 0;
    state.playerDoTs = state.playerDoTs.filter(dot => {
      if (dot.ticksLeft > 0) {
        const dmg = Math.floor(dot.damage);
        dotDamage += dmg;
        dot.ticksLeft--;
        return dot.ticksLeft > 0;
      }
      return false;
    });
    if (dotDamage > 0) {
      state.hp = Math.max(0, state.hp - dotDamage);
      emit('dotDamage', { damage: dotDamage, type: state.playerDoTs[0]?.type || 'poison' });
    }

    // === 检查鼠鼠死亡（在怪物攻击前先检查DoT死亡） ===
    if (state.hp <= 0) {
      handlePlayerDeath();
      return;
    }

    // === 怪物攻击鼠鼠 ===
    const monsterAtk = state.currentMonster.atk || 0;
    if (monsterAtk > 0) {
      const dodgeRoll = Math.random() * 100;
      if (dodgeRoll >= stats.dodge) {
        let monsterDmg = Math.max(1, monsterAtk - stats.defense * 0.3);
        monsterDmg = Math.floor(monsterDmg * (0.8 + Math.random() * 0.4));

        // 怪物特性影响
        if (state.currentMonster.trait === 'berserk') monsterDmg = Math.floor(monsterDmg * 1.5);
        if (state.currentMonster.trait === 'burn') monsterDmg = Math.floor(monsterDmg * 1.2);

        state.hp = Math.max(0, state.hp - monsterDmg);
        emit('monsterAttack', { damage: monsterDmg });

        // 特性附加效果
        if (state.currentMonster.trait === 'poison' && Math.random() < 0.3) {
          state.playerDoTs.push({ type: 'poison', damage: monsterDmg * 0.2, ticksLeft: 3 });
          emit('traitTrigger', { trait: 'poison', msg: '中毒！' });
        }
        if (state.currentMonster.trait === 'burn' && Math.random() < 0.25) {
          state.playerDoTs.push({ type: 'burn', damage: monsterDmg * 0.15, ticksLeft: 3 });
          emit('traitTrigger', { trait: 'burn', msg: '灼烧！' });
        }
        if (state.currentMonster.trait === 'slow') {
          emit('traitTrigger', { trait: 'slow', msg: '减速！' });
        }
        if (state.currentMonster.trait === 'charm' && Math.random() < 0.1) {
          emit('traitTrigger', { trait: 'charm', msg: '魅惑！跳过一回合' });
          state.lastTickTime = Date.now();
          saveState();
          return; // 跳过攻击回合
        }
      } else {
        emit('dodge', {});
      }
    }

    // === 检查死亡 ===
    if (state.hp <= 0) {
      handlePlayerDeath();
      return;
    }

    // === 鼠鼠攻击 ===
    const isCrit = Math.random() * 100 < stats.critRate;
    let damage = stats.attack * (isCrit ? stats.critDamage / 100 : 1);
    damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

    // 怪物闪避
    if (state.currentMonster.trait === 'dodge' && Math.random() < 0.15) {
      addLog(`💨 ${state.currentMonster.name} 闪避了攻击！`);
      emit('monsterDodge', {});
    } else {
      // 荆棘反伤
      if (state.currentMonster.trait === 'thorns') {
        const thornDmg = Math.floor(damage * 0.1);
        state.hp = Math.max(0, state.hp - thornDmg);
        emit('traitTrigger', { trait: 'thorns', msg: `荆棘反伤${formatNumber(thornDmg)}！` });
      }

      state.currentMonster.hp = Math.max(0, state.currentMonster.hp - damage);
      state.currentMonster.totalHp = Math.max(0, state.currentMonster.totalHp - damage);

      // DPS统计
      state.totalDamageDealt += damage;
      state.dpsHistory.push({ damage, time: Date.now() });
      // 只保留最近10秒的记录
      const cutoff = Date.now() - 10000;
      state.dpsHistory = state.dpsHistory.filter(d => d.time > cutoff);

      // 玩家吸血
      if (stats.lifesteal > 0) {
        const heal = Math.floor(damage * stats.lifesteal / 100);
        state.hp = Math.min(stats.maxHp, state.hp + heal);
      }

      if (isCrit) {
        addLog(`⚔️ 暴击！鼠鼠对 ${state.currentMonster.name} 造成 ${formatNumber(damage)} 伤害！`);
      }
      emit('attack', { damage, isCrit, monsterName: state.currentMonster.name });

      // === 功法特效（视觉事件，基于已学功法随机触发） ===
      const learnedSkills = Object.entries(state.skills).filter(([id, lv]) => lv > 0);
      if (learnedSkills.length > 0 && Math.random() < 0.25) {
        const [skillId] = learnedSkills[Math.floor(Math.random() * learnedSkills.length)];
        emit('skillEffect', { skillId });
      }
    }

    // === 灵兽攻击 ===
    const activeBeast = getActiveBeast();
    if (activeBeast && state.currentMonster.hp > 0 && Math.random() < 0.4) {
      let beastDmg = Math.floor((activeBeast.baseAtk + activeBeast.level * 2) * (0.8 + Math.random() * 0.4));
      if (beastDmg > 0) {
        state.currentMonster.hp = Math.max(0, state.currentMonster.hp - beastDmg);
        state.currentMonster.totalHp = Math.max(0, state.currentMonster.totalHp - beastDmg);
        state.totalDamageDealt += beastDmg;
        emit('beastAttack', { damage: beastDmg, beastName: activeBeast.name, beastIcon: activeBeast.icon, templateId: activeBeast.templateId });
      }
    }

    // === 多管血条切换 ===
    if (state.currentMonster.hp <= 0 && state.currentMonster.currentBar > 1) {
      state.currentMonster.currentBar--;
      state.currentMonster.hp = state.currentMonster.maxHp;
      addLog(`💔 ${state.currentMonster.name} 还有 ${state.currentMonster.currentBar} 管血！`);
      emit('hpBarBreak', { barsLeft: state.currentMonster.currentBar });
    }

    // === 怪物特性: 吸血怪（只在怪物还活着时回血） ===
    if (state.currentMonster.hp > 0 && state.currentMonster.trait === 'lifesteal') {
      const isCritAtk = Math.random() * 100 < stats.critRate;
      const baseDmg = stats.attack * (isCritAtk ? stats.critDamage / 100 : 1);
      const mHeal = Math.floor(baseDmg * 0.08);
      state.currentMonster.hp = Math.min(state.currentMonster.maxHp, state.currentMonster.hp + mHeal);
      state.currentMonster.totalHp = Math.min(state.currentMonster.totalMaxHp, state.currentMonster.totalHp + mHeal);
    }

    // === 怪物死亡 ===
    if (state.currentMonster.hp <= 0 && state.currentMonster.currentBar <= 1) {
      const goldMult = 1 + stats.goldBonus / 100;
      const expMult = 1 + stats.expBonus / 100;
      let expGain = Math.floor(state.currentMonster.exp * expMult);
      let goldGain = Math.floor(state.currentMonster.gold * goldMult);

      state.exp += expGain;
      state.gold += goldGain;
      state.totalExp += expGain;
      state.totalGold += goldGain;
      state.killCount++;
      state.consecutiveKills++;

      // 怪物击杀统计
      const mName = state.currentMonster.name;
      state.monsterKills[mName] = (state.monsterKills[mName] || 0) + 1;
      if (state.currentMonster.isElite) state.eliteKillCount++;

      // 精英怪掉落天机令（50%概率，1-3枚）
      if (state.currentMonster.isElite && Math.random() < 0.5) {
        const tokens = 1 + Math.floor(Math.random() * 3);
        state.tianjiTokens = (state.tianjiTokens || 0) + tokens;
        addLog(`🎫 精英怪掉落 ${tokens} 枚天机令！`);
        emit('tokenDrop', { amount: tokens });
      }

      const eliteTag = state.currentMonster.isElite ? '⭐' : '';
      addLog(`💀 ${eliteTag}${mName} 被击败！+${formatNumber(expGain)}经验 +${formatNumber(goldGain)}灵石`);
      emit('kill', { monster: state.currentMonster, expGain, goldGain });

      processDrops(state.currentMonster);
      tryEncounter();
      tryCaptureBeast();
      checkLevelUp();
      checkAchievements();

      state.currentMonster = spawnMonster(state.level);
      const nextEliteTag = state.currentMonster.isElite ? ' ⭐精英' : '';
      addLog(`🐾 ${state.currentMonster.name}${nextEliteTag} 出现了！`);
      emit('spawn', { monster: state.currentMonster });
    }

    // === 生命回复 ===
    if (state.hp < stats.maxHp && state.hp > 0) {
      const regenRate = 0.02 + (state.consecutiveKills > 0 ? 0.005 : 0);
      state.hp = Math.min(stats.maxHp, state.hp + Math.floor(stats.maxHp * regenRate));
    }

    // === 死亡检查 (荆棘等) ===
    if (state.hp <= 0) {
      handlePlayerDeath();
      return;
    }

    state.lastTickTime = Date.now();
    saveState();
  }

  // ========== 死亡/复活系统 ==========
  function handlePlayerDeath() {
    state.isDead = true;
    state.deathCount++;
    state.consecutiveKills = 0;
    state.playerDoTs = [];

    // 死亡惩罚: 掉落10%灵石（最少不低于0）
    const goldLoss = Math.floor(state.gold * 0.1);
    state.gold = Math.max(0, state.gold - goldLoss);

    // 复活时间: 基础5秒，每次死亡增加0.5秒（上限15秒）
    const reviveDelay = Math.min(15000, 5000 + (state.deathCount - 1) * 500);
    state.reviveTime = Date.now() + reviveDelay;

    const delaySec = Math.ceil(reviveDelay / 1000);
    addLog(`💀 鼠鼠被击败！损失 ${formatNumber(goldLoss)} 灵石，${delaySec}秒后复活...`);
    emit('death', { goldLoss, reviveDelay: delaySec });

    state.lastTickTime = Date.now();
    saveState();
    checkAchievements();
  }

  // ========== 掉落处理 ==========
  function processDrops(monster) {
    // 材料掉落
    if (Math.random() < 0.35) {
      const matType = Math.random() < 0.5 ? 'herb' : (Math.random() < 0.7 ? 'ore' : 'essence');
      const amount = matType === 'essence' ? 1 : Math.floor(1 + Math.random() * 3);
      state.materials[matType] = (state.materials[matType] || 0) + amount;
      const matNames = { herb: '灵草', ore: '矿石', essence: '精华' };
      emit('drop', { type: matType, amount });
    }

    // 装备掉落
    let dropRate = 0.05 + getRealmIndex(state.level) * 0.01;
    if (monster.isElite) dropRate += 0.25; // 精英怪+25%掉落
    if (Math.random() < dropRate) {
      const minQ = monster.isElite ? 1 : 0; // 精英怪至少绿装
      const equip = generateEquipment(state.level, Math.min(5, minQ + Math.floor(Math.random() * 3)));
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(equip);
        addLog(`📦 获得装备 <span style="color:${equip.qualityColor}">[${equip.name}]</span>！`);
        emit('equipDrop', { equip });
      } else {
        const sellGold = getEquipScore(equip) * 2;
        state.gold += sellGold;
        addLog(`📦 背包已满，装备自动卖出 ${formatNumber(sellGold)} 灵石`);
      }
    }
  }

  function tryEncounter() {
    const now = Date.now();
    if (now - state.lastEncounterTime < 30000) return;
    if (Math.random() > 0.08) return;
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
    if (r.gold) { const g = randRange(r.gold); state.gold += g; }
    if (r.expPercent) {
      const pct = randRange(r.expPercent);
      const exp = Math.floor(getExpToNextLevel(state.level) * pct / 100);
      state.exp += exp;
    }
    if (r.equip) {
      const equip = generateEquipment(state.level, Math.min(5, 1 + Math.floor(Math.random() * 3)));
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(equip);
      }
    }
    // 奇遇额外掉落天机令（30%概率）
    if (Math.random() < 0.3) {
      const tokens = 1 + Math.floor(Math.random() * 2);
      state.tianjiTokens = (state.tianjiTokens || 0) + tokens;
      addLog(`🎫 奇遇获得 ${tokens} 天机令！`);
    }
    emit('encounter', { event });
  }

  function tryCaptureBeast() {
    const realmIdx = getRealmIndex(state.level);
    for (const tmpl of BEAST_TEMPLATES) {
      if (realmIdx < tmpl.minRealm) continue;
      if (state.beasts.find(b => b.templateId === tmpl.id)) continue;
      if (Math.random() < tmpl.captureChance) {
        const beast = {
          id: Date.now().toString(36), templateId: tmpl.id,
          name: tmpl.name, icon: tmpl.icon,
          baseAtk: tmpl.baseAtk, baseDef: tmpl.baseDef,
          skill: tmpl.skill, level: 1, feedCount: 0,
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
        state.needTribulation = true;
        state._tribWarnShown = false;
        state.level--;
        state.exp += getExpToNextLevel(state.level);
        addLog(`⛈️ 即将突破【${realm.name}】！需要渡劫！`);
        emit('tribulationReady', { realm: realm.name });
        break;
      } else {
        addLog(`⬆️ 升级！Lv.${state.level}（${realm.name}）`);
        emit('levelup', { level: state.level, realm: realm.name });
      }
    }
  }

  // ========== 成就检查 ==========
  function checkAchievements() {
    let newAchievement = false;
    for (const ach of ACHIEVEMENTS) {
      if (state.achievements[ach.id]) continue;
      if (ach.check(state)) {
        state.achievements[ach.id] = true;
        // 应用永久加成
        for (const [stat, val] of Object.entries(ach.reward)) {
          state.achievementBonuses[stat] = (state.achievementBonuses[stat] || 0) + val;
        }
        const rewardStr = Object.entries(ach.reward).map(([k,v]) => `${k}+${v}`).join(' ');
        addLog(`🏆 成就达成【${ach.name}】！永久加成：${rewardStr}`);
        emit('achievement', { achievement: ach });
        newAchievement = true;
      }
    }
    return newAchievement;
  }

  // ========== 洞府系统 ==========
  function processCaveProduction() {
    const now = Date.now();
    const msPassed = now - state.lastCaveProduction;
    if (msPassed < 60000) return; // 最小单位1分钟
    const mins = Math.floor(msPassed / 60000);
    if (mins <= 0) return;

    const herbGarden = state.cave.herb_garden || 0;
    const mineShaft = state.cave.mine_shaft || 0;

    if (herbGarden > 0) {
      const herbs = Math.floor(herbGarden * 0.5 * mins);
      if (herbs > 0) state.materials.herb += herbs;
    }
    if (mineShaft > 0) {
      const ores = Math.floor(mineShaft * 0.3 * mins);
      if (ores > 0) state.materials.ore += ores;
    }

    state.lastCaveProduction = now;
  }

  function upgradeCaveBuilding(buildingId) {
    const building = CAVE_BUILDINGS.find(b => b.id === buildingId);
    if (!building) return { success: false, msg: '建筑不存在' };
    const curLevel = state.cave[buildingId] || 0;
    if (curLevel >= building.maxLevel) return { success: false, msg: '已满级' };
    const cost = Math.floor(building.baseCost * Math.pow(building.costMult, curLevel));
    if (state.gold < cost) return { success: false, msg: `灵石不足（需要${formatNumber(cost)}）` };

    state.gold -= cost;
    state.cave[buildingId] = curLevel + 1;
    addLog(`🏠 ${building.icon} ${building.name} 升至${curLevel + 1}级！`);
    saveState();
    return { success: true, msg: `${building.name} 升至${curLevel + 1}级！` };
  }

  function getCaveBuildingCost(buildingId) {
    const building = CAVE_BUILDINGS.find(b => b.id === buildingId);
    if (!building) return Infinity;
    const curLevel = state.cave[buildingId] || 0;
    return Math.floor(building.baseCost * Math.pow(building.costMult, curLevel));
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
      checkAchievements();
      saveState();
      return { success: true, msg: `渡劫成功！晋升${realm.name}！`, chance };
    } else {
      state.tribulationCooldown = Date.now() + 15000;
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
      state.secretRealmCharges = Math.min(state.secretRealmMaxCharges, state.secretRealmCharges + charges);
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
    const stats = getComputedStats();
    const bossHp = MONSTER_TEMPLATES[realm.bossTier]?.[0]?.hp * 3 || 500;
    const win = stats.attack * 15 > bossHp;
    if (!win) {
      addLog(`🏔️ 秘境【${realm.name}】挑战失败！BOSS太强了！`);
      saveState();
      return { success: false, msg: '挑战失败！BOSS太强了' };
    }
    const r = realm.rewards;
    if (r.herb) { const n = randRange(r.herb); state.materials.herb += n; rewards.push(`灵草x${n}`); }
    if (r.ore) { const n = randRange(r.ore); state.materials.ore += n; rewards.push(`矿石x${n}`); }
    if (r.essence) { const n = randRange(r.essence); state.materials.essence += n; rewards.push(`精华x${n}`); }
    if (r.gold) { const g = randRange(r.gold); state.gold += g; rewards.push(`灵石${formatNumber(g)}`); }
    if (Math.random() < (r.equipChance || 0)) {
      const minQ = r.equipQualityMin || 0;
      const equip = generateEquipment(state.level, Math.min(5, minQ + Math.floor(Math.random() * 3)));
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(equip);
        rewards.push(`[${equip.name}]`);
      }
    }
    if (r.beastChance && Math.random() < r.beastChance) tryCaptureBeast();
    // 秘境通关奖励天机令（2-5枚，看秘境等级）
    const realmTokens = realmIndex + 2;
    state.tianjiTokens = (state.tianjiTokens || 0) + realmTokens;
    rewards.push(`天机令x${realmTokens}`);
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
    let mouseHp = stats.maxHp;
    let monsterHp = monster.maxHp;
    let rounds = 0;
    const maxRounds = 30;
    while (mouseHp > 0 && monsterHp > 0 && rounds < maxRounds) {
      rounds++;
      const isCrit = Math.random() * 100 < stats.critRate;
      let dmg = stats.attack * (isCrit ? stats.critDamage / 100 : 1);
      dmg = Math.floor(dmg * (0.9 + Math.random() * 0.2));
      monsterHp -= dmg;
      if (stats.lifesteal > 0) mouseHp = Math.min(stats.maxHp, mouseHp + Math.floor(dmg * stats.lifesteal / 100));
      if (monsterHp <= 0) break;
      if (Math.random() * 100 >= stats.dodge) {
        let mDmg = Math.max(1, monster.atk - stats.defense * 0.3);
        mDmg = Math.floor(mDmg * (0.8 + Math.random() * 0.4));
        mouseHp -= mDmg;
      }
    }
    if (monsterHp <= 0) {
      const goldReward = Math.floor(50 * Math.pow(1.5, floor));
      const expReward = Math.floor(100 * Math.pow(1.4, floor));
      state.gold += goldReward;
      state.exp += expReward;
      state.towerFloor++;
      if (state.towerFloor - 1 > state.towerBestFloor) state.towerBestFloor = state.towerFloor - 1;
      // 每5层奖励天机令
      let towerTokens = 0;
      if (floor % 5 === 0) {
        towerTokens = Math.floor(floor / 5);
        state.tianjiTokens = (state.tianjiTokens || 0) + towerTokens;
      }
      checkLevelUp();
      checkAchievements();
      addLog(`🗼 镇妖塔第${floor}层通关！+${formatNumber(expReward)}经验 +${formatNumber(goldReward)}灵石${towerTokens > 0 ? ` +${towerTokens}天机令` : ''}`);
      emit('towerClear', { floor, goldReward, expReward, towerTokens });
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

  // ========== 转生（飞升）系统 ==========
  const ASCENSION_UPGRADES = [
    { id: 'atkMult', name: '仙力灌体', desc: '攻击+10%/级', icon: '⚔️', cost: 1, maxLevel: 20, perLevel: 10 },
    { id: 'defMult', name: '金刚不灭', desc: '防御+10%/级', icon: '🛡️', cost: 1, maxLevel: 20, perLevel: 10 },
    { id: 'hpMult', name: '万寿无疆', desc: '生命+10%/级', icon: '❤️', cost: 1, maxLevel: 20, perLevel: 10 },
    { id: 'expMult', name: '悟道天赋', desc: '经验+15%/级', icon: '📖', cost: 2, maxLevel: 10, perLevel: 15 },
    { id: 'goldMult', name: '点石成金', desc: '灵石+15%/级', icon: '💰', cost: 2, maxLevel: 10, perLevel: 15 },
    { id: 'startLevel', name: '根骨深厚', desc: '转生起始等级+2/级', icon: '⬆️', cost: 3, maxLevel: 5, perLevel: 2 },
  ];

  function getAscensionPointsEarned() {
    // 仙缘点 = 等级/10 向下取整 + 转生次数奖励
    let points = Math.floor(state.level / 10);
    // 额外：每10层塔额外+1
    points += Math.floor(state.towerBestFloor / 10);
    // 额外：灵兽数量
    points += (state.beasts?.length || 0);
    return Math.max(1, points);
  }

  function canAscend() {
    return state.level >= 50 && !state.needTribulation && !state.isDead;
  }

  function performAscension() {
    if (!canAscend()) return { success: false, msg: '需要达到大乘期（Lv.50+）且非渡劫/死亡状态' };

    const pointsGained = getAscensionPointsEarned();
    const oldLevel = state.level;
    const oldAscCount = state.ascensionCount;

    // 保存需要保留的数据
    const preserved = {
      ascensionCount: state.ascensionCount + 1,
      ascensionPoints: state.ascensionPoints + pointsGained,
      ascensionBonuses: { ...state.ascensionBonuses },
      totalAscensionPointsEarned: state.totalAscensionPointsEarned + pointsGained,
      achievements: { ...state.achievements },
      achievementBonuses: { ...state.achievementBonuses },
      beasts: state.beasts.map(b => ({ ...b })),
      activeBeastId: state.activeBeastId,
      monsterKills: { ...state.monsterKills },
      deathCount: state.deathCount,
      towerBestFloor: state.towerBestFloor,
      totalGold: state.totalGold,
      totalExp: state.totalExp,
      killCount: state.killCount,
      eliteKillCount: state.eliteKillCount,
    };

    // 重置为默认状态
    const fresh = getDefaultState();

    // 应用转生起始等级
    const startLevel = 1 + (state.ascensionBonuses.startLevel || 0);
    fresh.level = startLevel;

    // 按起始等级给予初始属性
    for (let i = 1; i < startLevel; i++) {
      fresh.baseAttack = Math.floor(fresh.baseAttack * 1.12 + 2);
      fresh.baseDefense = Math.floor(fresh.baseDefense * 1.08 + 1);
      fresh.baseMaxHp = Math.floor(fresh.baseMaxHp * 1.1 + 10);
      fresh.statPoints += 3;
    }

    // 保留10%灵石
    fresh.gold = Math.floor(state.gold * 0.1);

    // 恢复保留数据
    state = fresh;
    Object.assign(state, preserved);
    state.hp = getComputedStats().maxHp;
    state.currentMonster = spawnMonster(state.level);
    state.combatStartTime = Date.now();
    state.lastTickTime = Date.now();
    state.lastCaveProduction = Date.now();

    addLog(`🌟🌟🌟 飞升转生！第${state.ascensionCount}次 🌟🌟🌟`);
    addLog(`✨ 获得 ${pointsGained} 仙缘点！`);
    // 飞升奖励天机令
    const ascTokens = 10 + state.ascensionCount * 5;
    state.tianjiTokens = (state.tianjiTokens || 0) + ascTokens;
    addLog(`🎫 飞升奖励 ${ascTokens} 天机令！`);
    addLog(`💫 从Lv.${startLevel}开始新的修仙之旅...`);

    emit('ascension', { pointsGained, ascensionCount: state.ascensionCount });
    saveState();
    return {
      success: true,
      msg: `飞升成功！获得${pointsGained}仙缘点，开始第${state.ascensionCount}世修仙！`,
      pointsGained,
    };
  }

  function buyAscensionUpgrade(upgradeId) {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return { success: false, msg: '升级不存在' };
    const curLevel = state.ascensionBonuses[upgradeId] || 0;
    if (curLevel >= upgrade.maxLevel) return { success: false, msg: '已满级' };
    const cost = upgrade.cost * (1 + Math.floor(curLevel / 3)); // 每3级费用+1
    if (state.ascensionPoints < cost) return { success: false, msg: `仙缘点不足（需要${cost}）` };

    state.ascensionPoints -= cost;
    state.ascensionBonuses[upgradeId] = curLevel + 1;
    addLog(`🌟 ${upgrade.icon} ${upgrade.name} 升至${curLevel + 1}级！`);
    saveState();
    return { success: true, msg: `${upgrade.name} 升至${curLevel + 1}级！` };
  }

  // ========== 怪物图鉴 ==========
  function getMonsterBestiary() {
    const bestiary = [];
    for (let tier = 0; tier < MONSTER_TEMPLATES.length; tier++) {
      for (const tmpl of MONSTER_TEMPLATES[tier]) {
        const kills = state.monsterKills[tmpl.name] || 0;
        bestiary.push({
          name: tmpl.name,
          tier,
          realm: REALMS[tier]?.name || '???',
          hp: tmpl.hp,
          atk: tmpl.atk,
          exp: tmpl.exp,
          gold: tmpl.gold,
          trait: tmpl.trait,
          kills,
          discovered: kills > 0,
        });
      }
    }
    return bestiary;
  }

  // ========== 装备操作 ==========
  function equipItem(inventoryIndex) {
    const item = state.inventory[inventoryIndex];
    if (!item) return false;
    const old = state.equipment[item.slot];
    if (old) state.inventory.push(old);
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

  // 一键装备最强装备
  function autoEquipBest() {
    let equipped = 0;
    // 多轮扫描直到没有更好的装备（因为装备后原装备回到背包可能影响后续判断）
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = state.inventory.length - 1; i >= 0; i--) {
        const item = state.inventory[i];
        if (!item) continue;
        const curEquip = state.equipment[item.slot];
        const newScore = getEquipScore(item);
        const curScore = curEquip ? getEquipScore(curEquip) : 0;
        if (newScore > curScore) {
          // 装备这件
          if (curEquip) state.inventory.push(curEquip);
          state.equipment[item.slot] = item;
          state.inventory.splice(i, 1);
          equipped++;
          changed = true;
          break; // 重新从头扫描，因为数组已变
        }
      }
    }
    state.hp = Math.min(state.hp, getComputedStats().maxHp);
    if (equipped > 0) {
      addLog(`⚡ 一键换装！替换了 ${equipped} 件更强装备`);
      emit('equipChange', {});
      saveState();
    }
    return { success: true, count: equipped, msg: equipped > 0 ? `替换了 ${equipped} 件更强装备！` : '当前已是最强配置' };
  }

  // 一键出售比身上弱的装备
  function sellWeakerItems() {
    let soldCount = 0;
    let totalGold = 0;
    for (let i = state.inventory.length - 1; i >= 0; i--) {
      const item = state.inventory[i];
      if (!item) continue;
      const curEquip = state.equipment[item.slot];
      if (!curEquip) continue; // 该槽位没装备，背包里的不卖
      const newScore = getEquipScore(item);
      const curScore = getEquipScore(curEquip);
      if (newScore <= curScore) {
        const gold = Math.max(1, newScore * 2);
        state.gold += gold;
        totalGold += gold;
        state.inventory.splice(i, 1);
        soldCount++;
      }
    }
    if (soldCount > 0) {
      addLog(`💰 一键出售 ${soldCount} 件弱装备，获得 ${formatNumber(totalGold)} 灵石`);
      saveState();
    }
    return { success: true, count: soldCount, gold: totalGold, msg: soldCount > 0 ? `出售了 ${soldCount} 件，获得 ${formatNumber(totalGold)} 灵石` : '没有可出售的弱装备' };
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

  // 装备对比：返回与当前装备的属性差异
  function compareEquip(inventoryIndex) {
    const newEquip = state.inventory[inventoryIndex];
    if (!newEquip) return null;
    const curEquip = state.equipment[newEquip.slot];
    const newScore = getEquipScore(newEquip);
    const curScore = curEquip ? getEquipScore(curEquip) : 0;
    return {
      newScore, curScore,
      diff: newScore - curScore,
      isUpgrade: newScore > curScore,
      slot: newEquip.slot,
    };
  }

  // ========== 丹药 ==========
  function craftPill(recipeId) {
    const recipe = PILL_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { success: false, msg: '配方不存在' };
    if (getRealmIndex(state.level) < recipe.minRealm) return { success: false, msg: '境界不足' };
    if (state.gold < recipe.gold) return { success: false, msg: '灵石不足' };

    // 洞府炼丹房减少材料消耗
    const forgeRoom = state.cave?.forge_room || 0;
    const matReduce = forgeRoom * 0.1; // 每级减10%

    for (const [mat, need] of Object.entries(recipe.materials)) {
      const actualNeed = Math.max(1, Math.floor(need * (1 - matReduce)));
      if ((state.materials[mat] || 0) < actualNeed) return { success: false, msg: `材料不足（${mat}）` };
    }

    state.gold -= recipe.gold;
    for (const [mat, need] of Object.entries(recipe.materials)) {
      const actualNeed = Math.max(1, Math.floor(need * (1 - matReduce)));
      state.materials[mat] -= actualNeed;
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

  // ========== 功法 ==========
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

  // ========== 灵兽 ==========
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
    const trainingGround = state.cave?.training_ground || 0;
    const bonusMult = 1 + trainingGround * 0.15; // 练功场加成

    switch (stat) {
      case 'attack':
        state.baseAttack += Math.floor((state.baseAttack * 0.05 + 3) * bonusMult);
        break;
      case 'defense':
        state.baseDefense += Math.floor((state.baseDefense * 0.05 + 2) * bonusMult);
        break;
      case 'hp':
        state.baseMaxHp += Math.floor((state.baseMaxHp * 0.05 + 10) * bonusMult);
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

  // ========== 战斗速度 ==========
  function setBattleSpeed(speed) {
    if (![1, 2, 4].includes(speed)) return;
    state.battleSpeed = speed;
    TICK_INTERVAL = 2000 / speed;
    // 重启tick
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = setInterval(processCombatTick, TICK_INTERVAL);
    }
    saveState();
  }

  // ========== 自动吃药 ==========
  function toggleAutoHeal() {
    state.autoHealEnabled = !state.autoHealEnabled;
    saveState();
    return state.autoHealEnabled;
  }

  function setAutoHealThreshold(pct) {
    state.autoHealThreshold = Math.max(10, Math.min(80, pct));
    saveState();
  }

  // ========== DPS计算 ==========
  function getCurrentDPS() {
    if (!state.dpsHistory || state.dpsHistory.length === 0) return 0;
    const now = Date.now();
    const cutoff = now - 10000;
    const recent = state.dpsHistory.filter(d => d.time > cutoff);
    if (recent.length === 0) return 0;
    const totalDmg = recent.reduce((s, d) => s + d.damage, 0);
    const timeSpan = (now - recent[0].time) / 1000;
    return timeSpan > 0 ? Math.floor(totalDmg / timeSpan) : 0;
  }

  // ========== 离线补算 ==========
  function processOfflineGains() {
    if (!state) return null;
    const now = Date.now();
    const offlineMs = now - state.lastTickTime;
    const offlineSeconds = Math.floor(offlineMs / 1000);
    if (offlineSeconds < 30) return null;

    if (state.needTribulation) {
      state.lastTickTime = now;
      saveState();
      return { offlineSeconds, totalKills: 0, totalExp: 0, totalGold: 0, levelUps: 0, note: '渡劫中' };
    }

    const tickCount = Math.floor(offlineSeconds / (2000 / (state.battleSpeed || 1) / 1000));
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
    const offlineHerbs = Math.floor(totalKills * 0.15);
    const offlineOre = Math.floor(totalKills * 0.1);

    // 洞府离线产出
    const offlineMins = Math.floor(offlineSeconds / 60);
    const herbGarden = state.cave?.herb_garden || 0;
    const mineShaft = state.cave?.mine_shaft || 0;
    const caveHerbs = Math.floor(herbGarden * 0.5 * offlineMins);
    const caveOre = Math.floor(mineShaft * 0.3 * offlineMins);

    state.materials.herb += offlineHerbs + caveHerbs;
    state.materials.ore += offlineOre + caveOre;
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

    const offlineEquips = Math.floor(totalKills * 0.02);
    let equipsGained = 0;
    for (let i = 0; i < Math.min(offlineEquips, 5); i++) {
      if (state.inventory.length < state.inventoryMax) {
        state.inventory.push(generateEquipment(state.level));
        equipsGained++;
      }
    }

    // 死亡状态重置
    if (state.isDead) {
      state.isDead = false;
      const cStats = getComputedStats();
      state.hp = cStats.maxHp;
    }

    state.lastTickTime = now;
    state.lastCaveProduction = now;
    state.currentMonster = spawnMonster(state.level);
    state.combatStartTime = now;
    checkAchievements();
    saveState();

    return {
      offlineSeconds, totalKills, totalExp, totalGold, levelUps,
      offlineHerbs: offlineHerbs + caveHerbs,
      offlineOre: offlineOre + caveOre,
      equipsGained,
      caveHerbs, caveOre,
    };
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

  function randRange(arr) { return Math.floor(arr[0] + Math.random() * (arr[1] - arr[0] + 1)); }

  function addLog(msg) {
    if (!state) return;
    state.battleLog.push(msg);
    if (state.battleLog.length > MAX_LOG) state.battleLog = state.battleLog.slice(-MAX_LOG);
  }

  function emit(eventType, data) { if (onBattleEvent) onBattleEvent(eventType, data); }

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
    TICK_INTERVAL = 2000 / (state.battleSpeed || 1);
    if (!state.currentMonster) state.currentMonster = spawnMonster(state.level);
    if (!state.combatStartTime) state.combatStartTime = Date.now();
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
      dps: getCurrentDPS(),
      reviveCountdown: state.isDead ? Math.max(0, Math.ceil((state.reviveTime - Date.now()) / 1000)) : 0,
      canAscend: canAscend(),
      ascensionPointsPreview: state.level >= 50 ? getAscensionPointsEarned() : 0,
      // gacha
      equippedWeaponSkin: state.equippedWeaponSkin,
      equippedArmorSkin: state.equippedArmorSkin,
      ownedSkins: state.ownedSkins || [],
      tianjiTokens: state.tianjiTokens || 0,
      totalGachaPulls: state.totalGachaPulls || 0,
    };
  }

  return {
    start, stop, getState, upgrade, resetState, processOfflineGains, formatNumber,
    equipItem, unequipItem, sellItem, enhanceEquip, getEquipScore, getEquipEnhanceCost, compareEquip,
    autoEquipBest, sellWeakerItems,
    craftPill, usePill, PILL_RECIPES,
    upgradeSkill, SKILL_TREE,
    feedBeast, setActiveBeast, BEAST_TEMPLATES,
    enterSecretRealm, SECRET_REALMS,
    challengeTower, claimTowerReward,
    attemptTribulation,
    setBattleSpeed,
    toggleAutoHeal, setAutoHealThreshold,
    upgradeCaveBuilding, getCaveBuildingCost, CAVE_BUILDINGS,
    ACHIEVEMENTS,
    REALMS, EQUIP_QUALITIES, EQUIP_SLOT_NAMES, MONSTER_TEMPLATES,
    // v0.5
    performAscension, buyAscensionUpgrade, canAscend, getAscensionPointsEarned,
    ASCENSION_UPGRADES, getMonsterBestiary,
    // v0.8 gacha
    doGachaPull, equipSkin, unequipSkin,
    GACHA_POOL, GACHA_QUALITY_NAMES, GACHA_QUALITY_COLORS, GACHA_COST_SINGLE, GACHA_COST_TEN,
    WEAPON_SKINS, ARMOR_SKINS,
  };

})();

if (typeof module !== 'undefined') module.exports = GameEngine;
