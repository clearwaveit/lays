/** Bracket connector stroke — brand red */
export const BRACKET_LINE_COLOR = "#DF2027";
export const BRACKET_LINE_WIDTH = 1;

const SLOT_SELECTOR = "[data-bracket-slot]";

type PillRect = {
  center: { x: number; y: number };
  left: number;
  right: number;
};

/** Map viewport rects to layout coords (matches offsetWidth/Height when CSS zoom is used). */
function containerLayoutScale(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const scaleX = rect.width > 0 ? container.offsetWidth / rect.width : 1;
  const scaleY = rect.height > 0 ? container.offsetHeight / rect.height : 1;
  return { scaleX, scaleY, rect };
}

function rectInContainer(el: Element, container: HTMLElement): PillRect {
  const { scaleX, scaleY, rect: containerRect } = containerLayoutScale(container);
  const r = el.getBoundingClientRect();
  const left = (r.left - containerRect.left) * scaleX;
  const right = (r.right - containerRect.left) * scaleX;
  const top = (r.top - containerRect.top) * scaleY;
  const height = r.height * scaleY;

  return {
    center: {
      x: left + (right - left) / 2,
      y: top + height / 2,
    },
    left,
    right,
  };
}

function columnBridgeX(
  sourceCol: Element,
  targetCol: Element,
  container: HTMLElement,
  side: "left" | "right",
): number {
  const { scaleX, rect: containerRect } = containerLayoutScale(container);
  const source = sourceCol.getBoundingClientRect();
  const target = targetCol.getBoundingClientRect();
  if (side === "left") {
    return (
      ((source.right - containerRect.left) * scaleX +
        (target.left - containerRect.left) * scaleX) /
      2
    );
  }
  return (
    ((source.left - containerRect.left) * scaleX +
      (target.right - containerRect.left) * scaleX) /
    2
  );
}

function pathLeftPairToTarget(
  a: PillRect,
  b: PillRect,
  target: PillRect,
  xVert: number,
): string {
  const yMid = (a.center.y + b.center.y) / 2;
  const xBeforeTarget = target.left - 6;

  return [
    `M ${xVert} ${a.center.y}`,
    `L ${xVert} ${b.center.y}`,
    `M ${xVert} ${yMid}`,
    `L ${xBeforeTarget} ${yMid}`,
    `L ${xBeforeTarget} ${target.center.y}`,
    `L ${target.left} ${target.center.y}`,
  ].join(" ");
}

function pathRightPairToTarget(
  a: PillRect,
  b: PillRect,
  target: PillRect,
  xVert: number,
): string {
  const yMid = (a.center.y + b.center.y) / 2;
  const xBeforeTarget = target.right + 6;

  return [
    `M ${xVert} ${a.center.y}`,
    `L ${xVert} ${b.center.y}`,
    `M ${xVert} ${yMid}`,
    `L ${xBeforeTarget} ${yMid}`,
    `L ${xBeforeTarget} ${target.center.y}`,
    `L ${target.right} ${target.center.y}`,
  ].join(" ");
}

function pathLeftSingleToTarget(
  a: PillRect,
  target: PillRect,
  xVert: number,
): string {
  const y = a.center.y;
  const xBeforeTarget = target.left - 6;
  return [
    `M ${xVert} ${y}`,
    `L ${xBeforeTarget} ${y}`,
    `L ${xBeforeTarget} ${target.center.y}`,
    `L ${target.left} ${target.center.y}`,
  ].join(" ");
}

function pathRightSingleToTarget(
  a: PillRect,
  target: PillRect,
  xVert: number,
): string {
  const y = a.center.y;
  const xBeforeTarget = target.right + 6;
  return [
    `M ${xVert} ${y}`,
    `L ${xBeforeTarget} ${y}`,
    `L ${xBeforeTarget} ${target.center.y}`,
    `L ${target.right} ${target.center.y}`,
  ].join(" ");
}

