// Curated palettes. Each is a background plus up to three species colours,
// tuned to read as bioluminescent / organic. Colours are linear-ish RGB in 0..1.

export interface Palette {
  name: string;
  background: [number, number, number];
  species: [[number, number, number], [number, number, number], [number, number, number]];
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const PALETTES: Palette[] = [
  {
    name: "Abyss",
    background: hex("#04060b"),
    species: [hex("#37f5c4"), hex("#3a7bd5"), hex("#b06bff")],
  },
  {
    name: "Ember",
    background: hex("#0a0503"),
    species: [hex("#ff7a3c"), hex("#ffd166"), hex("#ff3b6b")],
  },
  {
    name: "Spore",
    background: hex("#060a07"),
    species: [hex("#9dff5a"), hex("#2ad6a1"), hex("#e8ff9c")],
  },
  {
    name: "Nebula",
    background: hex("#07040c"),
    species: [hex("#c56bff"), hex("#ff5ea8"), hex("#5ac8ff")],
  },
  {
    name: "Ivory",
    background: hex("#0b0a08"),
    species: [hex("#fef3e2"), hex("#f5c06b"), hex("#c98a4b")],
  },
  {
    name: "Cyan Rot",
    background: hex("#03080a"),
    species: [hex("#18e0e0"), hex("#7cf0ff"), hex("#0f8f8f")],
  },
  {
    name: "Magma",
    background: hex("#0b0402"),
    species: [hex("#ffcf5c"), hex("#ff5722"), hex("#8b1e3f")],
  },
  {
    name: "Frost",
    background: hex("#060910"),
    species: [hex("#bfe9ff"), hex("#6aa9ff"), hex("#e6f7ff")],
  },
];
