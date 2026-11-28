/* Popustomat PostHog EU Cloud analitik (gizlilik dostu, çerezsiz bellek modu; yalnız canlı alan adlarında çalışır). */
(function () {
  var HOSTS = ["popustomat.com", "www.popustomat.com", "6259mzds4r-cmyk.github.io"];
  var ALLOWED_K = ["yt", "ig", "tt", "fb", "rd", "tg", "vb", "wa", "g"];
  var host = String((window.location && window.location.hostname) || "").toLowerCase();
  if (HOSTS.indexOf(host) < 0) return;
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",p.onerror=function(){p=null},(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister identify reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init("phc_CCMBFeo3TWcZtD8BztRzFwJpdkRCJnf3diMqqmuiPBSy", {
    api_host: "https://eu.i.posthog.com",
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    persistence: "memory",
    autocapture: false,
    disable_session_recording: true,
    capture_pageview: true,
    capture_pageleave: true
  });
  var k = "";
  var fbc = "";
  var ttclid = "";
  try {
    var qs = new URLSearchParams(window.location.search);
    var qk = String(qs.get("k") || "").trim().toLowerCase();
    if (ALLOWED_K.indexOf(qk) >= 0) {
      k = qk;
      sessionStorage.setItem("popustomat_k", qk);
    } else {
      var sk = String(sessionStorage.getItem("popustomat_k") || "").trim().toLowerCase();
      if (ALLOWED_K.indexOf(sk) >= 0) k = sk;
    }
    var qfb = String(qs.get("fbclid") || "").trim();
    if (qfb) {
      fbc = "fb.1." + Date.now() + "." + qfb;
      sessionStorage.setItem("popustomat_fbc", fbc);
    } else {
      fbc = String(sessionStorage.getItem("popustomat_fbc") || "");
    }
    var qtt = String(qs.get("ttclid") || "").trim();
    if (qtt) {
      ttclid = qtt;
      sessionStorage.setItem("popustomat_ttclid", qtt);
    } else {
      ttclid = String(sessionStorage.getItem("popustomat_ttclid") || "");
    }
  } catch (_) {}
  var ulke = (window.POP_PAGE && window.POP_PAGE.ulke) || String((window.location.hash || "").replace("#", "")).toLowerCase() || "rs";
  try {
    window.posthog.register({ kaynak_kanal: k || "direct", ulke: ulke });
  } catch (_) {}
  window.popTrack = function (ev, props) {
    try {
      if (window.posthog && window.posthog.capture) {
        var opts = (ev === "outbound_click" || ev === "channel_join") ? { transport: "sendBeacon" } : undefined;
        window.posthog.capture(ev, props || {}, opts);
      }
      if (ev === "outbound_click" || ev === "channel_join") {
        var eventId = "pop_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
        var edgeEv = ev === "outbound_click" ? "OutboundClick" : "ChannelJoin";
        var payload = Object.assign({}, props || {}, { event_id: eventId, fbc: fbc, ttclid: ttclid });
        if (window.zaraz && typeof window.zaraz.track === "function") {
          window.zaraz.track(edgeEv, payload);
        }
        if (typeof window.fbq === "function") {
          window.fbq("trackCustom", edgeEv, payload, { eventID: eventId });
        }
        if (window.ttq && typeof window.ttq.track === "function") {
          window.ttq.track(ev === "outbound_click" ? "ClickButton" : "CompleteRegistration", payload, { event_id: eventId });
        }
      }
    } catch (_) {}
  };
  var q = window._phQ;
  if (Array.isArray(q)) {
    while (q.length) {
      var item = q.shift();
      if (item && item[0]) window.popTrack(item[0], item[1]);
    }
  }
})();
