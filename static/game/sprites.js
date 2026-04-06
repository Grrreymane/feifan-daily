// ============================================================
// sprites.js — 鼠鼠修仙 像素精灵绘制系统 v3.1
// 方块像素风格 — 高分辨率像素画，更多像素组成
// v3.1: 鼠鼠精细化 + 中华龙形象重制
// ============================================================
//
// 【美术风格调整指南】
// 1. 颜色调整 → 修改下方 C 对象的颜色常量
// 2. 角色体型/比例 → 修改 drawMouseBody() 中的像素坐标
// 3. 各境界外观 → 修改 drawMouseRealm0~5 各函数
// 4. 怪物外观 → 修改 monsterDrawers / monsterDrawersExtra 对象
// 5. 灵兽外观 → 修改 drawActiveBeast 函数
// 6. 坐骑外观 → 修改 drawMountCrane / drawMountQilin 函数
// 7. 光环/特效 → 修改 drawMouseByRealm 函数中的 ellipse 光晕部分
// 8. 武器皮肤 → 修改 weaponSkinDrawers 对象
// 9. 衣服皮肤 → 修改 armorSkinColors 颜色表
//
// 核心绘制API:
//   px(ctx, x, y, s, color)     — 画单个像素方块
//   rect(ctx, x, y, w, h, color) — 画矩形方块
//   circle/ellipse              — 仅用于光效/特效（保持柔和）
//   drawMatrix(ctx, matrix, x, y, s) — 从二维颜色矩阵批量绘制
// ============================================================

