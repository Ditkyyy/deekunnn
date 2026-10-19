/* ============================================================
   SorryLove Template — script.js
   ============================================================
   ຜູ້ໃຊ້ Template ສ່ວນຫຼາຍ "ບໍ່ຈຳເປັນຕ້ອງແກ້ໂຄ້ດທາງລຸ່ມ" ນີ້ເລີຍ
   ສາມາດແກ້ໄຂຕ່າງໆໃນສາວນທີ່ຈຳເປັນແລະຢາກປ່ຽນ CONFIG ດ້ານລຸ່ມນີ້ເທົ່ານັ້ນ:
     - ປ່ຽນຮູບ GIF (ຮູບ GIF ສາມາດຫາໄດ້ທີ່ເວັບ"Tenor.com")
     - ປ່ຽນຂໍ້ຄວາມຕ່າງໆ
     - ປັບການເຄື່ອນເໜັງຂອງປຸ່ມ "ບໍ່..ຊັງ!" (ໄລຍະຫ່າງຂອບຈໍ, ຄວາມໄວໃນການໜີ ແລະ ອື່ນໆ)
   ============================================================ */

const CONFIG = {
  // ພາດໄຟລ GIF (ຖ້າປ່ຽນຊື່ໄຟລ ໃຫ້ແກ້ path ບ່ອນນນີ້ และ ແກ້ src ໃນ index.html ໃຫ້ຕົງກັນສາກ່ອນ
  // ຫຼືຈະເກັບຊື່ໄຟລເດີມແລ້ວແທນທີ່ເນື້ອໄຟລກໍໄດ້ງ່າຍກວ່າ — ເບິ່ງວິທີໄດ້ໃນ README.md)
  gifs: {
    happy: "assets/images/happy.gif",
  },

  texts: {
    // ข้อความหลังกด "ดีกัน ❤️"
    happyMessage: "ເຢ້.... 🥳",
    happySubLines: ["ເພີ່ນໜ້າຮັກທີ່ສຸດເລີບ ❤️", "ເລີຟຢູຄ້າບບ"],
    happyGifAlt: "GIF ໜ້າຮັກໆ",
  },

  behavior: {
    // ໄລຍະຫ່າງຂັ້ນຕ່ຳລະຫວ່າງປຸ່ມ "ບໍ່..ຊັງ!" ກັບຂອບຈໍ (px)
    edgeMarginPx: 16,
    // ໄລຍະກັນຊົນ "ດີກັນນ ❤️" ທີ່ປຸ່ມ "ບໍ່..ຊັງ!" ຫ້າມເຂົ້າໃກ້ (px)
    overlapBufferPx: 22,
    // ປຸ່ມ "ບໍ່..ຊັງ!" ຕ້ອງຫຍັບຫ່າງຈາກຕຳແໜ່ງເດີມປະມານເທົ່ານີ້ ເທົ່ານີ້ px ທຸກຄັ້ງທີ່ໜີ
    minMoveDistancePx: 90,
    // ຈຳນວນຄັ້ງທີ່ສຸ່ມຕຳແໜ່ງກ່ອນຈະຍອມໃຊ້ຕຳແໜ່ງທີ່ດີທີ່ສຸດທີ່ຫາໄດ້ (ກັນເວັບຄ້າງໃນຈໍທີ່ມີຄວາມນ້ອຍ)
    maxPlacementAttempts: 20,
    // ຈຳນວນຫົວໃຈລອຍຕອນ Happy Ending
    heartBurstCount: 16,
    // ມຸມໝຸນສູງສຸດ (ອົງສາ) ທີ່ຢູ່ແອນິເມຊັ້ນການເໜັງໂຕ (.is-wiggling ใน style.css) ໃຊ້ໄດ້ແທ້
    // ໃຊ້ຄຳນວນໄລຍະເຜື່ອຂອບເພີ່ມເຕີມ — ຖ້າໄປແກ້ມຸມໝຸນໃນ @keyframes no-btn-wiggle
    // ໃຫ້ຄ່ານີ້ເທົ່າກັບມຸມທີ່ຫຼາຍທີ່ສຸດທີ່ຕັ້ງໄວ້ (ຫຼືຫຼາຍກວ່າເລັກນ້ອຍເພື່ອຄວາມແນ່ໃຈ)
    wiggleMaxDeg: 8,
  },
};