function connectColumns(
  sourcePills: PillRect[],
  targetPills: PillRect[],
  side: "left" | "right",
  xVert: number,
): string[] {
  const paths: string[] = [];

  for (let t = 0; t < targetPills.length; t += 1) {
    const target = targetPills[t]!;
    const a = sourcePills[t * 2];
    const b = sourcePills[t * 2 + 1];

    if (a && b) {
      paths.push(
        side === "left"
          ? pathLeftPairToTarget(a, b, target, xVert)
          : pathRightPairToTarget(a, b, target, xVert),
      );
    } else if (a) {
      paths.push(
        side === "left"
          ? pathLeftSingleToTarget(a, target, xVert)
          : pathRightSingleToTarget(a, target, xVert),
      );
    }
  }

  return paths;
}

function getBracketColumns(root: ParentNode): Element[] {
  return Array.from(root.querySelectorAll("[data-bracket-column]")).filter(
    (col) => col.querySelector(SLOT_SELECTOR),
  );
}

export function computeSideConnectorPaths(
  sideEl: HTMLElement,
  side: "left" | "right",
): string[] {
  const columns = getBracketColumns(sideEl);

  const ordered = side === "right" ? [...columns].reverse() : columns;

  const paths: string[] = [];

  for (let i = 0; i < ordered.length - 1; i += 1) {
    const sourceCol = ordered[i]!;
    const targetCol = ordered[i + 1]!;
    const sourcePills = Array.from(sourceCol.querySelectorAll(SLOT_SELECTOR)).map(
      (el) => rectInContainer(el, sideEl),
    );
    const targetPills = Array.from(targetCol.querySelectorAll(SLOT_SELECTOR)).map(
      (el) => rectInContainer(el, sideEl),
    );

    if (sourcePills.length === 0 || targetPills.length === 0) continue;

    const xVert = columnBridgeX(sourceCol, targetCol, sideEl, side);
    paths.push(...connectColumns(sourcePills, targetPills, side, xVert));
  }

  return paths;
}

export function computeFinalConnectorPaths(gridEl: HTMLElement): string[] {
  const finalSlot =
    gridEl.querySelector("[data-bracket-final] [data-bracket-slot]") ??
    gridEl.querySelector("[data-bracket-final]");
  if (!finalSlot) return [];

  const final = rectInContainer(finalSlot, gridEl);
  const { scaleX, rect: containerRect } = containerLayoutScale(gridEl);
  const paths: string[] = [];

  for (const side of ["left", "right"] as const) {
    const sideRoot = gridEl.querySelector(`[data-bracket-side="${side}"]`);
    if (!sideRoot) continue;

    const columns = getBracketColumns(sideRoot);
    const lastCol = columns[columns.length - 1];
    if (!lastCol) continue;

    const semiPills = Array.from(lastCol.querySelectorAll(SLOT_SELECTOR)).map(
      (el) => rectInContainer(el, gridEl),
    );

    const lastColRect = lastCol.getBoundingClientRect();
    const xBridge =
      side === "left"
        ? ((lastColRect.right - containerRect.left) * scaleX +
            (final.left - 6)) /
          2
        : ((lastColRect.left - containerRect.left) * scaleX +
            (final.right + 6)) /
          2;

    for (const semi of semiPills) {
      if (side === "left") {
        paths.push(
          [
            `M ${semi.right} ${semi.center.y}`,
            `L ${xBridge} ${semi.center.y}`,
            `L ${xBridge} ${final.center.y}`,
            `L ${final.left} ${final.center.y}`,
          ].join(" "),
        );
      } else {
        paths.push(
          [
            `M ${semi.left} ${semi.center.y}`,
            `L ${xBridge} ${semi.center.y}`,
            `L ${xBridge} ${final.center.y}`,
            `L ${final.right} ${final.center.y}`,
          ].join(" "),
        );
      }
    }
  }

  return paths;
}
