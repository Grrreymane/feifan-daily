/* 行优先瀑布流：保持 grid 的横向时间顺序（1-4 在第一排，5-8 在第二排），
   由脚本按每张实际高度决定跨多少行，图片不裁切、比例保留 */
(function () {
  var ROW = 8;   // 行高单位，需与 CSS .gallery-grid.masonry 的 grid-auto-rows 一致
  var GAP = 12;  // 卡片垂直间距

  function gapOf(grid) {
    var w = window.innerWidth;
    return w <= 700 ? 8 : 12;
  }

  function layout(grid) {
    var gap = gapOf(grid);
    var cards = grid.querySelectorAll('.gallery-card');
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      c.style.gridRowEnd = '';
      var h = c.getBoundingClientRect().height;
      if (!h) continue;
      var span = Math.ceil((h + gap) / ROW);
      c.style.gridRowEnd = 'span ' + span;
    }
  }

  function relayoutAll() {
    var grids = document.querySelectorAll('.gallery-grid');
    for (var i = 0; i < grids.length; i++) layout(grids[i]);
  }

  function init() {
    var grids = document.querySelectorAll('.gallery-grid');
    if (!grids.length) return;
    for (var i = 0; i < grids.length; i++) {
      grids[i].classList.add('masonry');
      layout(grids[i]);
    }
    // 图片懒加载完成后高度才确定，需重算
    var imgs = document.querySelectorAll('.gallery-card img');
    var pending = imgs.length;
    function done() {
      pending--;
      if (pending <= 0) relayoutAll();
    }
    for (var j = 0; j < imgs.length; j++) {
      if (imgs[j].complete) {
        pending--;
      } else {
        imgs[j].addEventListener('load', done, { once: true });
        imgs[j].addEventListener('error', done, { once: true });
      }
    }
    if (pending <= 0) relayoutAll();
  }

  var timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(relayoutAll, 150);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  window.addEventListener('load', relayoutAll);
})();
