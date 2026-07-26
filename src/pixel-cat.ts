type PixelCatInput = {
  name?: string;
  title?: string;
  scores?: Record<string, number | null>;
};

const palette = [
  { fur: "#7a6a58", stripe: "#3b332a", eye: "#d7f077" },
  { fur: "#d8a05f", stripe: "#8a5428", eye: "#76c7e0" },
  { fur: "#d4d0c5", stripe: "#6e6a60", eye: "#ffd15f" },
  { fur: "#3c3a37", stripe: "#1f1f1d", eye: "#a8dc6b" },
];

function hashText(value: string) {
  return Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pickPalette(input: PixelCatInput) {
  const scoreTotal = Object.values(input.scores ?? {}).reduce<number>(
    (sum, value) => sum + (typeof value === "number" ? value : 0),
    0,
  );
  return palette[(hashText(input.name ?? "cat") + scoreTotal) % palette.length];
}

export function createPixelCatSvgDataUrl(input: PixelCatInput) {
  const colors = pickPalette(input);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" shape-rendering="crispEdges">
      <rect x="176" y="176" width="160" height="32" fill="${colors.fur}"/>
      <rect x="144" y="208" width="224" height="144" fill="${colors.fur}"/>
      <rect x="112" y="176" width="64" height="80" fill="${colors.fur}"/>
      <rect x="336" y="176" width="64" height="80" fill="${colors.fur}"/>
      <rect x="128" y="160" width="32" height="32" fill="#f0b0a4"/>
      <rect x="352" y="160" width="32" height="32" fill="#f0b0a4"/>
      <rect x="184" y="232" width="44" height="52" fill="${colors.eye}"/>
      <rect x="284" y="232" width="44" height="52" fill="${colors.eye}"/>
      <rect x="204" y="248" width="12" height="24" fill="#111111"/>
      <rect x="304" y="248" width="12" height="24" fill="#111111"/>
      <rect x="244" y="288" width="24" height="14" fill="#ef8f72"/>
      <rect x="232" y="320" width="20" height="10" fill="#33251c"/>
      <rect x="260" y="320" width="20" height="10" fill="#33251c"/>
      <rect x="176" y="196" width="36" height="12" fill="${colors.stripe}"/>
      <rect x="236" y="176" width="40" height="18" fill="${colors.stripe}"/>
      <rect x="300" y="196" width="36" height="12" fill="${colors.stripe}"/>
      <rect x="136" y="294" width="46" height="8" fill="#24180d"/>
      <rect x="330" y="294" width="46" height="8" fill="#24180d"/>
      <rect x="176" y="352" width="160" height="52" fill="${colors.fur}"/>
      <rect x="136" y="368" width="40" height="40" fill="${colors.fur}"/>
      <rect x="336" y="368" width="40" height="40" fill="${colors.fur}"/>
      <rect x="200" y="370" width="28" height="10" fill="${colors.stripe}"/>
      <rect x="284" y="370" width="28" height="10" fill="${colors.stripe}"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}
