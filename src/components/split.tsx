import type { CSSProperties } from "react";

export function Split({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`link-letters ${className}`}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="ll-char"
          style={{ "--i": i } as CSSProperties}
        >
          {char}
        </span>
      ))}
    </span>
  );
}