const Sprites = (() => {

  // ===== 基础绘制辅助 =====
  function px(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), s, s);
  }

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // 保留circle/ellipse/roundRect用于特效和光效（非角色主体）
  function circle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(Math.floor(cx), Math.floor(cy), r, 0, Math.PI * 2);
    ctx.fill();
  }

  function ellipse(ctx, cx, cy, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(Math.floor(cx), Math.floor(cy), rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  // 从像素矩阵绘制精灵
  function drawMatrix(ctx, matrix, x, y, s) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        const c = matrix[row][col];
        if (c && c !== '' && c !== '.') {
          ctx.fillStyle = c;
          ctx.fillRect(
            Math.floor(x + col * s),
            Math.floor(y + row * s),
            s, s
          );
        }
      }
    }
  }

  // ===== 颜色常量 =====
  const C = {
    FUR_GREY: '#9BB0D4',
    FUR_LIGHT: '#B8CCE8',
    FUR_BELLY: '#C8D8F0',
    FUR_DARK: '#7A92B8',
    EAR_PINK: '#C88AAE',
    EAR_INNER: '#E0A0C4',
    NOSE: '#FF99AA',
    EYE: '#111122',
    EYE_SHINE: '#EEEEFF',
    WHISKER: '#A0B8D0',
    TAIL: '#8090B0',
    CHEEK: '#FFBBCC',
    CLOTH_BROWN: '#5A6B8A',
    CLOTH_GOLD: '#4488CC',
    CLOTH_GREEN: '#2E8B8B',
    CLOTH_BLUE: '#4169B4',
    CLOTH_PURPLE: '#7B3EBF',
    CLOTH_RED: '#A02060',
    WOOD: '#6B7B96',
    IRON: '#8899BB',
    STEEL: '#AAB8D0',
    MAGIC_BLUE: '#44CCFF',
    MAGIC_PURPLE: '#AA88FF',
    MAGIC_PINK: '#FF66DD',
    MAGIC_GOLD: '#CCAA44',
    HANDLE: '#4A5570',
    SHADOW: 'rgba(20,10,40,0.25)',
  };

  const _ = '';

  // ================================================================
  // 鼠鼠绘制 — 方块像素风 v3.0
  // 每个角色用更多像素块组成，全部使用 rect/px 绘制
  // ================================================================

  // 通用鼠鼠身体绘制（方块像素版，所有境界共用）— v4.0 参考像素鼠风格
  // 特征：大圆耳、紧凑圆脸、小眼+单高光、小鼻小嘴、细胡须
  function drawMouseBody(ctx, s, furMain, furLight, furBelly, earOuter, earInner) {
    // === 耳朵（大圆耳，像素鼠标志性特征） ===
    // 左耳（圆形轮廓，3层）
    rect(ctx, -8*s, -17*s, 4*s, s, earOuter);   // 顶
    rect(ctx, -9*s, -16*s, 6*s, 2*s, earOuter);  // 上部宽
    rect(ctx, -9*s, -14*s, 5*s, 2*s, earOuter);  // 下部
    rect(ctx, -8*s, -12*s, 3*s, s, earOuter);     // 底部连接头
    // 左耳内粉
    rect(ctx, -7*s, -16*s, 3*s, s, earInner);
    rect(ctx, -8*s, -15*s, 4*s, 2*s, earInner);
    rect(ctx, -7*s, -13*s, 2*s, s, earInner);
    px(ctx, -6*s, -15*s, s, '#F0C0D8'); // 内高光
    // 右耳
    rect(ctx, 5*s, -17*s, 4*s, s, earOuter);
    rect(ctx, 4*s, -16*s, 6*s, 2*s, earOuter);
    rect(ctx, 5*s, -14*s, 5*s, 2*s, earOuter);
    rect(ctx, 6*s, -12*s, 3*s, s, earOuter);
    // 右耳内粉
    rect(ctx, 5*s, -16*s, 3*s, s, earInner);
    rect(ctx, 5*s, -15*s, 4*s, 2*s, earInner);
    rect(ctx, 6*s, -13*s, 2*s, s, earInner);
    px(ctx, 6*s, -15*s, s, '#F0C0D8');

    // === 头部（圆润紧凑，像素鼠风格） ===
    rect(ctx, -4*s, -13*s, 9*s, s, furMain);     // 头顶窄
    rect(ctx, -5*s, -12*s, 11*s, 3*s, furMain);   // 头上部
    rect(ctx, -5*s, -9*s, 11*s, 3*s, furLight);   // 头下部亮色
    rect(ctx, -4*s, -6*s, 9*s, 2*s, furMain);     // 下巴
    // 额头高光
    px(ctx, -s, -12*s, s, furLight);
    px(ctx, 0, -13*s, s, furLight);
    px(ctx, s, -12*s, s, furLight);

    // === 腮红 ===
    rect(ctx, -5*s, -8*s, 2*s, 2*s, C.CHEEK);
    rect(ctx, 4*s, -8*s, 2*s, 2*s, C.CHEEK);

    // === 眼睛（2x2像素，深色+单高光，像素鼠风格） ===
    rect(ctx, -3*s, -10*s, 2*s, 2*s, '#0A0A22');
    px(ctx, -3*s, -10*s, s, '#FFFFFF');
    rect(ctx, 2*s, -10*s, 2*s, 2*s, '#0A0A22');
    px(ctx, 2*s, -10*s, s, '#FFFFFF');

    // === 鼻子（小圆点） ===
    px(ctx, 0, -7*s, s, C.NOSE);

    // === 嘴巴（简洁微笑） ===
    px(ctx, -s, -6*s, s, '#8899AA');
    px(ctx, s, -6*s, s, '#8899AA');

    // === 胡须（细长，左右各3根） ===
    rect(ctx, -8*s, -10*s, 3*s, s, C.WHISKER);
    rect(ctx, -9*s, -8*s, 4*s, s, C.WHISKER);
    rect(ctx, -8*s, -6*s, 3*s, s, C.WHISKER);
    rect(ctx, 6*s, -10*s, 3*s, s, C.WHISKER);
    rect(ctx, 6*s, -8*s, 4*s, s, C.WHISKER);
    rect(ctx, 6*s, -6*s, 3*s, s, C.WHISKER);
  }

  // 绘制鼠鼠腿脚（方块版）— v4.0
  function drawMouseLegs(ctx, s, furMain) {
    // 左腿（短粗Q版）
    rect(ctx, -3*s, 3*s, 2*s, 3*s, furMain);
    rect(ctx, -3*s, 6*s, 3*s, s, C.FUR_DARK);
    // 右腿
    rect(ctx, 2*s, 3*s, 2*s, 3*s, furMain);
    rect(ctx, 1*s, 6*s, 3*s, s, C.FUR_DARK);
  }

  // 绘制尾巴（方块版）— v4.0 简洁卷尾
  function drawMouseTail(ctx, s, frame, color) {
    const c = color || C.TAIL;
    const wave = Math.sin(frame * 0.06) * 2;
    rect(ctx, -4*s, 2*s, 2*s, s, c);
    rect(ctx, -6*s, s + wave*s, 2*s, s, c);
    rect(ctx, -8*s, 0 + wave*s, 2*s, s, c);
    rect(ctx, -9*s, -s + wave*s, s, s, c);
    rect(ctx, -9*s, -2*s + wave*0.5*s, s, s, c);
    rect(ctx, -8*s, -3*s + wave*0.3*s, s, s, c);
  }

  // ================================================================
  // 六种境界鼠鼠（方块像素风）
  // ================================================================

  // --- 炼气期：小灰鼠，粗布衣 ---
  function drawMouseRealm0(ctx, x, y, s, frame, attacking, opts) {
    const bounce = Math.sin(frame * 0.08) * 1.5 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 6 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + bounce);

    const cl = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.main || C.CLOTH_BROWN) : C.CLOTH_BROWN;
    const clAccent = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.accent || '#6E7D99') : '#6E7D99';
    const clTrim = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.trim || '#3D4D66') : '#3D4D66';

    drawMouseTail(ctx, s, frame);

    // 布衣身体（v4.0适配：紧凑躯干）
    rect(ctx, -4*s, -4*s, 9*s, 7*s, cl);
    rect(ctx, -3*s, -3*s, 7*s, 5*s, clAccent);
    rect(ctx, -2*s, -2*s, 5*s, 3*s, C.FUR_BELLY);
    // 腰带
    rect(ctx, -4*s, 0, 9*s, s, clTrim);
    // 衣领（V型像素线）
    px(ctx, -s, -5*s, s, clTrim);
    px(ctx, 0, -4*s, s, clTrim);
    px(ctx, s, -5*s, s, clTrim);

    drawMouseBody(ctx, s, C.FUR_GREY, C.FUR_LIGHT, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, C.FUR_GREY);

    if (opts.equippedWeaponSkin && weaponSkinDrawers[opts.equippedWeaponSkin]) {
      ctx.save(); ctx.translate(5*s, -4*s);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[opts.equippedWeaponSkin](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, 5*s, -4*s, s, 0, frame, attacking);
    }

    ctx.restore();
  }

  // --- 筑基期：亮毛色，道袍 ---
  function drawMouseRealm1(ctx, x, y, s, frame, attacking, opts) {
    const bounce = Math.sin(frame * 0.08) * 1.5 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 8 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + bounce);

    const f = '#A0B0CC', l = '#B8C8E0';
    const cl = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.main || C.CLOTH_GOLD) : C.CLOTH_GOLD;
    const clAccent = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.accent || '#2A5A8A') : '#2A5A8A';
    const clTrim = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.trim || '#66CCFF') : '#66CCFF';

    drawMouseTail(ctx, s, frame, '#7A8CB0');

    // 道袍身体（v4.0适配）
    rect(ctx, -5*s, -4*s, 11*s, 8*s, cl);
    rect(ctx, -4*s, -3*s, 9*s, 6*s, clAccent);
    rect(ctx, -2*s, -2*s, 5*s, 4*s, C.FUR_BELLY);
    // 腰带
    rect(ctx, -5*s, 0, 11*s, s, clTrim);
    // V领
    px(ctx, -s, -5*s, s, clTrim);
    px(ctx, 0, -4*s, s, clTrim);
    px(ctx, 0, -3*s, s, clTrim);
    px(ctx, s, -5*s, s, clTrim);
    // 飘带
    const ribbonWave = Math.sin(frame * 0.06) > 0 ? s : 0;
    rect(ctx, -5*s, 5*s, s, 2*s + ribbonWave, clTrim);
    rect(ctx, -6*s, 6*s + ribbonWave, s, s, clTrim);

    drawMouseBody(ctx, s, f, l, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, f);

    if (opts.equippedWeaponSkin && weaponSkinDrawers[opts.equippedWeaponSkin]) {
      ctx.save(); ctx.translate(6*s, -4*s);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[opts.equippedWeaponSkin](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, 6*s, -4*s, s, 1, frame, attacking);
    }

    ctx.restore();
  }

  // --- 金丹期：法袍+浮空 ---
  function drawMouseRealm2(ctx, x, y, s, frame, attacking, opts) {
    const float = Math.sin(frame * 0.04) * 2 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 10 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + float);

    const f = '#A8BBDD', l = '#C0D4F0';
    const cl = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.main || C.CLOTH_GREEN) : C.CLOTH_GREEN;
    const clAccent = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.accent || '#1A6B6B') : '#1A6B6B';
    const clTrim = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.trim || '#44DDBB') : '#44DDBB';

    drawMouseTail(ctx, s, frame, '#6688AA');

    // 法袍（v4.0适配：紧凑躯干+浮空）
    rect(ctx, -5*s, -4*s, 11*s, 9*s, cl);
    rect(ctx, -4*s, -3*s, 9*s, 7*s, clAccent);
    rect(ctx, -2*s, -2*s, 5*s, 4*s, C.FUR_BELLY);
    // 金丹纹饰（闪烁像素块）
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.04) * 0.15;
    rect(ctx, -s, -s, 3*s, 2*s, '#44FFCC');
    ctx.globalAlpha = 1;
    // 腰带
    rect(ctx, -5*s, 0, 11*s, s, clTrim);
    // 玉佩
    px(ctx, -4*s, 2*s, s, '#44DDBB');
    px(ctx, -4*s, 3*s, s, '#88FFE0');
    // V领
    px(ctx, -2*s, -5*s, s, clTrim);
    px(ctx, -s, -4*s, s, clTrim);
    px(ctx, 0, -4*s, s, clTrim);
    px(ctx, s, -4*s, s, clTrim);
    px(ctx, 2*s, -5*s, s, clTrim);

    // 浮空气流（方块版）
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 3; i++) {
      const py = 8*s + Math.sin(frame * 0.05 + i) * s;
      rect(ctx, -3*s + i * 3*s, py, 2*s, s, '#88CCCC');
    }
    ctx.globalAlpha = 1;

    drawMouseBody(ctx, s, f, l, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, f);

    if (opts.equippedWeaponSkin && weaponSkinDrawers[opts.equippedWeaponSkin]) {
      ctx.save(); ctx.translate(6*s, -4*s);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[opts.equippedWeaponSkin](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, 6*s, -4*s, s, 2, frame, attacking);
    }

    ctx.restore();
  }

  // --- 元婴期：华服，浮空更高 ---
  function drawMouseRealm3(ctx, x, y, s, frame, attacking, opts) {
    const float = Math.sin(frame * 0.04) * 3 * s - 3*s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 12 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + float);

    const f = '#B0C0E0', l = '#C8D8F5';
    const cl = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.main || C.CLOTH_BLUE) : C.CLOTH_BLUE;
    const clAccent = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.accent || '#2A4A8A') : '#2A4A8A';
    const clTrim = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.trim || '#66AAFF') : '#66AAFF';

    drawMouseTail(ctx, s, frame, '#5577AA');

    // 华服（v4.0适配：紧凑+高级）
    rect(ctx, -6*s, -4*s, 13*s, 10*s, cl);
    rect(ctx, -5*s, -3*s, 11*s, 8*s, clAccent);
    rect(ctx, -2*s, -2*s, 5*s, 5*s, C.FUR_BELLY);
    // 灵纹（旋转方块像素）
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 3; i++) {
      const a = frame * 0.02 + i * 2.1;
      const rx = Math.cos(a) * 3 * s;
      const ry = Math.sin(a) * 3 * s;
      px(ctx, rx, ry, s, '#88BBFF');
    }
    ctx.globalAlpha = 1;
    // 腰带+宝石
    rect(ctx, -6*s, 0, 13*s, s, clTrim);
    rect(ctx, 0, 0, s, s, '#4488FF');
    // 肩饰（方块）
    rect(ctx, -6*s, -4*s, 2*s, 2*s, clTrim);
    rect(ctx, 5*s, -4*s, 2*s, 2*s, clTrim);
    // V领
    px(ctx, -2*s, -5*s, s, clTrim);
    px(ctx, -s, -4*s, s, clTrim);
    px(ctx, 0, -4*s, s, clTrim);
    px(ctx, s, -4*s, s, clTrim);
    px(ctx, 2*s, -5*s, s, clTrim);
    // 飘带
    const rw = Math.sin(frame * 0.05) > 0 ? s : 0;
    rect(ctx, -6*s, 6*s, s, 2*s + rw, clTrim);
    rect(ctx, -7*s, 7*s + rw, s, s, clTrim);
    rect(ctx, 6*s, 6*s, s, 2*s + rw, clTrim);
    rect(ctx, 7*s, 7*s + rw, s, s, clTrim);

    drawMouseBody(ctx, s, f, l, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, f);

    if (opts.equippedWeaponSkin && weaponSkinDrawers[opts.equippedWeaponSkin]) {
      ctx.save(); ctx.translate(7*s, -4*s);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[opts.equippedWeaponSkin](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, 7*s, -4*s, s, 3, frame, attacking);
    }

    ctx.restore();
  }

  // --- 化神期：仙袍飘逸，光效强 ---
  function drawMouseRealm4(ctx, x, y, s, frame, attacking, opts) {
    const float = Math.sin(frame * 0.03) * 4 * s - 6*s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 14 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + float);

    const f = '#B8C8E8', l = '#D0E0FF';
    const cl = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.main || C.CLOTH_PURPLE) : C.CLOTH_PURPLE;
    const clAccent = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.accent || '#5A2A9F') : '#5A2A9F';
    const clTrim = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.trim || '#BB88FF') : '#BB88FF';

    drawMouseTail(ctx, s, frame, '#7788CC');

    // 仙袍（v4.0适配：紧凑+飘逸下摆）
    rect(ctx, -6*s, -4*s, 13*s, 10*s, cl);
    rect(ctx, -7*s, 4*s, 15*s, 3*s, cl); // 下摆
    rect(ctx, -5*s, -3*s, 11*s, 8*s, clAccent);
    rect(ctx, -2*s, -2*s, 5*s, 5*s, C.FUR_BELLY);
    // 符文光（闪烁像素块）
    ctx.globalAlpha = 0.2 + Math.sin(frame * 0.03) * 0.1;
    for (let i = 0; i < 4; i++) {
      const a = frame * 0.015 + i * 1.57;
      const r = (3 + i) * s;
      px(ctx, Math.cos(a) * r, Math.sin(a) * r, s, '#BB88FF');
    }
    ctx.globalAlpha = 1;
    // 腰带
    rect(ctx, -6*s, 0, 13*s, s, clTrim);
    // 紫玉坠
    rect(ctx, 0, 0, s, s, '#9944FF');
    px(ctx, 0, s, s, '#CC88FF');
    // 肩甲（方块+宝石）
    rect(ctx, -6*s, -4*s, 2*s, 2*s, clTrim);
    px(ctx, -5*s, -4*s, s, '#FF88FF');
    rect(ctx, 5*s, -4*s, 2*s, 2*s, clTrim);
    px(ctx, 6*s, -4*s, s, '#FF88FF');
    // V领
    px(ctx, -2*s, -5*s, s, clTrim);
    px(ctx, -s, -4*s, s, clTrim);
    px(ctx, 0, -4*s, s, clTrim);
    px(ctx, s, -4*s, s, clTrim);
    px(ctx, 2*s, -5*s, s, clTrim);
    // 长飘带（方块像素线）
    const rw = Math.sin(frame * 0.04) > 0 ? s : 0;
    rect(ctx, -7*s, 7*s, s, 3*s + rw, clTrim);
    rect(ctx, -8*s, 9*s + rw, s, 2*s, clTrim);
    rect(ctx, -9*s, 10*s + rw, s, s, clTrim);
    rect(ctx, 7*s, 7*s, s, 3*s + rw, clTrim);
    rect(ctx, 8*s, 9*s + rw, s, 2*s, clTrim);
    rect(ctx, 9*s, 10*s + rw, s, s, clTrim);

    drawMouseBody(ctx, s, f, l, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, f);

    if (opts.equippedWeaponSkin && weaponSkinDrawers[opts.equippedWeaponSkin]) {
      ctx.save(); ctx.translate(7*s, -4*s);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[opts.equippedWeaponSkin](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, 7*s, -4*s, s, 4, frame, attacking);
    }

    ctx.restore();
  }

  // --- 大乘期：天衣，极强光效 ---
  function drawMouseRealm5(ctx, x, y, s, frame, attacking, opts) {
    const float = Math.sin(frame * 0.03) * 5 * s - 9*s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 16 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + float);

    const f = '#C0D0F0', l = '#D8E8FF';
    const cl = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.main || C.CLOTH_RED) : C.CLOTH_RED;
    const clAccent = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.accent || '#801848') : '#801848';
    const clTrim = opts.equippedArmorSkin ? (armorSkinColors[opts.equippedArmorSkin]?.trim || '#FF88CC') : '#FF88CC';

    drawMouseTail(ctx, s, frame, '#8899DD');

    // 天衣光华（方块光晕）
    ctx.globalAlpha = 0.08 + Math.sin(frame * 0.02) * 0.04;
    rect(ctx, -16*s, -16*s, 33*s, 33*s, '#FF66BB');
    ctx.globalAlpha = 1;

    // 天衣身体（v4.0适配：紧凑+最华丽）
    rect(ctx, -7*s, -4*s, 15*s, 11*s, cl);
    rect(ctx, -8*s, 5*s, 17*s, 4*s, cl); // 大下摆
    rect(ctx, -6*s, -3*s, 13*s, 9*s, clAccent);
    rect(ctx, -3*s, -2*s, 7*s, 6*s, C.FUR_BELLY);

    // 天衣纹饰（旋转像素符文）
    ctx.globalAlpha = 0.25 + Math.sin(frame * 0.025) * 0.1;
    for (let i = 0; i < 6; i++) {
      const a = frame * 0.012 + i * 1.05;
      const r = (3 + i % 3 * 2) * s;
      px(ctx, Math.cos(a) * r, Math.sin(a) * r, s, '#FF88CC');
    }
    ctx.globalAlpha = 1;

    // 天冠（方块版头饰）
    rect(ctx, -s, -16*s, 3*s, 2*s, '#FFD700');
    px(ctx, 0, -17*s, s, '#FFFFAA');
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.06) * 0.3;
    rect(ctx, -2*s, -17*s, 5*s, 3*s, '#FFD70066');
    ctx.globalAlpha = 1;

    // 腰带
    rect(ctx, -7*s, 0, 15*s, s, clTrim);
    // 神玉
    rect(ctx, 0, 0, s, s, '#FF3388');
    px(ctx, 0, s, s, '#FF88BB');
    // 大型肩甲
    rect(ctx, -7*s, -4*s, 2*s, 2*s, clTrim);
    px(ctx, -6*s, -4*s, s, '#FF44AA');
    rect(ctx, 6*s, -4*s, 2*s, 2*s, clTrim);
    px(ctx, 7*s, -4*s, s, '#FF44AA');
    // V领
    px(ctx, -2*s, -5*s, s, clTrim);
    px(ctx, -s, -4*s, s, clTrim);
    px(ctx, 0, -4*s, s, clTrim);
    px(ctx, s, -4*s, s, clTrim);
    px(ctx, 2*s, -5*s, s, clTrim);

    // 多条长飘带
    const rw = Math.sin(frame * 0.035) > 0 ? s : 0;
    for (let i = 0; i < 2; i++) {
      const c = i === 0 ? clTrim : '#FF88CC88';
      rect(ctx, -8*s - i*s, 9*s, s, 4*s + rw, c);
      rect(ctx, -9*s - i*s, 12*s + rw, s, 2*s, c);
      rect(ctx, -10*s - i*s, 13*s + rw, s, 2*s, c);
      rect(ctx, 8*s + i*s, 9*s, s, 4*s + rw, c);
      rect(ctx, 9*s + i*s, 12*s + rw, s, 2*s, c);
      rect(ctx, 10*s + i*s, 13*s + rw, s, 2*s, c);
    }

    drawMouseBody(ctx, s, f, l, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, f);

    // 仙气粒子（方块版）
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const a = frame * 0.02 + i * 1.257;
      const pr = 12 * s;
      px(ctx, Math.cos(a) * pr, -2*s + Math.sin(a) * pr * 0.6, s, '#FFAADD');
    }
    ctx.globalAlpha = 1;

    if (opts.equippedWeaponSkin && weaponSkinDrawers[opts.equippedWeaponSkin]) {
      ctx.save(); ctx.translate(8*s, -4*s);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[opts.equippedWeaponSkin](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, 8*s, -4*s, s, 5, frame, attacking);
    }

    ctx.restore();
  }

  // ================================================================
  // 武器绘制 — 方块像素版
  // ================================================================
  function drawWeapon(ctx, x, y, s, tier, frame, attacking) {
    ctx.save();
    ctx.translate(x, y);
    const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
    ctx.rotate(angle);

    const weapons = [
      { blade: C.WOOD, hilt: C.HANDLE, len: 7, w: 2 },
      { blade: C.IRON, hilt: C.HANDLE, len: 8, w: 2 },
      { blade: C.STEEL, hilt: '#5A6B8A', len: 9, w: 2, glow: C.MAGIC_BLUE },
      { blade: '#88AAEE', hilt: '#4A5570', len: 10, w: 2, glow: C.MAGIC_PURPLE },
      { blade: '#BB88FF', hilt: '#3A2A5A', len: 11, w: 2, glow: C.MAGIC_PINK },
      { blade: '#FFD700', hilt: '#880044', len: 12, w: 3, glow: '#FFD700' },
    ];
    const w = weapons[tier] || weapons[0];

    // 剑柄（方块）
    rect(ctx, -s, 0, w.w*s, 3*s, w.hilt);
    // 护手
    rect(ctx, -w.w*s, -s, w.w*2*s, s, w.hilt);
    // 剑身（方块）
    rect(ctx, -s, -w.len*s, w.w*s, w.len*s, w.blade);
    // 剑尖
    rect(ctx, 0, -(w.len+1)*s, s, s, w.blade);

    // 灵光
    if (w.glow) {
      ctx.globalAlpha = 0.25 + Math.sin(frame * 0.06) * 0.15;
      rect(ctx, -s, -w.len*s, w.w*s, w.len*s, w.glow);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ================================================================
  // 灵兽 — 方块像素风
  // ================================================================

  // 小蛇（装饰性）
  function drawPetSnake(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const wave = Math.sin(frame * 0.06);
    // 蛇身（锯齿形方块）
    rect(ctx, 0, 0, 2*s, s, '#44AA44');
    rect(ctx, -2*s, -s + wave*s, 2*s, s, '#55BB55');
    rect(ctx, -4*s, 0, 2*s, s, '#44AA44');
    rect(ctx, -6*s, -s + wave*s, 2*s, s, '#55BB55');
    // 头
    rect(ctx, 2*s, -s, 2*s, 2*s, '#66CC66');
    px(ctx, 3*s, -s, s, '#FF0000'); // 眼
    // 尾
    px(ctx, -7*s, 0, s, '#338833');
    ctx.restore();
  }

  // 蛟龙（装饰性）— 中华龙风格：蛇形长身、鹿角、龙须、云纹
  function drawPetDragon(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1); // 抵消外层灵兽翻转，使龙头朝右（面向怪物）
    const bob = Math.sin(frame * 0.04) * s;
    ctx.translate(0, bob);
    // 蛇形身体（S形蜿蜒，多节渐变）
    const bodyColor = '#3388BB', scaleColor = '#44AADD', bellyColor = '#88DDFF';
    // 身段1
    rect(ctx, -5*s, 0, 3*s, 2*s, bodyColor);
    px(ctx, -4*s, s, s, bellyColor);
    // 身段2（微上弯）
    rect(ctx, -2*s, -s, 3*s, 2*s, bodyColor);
    px(ctx, -s, 0, s, bellyColor);
    // 身段3
    rect(ctx, s, -2*s, 3*s, 2*s, bodyColor);
    px(ctx, 2*s, -s, s, bellyColor);
    // 身段4
    rect(ctx, 4*s, -3*s, 2*s, 2*s, bodyColor);
    px(ctx, 4*s, -2*s, s, bellyColor);
    // 鳞片纹理
    ctx.globalAlpha = 0.3;
    px(ctx, -4*s, -s, s, scaleColor); px(ctx, -s, -2*s, s, scaleColor);
    px(ctx, 2*s, -3*s, s, scaleColor); px(ctx, 5*s, -4*s, s, scaleColor);
    ctx.globalAlpha = 1;
    // 龙头（方正，带下颚）
    rect(ctx, 6*s, -5*s, 3*s, 3*s, bodyColor);
    rect(ctx, 6*s, -4*s, 3*s, s, bellyColor); // 下颚
    px(ctx, 8*s, -5*s, s, '#FFEE44'); // 眼
    // 鹿角（中华龙标志）
    px(ctx, 7*s, -6*s, s, '#DAA520'); px(ctx, 7*s, -7*s, s, '#DAA520');
    px(ctx, 6*s, -8*s, s, '#DAA520');
    px(ctx, 8*s, -6*s, s, '#B8860B'); px(ctx, 9*s, -7*s, s, '#B8860B');
    // 龙须（两根长须飘动）
    const whiskerWave = Math.sin(frame * 0.06) * s;
    px(ctx, 9*s, -4*s, s, '#88CCFF');
    px(ctx, 10*s, -3*s + whiskerWave, s, '#88CCFF');
    px(ctx, 9*s, -3*s, s, '#88CCFF');
    px(ctx, 10*s, -2*s - whiskerWave, s, '#88CCFF');
    // 尾巴（渐细）
    rect(ctx, -7*s, s, 2*s, s, bodyColor);
    px(ctx, -8*s, 2*s, s, '#2277AA');
    px(ctx, -9*s, 2*s, s, '#2277AA');
    // 云纹祥瑞（微弱光效）
    ctx.globalAlpha = 0.12;
    ellipse(ctx, 0, 0, 8*s, 4*s, '#88DDFF');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 金龙（装饰性）— 中华神龙风格：金鳞蛇身、双鹿角、五爪、龙珠
  function drawPetDragonGold(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1); // 抵消外层灵兽翻转，使龙头朝右（面向怪物）
    const bob = Math.sin(frame * 0.03) * 1.5 * s;
    ctx.translate(0, bob);
    const bodyGold = '#DAA520', scaleGold = '#FFD700', bellyGold = '#FFFFAA';
    // 蛇形身体（更长更壮的S形）
    rect(ctx, -7*s, s, 3*s, 3*s, bodyGold);
    px(ctx, -6*s, 2*s, s, bellyGold);
    rect(ctx, -4*s, 0, 3*s, 3*s, bodyGold);
    px(ctx, -3*s, s, s, bellyGold);
    rect(ctx, -s, -s, 3*s, 3*s, bodyGold);
    px(ctx, 0, 0, s, bellyGold);
    rect(ctx, 2*s, -2*s, 3*s, 3*s, bodyGold);
    px(ctx, 3*s, -s, s, bellyGold);
    rect(ctx, 5*s, -3*s, 2*s, 3*s, bodyGold);
    // 金鳞纹理
    ctx.globalAlpha = 0.4;
    px(ctx, -6*s, 0, s, scaleGold); px(ctx, -3*s, -s, s, scaleGold);
    px(ctx, 0, -2*s, s, scaleGold); px(ctx, 3*s, -3*s, s, scaleGold);
    ctx.globalAlpha = 1;
    // 五爪（中华龙特征，两对小爪）
    px(ctx, -5*s, 3*s, s, bodyGold); px(ctx, -4*s, 4*s, s, '#CC8800');
    px(ctx, 1*s, 2*s, s, bodyGold); px(ctx, 2*s, 3*s, s, '#CC8800');
    // 龙头（威严方正）
    rect(ctx, 7*s, -5*s, 4*s, 4*s, scaleGold);
    rect(ctx, 7*s, -3*s, 4*s, 2*s, bellyGold); // 下颚
    rect(ctx, 7*s, -6*s, 4*s, s, bodyGold); // 额头
    px(ctx, 9*s, -5*s, s, '#FF2200'); // 龙眼（红色）
    px(ctx, 10*s, -4*s, s, '#FFFFFF'); // 眼高光
    // 龙口
    px(ctx, 11*s, -3*s, s, '#CC3300');
    // 鹿角（金色双叉角）
    rect(ctx, 8*s, -7*s, s, s, '#FFD700'); rect(ctx, 7*s, -8*s, s, s, '#FFD700');
    rect(ctx, 6*s, -9*s, s, s, '#FFD700'); px(ctx, 8*s, -8*s, s, '#FFFFAA');
    rect(ctx, 10*s, -7*s, s, s, '#FFD700'); rect(ctx, 11*s, -8*s, s, s, '#FFD700');
    px(ctx, 10*s, -8*s, s, '#FFFFAA');
    // 龙须（金色飘动长须）
    const wh = Math.sin(frame * 0.05) * s;
    rect(ctx, 11*s, -4*s, s, s, '#FFD700');
    px(ctx, 12*s, -3*s + wh, s, '#FFE066');
    px(ctx, 13*s, -3*s + wh, s, '#FFE066');
    rect(ctx, 11*s, -2*s, s, s, '#FFD700');
    px(ctx, 12*s, -s - wh, s, '#FFE066');
    // 龙珠（闪烁火球）
    ctx.globalAlpha = 0.5 + Math.sin(frame * 0.08) * 0.3;
    circle(ctx, 13*s, -5*s, 1.5*s, '#FF6600');
    px(ctx, 13*s, -5*s, s, '#FFFF88');
    ctx.globalAlpha = 1;
    // 尾巴（渐细+尾鳍）
    rect(ctx, -9*s, 2*s, 2*s, s, bodyGold);
    px(ctx, -10*s, 3*s, s, '#CC8800');
    px(ctx, -11*s, 2*s, s, '#CC8800');
    px(ctx, -11*s, 4*s, s, '#CC8800');
    // 神龙光环
    ctx.globalAlpha = 0.1;
    ellipse(ctx, 0, 0, 12*s, 6*s, '#FFD700');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ================================================================
  // 出战灵兽 — 方块像素风
  // ================================================================

  // 赤炎灵猫
  function drawPetFireCat(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.08) * s;
    ctx.translate(0, bob);
    // 身体
    rect(ctx, -4*s, -2*s, 9*s, 5*s, '#FF6633');
    rect(ctx, -3*s, -s, 7*s, 3*s, '#FF8855');
    // 花纹
    ctx.globalAlpha = 0.3;
    rect(ctx, -2*s, -2*s, 2*s, s, '#CC3300');
    rect(ctx, s, -2*s, 2*s, s, '#CC3300');
    ctx.globalAlpha = 1;
    // 头
    rect(ctx, -7*s, -5*s, 6*s, 5*s, '#FF8844');
    rect(ctx, -6*s, -4*s, 4*s, 3*s, '#FFAA66');
    // 三角耳
    rect(ctx, -7*s, -7*s, 2*s, 2*s, '#FF6633');
    px(ctx, -7*s, -7*s, s, '#FF9966');
    rect(ctx, -3*s, -7*s, 2*s, 2*s, '#FF6633');
    px(ctx, -3*s, -7*s, s, '#FF9966');
    // 猫眼
    rect(ctx, -6*s, -4*s, s, 2*s, '#FFFF00');
    px(ctx, -6*s, -4*s, s, '#111100');
    rect(ctx, -3*s, -4*s, s, 2*s, '#FFFF00');
    px(ctx, -3*s, -4*s, s, '#111100');
    // 鼻
    px(ctx, -5*s, -2*s, s, '#FF3300');
    // 尾巴（火焰尾）
    rect(ctx, 5*s, -3*s, s, 3*s, '#FF4400');
    rect(ctx, 6*s, -5*s, s, 2*s, '#FF4400');
    rect(ctx, 7*s, -6*s, s, s, '#FF8800');
    px(ctx, 7*s, -7*s, s, '#FFCC00');
    // 脚
    rect(ctx, -4*s, 3*s, 2*s, s, '#CC5522');
    rect(ctx, 0, 3*s, 2*s, s, '#CC5522');
    rect(ctx, 3*s, 3*s, 2*s, s, '#CC5522');
    // 火焰光效
    ctx.globalAlpha = 0.12 + Math.sin(frame * 0.12) * 0.08;
    rect(ctx, -5*s, -3*s, 12*s, 7*s, '#FF6633');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 玄冰狼
  function drawPetIceWolf(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.07) * s;
    ctx.translate(0, bob);
    // 身体
    rect(ctx, -4*s, -2*s, 10*s, 5*s, '#8899BB');
    rect(ctx, -3*s, -s, 8*s, 3*s, '#AABBDD');
    // 头
    rect(ctx, -8*s, -5*s, 6*s, 6*s, '#99AACC');
    rect(ctx, -7*s, -4*s, 4*s, 4*s, '#BBCCEE');
    // 尖耳
    rect(ctx, -8*s, -7*s, 2*s, 2*s, '#7788AA');
    rect(ctx, -4*s, -7*s, 2*s, 2*s, '#7788AA');
    // 狼眼
    rect(ctx, -7*s, -4*s, s, s, '#44DDFF');
    px(ctx, -7*s, -4*s, s, '#111122');
    rect(ctx, -4*s, -4*s, s, s, '#44DDFF');
    px(ctx, -4*s, -4*s, s, '#111122');
    // 獠牙
    px(ctx, -7*s, -s, s, '#FFFFFF');
    px(ctx, -4*s, -s, s, '#FFFFFF');
    // 冰刺毛
    rect(ctx, -2*s, -4*s, s, 2*s, '#CCDDFF');
    rect(ctx, s, -4*s, s, 2*s, '#CCDDFF');
    // 尾
    rect(ctx, 6*s, -3*s, s, 3*s, '#7788AA');
    rect(ctx, 7*s, -4*s, s, 2*s, '#88CCFF');
    // 脚
    rect(ctx, -4*s, 3*s, 2*s, s, '#667799');
    rect(ctx, 0, 3*s, 2*s, s, '#667799');
    rect(ctx, 4*s, 3*s, 2*s, s, '#667799');
    // 冰气
    ctx.globalAlpha = 0.1 + Math.sin(frame * 0.1) * 0.05;
    rect(ctx, -5*s, -3*s, 13*s, 7*s, '#88CCFF');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 雷鸣鹰
  function drawPetThunderEagle(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const flap = Math.sin(frame * 0.1) * 2 * s;
    // 身体
    rect(ctx, -3*s, -s, 7*s, 4*s, '#DAA520');
    rect(ctx, -2*s, 0, 5*s, 2*s, '#FFD700');
    // 翅膀
    rect(ctx, -8*s, -4*s + flap, 5*s, 3*s, '#CC9900');
    rect(ctx, 4*s, -4*s + flap, 5*s, 3*s, '#CC9900');
    rect(ctx, -9*s, -3*s + flap, s, 2*s, '#996600');
    rect(ctx, 9*s, -3*s + flap, s, 2*s, '#996600');
    // 头
    rect(ctx, -s, -4*s, 3*s, 3*s, '#FFD700');
    // 喙
    rect(ctx, 0, -3*s, s, 2*s, '#FF8800');
    px(ctx, 0, -4*s, s, '#FF6600');
    // 鹰眼
    px(ctx, -s, -3*s, s, '#FFFFFF');
    px(ctx, s, -3*s, s, '#FFFFFF');
    // 雷电
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.15) * 0.3;
    px(ctx, -3*s, -2*s, s, '#FFFF00');
    px(ctx, 4*s, -2*s, s, '#FFFF00');
    ctx.globalAlpha = 1;
    // 尾
    rect(ctx, -s, 3*s, 3*s, 2*s, '#AA8800');
    // 爪
    rect(ctx, -2*s, 3*s, s, s, '#996600');
    rect(ctx, 2*s, 3*s, s, s, '#996600');
    ctx.restore();
  }

  // 暗鳞蛇
  function drawPetShadowSerpent(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const wave = Math.sin(frame * 0.06);
    // 蛇身（锯齿方块）
    rect(ctx, -4*s, 0, 3*s, 2*s, '#4A0088');
    rect(ctx, -s, -s + wave*s, 3*s, 2*s, '#5500AA');
    rect(ctx, 2*s, 0, 3*s, 2*s, '#4A0088');
    rect(ctx, 5*s, -s + wave*s, 2*s, 2*s, '#5500AA');
    // 暗色鳞片
    ctx.globalAlpha = 0.3;
    px(ctx, -3*s, 0, s, '#220044');
    px(ctx, 0, -s + wave*s, s, '#220044');
    px(ctx, 3*s, 0, s, '#220044');
    ctx.globalAlpha = 1;
    // 头
    rect(ctx, -7*s, -2*s, 3*s, 4*s, '#6600CC');
    rect(ctx, -6*s, -s, 2*s, 2*s, '#7722DD');
    // 眼
    px(ctx, -7*s, -2*s, s, '#FF00FF');
    px(ctx, -7*s, s, s, '#FF00FF');
    // 尾
    px(ctx, 7*s, 0, s, '#330066');
    // 暗影光效
    ctx.globalAlpha = 0.08 + Math.sin(frame * 0.08) * 0.05;
    rect(ctx, -8*s, -3*s, 17*s, 7*s, '#6600CC');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 天凤
  function drawPetPhoenix(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const flap = Math.sin(frame * 0.08) * 2 * s;
    // 身体
    rect(ctx, -3*s, -s, 8*s, 4*s, '#FF4444');
    rect(ctx, -2*s, 0, 6*s, 2*s, '#FF6666');
    // 翅膀（展开）
    rect(ctx, -8*s, -3*s + flap, 5*s, 3*s, '#FF2200');
    rect(ctx, 5*s, -3*s + flap, 5*s, 3*s, '#FF2200');
    rect(ctx, -9*s, -2*s + flap, s, 2*s, '#FFD700');
    rect(ctx, 10*s, -2*s + flap, s, 2*s, '#FFD700');
    // 头
    rect(ctx, -s, -4*s, 3*s, 3*s, '#FF6644');
    // 冠（方块火焰冠）
    rect(ctx, -s, -6*s, s, 2*s, '#FFD700');
    rect(ctx, 0, -7*s, s, 3*s, '#FFAA00');
    rect(ctx, s, -6*s, s, 2*s, '#FFD700');
    // 喙
    px(ctx, 0, -3*s, s, '#FF8800');
    // 眼
    px(ctx, -s, -4*s, s, '#FFFFFF');
    px(ctx, s, -4*s, s, '#FFFFFF');
    // 尾羽（火焰）
    rect(ctx, 5*s, -2*s, s, 4*s, '#FF4400');
    rect(ctx, 6*s, -3*s, s, 5*s, '#FF6600');
    rect(ctx, 7*s, -4*s, s, 6*s, '#FFD700');
    rect(ctx, 8*s, -3*s, s, 4*s, '#FFAA00');
    // 火焰粒子
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const a = frame * 0.02 + i * 1.257;
      const pr = 10 * s;
      px(ctx, Math.cos(a) * pr, -s + Math.sin(a) * pr * 0.5, s, i % 2 === 0 ? '#FFD700' : '#FF4400');
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 灵兽独立绘制接口
  function drawActiveBeast(ctx, x, y, s, beastTemplateId, frame) {
    switch (beastTemplateId) {
      case 'fire_cat':       drawPetFireCat(ctx, x, y, s, frame); break;
      case 'ice_wolf':       drawPetIceWolf(ctx, x, y, s, frame); break;
      case 'thunder_eagle':  drawPetThunderEagle(ctx, x, y, s, frame); break;
      case 'shadow_serpent': drawPetShadowSerpent(ctx, x, y, s, frame); break;
      case 'jade_dragon':    drawPetDragon(ctx, x, y, s, frame); break;
      case 'phoenix':        drawPetPhoenix(ctx, x, y, s, frame); break;
      default:
        if (beastTemplateId && beastTemplateId.includes('dragon')) {
          drawPetDragonGold(ctx, x, y, s, frame);
        } else {
          drawPetSnake(ctx, x, y, s, frame);
        }
    }
  }

  // ================================================================
  // 坐骑 — 方块像素风
  // ================================================================

  function drawMountCrane(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const glide = Math.sin(frame * 0.04) * 2 * s;
    ctx.translate(0, glide);
    // 身体（白色方块椭圆）
    rect(ctx, -6*s, -2*s, 12*s, 5*s, '#FFFFFF');
    rect(ctx, -5*s, -3*s, 10*s, s, '#F5F5F5');
    rect(ctx, -5*s, 3*s, 10*s, s, '#F5F5F5');
    // 颈部（方块像素线上弯）
    rect(ctx, -5*s, -4*s, 2*s, 2*s, '#FFFFFF');
    rect(ctx, -6*s, -6*s, 2*s, 2*s, '#FFFFFF');
    rect(ctx, -6*s, -8*s, 2*s, 2*s, '#FFFFFF');
    rect(ctx, -5*s, -10*s, 2*s, 2*s, '#FFFFFF');
    // 头
    rect(ctx, -6*s, -12*s, 4*s, 3*s, '#FFFFFF');
    // 冠（红顶）
    rect(ctx, -5*s, -13*s, 2*s, s, '#FF2222');
    // 喙
    rect(ctx, -8*s, -11*s, 2*s, s, '#FF8800');
    // 眼
    px(ctx, -6*s, -11*s, s, '#111111');
    // 翅膀
    const wingFlap = Math.sin(frame * 0.06) * 2;
    rect(ctx, -10*s, -s + wingFlap*s, 4*s, 2*s, '#EEEEEE');
    rect(ctx, -12*s, 0 + wingFlap*s, 2*s, s, '#333333');
    rect(ctx, 6*s, -s + wingFlap*s, 4*s, 2*s, '#EEEEEE');
    rect(ctx, 10*s, 0 + wingFlap*s, 2*s, s, '#333333');
    // 尾羽
    rect(ctx, 5*s, -s, s, 3*s, '#222222');
    rect(ctx, 6*s, 0, s, 4*s, '#222222');
    rect(ctx, 7*s, s, s, 3*s, '#222222');
    // 腿
    rect(ctx, -2*s, 4*s, s, 4*s, '#888888');
    rect(ctx, 2*s, 4*s, s, 4*s, '#888888');
    ctx.restore();
  }

  function drawMountQilin(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const trot = Math.sin(frame * 0.08) * s;
    // 身体
    rect(ctx, -7*s, -3*s, 14*s, 7*s, '#CC8800');
    rect(ctx, -6*s, -2*s, 12*s, 5*s, '#DDAA33');
    // 鳞片
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        px(ctx, -4*s + i * 2*s, -2*s + j * 2*s, s, '#AA7700');
      }
    }
    ctx.globalAlpha = 1;
    // 头
    rect(ctx, -10*s, -6*s, 5*s, 5*s, '#DDAA33');
    rect(ctx, -9*s, -5*s, 3*s, 3*s, '#EEBB55');
    // 双角
    const hornGlow = 0.7 + Math.sin(frame * 0.06) * 0.3;
    ctx.globalAlpha = hornGlow;
    rect(ctx, -8*s, -9*s, s, 3*s, '#FFD700');
    rect(ctx, -6*s, -9*s, s, 3*s, '#FFD700');
    ctx.globalAlpha = 1;
    // 鬃毛（火焰方块）
    const flameOff = Math.sin(frame * 0.12) > 0 ? s : 0;
    for (let i = 0; i < 4; i++) {
      const mx = -4*s + i * 3*s;
      rect(ctx, mx, -5*s + flameOff, s, 2*s, i % 2 === 0 ? '#FF4400' : '#FF6600');
    }
    // 眼
    px(ctx, -10*s, -5*s, s, '#FF0000');
    px(ctx, -10*s, -6*s, s, '#FFAAAA');
    // 嘴
    rect(ctx, -11*s, -3*s, 2*s, s, '#CCAA44');
    // 腿
    const legs = [[-4, trot], [-s, -trot], [2, trot], [5, -trot]];
    legs.forEach(([lx, ly]) => {
      rect(ctx, lx*s, 4*s + ly, 2*s, 4*s, '#CC8800');
      rect(ctx, lx*s, 8*s + ly, 2*s, s, '#886600');
    });
    // 蹄火
    ctx.globalAlpha = 0.5 + Math.sin(frame * 0.1) * 0.3;
    legs.forEach(([lx, ly]) => {
      px(ctx, lx*s, 9*s + ly, s, '#FF6600');
      px(ctx, (lx+1)*s, 9*s + ly, s, '#FFAA00');
    });
    ctx.globalAlpha = 1;
    // 尾（火焰尾）
    rect(ctx, 7*s, -3*s, s, 3*s, '#FF4400');
    rect(ctx, 8*s, -5*s, s, 3*s, '#FF6600');
    rect(ctx, 9*s, -6*s, s, 2*s, '#FFAA00');
    // 全身灵光
    ctx.globalAlpha = 0.06 + Math.sin(frame * 0.04) * 0.03;
    rect(ctx, -9*s, -7*s, 20*s, 16*s, '#FFD700');
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ================================================================
  // 怪物绘制 — 方块像素风
  // ================================================================
  const monsterDrawers = {
    '灰毛妖鼠': (ctx, x, y, s, frame) => {
      rect(ctx, -4*s, -2*s, 9*s, 5*s, '#888888');
      rect(ctx, -3*s, -s, 7*s, 3*s, '#AAAAAA');
      rect(ctx, -6*s, -5*s, 5*s, 5*s, '#999999');
      rect(ctx, -5*s, -4*s, 3*s, 3*s, '#BBBBBB');
      rect(ctx, -6*s, -7*s, 2*s, 2*s, '#888888'); px(ctx, -6*s, -7*s, s, '#F8A0B0');
      rect(ctx, -3*s, -7*s, 2*s, 2*s, '#888888'); px(ctx, -3*s, -7*s, s, '#F8A0B0');
      px(ctx, -5*s, -4*s, s, '#FF0000'); px(ctx, -3*s, -4*s, s, '#FF0000');
      px(ctx, -4*s, -2*s, s, '#FFA0A0');
      rect(ctx, 5*s, -s, s, s, '#888888'); rect(ctx, 6*s, -2*s, s, s, '#888888'); rect(ctx, 7*s, -3*s, s, s, '#888888');
      rect(ctx, -3*s, 3*s, 2*s, s, '#777777'); rect(ctx, 2*s, 3*s, 2*s, s, '#777777');
    },
    '毒蟾蜍': (ctx, x, y, s, frame) => {
      const hop = Math.abs(Math.sin(frame * 0.08)) * 2 * s;
      ctx.translate(0, -hop);
      rect(ctx, -5*s, -3*s, 10*s, 7*s, '#228B22'); rect(ctx, -4*s, -2*s, 8*s, 5*s, '#90EE90');
      px(ctx, -2*s, -3*s, s, '#006400'); px(ctx, 2*s, -2*s, s, '#006400'); px(ctx, -s, s, s, '#006400');
      rect(ctx, -4*s, -5*s, 2*s, 2*s, '#228B22'); px(ctx, -4*s, -5*s, s, '#FFFF00');
      rect(ctx, 2*s, -5*s, 2*s, 2*s, '#228B22'); px(ctx, 2*s, -5*s, s, '#FFFF00');
      rect(ctx, -3*s, s, 6*s, s, '#006400');
      rect(ctx, -5*s, 4*s, 3*s, s, '#228B22'); rect(ctx, 3*s, 4*s, 3*s, s, '#228B22');
      if (Math.floor(frame / 20) % 3 === 0) { ctx.globalAlpha = 0.5; px(ctx, Math.sin(frame*0.1)*2*s, 5*s, s, '#44FF44'); ctx.globalAlpha = 1; }
    },
    '赤狐妖': (ctx, x, y, s, frame) => {
      const sway = Math.sin(frame * 0.06) * s;
      rect(ctx, -4*s, -2*s, 10*s, 5*s, '#CC4400'); rect(ctx, -3*s, -s, 8*s, 3*s, '#FF6633');
      rect(ctx, -7*s, -5*s, 5*s, 5*s, '#DD5522'); rect(ctx, -6*s, -4*s, 3*s, 3*s, '#FF7744');
      rect(ctx, -7*s, -7*s, 2*s, 2*s, '#CC4400'); rect(ctx, -4*s, -7*s, 2*s, 2*s, '#CC4400');
      px(ctx, -6*s, -4*s, s, '#FFD700'); px(ctx, -4*s, -4*s, s, '#FFD700');
      px(ctx, -5*s, -2*s, s, '#222222');
      rect(ctx, -3*s, 0, 3*s, 2*s, '#FFCC99');
      rect(ctx, 5*s, -4*s+sway, 2*s, 5*s, '#FF6633'); rect(ctx, 6*s, -5*s+sway, 2*s, 3*s, '#FFFFFF');
      rect(ctx, -3*s, 3*s, 2*s, s, '#993300'); rect(ctx, 2*s, 3*s, 2*s, s, '#993300');
    },
    '铁甲傀儡': (ctx, x, y, s, frame) => {
      const shake = Math.sin(frame * 0.1) * 0.5 * s; ctx.translate(shake, 0);
      rect(ctx, -5*s, -5*s, 10*s, 10*s, '#666677'); rect(ctx, -4*s, -4*s, 8*s, 8*s, '#888899'); rect(ctx, -3*s, -3*s, 6*s, 6*s, '#7777AA');
      px(ctx, -4*s, -4*s, s, '#AAAACC'); px(ctx, 3*s, -4*s, s, '#AAAACC'); px(ctx, -4*s, 3*s, s, '#AAAACC'); px(ctx, 3*s, 3*s, s, '#AAAACC');
      rect(ctx, -2*s, -3*s, 2*s, s, '#FF0000'); rect(ctx, s, -3*s, 2*s, s, '#FF0000');
      rect(ctx, -2*s, 0, 4*s, s, '#444466');
      rect(ctx, -7*s, -3*s, 2*s, 6*s, '#666677'); rect(ctx, 5*s, -3*s, 2*s, 6*s, '#666677');
      rect(ctx, -4*s, 5*s, 3*s, 3*s, '#555566'); rect(ctx, 2*s, 5*s, 3*s, 3*s, '#555566');
    },
    '墨蛟蛇': (ctx, x, y, s, frame) => {
      ctx.scale(-1, 1); // 翻转面向左方（面向玩家）
      const wave = Math.sin(frame * 0.05);
      // 墨蛟蛇——黑绿色蛇形，有角质突起暗示未来化蛟
      const bodyD='#1A3300', scaleD='#336600', bellyD='#557722';
      // S形蛇身
      rect(ctx, -6*s, 0, 3*s, 2*s, bodyD); px(ctx, -5*s, s, s, bellyD);
      rect(ctx, -3*s, -s+wave*s, 3*s, 2*s, scaleD); px(ctx, -2*s, 0+wave*s, s, bellyD);
      rect(ctx, 0, 0, 3*s, 2*s, bodyD); px(ctx, s, s, s, bellyD);
      rect(ctx, 3*s, -s+wave*s, 3*s, 2*s, scaleD); px(ctx, 4*s, 0+wave*s, s, bellyD);
      // 鳞纹
      ctx.globalAlpha=0.3;
      px(ctx, -4*s, -s, s, '#448800'); px(ctx, s, -s, s, '#448800');
      px(ctx, 4*s, -2*s+wave*s, s, '#448800');
      ctx.globalAlpha=1;
      // 蛇头（略宽，有蛟龙雏形）
      rect(ctx, 6*s, -3*s, 4*s, 4*s, scaleD);
      rect(ctx, 6*s, -s, 4*s, s, bellyD); // 下颚
      // 蛇眼（金色竖瞳）
      px(ctx, 8*s, -3*s, s, '#FFFF00');
      // 角质突起（暗示化蛟趋势）
      px(ctx, 7*s, -4*s, s, '#555500'); px(ctx, 9*s, -4*s, s, '#555500');
      // 信子（红色分叉舌）
      px(ctx, 10*s, -s, s, '#FF0000'); px(ctx, 11*s, -2*s, s, '#FF0000');
      px(ctx, 11*s, 0, s, '#FF0000');
      // 蛇尾（渐细）
      rect(ctx, -8*s, s+wave*s, 2*s, s, bodyD);
      px(ctx, -9*s, s, s, '#113300');
      px(ctx, -10*s, s, s, '#0A2200');
    },
    '暴猿妖': (ctx, x, y, s, frame) => {
      const pound = Math.sin(frame * 0.12) * s;
      rect(ctx, -5*s, -4*s, 10*s, 9*s, '#664422'); rect(ctx, -4*s, -3*s, 8*s, 7*s, '#885533');
      rect(ctx, -3*s, -s, 6*s, 4*s, '#AA7755');
      rect(ctx, -3*s, -8*s, 6*s, 5*s, '#775533'); rect(ctx, -2*s, -7*s, 4*s, 3*s, '#997755');
      rect(ctx, -2*s, -7*s, 2*s, s, '#553311'); rect(ctx, s, -7*s, 2*s, s, '#553311');
      px(ctx, -2*s, -6*s, s, '#FF0000'); px(ctx, s, -6*s, s, '#FF0000');
      px(ctx, 0, -5*s, s, '#553311'); rect(ctx, -s, -4*s, 2*s, s, '#664422');
      rect(ctx, -7*s, -3*s, 2*s, 8*s+pound, '#664422'); rect(ctx, 5*s, -3*s, 2*s, 8*s+pound, '#664422');
      rect(ctx, -8*s, 5*s+pound, 3*s, 2*s, '#553311'); rect(ctx, 5*s, 5*s+pound, 3*s, 2*s, '#553311');
      rect(ctx, -4*s, 5*s, 3*s, 2*s, '#553311'); rect(ctx, 2*s, 5*s, 3*s, 2*s, '#553311');
    },
    '冰魄蜘蛛': (ctx, x, y, s, frame) => {
      rect(ctx, -4*s, -3*s, 8*s, 6*s, '#6688AA'); rect(ctx, -3*s, -2*s, 6*s, 4*s, '#88AACC');
      rect(ctx, -2*s, -6*s, 4*s, 3*s, '#7799BB');
      px(ctx, -s, -5*s, s, '#FF0000'); px(ctx, 0, -5*s, s, '#FF0000'); px(ctx, s, -5*s, s, '#FF0000');
      px(ctx, -s, -4*s, s, '#FF0000'); px(ctx, s, -4*s, s, '#FF0000');
      for (let i=0;i<4;i++) { const lw=Math.sin(frame*0.08+i)*s; rect(ctx,-7*s-lw,-2*s+i*2*s,3*s,s,'#5577AA'); rect(ctx,4*s+lw,-2*s+i*2*s,3*s,s,'#5577AA'); }
      ctx.globalAlpha=0.2; rect(ctx,-2*s,3*s,s,3*s,'#CCDDFF'); rect(ctx,2*s,3*s,s,3*s,'#CCDDFF'); ctx.globalAlpha=1;
      ctx.globalAlpha=0.1+Math.sin(frame*0.06)*0.05; rect(ctx,-5*s,-4*s,10*s,8*s,'#88CCFF'); ctx.globalAlpha=1;
    },
    '三眼火鸦': (ctx, x, y, s, frame) => {
      const flap = Math.sin(frame*0.1)*2*s;
      rect(ctx,-3*s,-2*s,6*s,5*s,'#222222'); rect(ctx,-2*s,-s,4*s,3*s,'#333333');
      rect(ctx,-8*s,-3*s+flap,5*s,2*s,'#1A1A1A'); rect(ctx,3*s,-3*s+flap,5*s,2*s,'#1A1A1A');
      rect(ctx,-s,-5*s,3*s,3*s,'#2A2A2A');
      px(ctx,-s,-4*s,s,'#FF4400'); px(ctx,0,-5*s,s,'#FF6600'); px(ctx,s,-4*s,s,'#FF4400');
      px(ctx,0,-3*s,s,'#FF8800');
      rect(ctx,0,3*s,s,2*s,'#FF4400'); rect(ctx,-s,4*s,s,2*s,'#FF6600'); rect(ctx,s,4*s,s,2*s,'#FFAA00');
      px(ctx,-2*s,3*s,s,'#444444'); px(ctx,2*s,3*s,s,'#444444');
    },
    '豹形雷兽': (ctx, x, y, s, frame) => {
      const dash = Math.sin(frame*0.1)*s;
      rect(ctx,-5*s,-3*s,11*s,6*s,'#DAA520'); rect(ctx,-4*s,-2*s,9*s,4*s,'#FFD700');
      px(ctx,-3*s,-2*s,s,'#886600'); px(ctx,0,-s,s,'#886600'); px(ctx,3*s,-2*s,s,'#886600');
      rect(ctx,-8*s,-5*s,5*s,5*s,'#DDAA22'); rect(ctx,-7*s,-4*s,3*s,3*s,'#EEBB44');
      px(ctx,-7*s,-4*s,s,'#FFFF00'); px(ctx,-5*s,-4*s,s,'#FFFF00');
      px(ctx,-7*s,-s,s,'#FFFFFF'); px(ctx,-5*s,-s,s,'#FFFFFF');
      ctx.globalAlpha=0.4+Math.sin(frame*0.12)*0.3; px(ctx,-2*s,-3*s,s,'#FFFF44'); px(ctx,2*s,-3*s,s,'#FFFF44'); ctx.globalAlpha=1;
      rect(ctx,6*s,-3*s+dash,s,3*s,'#DAA520'); rect(ctx,7*s,-4*s+dash,s,2*s,'#FFFF00');
      rect(ctx,-4*s,3*s,2*s,s,'#AA8800'); rect(ctx,-s,3*s,2*s,s,'#AA8800'); rect(ctx,2*s,3*s,2*s,s,'#AA8800'); rect(ctx,5*s,3*s,2*s,s,'#AA8800');
    },
    '鬼影修士': (ctx, x, y, s, frame) => {
      const float = Math.sin(frame*0.04)*2*s; ctx.translate(0, float);
      rect(ctx,-5*s,-4*s,10*s,12*s,'#1A1A2E'); rect(ctx,-4*s,-3*s,8*s,10*s,'#22223A');
      rect(ctx,-4*s,-8*s,8*s,5*s,'#1A1A2E'); rect(ctx,-3*s,-7*s,6*s,3*s,'#111122');
      ctx.globalAlpha=0.7+Math.sin(frame*0.08)*0.3; px(ctx,-2*s,-6*s,s,'#44FF88'); px(ctx,s,-6*s,s,'#44FF88'); ctx.globalAlpha=1;
      const hw=Math.sin(frame*0.05)>0?s:0;
      rect(ctx,-6*s,8*s,2*s,2*s+hw,'#1A1A2E'); rect(ctx,4*s,8*s,2*s,2*s+hw,'#1A1A2E');
      ctx.globalAlpha=0.3+Math.sin(frame*0.1)*0.2; px(ctx,-6*s,-2*s,s,'#44FF88'); px(ctx,5*s,-3*s,s,'#44FF88'); ctx.globalAlpha=1;
    },
  };

  const monsterDrawersExtra = {
    '天魔老祖': (ctx, x, y, s, frame) => {
      rect(ctx,-6*s,-5*s,12*s,13*s,'#220022'); rect(ctx,-5*s,-4*s,10*s,11*s,'#330033'); rect(ctx,-5*s,-3*s,10*s,7*s,'#440044');
      rect(ctx,-3*s,-9*s,6*s,5*s,'#330033'); rect(ctx,-5*s,-12*s,2*s,3*s,'#FF0044'); rect(ctx,3*s,-12*s,2*s,3*s,'#FF0044');
      rect(ctx,-2*s,-8*s,2*s,s,'#FF0000'); rect(ctx,s,-8*s,2*s,s,'#FF0000');
      ctx.globalAlpha=0.15+Math.sin(frame*0.03)*0.1; rect(ctx,-8*s,-6*s,16*s,14*s,'#FF0066'); ctx.globalAlpha=1;
      rect(ctx,-7*s,-5*s,3*s,3*s,'#550055'); rect(ctx,5*s,-5*s,3*s,3*s,'#550055');
      rect(ctx,-5*s,8*s,4*s,2*s,'#220022'); rect(ctx,2*s,8*s,4*s,2*s,'#220022');
    },
    '九尾天狐': (ctx, x, y, s, frame) => {
      rect(ctx,-5*s,-3*s,10*s,6*s,'#FFCC66'); rect(ctx,-4*s,-2*s,8*s,4*s,'#FFE088');
      rect(ctx,-8*s,-6*s,5*s,5*s,'#FFDD77'); rect(ctx,-7*s,-5*s,3*s,3*s,'#FFEE99');
      rect(ctx,-8*s,-8*s,2*s,2*s,'#FFCC66'); rect(ctx,-5*s,-8*s,2*s,2*s,'#FFCC66');
      rect(ctx,-7*s,-5*s,2*s,s,'#FF66AA'); px(ctx,-7*s,-5*s,s,'#111122');
      for(let i=0;i<9;i++){const ty=-4*s+(i%3)*3*s,tx=5*s+Math.floor(i/3)*2*s,tw=Math.sin(frame*0.05+i*0.5)*s; rect(ctx,tx,ty+tw,s,2*s,i%2===0?'#FFCC66':'#FFFFFF');}
      rect(ctx,-4*s,3*s,2*s,s,'#CC9944'); rect(ctx,2*s,3*s,2*s,s,'#CC9944');
      ctx.globalAlpha=0.08; rect(ctx,-7*s,-5*s,18*s,10*s,'#FFDDAA'); ctx.globalAlpha=1;
    },
    '劫雷真龙': (ctx, x, y, s, frame) => {
      ctx.scale(-1, 1); // 翻转面向左方（面向玩家）
      const bob=Math.sin(frame*0.03)*2*s; ctx.translate(0,bob);
      // 中华龙蛇形身体（雷蓝色，S形蜿蜒）
      const bodyB='#2244AA', scaleB='#3366CC', bellyB='#88BBFF';
      // 龙身段1（后段）
      rect(ctx,-7*s,0,3*s,4*s,bodyB); rect(ctx,-7*s,s,3*s,2*s,scaleB);
      px(ctx,-6*s,2*s,s,bellyB);
      // 龙身段2
      rect(ctx,-4*s,-2*s,4*s,4*s,bodyB); rect(ctx,-3*s,-s,2*s,2*s,bellyB);
      // 龙身段3
      rect(ctx,0,-3*s,4*s,4*s,bodyB); rect(ctx,s,-2*s,2*s,2*s,bellyB);
      // 龙身段4（前段）
      rect(ctx,4*s,-4*s,3*s,3*s,bodyB); rect(ctx,4*s,-3*s,3*s,s,bellyB);
      // 鳞片纹理（闪电纹）
      ctx.globalAlpha=0.4;
      px(ctx,-6*s,-s,s,'#FFFF44'); px(ctx,-2*s,-3*s,s,'#FFFF44');
      px(ctx,2*s,-4*s,s,'#FFFF44'); px(ctx,5*s,-5*s,s,'#FFFF44');
      ctx.globalAlpha=1;
      // 龙爪（雷电利爪，两对）
      px(ctx,-5*s,4*s,s,'#88BBFF'); px(ctx,-4*s,5*s,s,'#4466DD');
      px(ctx,2*s,s,s,'#88BBFF'); px(ctx,3*s,2*s,s,'#4466DD');
      // 龙头（威严大头）
      rect(ctx,7*s,-7*s,5*s,5*s,scaleB); rect(ctx,7*s,-6*s,5*s,3*s,bodyB);
      rect(ctx,7*s,-4*s,5*s,2*s,bellyB); // 下颚
      rect(ctx,7*s,-8*s,5*s,s,bodyB); // 额头
      // 龙眼（金色雷光）
      px(ctx,10*s,-7*s,s,'#FFFF00'); px(ctx,11*s,-6*s,s,'#FFFFAA');
      // 鹿角（雷龙的电角）
      rect(ctx,8*s,-9*s,s,s,'#FFD700'); rect(ctx,7*s,-10*s,s,s,'#FFD700');
      rect(ctx,6*s,-11*s,s,s,'#FFFFAA');
      rect(ctx,11*s,-9*s,s,s,'#FFD700'); rect(ctx,12*s,-10*s,s,s,'#FFD700');
      px(ctx,11*s,-10*s,s,'#FFFFAA');
      // 龙须（电弧飘动）
      const wh=Math.sin(frame*0.07)*s;
      px(ctx,12*s,-5*s,s,'#88CCFF'); px(ctx,13*s,-4*s+wh,s,'#AADDFF');
      px(ctx,12*s,-3*s,s,'#88CCFF'); px(ctx,13*s,-2*s-wh,s,'#AADDFF');
      // 龙口（可见牙）
      px(ctx,12*s,-4*s,s,'#FFFFFF');
      // 尾巴（闪电尾，渐细+分叉）
      rect(ctx,-9*s,s,2*s,2*s,bodyB);
      rect(ctx,-11*s,2*s,2*s,s,bodyB);
      px(ctx,-12*s,s,s,'#3366CC'); px(ctx,-12*s,3*s,s,'#3366CC'); // 尾鳍分叉
      // 雷电特效（闪烁电弧围绕龙身）
      ctx.globalAlpha=0.3+Math.sin(frame*0.1)*0.2;
      px(ctx,-3*s,-4*s,s,'#FFFF44'); px(ctx,4*s,-5*s,s,'#FFFF44');
      px(ctx,-s,2*s,s,'#FFFF44'); px(ctx,6*s,-2*s,s,'#FFFF44');
      // 龙身周围的雷光
      for(let i=0;i<3;i++){const a=frame*0.08+i*2.1,r=6*s; px(ctx,Math.cos(a)*r,-s+Math.sin(a)*r*0.5,s,'#FFFF88');}
      ctx.globalAlpha=1;
    },
    '血魔宗主': (ctx, x, y, s, frame) => {
      const pulse=Math.sin(frame*0.04);
      rect(ctx,-6*s,-5*s,12*s,13*s,'#660000'); rect(ctx,-5*s,-4*s,10*s,11*s,'#880000'); rect(ctx,-4*s,-3*s,8*s,7*s,'#AA0000');
      rect(ctx,-3*s,-9*s,6*s,5*s,'#770000'); rect(ctx,-2*s,-8*s,4*s,3*s,'#CC0000');
      px(ctx,-s,-7*s,s,'#FFFF00'); px(ctx,s,-7*s,s,'#FFFF00');
      ctx.globalAlpha=0.15+pulse*0.1; rect(ctx,-8*s,-6*s,16*s,14*s,'#FF0000'); ctx.globalAlpha=1;
      rect(ctx,-7*s,-4*s,2*s,12*s,'#550000'); rect(ctx,5*s,-4*s,2*s,12*s,'#550000');
      rect(ctx,-5*s,8*s,4*s,2*s,'#440000'); rect(ctx,2*s,8*s,4*s,2*s,'#440000');
    },
    '血衣魔修': (ctx, x, y, s, frame) => {
      const float=Math.sin(frame*0.05)*s; ctx.translate(0,float);
      rect(ctx,-5*s,-4*s,10*s,11*s,'#8B0000'); rect(ctx,-4*s,-3*s,8*s,9*s,'#AA2222');
      rect(ctx,-3*s,-2*s,6*s,5*s,'#CC3333');
      rect(ctx,-3*s,-8*s,6*s,5*s,'#AA2222'); rect(ctx,-3*s,-9*s,6*s,2*s,'#660000');
      px(ctx,-s,-6*s,s,'#FF0000'); px(ctx,s,-6*s,s,'#FF0000');
      ctx.globalAlpha=0.2; for(let i=0;i<3;i++) px(ctx,-2*s+i*2*s,7*s+Math.sin(frame*0.06+i)*s,s,'#FF0000'); ctx.globalAlpha=1;
    },
    '化龙妖蛟': (ctx, x, y, s, frame) => {
      ctx.scale(-1, 1); // 翻转面向左方（面向玩家）
      const wave=Math.sin(frame*0.04)*s;
      // 中华蛟龙——半龙半蛇身，正在化龙，身体更细长
      const bodyG='#228866', scaleG='#33AA77', bellyG='#88DDAA';
      // 蛇形身段（S形蜿蜒）
      rect(ctx,-6*s,0,3*s,3*s,bodyG); px(ctx,-5*s,s,s,bellyG);
      rect(ctx,-3*s,-s+wave,3*s,3*s,bodyG); px(ctx,-2*s,0+wave,s,bellyG);
      rect(ctx,0,-2*s,3*s,3*s,bodyG); px(ctx,s,-s,s,bellyG);
      rect(ctx,3*s,-3*s+wave,3*s,2*s,bodyG); px(ctx,4*s,-2*s+wave,s,bellyG);
      // 鳞片纹理
      ctx.globalAlpha=0.3;
      px(ctx,-5*s,-s,s,scaleG); px(ctx,-s,-2*s+wave,s,scaleG);
      px(ctx,2*s,-3*s,s,scaleG); px(ctx,5*s,-4*s+wave,s,scaleG);
      ctx.globalAlpha=1;
      // 初生龙爪（蛟龙化龙中，爪未完全长成，一对小爪）
      px(ctx,-4*s,3*s,s,bodyG); px(ctx,-3*s,4*s,s,'#116644');
      px(ctx,1*s,s,s,bodyG); px(ctx,2*s,2*s,s,'#116644');
      // 龙头（尖锐，比蛇头更宽）
      rect(ctx,6*s,-5*s,4*s,4*s,scaleG);
      rect(ctx,6*s,-4*s,4*s,2*s,bellyG); // 下颚
      rect(ctx,6*s,-6*s,4*s,s,bodyG); // 额板
      // 龙眼
      px(ctx,8*s,-5*s,s,'#FFFF00');
      // 初生鹿角（短，化龙中）
      px(ctx,7*s,-7*s,s,'#DAA520'); px(ctx,9*s,-7*s,s,'#DAA520');
      px(ctx,7*s,-8*s,s,'#B8860B');
      // 龙须（短须）
      const wh=Math.sin(frame*0.06)*s;
      px(ctx,10*s,-4*s,s,'#88DDAA'); px(ctx,11*s,-3*s+wh,s,'#88DDAA');
      px(ctx,10*s,-3*s,s,'#88DDAA');
      // 龙口
      px(ctx,10*s,-4*s,s,'#EEFFEE');
      // 尾巴（蛇尾，渐细）
      rect(ctx,-8*s,s+wave,2*s,s,bodyG);
      px(ctx,-9*s,2*s+wave,s,'#117755');
      px(ctx,-10*s,2*s+wave,s,'#117755');
      // 化龙灵气（绿色微光）
      ctx.globalAlpha=0.1;
      ellipse(ctx,0,-s,10*s,5*s,'#44FFAA');
      ctx.globalAlpha=1;
    },
    '混沌古兽': (ctx, x, y, s, frame) => {
      const pulse=Math.sin(frame*0.03);
      rect(ctx,-7*s,-5*s,14*s,12*s,'#1A0A2E'); rect(ctx,-6*s,-4*s,12*s,10*s,'#2A1A3E'); rect(ctx,-5*s,-3*s,10*s,8*s,'#3A2A4E');
      ctx.globalAlpha=0.3; for(let i=0;i<4;i++) px(ctx,-4*s+i*3*s,-3*s+(i%2)*2*s,s,'#AA00FF'); ctx.globalAlpha=1;
      ctx.globalAlpha=0.5+pulse*0.3;
      px(ctx,-3*s,-3*s,s,'#FF00FF'); px(ctx,0,-4*s,s,'#FF00FF'); px(ctx,2*s,-3*s,s,'#FF00FF'); px(ctx,-s,-2*s,s,'#FF00FF');
      ctx.globalAlpha=1;
      for(let i=0;i<4;i++){const tw=Math.sin(frame*0.06+i)*s; rect(ctx,-5*s+i*3*s,7*s,s,3*s+tw,'#2A1A3E');}
      ctx.globalAlpha=0.1+pulse*0.05; rect(ctx,-8*s,-6*s,16*s,14*s,'#8800FF'); ctx.globalAlpha=1;
    },
    '天道魔神': (ctx, x, y, s, frame) => {
      const pulse=Math.sin(frame*0.025);
      rect(ctx,-8*s,-7*s,16*s,17*s,'#0A0A1A'); rect(ctx,-7*s,-6*s,14*s,15*s,'#1A1A2E'); rect(ctx,-6*s,-5*s,12*s,11*s,'#2A2A3E');
      ctx.globalAlpha=0.3+pulse*0.15;
      for(let i=0;i<6;i++){const a=frame*0.01+i*1.05,r=(3+i)*s; px(ctx,Math.cos(a)*r,-s+Math.sin(a)*r,s,'#FF0088');}
      ctx.globalAlpha=1;
      rect(ctx,-4*s,-11*s,8*s,5*s,'#1A1A2E');
      rect(ctx,-6*s,-15*s,2*s,4*s,'#FF0044'); rect(ctx,-2*s,-14*s,2*s,3*s,'#FF0044'); rect(ctx,s,-14*s,2*s,3*s,'#FF0044'); rect(ctx,4*s,-15*s,2*s,4*s,'#FF0044');
      px(ctx,-2*s,-10*s,s,'#FF0000'); px(ctx,0,-11*s,s,'#FFD700'); px(ctx,2*s,-10*s,s,'#FF0000');
      rect(ctx,-12*s,-5*s,4*s,8*s,'#0A0A1A'); rect(ctx,8*s,-5*s,4*s,8*s,'#0A0A1A');
      rect(ctx,-6*s,10*s,4*s,3*s,'#0A0A1A'); rect(ctx,3*s,10*s,4*s,3*s,'#0A0A1A');
      ctx.globalAlpha=0.1+pulse*0.05; rect(ctx,-10*s,-8*s,20*s,20*s,'#FF0088'); ctx.globalAlpha=1;
    },
  };
  Object.assign(monsterDrawers, monsterDrawersExtra);

  // ================================================================
  // 武器皮肤 (已是方块风格)
  // ================================================================
  const weaponSkinDrawers = {
    'ws_bamboo': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#2E5E1E'); rect(ctx,-s,0,3*s,s,'#4A8B2A'); rect(ctx,-s/2,-9*s,2*s,9*s,'#4A8B2A'); for(let i=0;i<3;i++) rect(ctx,-s,-8*s+i*3*s,3*s,s,'#2E5E1E'); rect(ctx,0,-10*s,s,s,'#8BC34A'); },
    'ws_rusty': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#5D4037'); rect(ctx,-s,0,3*s,s,'#8B7355'); rect(ctx,-s/2,-8*s,2*s,8*s,'#8B6914'); rect(ctx,0,-9*s,s,s,'#A08040'); rect(ctx,0,-6*s,s,s,'#CC6600'); rect(ctx,-s/2,-3*s,s,s,'#996633'); },
    'ws_bone': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#8B7355'); rect(ctx,-s,0,3*s,s,'#DDD'); rect(ctx,-s/2,-9*s,2*s,9*s,'#E8DCC8'); rect(ctx,0,-10*s,s,s,'#FFF'); for(let i=0;i<2;i++){rect(ctx,-s,-7*s+i*4*s,s,2*s,'#DDD'); rect(ctx,s,-5*s+i*4*s,s,2*s,'#DDD');} },
    'ws_jade': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#2E7D32'); rect(ctx,-s,0,3*s,s,'#4CAF50'); rect(ctx,-s/2,-9*s,2*s,9*s,'#66BB6A'); ctx.globalAlpha=0.4+Math.sin(frame*0.06)*0.2; rect(ctx,0,-9*s,s,9*s,'#A5D6A7'); ctx.globalAlpha=1; },
    'ws_blood': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#4A0000'); rect(ctx,-s,0,3*s,s,'#800000'); rect(ctx,-s/2,-9*s,2*s,9*s,'#CC0000'); rect(ctx,0,-10*s,s,s,'#FF0000'); ctx.globalAlpha=0.3+Math.sin(frame*0.08)*0.2; for(let i=0;i<3;i++) px(ctx,-s/2+Math.sin(frame*0.05+i)*s,-8*s+i*3*s,s,'#FF0000'); ctx.globalAlpha=1; },
    'ws_ice': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#1A5276'); rect(ctx,-s,0,3*s,s,'#5DADE2'); rect(ctx,-s/2,-10*s,2*s,10*s,'#85C1E9'); rect(ctx,0,-11*s,s,s,'#D6EAF8'); ctx.globalAlpha=0.3+Math.sin(frame*0.07)*0.2; rect(ctx,-s/2,-10*s,2*s,10*s,'#AED6F1'); ctx.globalAlpha=1; },
    'ws_flame': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#5D4037'); rect(ctx,-s,0,3*s,s,'#FF6F00'); rect(ctx,-s/2,-9*s,2*s,9*s,'#FF8F00'); rect(ctx,0,-10*s,s,s,'#FFD600'); ctx.globalAlpha=0.4+Math.sin(frame*0.1)*0.3; for(let i=0;i<4;i++) rect(ctx,-s+Math.sin(frame*0.08+i)*s,-9*s+i*2.5*s,s,s,'#FF6F00'); ctx.globalAlpha=1; },
    'ws_shadow': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#1A1A2E'); rect(ctx,-s,0,3*s,s,'#4A148C'); rect(ctx,-s/2,-10*s,2*s,10*s,'#311B92'); rect(ctx,0,-11*s,s,s,'#7C4DFF'); ctx.globalAlpha=0.25+Math.sin(frame*0.05)*0.15; rect(ctx,-s,-10*s,3*s,10*s,'#7C4DFF'); ctx.globalAlpha=1; },
    'ws_thunder': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#4A5568'); rect(ctx,-s,0,3*s,s,'#F6E05E'); rect(ctx,-s/2,-10*s,2*s,10*s,'#ECC94B'); rect(ctx,0,-11*s,s,s,'#FEFCBF'); ctx.globalAlpha=0.5+Math.sin(frame*0.15)*0.4; for(let i=0;i<3;i++) px(ctx,-s+Math.random()*2*s,-9*s+i*3*s,s,'#FFFFF0'); ctx.globalAlpha=1; },
    'ws_moonlight': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#2C3E50'); rect(ctx,-s,0,3*s,s,'#BDC3C7'); rect(ctx,-s/2,-10*s,2*s,10*s,'#ECF0F1'); rect(ctx,0,-11*s,s,s,'#FFFFFF'); ctx.globalAlpha=0.3+Math.sin(frame*0.04)*0.2; rect(ctx,-s,-10*s,3*s,10*s,'#F0F3F4'); ctx.globalAlpha=1; },
    'ws_vine': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#1B5E20'); rect(ctx,-s,0,3*s,s,'#2E7D32'); rect(ctx,-s/2,-9*s,2*s,9*s,'#4CAF50'); for(let i=0;i<4;i++) rect(ctx,(i%2===0?-s:s),-8*s+i*2*s,s,s,'#81C784'); rect(ctx,0,-10*s,s,s,'#A5D6A7'); },
    'ws_crystal': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#4A148C'); rect(ctx,-s,0,3*s,s,'#CE93D8'); rect(ctx,-s/2,-10*s,2*s,10*s,'#E1BEE7'); rect(ctx,-s,-11*s,3*s,s,'#F3E5F5'); ctx.globalAlpha=0.3+Math.sin(frame*0.06)*0.2; rect(ctx,-s,-10*s,3*s,10*s,'#F3E5F5'); ctx.globalAlpha=1; },
    'ws_demon': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#1A1A1A'); rect(ctx,-2*s,-s,5*s,2*s,'#B71C1C'); rect(ctx,-s,-11*s,3*s,11*s,'#D32F2F'); rect(ctx,-s/2,-12*s,2*s,s,'#FF5252'); ctx.globalAlpha=0.2+Math.sin(frame*0.04)*0.15; rect(ctx,-s,-11*s,3*s,11*s,'#FF1744'); ctx.globalAlpha=1; },
    'ws_dragon': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#1B5E20'); rect(ctx,-2*s,-s,5*s,2*s,'#DAA520'); rect(ctx,-s,-11*s,3*s,11*s,'#2E7D32'); rect(ctx,0,-12*s,s,s,'#FFD700'); /* 龙鳞纹 */ for(let i=0;i<4;i++) px(ctx,-s+((i+1)%2)*s,-10*s+i*2.5*s,s,'#FFD700'); /* 龙首护手 */ rect(ctx,-2*s,-s,s,2*s,'#DAA520'); rect(ctx,2*s,-s,s,2*s,'#DAA520'); px(ctx,-2*s,-2*s,s,'#FFD700'); px(ctx,2*s,-2*s,s,'#FFD700'); ctx.globalAlpha=0.2+Math.sin(frame*0.05)*0.1; rect(ctx,-s,-11*s,3*s,11*s,'#FFD700'); ctx.globalAlpha=1; },
    'ws_phoenix': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#BF360C'); rect(ctx,-2*s,-s,5*s,2*s,'#FF6F00'); rect(ctx,-s,-11*s,3*s,11*s,'#FF8F00'); rect(ctx,0,-12*s,s,s,'#FFD600'); ctx.globalAlpha=0.4+Math.sin(frame*0.08)*0.3; for(let i=0;i<5;i++) px(ctx,-s+Math.sin(frame*0.06+i)*s*1.5,-11*s+i*2.5*s,s,i%2===0?'#FF6F00':'#FFD600'); ctx.globalAlpha=1; },
    'ws_void': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#0D0D0D'); rect(ctx,-2*s,-s,5*s,2*s,'#4A148C'); rect(ctx,-s,-12*s,3*s,12*s,'#1A0033'); rect(ctx,0,-13*s,s,s,'#7C4DFF'); for(let i=0;i<4;i++){ctx.globalAlpha=0.4+Math.sin(frame*0.05+i*0.7)*0.3; px(ctx,-s+Math.sin(i*2.1)*s,-11*s+i*3*s,s,'#B388FF');} ctx.globalAlpha=1; },
    'ws_celestial': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#5D4037'); rect(ctx,-2*s,-s,5*s,2*s,'#FFD700'); rect(ctx,-s,-12*s,3*s,12*s,'#FFC107'); rect(ctx,-s/2,-13*s,2*s,s,'#FFFFF0'); ctx.globalAlpha=0.5+Math.sin(frame*0.035)*0.3; rect(ctx,-s,-12*s,3*s,12*s,'#FFD700'); ctx.globalAlpha=1; },
    'ws_heavenly': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#0D47A1'); rect(ctx,-2*s,-s,5*s,2*s,'#FFD700'); ctx.globalAlpha=0.8+Math.sin(frame*0.04)*0.2; rect(ctx,-s,-11*s,3*s,11*s,'#FFC107'); ctx.globalAlpha=1; },
    'ws_primordial': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#880000'); rect(ctx,-2*s,-s,5*s,2*s,'#FFD700'); rect(ctx,-s,-13*s,3*s,13*s,'#FFD700'); rect(ctx,-s/2,-14*s,2*s,s,'#FFFFAA'); for(let i=0;i<6;i++){const a=frame*0.02+i*Math.PI/3; ctx.globalAlpha=0.6+Math.sin(frame*0.04+i)*0.3; rect(ctx,Math.cos(a)*3*s,-7*s+Math.sin(a)*5*s,s,s,'#FFFFFF');} ctx.globalAlpha=0.5; rect(ctx,-s,-13*s,3*s,13*s,'#FFD700'); ctx.globalAlpha=1; },
    'ws_cosmic': (ctx,s,frame) => { rect(ctx,0,0,s,3*s,'#0D0D2B'); rect(ctx,-2*s,-s,5*s,2*s,'#00BCD4'); const grad=ctx.createLinearGradient(-s,-14*s,2*s,0); grad.addColorStop(0,'#1A237E'); grad.addColorStop(0.5,'#0D47A1'); grad.addColorStop(1,'#01579B'); ctx.fillStyle=grad; ctx.fillRect(-s,-14*s,3*s,14*s); for(let i=0;i<8;i++){ctx.globalAlpha=0.5+Math.sin(frame*0.06+i*0.8)*0.5; rect(ctx,-s+Math.sin(i*1.7)*s*1.5,-13*s+i*1.8*s,s*0.8,s*0.8,'#FFFFFF');} ctx.globalAlpha=0.45+Math.sin(frame*0.025)*0.2; ctx.fillStyle='#00BCD4'; ctx.fillRect(-s,-14*s,3*s,14*s); ctx.globalAlpha=1; },
  };

  // ================================================================
  // 盔甲皮肤颜色 + 覆盖层
  // ================================================================
  const armorSkinColors = {
    'as_patched':{ main:'#8B8B6B',accent:'#6B6B4B',trim:'#A0A080' },
    'as_farmer':{ main:'#A09060',accent:'#807040',trim:'#C0B080' },
    'as_scholar':{ main:'#F0F0F0',accent:'#D8D8D8',trim:'#FFFFFF' },
    'as_bamboo':{ main:'#4A8B4A',accent:'#367836',trim:'#6BAF6B' },
    'as_cloud':{ main:'#B0C4DE',accent:'#8AAABE',trim:'#D0E4FE' },
    'as_fire_robe':{ main:'#CC3300',accent:'#AA2200',trim:'#FF6644' },
    'as_ice_silk':{ main:'#88CCEE',accent:'#66AACC',trim:'#AAEEFF' },
    'as_night':{ main:'#1A1A2E',accent:'#0D0D1A',trim:'#333366' },
    'as_dragon_scale':{ main:'#228877',accent:'#116655',trim:'#44CCAA' },
    'as_flower':{ main:'#DD66AA',accent:'#BB4488',trim:'#FF88CC' },
    'as_star_robe':{ main:'#1A237E',accent:'#0D1557',trim:'#3F51B5' },
    'as_blood_armor':{ main:'#8B0000',accent:'#660000',trim:'#CC2222' },
    'as_jade_emperor':{ main:'#FFD700',accent:'#DAA520',trim:'#FFEE88' },
    'as_ghost':{ main:'#228B4588',accent:'#1A6B3588',trim:'#44FF8888' },
    'as_thunder_armor':{ main:'#DAA520',accent:'#B8860B',trim:'#FFEB3B' },
    'as_phoenix_robe':{ main:'#FF4500',accent:'#CC3700',trim:'#FFD700' },
    'as_void_cloak':{ main:'#0A0A1A',accent:'#050510',trim:'#4A148C' },
    'as_celestial':{ main:'#FFD700',accent:'#FFC107',trim:'#FFFFF0' },
    'as_primordial_robe':{ main:'#4A148C',accent:'#311B92',trim:'#FFD700' },
    'as_universe':{ main:'#0D47A1',accent:'#1A237E',trim:'#00BCD4' },
  };

  function drawArmorSkinOverlay(ctx, x, y, s, realmIndex, frame, attacking, skinId) {
    const colors = armorSkinColors[skinId]; if (!colors) return;
    const bounce = realmIndex<=1 ? Math.sin(frame*0.08)*1.5*s : (realmIndex<=3 ? Math.sin(frame*0.04)*2*s : Math.sin(frame*0.03)*(3+realmIndex)*s);
    const atkX = attacking>0 ? Math.sin(attacking*0.4)*(6+realmIndex*2)*s : 0;
    const floatExtra = realmIndex>=3 ? -(realmIndex-2)*3*s : 0;
    ctx.save(); ctx.translate(x+atkX, y+bounce+floatExtra); ctx.globalAlpha=0.75;
    // v4.0适配：缩小衣服覆盖层
    const bw = realmIndex>=4 ? 7 : (realmIndex>=2 ? 6 : (realmIndex>=1 ? 5 : 4));
    const bh = realmIndex>=4 ? 6 : (realmIndex>=2 ? 5 : (realmIndex>=1 ? 4 : 4));
    rect(ctx,-bw*s,-(bh-1)*s,bw*2*s,bh*2*s,colors.main);
    rect(ctx,-(bw-1)*s,-(bh-2)*s,(bw-1)*2*s,(bh-1)*2*s,colors.accent);
    px(ctx,-s,-(bh)*s,s,colors.trim); px(ctx,0,-(bh-1)*s,s,colors.trim); px(ctx,s,-(bh)*s,s,colors.trim);
    rect(ctx,-bw*s,0,bw*2*s,s,colors.trim);
    if(skinId.includes('phoenix')||skinId.includes('celestial')||skinId.includes('primordial')||skinId.includes('universe')){
      ctx.globalAlpha=0.25+Math.sin(frame*0.04)*0.15; rect(ctx,-bw*s,-(bh-1)*s,bw*2*s,bh*2*s,colors.trim);
    }
    ctx.globalAlpha=1; ctx.restore();
  }

  function drawWeaponWithSkin(ctx, x, y, s, tier, frame, attacking, skinId) {
    if(skinId && weaponSkinDrawers[skinId]){
      ctx.save(); ctx.translate(x,y);
      const angle = attacking>0 ? -0.8+Math.sin(attacking*0.5)*1.5 : -0.3;
      ctx.rotate(angle); weaponSkinDrawers[skinId](ctx,s,frame); ctx.restore();
    } else { drawWeapon(ctx,x,y,s,tier,frame,attacking); }
  }

  // ================================================================
  // 公开接口
  // ================================================================
  function drawMouseByRealm(ctx, x, y, s, realmIndex, frame, attacking, options) {
    const opts = options || {};
    const drawFns = [drawMouseRealm0,drawMouseRealm1,drawMouseRealm2,drawMouseRealm3,drawMouseRealm4,drawMouseRealm5];
    // 境界光环（用circle绘制柔和的椭圆光晕，不是方块）
    if(realmIndex >= 1){
      const glowColors = [null,'rgba(68,136,204,0.08)','rgba(46,139,139,0.10)','rgba(65,105,180,0.12)','rgba(123,62,191,0.15)','rgba(160,32,96,0.18)'];
      const glowR = (12+realmIndex*4)*s;
      const pulse = 1+Math.sin(frame*0.03)*0.1;
      ctx.save(); ctx.globalAlpha=0.4;
      const r = glowR*pulse;
      ellipse(ctx, x, y-2*s, r, r*0.7, glowColors[realmIndex]||'transparent');
      ctx.globalAlpha=1; ctx.restore();
    }
    const fn = drawFns[realmIndex] || drawFns[0];
    fn(ctx, x, y, s, frame, attacking, opts);
  }

  function drawMonsterByName(ctx, name, x, y, s, frame, hitAnim) {
    const drawer = monsterDrawers[name];
    if(!drawer){
      ctx.save(); ctx.translate(x,y);
      const shake = hitAnim>0 ? Math.sin(hitAnim*2)*3*s : 0; ctx.translate(shake,0);
      rect(ctx,-5*s,-5*s,10*s,10*s,'#FF4488');
      rect(ctx,-2*s,-3*s,2*s,2*s,'#FFF'); rect(ctx,2*s,-3*s,2*s,2*s,'#FFF');
      ctx.restore(); return;
    }
    ctx.save(); ctx.translate(x,y);
    const shake = hitAnim>0 ? Math.sin(hitAnim*2)*3*s : 0;
    const alpha = hitAnim>0 ? 0.6+0.4*(1-hitAnim/10) : 1;
    ctx.translate(shake,0); ctx.globalAlpha=alpha;
    drawer(ctx,x,y,s,frame);
    if(hitAnim>5){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=(hitAnim-5)/10; drawer(ctx,x,y,s,frame); ctx.globalCompositeOperation='source-over'; }
    ctx.globalAlpha=1; ctx.restore();
  }

  function drawMonsterHPBar(ctx, x, y, s, hpPercent, name) {
    const barW=60, barH=6;
    rect(ctx, x-barW/2, y, barW, barH, '#333');
    const color = hpPercent>0.5 ? '#44AA44' : hpPercent>0.2 ? '#DDAA44' : '#DD4444';
    const fillW = barW*Math.max(0,hpPercent);
    if(fillW>0) rect(ctx, x-barW/2, y, fillW, barH, color);
    ctx.strokeStyle='#666'; ctx.lineWidth=1; ctx.strokeRect(x-barW/2, y, barW, barH);
    ctx.font='12px "Microsoft YaHei",sans-serif'; ctx.fillStyle='#FFF'; ctx.textAlign='center'; ctx.fillText(name, x, y-4);
  }

  return {
    drawMouseByRealm, drawMonsterByName, drawMonsterHPBar, drawActiveBeast,
    drawMountCrane, drawMountQilin, drawWeaponWithSkin, drawArmorSkinOverlay,
    armorSkinColors, rect, px, circle, ellipse, roundRect,
  };
})();

if (typeof module !== 'undefined') module.exports = Sprites;