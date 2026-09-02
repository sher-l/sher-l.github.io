/* Hero 动效引擎（与 bio-dev 一致）：连线网络 + 上升粉尘 + 粉尘扰动网络。
   粉尘上升途中靠近网络节点时拉出金色细线（连上）并轻微拖拽节点；
   飞离连线范围的瞬间节点被向上弹开（挣脱）。
   数量/尺寸/速度由 CSS 变量 --fx-* 控制；仅在桌面端全量运行，移动端减半。 */
(function () {
  "use strict";
  var canvas = document.getElementById("homeHeroCanvas");
  if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var ctx = canvas.getContext("2d");
  var rootCS = getComputedStyle(document.documentElement);
  function vvar(n, fallback) {
    var v = parseFloat(rootCS.getPropertyValue(n));
    return isNaN(v) ? fallback : v;
  }
  var small = window.innerWidth < 700;
  var DUST_N = Math.max(6, Math.round(vvar("--fx-dust-count", 18) * (small ? 0.5 : 1)));
  var NODE_N = small ? 34 : 64;
  var LINK = 135;                       /* 网络节点连线距离 */
  var DUST_LINK = 110;                  /* 粉尘与节点的连接距离 */
  var TRAVEL = vvar("--fx-dust-travel", 360);
  var DUST_SPEED = TRAVEL / vvar("--fx-dust-duration", 15) / 60;   /* px/帧 */
  var DUST_SIZE = vvar("--fx-dust-size", 4);
  var W, H, nodes = [], motes = [], raf, t = 0;

  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function init() {
    nodes = [];
    for (var i = 0; i < NODE_N; i++) nodes.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.7 + 0.9,
      gold: Math.random() < 0.12,
      linked: false
    });
    motes = [];
    for (var j = 0; j < DUST_N; j++) motes.push({
      x: Math.random() * W, y: Math.random() * H,
      phase: Math.random() * Math.PI * 2,
      sp: DUST_SPEED * (0.7 + Math.random() * 0.6),
      r: DUST_SIZE * (0.75 + Math.random() * 0.5),
      deep: Math.random() < 0.35
    });
  }
  function step() {
    t += 1 / 60;
    ctx.clearRect(0, 0, W, H);

    /* 网络漂移（限速，防止被扰动力加速失控） */
    for (var i = 0; i < nodes.length; i++) {
      var p = nodes[i];
      var s = Math.hypot(p.vx, p.vy);
      if (s > 1.3) { p.vx *= 1.3 / s; p.vy *= 1.3 / s; }
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }

    /* 网络：绿系节点间连线 */
    ctx.lineWidth = 1;
    for (var a = 0; a < nodes.length; a++) for (var b = a + 1; b < nodes.length; b++) {
      var n1 = nodes[a], n2 = nodes[b];
      var dx = n1.x - n2.x, dy = n1.y - n2.y, d2 = dx * dx + dy * dy;
      if (d2 < LINK * LINK) {
        var o = (1 - Math.sqrt(d2) / LINK) * 0.3;
        ctx.strokeStyle = "rgba(111,199,164," + o + ")";
        ctx.beginPath(); ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y); ctx.stroke();
      }
    }

    /* 粉尘：上升 + 与节点互动 */
    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      mo.y -= mo.sp;
      var px = mo.x + Math.sin(t * 1.4 + mo.phase) * 8;
      if (mo.y < -12) { mo.y = H + 8; mo.x = Math.random() * W; }
      var fade = Math.max(0, Math.min(1, (H - mo.y) / (H * 0.12), mo.y / (H * 0.25)));

      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        var ndx = n.x - px, ndy = n.y - mo.y, dist = Math.hypot(ndx, ndy) || 1;
        if (dist < DUST_LINK) {
          var lo = (1 - dist / DUST_LINK) * 0.5 * fade;
          if (lo > 0.02) {
            ctx.strokeStyle = "rgba(232,201,122," + lo + ")";
            ctx.beginPath(); ctx.moveTo(px, mo.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
          n.vx += (px - n.x) / dist * 0.004;
          n.vy += (mo.y - n.y) / dist * 0.012;
          n.linked = true;
        } else if (n.linked) {
          n.vy -= 0.12;
          n.linked = false;
        }
      }

      var core = mo.deep ? "60,147,115" : "111,199,164";
      ctx.fillStyle = "rgba(" + core + "," + 0.22 * fade + ")";
      ctx.beginPath(); ctx.arc(px, mo.y, mo.r * 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(" + core + "," + 0.85 * fade + ")";
      ctx.beginPath(); ctx.arc(px, mo.y, mo.r, 0, Math.PI * 2); ctx.fill();
    }

    /* 网络节点 */
    for (var q = 0; q < nodes.length; q++) {
      var pn = nodes[q];
      ctx.fillStyle = pn.gold ? "rgba(232,201,122,0.85)" : "rgba(111,199,164,0.85)";
      ctx.beginPath(); ctx.arc(pn.x, pn.y, pn.r, 0, Math.PI * 2); ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }
  resize(); init(); step();
  window.addEventListener("resize", function () { cancelAnimationFrame(raf); resize(); init(); step(); });
})();
