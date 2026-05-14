const ADSENSE_CONFIG = {
  enabled: true,
  publisherId: "ca-pub-5382638197626690",
  mode: "auto"
};

function loadAdSenseScript(publisherId) {
  if (document.querySelector("script[data-letterforge-adsense]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.letterforgeAdsense = "true";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
  document.head.appendChild(script);
}

function renderPlaceholder(slot) {
  slot.innerHTML = `<span>Ad space</span><small>${slot.dataset.adSlot || "display"} area</small>`;
}

function initAds() {
  const slots = document.querySelectorAll(".ad-slot");
  if (!ADSENSE_CONFIG.enabled) {
    slots.forEach(renderPlaceholder);
    return;
  }
  loadAdSenseScript(ADSENSE_CONFIG.publisherId);
  if (ADSENSE_CONFIG.mode === "auto") {
    slots.forEach((slot) => {
      slot.dataset.adMode = "auto";
      slot.innerHTML = "";
    });
    return;
  }
  slots.forEach(renderPlaceholder);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAds);
} else {
  initAds();
}
