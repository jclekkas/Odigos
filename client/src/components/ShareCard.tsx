const CARD_W = 1200;
const CARD_H = 630;
const SCALE = 2;

const VERDICT_COLORS: Record<string, { text: string; badge: string }> = {
  "GO": { text: "#065f46", badge: "#10b981" },
  "NO-GO": { text: "#991b1b", badge: "#ef4444" },
  "NEED-MORE-INFO": { text: "#92400e", badge: "#f59e0b" },
};

interface DrawScorecardOptions {
  goNoGo: "GO" | "NO-GO" | "NEED-MORE-INFO";
  verdictLabel: string;
  topIssues: string[];
}

function drawOdigosLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const blockSize = size * 0.44;
  const gap = size * 0.12;
  const r = size * 0.04;

  ctx.fillStyle = "#f97316";

  function roundRect(rx: number, ry: number, rw: number, rh: number) {
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, r);
    ctx.fill();
  }

  roundRect(x, y, blockSize, blockSize);
  roundRect(x + blockSize + gap, y, blockSize, blockSize);
  roundRect(x, y + blockSize + gap, blockSize, blockSize);
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}

export function drawScorecard(options: DrawScorecardOptions): string {
  const { goNoGo, verdictLabel, topIssues } = options;
  const colors = VERDICT_COLORS[goNoGo] ?? VERDICT_COLORS["NEED-MORE-INFO"];
  const issues = topIssues.length > 0
    ? topIssues.slice(0, 3)
    : ["No major issues surfaced in this summary"];

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  const padX = 64;
  const padY = 56;
  const contentW = CARD_W - padX * 2;

  drawOdigosLogo(ctx, padX, padY, 36);

  ctx.font = "700 28px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#18181b";
  ctx.textBaseline = "middle";
  ctx.fillText("Odigos", padX + 48, padY + 18);

  ctx.font = "500 16px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#a1a1aa";
  const odigosW = ctx.measureText("Odigos").width;
  ctx.font = "700 28px system-ui, -apple-system, 'Segoe UI', sans-serif";
  const brandW = ctx.measureText("Odigos").width;
  ctx.font = "500 16px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillText("Deal Scorecard", padX + 48 + brandW + 8, padY + 18);

  let curY = padY + 76;

  ctx.font = "700 20px system-ui, -apple-system, 'Segoe UI', sans-serif";
  const badgeText = goNoGo;
  const badgeMetrics = ctx.measureText(badgeText);
  const badgePadX = 20;
  const badgePadY = 8;
  const badgeW = badgeMetrics.width + badgePadX * 2;
  const badgeH = 36;

  ctx.fillStyle = colors.badge;
  ctx.beginPath();
  ctx.roundRect(padX, curY, badgeW, badgeH, 8);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, padX + badgePadX, curY + badgeH / 2);

  curY += badgeH + 18;

  ctx.font = "600 24px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = colors.text;
  ctx.textBaseline = "top";
  const verdictTruncated = truncateText(ctx, verdictLabel, contentW);
  ctx.fillText(verdictTruncated, padX, curY);

  curY += 56;

  ctx.font = "600 13px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#71717a";
  ctx.textBaseline = "top";
  ctx.fillText("ISSUES FLAGGED", padX, curY);

  curY += 30;

  ctx.font = "400 17px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#3f3f46";
  ctx.textBaseline = "top";

  for (const issue of issues) {
    const bulletX = padX;
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("•", bulletX, curY);

    ctx.fillStyle = "#3f3f46";
    const issueText = truncateText(ctx, issue, contentW - 24);
    ctx.fillText(issueText, bulletX + 22, curY);
    curY += 28;
  }

  const footerY = CARD_H - padY;
  ctx.strokeStyle = "#e4e4e7";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, footerY - 20);
  ctx.lineTo(CARD_W - padX, footerY - 20);
  ctx.stroke();

  ctx.font = "400 14px system-ui, -apple-system, 'Segoe UI', sans-serif";
  ctx.fillStyle = "#a1a1aa";
  ctx.textBaseline = "bottom";
  ctx.fillText("Analyzed by Odigos • odigos.replit.app", padX, footerY);

  return canvas.toDataURL("image/png");
}

export default drawScorecard;