/* ============================================================
   ບໍ່ຈຳເປັນຕ້ອງແກໂຄ້ດພວກນີ້
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("card");
  const mainGif = document.getElementById("mainGif");
  const mainMessage = document.getElementById("mainMessage");
  const subMessage = document.getElementById("subMessage");
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const heartsLayer = document.getElementById("heartsLayer");

  let armed = false; // ປຸ່ມ "ບໍ່..ຊັງ!" ຖືກສະຫຼັບເປັນລອຍແບບອິດສະຫຼະ (position: fixed) ແລ້ວຫຼືຍັງ
  let curX = 0;
  let curY = 0;
  let lastEvadeAt = 0;
  let happyEnded = false;

  /* ---------- Utilities ---------- */

  function getViewportSize() {
    if (window.visualViewport) {
      return { vw: window.visualViewport.width, vh: window.visualViewport.height };
    }
    return {
      vw: document.documentElement.clientWidth || window.innerWidth,
      vh: document.documentElement.clientHeight || window.innerHeight,
    };
  }

  function getEdgeMargin() {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--no-btn-edge-margin")
      .trim();
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : CONFIG.behavior.edgeMarginPx;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ຕອນປຸ່ມ "ບໍ່.ຊັງ.!" ມີການເໜັງໂຕ (.is-wiggling) ມັນຈະໝຸນເລັກນ້ອຍ ເພື່ອໃຫ້ "ຂອບຂອງຂອບເຂດທີ່ແນມເຫັນແທ້"
  // (bounding box) ກວ້າງ/ສູງກວ່າຕອນບໍ່ໝຸນໃນຂະນະໜື່ງ ຟັງຊັ້ນນີ້ຕຳນວນໄລຍະເຜື່ອເພີ່ມທີ່ຕ້ອງກັນໄວ້
  // ຮອບໆ ຕຳແໜ່ງເປົ່າໝາຍ ເພື່ອໃຫ້ຕໍ່ໃຫ້ໝູນສຸດມຸມກໍຍັງບໍ່ພົ້ນຂອບຈໍ
  function getWiggleSafetyPadding(w, h) {
    const rad = (CONFIG.behavior.wiggleMaxDeg * Math.PI) / 180;
    const extraW = Math.max(0, (w * Math.cos(rad) + h * Math.sin(rad) - w) / 2);
    const extraH = Math.max(0, (w * Math.sin(rad) + h * Math.cos(rad) - h) / 2);
    return { extraW, extraH };
  }

  /* ---------- ປຸ່ມ "ບໍ່..ຊັງ!": ຄຳນວນຕຳແໜ໋ງຫຼົບໜີ ---------- */

  function pickEscapePosition(prevX, prevY) {
    const { vw, vh } = getViewportSize();
    const rect = noBtn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const margin = getEdgeMargin();
    const { extraW, extraH } = getWiggleSafetyPadding(w, h);
    const safeMarginX = margin + extraW;
    const safeMarginY = margin + extraH;

    const minX = safeMarginX;
    const maxX = Math.max(minX, vw - w - safeMarginX);
    const minY = safeMarginY;
    const maxY = Math.max(minY, vh - h - safeMarginY);

    const yesRect = yesBtn.getBoundingClientRect();
    const buffer = CONFIG.behavior.overlapBufferPx;
    const forbidden = {
      left: yesRect.left - buffer,
      right: yesRect.right + buffer,
      top: yesRect.top - buffer,
      bottom: yesRect.bottom + buffer,
    };
    const yesCx = (forbidden.left + forbidden.right) / 2;
    const yesCy = (forbidden.top + forbidden.bottom) / 2;

    let best = null;
    let bestScore = -Infinity;

    for (let i = 0; i < CONFIG.behavior.maxPlacementAttempts; i++) {
      const x = minX + Math.random() * Math.max(0, maxX - minX);
      const y = minY + Math.random() * Math.max(0, maxY - minY);
      const candidate = { left: x, right: x + w, top: y, bottom: y + h };

      const overlapsYes = !(
        candidate.right < forbidden.left ||
        candidate.left > forbidden.right ||
        candidate.bottom < forbidden.top ||
        candidate.top > forbidden.bottom
      );

      const distFromPrev =
        prevX == null ? Infinity : Math.hypot(x - prevX, y - prevY);

      if (!overlapsYes && distFromPrev >= CONFIG.behavior.minMoveDistancePx) {
        return { x, y };
      }

      // ເຜື່ອກໍລະນີຈໍທີ່ນ້ອຍຫຼາຍຈົນຫາຕຳແໜ໋ງສົມບູນແບບບໍ່ຄົບຕາມເງື່ອນໄຂ
      // ໃຫ້ເກັບຕຳແໜ໋ງທີ່ "ດີທີ່ສຸດເທົ່າທີ່ຫາໄດ້" ໄວ້ເປັນທາງເລືອກສຳຮອງ
      const distFromYesCenter = Math.hypot(x - yesCx, y - yesCy);
      const score =
        distFromYesCenter +
        (Number.isFinite(distFromPrev) ? distFromPrev * 0.3 : 0) -
        (overlapsYes ? 100000 : 0);

      if (score > bestScore) {
        bestScore = score;
        best = { x, y };
      }
    }

    return best || { x: minX, y: minY };
  }

  function armNoButton() {
    const rect = noBtn.getBoundingClientRect();

    // ສ້ຮາງຊ່ອງວ່າງແທນຕຳແໜ່ງເດີມຂອງປຸ່ມ "ບໍ່..ຊັງ!" ເພື່ອບໍ່ໃຫ້ປຸ່ມ "ດີກັນນ ❤️" ເຄື່ອນເໜັງກາຍເລເອົ້າ
    const placeholder = noBtn.cloneNode(true);
    placeholder.removeAttribute("id");
    placeholder.classList.add("btn-no-placeholder");
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.tabIndex = -1;
    placeholder.disabled = true;
    noBtn.parentNode.insertBefore(placeholder, noBtn);

    // ຍ້າຍປຸ່ມ "ບໍ່..ຊັງ!" ອອກມາເປັນລູກສອນໂດຍກົງຂອງ <body>
    // ເຫດຜົນ: ຖ້າປຸ່ມຍັງຢູ່ໃນ .card และ .card (ຫຼື ancestor ຕ່າງ ໆ) ມີ CSS "transform"
    // (ເຖິງແມ້ຈະມາຈາກ animation ຕອນເປີດໜ້າເວັບ) ຕາມ CSS spec ແລ້ວອົງປະກອບນັ້ນຈະກາຍເປັນ
    // containing block ຂອງລູກທີ່ເປັນ position:fixed ແທນທີ່ຈະເປັນໜ້າຈໍແທ້ ເຮັດໃຫ້ການຄຳນວນ
    // ຕຳແໜ່ງສຸ່ມຜິດພາດ ແລະ ປຸ່ມອາດຈະຫຼຸດຈໍໄດ້ ການຍ້າຍມາໄວ້ຊ່ອງ <body> ໂດຍກົງຈະຊ່ວຍໃຫ້
    // position:fixed ອ້າງອີງກັບ viewport ຕະຫຼອດ ບໍ່ວ່າລູກຄ້າຈະແກ້ໄຂ CSS ຂອງ .card ໃນພາຍຫຼັງ
    document.body.appendChild(noBtn);

    // ສະຫຼັບເປັນ position: fixed ໂດຍບໍ່ໃຫ້ເກີດການກະຕຸກ ຫຼື ເລື່ອນແບບມີແອນິເມຊັ້ນຄືຄັ້ງທຳອິດ
    noBtn.style.transition = "none";
    noBtn.classList.add("is-armed");
    noBtn.style.transform = `translate(${rect.left}px, ${rect.top}px)`;
    // ບັງຄັບໃຫ້ browser ຄຳນວນເລເອົ້າໃໝ່ກ່ອນຄືນຄ່າ transition
    // eslint-disable-next-line no-unused-expressions
    noBtn.offsetWidth;
    noBtn.style.transition = "";

    curX = rect.left;
    curY = rect.top;
    armed = true;
  }

  function triggerWiggle() {
    noBtn.classList.remove("is-wiggling");
    // eslint-disable-next-line no-unused-expressions
    noBtn.offsetWidth;
    noBtn.classList.add("is-wiggling");
  }

  function evadeNoButton() {
    if (happyEnded) return;

    const now = performance.now();
    if (now - lastEvadeAt < 220) return; // ກັນການສ້າງຄຳສັ່ງແລ່ນໜີທີ່ຖີ່ເກີນໄປ event ຫຼາຍໂຕພ້ອມກັນ
    lastEvadeAt = now;

    if (!armed) {
      armNoButton();
    }

    const { x, y } = pickEscapePosition(curX, curY);
    curX = x;
    curY = y;
    noBtn.style.transform = `translate(${x}px, ${y}px)`;
    if (!prefersReducedMotion()) {
      triggerWiggle();
    }
  }

  // Desktop: ເລີ່ມໜີຕັ້ງແຕ່ເມົ້າເຂົ້າໃກ້ (hover) ກ່ອນທີ່ຈະກົດຄລິກທັນ
  noBtn.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse" || e.pointerType === "pen") {
      evadeNoButton();
    }
  });

  // ຄອບຄຸມທັງເມົ້າທີ່ກົດໄວໆ ແລະ ການແຕະສຳຜັດຢູ່ມືຖື
  noBtn.addEventListener("pointerdown", () => {
    evadeNoButton();
  });

  // ສຳຮອງໄວ້ສຳຫຼັບ browser ທີ່ບໍ່ຮອງຮັບ Pointer Events ເຕັມຮູບແບບ
  noBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      evadeNoButton();
    },
    { passive: false }
  );

  // ຄີບອດ: ພໍເລີ່ມໂຟກັສເຂົ້າມາກໍເລີ່ມໜີ
  noBtn.addEventListener("focus", () => {
    evadeNoButton();
  });

  // ກັນໄວ້ອີກຊັ້ນ: ບໍ່ວ່າຈະກົດສຳເຫຼັດດ້ວຍວິທໃດກໍຕາມ ຈະຫ້າມນັບເປັນການເລືອກ "ບໍ່..!ຊັງ" ເດັດຂາດ
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    evadeNoButton();
  });

  // ປຮັບຕຳແໜ່ງໃຫ້ຢູ່ໃນຈໍສະເໝີເມື່ອຂະໜາດຈໍປ່ຽນ (ພລິກກັບດ້ານຈໍ / ເປີດຄີບອດມືຖື)
  let resizeTimer = null;
  function handleViewportChange() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!armed) return;
      const { vw, vh } = getViewportSize();
      const rect = noBtn.getBoundingClientRect();
      const margin = getEdgeMargin();
      const { extraW, extraH } = getWiggleSafetyPadding(rect.width, rect.height);
      const minX = margin + extraW;
      const maxX = Math.max(minX, vw - rect.width - margin - extraW);
      const minY = margin + extraH;
      const maxY = Math.max(minY, vh - rect.height - margin - extraH);

      const clampedX = Math.min(Math.max(curX, minX), maxX);
      const clampedY = Math.min(Math.max(curY, minY), maxY);

      if (clampedX !== curX || clampedY !== curY) {
        curX = clampedX;
        curY = clampedY;
        noBtn.style.transform = `translate(${curX}px, ${curY}px)`;
      }
    }, 120);
  }
  window.addEventListener("resize", handleViewportChange);
  window.addEventListener("orientationchange", handleViewportChange);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportChange);
  }

  /* ---------- ປຸ່ມ "ດີກັນນ ❤️": Happy Ending ---------- */

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function spawnHearts() {
    if (prefersReducedMotion()) return;

    const emojis = ["❤️", "💕", "💖", "🩷"];
    const count = CONFIG.behavior.heartBurstCount;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const size = 16 + Math.random() * 18;
      const duration = 2.6 + Math.random() * 1.8;
      const drift = Math.round(Math.random() * 140 - 70);
      const rotate = Math.round(Math.random() * 60 - 30);
      const delay = (Math.random() * 0.6).toFixed(2);

      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty("--heart-size", `${size}px`);
      heart.style.setProperty("--heart-duration", `${duration}s`);
      heart.style.setProperty("--heart-drift", `${drift}px`);
      heart.style.setProperty("--heart-rotate", `${rotate}deg`);
      heart.style.animationDelay = `${delay}s`;

      heart.addEventListener("animationend", () => heart.remove());
      heartsLayer.appendChild(heart);
    }
  }

  function handleYesClick() {
    if (happyEnded) return;
    happyEnded = true;

    card.classList.add("is-happy");

    mainGif.src = CONFIG.gifs.happy;
    mainGif.alt = CONFIG.texts.happyGifAlt;
    mainMessage.textContent = CONFIG.texts.happyMessage;

    subMessage.innerHTML = CONFIG.texts.happySubLines.map(escapeHtml).join("<br />");
    subMessage.hidden = false;
    requestAnimationFrame(() => subMessage.classList.add("is-visible"));

    // ປິດການໃຊ້ງານປຸ່ມທັ້ງສອງຫຼັງຈົບເກມ (ເພາະໄດ້ເຂົ້າສູ່ສະຖານະ Happy Ending ແລ້ວ)
    yesBtn.disabled = true;
    yesBtn.tabIndex = -1;
    noBtn.disabled = true;
    noBtn.tabIndex = -1;
    // ປຸ່ມ "ບໍ່..ຊັັງ!" ອາດຈະຖືກຍ້າຍໄປໃນຊ່ອງ <body> ແລ້ວ (ເບິ່ງ armNoButton) ຈຶ່ງເຊື່ອງແບບ inline
    // ໂດຍກົງ ເພື່ອບໍ່ໃຫ້ລາຍຄ້າງຢູ່ໜ້າເວັບຫຼັງ Happy Ending
    noBtn.style.display = "none";

    spawnHearts();
  }

  yesBtn.addEventListener("click", handleYesClick);
});
