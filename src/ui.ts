import type { SimParams } from "./simulation";
import type { SpawnPattern } from "./genome";
import { SPAWN_PATTERNS } from "./genome";

export interface UICallbacks {
  onGrow: (seed: string) => void;
  onRandom: () => void;
  onParam: (key: keyof SimParams, value: number) => void;
  onSpecies: (n: number) => void;
  onSpawn: (s: SpawnPattern) => void;
  onPaletteCycle: (dir: number) => void;
  onPauseToggle: () => void;
  onSave: () => void;
  onShare: () => void;
  onReset: () => void;
  onTogglePanel: () => void;
}

interface SliderSpec {
  key: keyof SimParams;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const SLIDERS: SliderSpec[] = [
  { key: "sensorAngle", label: "Sensor angle", min: 0.1, max: 1.6, step: 0.01, format: (v) => `${Math.round((v * 180) / Math.PI)}°` },
  { key: "sensorDistance", label: "Sensor reach", min: 3, max: 30, step: 0.5, format: (v) => `${v.toFixed(1)}px` },
  { key: "turnSpeed", label: "Turn speed", min: 0.1, max: 1.6, step: 0.01, format: (v) => v.toFixed(2) },
  { key: "stepSize", label: "Step size", min: 0.3, max: 2.2, step: 0.02, format: (v) => v.toFixed(2) },
  { key: "decay", label: "Persistence", min: 0.85, max: 0.99, step: 0.002, format: (v) => v.toFixed(3) },
  { key: "diffuse", label: "Diffusion", min: 0.0, max: 0.9, step: 0.01, format: (v) => v.toFixed(2) },
  { key: "crossAttraction", label: "Species pull", min: -1, max: 0.4, step: 0.02, format: (v) => v.toFixed(2) },
  { key: "exposure", label: "Glow", min: 0.5, max: 1.8, step: 0.02, format: (v) => v.toFixed(2) },
];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  for (const c of children) node.append(c);
  return node;
}

export class UI {
  private seedInput: HTMLInputElement;
  private panel: HTMLDivElement;
  private sliderEls = new Map<keyof SimParams, { input: HTMLInputElement; val: HTMLSpanElement }>();
  private speciesBtns: HTMLButtonElement[] = [];
  private spawnBtns = new Map<SpawnPattern, HTMLButtonElement>();
  private pauseBtn: HTMLButtonElement;
  private paletteReadout: HTMLElement;
  private statFps: HTMLElement;
  private statAgents: HTMLElement;
  private toastEl: HTMLDivElement;
  private veil: HTMLDivElement;
  private toastTimer = 0;

