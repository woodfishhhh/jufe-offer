import { cn } from "@/lib/utils";

type FlowingWavesProps = { className?: string };

const paths = [
  "M-80 90 C160 4 290 176 520 92 S890 8 1280 112",
  "M-100 150 C120 58 310 238 560 142 S930 66 1300 164",
  "M-60 214 C170 124 330 292 590 208 S980 130 1290 224",
  "M-120 282 C140 176 360 362 650 274 S990 206 1320 294",
  "M-80 354 C190 250 390 430 690 342 S1010 278 1300 360",
  "M-110 424 C170 338 420 496 720 416 S1030 350 1320 442",
];

export function FlowingWaves({ className }: FlowingWavesProps) {
  return (
    <div className={cn("flow-field", className)} aria-hidden="true">
      <svg viewBox="0 0 1200 520" preserveAspectRatio="none">
        {paths.map((path, index) => (
          <path
            key={path}
            d={path}
            className="flow-line"
            opacity={0.08 + index * 0.012}
          />
        ))}
      </svg>
    </div>
  );
}
