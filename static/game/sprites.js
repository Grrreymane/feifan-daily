// ============================================================
// sprites.js — 鼠鼠修仙 像素精灵绘制系统
// 所有角色、怪物、装备、坐骑、灵宠的像素画都在这里
// ============================================================

const Sprites = (() => {

  // 像素绘制辅助
  function px(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), s, s);
  }

  function rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // 从像素矩阵绘制精灵
  // matrix: 2D array of color strings ('' = transparent)
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

  // 颜色常量
  const C = {
    // 鼠鼠身体
    FUR_GREY: '#9E9E9E',
    FUR_LIGHT: '#BDBDBD',
    FUR_BELLY: '#E0D8CC',
    EAR_PINK: '#F8A0B0',
    EAR_INNER: '#FF7090',
    NOSE: '#FF8888',
    EYE: '#111111',
    EYE_SHINE: '#FFFFFF',
    WHISKER: '#CCCCCC',
    TAIL: '#B0A898',
    // 衣服
    CLOTH_BROWN: '#8B6914',
    CLOTH_GOLD: '#DAA520',
    CLOTH_GREEN: '#2E8B57',
    CLOTH_BLUE: '#4169E1',
    CLOTH_PURPLE: '#8A2BE2',
    CLOTH_RED: '#DC143C',
    // 武器
    WOOD: '#8B6914',
    IRON: '#AAAAAA',
    STEEL: '#C0C0C0',
    MAGIC_BLUE: '#4AADFF',
    MAGIC_PURPLE: '#AA88FF',
    MAGIC_PINK: '#FF66FF',
    MAGIC_GOLD: '#FFD700',
    HANDLE: '#654321',
    // 怪物通用
    SHADOW: 'rgba(0,0,0,0.2)',
  };

  // ================================================================
  // 鼠鼠像素矩阵 — 6种境界形象
  // 每个矩阵约 16x20 像素，绘制时放大 s 倍
  // ================================================================

  const _ = ''; // transparent

  // --- 炼气期鼠鼠：小灰鼠，布衣 ---
  function drawMouseRealm0(ctx, x, y, s, frame, attacking) {
    const bounce = Math.sin(frame * 0.08) * 1.5 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 6 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + bounce);
    
    const f = C.FUR_GREY, l = C.FUR_LIGHT, b = C.FUR_BELLY;
    const e = C.EAR_PINK, i = C.EAR_INNER, n = C.NOSE;
    const ey = C.EYE, w = '#FFFFFF';
    const cl = C.CLOTH_BROWN;
    
    // 耳朵
    rect(ctx, -5*s, -16*s, 3*s, 4*s, e);
    rect(ctx, -4*s, -15*s, 1*s, 2*s, i);
    rect(ctx, 3*s, -16*s, 3*s, 4*s, e);
    rect(ctx, 4*s, -15*s, 1*s, 2*s, i);
    
    // 头
    rect(ctx, -4*s, -12*s, 9*s, 7*s, f);
    rect(ctx, -3*s, -11*s, 7*s, 5*s, l);
    // 眼睛
    rect(ctx, -3*s, -10*s, 2*s, 2*s, ey);
    rect(ctx, -3*s, -10*s, 1*s, 1*s, w);
    rect(ctx, 2*s, -10*s, 2*s, 2*s, ey);
    rect(ctx, 2*s, -10*s, 1*s, 1*s, w);
    // 鼻子
    rect(ctx, 0, -7*s, 1*s, 1*s, n);
    // 胡须
    ctx.strokeStyle = C.WHISKER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5*s, -8*s); ctx.lineTo(-8*s, -9*s);
    ctx.moveTo(-5*s, -7*s); ctx.lineTo(-8*s, -7*s);
    ctx.moveTo(6*s, -8*s); ctx.lineTo(9*s, -9*s);
    ctx.moveTo(6*s, -7*s); ctx.lineTo(9*s, -7*s);
    ctx.stroke();
    
    // 身体（布衣）
    rect(ctx, -4*s, -5*s, 9*s, 8*s, cl);
    rect(ctx, -3*s, -4*s, 7*s, 6*s, '#A07828'); // 衣服深色
    // 腰带
    rect(ctx, -4*s, -1*s, 9*s, 1*s, '#654321');
    // 肚子
    rect(ctx, -2*s, -4*s, 5*s, 4*s, b);
    
    // 腿
    rect(ctx, -3*s, 3*s, 3*s, 3*s, f);
    rect(ctx, 2*s, 3*s, 3*s, 3*s, f);
    // 脚
    rect(ctx, -4*s, 6*s, 4*s, 1*s, f);
    rect(ctx, 1*s, 6*s, 4*s, 1*s, f);
    
    // 尾巴
    ctx.strokeStyle = C.TAIL;
    ctx.lineWidth = s * 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4*s, 2*s);
    ctx.quadraticCurveTo(-10*s, -2*s + Math.sin(frame*0.06)*3*s, -8*s, -6*s);
    ctx.stroke();
    
    // 右手持武器位置
    drawWeapon(ctx, 5*s, -4*s, s, 0, frame, attacking);
    
    ctx.restore();
  }

  // --- 筑基期鼠鼠：亮毛色，道袍，铁剑 ---
  function drawMouseRealm1(ctx, x, y, s, frame, attacking) {
    const bounce = Math.sin(frame * 0.08) * 1.5 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 8 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + bounce);
    
    const f = '#ABABAB', l = '#C8C8C8', b = C.FUR_BELLY;
    const e = C.EAR_PINK, i = C.EAR_INNER;
    const cl = C.CLOTH_GOLD;

    // 耳朵
    rect(ctx, -5*s, -16*s, 3*s, 4*s, e);
    rect(ctx, -4*s, -15*s, 1*s, 2*s, i);
    rect(ctx, 3*s, -16*s, 3*s, 4*s, e);
    rect(ctx, 4*s, -15*s, 1*s, 2*s, i);
    // 头
    rect(ctx, -4*s, -12*s, 9*s, 7*s, f);
    rect(ctx, -3*s, -11*s, 7*s, 5*s, l);
    // 眼睛
    rect(ctx, -3*s, -10*s, 2*s, 2*s, C.EYE);
    rect(ctx, -3*s, -10*s, 1*s, 1*s, '#FFF');
    rect(ctx, 2*s, -10*s, 2*s, 2*s, C.EYE);
    rect(ctx, 2*s, -10*s, 1*s, 1*s, '#FFF');
    rect(ctx, 0, -7*s, 1*s, 1*s, C.NOSE);
    // 胡须
    ctx.strokeStyle = C.WHISKER; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-5*s, -8*s); ctx.lineTo(-8*s, -9*s);
    ctx.moveTo(-5*s, -7*s); ctx.lineTo(-8*s, -7*s);
    ctx.moveTo(6*s, -8*s); ctx.lineTo(9*s, -9*s);
    ctx.moveTo(6*s, -7*s); ctx.lineTo(9*s, -7*s);
    ctx.stroke();
    
    // 道袍
    rect(ctx, -5*s, -5*s, 11*s, 9*s, cl);
    rect(ctx, -4*s, -4*s, 9*s, 7*s, '#C8961C');
    // 道袍领子
    rect(ctx, -1*s, -5*s, 3*s, 3*s, '#F0E0A0');
    // 腰带
    rect(ctx, -5*s, 0, 11*s, 1*s, '#8B6914');
    // 道袍下摆
    rect(ctx, -5*s, 4*s, 4*s, 3*s, cl);
    rect(ctx, 3*s, 4*s, 4*s, 3*s, cl);
    
    // 脚
    rect(ctx, -4*s, 7*s, 3*s, 1*s, f);
    rect(ctx, 2*s, 7*s, 3*s, 1*s, f);
    
    // 尾巴
    ctx.strokeStyle = '#B8B0A0'; ctx.lineWidth = s*1.5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(-5*s, 2*s);
    ctx.quadraticCurveTo(-11*s, -2*s + Math.sin(frame*0.06)*3*s, -9*s, -6*s);
    ctx.stroke();

    // 灵宠：小蛇（在鼠鼠脚边）
    drawPetSnake(ctx, -10*s, 4*s, s, frame);
    
    drawWeapon(ctx, 6*s, -4*s, s, 1, frame, attacking);
    ctx.restore();
  }

  // --- 金丹期鼠鼠：体型更大，法袍，飞剑 ---
  function drawMouseRealm2(ctx, x, y, s, frame, attacking) {
    const bounce = Math.sin(frame * 0.08) * 1 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 10 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + bounce);
    
    const f = '#B8B8B8', l = '#D0D0D0';
    const cl = C.CLOTH_GREEN;
    
    // 耳朵（稍大）
    rect(ctx, -6*s, -18*s, 3*s, 5*s, C.EAR_PINK);
    rect(ctx, -5*s, -17*s, 1*s, 3*s, C.EAR_INNER);
    rect(ctx, 4*s, -18*s, 3*s, 5*s, C.EAR_PINK);
    rect(ctx, 5*s, -17*s, 1*s, 3*s, C.EAR_INNER);
    // 头（大一圈）
    rect(ctx, -5*s, -13*s, 11*s, 8*s, f);
    rect(ctx, -4*s, -12*s, 9*s, 6*s, l);
    // 眼睛
    rect(ctx, -3*s, -11*s, 2*s, 2*s, C.EYE);
    rect(ctx, -3*s, -11*s, 1*s, 1*s, '#FFF');
    rect(ctx, 3*s, -11*s, 2*s, 2*s, C.EYE);
    rect(ctx, 3*s, -11*s, 1*s, 1*s, '#FFF');
    rect(ctx, 0, -8*s, 1*s, 1*s, C.NOSE);
    // 胡须
    ctx.strokeStyle = C.WHISKER; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6*s, -9*s); ctx.lineTo(-10*s, -10*s);
    ctx.moveTo(-6*s, -8*s); ctx.lineTo(-10*s, -8*s);
    ctx.moveTo(7*s, -9*s); ctx.lineTo(11*s, -10*s);
    ctx.moveTo(7*s, -8*s); ctx.lineTo(11*s, -8*s);
    ctx.stroke();
    
    // 法袍
    rect(ctx, -6*s, -5*s, 13*s, 10*s, cl);
    rect(ctx, -5*s, -4*s, 11*s, 8*s, '#228B22');
    // 领子
    rect(ctx, -1*s, -5*s, 3*s, 3*s, '#90EE90');
    // 袍上纹饰
    rect(ctx, -4*s, -2*s, 1*s, 1*s, '#90EE90');
    rect(ctx, 4*s, -2*s, 1*s, 1*s, '#90EE90');
    // 腰带（玉带）
    rect(ctx, -6*s, 1*s, 13*s, 1*s, '#90EE90');
    rect(ctx, 0, 0, 2*s, 2*s, '#ADFF2F'); // 玉佩
    // 下摆
    rect(ctx, -6*s, 5*s, 5*s, 4*s, cl);
    rect(ctx, 3*s, 5*s, 5*s, 4*s, cl);
    
    // 脚
    rect(ctx, -4*s, 9*s, 3*s, 1*s, f);
    rect(ctx, 3*s, 9*s, 3*s, 1*s, f);
    
    // 尾巴
    ctx.strokeStyle = '#C0B8A8'; ctx.lineWidth = s*1.5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(-6*s, 3*s);
    ctx.quadraticCurveTo(-13*s, -1*s + Math.sin(frame*0.06)*3*s, -11*s, -7*s);
    ctx.stroke();
    
    // 灵宠：小蛇
    drawPetSnake(ctx, -12*s, 5*s, s, frame);
    // 坐骑：仙鹤（在后面）
    drawMountCrane(ctx, -3*s, 10*s, s, frame);
    
    drawWeapon(ctx, 7*s, -4*s, s, 2, frame, attacking);
    ctx.restore();
  }

  // --- 元婴期鼠鼠：光环，华服，灵剑 ---
  function drawMouseRealm3(ctx, x, y, s, frame, attacking) {
    const floatY = Math.sin(frame * 0.04) * 2 * s; // 微浮
    const atkX = attacking ? Math.sin(attacking * 0.4) * 12 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + floatY);
    
    const f = '#D0D0D0', l = '#E0E0E0';
    const cl = C.CLOTH_BLUE;
    
    // 灵光环
    ctx.globalAlpha = 0.15 + Math.sin(frame * 0.03) * 0.08;
    ctx.beginPath();
    ctx.arc(0, -4*s, 18*s, 0, Math.PI * 2);
    ctx.fillStyle = '#4488FF';
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 耳朵
    rect(ctx, -6*s, -18*s, 3*s, 5*s, '#FF9999');
    rect(ctx, -5*s, -17*s, 1*s, 3*s, C.EAR_INNER);
    rect(ctx, 4*s, -18*s, 3*s, 5*s, '#FF9999');
    rect(ctx, 5*s, -17*s, 1*s, 3*s, C.EAR_INNER);
    // 头
    rect(ctx, -5*s, -13*s, 11*s, 8*s, f);
    rect(ctx, -4*s, -12*s, 9*s, 6*s, l);
    // 眼睛（蓝色灵光）
    rect(ctx, -3*s, -11*s, 2*s, 2*s, '#4169E1');
    rect(ctx, -3*s, -11*s, 1*s, 1*s, '#88BBFF');
    rect(ctx, 3*s, -11*s, 2*s, 2*s, '#4169E1');
    rect(ctx, 3*s, -11*s, 1*s, 1*s, '#88BBFF');
    rect(ctx, 0, -8*s, 1*s, 1*s, C.NOSE);
    // 胡须
    ctx.strokeStyle = '#DDD'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6*s, -9*s); ctx.lineTo(-10*s, -10*s);
    ctx.moveTo(-6*s, -8*s); ctx.lineTo(-10*s, -8*s);
    ctx.moveTo(7*s, -9*s); ctx.lineTo(11*s, -10*s);
    ctx.moveTo(7*s, -8*s); ctx.lineTo(11*s, -8*s);
    ctx.stroke();
    
    // 华服
    rect(ctx, -6*s, -5*s, 13*s, 10*s, cl);
    rect(ctx, -5*s, -4*s, 11*s, 8*s, '#3458B2');
    // 金边
    rect(ctx, -6*s, -5*s, 1*s, 10*s, C.MAGIC_GOLD);
    rect(ctx, 6*s, -5*s, 1*s, 10*s, C.MAGIC_GOLD);
    // 领子
    rect(ctx, -1*s, -5*s, 3*s, 3*s, '#88BBFF');
    // 腰带
    rect(ctx, -6*s, 1*s, 13*s, 1*s, C.MAGIC_GOLD);
    // 下摆
    rect(ctx, -7*s, 5*s, 5*s, 5*s, cl);
    rect(ctx, 3*s, 5*s, 5*s, 5*s, cl);
    
    // 脚
    rect(ctx, -5*s, 10*s, 3*s, 1*s, f);
    rect(ctx, 3*s, 10*s, 3*s, 1*s, f);

    // 尾巴
    ctx.strokeStyle = '#D8D0C0'; ctx.lineWidth = s*1.5; ctx.lineCap='round';
    ctx.beginPath();
    ctx.moveTo(-6*s, 3*s);
    ctx.quadraticCurveTo(-14*s, -1*s + Math.sin(frame*0.06)*3*s, -12*s, -8*s);
    ctx.stroke();
    
    // 灵宠：蛟龙
    drawPetDragon(ctx, -14*s, -2*s, s, frame);
    // 坐骑：仙鹤
    drawMountCrane(ctx, -3*s, 11*s, s, frame);
    
    drawWeapon(ctx, 7*s, -4*s, s, 3, frame, attacking);
    ctx.restore();
  }

  // --- 化神期鼠鼠：飘浮，仙袍，神剑 ---
  function drawMouseRealm4(ctx, x, y, s, frame, attacking) {
    const floatY = Math.sin(frame * 0.03) * 4 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 15 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + floatY - 5*s); // 离地浮空

    const f = '#E8E8FF', l = '#F0F0FF';
    const cl = C.CLOTH_PURPLE;
    
    // 紫色灵光环
    ctx.globalAlpha = 0.18 + Math.sin(frame * 0.025) * 0.08;
    ctx.beginPath();
    ctx.arc(0, -4*s, 22*s, 0, Math.PI * 2);
    ctx.fillStyle = '#9944FF';
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // 耳朵
    rect(ctx, -6*s, -18*s, 3*s, 5*s, '#FF88CC');
    rect(ctx, -5*s, -17*s, 1*s, 3*s, '#FF55AA');
    rect(ctx, 4*s, -18*s, 3*s, 5*s, '#FF88CC');
    rect(ctx, 5*s, -17*s, 1*s, 3*s, '#FF55AA');
    // 头
    rect(ctx, -5*s, -13*s, 11*s, 8*s, f);
    rect(ctx, -4*s, -12*s, 9*s, 6*s, l);
    // 眼睛（紫色灵光）
    rect(ctx, -3*s, -11*s, 2*s, 2*s, '#8A2BE2');
    rect(ctx, -3*s, -11*s, 1*s, 1*s, '#CC88FF');
    rect(ctx, 3*s, -11*s, 2*s, 2*s, '#8A2BE2');
    rect(ctx, 3*s, -11*s, 1*s, 1*s, '#CC88FF');
    rect(ctx, 0, -8*s, 1*s, 1*s, C.NOSE);
    // 胡须（发光）
    ctx.strokeStyle = '#EEE'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-6*s, -9*s); ctx.lineTo(-10*s, -10*s);
    ctx.moveTo(-6*s, -8*s); ctx.lineTo(-10*s, -8*s);
    ctx.moveTo(7*s, -9*s); ctx.lineTo(11*s, -10*s);
    ctx.moveTo(7*s, -8*s); ctx.lineTo(11*s, -8*s);
    ctx.stroke();

    // 仙袍（飘逸）
    const flutter = Math.sin(frame * 0.05) * s;
    rect(ctx, -7*s, -5*s, 15*s, 11*s, cl);
    rect(ctx, -6*s, -4*s, 13*s, 9*s, '#7722CC');
    // 金纹
    for(let i = 0; i < 4; i++) {
      rect(ctx, -5*s + i*3*s, -3*s, 1*s, 7*s, 'rgba(255,215,0,0.3)');
    }
    // 领子
    rect(ctx, -2*s, -5*s, 5*s, 3*s, '#CC88FF');
    // 腰带
    rect(ctx, -7*s, 2*s, 15*s, 1*s, C.MAGIC_GOLD);
    // 飘带
    rect(ctx, -8*s + flutter, 6*s, 4*s, 6*s, cl);
    rect(ctx, 5*s - flutter, 6*s, 4*s, 6*s, cl);
    
    // 灵宠：蛟龙
    drawPetDragon(ctx, -16*s, -5*s, s, frame);
    // 坐骑：麒麟
    drawMountQilin(ctx, -2*s, 12*s, s, frame);
    
    drawWeapon(ctx, 8*s, -4*s, s, 4, frame, attacking);
    ctx.restore();
  }

  // --- 大乘期鼠鼠：金光笼罩，天衣，天剑 ---
  function drawMouseRealm5(ctx, x, y, s, frame, attacking) {
    const floatY = Math.sin(frame * 0.025) * 5 * s;
    const atkX = attacking ? Math.sin(attacking * 0.4) * 18 * s : 0;
    ctx.save();
    ctx.translate(x + atkX, y + floatY - 8*s);
    
    const f = '#FFFFD0', l = '#FFFFF0';
    const cl = C.CLOTH_RED;

    // 外层金光
    ctx.globalAlpha = 0.12 + Math.sin(frame * 0.02) * 0.06;
    ctx.beginPath();
    ctx.arc(0, -4*s, 28*s, 0, Math.PI * 2);
    const glow = ctx.createRadialGradient(0, -4*s, 5*s, 0, -4*s, 28*s);
    glow.addColorStop(0, '#FFD700');
    glow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = glow;
    ctx.fill();
    ctx.globalAlpha = 1;

    // 旋转金色符文
    for (let i = 0; i < 8; i++) {
      const angle = frame * 0.015 + i * Math.PI / 4;
      const r = 20 * s;
      const rx = Math.cos(angle) * r;
      const ry = Math.sin(angle) * r - 4*s;
      ctx.globalAlpha = 0.5 + Math.sin(frame * 0.03 + i) * 0.3;
      rect(ctx, rx - s/2, ry - s/2, s, s, '#FFD700');
    }
    ctx.globalAlpha = 1;

    // 耳朵（金色）
    rect(ctx, -6*s, -18*s, 3*s, 5*s, '#FFD700');
    rect(ctx, -5*s, -17*s, 1*s, 3*s, '#FFEE88');
    rect(ctx, 4*s, -18*s, 3*s, 5*s, '#FFD700');
    rect(ctx, 5*s, -17*s, 1*s, 3*s, '#FFEE88');
    // 头
    rect(ctx, -5*s, -13*s, 11*s, 8*s, f);
    rect(ctx, -4*s, -12*s, 9*s, 6*s, l);
    // 眼睛（红金色灵光）
    rect(ctx, -3*s, -11*s, 2*s, 2*s, '#DC143C');
    rect(ctx, -3*s, -11*s, 1*s, 1*s, '#FFAAAA');
    rect(ctx, 3*s, -11*s, 2*s, 2*s, '#DC143C');
    rect(ctx, 3*s, -11*s, 1*s, 1*s, '#FFAAAA');
    rect(ctx, 0, -8*s, 1*s, 1*s, '#FF6666');
    // 胡须（金光）
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-6*s, -9*s); ctx.lineTo(-11*s, -10*s);
    ctx.moveTo(-6*s, -8*s); ctx.lineTo(-11*s, -8*s);
    ctx.moveTo(7*s, -9*s); ctx.lineTo(12*s, -10*s);
    ctx.moveTo(7*s, -8*s); ctx.lineTo(12*s, -8*s);
    ctx.stroke();
    
    // 天衣
    const flutter = Math.sin(frame * 0.04) * 1.5 * s;
    rect(ctx, -7*s, -5*s, 15*s, 11*s, cl);
    rect(ctx, -6*s, -4*s, 13*s, 9*s, '#B81030');
    // 金龙纹
    for(let i = 0; i < 5; i++) {
      const yy = -3*s + i*2*s;
      rect(ctx, -4*s + Math.sin(frame*0.03+i)*s, yy, 1*s, 1*s, '#FFD700');
      rect(ctx, 4*s - Math.sin(frame*0.03+i)*s, yy, 1*s, 1*s, '#FFD700');
    }
    // 领子
    rect(ctx, -2*s, -5*s, 5*s, 3*s, '#FFD700');
    // 腰带
    rect(ctx, -7*s, 2*s, 15*s, 2*s, '#FFD700');
    rect(ctx, -1*s, 1*s, 3*s, 3*s, '#FF4444'); // 中央宝石
    // 飘带
    rect(ctx, -9*s + flutter, 6*s, 4*s, 8*s, cl);
    rect(ctx, 6*s - flutter, 6*s, 4*s, 8*s, cl);
    
    // 灵宠：神龙
    drawPetDragonGold(ctx, -18*s, -8*s, s, frame);
    // 坐骑：麒麟
    drawMountQilin(ctx, -2*s, 14*s, s, frame);
    
    drawWeapon(ctx, 8*s, -4*s, s, 5, frame, attacking);
    ctx.restore();
  }

  // ================================================================
  // 武器绘制（6种）
  // ================================================================
  function drawWeapon(ctx, x, y, s, tier, frame, attacking) {
    ctx.save();
    ctx.translate(x, y);
    const angle = attacking > 0 ? -0.8 + Math.sin(attacking * 0.5) * 1.5 : -0.3;
    ctx.rotate(angle);
    
    switch(tier) {
      case 0: // 木剑
        rect(ctx, 0, 0, s, 3*s, C.HANDLE);
        rect(ctx, -s/2, 0, 2*s, s, '#8B7355'); // 护手
        rect(ctx, 0, -7*s, s, 7*s, C.WOOD);
        rect(ctx, 0, -8*s, s, s, '#A08040');
        break;
      case 1: // 铁剑
        rect(ctx, 0, 0, s, 3*s, C.HANDLE);
        rect(ctx, -s, 0, 3*s, s, '#888'); // 护手
        rect(ctx, -s/2, -8*s, 2*s, 8*s, C.IRON);
        rect(ctx, 0, -10*s, s, 2*s, '#CCC');
        // 反光
        ctx.globalAlpha = 0.3;
        rect(ctx, 0, -8*s, s/2, 8*s, '#FFF');
        ctx.globalAlpha = 1;
        break;
      case 2: // 飞剑（发光蓝）
        rect(ctx, 0, 0, s, 3*s, '#2244AA');
        rect(ctx, -s, 0, 3*s, s, C.MAGIC_BLUE);
        rect(ctx, -s/2, -9*s, 2*s, 9*s, C.MAGIC_BLUE);
        rect(ctx, 0, -11*s, s, 2*s, '#88DDFF');
        // 发光
        ctx.globalAlpha = 0.3 + Math.sin(frame*0.06)*0.15;
        ctx.shadowColor = C.MAGIC_BLUE; ctx.shadowBlur = 8;
        rect(ctx, -s/2, -9*s, 2*s, 9*s, C.MAGIC_BLUE);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        break;
      case 3: // 灵剑（紫光）
        rect(ctx, 0, 0, s, 3*s, '#443388');
        rect(ctx, -s, 0, 3*s, s, C.MAGIC_PURPLE);
        rect(ctx, -s/2, -10*s, 2*s, 10*s, C.MAGIC_PURPLE);
        rect(ctx, 0, -12*s, s, 2*s, '#CCAAFF');
        ctx.globalAlpha = 0.35 + Math.sin(frame*0.05)*0.15;
        ctx.shadowColor = C.MAGIC_PURPLE; ctx.shadowBlur = 10;
        rect(ctx, -s/2, -10*s, 2*s, 10*s, C.MAGIC_PURPLE);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        break;
      case 4: // 神剑（粉紫闪烁）
        rect(ctx, 0, 0, s, 3*s, '#662288');
        rect(ctx, -s*1.5, 0, 4*s, s, C.MAGIC_PINK);
        rect(ctx, -s, -11*s, 3*s, 11*s, C.MAGIC_PINK);
        rect(ctx, -s/2, -13*s, 2*s, 2*s, '#FFAAFF');
        ctx.globalAlpha = 0.4 + Math.sin(frame*0.04)*0.2;
        ctx.shadowColor = C.MAGIC_PINK; ctx.shadowBlur = 14;
        rect(ctx, -s, -11*s, 3*s, 11*s, C.MAGIC_PINK);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        break;
      case 5: // 天剑（金色旋光）
        rect(ctx, 0, 0, s, 3*s, '#886600');
        rect(ctx, -s*1.5, -s, 4*s, 2*s, C.MAGIC_GOLD);
        rect(ctx, -s, -12*s, 3*s, 12*s, C.MAGIC_GOLD);
        rect(ctx, -s/2, -14*s, 2*s, 2*s, '#FFFFAA');
        // 符文
        for(let i=0;i<3;i++){
          ctx.globalAlpha = 0.5+Math.sin(frame*0.04+i)*0.3;
          rect(ctx, -2*s, -10*s+i*4*s, s, s, '#FFFFFF');
          rect(ctx, 2*s, -10*s+i*4*s, s, s, '#FFFFFF');
        }
        ctx.globalAlpha = 0.45 + Math.sin(frame*0.03)*0.2;
        ctx.shadowColor = C.MAGIC_GOLD; ctx.shadowBlur = 18;
        rect(ctx, -s, -12*s, 3*s, 12*s, C.MAGIC_GOLD);
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;
        break;
    }
    ctx.restore();
  }

  // ================================================================
  // 灵宠绘制
  // ================================================================
  
  // 小蛇
  function drawPetSnake(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const slither = Math.sin(frame * 0.1);
    ctx.strokeStyle = '#44AA44';
    ctx.lineWidth = s * 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(3*s, -2*s + slither*s, 6*s, 0);
    ctx.quadraticCurveTo(9*s, 2*s - slither*s, 12*s, 0);
    ctx.stroke();
    // 头
    rect(ctx, -2*s, -s, 3*s, 2*s, '#44AA44');
    // 眼
    rect(ctx, -2*s, -s, s, s, '#FF0000');
    // 舌头
    if (Math.floor(frame/15) % 2 === 0) {
      ctx.strokeStyle = '#FF4444'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-2*s, 0);
      ctx.lineTo(-4*s, -s); ctx.moveTo(-2*s, 0); ctx.lineTo(-4*s, s);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 蛟龙（小型）
  function drawPetDragon(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.06) * 2 * s;
    ctx.translate(0, bob);
    
    // 身体（蓝绿色蛟龙）
    ctx.strokeStyle = '#2299AA';
    ctx.lineWidth = s * 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for(let i=1; i<=4; i++) {
      ctx.quadraticCurveTo(
        i*3*s, (i%2?-2:2)*s + Math.sin(frame*0.08+i)*s,
        i*4*s, 0
      );
    }
    ctx.stroke();
    // 头
    rect(ctx, -3*s, -2*s, 4*s, 4*s, '#2299AA');
    rect(ctx, -4*s, -s, s, 2*s, '#33BBCC'); // 嘴
    // 角
    rect(ctx, -2*s, -4*s, s, 2*s, '#DDAA00');
    rect(ctx, 0, -4*s, s, 2*s, '#DDAA00');
    // 眼
    rect(ctx, -2*s, -s, s, s, '#FF4400');
    // 小翼
    rect(ctx, 2*s, -4*s, 2*s, 2*s, '#33BBCC');
    rect(ctx, 3*s, -5*s, s, s, '#33BBCC');
    
    ctx.restore();
  }

  // 神龙（大型金色）
  function drawPetDragonGold(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.04) * 3 * s;
    ctx.translate(0, bob);
    
    // 金色龙身
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = s * 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for(let i=1; i<=5; i++) {
      ctx.quadraticCurveTo(
        i*3*s, (i%2?-3:3)*s + Math.sin(frame*0.06+i)*1.5*s,
        i*4*s, 0
      );
    }
    ctx.stroke();
    // 龙身高光
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#FFFFAA';
    ctx.lineWidth = s;
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // 头
    rect(ctx, -4*s, -3*s, 5*s, 5*s, '#FFD700');
    rect(ctx, -5*s, -2*s, 2*s, 3*s, '#FFEE44'); // 嘴
    // 鬃
    rect(ctx, -3*s, -6*s, s, 3*s, '#FF4400');
    rect(ctx, -1*s, -6*s, s, 3*s, '#FF4400');
    rect(ctx, 1*s, -5*s, s, 2*s, '#FF4400');
    // 角
    rect(ctx, -2*s, -7*s, s, 2*s, '#FFF');
    rect(ctx, 0, -7*s, s, 2*s, '#FFF');
    // 眼
    rect(ctx, -3*s, -2*s, 2*s, 2*s, '#FF0000');
    rect(ctx, -3*s, -2*s, s, s, '#FFAAAA');
    // 翼
    rect(ctx, 3*s, -7*s, 3*s, 3*s, '#FFCC00');
    rect(ctx, 5*s, -8*s, 2*s, 2*s, '#FFCC00');
    // 发光
    ctx.globalAlpha = 0.2;
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 10;
    rect(ctx, -4*s, -3*s, 5*s, 5*s, '#FFD700');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    
    ctx.restore();
  }

  // 火灵猫
  function drawPetFireCat(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.08) * s;
    ctx.translate(0, bob);
    // 身体
    rect(ctx, -3*s, -2*s, 6*s, 4*s, '#FF6633');
    rect(ctx, -2*s, -3*s, 4*s, s, '#FF6633');
    // 头
    rect(ctx, -4*s, -5*s, 5*s, 4*s, '#FF8844');
    // 耳朵
    rect(ctx, -4*s, -7*s, 2*s, 2*s, '#FF6633');
    rect(ctx, -1*s, -7*s, 2*s, 2*s, '#FF6633');
    rect(ctx, -3*s, -6*s, s, s, '#FF9966'); // 内耳
    rect(ctx, 0, -6*s, s, s, '#FF9966');
    // 眼睛
    rect(ctx, -3*s, -4*s, s, s, '#FFFF00');
    rect(ctx, -1*s, -4*s, s, s, '#FFFF00');
    // 鼻子
    rect(ctx, -2*s, -3*s, s, s, '#FF3300');
    // 尾巴（火焰效果）
    ctx.strokeStyle = '#FF4400'; ctx.lineWidth = s * 1.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(3*s, 0);
    ctx.quadraticCurveTo(6*s, -2*s + Math.sin(frame*0.1)*2*s, 8*s, -4*s);
    ctx.stroke();
    // 火焰尖端
    const flicker = Math.sin(frame * 0.15) * s;
    rect(ctx, 7*s, -6*s + flicker, 2*s, 2*s, '#FF8800');
    rect(ctx, 8*s, -7*s + flicker, s, s, '#FFCC00');
    // 脚
    rect(ctx, -3*s, 2*s, 2*s, s, '#CC5522');
    rect(ctx, 1*s, 2*s, 2*s, s, '#CC5522');
    // 火焰光效
    ctx.globalAlpha = 0.15 + Math.sin(frame * 0.12) * 0.1;
    ctx.shadowColor = '#FF4400'; ctx.shadowBlur = 8;
    rect(ctx, -3*s, -2*s, 6*s, 4*s, '#FF6633');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 冰狼
  function drawPetIceWolf(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const bob = Math.sin(frame * 0.06) * s * 0.5;
    ctx.translate(0, bob);
    // 身体
    rect(ctx, -4*s, -2*s, 8*s, 5*s, '#99CCEE');
    rect(ctx, -3*s, -3*s, 6*s, s, '#AADDFF');
    // 头
    rect(ctx, -6*s, -5*s, 5*s, 5*s, '#BBDDFF');
    // 嘴
    rect(ctx, -8*s, -3*s, 3*s, 2*s, '#AACCDD');
    rect(ctx, -8*s, -2*s, 2*s, s, '#FFFFFF');
    // 耳朵
    rect(ctx, -6*s, -7*s, 2*s, 2*s, '#99CCEE');
    rect(ctx, -3*s, -7*s, 2*s, 2*s, '#99CCEE');
    // 眼睛
    rect(ctx, -5*s, -4*s, s, s, '#00CCFF');
    rect(ctx, -3*s, -4*s, s, s, '#00CCFF');
    // 尾巴
    ctx.strokeStyle = '#BBDDFF'; ctx.lineWidth = s * 2; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(4*s, -s);
    ctx.quadraticCurveTo(7*s, -3*s + Math.sin(frame*0.07)*2*s, 9*s, -2*s);
    ctx.stroke();
    // 脚
    rect(ctx, -3*s, 3*s, 2*s, s, '#88BBDD');
    rect(ctx, 1*s, 3*s, 2*s, s, '#88BBDD');
    // 冰晶粒子
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 3; i++) {
      const px = -2*s + Math.sin(frame*0.03 + i*2) * 6*s;
      const py = -4*s + Math.cos(frame*0.04 + i*3) * 3*s;
      rect(ctx, px, py, s, s, '#FFFFFF');
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 雷鹰
  function drawPetThunderEagle(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const fly = Math.sin(frame * 0.08) * 2 * s;
    ctx.translate(0, fly);
    // 身体
    rect(ctx, -2*s, -s, 4*s, 3*s, '#DDAA33');
    // 头
    rect(ctx, -3*s, -4*s, 3*s, 3*s, '#EEBB44');
    rect(ctx, -5*s, -3*s, 2*s, s, '#FF8800'); // 喙
    // 眼
    rect(ctx, -3*s, -3*s, s, s, '#FFFFFF');
    // 翅膀（扇动动画）
    const wingUp = Math.sin(frame * 0.12) * 3 * s;
    rect(ctx, -6*s, -2*s + wingUp, 4*s, 2*s, '#CCAA22');
    rect(ctx, -7*s, -s + wingUp * 0.5, 2*s, s, '#BBAA11');
    rect(ctx, 2*s, -2*s + wingUp, 4*s, 2*s, '#CCAA22');
    rect(ctx, 5*s, -s + wingUp * 0.5, 2*s, s, '#BBAA11');
    // 尾巴
    rect(ctx, 0, 2*s, 2*s, 2*s, '#DDAA33');
    rect(ctx, 0, 4*s, s, s, '#CCAA22');
    // 脚爪
    rect(ctx, -s, 2*s, s, 2*s, '#886622');
    rect(ctx, s, 2*s, s, 2*s, '#886622');
    // 雷电效果
    if (Math.floor(frame / 8) % 3 === 0) {
      ctx.strokeStyle = '#FFFF44'; ctx.lineWidth = s * 0.8; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-3*s, -5*s); ctx.lineTo(-4*s, -7*s);
      ctx.lineTo(-3*s, -6*s); ctx.lineTo(-5*s, -8*s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(2*s, -5*s); ctx.lineTo(3*s, -7*s);
      ctx.lineTo(2*s, -6*s); ctx.lineTo(4*s, -8*s);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 暗影蛇
  function drawPetShadowSerpent(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const slither = Math.sin(frame * 0.08);
    // 暗色蛇身
    ctx.strokeStyle = '#553388';
    ctx.lineWidth = s * 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(3*s, -3*s + slither*1.5*s, 7*s, -s);
    ctx.quadraticCurveTo(11*s, s - slither*1.5*s, 15*s, 0);
    ctx.quadraticCurveTo(18*s, -2*s + slither*s, 20*s, -s);
    ctx.stroke();
    // 高光
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#8855CC';
    ctx.lineWidth = s;
    ctx.stroke();
    ctx.globalAlpha = 1;
    // 头
    rect(ctx, -3*s, -2*s, 4*s, 3*s, '#553388');
    rect(ctx, -2*s, -s, 2*s, 2*s, '#6644AA');
    // 眼（紫色发光）
    rect(ctx, -3*s, -2*s, s, s, '#FF00FF');
    ctx.globalAlpha = 0.3;
    ctx.shadowColor = '#FF00FF'; ctx.shadowBlur = 6;
    rect(ctx, -3*s, -2*s, s, s, '#FF00FF');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    // 舌头
    if (Math.floor(frame/12) % 2 === 0) {
      ctx.strokeStyle = '#CC44CC'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-3*s, -s);
      ctx.lineTo(-5*s, -2*s); ctx.moveTo(-3*s, -s); ctx.lineTo(-5*s, 0);
      ctx.stroke();
    }
    // 暗影粒子
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 4; i++) {
      const px = 3*s + Math.sin(frame*0.04 + i) * 8*s;
      const py = -s + Math.cos(frame*0.05 + i*2) * 2*s;
      rect(ctx, px, py, s, s, '#9944DD');
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 凤凰
  function drawPetPhoenix(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const fly = Math.sin(frame * 0.05) * 2 * s;
    ctx.translate(0, fly);
    // 身体
    rect(ctx, -3*s, -2*s, 6*s, 4*s, '#FF4422');
    rect(ctx, -2*s, -3*s, 4*s, s, '#FF6644');
    // 头
    rect(ctx, -4*s, -6*s, 4*s, 4*s, '#FF6644');
    // 冠
    rect(ctx, -3*s, -8*s, s, 2*s, '#FFD700');
    rect(ctx, -1*s, -9*s, s, 3*s, '#FFD700');
    rect(ctx, -2*s, -9*s, s, s, '#FFEE44');
    // 眼
    rect(ctx, -3*s, -5*s, s, s, '#FFFFFF');
    rect(ctx, -3*s, -5*s, s/2, s/2, '#000000');
    // 喙
    rect(ctx, -6*s, -5*s, 2*s, s, '#FFAA00');
    // 翅膀（华丽展翅）
    const wingSpread = Math.sin(frame * 0.1) * 2 * s;
    // 左翼
    rect(ctx, -8*s, -4*s + wingSpread, 5*s, 2*s, '#FF3311');
    rect(ctx, -10*s, -3*s + wingSpread*0.7, 3*s, 2*s, '#FF6600');
    rect(ctx, -11*s, -2*s + wingSpread*0.5, 2*s, s, '#FFAA00');
    // 右翼
    rect(ctx, 3*s, -4*s + wingSpread, 5*s, 2*s, '#FF3311');
    rect(ctx, 7*s, -3*s + wingSpread*0.7, 3*s, 2*s, '#FF6600');
    rect(ctx, 9*s, -2*s + wingSpread*0.5, 2*s, s, '#FFAA00');
    // 尾羽（长长的彩色尾巴）
    const tailWave = Math.sin(frame * 0.06);
    ctx.strokeStyle = '#FF4400'; ctx.lineWidth = s * 1.5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s, 2*s);
    ctx.quadraticCurveTo(5*s, 6*s + tailWave*3*s, 3*s, 12*s);
    ctx.stroke();
    ctx.strokeStyle = '#FFD700'; ctx.lineWidth = s;
    ctx.beginPath(); ctx.moveTo(0, 2*s);
    ctx.quadraticCurveTo(4*s, 5*s + tailWave*2*s, 1*s, 11*s);
    ctx.stroke();
    ctx.strokeStyle = '#FF8800';
    ctx.beginPath(); ctx.moveTo(2*s, 2*s);
    ctx.quadraticCurveTo(6*s, 7*s + tailWave*4*s, 5*s, 13*s);
    ctx.stroke();
    // 火焰光效
    ctx.globalAlpha = 0.2 + Math.sin(frame * 0.1) * 0.1;
    ctx.shadowColor = '#FF4400'; ctx.shadowBlur = 12;
    rect(ctx, -3*s, -2*s, 6*s, 4*s, '#FF6644');
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    // 涅槃粒子
    for (let i = 0; i < 3; i++) {
      const px = -4*s + Math.sin(frame*0.03 + i*2.5) * 10*s;
      const py = -5*s + Math.cos(frame*0.04 + i*1.7) * 5*s;
      ctx.globalAlpha = 0.4 + Math.sin(frame*0.08 + i) * 0.3;
      rect(ctx, px, py, s, s, i%2===0 ? '#FFD700' : '#FF4400');
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ================================================================
  // 灵兽独立绘制接口 —— 根据灵兽模板ID绘制对应视觉
  // ================================================================
  function drawActiveBeast(ctx, x, y, s, beastTemplateId, frame) {
    switch (beastTemplateId) {
      case 'fire_cat':       drawPetFireCat(ctx, x, y, s, frame); break;
      case 'ice_wolf':       drawPetIceWolf(ctx, x, y, s, frame); break;
      case 'thunder_eagle':  drawPetThunderEagle(ctx, x, y, s, frame); break;
      case 'shadow_serpent':  drawPetShadowSerpent(ctx, x, y, s, frame); break;
      case 'jade_dragon':    drawPetDragon(ctx, x, y, s, frame); break;
      case 'phoenix':        drawPetPhoenix(ctx, x, y, s, frame); break;
      default: break;
    }
  }

  // ================================================================
  // 坐骑绘制
  // ================================================================
  
  // 仙鹤
  function drawMountCrane(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    // 身体
    rect(ctx, -3*s, -2*s, 8*s, 4*s, '#F8F8F8');
    rect(ctx, -2*s, -1*s, 6*s, 2*s, '#EEEEEE');
    // 翅膀
    const wingY = Math.sin(frame * 0.08) * s;
    rect(ctx, -5*s, -3*s + wingY, 3*s, 3*s, '#E0E0E0');
    rect(ctx, 5*s, -3*s + wingY, 3*s, 3*s, '#E0E0E0');
    // 脖子
    rect(ctx, 6*s, -5*s, 2*s, 4*s, '#F8F8F8');
    // 头
    rect(ctx, 5*s, -7*s, 4*s, 3*s, '#F8F8F8');
    // 红冠
    rect(ctx, 6*s, -8*s, 2*s, 1*s, '#FF0000');
    // 喙
    rect(ctx, 9*s, -6*s, 2*s, s, '#DDAA00');
    // 眼
    rect(ctx, 8*s, -6*s, s, s, '#111');
    // 腿
    rect(ctx, -1*s, 2*s, s, 4*s, '#DDAA00');
    rect(ctx, 2*s, 2*s, s, 4*s, '#DDAA00');
    // 尾羽
    rect(ctx, -6*s, -3*s, 2*s, s, '#111');
    rect(ctx, -7*s, -2*s, 2*s, s, '#111');
    ctx.restore();
  }

  // 麒麟
  function drawMountQilin(ctx, x, y, s, frame) {
    ctx.save();
    ctx.translate(x, y);
    const trot = Math.sin(frame * 0.1) * s;
    // 身体
    rect(ctx, -5*s, -3*s, 12*s, 5*s, '#CC8800');
    rect(ctx, -4*s, -2*s, 10*s, 3*s, '#DDAA33');
    // 鳞纹
    for(let i=0; i<4; i++) {
      rect(ctx, -3*s+i*3*s, -1*s, s, s, '#FFCC44');
    }
    // 头
    rect(ctx, 7*s, -6*s, 4*s, 4*s, '#CC8800');
    rect(ctx, 8*s, -5*s, 2*s, 2*s, '#DDAA33');
    // 角
    rect(ctx, 8*s, -9*s, s, 3*s, '#FFD700');
    rect(ctx, 9*s, -8*s, s, 2*s, '#FFD700');
    // 鬃毛（火焰）
    rect(ctx, 6*s, -7*s, s, 2*s, '#FF4400');
    rect(ctx, 5*s, -6*s, s, s, '#FF6600');
    // 眼
    rect(ctx, 10*s, -5*s, s, s, '#FF0000');
    // 腿（带步行）
    rect(ctx, -3*s, 2*s + trot, s, 3*s, '#CC8800');
    rect(ctx, 0, 2*s - trot, s, 3*s, '#CC8800');
    rect(ctx, 3*s, 2*s + trot, s, 3*s, '#CC8800');
    rect(ctx, 5*s, 2*s - trot, s, 3*s, '#CC8800');
    // 蹄子（火焰）
    ctx.globalAlpha = 0.6 + Math.sin(frame*0.1)*0.3;
    rect(ctx, -3*s, 5*s+trot, s, s, '#FF6600');
    rect(ctx, 0, 5*s-trot, s, s, '#FF6600');
    rect(ctx, 3*s, 5*s+trot, s, s, '#FF6600');
    rect(ctx, 5*s, 5*s-trot, s, s, '#FF6600');
    ctx.globalAlpha = 1;
    // 尾巴（火焰）
    rect(ctx, -7*s, -3*s, 2*s, s, '#FF4400');
    rect(ctx, -8*s + Math.sin(frame*0.08)*s, -4*s, s, 2*s, '#FF6600');
    rect(ctx, -9*s + Math.sin(frame*0.06)*s, -3*s, s, s, '#FFAA00');
    ctx.restore();
  }

  // ================================================================
  // 怪物像素精灵（不再用 emoji！）
  // ================================================================

  const monsterDrawers = {
    // ---- 炼气期 ----
    '灵鼠': (ctx, x, y, s, frame) => {
      // 灰色小老鼠
      rect(ctx, -3*s, -4*s, 6*s, 5*s, '#888'); // body
      rect(ctx, -2*s, -3*s, 4*s, 3*s, '#AAA'); // belly
      rect(ctx, -3*s, -6*s, 2*s, 3*s, '#888'); rect(ctx, 2*s, -6*s, 2*s, 3*s, '#888'); // ears
      rect(ctx, -2*s, -5*s, s, s, '#F8A0B0'); rect(ctx, 3*s, -5*s, s, s, '#F8A0B0'); // inner ear
      rect(ctx, -2*s, -3*s, s, s, '#F00'); rect(ctx, 2*s, -3*s, s, s, '#F00'); // eyes
      rect(ctx, 0, -2*s, s, s, '#FFA0A0'); // nose
      rect(ctx, 3*s, -1*s, 5*s, s, '#888'); // tail
      rect(ctx, 7*s, -2*s, s, 2*s, '#888');
    },
    '毒蛙': (ctx, x, y, s, frame) => {
      const hop = Math.abs(Math.sin(frame*0.08)) * 2 * s;
      ctx.translate(0, -hop);
      rect(ctx, -4*s, -3*s, 8*s, 5*s, '#228B22'); // body
      rect(ctx, -3*s, -2*s, 6*s, 3*s, '#90EE90'); // belly
      rect(ctx, -5*s, -5*s, 3*s, 3*s, '#228B22'); rect(ctx, 3*s, -5*s, 3*s, 3*s, '#228B22'); // eyes bump
      rect(ctx, -4*s, -5*s, 2*s, 2*s, '#FFFF00'); rect(ctx, 3*s, -5*s, 2*s, 2*s, '#FFFF00'); // eyes
      rect(ctx, -4*s, -4*s, s, s, '#111'); rect(ctx, 4*s, -4*s, s, s, '#111'); // pupils
      // legs
      rect(ctx, -5*s, 2*s, 2*s, 2*s, '#228B22');
      rect(ctx, 4*s, 2*s, 2*s, 2*s, '#228B22');
      // spots
      rect(ctx, -2*s, -2*s, s, s, '#006400');
      rect(ctx, 2*s, -1*s, s, s, '#006400');
    },
    '野狐': (ctx, x, y, s, frame) => {
      rect(ctx, -4*s, -4*s, 8*s, 6*s, '#D2691E'); // body
      rect(ctx, -3*s, -3*s, 6*s, 4*s, '#F4A460'); // lighter
      rect(ctx, -2*s, -2*s, 4*s, 2*s, '#FFF8DC'); // belly
      // head
      rect(ctx, -5*s, -8*s, 10*s, 5*s, '#D2691E');
      rect(ctx, -4*s, -7*s, 8*s, 3*s, '#F4A460');
      // ears (pointy)
      rect(ctx, -5*s, -11*s, 2*s, 3*s, '#D2691E');
      rect(ctx, -4*s, -10*s, s, s, '#111');
      rect(ctx, 4*s, -11*s, 2*s, 3*s, '#D2691E');
      rect(ctx, 5*s, -10*s, s, s, '#111');
      // eyes
      rect(ctx, -3*s, -7*s, 2*s, 2*s, '#FFD700');
      rect(ctx, -2*s, -6*s, s, s, '#111');
      rect(ctx, 2*s, -7*s, 2*s, 2*s, '#FFD700');
      rect(ctx, 3*s, -6*s, s, s, '#111');
      // nose
      rect(ctx, 0, -5*s, s, s, '#111');
      // tail
      const tailWag = Math.sin(frame*0.08)*2*s;
      ctx.strokeStyle = '#D2691E'; ctx.lineWidth = s*2; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(4*s,0); 
      ctx.quadraticCurveTo(8*s,-2*s+tailWag,10*s,-5*s); ctx.stroke();
      rect(ctx, 9*s, -6*s, 2*s, 2*s, '#FFF8DC'); // tail tip white
    },

    // ---- 筑基期 ----
    '石傀儡': (ctx, x, y, s, frame) => {
      // 大石头人
      rect(ctx, -5*s, -8*s, 10*s, 10*s, '#808080');
      rect(ctx, -4*s, -7*s, 8*s, 8*s, '#A0A0A0');
      // cracks
      rect(ctx, -2*s, -6*s, s, 3*s, '#606060');
      rect(ctx, 2*s, -4*s, s, 2*s, '#606060');
      // eyes (glowing)
      ctx.globalAlpha = 0.7 + Math.sin(frame*0.05)*0.3;
      rect(ctx, -3*s, -6*s, 2*s, 2*s, '#FF4400');
      rect(ctx, 2*s, -6*s, 2*s, 2*s, '#FF4400');
      ctx.globalAlpha = 1;
      // arms
      rect(ctx, -7*s, -5*s, 2*s, 6*s, '#808080');
      rect(ctx, 5*s, -5*s, 2*s, 6*s, '#808080');
      // fists
      rect(ctx, -8*s, 0, 3*s, 2*s, '#707070');
      rect(ctx, 5*s, 0, 3*s, 2*s, '#707070');
      // legs
      rect(ctx, -4*s, 2*s, 3*s, 3*s, '#808080');
      rect(ctx, 2*s, 2*s, 3*s, 3*s, '#808080');
    },
    '妖蛇': (ctx, x, y, s, frame) => {
      const slith = frame * 0.08;
      ctx.strokeStyle = '#6B2D8B';
      ctx.lineWidth = s*3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(6*s, 2*s);
      for(let i=0; i<6; i++){
        const cx = (5-i)*2*s;
        const cy = Math.sin(slith+i)*2*s;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      // lighter stripe
      ctx.strokeStyle = '#9B5DBB'; ctx.lineWidth = s;
      ctx.beginPath();
      ctx.moveTo(6*s, 2*s);
      for(let i=0; i<6; i++){
        ctx.lineTo((5-i)*2*s, Math.sin(slith+i)*2*s);
      }
      ctx.stroke();
      // head
      rect(ctx, -8*s, -2*s + Math.sin(slith)*2*s, 4*s, 3*s, '#6B2D8B');
      rect(ctx, -9*s, -s + Math.sin(slith)*2*s, s, s, '#FF0000'); // eye
      // fangs
      rect(ctx, -9*s, s + Math.sin(slith)*2*s, s, 2*s, '#FFFFFF');
    },
    '魔猿': (ctx, x, y, s, frame) => {
      const breathe = Math.sin(frame*0.06)*s;
      // body
      rect(ctx, -5*s, -6*s, 10*s, 9*s, '#4A2A0A');
      rect(ctx, -4*s, -5*s, 8*s, 7*s, '#6B3A1A');
      // chest
      rect(ctx, -3*s, -4*s, 6*s, 4*s, '#8B5A2A');
      // head
      rect(ctx, -4*s, -10*s, 8*s, 5*s, '#4A2A0A');
      rect(ctx, -3*s, -9*s, 6*s, 3*s, '#6B3A1A');
      // eyes (red)
      rect(ctx, -3*s, -9*s, 2*s, 2*s, '#FF0000');
      rect(ctx, 2*s, -9*s, 2*s, 2*s, '#FF0000');
      // mouth
      rect(ctx, -2*s, -6*s, 4*s, s, '#FF0000');
      rect(ctx, -1*s, -6*s, s, s, '#FFF'); rect(ctx, 1*s, -6*s, s, s, '#FFF');
      // arms (big)
      rect(ctx, -8*s, -5*s + breathe, 3*s, 8*s, '#4A2A0A');
      rect(ctx, 5*s, -5*s - breathe, 3*s, 8*s, '#4A2A0A');
      // legs
      rect(ctx, -4*s, 3*s, 3*s, 3*s, '#4A2A0A');
      rect(ctx, 2*s, 3*s, 3*s, 3*s, '#4A2A0A');
    },

    // ---- 金丹期 ----
    '冰魄蛛': (ctx, x, y, s, frame) => {
      // body
      rect(ctx, -4*s, -3*s, 8*s, 6*s, '#88BBDD');
      rect(ctx, -3*s, -2*s, 6*s, 4*s, '#AADDEE');
      // 8 legs
      const legAnim = Math.sin(frame*0.1);
      for(let side = -1; side <= 1; side += 2) {
        for(let i=0; i<4; i++) {
          const lx = side * 4*s;
          const ly = -2*s + i*2*s;
          const bend = legAnim * s * (i%2?1:-1);
          ctx.strokeStyle = '#88BBDD'; ctx.lineWidth = s; ctx.lineCap='round';
          ctx.beginPath(); ctx.moveTo(lx, ly);
          ctx.lineTo(lx + side*5*s, ly + bend);
          ctx.lineTo(lx + side*7*s, ly + 2*s + bend);
          ctx.stroke();
        }
      }
      // eyes (8 small)
      for(let i=0; i<4; i++) {
        rect(ctx, -3*s+i*2*s, -3*s, s, s, '#4444FF');
      }
      // frost particles
      ctx.globalAlpha = 0.4;
      for(let i=0; i<3; i++) {
        const fx = Math.sin(frame*0.03+i*2)*6*s;
        const fy = Math.cos(frame*0.04+i*2)*4*s - 2*s;
        rect(ctx, fx, fy, s, s, '#FFFFFF');
      }
      ctx.globalAlpha = 1;
    },
    '火鸦': (ctx, x, y, s, frame) => {
      const flap = Math.sin(frame*0.12) * 3*s;
      // wings
      rect(ctx, -8*s, -4*s+flap, 5*s, 3*s, '#CC2200');
      rect(ctx, 3*s, -4*s-flap, 5*s, 3*s, '#CC2200');
      rect(ctx, -9*s, -3*s+flap, 2*s, s, '#FF4400');
      rect(ctx, 7*s, -3*s-flap, 2*s, s, '#FF4400');
      // body
      rect(ctx, -3*s, -3*s, 6*s, 5*s, '#1A1A1A');
      rect(ctx, -2*s, -2*s, 4*s, 3*s, '#333');
      // head
      rect(ctx, -2*s, -6*s, 4*s, 4*s, '#1A1A1A');
      // eyes (fire)
      rect(ctx, -2*s, -5*s, s, s, '#FF8800');
      rect(ctx, 2*s, -5*s, s, s, '#FF8800');
      // beak
      rect(ctx, 0, -4*s, s, 2*s, '#FF6600');
      // tail fire
      ctx.globalAlpha = 0.6 + Math.sin(frame*0.08)*0.3;
      rect(ctx, -2*s, 2*s, s, 2*s, '#FF4400');
      rect(ctx, 0, 2*s, s, 3*s, '#FF8800');
      rect(ctx, 2*s, 2*s, s, 2*s, '#FF4400');
      ctx.globalAlpha = 1;
    },
    '雷豹': (ctx, x, y, s, frame) => {
      // body
      rect(ctx, -5*s, -4*s, 10*s, 6*s, '#CCAA00');
      rect(ctx, -4*s, -3*s, 8*s, 4*s, '#DDBB22');
      // spots
      rect(ctx, -3*s, -3*s, s, s, '#111'); rect(ctx, 0, -2*s, s, s, '#111');
      rect(ctx, 2*s, -3*s, s, s, '#111'); rect(ctx, -1*s, 0, s, s, '#111');
      // head
      rect(ctx, 5*s, -6*s, 5*s, 5*s, '#CCAA00');
      rect(ctx, 6*s, -5*s, 3*s, 3*s, '#DDBB22');
      // eyes
      rect(ctx, 6*s, -5*s, 2*s, 2*s, '#4444FF');
      rect(ctx, 6*s, -5*s, s, s, '#88DDFF');
      // ears
      rect(ctx, 6*s, -8*s, 2*s, 2*s, '#CCAA00');
      rect(ctx, 9*s, -8*s, 2*s, 2*s, '#CCAA00');
      // fangs
      rect(ctx, 10*s, -3*s, s, 2*s, '#FFF');
      // lightning sparks
      ctx.globalAlpha = 0.5 + Math.sin(frame*0.06)*0.4;
      rect(ctx, -3*s, -6*s, s, s, '#FFFF00');
      rect(ctx, 3*s, -5*s, s, s, '#FFFF44');
      rect(ctx, -1*s, -7*s, s, s, '#FFFF00');
      ctx.globalAlpha = 1;
      // legs
      rect(ctx, -4*s, 2*s, 2*s, 2*s, '#CCAA00');
      rect(ctx, 0, 2*s, 2*s, 2*s, '#CCAA00');
      rect(ctx, 4*s, 2*s, 2*s, 2*s, '#CCAA00');
      // tail
      ctx.strokeStyle = '#CCAA00'; ctx.lineWidth = s*1.5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(-5*s, -1*s);
      ctx.quadraticCurveTo(-9*s, -3*s+Math.sin(frame*0.08)*2*s, -8*s, -6*s);
      ctx.stroke();
    },

    // ---- 元婴期 ----
    '幽冥鬼将': (ctx, x, y, s, frame) => {
      const hover = Math.sin(frame*0.04)*2*s;
      ctx.translate(0, hover);
      // 幽魂拖影
      ctx.globalAlpha = 0.15;
      rect(ctx, -5*s, 2*s, 10*s, 8*s, '#44FF88');
      ctx.globalAlpha = 1;
      // armor body
      rect(ctx, -5*s, -6*s, 10*s, 9*s, '#2A2A4A');
      rect(ctx, -4*s, -5*s, 8*s, 7*s, '#3A3A5A');
      // shoulder pads
      rect(ctx, -7*s, -6*s, 3*s, 3*s, '#44FF88');
      rect(ctx, 4*s, -6*s, 3*s, 3*s, '#44FF88');
      // helm
      rect(ctx, -4*s, -10*s, 8*s, 5*s, '#2A2A4A');
      rect(ctx, -3*s, -9*s, 6*s, 3*s, '#3A3A5A');
      // eyes (ghost green)
      ctx.globalAlpha = 0.7+Math.sin(frame*0.06)*0.3;
      rect(ctx, -2*s, -9*s, 2*s, 2*s, '#44FF88');
      rect(ctx, 1*s, -9*s, 2*s, 2*s, '#44FF88');
      ctx.globalAlpha = 1;
      // ghost weapon
      rect(ctx, 7*s, -8*s, s, 12*s, '#44FF88');
      rect(ctx, 6*s, -9*s, 3*s, s, '#44FF88');
    },
    '妖龙': (ctx, x, y, s, frame) => {
      const bob = Math.sin(frame*0.05)*2*s;
      ctx.translate(0, bob);
      // body (serpentine)
      ctx.strokeStyle = '#8B0000'; ctx.lineWidth = s*4; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(6*s, 2*s);
      for(let i=0;i<5;i++){
        ctx.quadraticCurveTo(
          (4-i)*3*s, (i%2?-3:3)*s + Math.sin(frame*0.06+i)*s,
          (3-i)*3*s, 0
        );
      }
      ctx.stroke();
      // head
      rect(ctx, -8*s, -4*s, 6*s, 6*s, '#8B0000');
      rect(ctx, -7*s, -3*s, 4*s, 4*s, '#AA2222');
      // horns
      rect(ctx, -7*s, -7*s, s, 3*s, '#FFD700');
      rect(ctx, -4*s, -7*s, s, 3*s, '#FFD700');
      // eyes
      rect(ctx, -7*s, -3*s, 2*s, 2*s, '#FFFF00');
      rect(ctx, -6*s, -2*s, s, s, '#111');
      // teeth
      rect(ctx, -8*s, 1*s, s, s, '#FFF');
      rect(ctx, -6*s, 1*s, s, s, '#FFF');
      // fire breath particles
      ctx.globalAlpha = 0.4+Math.sin(frame*0.08)*0.3;
      rect(ctx, -10*s, -2*s, s, s, '#FF4400');
      rect(ctx, -11*s, -1*s, s, s, '#FF8800');
      rect(ctx, -12*s, 0, s, s, '#FFAA00');
      ctx.globalAlpha = 1;
    },
    '魔修': (ctx, x, y, s, frame) => {
      const hover = Math.sin(frame*0.04)*s;
      ctx.translate(0, hover);
      // dark robe
      rect(ctx, -5*s, -5*s, 10*s, 12*s, '#1A0A2E');
      rect(ctx, -4*s, -4*s, 8*s, 10*s, '#2A1A3E');
      // hood
      rect(ctx, -4*s, -10*s, 8*s, 6*s, '#1A0A2E');
      rect(ctx, -3*s, -9*s, 6*s, 4*s, '#0A0018');
      // eyes in shadow
      ctx.globalAlpha = 0.7+Math.sin(frame*0.05)*0.3;
      rect(ctx, -2*s, -8*s, 2*s, 2*s, '#FF00FF');
      rect(ctx, 1*s, -8*s, 2*s, 2*s, '#FF00FF');
      ctx.globalAlpha = 1;
      // staff
      rect(ctx, 6*s, -12*s, s, 18*s, '#443366');
      // orb
      ctx.globalAlpha = 0.5+Math.sin(frame*0.04)*0.3;
      ctx.beginPath(); ctx.arc(6.5*s, -13*s, 2*s, 0, Math.PI*2);
      ctx.fillStyle = '#FF00FF'; ctx.fill();
      ctx.globalAlpha = 1;
      // dark particles
      for(let i=0;i<3;i++){
        ctx.globalAlpha = 0.3;
        const px = Math.sin(frame*0.03+i*2)*8*s;
        const py = Math.cos(frame*0.04+i*2)*5*s-3*s;
        rect(ctx, px, py, s, s, '#8800AA');
      }
      ctx.globalAlpha = 1;
    },

    // ---- 化神期 ----
    '天魔': (ctx, x, y, s, frame) => {
      const pulse = Math.sin(frame*0.03);
      // dark aura
      ctx.globalAlpha = 0.1+pulse*0.05;
      ctx.beginPath(); ctx.arc(0, -3*s, 16*s, 0, Math.PI*2);
      ctx.fillStyle = '#440000'; ctx.fill();
      ctx.globalAlpha = 1;
      // body
      rect(ctx, -6*s, -6*s, 12*s, 10*s, '#330000');
      rect(ctx, -5*s, -5*s, 10*s, 8*s, '#550000');
      // head
      rect(ctx, -4*s, -11*s, 8*s, 6*s, '#330000');
      // horns
      rect(ctx, -5*s, -14*s, 2*s, 4*s, '#880000');
      rect(ctx, 4*s, -14*s, 2*s, 4*s, '#880000');
      // eyes
      rect(ctx, -3*s, -10*s, 2*s, 2*s, '#FF0000');
      rect(ctx, 2*s, -10*s, 2*s, 2*s, '#FF0000');
      // mouth
      rect(ctx, -2*s, -7*s, 4*s, 2*s, '#FF0000');
      // wings
      rect(ctx, -10*s, -8*s, 4*s, 6*s, '#440000');
      rect(ctx, 6*s, -8*s, 4*s, 6*s, '#440000');
      rect(ctx, -12*s, -6*s, 2*s, 4*s, '#330000');
      rect(ctx, 10*s, -6*s, 2*s, 4*s, '#330000');
      // claws
      rect(ctx, -7*s, 2*s, 2*s, 3*s, '#550000');
      rect(ctx, 5*s, 2*s, 2*s, 3*s, '#550000');
    },
    '九尾妖狐': (ctx, x, y, s, frame) => {
      // body
      rect(ctx, -5*s, -5*s, 10*s, 7*s, '#FFD700');
      rect(ctx, -4*s, -4*s, 8*s, 5*s, '#FFF0B0');
      // head
      rect(ctx, -4*s, -10*s, 8*s, 6*s, '#FFD700');
      // ears
      rect(ctx, -5*s, -13*s, 2*s, 3*s, '#FFD700');
      rect(ctx, 4*s, -13*s, 2*s, 3*s, '#FFD700');
      // eyes
      rect(ctx, -3*s, -9*s, 2*s, 2*s, '#FF0088');
      rect(ctx, 2*s, -9*s, 2*s, 2*s, '#FF0088');
      // 9 tails
      for(let i=0; i<9; i++){
        const angle = (i-4)*0.3 + Math.sin(frame*0.04+i*0.5)*0.15;
        ctx.save();
        ctx.translate(-5*s, 0);
        ctx.rotate(angle);
        ctx.strokeStyle = i%3===0?'#FFFFFF':i%3===1?'#FFD700':'#FFF0B0';
        ctx.lineWidth = s*1.5; ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(0,0);
        ctx.quadraticCurveTo(-4*s, -2*s+Math.sin(frame*0.05+i)*s, -8*s, -1*s);
        ctx.stroke();
        ctx.restore();
      }
      // legs
      rect(ctx, -4*s, 2*s, 2*s, 2*s, '#FFD700');
      rect(ctx, 3*s, 2*s, 2*s, 2*s, '#FFD700');
    },
    '血煞魔尊': (ctx, x, y, s, frame) => {
      const pulse = Math.sin(frame*0.04);
      // blood aura
      ctx.globalAlpha = 0.12+pulse*0.06;
      ctx.beginPath();ctx.arc(0,-4*s,18*s,0,Math.PI*2);
      ctx.fillStyle = '#FF0000'; ctx.fill();
      ctx.globalAlpha = 1;
      // body (massive)
      rect(ctx, -7*s, -7*s, 14*s, 12*s, '#4A0000');
      rect(ctx, -6*s, -6*s, 12*s, 10*s, '#660000');
      // armor plates
      rect(ctx, -5*s, -5*s, 10*s, 2*s, '#880000');
      rect(ctx, -5*s, -1*s, 10*s, 2*s, '#880000');
      // head
      rect(ctx, -5*s, -12*s, 10*s, 6*s, '#4A0000');
      // crown/horns
      rect(ctx, -6*s, -15*s, 2*s, 4*s, '#FFD700');
      rect(ctx, -2*s, -14*s, s, 3*s, '#FFD700');
      rect(ctx, 2*s, -14*s, s, 3*s, '#FFD700');
      rect(ctx, 5*s, -15*s, 2*s, 4*s, '#FFD700');
      // eyes
      ctx.globalAlpha = 0.7+pulse*0.3;
      rect(ctx, -3*s, -11*s, 2*s, 2*s, '#FF0000');
      rect(ctx, 2*s, -11*s, 2*s, 2*s, '#FF0000');
      ctx.globalAlpha = 1;
      // blood weapon
      rect(ctx, 8*s, -14*s, 2*s, 18*s, '#880000');
      rect(ctx, 7*s, -14*s, 4*s, 3*s, '#AA0000');
    },

    // ---- 大乘期 ----
    '天劫雷兽': (ctx, x, y, s, frame) => {
      // lightning sparks background
      ctx.globalAlpha = 0.15+Math.sin(frame*0.03)*0.1;
      for(let i=0;i<5;i++){
        rect(ctx, Math.sin(frame*0.02+i*1.3)*12*s, Math.cos(frame*0.03+i)*10*s-4*s, s*2,s*2,'#FFFF44');
      }
      ctx.globalAlpha = 1;
      // body
      rect(ctx, -6*s, -6*s, 12*s, 8*s, '#333388');
      rect(ctx, -5*s, -5*s, 10*s, 6*s, '#4444AA');
      // electric stripes
      for(let i=0;i<3;i++){
        rect(ctx, -4*s+i*3*s, -4*s, s, 4*s, '#FFFF44');
      }
      // head
      rect(ctx, -5*s, -11*s, 10*s, 6*s, '#333388');
      // horn
      rect(ctx, -1*s, -14*s, 2*s, 4*s, '#FFFF44');
      // eyes
      rect(ctx, -3*s, -10*s, 2*s, 2*s, '#FFFFFF');
      rect(ctx, 2*s, -10*s, 2*s, 2*s, '#FFFFFF');
      // mouth
      rect(ctx, -2*s, -7*s, 4*s, s, '#FFFF44');
      // legs
      rect(ctx, -5*s, 2*s, 3*s, 3*s, '#333388');
      rect(ctx, 3*s, 2*s, 3*s, 3*s, '#333388');
      // lightning bolts
      ctx.strokeStyle = '#FFFF44'; ctx.lineWidth = s*1.5;
      ctx.beginPath();
      ctx.moveTo(-1*s,-14*s);ctx.lineTo(-4*s,-18*s);ctx.lineTo(-2*s,-16*s);ctx.lineTo(-5*s,-20*s);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s,-14*s);ctx.lineTo(4*s,-18*s);ctx.lineTo(2*s,-16*s);ctx.lineTo(5*s,-20*s);
      ctx.stroke();
    },
    '混沌古兽': (ctx, x, y, s, frame) => {
      // swirling void
      ctx.globalAlpha = 0.1;
      for(let i=0;i<8;i++){
        const angle = frame*0.01+i*Math.PI/4;
        ctx.beginPath();ctx.arc(Math.cos(angle)*10*s,Math.sin(angle)*8*s-4*s,3*s,0,Math.PI*2);
        ctx.fillStyle = i%2?'#440066':'#220044'; ctx.fill();
      }
      ctx.globalAlpha = 1;
      // body (amorphous)
      rect(ctx, -7*s, -7*s, 14*s, 10*s, '#220044');
      rect(ctx, -6*s, -6*s, 12*s, 8*s, '#330066');
      // many eyes
      const eyeColor = '#88FF88';
      rect(ctx, -4*s, -5*s, 2*s, 2*s, eyeColor);
      rect(ctx, 0, -6*s, 2*s, 2*s, eyeColor);
      rect(ctx, 3*s, -4*s, 2*s, 2*s, eyeColor);
      rect(ctx, -2*s, -3*s, s, s, eyeColor);
      rect(ctx, 4*s, -2*s, s, s, eyeColor);
      // tentacles
      for(let i=0;i<4;i++){
        const tx = -6*s+i*4*s;
        ctx.strokeStyle = '#330066'; ctx.lineWidth = s*2; ctx.lineCap='round';
        ctx.beginPath();ctx.moveTo(tx,3*s);
        ctx.quadraticCurveTo(tx+Math.sin(frame*0.05+i)*3*s, 6*s, tx+Math.sin(frame*0.03+i)*4*s, 10*s);
        ctx.stroke();
      }
      // mouth (void)
      rect(ctx, -2*s, 0, 4*s, 2*s, '#000000');
      rect(ctx, -1*s, 0, 2*s, s, '#440066');
    },
    '太古魔神': (ctx, x, y, s, frame) => {
      const pulse = Math.sin(frame*0.025);
      // cosmic aura
      ctx.globalAlpha = 0.1+pulse*0.05;
      const g = ctx.createRadialGradient(0,-5*s,3*s,0,-5*s,25*s);
      g.addColorStop(0,'#FF4400');g.addColorStop(0.5,'#880000');g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-5*s,25*s,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha = 1;
      // body
      rect(ctx, -8*s, -8*s, 16*s, 13*s, '#220000');
      rect(ctx, -7*s, -7*s, 14*s, 11*s, '#440000');
      // runes on body
      for(let i=0;i<4;i++){
        ctx.globalAlpha = 0.4+Math.sin(frame*0.03+i)*0.3;
        rect(ctx, -5*s+i*3*s, -5*s, s, s, '#FF8800');
        rect(ctx, -4*s+i*3*s, -2*s, s, s, '#FF8800');
      }
      ctx.globalAlpha = 1;
      // head
      rect(ctx, -6*s, -14*s, 12*s, 7*s, '#220000');
      // crown of fire
      for(let i=0;i<5;i++){
        const fh = 2+Math.sin(frame*0.06+i)*2;
        rect(ctx, -5*s+i*2.5*s, -14*s-fh*s, s, fh*s, '#FF4400');
      }
      // three eyes
      rect(ctx, -4*s, -12*s, 2*s, 2*s, '#FF0000');
      rect(ctx, -s, -13*s, 2*s, 2*s, '#FF8800'); // third eye
      rect(ctx, 3*s, -12*s, 2*s, 2*s, '#FF0000');
      // arms
      rect(ctx, -12*s, -6*s, 4*s, 8*s, '#330000');
      rect(ctx, 8*s, -6*s, 4*s, 8*s, '#330000');
      // hands with fire
      ctx.globalAlpha = 0.5+pulse*0.3;
      rect(ctx, -13*s, 0, 3*s, 3*s, '#FF4400');
      rect(ctx, 10*s, 0, 3*s, 3*s, '#FF4400');
      ctx.globalAlpha = 1;
      // legs
      rect(ctx, -6*s, 5*s, 4*s, 4*s, '#220000');
      rect(ctx, 3*s, 5*s, 4*s, 4*s, '#220000');
    },
  };

  // ================================================================
  // 公开接口
  // ================================================================

  function drawMouseByRealm(ctx, x, y, s, realmIndex, frame, attacking) {
    const drawFns = [
      drawMouseRealm0, drawMouseRealm1, drawMouseRealm2,
      drawMouseRealm3, drawMouseRealm4, drawMouseRealm5,
    ];
    const fn = drawFns[realmIndex] || drawFns[0];
    fn(ctx, x, y, s, frame, attacking);
  }

  function drawMonsterByName(ctx, name, x, y, s, frame, hitAnim) {
    const drawer = monsterDrawers[name];
    if (!drawer) {
      // fallback: generic blob
      ctx.save();
      ctx.translate(x, y);
      const shake = hitAnim > 0 ? Math.sin(hitAnim*2)*3*s : 0;
      ctx.translate(shake, 0);
      rect(ctx, -4*s, -4*s, 8*s, 8*s, '#FF4488');
      rect(ctx, -2*s, -3*s, s, s, '#FFF');
      rect(ctx, 2*s, -3*s, s, s, '#FFF');
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(x, y);
    const shake = hitAnim > 0 ? Math.sin(hitAnim*2)*3*s : 0;
    const alpha = hitAnim > 0 ? 0.6 + 0.4*(1-hitAnim/10) : 1;
    // 受击闪白
    ctx.translate(shake, 0);
    ctx.globalAlpha = alpha;
    drawer(ctx, x, y, s, frame);
    
    // 受击白色叠加
    if (hitAnim > 5) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (hitAnim - 5) / 10;
      drawer(ctx, x, y, s, frame);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // 绘制怪物血条
  function drawMonsterHPBar(ctx, x, y, s, hpPercent, name) {
    const barW = 60;
    const barH = 6;
    // bg
    rect(ctx, x - barW/2, y, barW, barH, '#333');
    // fill
    const color = hpPercent > 0.5 ? '#44AA44' : hpPercent > 0.2 ? '#DDAA44' : '#DD4444';
    rect(ctx, x - barW/2, y, barW * Math.max(0, hpPercent), barH, color);
    // border
    ctx.strokeStyle = '#666';
    ctx.strokeRect(x - barW/2, y, barW, barH);
    // name
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.fillText(name, x, y - 4);
  }

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

  return {
    drawMouseByRealm,
    drawMonsterByName,
    drawMonsterHPBar,
    drawActiveBeast,
    drawWeaponWithSkin,
    rect,
    px,
  };

})();

// Export for module usage
if (typeof module !== 'undefined') module.exports = Sprites;
