(() => {
  "use strict";

  // Coordinates match the team's approved poster-final.jpg (1199 × 1312).
  // Stages follow the 4m25s Somnia 2050 presentation script.
  const W = 1199, H = 1312;
  const sections = [
    { name: "전체 보기",                      time: "",       box: [0, 0, W, H] },
    { name: "1 프로젝트 소개·미래 비전",        time: "0:00",   box: [0, 0, 1199, 322] },
    { name: "2 문제·사용자·2050년 변화",       time: "0:35",   box: [12, 324, 1176, 231] },
    { name: "3 서비스 작동 방식",               time: "1:20",   box: [13, 556, 568, 275] },
    { name: "4 Dream Director·악몽 대응",      time: "1:50",   box: [588, 556, 319, 275] },
    { name: "5 AI 핵심 기술",                   time: "2:35",   box: [914, 556, 275, 275] },
    { name: "6 현재 기술과 2050년의 일상",      time: "2:55",   box: [12, 834, 1176, 229] },
    { name: "7 검증 과제와 기대 효과",          time: "3:30",   box: [12, 1066, 1176, 243] }
  ]

  const stage = document.getElementById("viewport");
  const canvas = document.getElementById("canvas");
  const poster = document.getElementById("poster");
  const buttons = [...document.querySelectorAll("[data-section]")];
  const position = document.getElementById("position");
  const prev = document.getElementById("previous");
  const next = document.getElementById("next");
  const full = document.getElementById("fullscreen");
  const notice = document.getElementById("message");

  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  let selected = 0, scale = 1, centerX = W / 2, centerY = H / 2;
  let freeView = false, imageReady = false, drag = null, messageTimer;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fullFit = () => Math.max(0.01, Math.min(
    (stage.clientWidth - 24) / W, (stage.clientHeight - 24) / H
  ));

  function paint(immediate = false) {
    const left = stage.clientWidth / 2 - centerX * scale;
    const top = stage.clientHeight / 2 - centerY * scale;
    const [x, y, w, h] = sections[selected].box;
    // Unlike a normal zoom, hide unrelated poster sections during the speech.
    canvas.style.clipPath = (freeView || selected === 0)
      ? "none"
      : `inset(${y}px ${W - x - w}px ${H - y - h}px ${x}px)`;
    canvas.style.transition = immediate ? "none" : "";
    canvas.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
  }

  function fit(immediate = false) {
    const [x, y, w, h] = sections[selected].box;
    scale = clamp(Math.min(
      (stage.clientWidth - 28) / w,
      (stage.clientHeight - 28) / h
    ), 0.01, 8);
    centerX = x + w / 2;
    centerY = y + h / 2;
    freeView = false;
    paint(immediate);
  }

  function select(n) {
    selected = clamp(n, 0, sections.length - 1);
    buttons.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === selected))
    );
    position.textContent = sections[selected].name;
    prev.disabled = selected === 0;
    next.disabled = selected === sections.length - 1;
    buttons[selected].scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    fit();
  }

  function zoom(factor, px = stage.clientWidth / 2, py = stage.clientHeight / 2) {
    const before = scale;
    scale = clamp(scale * factor, fullFit(), 8);
    centerX += (px - stage.clientWidth / 2) * (1 / before - 1 / scale);
    centerY += (py - stage.clientHeight / 2) * (1 / before - 1 / scale);
    freeView = true;
    paint();
  }

  function alertUser(message) {
    clearTimeout(messageTimer);
    notice.textContent = message;
    notice.hidden = false;
    messageTimer = setTimeout(() => { notice.hidden = true; }, 4800);
  }

  prev.addEventListener("click", () => select(selected - 1));
  next.addEventListener("click", () => select(selected + 1));
  document.getElementById("fit").addEventListener("click", () => fit());
  document.getElementById("zoom-in").addEventListener("click", () => zoom(1.25));
  document.getElementById("zoom-out").addEventListener("click", () => zoom(0.8));
  buttons.forEach(button => button.addEventListener("click",
    () => select(Number(button.dataset.section))
  ));

  full.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      alertUser("전체화면이 허용되지 않으면 브라우저에서 F11을 이용하세요.");
    }
  });
  document.addEventListener("fullscreenchange", () => {
    const active = Boolean(document.fullscreenElement);
    full.setAttribute("aria-pressed", String(active));
    full.textContent = active ? "⛶ 전체화면 종료" : "⛶ 전체화면";
    requestAnimationFrame(() => fit(true));
  });

  document.addEventListener("keydown", event => {
    if (event.ctrlKey || event.metaKey || event.altKey ||
        /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) ||
        event.target.isContentEditable) return;
    const key = event.key.toLowerCase();
    if (["arrowright", "pagedown"].includes(key) ||
        (key === " " && !event.target.closest("button, a"))) {
      event.preventDefault(); select(selected + 1);
    } else if (["arrowleft", "pageup"].includes(key)) {
      event.preventDefault(); select(selected - 1);
    } else if (/^[0-7]$/.test(key)) {
      event.preventDefault(); select(Number(key));
    } else if (key === "home") {
      event.preventDefault(); select(0);
    } else if (key === "f") {
      event.preventDefault(); full.click();
    } else if (key === "+" || key === "=") {
      event.preventDefault(); zoom(1.25);
    } else if (key === "-") {
      event.preventDefault(); zoom(0.8);
    }
  });

  stage.addEventListener("wheel", event => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    const r = stage.getBoundingClientRect();
    zoom(Math.exp(-clamp(event.deltaY, -200, 200) * 0.002),
      event.clientX - r.left, event.clientY - r.top);
  }, { passive: false });

  stage.addEventListener("pointerdown", event => {
    if (event.button !== 0 || !event.isPrimary) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, cx: centerX, cy: centerY };
    stage.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  stage.addEventListener("pointermove", event => {
    if (!drag || drag.id !== event.pointerId) return;
    centerX = drag.cx - (event.clientX - drag.x) / scale;
    centerY = drag.cy - (event.clientY - drag.y) / scale;
    freeView = true;
    paint(true);
  });
  function stopDrag() {
    drag = null;
    canvas.classList.remove("dragging");
  }
  stage.addEventListener("pointerup", stopDrag);
  stage.addEventListener("pointercancel", stopDrag);
  stage.addEventListener("lostpointercapture", stopDrag);

  window.addEventListener("resize", () => { if (imageReady) fit(true); });
  function ready() { imageReady = true; select(0); }
  poster.addEventListener("load", ready);
  poster.addEventListener("error", () => alertUser("poster-final.jpg 파일을 불러오지 못했습니다."));
  if (poster.complete && poster.naturalWidth > 0) ready();
  else if (poster.complete) alertUser("포스터를 불러오지 못했습니다.");
})();