/* Hero 动效引擎（与 bio-dev 一致）：连线网络 + 上升粉尘 + 粉尘扰动网络。
   物理：每个节点有缓慢漂移的锚点（home），节点经弹簧追随锚点；
   粉尘靠近时拉出金色细线并把节点拖走一小段（限幅 24px），
   飞离瞬间节点受到向上冲量被"挣脱"，随后弹簧把它拉回锚点回弹——网络整体不散。
   数量/尺寸/速度由 CSS 变量 --fx-* 控制；移动端减半；尊重系统减少动效偏好。 */
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
    for (var i = 0; i < NODE_N; i++) {
      var x = Math.random() * W, y = Math.random() * H;
      nodes.push({
        x: x, y: y, vx: 0, vy: 0,             /* 实际位置：弹簧追随锚点 */
        hx: x, hy: y,                          /* 锚点：漫游漂移 */
        hvx: (Math.random() - 0.5) * 0.5, hvy: (Math.random() - 0.5) * 0.5,
        tvx: (Math.random() - 0.5) * 0.7, tvy: (Math.random() - 0.5) * 0.7,
        reT: 120 + Math.random() * 240,
        r: Math.random() * 1.7 + 0.9,
        gold: Math.random() < 0.12,
        linked: false
      });
    }
    motes = [];
    for (var j = 0; j < DUST_N; j++) {
      var ang = Math.random() * Math.PI * 2;
      var sp = DUST_SPEED * (0.25 + Math.random() * 0.5);
      motes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        sp: sp,
        tang: Math.random() * Math.PI * 2,
        reT: 180 + Math.random() * 300,
        r: DUST_SIZE * (0.5 + Math.pow(Math.random(), 1.6)),
        deep: Math.random() < 0.35,
        phase: Math.random() * Math.PI * 2,
        freq: 0.8 + Math.random() * 1.2
      });
    }
  }
  function step() {
    t += 1 / 60;
    ctx.clearRect(0, 0, W, H);

    /* 锚点漫游（定期换向 + 平滑转向）+ 弹簧回位 */
    for (var i = 0; i < nodes.length; i++) {
      var p = nodes[i];
      p.reT -= 1;
      if (p.reT <= 0) {
        p.tvx = (Math.random() - 0.5) * 0.7;
        p.tvy = (Math.random() - 0.5) * 0.7;
        p.reT = 120 + Math.random() * 240;
      }
      p.hvx += (p.tvx - p.hvx) * 0.02;
      p.hvy += (p.tvy - p.hvy) * 0.02;
      p.hx += p.hvx; p.hy += p.hvy;
      if (p.hx < 0 || p.hx > W) p.hvx *= -1;
      if (p.hy < 0 || p.hy > H) p.hvy *= -1;
      p.vx += (p.hx - p.x) * 0.012;
      p.vy += (p.hy - p.y) * 0.012;
      p.vx *= 0.9; p.vy *= 0.9;
      p.x += p.vx; p.y += p.vy;
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

    /* 粉尘：随机方向漫游 + 呼吸明暗 + 与节点互动 */
    for (var m = 0; m < motes.length; m++) {
      var mo = motes[m];
      mo.reT -= 1;
      if (mo.reT <= 0) { mo.tang = Math.random() * Math.PI * 2; mo.reT = 180 + Math.random() * 300; }
      mo.vx += (Math.cos(mo.tang) * mo.sp - mo.vx) * 0.01;
      mo.vy += (Math.sin(mo.tang) * mo.sp - mo.vy) * 0.01;
      mo.x += mo.vx; mo.y += mo.vy;
      if (mo.x < -12) mo.x = W + 12; else if (mo.x > W + 12) mo.x = -12;
      if (mo.y < -12) mo.y = H + 12; else if (mo.y > H + 12) mo.y = -12;
      var breath = 0.18 + 0.82 * (0.5 + 0.5 * Math.sin(t * mo.freq * 2 + mo.phase));
      var rb = mo.r * (0.88 + 0.12 * Math.sin(t * mo.freq * 2 + mo.phase));

      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        var ndx = n.x - mo.x, ndy = n.y - mo.y, dist = Math.hypot(ndx, ndy) || 1;
        if (dist < DUST_LINK) {
          var lo = (1 - dist / DUST_LINK) * 0.5 * breath;
          if (lo > 0.02) {
            ctx.strokeStyle = "rgba(232,201,122," + lo + ")";
            ctx.beginPath(); ctx.moveTo(mo.x, mo.y); ctx.lineTo(n.x, n.y); ctx.stroke();
          }
          var off = Math.hypot(n.x - n.hx, n.y - n.hy);
          if (off < 30) {
            n.vx += (mo.x - n.x) / dist * 0.02;
            n.vy += (mo.y - n.y) / dist * 0.04;
          }
          n.linked = true;
        } else if (n.linked) {
          n.vx += (n.x - mo.x) / dist * 0.3;
          n.vy += (n.y - mo.y) / dist * 0.3;
          n.linked = false;
        }
      }

      var core = mo.deep ? "60,147,115" : "111,199,164";
      ctx.fillStyle = "rgba(" + core + "," + 0.22 * breath + ")";
      ctx.beginPath(); ctx.arc(mo.x, mo.y, rb * 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(" + core + "," + 0.85 * breath + ")";
      ctx.beginPath(); ctx.arc(mo.x, mo.y, rb, 0, Math.PI * 2); ctx.fill();
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