  constructor(root: HTMLElement, initialSeed: string, cb: UICallbacks) {
    // --- Masthead ---
    root.append(
      el("div", { className: "masthead" },
        el("div", { className: "wordmark" }, "Mycelia"),
        el("div", { className: "tagline" }, "A living organism grown from a word. One million agents. Same seed, same creature — forever."),
      ),
    );

    // --- Seed bar ---
    this.seedInput = el("input", {
      className: "seed-input",
      value: initialSeed,
      spellcheck: false,
      autocomplete: "off",
    }) as HTMLInputElement;
    this.seedInput.setAttribute("aria-label", "Seed word");
    this.seedInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") cb.onGrow(this.seedInput.value);
    });
    const growBtn = el("button", { className: "primary" }, "Grow ↵");
    growBtn.onclick = () => cb.onGrow(this.seedInput.value);
    const diceBtn = el("button", { className: "icon", title: "Random seed" }, "⚄");
    diceBtn.onclick = () => cb.onRandom();

    root.append(
      el("div", { className: "seedbar" },
        el("span", { className: "seed-label" }, "seed"),
        this.seedInput,
        diceBtn,
        growBtn,
      ),
    );

    // --- Genome panel ---
    this.paletteReadout = el("b", {}, "—");
    const panelChildren: (Node | string)[] = [
      el("h2", {}, "Genome", this.paletteReadout),
    ];

    for (const s of SLIDERS) {
      const val = el("span", {}, "");
      const input = el("input", {
        type: "range",
        min: String(s.min),
        max: String(s.max),
        step: String(s.step),
      }) as HTMLInputElement;
      input.addEventListener("input", () => {
        const v = parseFloat(input.value);
        val.textContent = s.format(v);
        cb.onParam(s.key, v);
      });
      this.sliderEls.set(s.key, { input, val });
      panelChildren.push(
        el("div", { className: "row" },
          el("div", { className: "rlabel" }, el("span", {}, s.label), val),
          input,
        ),
      );
    }

    panelChildren.push(el("div", { className: "divider" }));

    // Species selector
    const speciesSeg = el("div", { className: "seg" });
    for (let n = 1; n <= 3; n++) {
      const b = el("button", {}, String(n)) as HTMLButtonElement;
      b.onclick = () => cb.onSpecies(n);
      this.speciesBtns.push(b);
      speciesSeg.append(b);
    }
    panelChildren.push(
      el("div", { className: "row" }, el("div", { className: "rlabel" }, el("span", {}, "Colonies"), el("span", {}, "")), speciesSeg),
    );

    // Spawn selector
    const spawnSeg = el("div", { className: "seg" });
    for (const s of SPAWN_PATTERNS) {
      const b = el("button", {}, s) as HTMLButtonElement;
      b.onclick = () => cb.onSpawn(s);
      this.spawnBtns.set(s, b);
      spawnSeg.append(b);
    }
    panelChildren.push(
      el("div", { className: "row" }, el("div", { className: "rlabel" }, el("span", {}, "Spawn"), el("span", {}, "")), spawnSeg),
    );

    // Palette cycle
    const palSeg = el("div", { className: "seg" });
    const palPrev = el("button", {}, "‹ palette") as HTMLButtonElement;
    palPrev.onclick = () => cb.onPaletteCycle(-1);
    const palNext = el("button", {}, "palette ›") as HTMLButtonElement;
    palNext.onclick = () => cb.onPaletteCycle(1);
    palSeg.append(palPrev, palNext);
    panelChildren.push(el("div", { className: "row" }, palSeg));

    this.panel = el("div", { className: "panel" }, ...panelChildren) as HTMLDivElement;
    root.append(this.panel);

    // --- Stats ---
    this.statFps = el("b", {}, "—");
    this.statAgents = el("b", {}, "—");
    root.append(
      el("div", { className: "stats" },
        el("span", {}, "agents ", this.statAgents),
        el("span", {}, this.statFps, " fps"),
      ),
    );

    // --- Toolbar ---
    this.pauseBtn = el("button", { className: "icon", title: "Pause / play (space)" }, "⏸") as HTMLButtonElement;
    this.pauseBtn.onclick = () => cb.onPauseToggle();
    const resetBtn = el("button", { className: "icon", title: "Regrow (r)" }, "↻") as HTMLButtonElement;
    resetBtn.onclick = () => cb.onReset();
    const saveBtn = el("button", { title: "Save PNG (s)" }, "Save") as HTMLButtonElement;
    saveBtn.onclick = () => cb.onSave();
    const shareBtn = el("button", { title: "Copy shareable link" }, "Share") as HTMLButtonElement;
    shareBtn.onclick = () => cb.onShare();
    const panelBtn = el("button", { className: "icon", title: "Toggle genome panel (g)" }, "⚙") as HTMLButtonElement;
    panelBtn.onclick = () => cb.onTogglePanel();

    root.append(
      el("div", { className: "toolbar" }, this.pauseBtn, resetBtn, saveBtn, shareBtn, panelBtn),
    );

    // --- Toast ---
    this.toastEl = el("div", { className: "toast" }) as HTMLDivElement;
    root.append(this.toastEl);

    // --- Intro veil ---
    this.veil = el("div", { className: "veil" },
      el("div", {},
        el("div", { className: "big" }, "MYCELIA"),
        el("div", { className: "sub" }, "One million agents follow chemical trails they leave behind, and self-organize into a living network. Every word grows a different creature — and the same word always grows the same one."),
        el("div", { className: "hint" }, "click anywhere to begin"),
      ),
    ) as HTMLDivElement;
    root.append(this.veil);
  }

  onVeilDismiss(fn: () => void): void {
    this.veil.addEventListener("click", fn, { once: true });
  }

  dismissVeil(): void {
    this.veil.classList.add("gone");
    // Belt-and-suspenders: also drop it out of the DOM once faded so it can
    // never intercept pointer events over the controls.
    this.veil.style.pointerEvents = "none";
    window.setTimeout(() => this.veil.remove(), 950);
  }

  togglePanel(): void {
    this.panel.classList.toggle("hidden");
  }

  setSeed(seed: string): void {
    this.seedInput.value = seed;
  }

  setPaused(paused: boolean): void {
    this.pauseBtn.textContent = paused ? "▶" : "⏸";
  }

  syncParams(p: SimParams): void {
    for (const [key, { input, val }] of this.sliderEls) {
      const spec = SLIDERS.find((s) => s.key === key)!;
      input.value = String(p[key]);
      val.textContent = spec.format(p[key] as number);
    }
    const sp = Math.round(p.species);
    this.speciesBtns.forEach((b, i) => b.classList.toggle("on", i + 1 === sp));
  }

  setSpawn(s: SpawnPattern): void {
    for (const [key, btn] of this.spawnBtns) btn.classList.toggle("on", key === s);
  }

  setStats(fps: number, agents: number, palette: string): void {
    this.statFps.textContent = String(Math.round(fps));
    this.statAgents.textContent = agents >= 1e6 ? `${(agents / 1e6).toFixed(2)}M` : `${(agents / 1e3).toFixed(0)}K`;
    this.paletteReadout.textContent = palette;
  }

  toast(msg: string): void {
    this.toastEl.textContent = msg;
    this.toastEl.classList.add("show");
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toastEl.classList.remove("show"), 1900);
  }
}
