/* Popustomat urun sayfasi etkilesimli fiyat grafigi (SONRA B: beyaz/koyu TradingView hissi + 7D/15D/30D takvim gunu penceresi). */
(function () {
  var P = window.POP_PAGE;
  if (!P || !Array.isArray(P.gecmis) || P.gecmis.length < 2) return;
  var card = document.getElementById("price-chart-card");
  if (!card) return;
  var NS = "http://www.w3.org/2000/svg";
  var DAY = 86400000;
  function gunMs(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d));
    return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : NaN;
  }
  var allPts = P.gecmis.map(function (x) { return { d: String(x[0]), v: Number(x[1]), t: gunMs(x[0]) }; })
    .filter(function (x) { return x.v > 0 && !isNaN(x.t); });
  if (allPts.length < 2) return;
  var para = P.para || "RSD";
  var nowPrice = Number(P.fiyat);
  var title = P.chart_title || "Istorija cene", gunLbl = P.gun_lbl || "Pre {n}d", danasLbl = P.danas_lbl || "Danas";
  function dec(n, suf) { return n.toLocaleString("de-DE", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + suf; }
  function whole(n, suf) { return Math.round(n).toLocaleString("de-DE") + suf; }
  function fmtM(n) {
    if (para === "EUR") return dec(n, " €");
    if (para === "BAM") return dec(n, " KM");
    if (para === "RON") return dec(n, " lei");
    if (para === "PLN") return dec(n, " zł");
    if (para === "BGN") return dec(n, " лв.");
    if (para === "MKD") return whole(n, " ден.");
    if (para === "TRY") return whole(n, " ₺");
    if (para === "HUF") return whole(n, " Ft");
    if (para === "CZK") return whole(n, " Kč");
    return Math.round(n).toLocaleString("sr-RS") + " RSD";
  }
  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  card.innerHTML = '<div class="chart-top"><span class="chart-title"></span><div class="chart-tabs" id="c-tabs"></div></div><div class="chart-delta" id="c-delta"></div><div class="chart-box" id="c-box"></div><div class="chart-tip" id="c-tip"></div>';
  var titleEl = card.querySelector(".chart-title");
  var tabs = document.getElementById("c-tabs");
  var deltaEl = document.getElementById("c-delta");
  var box = document.getElementById("c-box");
  var tip = document.getElementById("c-tip");
  var spans = [7, 15, 30];
  var lastMs = allPts[allPts.length - 1].t;
  var winDays = (lastMs - allPts[0].t) > 7 * DAY ? 15 : 7;
  // Pencere takvim gunuyle (nokta sayisiyla degil); son nokta bugunku guncel fiyatla esitlenir (O2).
  function windowPts() {
    var pts = allPts.filter(function (p) { return lastMs - p.t <= winDays * DAY; });
    if (pts.length < 2) pts = allPts.slice(-2);
    pts = pts.map(function (p) { return { d: p.d, v: p.v, t: p.t }; });
    if (nowPrice > 0) pts[pts.length - 1].v = nowPrice;
    return pts;
  }
  function draw() {
    titleEl.textContent = title;
    var pts = windowPts();
    var vals = pts.map(function (p) { return p.v; });
    var refVal = vals[0], curVal = vals[vals.length - 1];
    var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    var span = (mx - mn) || Math.max(1, refVal * 0.05);
    var t0 = pts[0].t, tN = pts[pts.length - 1].t, tSpan = (tN - t0) || DAY;
    var W = 320, H = 136, PL = 6, PR = 6, PT = 14, PB = 18;
    function xAt(t) { return PL + ((t - t0) / tSpan) * (W - PL - PR); }
    function yAt(v) { return H - PB - ((v - mn) / span) * (H - PT - PB); }
    var up = curVal > refVal;
    var pct = Math.round(((curVal - refVal) / refVal) * 100);
    var nGun = Math.max(1, Math.round((tN - t0) / DAY));
    deltaEl.textContent = String(gunLbl).replace("{n}", String(nGun)) + ": " + fmtM(refVal) + " → " + danasLbl + ": " + fmtM(curVal) + " ";
    var pctEl = document.createElement("span");
    pctEl.className = "chart-delta-pct" + (up ? " up" : "");
    pctEl.textContent = (pct > 0 ? "+" : "") + pct + "%";
    deltaEl.appendChild(pctEl);
    tip.textContent = pts[0].d + " → " + pts[pts.length - 1].d + " · min " + fmtM(mn) + " · max " + fmtM(mx);
    var svg = el("svg", { viewBox: "0 0 " + W + " " + H });
    var refY = yAt(refVal).toFixed(1);
    svg.appendChild(el("line", { "class": "c-ref", x1: PL, x2: W - PR, y1: refY, y2: refY, "stroke-width": "1.5", "stroke-dasharray": "4 4" }));
    var dStr = pts.map(function (p, i) { return (i === 0 ? "M" : "L") + xAt(p.t).toFixed(1) + " " + yAt(p.v).toFixed(1); }).join(" ");
    svg.appendChild(el("path", { "class": up ? "c-line-up" : "c-line", d: dStr, fill: "none", "stroke-width": "2.6",
      "stroke-linecap": "round", "stroke-linejoin": "round" }));
    svg.appendChild(el("circle", { "class": "c-dot-up", cx: xAt(t0).toFixed(1), cy: refY, r: "4" }));
    svg.appendChild(el("circle", { "class": up ? "c-dot-up" : "c-dot", cx: xAt(tN).toFixed(1), cy: yAt(curVal).toFixed(1), r: "4.5" }));
    var ch = el("line", { "class": "c-ch", y1: PT, y2: H - PB, "stroke-width": "1", "stroke-dasharray": "2 3" });
    ch.style.display = "none";
    svg.appendChild(ch);
    box.innerHTML = "";
    box.appendChild(svg);
    function move(ev) {
      var rc = svg.getBoundingClientRect();
      var cx = ev.touches && ev.touches.length ? ev.touches[0].clientX : ev.clientX;
      var tAt = t0 + Math.max(0, Math.min(1, (cx - rc.left) / (rc.width || 1))) * tSpan;
      var pt = pts[0];
      pts.forEach(function (p) { if (Math.abs(p.t - tAt) < Math.abs(pt.t - tAt)) pt = p; });
      var px = xAt(pt.t).toFixed(1);
      ch.setAttribute("x1", px); ch.setAttribute("x2", px); ch.style.display = "";
      tip.textContent = pt.d + " · " + fmtM(pt.v);
    }
    box.onmousemove = move;
    box.ontouchstart = move;
    box.ontouchmove = move;
  }
  spans.forEach(function (sp) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "cbtn" + (winDays === sp ? " on" : "");
    b.textContent = sp + "D";
    b.onclick = function () {
      winDays = sp;
      tabs.querySelectorAll(".cbtn").forEach(function (x) { x.classList.toggle("on", x === b); });
      draw();
    };
    tabs.appendChild(b);
  });
  // dil.js koprusu: dil degisince baslik/etiket yenilenir; dil.js once yuklendiyse sakladigi son dil burada uygulanir.
  window.popustomatGrafikYenile = function (t, g, d) {
    if (t) title = t;
    if (g) gunLbl = g;
    if (d) danasLbl = d;
    draw();
  };
  if (Array.isArray(window.POP_GRAFIK_DIL)) {
    window.popustomatGrafikYenile(window.POP_GRAFIK_DIL[0], window.POP_GRAFIK_DIL[1], window.POP_GRAFIK_DIL[2]);
  } else {
    draw();
  }
})();
