# Mycelia

**A living organism grown from a word.** One million autonomous agents run entirely on your GPU, sensing and reinforcing the chemical trails they leave behind, and self-organize into breathing, bioluminescent networks. Type any word and it grows a *specific* creature — the same word always grows the same one.

> Physarum (slime-mold) transport networks, simulated in real time in WebGL2. No frameworks, no dependencies, ~29 KB.

🌱 **[Live demo →](#)** &nbsp;·&nbsp; type a seed, watch it grow, share the link.

---

## The idea

Real slime molds have no brain, yet they solve mazes and rebuild the Tokyo rail map. Each cell just follows two rules: *drift toward stronger scent* and *leave scent behind*. A million of them, and structure emerges — bold arterial highways, delicate capillaries, cells and membranes.

Mycelia runs that model on the GPU and wires it to a **deterministic genome**:

```
"gossamer"  ─▶  xmur3 hash  ─▶  seeded PRNG  ─▶  { sensor angle, reach, turn rate,
                                                   decay, diffusion, colonies,
                                                   palette, spawn pattern, … }
```

Every parameter of the organism is drawn from that one seed. Share `?seed=gossamer` and anyone who opens it grows the exact same creature. Tweak the genome live and the shareable link carries your edits too.

## How it works

The whole simulation is four GPU passes per step — no data ever leaves the graphics card:

| Pass | What it does |
|------|--------------|
| **Update** | Each agent is one texel in a float texture. It samples the pheromone field along three whiskers, steers toward the strongest trail of its own colony, moves, and wraps. |
| **Diffuse + decay** | The trail field is blurred and faded so unused paths dissolve and used ones sharpen. Food injected at the cursor lives here. |
| **Deposit** | One `GL_POINT` per agent — a million of them — pulled straight from the agent texture by `gl_VertexID` and additively blended into the field. |
| **Display** | The field is tone-mapped, hue-shifted, bloomed, vignetted and grained into the cinematic image you see. Exposure is normalized against each genome's own equilibrium so *every* seed reads with structure. |

Up to **three colonies** interact — each deposits into its own channel and avoids the others, so they carve out distinct territories with luminous membranes between them.

## Controls

- **Type a word + Grow** — germinate a new organism from a seed.
- **⚄** — random seed.
- **Click + drag** — feed the colony; it grows toward your cursor.
- **Shift + drag** — scare it; the colony recoils.
- **Genome panel** — steer sensing, motion, decay, diffusion, colony count, spawn pattern and palette in real time.
- **Save** — export the current frame as a PNG.
- **Share** — copy a link that regrows exactly what you're looking at.
- Keyboard: `space` pause · `r` regrow · `s` save · `g` toggle panel · `←/→` cycle palette.

## Tech

- **WebGL2** raw — fragment-shader compute via ping-ponged float framebuffers (`RGBA32F` agent state, `RGBA16F` trail field), `EXT_color_buffer_float`.
- **TypeScript**, strict. **Vite**. No runtime dependencies.
- The simulation runs at a fixed dense resolution and is upscaled smoothly, so the organism has a consistent scale and density on any display; the render loop takes two substeps per frame so growth is quick to watch.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5180
pnpm build      # static bundle in dist/
```

Deploys as a static site anywhere (Vercel, Netlify, GitHub Pages).

## Requirements

A browser with WebGL2 and float render targets — Chrome, Edge, Firefox, and Safari 15+. Runs best on a discrete or Apple-silicon GPU; narrower screens automatically step down the agent count.

---

*Built as a study in emergence: the smallest possible rules, a million times over, becoming something that looks alive.*
