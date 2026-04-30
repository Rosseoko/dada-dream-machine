import { useEffect, useRef, useState } from "react";
import type { Scrap } from "@/lib/dada/scraps";

type Props = {
  scrap: Scrap;
  posterW: number;
  posterH: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onChange: (id: string, patch: Partial<Pick<Scrap, "x" | "y" | "rotation">>) => void;
  onFocus: (id: string) => void;
  zIndex: number;
};

// A draggable, rotatable newspaper-cutout word.
// Position is stored in poster units (the same units as W/H used by the SVG).
// We translate to actual pixels using the live container size.
export function WordScrap({ scrap, posterW, posterH, containerRef, onChange, onFocus, zIndex }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    rotateMode: boolean;
    startRot: number;
  } | null>(null);

  // Pixel scale: container px per poster unit
  const scale = (containerRef.current?.clientWidth ?? posterW) / posterW;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus(scrap.id);
    elRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    dragState.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: scrap.x,
      startY: scrap.y,
      rotateMode: e.shiftKey || e.altKey,
      startRot: scrap.rotation,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !dragState.current) return;
    const ds = dragState.current;
    const dx = (e.clientX - ds.startClientX) / (scale || 1);
    const dy = (e.clientY - ds.startClientY) / (scale || 1);
    if (ds.rotateMode) {
      // dx of 200 poster units → ~90deg
      onChange(scrap.id, { rotation: ds.startRot + dx * 0.5 });
    } else {
      const nx = Math.max(0, Math.min(posterW, ds.startX + dx));
      const ny = Math.max(0, Math.min(posterH, ds.startY + dy));
      onChange(scrap.id, { x: nx, y: ny });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    elRef.current?.releasePointerCapture(e.pointerId);
    setDragging(false);
    dragState.current = null;
  };

  const handleDoubleClick = () => {
    onChange(scrap.id, { rotation: scrap.rotation + 15 });
  };

  // Double-tap on touch is awkward; expose a tiny rotate handle via right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(scrap.id, { rotation: scrap.rotation - 15 });
  };

  // Recalculate when window resizes — force re-render via state
  const [, force] = useState(0);
  useEffect(() => {
    const onR = () => force((n) => n + 1);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  return (
    <div
      ref={elRef}
      className="dada-scrap"
      data-scrap
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      style={{
        position: "absolute",
        left: `${(scrap.x / posterW) * 100}%`,
        top: `${(scrap.y / posterH) * 100}%`,
        transform: `translate(-50%, -50%) rotate(${scrap.rotation}deg) skewX(${scrap.tilt}deg)`,
        fontFamily: scrap.fontFamily,
        fontWeight: scrap.fontWeight,
        fontStyle: scrap.fontStyle,
        fontSize: `${(scrap.fontSize / posterW) * 100}cqw`,
        letterSpacing: `${scrap.letterSpacing}px`,
        background: scrap.paperTone,
        color: scrap.inkTone,
        padding: "0.18em 0.45em 0.22em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        clipPath: scrap.clipPath,
        WebkitClipPath: scrap.clipPath,
        boxShadow: scrap.shadow,
        cursor: dragging ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
        zIndex,
        textDecoration: scrap.struck ? "line-through" : "none",
        textDecorationThickness: scrap.struck ? "0.12em" : undefined,
        // Subtle paper grain via inset shadow
        backgroundImage:
          "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1.4px), radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1.6px)",
        backgroundSize: "3px 3px, 5px 5px",
        backgroundPosition: "0 0, 1px 2px",
      }}
    >
      {scrap.text}
    </div>
  );
}
