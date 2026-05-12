const ADSENSE_CONFIG = {
  enabled: false,
  publisherId: "ca-pub-REPLACE_WITH_YOUR_ID",
  slots: {
    sidebar: "REPLACE_WITH_SIDEBAR_SLOT_ID",
    content: "REPLACE_WITH_CONTENT_SLOT_ID"
  }
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
  slot.innerHTML = `<span>Ad placeholder</span><small>${slot.dataset.adSlot || "display"} slot</small>`;
}

function renderAdSenseSlot(slot) {
  const slotName = slot.dataset.adSlot || "content";
  const adSlotId = ADSENSE_CONFIG.slots[slotName] || ADSENSE_CONFIG.slots.content;
  slot.innerHTML = `<ins class="adsbygoogle"
    style="display:block"
    data-ad-client="${ADSENSE_CONFIG.publisherId}"
    data-ad-slot="${adSlotId}"
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>`;
  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
}

function initAds() {
  const slots = document.querySelectorAll(".ad-slot");
  if (!ADSENSE_CONFIG.enabled) {
    slots.forEach(renderPlaceholder);
    return;
  }
  loadAdSenseScript(ADSENSE_CONFIG.publisherId);
  slots.forEach(renderAdSenseSlot);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAds);
} else {
  initAds();
}
