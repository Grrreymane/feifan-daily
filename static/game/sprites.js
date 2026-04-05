// ============================================================
// sprites.js — 鼠鼠修仙 像素精灵绘制系统 v2.0
// 圆润像素风格 — 参考高精度像素画美术
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

  // 圆形绘制（像素圆润的核心）
  function circle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(Math.floor(cx), Math.floor(cy), r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 椭圆绘制
  function ellipse(ctx, cx, cy, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(Math.floor(cx), Math.floor(cy), rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 圆角矩形
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

  // 水滴/耳朵形
  function ear(ctx, cx, cy, w, h, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
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

  // ===== 颜色常量 — 蓝紫霓虹风 =====
  const C = {
    // 鼠鼠身体
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
    CHEEK: 'rgba(255,150,180,0.25)',
    // 衣服
    CLOTH_BROWN: '#5A6B8A',
    CLOTH_GOLD: '#4488CC',
    CLOTH_GREEN: '#2E8B8B',
    CLOTH_BLUE: '#4169B4',
    CLOTH_PURPLE: '#7B3EBF',
    CLOTH_RED: '#A02060',
    // 武器
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
  // 鼠鼠绘制 — 圆润像素风 v2.0
  // 核心改变：用 ellipse/circle/roundRect 替代纯 rect
  // 身体比例更可爱：大头、圆耳、胖身子、小手小脚
  // ================================================================

  // 通用鼠鼠身体绘制（所有境界共用）
  function drawMouseBody(ctx, s, furMain, furLight, furBelly, earOuter, earInner) {
    // === 耳朵（大圆耳，更像参考图） ===
    // 左耳
    ellipse(ctx, -4*s, -14*s, 3.5*s, 4*s, earOuter);
    ellipse(ctx, -4*s, -13.5*s, 2*s, 2.5*s, earInner);
    // 右耳
    ellipse(ctx, 4.5*s, -14*s, 3.5*s, 4*s, earOuter);
    ellipse(ctx, 4.5*s, -13.5*s, 2*s, 2.5*s, earInner);

    // === 头部（大圆脑袋） ===
    ellipse(ctx, 0.5*s, -9*s, 6.5*s, 5.5*s, furMain);
    // 面部亮色
    ellipse(ctx, 0.5*s, -8.5*s, 5*s, 4.5*s, furLight);
    // 腮帮
    ellipse(ctx, -3.5*s, -7.5*s, 2*s, 1.5*s, C.CHEEK);
    ellipse(ctx, 4.5*s, -7.5*s, 2*s, 1.5*s, C.CHEEK);

    // === 眼睛（大而圆，有灵气） ===
    // 左眼
    circle(ctx, -2*s, -9.5*s, 1.8*s, '#000011');
    circle(ctx, -2.5*s, -10*s, 0.8*s, '#FFFFFF'); // 高光
    circle(ctx, -1.3*s, -9*s, 0.4*s, '#AABBFF'); // 小高光
    // 右眼
    circle(ctx, 3*s, -9.5*s, 1.8*s, '#000011');
    circle(ctx, 2.5*s, -10*s, 0.8*s, '#FFFFFF');
    circle(ctx, 3.7*s, -9*s, 0.4*s, '#AABBFF');

    // === 鼻子（小粉鼻） ===
    ellipse(ctx, 0.5*s, -7*s, 1*s, 0.7*s, C.NOSE);

    // === 嘴巴（小微笑） ===
    ctx.strokeStyle = '#8899AA';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(0.5*s, -6.2*s, 1.2*s, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // === 胡须（细弧线） ===
    ctx.strokeStyle = C.WHISKER;
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4*s, -8*s); ctx.quadraticCurveTo(-7*s, -9*s, -9*s, -8.5*s);
    ctx.moveTo(-4*s, -7*s); ctx.quadraticCurveTo(-7*s, -7*s, -9*s, -6.5*s);
    ctx.moveTo(-4*s, -6.5*s); ctx.quadraticCurveTo(-6.5*s, -5.5*s, -8*s, -5*s);
    ctx.moveTo(5*s, -8*s); ctx.quadraticCurveTo(8*s, -9*s, 10*s, -8.5*s);
    ctx.moveTo(5*s, -7*s); ctx.quadraticCurveTo(8*s, -7*s, 10*s, -6.5*s);
    ctx.moveTo(5*s, -6.5*s); ctx.quadraticCurveTo(7.5*s, -5.5*s, 9*s, -5*s);
    ctx.stroke();
  }

  // 绘制鼠鼠的腿和脚（圆润版）
  function drawMouseLegs(ctx, s, furMain) {
    // 左腿
    roundRect(ctx, -3.5*s, 3*s, 3*s, 3.5*s, 1*s, furMain);
    // 左脚（圆圆的）
    ellipse(ctx, -2.5*s, 7*s, 2.2*s, 1*s, C.FUR_DARK);
    // 右腿
    roundRect(ctx, 1.5*s, 3*s, 3*s, 3.5*s, 1*s, furMain);
    // 右脚
    ellipse(ctx, 2.5*s, 7*s, 2.2*s, 1*s, C.FUR_DARK);
  }

  // 绘制尾巴
  function drawMouseTail(ctx, s, frame, color) {
    ctx.strokeStyle = color || C.TAIL;
    ctx.lineWidth = s * 1.8;
    ctx.lineCap = 'round';
    const tailWave = Math.sin(frame * 0.06) * 3 * s;
    ctx.beginPath();
    ctx.moveTo(-3*s, 3*s);
    ctx.quadraticCurveTo(-8*s, 0 + tailWave, -10*s, -4*s);
    ctx.quadraticCurveTo(-11*s, -7*s + tailWave * 0.5, -9*s, -9*s);
    ctx.stroke();
    // 尾巴尖稍细
    circle(ctx, -9*s, -9*s, s * 0.6, color || C.TAIL);
  }

  // ================================================================
  // 六种境界鼠鼠
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

    // 尾巴（先画，在身体后面）
    drawMouseTail(ctx, s, frame);

    // 身体（圆润的布衣）
    ellipse(ctx, 0.5*s, 0, 6*s, 5.5*s, cl);
    ellipse(ctx, 0.5*s, 0.5*s, 4.5*s, 4*s, clAccent);
    // 肚子
    ellipse(ctx, 0.5*s, 0.5*s, 3*s, 3*s, C.FUR_BELLY);
    // 腰带
    roundRect(ctx, -5.5*s, -0.5*s, 12*s, 1.5*s, 0.5*s, clTrim);
    // 衣领
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s * 0.8;
    ctx.beginPath();
    ctx.moveTo(-1*s, -4.5*s);
    ctx.lineTo(0.5*s, -2*s);
    ctx.lineTo(2*s, -4.5*s);
    ctx.stroke();

    // 头
    drawMouseBody(ctx, s, C.FUR_GREY, C.FUR_LIGHT, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);

    // 腿
    drawMouseLegs(ctx, s, C.FUR_GREY);

    // 武器
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

    // 道袍身体
    ellipse(ctx, 0.5*s, 0, 6.5*s, 6*s, cl);
    ellipse(ctx, 0.5*s, 0.5*s, 5*s, 4.5*s, clAccent);
    ellipse(ctx, 0.5*s, 0.5*s, 3.5*s, 3*s, C.FUR_BELLY);
    // 衣领（V领道袍）
    roundRect(ctx, -6*s, -0.5*s, 13*s, 1.5*s, 0.5*s, clTrim);
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s;
    ctx.beginPath();
    ctx.moveTo(-2*s, -5*s);
    ctx.lineTo(0.5*s, -1.5*s);
    ctx.lineTo(3*s, -5*s);
    ctx.stroke();
    // 道袍飘带
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s * 0.8;
    ctx.lineCap = 'round';
    const ribbonWave = Math.sin(frame * 0.06) * s;
    ctx.beginPath();
    ctx.moveTo(-5*s, 1*s);
    ctx.quadraticCurveTo(-7*s, 4*s + ribbonWave, -6*s, 7*s);
    ctx.stroke();

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

  // --- 金丹期：毛色更亮，法袍+浮空 ---
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

    // 法袍（更华丽）
    ellipse(ctx, 0.5*s, 0, 7*s, 6.5*s, cl);
    ellipse(ctx, 0.5*s, 0.5*s, 5.5*s, 5*s, clAccent);
    ellipse(ctx, 0.5*s, 0.5*s, 3.5*s, 3*s, C.FUR_BELLY);
    // 金丹纹饰
    ctx.globalAlpha = 0.3 + Math.sin(frame * 0.04) * 0.15;
    circle(ctx, 0.5*s, -0.5*s, 1.5*s, '#44FFCC');
    ctx.globalAlpha = 1;
    // 腰带
    roundRect(ctx, -6.5*s, -0.5*s, 14*s, 1.5*s, 0.5*s, clTrim);
    // 玉佩
    circle(ctx, -5*s, 2.5*s, 1*s, '#44DDBB');
    circle(ctx, -5*s, 2.5*s, 0.5*s, '#88FFE0');
    // 衣领
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s;
    ctx.beginPath();
    ctx.moveTo(-2.5*s, -5.5*s); ctx.lineTo(0.5*s, -1.5*s); ctx.lineTo(3.5*s, -5.5*s);
    ctx.stroke();

    // 浮空气流
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 3; i++) {
      const px = -3*s + i * 3*s;
      const py = 8*s + Math.sin(frame * 0.05 + i) * 2*s;
      ellipse(ctx, px, py, 2*s, 0.5*s, '#88CCCC');
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

    // 华服（更大更华丽）
    ellipse(ctx, 0.5*s, 0, 7.5*s, 7*s, cl);
    ellipse(ctx, 0.5*s, 0.5*s, 6*s, 5.5*s, clAccent);
    ellipse(ctx, 0.5*s, 0.5*s, 4*s, 3.5*s, C.FUR_BELLY);
    // 灵纹
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#88BBFF';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 3; i++) {
      const a = frame * 0.02 + i * Math.PI * 2 / 3;
      ctx.beginPath();
      ctx.arc(0.5*s, 0, (2.5 + i) * s, a, a + 1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 腰带+宝石
    roundRect(ctx, -7*s, -0.5*s, 15*s, 1.5*s, 0.5*s, clTrim);
    circle(ctx, 0.5*s, 0.2*s, 1*s, '#4488FF');
    circle(ctx, 0.5*s, 0.2*s, 0.5*s, '#88CCFF');
    // 衣领+肩甲
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s * 1.2;
    ctx.beginPath();
    ctx.moveTo(-3*s, -6*s); ctx.lineTo(0.5*s, -1.5*s); ctx.lineTo(4*s, -6*s);
    ctx.stroke();
    // 肩饰
    ellipse(ctx, -6*s, -4*s, 2*s, 1.5*s, clTrim);
    ellipse(ctx, 7*s, -4*s, 2*s, 1.5*s, clTrim);

    // 飘带
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s;
    ctx.lineCap = 'round';
    const rw = Math.sin(frame * 0.05) * 2 * s;
    ctx.beginPath();
    ctx.moveTo(-6*s, 1*s);
    ctx.quadraticCurveTo(-9*s, 5*s + rw, -7*s, 9*s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(7*s, 1*s);
    ctx.quadraticCurveTo(10*s, 5*s - rw, 8*s, 9*s);
    ctx.stroke();

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

    // 仙袍（大而飘逸）
    // 下摆飘逸
    const hemWave = Math.sin(frame * 0.04) * 2 * s;
    ctx.fillStyle = cl;
    ctx.beginPath();
    ctx.ellipse(0.5*s, 1*s, 8*s, 7.5*s, 0, 0, Math.PI);
    ctx.fill();
    ellipse(ctx, 0.5*s, -1*s, 8*s, 6*s, cl);
    ellipse(ctx, 0.5*s, 0, 6.5*s, 5*s, clAccent);
    ellipse(ctx, 0.5*s, 0.5*s, 4*s, 3.5*s, C.FUR_BELLY);
    // 符文光圈
    ctx.globalAlpha = 0.2 + Math.sin(frame * 0.03) * 0.1;
    ctx.strokeStyle = '#BB88FF';
    ctx.lineWidth = s * 0.6;
    for (let i = 0; i < 4; i++) {
      const a = frame * 0.015 + i * Math.PI / 2;
      ctx.beginPath();
      ctx.arc(0.5*s, 0, (3 + i * 1.5) * s, a, a + 0.8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // 腰带
    roundRect(ctx, -7.5*s, -0.5*s, 16*s, 1.5*s, 0.5*s, clTrim);
    // 紫玉坠
    circle(ctx, 0.5*s, 0.2*s, 1.2*s, '#9944FF');
    circle(ctx, 0.5*s, 0.2*s, 0.6*s, '#CC88FF');
    // 肩甲
    ellipse(ctx, -7*s, -4*s, 2.5*s, 1.8*s, clTrim);
    ellipse(ctx, 8*s, -4*s, 2.5*s, 1.8*s, clTrim);
    // 肩甲宝石
    circle(ctx, -7*s, -4*s, 0.8*s, '#FF88FF');
    circle(ctx, 8*s, -4*s, 0.8*s, '#FF88FF');

    // 长飘带
    ctx.strokeStyle = clTrim;
    ctx.lineWidth = s * 1.2;
    ctx.lineCap = 'round';
    const rw = Math.sin(frame * 0.04) * 3 * s;
    ctx.beginPath();
    ctx.moveTo(-7*s, 2*s);
    ctx.bezierCurveTo(-12*s, 6*s + rw, -10*s, 10*s, -8*s, 14*s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8*s, 2*s);
    ctx.bezierCurveTo(13*s, 6*s - rw, 11*s, 10*s, 9*s, 14*s);
    ctx.stroke();

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

    // 天衣光华
    ctx.globalAlpha = 0.08 + Math.sin(frame * 0.02) * 0.04;
    circle(ctx, 0.5*s, 0, 18*s, '#FF66BB');
    ctx.globalAlpha = 1;

    // 天衣身体
    ctx.fillStyle = cl;
    ctx.beginPath();
    ctx.ellipse(0.5*s, 2*s, 9*s, 8.5*s, 0, 0, Math.PI);
    ctx.fill();
    ellipse(ctx, 0.5*s, -1*s, 9*s, 7*s, cl);
    ellipse(ctx, 0.5*s, 0, 7*s, 5.5*s, clAccent);
    ellipse(ctx, 0.5*s, 0.5*s, 4.5*s, 4*s, C.FUR_BELLY);

    // 天衣纹饰（旋转符文）
    ctx.globalAlpha = 0.25 + Math.sin(frame * 0.025) * 0.1;
    ctx.strokeStyle = '#FF88CC';
    ctx.lineWidth = s * 0.8;
    for (let i = 0; i < 6; i++) {
      const a = frame * 0.012 + i * Math.PI / 3;
      const r = (3 + i % 3 * 1.5) * s;
      ctx.beginPath();
      ctx.arc(0.5*s, 0, r, a, a + 0.6);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 天冠（头顶发饰）
    circle(ctx, 0.5*s, -16*s, 2*s, '#FFD700');
    circle(ctx, 0.5*s, -16*s, 1*s, '#FFFFAA');
    ctx.globalAlpha = 0.4 + Math.sin(frame * 0.06) * 0.3;
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 8;
    circle(ctx, 0.5*s, -16*s, 2.5*s, '#FFD700');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    // 腰带
    roundRect(ctx, -8.5*s, -0.5*s, 18*s, 1.5*s, 0.5*s, clTrim);
    // 神玉
    circle(ctx, 0.5*s, 0.2*s, 1.5*s, '#FF3388');
    circle(ctx, 0.5*s, 0.2*s, 0.8*s, '#FF88BB');
    // 肩甲（大型）
    ellipse(ctx, -8*s, -4*s, 3*s, 2*s, clTrim);
    ellipse(ctx, 9*s, -4*s, 3*s, 2*s, clTrim);
    circle(ctx, -8*s, -4*s, 1*s, '#FF44AA');
    circle(ctx, 9*s, -4*s, 1*s, '#FF44AA');

    // 长飘带（多条）
    ctx.lineWidth = s * 1.5;
    ctx.lineCap = 'round';
    const rw = Math.sin(frame * 0.035) * 4 * s;
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = i === 0 ? clTrim : '#FF88CC44';
      ctx.lineWidth = (1.5 - i * 0.5) * s;
      ctx.beginPath();
      ctx.moveTo(-8*s, 2*s);
      ctx.bezierCurveTo(-14*s - i*s, 8*s + rw, -12*s, 14*s, -9*s, 18*s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(9*s, 2*s);
      ctx.bezierCurveTo(15*s + i*s, 8*s - rw, 13*s, 14*s, 10*s, 18*s);
      ctx.stroke();
    }

    drawMouseBody(ctx, s, f, l, C.FUR_BELLY, C.EAR_PINK, C.EAR_INNER);
    drawMouseLegs(ctx, s, f);

    // 仙气粒子环绕
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const a = frame * 0.02 + i * Math.PI * 2 / 5;
      const pr = 12 * s;
      const ppx = 0.5*s + Math.cos(a) * pr;
      const ppy = -2*s + Math.sin(a) * pr * 0.6;
      circle(ctx, ppx, ppy, s * 0.8, '#FFAADD');
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
  // 武器绘制 — 6阶
  // ================================================================
  function drawWeapon(ctx, x, y, s, tier, frame, attacking) {
    ctx.save();
    ctx.translate(x, y);
    const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
    ctx.rotate(angle);

    const weapons = [
      { blade: C.WOOD, hilt: C.HANDLE, len: 7, w: 1.5 },
      { blade: C.IRON, hilt: C.HANDLE, len: 8, w: 1.5 },
      { blade: C.STEEL, hilt: '#5A6B8A', len: 9, w: 2, glow: C.MAGIC_BLUE },
      { blade: '#88AAEE', hilt: '#4A5570', len: 10, w: 2, glow: C.MAGIC_PURPLE },
      { blade: '#BB88FF', hilt: '#3A2A5A', len: 11, w: 2.5, glow: C.MAGIC_PINK },
      { blade: '#FFD700', hilt: '#880044', len: 12, w: 2.5, glow: '#FFD700' },
    ];
    const w = weapons[tier] || weapons[0];

    // 剑柄
    roundRect(ctx, -w.w*s/2, 0, w.w*s, 3*s, s*0.3, w.hilt);
    // 护手
    roundRect(ctx, -w.w*s, -s*0.5, w.w*2*s, s, s*0.3, w.hilt);
    // 剑身
    roundRect(ctx, -w.w*s/3, -w.len*s, w.w*s*0.7, w.len*s, s*0.2, w.blade);
    // 剑尖
    ctx.fillStyle = w.blade;
    ctx.beginPath();
    ctx.moveTo(-w.w*s/3, -w.len*s);
    ctx.lineTo(0, -(w.len+1.5)*s);
    ctx.lineTo(w.w*s*0.7 - w.w*s/3, -w.len*s);
    ctx.fill();

    // 灵光
    if (w.glow) {
      ctx.globalAlpha = 0.25 + Math.sin(frame * 0.06) * 0.15;
      ctx.shadowColor = w.glow;
      ctx.shadowBlur = 8;
      roundRect(ctx, -w.w*s/3, -w.len*s, w.w*s*0.7, w.len*s, s*0.2, w.glow);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  // ================================================================
  // 灵兽 — 圆润像素风重绘
  // ================================================================

  // 小蛇
  function drawPetSnake(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const slither = Math.sin(frame * 0.1);
    // 蛇身（用圆形串珠效果）
    const bodyColor = '#44BB55';
    const scaleColor = '#339944';
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const bx = t * 14 * s;
      const by = Math.sin(slither + i * 0.8) * 2 * s;
      const r = (1.8 - t * 0.3) * s;
      circle(ctx, bx, by, r, bodyColor);
      circle(ctx, bx, by - r * 0.3, r * 0.6, '#66DD77'); // 腹部亮色
    }
    // 鳞片纹理
    ctx.globalAlpha = 0.3;
    for (let i = 1; i < 7; i += 2) {
      const t = i / 7;
      const bx = t * 14 * s;
      const by = Math.sin(slither + i * 0.8) * 2 * s;
      circle(ctx, bx, by + s * 0.3, 0.6 * s, scaleColor);
    }
    ctx.globalAlpha = 1;
    // 头（椭圆形蛇头）
    ellipse(ctx, -1.5*s, -0.5*s + Math.sin(slither) * s, 2.5*s, 2*s, bodyColor);
    ellipse(ctx, -1.5*s, -0.5*s + Math.sin(slither) * s, 2*s, 1.5*s, '#55CC66');
    // 眼（红宝石般）
    circle(ctx, -2.5*s, -1.5*s + Math.sin(slither) * s, 0.7*s, '#FF2222');
    circle(ctx, -2.5*s, -1.8*s + Math.sin(slither) * s, 0.3*s, '#FFAAAA');
    // 舌头
    if (Math.floor(frame / 15) % 2 === 0) {
      ctx.strokeStyle = '#FF4444';
      ctx.lineWidth = s * 0.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-3.5*s, 0 + Math.sin(slither) * s);
      ctx.lineTo(-5*s, -0.8*s + Math.sin(slither) * s);
      ctx.moveTo(-3.5*s, 0 + Math.sin(slither) * s);
      ctx.lineTo(-5*s, 0.8*s + Math.sin(slither) * s);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 蛟龙
  function drawPetDragon(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.06) * 2 * s;
    ctx.translate(0, bob);

    // 蛟龙身体（用串珠圆形，更圆润）
    const bodyColor = '#2299AA';
    const lightColor = '#33CCDD';
    for (let i = 0; i < 6; i++) {
      const t = i / 5;
      const bx = i * 3 * s;
      const by = Math.sin(frame * 0.08 + i) * 1.5 * s;
      const r = (2.2 - Math.abs(t - 0.3) * 1.5) * s;
      circle(ctx, bx, by, r, bodyColor);
      circle(ctx, bx, by - r * 0.3, r * 0.5, lightColor); // 腹部
    }
    // 头（大而圆）
    ellipse(ctx, -2*s, 0, 3.5*s, 3*s, bodyColor);
    ellipse(ctx, -2*s, 0.5*s, 2.5*s, 2*s, lightColor);
    // 嘴
    ellipse(ctx, -4.5*s, 0.5*s, 2*s, 1.2*s, '#22AABB');
    // 角
    ctx.fillStyle = '#DDAA00';
    ctx.beginPath();
    ctx.moveTo(-1.5*s, -3*s); ctx.lineTo(-0.5*s, -5.5*s); ctx.lineTo(0, -3*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0.5*s, -3*s); ctx.lineTo(1.5*s, -5.5*s); ctx.lineTo(2*s, -3*s);
    ctx.fill();
    // 眼
    circle(ctx, -3*s, -1*s, 1*s, '#FF6600');
    circle(ctx, -3.2*s, -1.3*s, 0.4*s, '#FFCC00');
    // 小翼
    ctx.fillStyle = '#44CCDD';
    ctx.beginPath();
    ctx.moveTo(3*s, -1.5*s);
    ctx.lineTo(6*s, -5*s);
    ctx.lineTo(7*s, -3*s);
    ctx.lineTo(4*s, -0.5*s);
    ctx.closePath();
    ctx.fill();
    // 龙须
    ctx.strokeStyle = '#44CCDD';
    ctx.lineWidth = s * 0.5;
    ctx.lineCap = 'round';
    const whiskerWave = Math.sin(frame * 0.08) * s;
    ctx.beginPath();
    ctx.moveTo(-4*s, -0.5*s);
    ctx.quadraticCurveTo(-7*s, -2*s + whiskerWave, -8*s, -1*s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4*s, 1.5*s);
    ctx.quadraticCurveTo(-7*s, 3*s + whiskerWave, -8*s, 2*s);
    ctx.stroke();

    ctx.restore();
  }

  // 神龙（大型金色）
  function drawPetDragonGold(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.04) * 3 * s;
    ctx.translate(0, bob);

    const bodyColor = '#FFD700';
    const lightColor = '#FFEE88';
    // 龙身（大型串珠）
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      const bx = i * 3 * s;
      const by = Math.sin(frame * 0.06 + i) * 2 * s;
      const r = (2.8 - Math.abs(t - 0.25) * 2) * s;
      circle(ctx, bx, by, r, bodyColor);
      circle(ctx, bx, by - r * 0.2, r * 0.5, lightColor);
      // 鳞片
      if (i > 0 && i < 7) {
        ctx.globalAlpha = 0.3;
        circle(ctx, bx, by + r * 0.3, r * 0.35, '#CC9900');
        ctx.globalAlpha = 1;
      }
    }
    // 鬃毛（火焰效果）
    ctx.fillStyle = '#FF4400';
    for (let i = 0; i < 4; i++) {
      const mx = i * 2.5 * s;
      const my = -2*s + Math.sin(frame * 0.1 + i) * s;
      const mh = (2 + Math.sin(frame * 0.08 + i)) * s;
      ellipse(ctx, mx, my - mh/2, s * 0.8, mh, i % 2 === 0 ? '#FF4400' : '#FF6600');
    }
    // 头
    ellipse(ctx, -3*s, 0, 4*s, 3.5*s, bodyColor);
    ellipse(ctx, -3*s, 0.5*s, 3*s, 2.5*s, lightColor);
    // 嘴
    ellipse(ctx, -6*s, 0.5*s, 2.5*s, 1.5*s, '#FFCC44');
    // 角（白色鹿角）
    ctx.strokeStyle = '#FFFFEE';
    ctx.lineWidth = s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-2*s, -3.5*s); ctx.lineTo(-1*s, -7*s);
    ctx.moveTo(-1*s, -5.5*s); ctx.lineTo(0.5*s, -6.5*s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -3.5*s); ctx.lineTo(1*s, -7*s);
    ctx.moveTo(1*s, -5.5*s); ctx.lineTo(2.5*s, -6.5*s);
    ctx.stroke();
    // 眼（威严红眼）
    circle(ctx, -4.5*s, -1*s, 1.2*s, '#FF0000');
    circle(ctx, -4.5*s, -1.3*s, 0.5*s, '#FFAAAA');
    // 龙须
    ctx.strokeStyle = '#FFEE88';
    ctx.lineWidth = s * 0.6;
    const ww = Math.sin(frame * 0.06) * 1.5 * s;
    ctx.beginPath();
    ctx.moveTo(-6*s, -0.5*s);
    ctx.bezierCurveTo(-9*s, -3*s + ww, -11*s, -2*s, -12*s, -4*s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-6*s, 2*s);
    ctx.bezierCurveTo(-9*s, 4*s + ww, -11*s, 3*s, -12*s, 5*s);
    ctx.stroke();
    // 翼
    ctx.fillStyle = '#FFCC00';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(5*s, -1*s);
    ctx.lineTo(10*s, -8*s);
    ctx.lineTo(12*s, -5*s);
    ctx.lineTo(8*s, -1*s);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    // 发光
    ctx.globalAlpha = 0.15;
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 12;
    ellipse(ctx, 3*s, 0, 10*s, 5*s, '#FFD700');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    ctx.restore();
  }

  // 火灵猫
  function drawPetFireCat(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.08) * s;
    ctx.translate(0, bob);

    // 身体（猫形椭圆）
    ellipse(ctx, 0, 0, 5*s, 3.5*s, '#FF6633');
    ellipse(ctx, 0, 0.5*s, 4*s, 2.5*s, '#FF8855');
    // 花纹
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 3; i++) {
      ellipse(ctx, -2*s + i*2*s, -1*s, 1.2*s, 0.5*s, '#CC3300');
    }
    ctx.globalAlpha = 1;
    // 头（圆猫脸）
    ellipse(ctx, -4*s, -3*s, 4*s, 3.5*s, '#FF8844');
    ellipse(ctx, -4*s, -2.5*s, 3*s, 2.5*s, '#FFAA66');
    // 耳朵（三角耳）
    ctx.fillStyle = '#FF6633';
    ctx.beginPath();
    ctx.moveTo(-6.5*s, -5*s); ctx.lineTo(-5.5*s, -8*s); ctx.lineTo(-4.5*s, -5*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3*s, -5*s); ctx.lineTo(-2*s, -8*s); ctx.lineTo(-1*s, -5*s);
    ctx.fill();
    // 耳朵内部
    ctx.fillStyle = '#FF9966';
    ctx.beginPath();
    ctx.moveTo(-6*s, -5.5*s); ctx.lineTo(-5.5*s, -7*s); ctx.lineTo(-5*s, -5.5*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2.5*s, -5.5*s); ctx.lineTo(-2*s, -7*s); ctx.lineTo(-1.5*s, -5.5*s);
    ctx.fill();
    // 眼睛（猫眼）
    ellipse(ctx, -5.5*s, -3*s, 1*s, 1.2*s, '#FFFF00');
    ellipse(ctx, -5.5*s, -3*s, 0.3*s, 1*s, '#111100'); // 竖瞳
    ellipse(ctx, -2.5*s, -3*s, 1*s, 1.2*s, '#FFFF00');
    ellipse(ctx, -2.5*s, -3*s, 0.3*s, 1*s, '#111100');
    // 鼻子
    ctx.fillStyle = '#FF3300';
    ctx.beginPath();
    ctx.moveTo(-4.3*s, -1.8*s); ctx.lineTo(-4*s, -1.3*s); ctx.lineTo(-3.7*s, -1.8*s);
    ctx.fill();
    // 尾巴（火焰尾）
    ctx.strokeStyle = '#FF4400'; ctx.lineWidth = s * 2; ctx.lineCap = 'round';
    const tailFlicker = Math.sin(frame * 0.1) * 2 * s;
    ctx.beginPath();
    ctx.moveTo(4*s, -1*s);
    ctx.bezierCurveTo(7*s, -3*s + tailFlicker, 9*s, -5*s, 8*s, -7*s);
    ctx.stroke();
    // 火焰尖端
    circle(ctx, 8*s, -7*s, 1.5*s, '#FF8800');
    circle(ctx, 8*s, -7.5*s, 1*s, '#FFCC00');
    circle(ctx, 8*s, -8*s, 0.5*s, '#FFFFAA');
    // 脚（小圆爪）
    circle(ctx, -3*s, 3*s, 1.2*s, '#CC5522');
    circle(ctx, 0, 3.5*s, 1.2*s, '#CC5522');
    circle(ctx, 2*s, 3*s, 1.2*s, '#CC5522');
    // 火焰光效
    ctx.globalAlpha = 0.12 + Math.sin(frame * 0.12) * 0.08;
    ctx.shadowColor = '#FF4400'; ctx.shadowBlur = 10;
    ellipse(ctx, 0, 0, 6*s, 4*s, '#FF6633');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    ctx.restore();
  }

  // 冰狼 — 圆润重绘
  function drawPetIceWolf(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.06) * s * 0.5;
    ctx.translate(0, bob);

    // 身体（狼形，圆润但有力量感）
    ellipse(ctx, 0, 0, 6*s, 4*s, '#99CCEE');
    ellipse(ctx, 0, 0.5*s, 5*s, 3*s, '#AADDFF');
    // 毛发纹理
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 4; i++) {
      const mx = -3*s + i * 2*s;
      ellipse(ctx, mx, -1*s, 1.5*s, 0.6*s, '#BBDDFF');
    }
    ctx.globalAlpha = 1;
    // 头（狼头，尖而圆）
    ellipse(ctx, -5*s, -2.5*s, 4.5*s, 3.5*s, '#BBDDFF');
    ellipse(ctx, -5*s, -2*s, 3.5*s, 2.5*s, '#CCEEFF');
    // 嘴（略尖）
    ellipse(ctx, -9*s, -1.5*s, 2.5*s, 1.5*s, '#AACCDD');
    // 鼻子
    circle(ctx, -10.5*s, -1.5*s, 0.8*s, '#445566');
    // 耳朵
    ctx.fillStyle = '#99CCEE';
    ctx.beginPath();
    ctx.moveTo(-7*s, -5*s); ctx.lineTo(-6*s, -8*s); ctx.lineTo(-5*s, -5*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-4*s, -5*s); ctx.lineTo(-3*s, -8*s); ctx.lineTo(-2*s, -5*s);
    ctx.fill();
    // 眼睛（冰蓝发光）
    circle(ctx, -6.5*s, -3*s, 1*s, '#00CCFF');
    circle(ctx, -6.5*s, -3.3*s, 0.4*s, '#AAEEFF');
    circle(ctx, -3.5*s, -3*s, 1*s, '#00CCFF');
    circle(ctx, -3.5*s, -3.3*s, 0.4*s, '#AAEEFF');
    // 尾巴（蓬松）
    ctx.fillStyle = '#BBDDFF';
    const tailWave = Math.sin(frame * 0.07) * 2 * s;
    ctx.beginPath();
    ctx.moveTo(5*s, -1*s);
    ctx.bezierCurveTo(8*s, -4*s + tailWave, 10*s, -3*s, 9*s, -1*s);
    ctx.bezierCurveTo(10*s, 0, 8*s, 1*s, 5*s, 0);
    ctx.fill();
    // 脚
    circle(ctx, -3*s, 4*s, 1.3*s, '#88BBDD');
    circle(ctx, 0, 4.5*s, 1.3*s, '#88BBDD');
    circle(ctx, 2.5*s, 4*s, 1.3*s, '#88BBDD');
    // 冰晶粒子
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 4; i++) {
      const px = -3*s + Math.sin(frame * 0.03 + i * 2) * 8*s;
      const py = -3*s + Math.cos(frame * 0.04 + i * 3) * 3*s;
      circle(ctx, px, py, s * 0.5, '#FFFFFF');
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // 雷鹰 — 圆润重绘
  function drawPetThunderEagle(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const fly = Math.sin(frame * 0.08) * 2 * s;
    ctx.translate(0, fly);

    // 身体
    ellipse(ctx, 0, 0, 3.5*s, 3*s, '#DDAA33');
    ellipse(ctx, 0, 0.5*s, 2.5*s, 2*s, '#EEBB55');
    // 头
    ellipse(ctx, -3*s, -2.5*s, 2.5*s, 2.5*s, '#EEBB44');
    ellipse(ctx, -3*s, -2*s, 2*s, 1.8*s, '#FFCC66');
    // 喙
    ctx.fillStyle = '#FF8800';
    ctx.beginPath();
    ctx.moveTo(-5.5*s, -2.5*s); ctx.lineTo(-7*s, -2*s); ctx.lineTo(-5.5*s, -1.5*s);
    ctx.fill();
    // 眼
    circle(ctx, -4*s, -2.5*s, 0.8*s, '#FFFFFF');
    circle(ctx, -4.2*s, -2.5*s, 0.4*s, '#222200');
    // 翅膀（扇动动画，弧形）
    const wingUp = Math.sin(frame * 0.12) * 3 * s;
    ctx.fillStyle = '#CCAA22';
    ctx.beginPath();
    ctx.moveTo(-2*s, -1*s);
    ctx.bezierCurveTo(-5*s, -4*s + wingUp, -8*s, -3*s + wingUp * 0.7, -9*s, -1*s + wingUp * 0.5);
    ctx.lineTo(-2*s, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2*s, -1*s);
    ctx.bezierCurveTo(5*s, -4*s + wingUp, 8*s, -3*s + wingUp * 0.7, 9*s, -1*s + wingUp * 0.5);
    ctx.lineTo(2*s, 0);
    ctx.fill();
    // 尾羽
    ctx.fillStyle = '#DDAA33';
    ctx.beginPath();
    ctx.moveTo(s, 2*s); ctx.lineTo(3*s, 5*s); ctx.lineTo(0, 5*s); ctx.lineTo(-s, 3*s);
    ctx.fill();
    // 脚爪
    ctx.strokeStyle = '#886622'; ctx.lineWidth = s * 0.8; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s, 3*s); ctx.lineTo(-2*s, 5*s);
    ctx.moveTo(-s, 3*s); ctx.lineTo(-s, 5.5*s);
    ctx.moveTo(s, 3*s); ctx.lineTo(2*s, 5*s);
    ctx.moveTo(s, 3*s); ctx.lineTo(s, 5.5*s);
    ctx.stroke();
    // 雷电
    if (Math.floor(frame / 8) % 3 === 0) {
      ctx.strokeStyle = '#FFFF44'; ctx.lineWidth = s * 0.8;
      ctx.beginPath();
      ctx.moveTo(-4*s, -4*s + wingUp); ctx.lineTo(-5*s, -7*s);
      ctx.lineTo(-4*s, -6*s); ctx.lineTo(-6*s, -9*s);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 暗影蛇 — 圆润重绘
  function drawPetShadowSerpent(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const slither = Math.sin(frame * 0.08);

    // 暗色蛇身（用圆串珠）
    for (let i = 0; i < 10; i++) {
      const t = i / 9;
      const bx = t * 20 * s;
      const by = Math.sin(slither + i * 0.7) * 2 * s;
      const r = (2 - Math.abs(t - 0.2) * 1.2) * s;
      circle(ctx, bx, by, r, '#553388');
      circle(ctx, bx, by - r * 0.3, r * 0.5, '#7755AA');
    }
    // 暗影光效
    ctx.globalAlpha = 0.15;
    for (let i = 0; i < 10; i++) {
      const bx = (i / 9) * 20 * s;
      const by = Math.sin(slither + i * 0.7) * 2 * s;
      ctx.shadowColor = '#9944DD'; ctx.shadowBlur = 6;
      circle(ctx, bx, by, 1.5*s, '#7744BB');
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    // 头
    ellipse(ctx, -2*s, 0, 3*s, 2.5*s, '#553388');
    ellipse(ctx, -2*s, 0.3*s, 2.2*s, 1.8*s, '#6644AA');
    // 眼（紫色发光）
    circle(ctx, -3.5*s, -0.8*s, 0.8*s, '#FF00FF');
    ctx.globalAlpha = 0.4;
    ctx.shadowColor = '#FF00FF'; ctx.shadowBlur = 8;
    circle(ctx, -3.5*s, -0.8*s, 1.2*s, '#FF00FF');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    circle(ctx, -3.5*s, -1.1*s, 0.3*s, '#FF99FF');
    // 舌头
    if (Math.floor(frame / 12) % 2 === 0) {
      ctx.strokeStyle = '#CC44CC'; ctx.lineWidth = s * 0.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-4.5*s, 0);
      ctx.lineTo(-6*s, -s); ctx.moveTo(-4.5*s, 0); ctx.lineTo(-6*s, s);
      ctx.stroke();
    }
    // 暗影粒子
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const px = 2*s + Math.sin(frame * 0.04 + i) * 10*s;
      const py = -s + Math.cos(frame * 0.05 + i * 2) * 3*s;
      circle(ctx, px, py, s * 0.6, '#9944DD');
    }
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  // 凤凰 — 圆润重绘
  function drawPetPhoenix(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const fly = Math.sin(frame * 0.05) * 2 * s;
    ctx.translate(0, fly);

    // 身体
    ellipse(ctx, 0, 0, 4.5*s, 3.5*s, '#FF4422');
    ellipse(ctx, 0, 0.5*s, 3.5*s, 2.5*s, '#FF6644');
    ellipse(ctx, 0, 1*s, 2.5*s, 1.5*s, '#FF8866'); // 腹部
    // 头
    ellipse(ctx, -4*s, -3.5*s, 3*s, 3*s, '#FF6644');
    ellipse(ctx, -4*s, -3*s, 2.5*s, 2.2*s, '#FF8866');
    // 冠（华丽凤冠）
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-4.5*s, -6*s); ctx.lineTo(-3.5*s, -9*s); ctx.lineTo(-3*s, -6*s);
    ctx.fill();
    ctx.fillStyle = '#FFEE44';
    ctx.beginPath();
    ctx.moveTo(-3.5*s, -6.5*s); ctx.lineTo(-2.5*s, -10*s); ctx.lineTo(-2*s, -6.5*s);
    ctx.fill();
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-2.5*s, -6*s); ctx.lineTo(-1.5*s, -8.5*s); ctx.lineTo(-1*s, -6*s);
    ctx.fill();
    // 冠上宝珠
    circle(ctx, -3*s, -10*s, 0.8*s, '#FFEE44');
    circle(ctx, -3*s, -10.3*s, 0.4*s, '#FFFFF0');
    // 眼
    circle(ctx, -5*s, -3.5*s, 1*s, '#FFFFFF');
    circle(ctx, -5.2*s, -3.5*s, 0.4*s, '#110000');
    // 喙
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath();
    ctx.moveTo(-6.5*s, -3*s); ctx.lineTo(-8*s, -2.5*s); ctx.lineTo(-6.5*s, -2*s);
    ctx.fill();
    // 翅膀（华丽展翅，弧形）
    const wingSpread = Math.sin(frame * 0.1) * 2 * s;
    // 左翼
    ctx.fillStyle = '#FF3311';
    ctx.beginPath();
    ctx.moveTo(-2*s, -2*s);
    ctx.bezierCurveTo(-7*s, -5*s + wingSpread, -10*s, -4*s + wingSpread * 0.7, -12*s, -2*s);
    ctx.lineTo(-2*s, -1*s);
    ctx.fill();
    // 翼尖（金色）
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath();
    ctx.moveTo(-10*s, -3*s + wingSpread * 0.7);
    ctx.lineTo(-13*s, -2*s + wingSpread * 0.5);
    ctx.lineTo(-11*s, -1*s);
    ctx.fill();
    // 右翼
    ctx.fillStyle = '#FF3311';
    ctx.beginPath();
    ctx.moveTo(3*s, -2*s);
    ctx.bezierCurveTo(7*s, -5*s + wingSpread, 10*s, -4*s + wingSpread * 0.7, 12*s, -2*s);
    ctx.lineTo(3*s, -1*s);
    ctx.fill();
    ctx.fillStyle = '#FFAA00';
    ctx.beginPath();
    ctx.moveTo(10*s, -3*s + wingSpread * 0.7);
    ctx.lineTo(13*s, -2*s + wingSpread * 0.5);
    ctx.lineTo(11*s, -1*s);
    ctx.fill();
    // 尾羽（长长的多彩羽毛）
    const tailWave = Math.sin(frame * 0.06);
    const tailColors = ['#FF4400', '#FFD700', '#FF8800', '#FF4400', '#FFAA00'];
    for (let i = 0; i < tailColors.length; i++) {
      ctx.strokeStyle = tailColors[i];
      ctx.lineWidth = s * (1.5 - i * 0.15);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s + i * 0.5 * s, 3*s);
      ctx.bezierCurveTo(
        4*s + i*s, 7*s + tailWave * (3 + i) * s,
        3*s + i * 0.5*s, 11*s + i*s,
        2*s + i*s, 14*s + i*s
      );
      ctx.stroke();
      // 羽毛末端圆珠
      circle(ctx, 2*s + i*s, 14*s + i*s, s * 0.6, tailColors[i]);
    }
    // 火焰光效
    ctx.globalAlpha = 0.15 + Math.sin(frame * 0.1) * 0.1;
    ctx.shadowColor = '#FF4400'; ctx.shadowBlur = 14;
    ellipse(ctx, 0, 0, 6*s, 4*s, '#FF6644');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    // 涅槃粒子
    for (let i = 0; i < 4; i++) {
      const px = -5*s + Math.sin(frame * 0.03 + i * 2.5) * 12*s;
      const py = -5*s + Math.cos(frame * 0.04 + i * 1.7) * 6*s;
      ctx.globalAlpha = 0.4 + Math.sin(frame * 0.08 + i) * 0.3;
      circle(ctx, px, py, s * 0.7, i % 2 === 0 ? '#FFD700' : '#FF4400');
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
  // 坐骑
  // ================================================================
  function drawMountCrane(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const glide = Math.sin(frame * 0.04) * 2 * s;
    ctx.translate(0, glide);
    // 身体
    ellipse(ctx, 0, 0, 7*s, 4*s, '#FFFFFF');
    ellipse(ctx, 0, 0.5*s, 6*s, 3*s, '#F5F5F5');
    // 颈部（优雅的S曲线）
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = s * 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5*s, -2*s);
    ctx.bezierCurveTo(-7*s, -5*s, -6*s, -9*s, -5*s, -11*s);
    ctx.stroke();
    // 头
    ellipse(ctx, -5*s, -12*s, 2.5*s, 2*s, '#FFFFFF');
    // 冠（红顶）
    circle(ctx, -5*s, -13.5*s, 1.2*s, '#FF2222');
    // 喙
    ctx.fillStyle = '#FF8800';
    ctx.beginPath();
    ctx.moveTo(-7*s, -12*s); ctx.lineTo(-9*s, -11.5*s); ctx.lineTo(-7*s, -11*s);
    ctx.fill();
    // 眼
    circle(ctx, -6*s, -12*s, 0.5*s, '#111111');
    // 翅膀
    const wingFlap = Math.sin(frame * 0.06) * 3 * s;
    ctx.fillStyle = '#EEEEEE';
    ctx.beginPath();
    ctx.moveTo(-3*s, -1*s);
    ctx.bezierCurveTo(-8*s, -5*s + wingFlap, -12*s, -3*s + wingFlap, -14*s, 0 + wingFlap * 0.5);
    ctx.lineTo(-3*s, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3*s, -1*s);
    ctx.bezierCurveTo(8*s, -5*s + wingFlap, 12*s, -3*s + wingFlap, 14*s, 0 + wingFlap * 0.5);
    ctx.lineTo(3*s, 0);
    ctx.fill();
    // 翼尖黑色
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.moveTo(-12*s, -1*s + wingFlap * 0.5); ctx.lineTo(-15*s, 0 + wingFlap * 0.3); ctx.lineTo(-13*s, 1*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12*s, -1*s + wingFlap * 0.5); ctx.lineTo(15*s, 0 + wingFlap * 0.3); ctx.lineTo(13*s, 1*s);
    ctx.fill();
    // 尾羽
    ctx.fillStyle = '#222222';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(5*s + i*s, 0);
      ctx.bezierCurveTo(8*s + i*s, 3*s, 7*s + i*2*s, 6*s, 6*s + i*2*s, 8*s);
      ctx.lineTo(5*s + i*s, 1*s);
      ctx.fill();
    }
    // 腿
    ctx.strokeStyle = '#888888'; ctx.lineWidth = s * 0.8;
    ctx.beginPath();
    ctx.moveTo(-2*s, 4*s); ctx.lineTo(-2*s, 8*s);
    ctx.moveTo(2*s, 4*s); ctx.lineTo(2*s, 8*s);
    ctx.stroke();

    ctx.restore();
  }

  function drawMountQilin(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const trot = Math.sin(frame * 0.08) * s;

    // 身体（威严麒麟）
    ellipse(ctx, 0, 0, 8*s, 5*s, '#CC8800');
    ellipse(ctx, 0, 0.5*s, 7*s, 4*s, '#DDAA33');
    // 鳞片纹理
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        ellipse(ctx, -4*s + i * 2*s, -2*s + j * 2*s, 1.2*s, 0.8*s, '#AA7700');
      }
    }
    ctx.globalAlpha = 1;
    // 头
    ellipse(ctx, -7*s, -4*s, 4*s, 3.5*s, '#DDAA33');
    ellipse(ctx, -7*s, -3.5*s, 3*s, 2.5*s, '#EEBB55');
    // 角（双角闪光）
    const hornGlow = 0.7 + Math.sin(frame * 0.06) * 0.3;
    ctx.globalAlpha = hornGlow;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(-6.5*s, -7*s); ctx.lineTo(-5.5*s, -11*s); ctx.lineTo(-5*s, -7*s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-4.5*s, -7*s); ctx.lineTo(-3.5*s, -11*s); ctx.lineTo(-3*s, -7*s);
    ctx.fill();
    ctx.globalAlpha = 1;
    // 鬃毛（火焰）
    const flameOff = Math.sin(frame * 0.12) * s;
    for (let i = 0; i < 4; i++) {
      const mh = (2.5 + Math.sin(frame * 0.1 + i)) * s;
      const mx = -4*s + i * 2.5*s;
      ellipse(ctx, mx, -4*s + flameOff - mh/2, s, mh, i % 2 === 0 ? '#FF4400' : '#FF6600');
    }
    // 眼（红色发光）
    ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 4;
    circle(ctx, -8.5*s, -4*s, 1*s, '#FF0000');
    circle(ctx, -8.5*s, -4.3*s, 0.4*s, '#FFAAAA');
    ctx.shadowBlur = 0;
    // 嘴
    ellipse(ctx, -10.5*s, -3*s, 2*s, 1.2*s, '#CCAA44');
    // 腿（有蹄）
    const legs = [[-4*s, trot], [-1*s, -trot], [2*s, trot], [4.5*s, -trot]];
    legs.forEach(([lx, ly]) => {
      roundRect(ctx, lx - s, 4*s + ly, 2*s, 4*s, s * 0.5, '#CC8800');
      circle(ctx, lx, 8.5*s + ly, 1.2*s, '#886600');
    });
    // 蹄火
    ctx.globalAlpha = 0.5 + Math.sin(frame * 0.1) * 0.3;
    legs.forEach(([lx, ly]) => {
      circle(ctx, lx, 9*s + ly, 1.5*s, '#FF6600');
      circle(ctx, lx, 9.5*s + ly, 1*s, '#FFAA00');
    });
    ctx.globalAlpha = 1;
    // 尾巴（火焰尾）
    const tailW = Math.sin(frame * 0.08) * s;
    ctx.strokeStyle = '#FF4400'; ctx.lineWidth = s * 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(7*s, -2*s);
    ctx.bezierCurveTo(10*s, -4*s + tailW, 12*s, -6*s, 11*s, -8*s);
    ctx.stroke();
    ctx.strokeStyle = '#FF6600'; ctx.lineWidth = s;
    ctx.beginPath();
    ctx.moveTo(7*s, -1*s);
    ctx.bezierCurveTo(10*s, -3*s + tailW, 12*s, -5*s, 11*s, -7*s);
    ctx.stroke();
    // 全身灵光
    ctx.globalAlpha = 0.06 + Math.sin(frame * 0.04) * 0.03;
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 15;
    ellipse(ctx, 0, 0, 10*s, 6*s, '#FFD700');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;

    ctx.restore();
  }

  // ================================================================
  // 怪物像素精灵 — 圆润重绘
  // ================================================================
  const monsterDrawers = {
    '灰毛妖鼠': (ctx, x, y, s, frame) => {
      // 小老鼠（圆润版）
      ellipse(ctx, 0, 0, 5*s, 3.5*s, '#888888');
      ellipse(ctx, 0, 0.5*s, 4*s, 2.5*s, '#AAAAAA');
      // 头
      ellipse(ctx, -3.5*s, -2*s, 3.5*s, 3*s, '#999999');
      ellipse(ctx, -3.5*s, -1.5*s, 2.5*s, 2*s, '#BBBBBB');
      // 耳朵
      ellipse(ctx, -5*s, -4.5*s, 2*s, 2.5*s, '#888888');
      ellipse(ctx, -5*s, -4.2*s, 1.2*s, 1.5*s, '#F8A0B0');
      ellipse(ctx, -2*s, -4.5*s, 2*s, 2.5*s, '#888888');
      ellipse(ctx, -2*s, -4.2*s, 1.2*s, 1.5*s, '#F8A0B0');
      // 眼
      circle(ctx, -4.5*s, -2*s, 1*s, '#FF0000');
      circle(ctx, -4.5*s, -2.3*s, 0.4*s, '#FFAAAA');
      circle(ctx, -2.5*s, -2*s, 1*s, '#FF0000');
      circle(ctx, -2.5*s, -2.3*s, 0.4*s, '#FFAAAA');
      // 鼻子
      circle(ctx, -3.5*s, -0.5*s, 0.6*s, '#FFA0A0');
      // 尾巴
      ctx.strokeStyle = '#888888'; ctx.lineWidth = s; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(4*s, 0);
      ctx.bezierCurveTo(7*s, -s, 9*s, -2*s, 8*s, -3*s);
      ctx.stroke();
      // 脚
      circle(ctx, -2*s, 3.5*s, 1*s, '#777777');
      circle(ctx, 2*s, 3.5*s, 1*s, '#777777');
    },

    '毒蟾蜍': (ctx, x, y, s, frame) => {
      const hop = Math.abs(Math.sin(frame * 0.08)) * 2 * s;
      ctx.translate(0, -hop);
      // 身体（大圆胖蟾蜍）
      ellipse(ctx, 0, 0, 6*s, 4.5*s, '#228B22');
      ellipse(ctx, 0, 1*s, 5*s, 3.5*s, '#90EE90');
      // 疣（毒蟾蜍特征）
      circle(ctx, -2*s, -2*s, 0.8*s, '#006400');
      circle(ctx, 2*s, -1*s, 0.6*s, '#006400');
      circle(ctx, -1*s, 1*s, 0.5*s, '#006400');
      // 眼（凸起的大眼）
      ellipse(ctx, -3*s, -4*s, 2.5*s, 2*s, '#228B22');
      circle(ctx, -3*s, -4.5*s, 1.5*s, '#FFFF00');
      circle(ctx, -3.3*s, -4.5*s, 0.6*s, '#111100');
      ellipse(ctx, 3*s, -4*s, 2.5*s, 2*s, '#228B22');
      circle(ctx, 3*s, -4.5*s, 1.5*s, '#FFFF00');
      circle(ctx, 2.7*s, -4.5*s, 0.6*s, '#111100');
      // 嘴
      ctx.strokeStyle = '#006400'; ctx.lineWidth = s * 0.5;
      ctx.beginPath();
      ctx.arc(0, -0.5*s, 3*s, 0.1, Math.PI - 0.1);
      ctx.stroke();
      // 腿
      ellipse(ctx, -5*s, 3*s, 2.5*s, 1.5*s, '#228B22');
      ellipse(ctx, 5*s, 3*s, 2.5*s, 1.5*s, '#228B22');
      // 毒液滴
      if (Math.floor(frame / 20) % 3 === 0) {
        ctx.globalAlpha = 0.5;
        circle(ctx, Math.sin(frame * 0.1) * 3*s, 5*s, s * 0.5, '#44FF44');
        ctx.globalAlpha = 1;
      }
    },

    '赤狐妖': (ctx, x, y, s, frame) => {
      // 身体（优雅的狐狸）
      ellipse(ctx, 0, 0, 6*s, 3.5*s, '#D2691E');
      ellipse(ctx, 0, 0.5*s, 5*s, 2.5*s, '#F4A460');
      ellipse(ctx, 0, 1*s, 3*s, 1.5*s, '#FFF8DC'); // 白肚子
      // 头
      ellipse(ctx, -5*s, -3*s, 4*s, 3.5*s, '#D2691E');
      ellipse(ctx, -5*s, -2.5*s, 3*s, 2.5*s, '#F4A460');
      // 嘴（尖狐嘴）
      ellipse(ctx, -8.5*s, -2*s, 2*s, 1.2*s, '#F4A460');
      circle(ctx, -10*s, -2*s, 0.5*s, '#111111'); // 鼻子
      // 耳朵（尖三角）
      ctx.fillStyle = '#D2691E';
      ctx.beginPath();
      ctx.moveTo(-7*s, -5.5*s); ctx.lineTo(-6*s, -9*s); ctx.lineTo(-5*s, -5.5*s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-4*s, -5.5*s); ctx.lineTo(-3*s, -9*s); ctx.lineTo(-2*s, -5.5*s);
      ctx.fill();
      ctx.fillStyle = '#111111';
      ctx.beginPath();
      ctx.moveTo(-6.5*s, -6*s); ctx.lineTo(-6*s, -7.5*s); ctx.lineTo(-5.5*s, -6*s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-3.5*s, -6*s); ctx.lineTo(-3*s, -7.5*s); ctx.lineTo(-2.5*s, -6*s);
      ctx.fill();
      // 眼（金色狡猾眼）
      ellipse(ctx, -6.5*s, -3*s, 1.2*s, 1*s, '#FFD700');
      ellipse(ctx, -6.5*s, -3*s, 0.4*s, 0.8*s, '#111100');
      ellipse(ctx, -3.5*s, -3*s, 1.2*s, 1*s, '#FFD700');
      ellipse(ctx, -3.5*s, -3*s, 0.4*s, 0.8*s, '#111100');
      // 尾巴（蓬松大尾）
      const tailWag = Math.sin(frame * 0.08) * 2 * s;
      ctx.fillStyle = '#D2691E';
      ctx.beginPath();
      ctx.moveTo(5*s, -1*s);
      ctx.bezierCurveTo(8*s, -3*s + tailWag, 11*s, -6*s, 10*s, -8*s);
      ctx.bezierCurveTo(9*s, -7*s, 7*s, -5*s + tailWag, 5*s, -2*s);
      ctx.fill();
      // 尾尖白色
      circle(ctx, 10*s, -8*s, 1.5*s, '#FFF8DC');
      // 脚
      circle(ctx, -3*s, 3.5*s, 1.2*s, '#8B4513');
      circle(ctx, 0, 4*s, 1.2*s, '#8B4513');
      circle(ctx, 3*s, 3.5*s, 1.2*s, '#8B4513');
    },

    '铁甲傀儡': (ctx, x, y, s, frame) => {
      // 大石头人（圆润版）
      ellipse(ctx, 0, 0, 7*s, 8*s, '#808080');
      ellipse(ctx, 0, 0, 6*s, 7*s, '#A0A0A0');
      // 裂纹
      ctx.strokeStyle = '#606060'; ctx.lineWidth = s * 0.5;
      ctx.beginPath();
      ctx.moveTo(-2*s, -5*s); ctx.lineTo(-1*s, -2*s); ctx.lineTo(-3*s, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2*s, -3*s); ctx.lineTo(3*s, 0);
      ctx.stroke();
      // 眼（发光）
      ctx.globalAlpha = 0.7 + Math.sin(frame * 0.05) * 0.3;
      circle(ctx, -3*s, -4*s, 1.5*s, '#FF4400');
      circle(ctx, -3*s, -4.3*s, 0.5*s, '#FFAA00');
      circle(ctx, 3*s, -4*s, 1.5*s, '#FF4400');
      circle(ctx, 3*s, -4.3*s, 0.5*s, '#FFAA00');
      ctx.globalAlpha = 1;
      // 手臂（圆）
      ellipse(ctx, -8*s, -1*s, 2.5*s, 5*s, '#808080');
      ellipse(ctx, 8*s, -1*s, 2.5*s, 5*s, '#808080');
      // 拳头
      circle(ctx, -8*s, 4*s, 2*s, '#707070');
      circle(ctx, 8*s, 4*s, 2*s, '#707070');
      // 腿
      roundRect(ctx, -4*s, 7*s, 3*s, 4*s, s, '#808080');
      roundRect(ctx, 2*s, 7*s, 3*s, 4*s, s, '#808080');
    },

    '墨蛟蛇': (ctx, x, y, s, frame) => {
      const slith = frame * 0.08;
      // 蛇身（串珠式）
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const bx = (5 - i) * 2.5 * s;
        const by = Math.sin(slith + i) * 2.5 * s;
        const r = (2.5 - Math.abs(t - 0.3) * 1.5) * s;
        circle(ctx, bx, by, r, '#6B2D8B');
        circle(ctx, bx, by - r * 0.3, r * 0.5, '#9B5DBB');
      }
      // 头
      const headY = Math.sin(slith) * 2 * s;
      ellipse(ctx, -8*s, headY, 3*s, 2.5*s, '#6B2D8B');
      ellipse(ctx, -8*s, headY + 0.5*s, 2*s, 1.5*s, '#8B4DAB');
      // 眼
      circle(ctx, -9.5*s, headY - 0.5*s, 0.8*s, '#FF0000');
      circle(ctx, -9.5*s, headY - 0.8*s, 0.3*s, '#FFAAAA');
      // 牙
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-10*s, headY + s); ctx.lineTo(-10.5*s, headY + 2.5*s); ctx.lineTo(-9.5*s, headY + s);
      ctx.fill();
    },

    '暴猿妖': (ctx, x, y, s, frame) => {
      const breathe = Math.sin(frame * 0.06) * s;
      // 身体（壮硕圆润）
      ellipse(ctx, 0, 0, 7*s, 7*s, '#4A2A0A');
      ellipse(ctx, 0, 0, 6*s, 6*s, '#6B3A1A');
      // 胸肌
      ellipse(ctx, 0, -1*s, 4*s, 3*s, '#8B5A2A');
      // 头
      ellipse(ctx, 0, -7*s, 5*s, 4*s, '#4A2A0A');
      ellipse(ctx, 0, -6.5*s, 4*s, 3*s, '#6B3A1A');
      // 眼（红色怒目）
      circle(ctx, -2.5*s, -7*s, 1.2*s, '#FF0000');
      circle(ctx, -2.5*s, -7.3*s, 0.4*s, '#FFAAAA');
      circle(ctx, 2.5*s, -7*s, 1.2*s, '#FF0000');
      circle(ctx, 2.5*s, -7.3*s, 0.4*s, '#FFAAAA');
      // 嘴（獠牙）
      ctx.fillStyle = '#8B5A2A';
      ctx.beginPath();
      ctx.arc(0, -4.5*s, 2.5*s, 0.3, Math.PI - 0.3);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-1.5*s, -4*s); ctx.lineTo(-1.2*s, -3*s); ctx.lineTo(-0.8*s, -4*s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.8*s, -4*s); ctx.lineTo(1.2*s, -3*s); ctx.lineTo(1.5*s, -4*s);
      ctx.fill();
      // 手臂（巨大）
      ellipse(ctx, -8*s, -2*s + breathe, 3*s, 6*s, '#4A2A0A');
      ellipse(ctx, 8*s, -2*s - breathe, 3*s, 6*s, '#4A2A0A');
      circle(ctx, -9*s, 4*s + breathe, 2.5*s, '#3A1A00');
      circle(ctx, 9*s, 4*s - breathe, 2.5*s, '#3A1A00');
      // 腿
      roundRect(ctx, -4*s, 6*s, 3.5*s, 4*s, s, '#4A2A0A');
      roundRect(ctx, 1.5*s, 6*s, 3.5*s, 4*s, s, '#4A2A0A');
    },

    '冰魄蜘蛛': (ctx, x, y, s, frame) => {
      // 圆腹蜘蛛
      ellipse(ctx, 0, 0, 5.5*s, 4.5*s, '#88BBDD');
      ellipse(ctx, 0, 0.5*s, 4.5*s, 3.5*s, '#AADDEE');
      // 花纹（冰晶图案）
      ctx.globalAlpha = 0.3;
      circle(ctx, 0, -1*s, 1.5*s, '#FFFFFF');
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = s * 0.3;
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ctx.beginPath();
        ctx.moveTo(0, -1*s);
        ctx.lineTo(Math.cos(a) * 2*s, -1*s + Math.sin(a) * 2*s);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // 头
      ellipse(ctx, -4*s, -2.5*s, 3*s, 2.5*s, '#99CCDD');
      // 8眼
      const eyePositions = [[-5*s, -3.5*s], [-4.5*s, -4*s], [-3.5*s, -4*s], [-3*s, -3.5*s]];
      eyePositions.forEach(([ex, ey]) => {
        circle(ctx, ex, ey, 0.5*s, '#00CCFF');
      });
      // 8腿（弧线）
      const legAnim = Math.sin(frame * 0.1);
      ctx.strokeStyle = '#88BBDD'; ctx.lineWidth = s * 0.8; ctx.lineCap = 'round';
      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < 4; i++) {
          const base = (i - 1.5) * 2.5 * s;
          const bend = legAnim * s * (i % 2 ? 1 : -1);
          ctx.beginPath();
          ctx.moveTo(base, side * 4*s);
          ctx.bezierCurveTo(base + side * 4*s, side * 6*s + bend, base + side * 6*s, side * 5*s, base + side * 7*s, side * 7*s);
          ctx.stroke();
        }
      }
      // 冰晶
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 3; i++) {
        const px = Math.sin(frame * 0.04 + i * 2) * 5*s;
        const py = Math.cos(frame * 0.05 + i * 3) * 3*s;
        circle(ctx, px, py, s * 0.5, '#FFFFFF');
      }
      ctx.globalAlpha = 1;
    },

    '鬼影修士': (ctx, x, y, s, frame) => {
      const hover = Math.sin(frame * 0.06) * 2 * s;
      ctx.translate(0, hover);
      ctx.globalAlpha = 0.6 + Math.sin(frame * 0.04) * 0.15;
      // 身体（飘逸的幽灵形态）
      ellipse(ctx, 0, -2*s, 5*s, 6*s, '#667788');
      ellipse(ctx, 0, -1*s, 4*s, 5*s, '#88AACC');
      // 下摆飘逸（波浪状）
      ctx.fillStyle = '#667788';
      ctx.beginPath();
      ctx.moveTo(-5*s, 3*s);
      for (let i = 0; i <= 10; i++) {
        ctx.lineTo(-5*s + i*s, 4*s + Math.sin(frame*0.08 + i*0.8)*1.5*s);
      }
      ctx.lineTo(5*s, 0); ctx.lineTo(-5*s, 0);
      ctx.fill();
      // 眼（空洞）
      circle(ctx, -2*s, -4*s, 1.5*s, '#000000');
      circle(ctx, 2*s, -4*s, 1.5*s, '#000000');
      circle(ctx, -2*s, -4.5*s, 0.5*s, '#4444FF');
      circle(ctx, 2*s, -4.5*s, 0.5*s, '#4444FF');
      // 嘴（哀嚎状）
      ellipse(ctx, 0, -1.5*s, 2*s, 1.5*s, '#000000');
      ctx.globalAlpha = 1;
    },

    '三眼火鸦': (ctx, x, y, s, frame) => {
      const slith = frame * 0.06;
      // 蟒蛇身体（大型串珠）
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        const bx = (7 - i) * 2.5 * s;
        const by = Math.sin(slith + i * 0.6) * 3 * s;
        const r = (3.5 - Math.abs(t - 0.3) * 2) * s;
        circle(ctx, bx, by, r, '#228855');
        circle(ctx, bx, by - r * 0.3, r * 0.5, '#44AA77');
        // 鳞片
        if (i % 2 === 0) {
          ctx.globalAlpha = 0.3;
          circle(ctx, bx, by + r * 0.3, r * 0.3, '#116633');
          ctx.globalAlpha = 1;
        }
      }
      // 头
      const headY = Math.sin(slith) * 3 * s;
      ellipse(ctx, -10*s, headY, 4*s, 3*s, '#228855');
      ellipse(ctx, -10*s, headY + s, 3*s, 2*s, '#44AA77');
      // 眼
      circle(ctx, -12*s, headY - s, 1*s, '#FFFF00');
      circle(ctx, -12*s, headY - s, 0.4*s, '#111100');
      // 舌头
      if (Math.floor(frame / 12) % 2 === 0) {
        ctx.strokeStyle = '#FF4444'; ctx.lineWidth = s * 0.4; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-13*s, headY);
        ctx.lineTo(-15*s, headY - s); ctx.moveTo(-13*s, headY); ctx.lineTo(-15*s, headY + s);
        ctx.stroke();
      }
    },

    '豹形雷兽': (ctx, x, y, s, frame) => {
      const run = Math.sin(frame * 0.1) * s;
      // 身体（矫健）
      ellipse(ctx, 0, 0, 7*s, 4*s, '#CC3300');
      ellipse(ctx, 0, 0.5*s, 6*s, 3*s, '#FF5533');
      // 花纹
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 6; i++) {
        circle(ctx, -4*s + i * 1.8*s, -1*s + (i%2)*s, s, '#991100');
      }
      ctx.globalAlpha = 1;
      // 头
      ellipse(ctx, -6*s, -2.5*s, 3.5*s, 3*s, '#CC3300');
      ellipse(ctx, -6*s, -2*s, 2.5*s, 2*s, '#FF5533');
      // 耳朵
      ctx.fillStyle = '#CC3300';
      ctx.beginPath();
      ctx.moveTo(-7.5*s, -5*s); ctx.lineTo(-7*s, -7*s); ctx.lineTo(-6*s, -5*s); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-5*s, -5*s); ctx.lineTo(-4.5*s, -7*s); ctx.lineTo(-3.5*s, -5*s); ctx.fill();
      // 眼（凶猛）
      circle(ctx, -7.5*s, -2.5*s, 1*s, '#FFFF00');
      ellipse(ctx, -7.5*s, -2.5*s, 0.3*s, 0.8*s, '#111100');
      circle(ctx, -4.5*s, -2.5*s, 1*s, '#FFFF00');
      ellipse(ctx, -4.5*s, -2.5*s, 0.3*s, 0.8*s, '#111100');
      // 腿
      const legOffsets = [[-4*s, run], [-1*s, -run], [2*s, run], [4.5*s, -run]];
      legOffsets.forEach(([lx, ly]) => {
        roundRect(ctx, lx - s, 3*s + ly, 2*s, 3*s, s * 0.5, '#AA2200');
        circle(ctx, lx, 6.5*s + ly, 1*s, '#882200');
      });
      // 火焰尾
      ctx.strokeStyle = '#FF4400'; ctx.lineWidth = s * 1.5; ctx.lineCap = 'round';
      const tw = Math.sin(frame * 0.1) * 2*s;
      ctx.beginPath();
      ctx.moveTo(6*s, -1*s);
      ctx.bezierCurveTo(9*s, -3*s + tw, 11*s, -5*s, 10*s, -7*s);
      ctx.stroke();
      circle(ctx, 10*s, -7*s, 1.5*s, '#FF8800');
    },

    '天魔老祖': (ctx, x, y, s, frame) => {
      const stomp = Math.abs(Math.sin(frame * 0.05)) * s;
      ctx.translate(0, stomp);
      // 身体
      ellipse(ctx, 0, 0, 8*s, 9*s, '#666666');
      ellipse(ctx, 0, 0, 7*s, 8*s, '#888888');
      // 岩石纹理
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 5; i++) {
        const rx = -3*s + Math.sin(i * 3.7) * 5*s;
        const ry = -5*s + Math.cos(i * 2.3) * 7*s;
        circle(ctx, rx, ry, (1 + Math.sin(i)) * s, '#555555');
      }
      ctx.globalAlpha = 1;
      // 发光裂纹
      ctx.strokeStyle = '#FF6600'; ctx.lineWidth = s * 0.6;
      ctx.globalAlpha = 0.5 + Math.sin(frame * 0.04) * 0.3;
      ctx.beginPath();
      ctx.moveTo(-2*s, -6*s); ctx.lineTo(-1*s, -3*s); ctx.lineTo(-3*s, 0); ctx.lineTo(-1*s, 3*s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(1*s, -5*s); ctx.lineTo(3*s, -1*s); ctx.lineTo(2*s, 2*s);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // 眼
      circle(ctx, -3*s, -5*s, 1.5*s, '#FF4400');
      circle(ctx, 3*s, -5*s, 1.5*s, '#FF4400');
      // 手臂
      ellipse(ctx, -10*s, 0, 3*s, 7*s, '#777777');
      ellipse(ctx, 10*s, 0, 3*s, 7*s, '#777777');
      circle(ctx, -10*s, 7*s, 2.5*s, '#666666');
      circle(ctx, 10*s, 7*s, 2.5*s, '#666666');
      // 腿
      roundRect(ctx, -5*s, 8*s, 4*s, 4*s, s, '#666666');
      roundRect(ctx, 2*s, 8*s, 4*s, 4*s, s, '#666666');
    },

    '九尾天狐': (ctx, x, y, s, frame) => {
      const sway = Math.sin(frame * 0.05) * s;
      // 华丽九尾狐
      // 尾巴先画（多条蓬松大尾）
      const tailColors = ['#FFD700', '#FF8844', '#FF6622', '#FFD700', '#FF8844'];
      for (let i = 0; i < 5; i++) {
        const tw = Math.sin(frame * 0.04 + i * 0.8) * 3 * s;
        ctx.fillStyle = tailColors[i];
        ctx.beginPath();
        ctx.moveTo(5*s, -1*s + i*s);
        ctx.bezierCurveTo(10*s, -4*s + tw + i*2*s, 14*s, -8*s + i*3*s, 12*s + i*s, -10*s + i*2*s);
        ctx.bezierCurveTo(11*s + i*s, -9*s + i*2*s, 9*s, -5*s + tw + i*2*s, 5*s, 0 + i*s);
        ctx.fill();
        circle(ctx, 12*s + i*s, -10*s + i*2*s, s, '#FFFFCC');
      }
      // 身体（人形妖狐）
      ellipse(ctx, 0, 0 + sway, 5*s, 6*s, '#FF8844');
      ellipse(ctx, 0, 0.5*s + sway, 4*s, 5*s, '#FFAA66');
      // 华丽衣服
      ellipse(ctx, 0, 1*s + sway, 3*s, 3.5*s, '#FFD700');
      // 头
      ellipse(ctx, 0, -6*s + sway, 4*s, 3.5*s, '#FFAA66');
      ellipse(ctx, 0, -5.5*s + sway, 3*s, 2.5*s, '#FFCC88');
      // 耳朵（狐耳）
      ctx.fillStyle = '#FF8844';
      ctx.beginPath();
      ctx.moveTo(-3*s, -8*s + sway); ctx.lineTo(-2*s, -12*s + sway); ctx.lineTo(-1*s, -8*s + sway); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1*s, -8*s + sway); ctx.lineTo(2*s, -12*s + sway); ctx.lineTo(3*s, -8*s + sway); ctx.fill();
      ctx.fillStyle = '#FFCC88';
      ctx.beginPath();
      ctx.moveTo(-2.5*s, -8.5*s + sway); ctx.lineTo(-2*s, -10.5*s + sway); ctx.lineTo(-1.5*s, -8.5*s + sway); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(1.5*s, -8.5*s + sway); ctx.lineTo(2*s, -10.5*s + sway); ctx.lineTo(2.5*s, -8.5*s + sway); ctx.fill();
      // 眼（妩媚）
      ellipse(ctx, -1.5*s, -6*s + sway, 1*s, 0.8*s, '#FF44AA');
      circle(ctx, -1.5*s, -6.2*s + sway, 0.3*s, '#FFFFFF');
      ellipse(ctx, 1.5*s, -6*s + sway, 1*s, 0.8*s, '#FF44AA');
      circle(ctx, 1.5*s, -6.2*s + sway, 0.3*s, '#FFFFFF');
    },

    '劫雷真龙': (ctx, x, y, s, frame) => {
      const slith = frame * 0.05;
      // 大型蛟龙
      for (let i = 0; i < 12; i++) {
        const t = i / 11;
        const bx = (8 - i) * 2.5 * s;
        const by = Math.sin(slith + i * 0.5) * 3 * s;
        const r = (3.5 - Math.abs(t - 0.3) * 2.5) * s;
        circle(ctx, bx, by, r, '#334488');
        circle(ctx, bx, by - r * 0.3, r * 0.5, '#4466AA');
      }
      // 头
      const headY = Math.sin(slith) * 3 * s;
      ellipse(ctx, -14*s, headY, 4.5*s, 3.5*s, '#334488');
      ellipse(ctx, -14*s, headY + s, 3.5*s, 2.5*s, '#4466AA');
      // 角
      ctx.fillStyle = '#FFDD44';
      ctx.beginPath();
      ctx.moveTo(-13*s, headY - 3*s); ctx.lineTo(-12*s, headY - 7*s); ctx.lineTo(-11*s, headY - 3*s); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-11*s, headY - 3*s); ctx.lineTo(-10*s, headY - 7*s); ctx.lineTo(-9*s, headY - 3*s); ctx.fill();
      // 眼
      circle(ctx, -16*s, headY - s, 1.2*s, '#FFFF44');
      circle(ctx, -16*s, headY - 1.3*s, 0.4*s, '#FFFFCC');
      // 雷电
      if (Math.floor(frame / 6) % 3 === 0) {
        ctx.strokeStyle = '#FFFF44'; ctx.lineWidth = s;
        ctx.beginPath();
        const lx = Math.random() * 15 * s - 5*s;
        const ly = Math.sin(slith + lx * 0.01) * 3 * s;
        ctx.moveTo(lx, ly - 3*s); ctx.lineTo(lx + s, ly - 5*s);
        ctx.lineTo(lx - s, ly - 4*s); ctx.lineTo(lx + 2*s, ly - 7*s);
        ctx.stroke();
      }
    },
  };

  // 补充剩余怪物
  const monsterDrawersExtra = {
    '血魔宗主': (ctx, x, y, s, frame) => {
      const flap = Math.sin(frame * 0.12) * 3 * s;
      // 身体
      ellipse(ctx, 0, 0, 4*s, 5*s, '#660033');
      ellipse(ctx, 0, 0.5*s, 3*s, 4*s, '#882244');
      // 翅膀（巨大蝙蝠翼）
      ctx.fillStyle = '#550022';
      ctx.beginPath();
      ctx.moveTo(-3*s, -2*s);
      ctx.bezierCurveTo(-8*s, -6*s + flap, -14*s, -4*s + flap, -16*s, 0 + flap * 0.5);
      ctx.bezierCurveTo(-14*s, 2*s + flap * 0.3, -8*s, 2*s, -3*s, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(3*s, -2*s);
      ctx.bezierCurveTo(8*s, -6*s + flap, 14*s, -4*s + flap, 16*s, 0 + flap * 0.5);
      ctx.bezierCurveTo(14*s, 2*s + flap * 0.3, 8*s, 2*s, 3*s, 0);
      ctx.fill();
      // 翼膜纹理
      ctx.strokeStyle = '#440011'; ctx.lineWidth = s * 0.3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-3*s, -1*s);
        ctx.lineTo(-6*s - i*2.5*s, -3*s + flap + i*s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(3*s, -1*s);
        ctx.lineTo(6*s + i*2.5*s, -3*s + flap + i*s);
        ctx.stroke();
      }
      // 头
      ellipse(ctx, 0, -4.5*s, 3*s, 2.5*s, '#882244');
      // 耳
      ctx.fillStyle = '#660033';
      ctx.beginPath();
      ctx.moveTo(-2*s, -6*s); ctx.lineTo(-1.5*s, -9*s); ctx.lineTo(-0.5*s, -6*s); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.5*s, -6*s); ctx.lineTo(1.5*s, -9*s); ctx.lineTo(2*s, -6*s); ctx.fill();
      // 眼
      circle(ctx, -1.5*s, -5*s, 0.8*s, '#FF0000');
      circle(ctx, 1.5*s, -5*s, 0.8*s, '#FF0000');
      // 獠牙
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-0.8*s, -3*s); ctx.lineTo(-0.5*s, -1.5*s); ctx.lineTo(-0.2*s, -3*s); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0.2*s, -3*s); ctx.lineTo(0.5*s, -1.5*s); ctx.lineTo(0.8*s, -3*s); ctx.fill();
    },

    '血衣魔修': (ctx, x, y, s, frame) => {
      const sway = Math.sin(frame * 0.04) * s;
      ctx.translate(0, sway);
      // 身体（暗黑法师）
      ellipse(ctx, 0, 0, 5*s, 7*s, '#1A0A2E');
      ellipse(ctx, 0, 0, 4*s, 6*s, '#2A1A4E');
      // 长袍下摆
      ctx.fillStyle = '#1A0A2E';
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        ctx.lineTo(-4*s + i*s, 7*s + Math.sin(frame*0.06 + i*0.5)*s);
      }
      ctx.lineTo(4*s, 5*s); ctx.lineTo(-4*s, 5*s);
      ctx.fill();
      // 头（兜帽）
      ellipse(ctx, 0, -6.5*s, 4*s, 3.5*s, '#1A0A2E');
      // 面部（阴暗）
      ellipse(ctx, 0, -6*s, 3*s, 2.5*s, '#222222');
      // 眼（绿色幽光）
      ctx.globalAlpha = 0.7 + Math.sin(frame * 0.06) * 0.3;
      circle(ctx, -1.5*s, -6.5*s, 0.8*s, '#00FF44');
      circle(ctx, 1.5*s, -6.5*s, 0.8*s, '#00FF44');
      ctx.shadowColor = '#00FF44'; ctx.shadowBlur = 6;
      circle(ctx, -1.5*s, -6.5*s, 0.5*s, '#00FF44');
      circle(ctx, 1.5*s, -6.5*s, 0.5*s, '#00FF44');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      // 手（骷髅手）
      ellipse(ctx, -5*s, -1*s, 2*s, 1.5*s, '#3A2A5A');
      ellipse(ctx, 5*s, -1*s, 2*s, 1.5*s, '#3A2A5A');
      // 暗能量球
      ctx.globalAlpha = 0.4 + Math.sin(frame * 0.05) * 0.2;
      ctx.shadowColor = '#9900FF'; ctx.shadowBlur = 10;
      circle(ctx, -6*s, -2*s, 1.5*s, '#6600AA');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },

    '化龙妖蛟': (ctx, x, y, s, frame) => {
      const flap = Math.sin(frame * 0.06) * 4 * s;
      // 身体（巨鸟）
      ellipse(ctx, 0, 0, 6*s, 4*s, '#1A2A4A');
      ellipse(ctx, 0, 0.5*s, 5*s, 3*s, '#2A3A5A');
      // 头
      ellipse(ctx, -5*s, -3*s, 3.5*s, 3*s, '#2A3A5A');
      // 喙（巨型）
      ctx.fillStyle = '#CCAA00';
      ctx.beginPath();
      ctx.moveTo(-8*s, -3*s); ctx.lineTo(-12*s, -2*s); ctx.lineTo(-8*s, -1*s);
      ctx.fill();
      // 眼
      circle(ctx, -6.5*s, -3.5*s, 1.2*s, '#FFD700');
      circle(ctx, -6.5*s, -3.5*s, 0.5*s, '#111100');
      // 翅膀（巨大）
      ctx.fillStyle = '#1A2A4A';
      ctx.beginPath();
      ctx.moveTo(-3*s, -2*s);
      ctx.bezierCurveTo(-10*s, -8*s + flap, -16*s, -6*s + flap, -18*s, -2*s + flap * 0.5);
      ctx.lineTo(-3*s, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(4*s, -2*s);
      ctx.bezierCurveTo(10*s, -8*s + flap, 16*s, -6*s + flap, 18*s, -2*s + flap * 0.5);
      ctx.lineTo(4*s, 0);
      ctx.fill();
      // 尾羽
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = '#1A2A4A'; ctx.lineWidth = s * (1.5 - i * 0.3);
        ctx.beginPath();
        ctx.moveTo(4*s + i*s, 2*s);
        ctx.bezierCurveTo(8*s + i*2*s, 5*s, 7*s + i*2*s, 8*s, 6*s + i*3*s, 10*s);
        ctx.stroke();
      }
      // 雷气
      if (Math.floor(frame / 8) % 4 === 0) {
        ctx.strokeStyle = '#AABBFF'; ctx.lineWidth = s * 0.6;
        ctx.beginPath();
        ctx.moveTo(-10*s, -5*s + flap); ctx.lineTo(-12*s, -8*s);
        ctx.stroke();
      }
    },

    '混沌古兽': (ctx, x, y, s, frame) => {
      const slith = frame * 0.04;
      // 大型红色蛟龙
      for (let i = 0; i < 14; i++) {
        const t = i / 13;
        const bx = (10 - i) * 2.5 * s;
        const by = Math.sin(slith + i * 0.5) * 4 * s;
        const r = (4 - Math.abs(t - 0.25) * 3) * s;
        circle(ctx, bx, by, r, '#CC2200');
        circle(ctx, bx, by - r * 0.3, r * 0.4, '#FF4433');
        // 鳞片
        if (i % 2 === 0 && r > s) {
          ctx.globalAlpha = 0.2;
          circle(ctx, bx, by + r * 0.3, r * 0.3, '#881100');
          ctx.globalAlpha = 1;
        }
      }
      // 头
      const headY = Math.sin(slith) * 4 * s;
      ellipse(ctx, -16*s, headY, 5*s, 4*s, '#CC2200');
      ellipse(ctx, -16*s, headY + s, 4*s, 3*s, '#FF4433');
      // 角
      ctx.fillStyle = '#880000';
      ctx.beginPath();
      ctx.moveTo(-15*s, headY - 4*s); ctx.lineTo(-14*s, headY - 8*s); ctx.lineTo(-13*s, headY - 4*s); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-13*s, headY - 4*s); ctx.lineTo(-12*s, headY - 8*s); ctx.lineTo(-11*s, headY - 4*s); ctx.fill();
      // 眼
      ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 5;
      circle(ctx, -18*s, headY - s, 1.2*s, '#FF0000');
      circle(ctx, -18*s, headY - 1.3*s, 0.4*s, '#FFAAAA');
      ctx.shadowBlur = 0;
      // 火焰口
      if (Math.floor(frame / 15) % 3 === 0) {
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 3; i++) {
          circle(ctx, -20*s - i*2*s, headY + Math.sin(frame * 0.2 + i) * 2*s, (2 - i * 0.5)*s, '#FF6600');
        }
        ctx.globalAlpha = 1;
      }
    },

    '天道魔神': (ctx, x, y, s, frame) => {
      const pulse = Math.sin(frame * 0.04) * s;
      ctx.globalAlpha = 0.7 + Math.sin(frame * 0.03) * 0.2;
      // 暗影形态
      ellipse(ctx, 0, 0, 6*s + pulse, 8*s + pulse, '#110022');
      ellipse(ctx, 0, 0, 5*s + pulse, 7*s + pulse, '#220044');
      // 触手
      for (let i = 0; i < 6; i++) {
        const a = frame * 0.02 + i * Math.PI / 3;
        ctx.strokeStyle = '#330066'; ctx.lineWidth = s * (1.5 - i * 0.1);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 3*s, Math.sin(a) * 4*s);
        ctx.bezierCurveTo(
          Math.cos(a) * 8*s, Math.sin(a) * 10*s,
          Math.cos(a + 0.3) * 10*s, Math.sin(a + 0.3) * 12*s,
          Math.cos(a + 0.5) * 9*s, Math.sin(a + 0.5) * 11*s
        );
        ctx.stroke();
      }
      // 眼（巨大独眼）
      circle(ctx, 0, -3*s, 2.5*s, '#FF0044');
      circle(ctx, 0, -3*s, 1.5*s, '#000000');
      circle(ctx, -0.5*s, -3.5*s, 0.6*s, '#FF3366');
      ctx.shadowColor = '#FF0044'; ctx.shadowBlur = 10;
      circle(ctx, 0, -3*s, 2.5*s, '#FF004422');
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    },

  };

  // 合并怪物绘制器
  Object.assign(monsterDrawers, monsterDrawersExtra);
  // ================================================================
  // 武器外观皮肤绘制
  // ================================================================
  const weaponSkinDrawers = {
    'ws_bamboo': (ctx, s, frame) => { // 翠竹剑
      rect(ctx, 0, 0, s, 3*s, '#2E5E1E');
      rect(ctx, -s, 0, 3*s, s, '#4A8B2A');
      rect(ctx, -s/2, -9*s, 2*s, 9*s, '#4A8B2A');
      // 竹节
      for(let i=0;i<3;i++) rect(ctx, -s, -8*s+i*3*s, 3*s, s, '#2E5E1E');
      rect(ctx, 0, -10*s, s, s, '#8BC34A');
    },
    'ws_rusty': (ctx, s, frame) => { // 锈铁剑
      rect(ctx, 0, 0, s, 3*s, '#5D4037');
      rect(ctx, -s, 0, 3*s, s, '#8B7355');
      rect(ctx, -s/2, -8*s, 2*s, 8*s, '#8B6914');
      rect(ctx, 0, -9*s, s, s, '#A08040');
      // 锈斑
      rect(ctx, 0, -6*s, s, s, '#CC6600'); rect(ctx, -s/2, -3*s, s, s, '#996633');
    },
    'ws_bone': (ctx, s, frame) => { // 白骨剑
      rect(ctx, 0, 0, s, 3*s, '#8B7355');
      rect(ctx, -s, 0, 3*s, s, '#DDD');
      rect(ctx, -s/2, -9*s, 2*s, 9*s, '#E8DCC8');
      rect(ctx, 0, -10*s, s, s, '#FFF');
      // 骨节
      for(let i=0;i<2;i++) { rect(ctx, -s, -7*s+i*4*s, s, 2*s, '#DDD'); rect(ctx, s, -5*s+i*4*s, s, 2*s, '#DDD'); }
    },
    'ws_jade': (ctx, s, frame) => { // 碧玉剑
      rect(ctx, 0, 0, s, 3*s, '#2E7D32');
      rect(ctx, -s, 0, 3*s, s, '#4CAF50');
      rect(ctx, -s/2, -9*s, 2*s, 9*s, '#66BB6A');
      ctx.globalAlpha = 0.4 + Math.sin(frame*0.06)*0.2;
      rect(ctx, 0, -9*s, s, 9*s, '#A5D6A7');
      ctx.globalAlpha = 1;
      rect(ctx, 0, -10*s, s, s, '#C8E6C9');
    },
    'ws_flame': (ctx, s, frame) => { // 烈焰刀
      rect(ctx, 0, 0, s, 3*s, '#5D4037');
      rect(ctx, -s*1.5, 0, 4*s, s, '#FF5722');
      rect(ctx, -s, -9*s, 3*s, 9*s, '#FF5722');
      rect(ctx, -s/2, -10*s, 2*s, s, '#FFAB40');
      ctx.globalAlpha = 0.3+Math.sin(frame*0.08)*0.2;
      ctx.shadowColor = '#FF5722'; ctx.shadowBlur = 8;
      rect(ctx, -s, -9*s, 3*s, 9*s, '#FF5722');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_frost': (ctx, s, frame) => { // 寒霜剑
      rect(ctx, 0, 0, s, 3*s, '#455A64');
      rect(ctx, -s, 0, 3*s, s, '#90CAF9');
      rect(ctx, -s/2, -9*s, 2*s, 9*s, '#90CAF9');
      rect(ctx, 0, -10*s, s, s, '#E3F2FD');
      ctx.globalAlpha = 0.3+Math.sin(frame*0.07)*0.15;
      ctx.shadowColor = '#64B5F6'; ctx.shadowBlur = 10;
      rect(ctx, -s/2, -9*s, 2*s, 9*s, '#BBDEFB');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_wind': (ctx, s, frame) => { // 疾风匕
      rect(ctx, 0, 0, s, 2*s, '#546E7A');
      rect(ctx, -s/2, -6*s, s*1.5, 6*s, '#B0BEC5');
      rect(ctx, 0, -7*s, s, s, '#ECEFF1');
      // 风纹
      ctx.globalAlpha = 0.4;
      for(let i=0;i<3;i++){
        rect(ctx, s + Math.sin(frame*0.1+i)*s, -5*s+i*2*s, 2*s, s, '#80CBC4');
      }
      ctx.globalAlpha = 1;
    },
    'ws_thunder': (ctx, s, frame) => { // 雷霆锤
      rect(ctx, 0, 0, s, 4*s, '#795548');
      rect(ctx, -2*s, -5*s, 5*s, 4*s, '#607D8B');
      rect(ctx, -2*s, -6*s, 5*s, s, '#78909C');
      ctx.globalAlpha = 0.5+Math.sin(frame*0.06)*0.3;
      rect(ctx, -s, -4*s, 3*s, 2*s, '#FFFF00');
      ctx.globalAlpha = 1;
    },
    'ws_blood': (ctx, s, frame) => { // 嗜血刃
      rect(ctx, 0, 0, s, 3*s, '#3E2723');
      rect(ctx, -s*1.5, 0, 4*s, s, '#880000');
      rect(ctx, -s, -10*s, 3*s, 10*s, '#880000');
      rect(ctx, -s/2, -11*s, 2*s, s, '#CC0000');
      ctx.globalAlpha = 0.3+Math.sin(frame*0.05)*0.2;
      ctx.shadowColor = '#FF0000'; ctx.shadowBlur = 10;
      rect(ctx, -s, -10*s, 3*s, 10*s, '#AA0000');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_shadow': (ctx, s, frame) => { // 暗影匕首
      rect(ctx, 0, 0, s, 2*s, '#212121');
      rect(ctx, -s/2, -6*s, s*1.5, 6*s, '#1A1A1A');
      rect(ctx, 0, -7*s, s, s, '#424242');
      ctx.globalAlpha = 0.2+Math.sin(frame*0.04)*0.15;
      ctx.shadowColor = '#9C27B0'; ctx.shadowBlur = 12;
      rect(ctx, -s/2, -6*s, s*1.5, 6*s, '#4A148C');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_starfall': (ctx, s, frame) => { // 星陨剑
      rect(ctx, 0, 0, s, 3*s, '#1A237E');
      rect(ctx, -s, 0, 3*s, s, '#3F51B5');
      rect(ctx, -s/2, -10*s, 2*s, 10*s, '#283593');
      // 星星
      for(let i=0;i<4;i++){
        ctx.globalAlpha = 0.5+Math.sin(frame*0.08+i)*0.4;
        rect(ctx, -s+Math.sin(i*1.5)*s, -9*s+i*2.5*s, s, s, '#FFFFFF');
      }
      ctx.globalAlpha = 0.3;
      ctx.shadowColor = '#536DFE'; ctx.shadowBlur = 12;
      rect(ctx, -s/2, -10*s, 2*s, 10*s, '#3F51B5');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_dragon': (ctx, s, frame) => { // 龙牙剑
      rect(ctx, 0, 0, s, 3*s, '#4E342E');
      rect(ctx, -s*1.5, -s, 4*s, 2*s, '#FFD700');
      rect(ctx, -s, -11*s, 3*s, 11*s, '#E8E8E0');
      rect(ctx, -s/2, -12*s, 2*s, s, '#FFFFF0');
      // 龙纹
      for(let i=0;i<3;i++) rect(ctx, -2*s, -9*s+i*3*s, s, 2*s, '#FFD700');
      ctx.globalAlpha = 0.35;
      ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 14;
      rect(ctx, -s, -11*s, 3*s, 11*s, '#FFF8E1');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_phoenix': (ctx, s, frame) => { // 凤翎刃
      rect(ctx, 0, 0, s, 3*s, '#BF360C');
      rect(ctx, -s*1.5, 0, 4*s, s, '#FF6F00');
      rect(ctx, -s, -10*s, 3*s, 10*s, '#FF6D00');
      rect(ctx, -s/2, -12*s, 2*s, 2*s, '#FFD600');
      // 火焰纹
      ctx.globalAlpha = 0.4+Math.sin(frame*0.06)*0.2;
      for(let i=0;i<3;i++){
        rect(ctx, -2*s, -9*s+i*3*s, s, s, '#FFAB00');
        rect(ctx, 2*s, -8*s+i*3*s, s, s, '#FFAB00');
      }
      ctx.shadowColor = '#FF6F00'; ctx.shadowBlur = 14;
      rect(ctx, -s, -10*s, 3*s, 10*s, '#FF8F00');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_void': (ctx, s, frame) => { // 虚空裂隙
      rect(ctx, 0, 0, s, 3*s, '#1A1A2E');
      rect(ctx, -2*s, -s, 5*s, 2*s, '#311B92');
      rect(ctx, -s*1.5, -12*s, 4*s, 12*s, '#1A1A1A');
      // 裂隙光
      ctx.globalAlpha = 0.3+Math.sin(frame*0.04)*0.2;
      ctx.shadowColor = '#7C4DFF'; ctx.shadowBlur = 18;
      rect(ctx, -s, -12*s, s*2, 12*s, '#651FFF');
      ctx.shadowBlur = 0;
      // 粒子
      for(let i=0;i<3;i++){
        rect(ctx, Math.sin(frame*0.03+i*2)*2*s, -10*s+i*4*s, s, s, '#B388FF');
      }
      ctx.globalAlpha = 1;
    },
    'ws_moonlight': (ctx, s, frame) => { // 月华剑
      rect(ctx, 0, 0, s, 3*s, '#37474F');
      rect(ctx, -s, 0, 3*s, s, '#B0BEC5');
      rect(ctx, -s/2, -10*s, 2*s, 10*s, '#CFD8DC');
      ctx.globalAlpha = 0.35+Math.sin(frame*0.05)*0.2;
      ctx.shadowColor = '#E0E0E0'; ctx.shadowBlur = 16;
      rect(ctx, -s/2, -10*s, 2*s, 10*s, '#ECEFF1');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      rect(ctx, 0, -11*s, s, s, '#FFFFFF');
    },
    'ws_golden_lotus': (ctx, s, frame) => { // 金莲法杖
      rect(ctx, 0, 0, s, 5*s, '#5D4037');
      rect(ctx, 0, -8*s, s, 8*s, '#795548');
      // 莲花
      const bloom = Math.sin(frame*0.04)*s*0.3;
      ctx.fillStyle = '#FFD700';
      for(let i=0;i<5;i++){
        const a = i*Math.PI*2/5 + frame*0.01;
        ctx.beginPath(); ctx.ellipse(s/2+Math.cos(a)*2*s, -10*s+Math.sin(a)*2*s, s*1.5+bloom, s, a, 0, Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 0.4; ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(s/2, -10*s, 3*s, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_chaos': (ctx, s, frame) => { // 混沌之刃
      rect(ctx, 0, 0, s, 3*s, '#1A0A2E');
      rect(ctx, -2*s, -s, 5*s, 2*s, '#4A148C');
      // 不规则刀刃
      ctx.fillStyle = '#311B92';
      ctx.beginPath();
      ctx.moveTo(-s*1.5, 0); ctx.lineTo(-2*s, -6*s); ctx.lineTo(-s, -10*s);
      ctx.lineTo(s, -12*s); ctx.lineTo(2*s, -8*s); ctx.lineTo(s*1.5, 0);
      ctx.fill();
      ctx.globalAlpha = 0.4+Math.sin(frame*0.03)*0.2;
      ctx.shadowColor = '#D500F9'; ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_heavenly': (ctx, s, frame) => { // 天罚雷剑
      rect(ctx, 0, 0, s, 3*s, '#37474F');
      rect(ctx, -s*1.5, -s, 4*s, 2*s, '#FFEB3B');
      rect(ctx, -s, -11*s, 3*s, 11*s, '#FFC107');
      rect(ctx, -s/2, -12*s, 2*s, s, '#FFFF00');
      // 电弧
      if (Math.floor(frame/5)%2===0) {
        ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = s*0.8;
        ctx.beginPath(); ctx.moveTo(-s, -8*s); ctx.lineTo(-3*s, -10*s); ctx.lineTo(-2*s, -9*s); ctx.lineTo(-4*s, -12*s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(2*s, -6*s); ctx.lineTo(4*s, -8*s); ctx.lineTo(3*s, -7*s); ctx.lineTo(5*s, -10*s); ctx.stroke();
      }
      ctx.globalAlpha = 0.4; ctx.shadowColor = '#FFEB3B'; ctx.shadowBlur = 18;
      rect(ctx, -s, -11*s, 3*s, 11*s, '#FFC107');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_primordial': (ctx, s, frame) => { // 太初神剑
      rect(ctx, 0, 0, s, 3*s, '#880000');
      rect(ctx, -2*s, -s, 5*s, 2*s, '#FFD700');
      rect(ctx, -s, -13*s, 3*s, 13*s, '#FFD700');
      rect(ctx, -s/2, -14*s, 2*s, s, '#FFFFAA');
      // 旋转符文
      for(let i=0;i<6;i++){
        const a = frame*0.02 + i*Math.PI/3;
        ctx.globalAlpha = 0.6+Math.sin(frame*0.04+i)*0.3;
        rect(ctx, Math.cos(a)*3*s, -7*s+Math.sin(a)*5*s, s, s, '#FFFFFF');
      }
      ctx.globalAlpha = 0.5; ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 22;
      rect(ctx, -s, -13*s, 3*s, 13*s, '#FFD700');
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
    'ws_cosmic': (ctx, s, frame) => { // 寰宇星辰剑
      rect(ctx, 0, 0, s, 3*s, '#0D0D2B');
      rect(ctx, -2*s, -s, 5*s, 2*s, '#00BCD4');
      // 剑身：深蓝星空
      const grad = ctx.createLinearGradient(-s, -14*s, 2*s, 0);
      grad.addColorStop(0, '#1A237E'); grad.addColorStop(0.5, '#0D47A1'); grad.addColorStop(1, '#01579B');
      ctx.fillStyle = grad;
      ctx.fillRect(-s, -14*s, 3*s, 14*s);
      // 星辰
      for(let i=0;i<8;i++){
        ctx.globalAlpha = 0.5+Math.sin(frame*0.06+i*0.8)*0.5;
        const sx = -s + Math.sin(i*1.7)*s*1.5;
        const sy = -13*s + i*1.8*s;
        rect(ctx, sx, sy, s*0.8, s*0.8, '#FFFFFF');
      }
      ctx.globalAlpha = 0.45+Math.sin(frame*0.025)*0.2;
      ctx.shadowColor = '#00BCD4'; ctx.shadowBlur = 24;
      ctx.fillStyle = '#00BCD4';
      ctx.fillRect(-s, -14*s, 3*s, 14*s);
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    },
  };

  // 带皮肤的武器绘制

  // 带皮肤的武器绘制
  function drawWeaponWithSkin(ctx, x, y, s, tier, frame, attacking, skinId) {
    if (skinId && weaponSkinDrawers[skinId]) {
      ctx.save();
      ctx.translate(x, y);
      const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
      ctx.rotate(angle);
      weaponSkinDrawers[skinId](ctx, s, frame);
      ctx.restore();
    } else {
      drawWeapon(ctx, x, y, s, tier, frame, attacking);
    }
  }

  // ================================================================
  // 衣服外观颜色映射
  // ================================================================
  const armorSkinColors = {
    'as_patched':      { main: '#8B8B6B', accent: '#6B6B4B', trim: '#A0A080' },
    'as_farmer':       { main: '#A09060', accent: '#807040', trim: '#C0B080' },
    'as_scholar':      { main: '#F0F0F0', accent: '#D8D8D8', trim: '#FFFFFF' },
    'as_bamboo':       { main: '#4A8B4A', accent: '#367836', trim: '#6BAF6B' },
    'as_cloud':        { main: '#B0C4DE', accent: '#8AAABE', trim: '#D0E4FE' },
    'as_fire_robe':    { main: '#CC3300', accent: '#AA2200', trim: '#FF6644' },
    'as_ice_silk':     { main: '#88CCEE', accent: '#66AACC', trim: '#AAEEFF' },
    'as_night':        { main: '#1A1A2E', accent: '#0D0D1A', trim: '#333366' },
    'as_dragon_scale': { main: '#228877', accent: '#116655', trim: '#44CCAA' },
    'as_flower':       { main: '#DD66AA', accent: '#BB4488', trim: '#FF88CC' },
    'as_star_robe':    { main: '#1A237E', accent: '#0D1557', trim: '#3F51B5' },
    'as_blood_armor':  { main: '#8B0000', accent: '#660000', trim: '#CC2222' },
    'as_jade_emperor': { main: '#FFD700', accent: '#DAA520', trim: '#FFEE88' },
    'as_ghost':        { main: '#228B4588', accent: '#1A6B3588', trim: '#44FF8888' },
    'as_thunder_armor':{ main: '#DAA520', accent: '#B8860B', trim: '#FFEB3B' },
    'as_phoenix_robe': { main: '#FF4500', accent: '#CC3700', trim: '#FFD700' },
    'as_void_cloak':   { main: '#0A0A1A', accent: '#050510', trim: '#4A148C' },
    'as_celestial':    { main: '#FFD700', accent: '#FFC107', trim: '#FFFFF0' },
    'as_primordial_robe': { main: '#4A148C', accent: '#311B92', trim: '#FFD700' },
    'as_universe':     { main: '#0D47A1', accent: '#1A237E', trim: '#00BCD4' },
  };

  // 绘制衣服外观覆盖层
  function drawArmorSkinOverlay(ctx, x, y, s, realmIndex, frame, attacking, skinId) {
    const colors = armorSkinColors[skinId];
    if (!colors) return;

    const bounce = realmIndex <= 1 ? Math.sin(frame * 0.08) * 1.5 * s : (realmIndex <= 3 ? Math.sin(frame * 0.04) * 2 * s : Math.sin(frame * 0.03) * (3+realmIndex) * s);
    const atkX = attacking > 0 ? Math.sin(attacking * 0.4) * (6+realmIndex*2) * s : 0;
    const floatExtra = realmIndex >= 3 ? -(realmIndex-2)*3*s : 0;

    ctx.save();
    ctx.translate(x + atkX, y + bounce + floatExtra);
    ctx.globalAlpha = 0.75;

    // 衣服主体（圆润版）
    const bodyW = realmIndex >= 2 ? 7.5 : (realmIndex >= 1 ? 6.5 : 6);
    const bodyH = realmIndex >= 2 ? 6.5 : (realmIndex >= 1 ? 6 : 5.5);

    ellipse(ctx, 0.5*s, 0, bodyW*s, bodyH*s, colors.main);
    ellipse(ctx, 0.5*s, 0.5*s, (bodyW-1.5)*s, (bodyH-1.5)*s, colors.accent);

    // 领口
    ctx.strokeStyle = colors.trim;
    ctx.lineWidth = s * 0.8;
    ctx.beginPath();
    ctx.moveTo(-1*s, -4.5*s);
    ctx.lineTo(0.5*s, -2*s);
    ctx.lineTo(2*s, -4.5*s);
    ctx.stroke();

    // 腰带
    roundRect(ctx, -(bodyW-0.5)*s, -0.5*s, (bodyW*2-1)*s, 1.5*s, 0.5*s, colors.trim);

    // 高品质特效
    if (skinId.includes('phoenix') || skinId.includes('celestial') || skinId.includes('primordial') || skinId.includes('universe')) {
      ctx.globalAlpha = 0.25 + Math.sin(frame * 0.04) * 0.15;
      ctx.shadowColor = colors.trim;
      ctx.shadowBlur = 12;
      ellipse(ctx, 0.5*s, 0, bodyW*s, bodyH*s, colors.trim);
      ctx.shadowBlur = 0;
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ================================================================
  // 公开接口
  // ================================================================

  function drawMouseByRealm(ctx, x, y, s, realmIndex, frame, attacking, options) {
    const opts = options || {};
    const drawFns = [
      drawMouseRealm0, drawMouseRealm1, drawMouseRealm2,
      drawMouseRealm3, drawMouseRealm4, drawMouseRealm5,
    ];

    // 霓虹光环
    if (realmIndex >= 1) {
      const glowColors = [
        null,
        'rgba(68,136,204,0.08)',
        'rgba(46,139,139,0.10)',
        'rgba(65,105,180,0.12)',
        'rgba(123,62,191,0.15)',
        'rgba(160,32,96,0.18)',
      ];
      const glowR = (12 + realmIndex * 4) * s;
      const pulse = 1 + Math.sin(frame * 0.03) * 0.15;
      ctx.save();
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowR * pulse);
      grad.addColorStop(0, glowColors[realmIndex] || 'transparent');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y - 2*s, glowR * pulse, glowR * pulse * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const fn = drawFns[realmIndex] || drawFns[0];
    fn(ctx, x, y, s, frame, attacking, opts);
  }

  function drawMonsterByName(ctx, name, x, y, s, frame, hitAnim) {
    const drawer = monsterDrawers[name];
    if (!drawer) {
      ctx.save();
      ctx.translate(x, y);
      const shake = hitAnim > 0 ? Math.sin(hitAnim*2)*3*s : 0;
      ctx.translate(shake, 0);
      ellipse(ctx, 0, 0, 5*s, 5*s, '#FF4488');
      circle(ctx, -2*s, -2*s, s, '#FFF');
      circle(ctx, 2*s, -2*s, s, '#FFF');
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    const shake = hitAnim > 0 ? Math.sin(hitAnim*2)*3*s : 0;
    const alpha = hitAnim > 0 ? 0.6 + 0.4*(1-hitAnim/10) : 1;
    ctx.translate(shake, 0);
    ctx.globalAlpha = alpha;
    drawer(ctx, x, y, s, frame);
    
    if (hitAnim > 5) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (hitAnim - 5) / 10;
      drawer(ctx, x, y, s, frame);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawMonsterHPBar(ctx, x, y, s, hpPercent, name) {
    const barW = 60;
    const barH = 6;
    const barR = 3;
    // bg（圆角）
    roundRect(ctx, x - barW/2, y, barW, barH, barR, '#333');
    // fill
    const color = hpPercent > 0.5 ? '#44AA44' : hpPercent > 0.2 ? '#DDAA44' : '#DD4444';
    const fillW = barW * Math.max(0, hpPercent);
    if (fillW > 0) {
      roundRect(ctx, x - barW/2, y, fillW, barH, barR, color);
    }
    // border
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - barW/2 + barR, y);
    ctx.lineTo(x + barW/2 - barR, y);
    ctx.quadraticCurveTo(x + barW/2, y, x + barW/2, y + barR);
    ctx.lineTo(x + barW/2, y + barH - barR);
    ctx.quadraticCurveTo(x + barW/2, y + barH, x + barW/2 - barR, y + barH);
    ctx.lineTo(x - barW/2 + barR, y + barH);
    ctx.quadraticCurveTo(x - barW/2, y + barH, x - barW/2, y + barH - barR);
    ctx.lineTo(x - barW/2, y + barR);
    ctx.quadraticCurveTo(x - barW/2, y, x - barW/2 + barR, y);
    ctx.stroke();
    // name
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - 4);
  }

  return {
    drawMouseByRealm,
    drawMonsterByName,
    drawMonsterHPBar,
    drawActiveBeast,
    drawMountCrane,
    drawMountQilin,
    drawWeaponWithSkin,
    drawArmorSkinOverlay,
    armorSkinColors,
    rect,
    px,
    circle,
    ellipse,
    roundRect,
  };

})();

// Export for module usage
if (typeof module !== 'undefined') module.exports = Sprites;
