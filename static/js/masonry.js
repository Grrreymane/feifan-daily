/* Pinterest 式瀑布流：按 DOM 顺序（时间倒序）横向分配到最短列 */
(function () {
  function colCount() {
    var w = window.innerWidth;
    if (w <= 420) return 1;
    if (w <= 700) return 2;
    if (w <= 1000) return 3;
    if (w <= 1400) return 3;
    return 4;
  }

  function layout(grid) {
    var cards = grid.querySelectorAll('.gallery-card');
    var n = colCount();
    var cols = [];
    var i;
    for (i = 0; i < n; i++) {
      var c = document.createElement('div');
      c.className = 'masonry-col';
      cols.push(c);
    }
    // 按顺序投放：第 k 张进入前 n 张的对应列，之后每次进最短列
    for (i = 0; i < cards.length; i++) {
      var target;
      if (i < n) {
        target = cols[i];
      } else {
        target = cols[0];
        for (var j = 1; j < cols.length; j++) {
          if (cols[j].offsetHeight < target.offsetHeight) target = cols[j];
        }
      }
      target.appendChild(cards[i]);
    }
    grid.innerHTML = '';
    for (i = 0; i < cols.length; i++) grid.appendChild(cols[i]);
  }

  function init() {
    var grids = document.querySelectorAll('.gallery-grid');
    if (!grids.length) return;
    grids.forEach(function (grid) {
      if (grid.dataset.masonry === 'ready') return;
      grid.classList.add('masonry');
      layout(grid);
      grid.dataset.masonry = 'ready';
    });
  }

  var timer = null;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      document.querySelectorAll('.gallery-grid').forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.gallery-card'));
        grid.innerHTML = '';
        cards.forEach(function (c) { grid.appendChild(c); });
        grid.dataset.masonry = '';
        layout(grid);
        grid.dataset.masonry = 'ready';
      });
    }, 150);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // 图片懒加载完成后重排，避免高度算错
  window.addEventListener('load', function () {
    document.querySelectorAll('.gallery-grid').forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.gallery-card'));
      grid.innerHTML = '';
      cards.forEach(function (c) { grid.appendChild(c); });
      grid.dataset.masonry = '';
      layout(grid);
      grid.dataset.masonry = 'ready';
    });
  });
})();
