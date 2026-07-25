type PixelCatInput = {
  name?: string;
  title?: string;
  scores?: Record<string, number | null>;
};

const palette = [
  { fur: "#7a6a58", stripe: "#3b332a", eye: "#d7f077", scarf: "#2f7b67" },
  { fur: "#d8a05f", stripe: "#8a5428", eye: "#76c7e0", scarf: "#c83f46" },
  { fur: "#d4d0c5", stripe: "#6e6a60", eye: "#ffd15f", scarf: "#3a8f6a" },
  { fur: "#3c3a37", stripe: "#1f1f1d", eye: "#a8dc6b", scarf: "#d7b46a" },
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
  const name = input.name || "CAT";
  const title = input.title || "pixel cat";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" shape-rendering="crispEdges">
      <rect width="512" height="512" fill="#102339"/>
      <rect x="32" y="32" width="448" height="448" fill="#17304a"/>
      <rect x="48" y="48" width="416" height="416" fill="#102339"/>
      <rect x="80" y="80" width="24" height="24" fill="#ffd36e"/>
      <rect x="400" y="96" width="16" height="16" fill="#ffd36e"/>
      <rect x="360" y="56" width="10" height="10" fill="#ffe5ac"/>
      <rect x="124" y="104" width="14" height="14" fill="#ffe5ac"/>
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
      <rect x="156" y="352" width="200" height="40" fill="${colors.scarf}"/>
      <rect x="236" y="360" width="40" height="40" fill="#ffd36e"/>
      <rect x="248" y="372" width="16" height="16" fill="#8b5a24"/>
      <rect x="88" y="400" width="336" height="34" fill="#ffe5ac"/>
      <text x="256" y="423" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#4b2a11">${escapeSvg(name)} · ${escapeSvg(title)}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
