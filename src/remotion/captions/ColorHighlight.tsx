import type React from "react";
import { CAPTION_FONTS } from "../lib/fonts";
import type { CaptionStyleProps } from "./CaptionWrapper";

/**
 * Color highlight caption style: spotlight effect. Only the ACTIVE word gets
 * an accent-colored background. Spoken words lose the background (unlike
 * KaraokeSweep where spoken words keep it). Creates a "bouncing spotlight."
 */
export const ColorHighlight: React.FC<CaptionStyleProps> = ({ wordStates, accentColor }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
      padding: "0 40px",
    }}
  >
    {wordStates.map((ws) => {
      const isActive = ws.state === "active";
      return (
        <span
          key={`${ws.word.word}-${ws.globalIndex}`}
          style={{
            fontSize: 52 + ws.springProgress * 6, // 52 -> 58
            fontWeight: 700,
            color: "#FFFFFF",
            fontFamily: CAPTION_FONTS.montserrat,
            textTransform: "uppercase",
            backgroundColor: isActive ? accentColor : "transparent",
            borderRadius: isActive ? 6 : 0,
            padding: isActive ? "4px 10px" : "4px 2px",
            opacity: ws.state === "unspoken" ? 0.4 : 1,
            textShadow: !isActive ? "0 2px 8px rgba(0,0,0,0.6)" : "none",
          }}
        >
          {ws.word.word}
        </span>
      );
    })}
  </div>
);
