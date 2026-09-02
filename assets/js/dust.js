/* 墨绿粒子生成器：数量/时长由 CSS 变量 --fx-* 控制；
   移动端数量减半；尊重系统"减少动态效果"偏好；动画仅用 transform/opacity（GPU 加速）。 */
(function () {
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var hosts = document.querySelectorAll("[data-fx-dust]");
  if (!hosts.length) return;
  var rootStyle = getComputedStyle(document.documentElement);
  var count = parseInt(rootStyle.getPropertyValue("--fx-dust-count"), 10) || 18;
  if (window.innerWidth < 700) count = Math.round(count * 0.5);
  hosts.forEach(function (host) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var d = document.createElement("span");
      d.className = "dust" + (Math.random() < 0.35 ? " dust--deep" : "");
      d.style.left = (Math.random() * 100).toFixed(2) + "%";
      var dur = 12 + Math.random() * 6;
      d.style.animationDuration = dur.toFixed(1) + "s";
      d.style.animationDelay = (-Math.random() * dur).toFixed(1) + "s";
      var size = 3 + Math.random() * 2;
      d.style.width = d.style.height = size.toFixed(1) + "px";
      frag.appendChild(d);
    }
    host.appendChild(frag);
  });
})();
