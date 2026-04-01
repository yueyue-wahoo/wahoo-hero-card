"use client";

import { useMemo, useState, useEffect, useRef, useCallback, useId } from "react";
import { WfSnailVariant, type WfSnailProps, type SnailDimension } from "./types";
import { cyclingConfig, getRingColors, type RingConfig } from "./snailConfig";

// Theme constants (from Wahoo redesignr light theme)
const PALETTE_SECONDARY_MAIN = "#ecedee";
const PALETTE_DIVIDER = "#0000001f";
const PALETTE_TEXT_PRIMARY = "#000000";
const PALETTE_TEXT_SECONDARY = "#00000099";
const PALETTE_COMMON_BLACK = "#000000";

interface RingData {
  id: number;
  label: string;
  secondaryLabel: string;
  secondaryToolTip?: string;
  color: string;
  colorGradientStart: string;
  colorGradientEnd: string;
  rank: number;
  value: number;
  radius: number;
  circumference: number;
  dashoffsetMax: number;
  dashoffset: number;
  dashoffsetBorder: number;
  clampedValue: number;
}

const WfSnail = (props: WfSnailProps) => {
  const { variant = WfSnailVariant.Standard, empty = false, dimensions } = props;

  const isSmall = variant === WfSnailVariant.Small;

  const componentHeight = isSmall ? 160 : 320;
  const BAR_PADDING = isSmall ? 4 : 8;
  const BAR_HEIGHT = isSmall ? 12 : 24;
  const MAX_RADIUS = (componentHeight - (BAR_HEIGHT + BAR_PADDING) * 2) / 2;
  const minWidth = (MAX_RADIUS + BAR_HEIGHT) * 2;
  const [svgRenderKey, setSvgRenderKey] = useState(0);
  const uid = useId().replace(/:/g, "");

  const config: RingConfig[] = cyclingConfig;

  const getDimensionValues = useCallback((): SnailDimension[] => {
    return [dimensions.ftp, dimensions.map, dimensions.ac, dimensions.nm];
  }, [dimensions]);

  const calculateCircleValues = useCallback(
    (value: number, index: number) => {
      const radius = MAX_RADIUS - (BAR_HEIGHT + BAR_PADDING) * index;
      const circumference = 2 * Math.PI * radius;
      const maxFillRatio = 0.75;
      const clampedValue = Math.max(-1, Math.min(1, value));
      const arcLength = circumference * ((clampedValue + 1) / 2) * maxFillRatio;
      const dashoffset = circumference - arcLength;
      const dashoffsetBorder = circumference - arcLength - 1;
      const dashoffsetMax = circumference * (1 - maxFillRatio);
      return {
        radius,
        circumference,
        dashoffsetMax,
        dashoffset,
        dashoffsetBorder,
        clampedValue,
      };
    },
    [MAX_RADIUS, BAR_HEIGHT, BAR_PADDING]
  );

  const ringData: RingData[] = useMemo(() => {
    const dimensionValues = getDimensionValues();
    return config.map((ringConfig, index) => {
      const colors = getRingColors(ringConfig.colorKey);
      const dimension = dimensionValues[index];
      const circleCalcs = calculateCircleValues(dimension.rank, index);
      return {
        id: index,
        label: ringConfig.label,
        secondaryLabel: ringConfig.secondaryLabel,
        secondaryToolTip: ringConfig.secondaryToolTip,
        color: colors.main,
        colorGradientStart: colors.gradientStart,
        colorGradientEnd: colors.gradientEnd,
        rank: dimension.rank,
        value: dimension.value,
        ...circleCalcs,
      };
    });
  }, [config, getDimensionValues, calculateCircleValues]);

  const chartRef = useRef<HTMLDivElement>(null);
  const [componentWidth, setComponentWidth] = useState(0);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const boundingWidth = entries[0].contentRect.width;
      const width = Math.max(boundingWidth, minWidth);
      setComponentWidth(width);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [minWidth]);

  useEffect(() => {
    setSvgRenderKey((prevKey) => prevKey + 1);
  }, [dimensions]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      <svg
        key={svgRenderKey}
        width={componentWidth}
        height={componentHeight}
        viewBox={`0 0 ${componentWidth} ${componentHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mask to create transparent gaps in grey arcs where colored arcs will be */}
        {!empty && (
          <defs>
            <mask id={`grey-mask-${uid}-${svgRenderKey}`}>
              <rect x="0" y="0" width={componentWidth} height={componentHeight} fill="white" />
              {ringData.map((ring) => (
                <circle
                  key={`mask-cut-${ring.id}`}
                  cx={componentWidth / 2}
                  cy={componentHeight / 2}
                  r={ring.radius}
                  stroke="black"
                  strokeWidth={BAR_HEIGHT + 5}
                  fill="none"
                  strokeDasharray={ring.circumference}
                  strokeDashoffset={ring.circumference}
                  strokeLinecap={ring.clampedValue === 1 ? "butt" : "round"}
                  transform={`rotate(-90 ${componentWidth / 2} ${componentHeight / 2})`}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values={`${ring.circumference};${ring.dashoffset}`}
                    dur="1.0s"
                    begin="0.3s"
                    calcMode="spline"
                    keySplines="0.05, 0.1, 0.25, 1"
                    fill="freeze"
                  />
                </circle>
              ))}
            </mask>
          </defs>
        )}

        {/* Background circles (grey base) */}
        <g mask={!empty ? `url(#grey-mask-${uid}-${svgRenderKey})` : undefined}>
          {ringData.map((ring) => (
            <circle
              key={`bg-${ring.id}`}
              cx={componentWidth / 2}
              cy={componentHeight / 2}
              r={ring.radius}
              stroke={PALETTE_SECONDARY_MAIN}
              strokeWidth={BAR_HEIGHT}
              fill="none"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.dashoffsetMax}
              transform={`rotate(-90 ${componentWidth / 2} ${componentHeight / 2})`}
            />
          ))}
        </g>

        {/* Colored circles */}
        {!empty && (
          <>
            <defs>
              {ringData.map((ring) => (
                <linearGradient
                  id={`gradient-${uid}-${ring.id}`}
                  key={`grad-${ring.id}`}
                  gradientTransform="rotate(5)"
                >
                  <stop offset="0%" stopColor={ring.colorGradientStart} stopOpacity="1" />
                  <stop offset="100%" stopColor={ring.colorGradientEnd} stopOpacity="1" />
                </linearGradient>
              ))}
            </defs>
            {ringData.map((ring) => (
              <circle
                key={`colored-${ring.id}`}
                cx={componentWidth / 2}
                cy={componentHeight / 2}
                r={ring.radius}
                stroke={`url(#gradient-${uid}-${ring.id})`}
                strokeWidth={BAR_HEIGHT}
                fill="none"
                strokeDasharray={ring.circumference}
                strokeDashoffset={ring.circumference}
                strokeLinecap={ring.clampedValue === 1 ? "butt" : "round"}
                transform={`rotate(-90 ${componentWidth / 2} ${componentHeight / 2})`}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values={`${ring.circumference};${ring.dashoffset}`}
                  dur="1.0s"
                  begin="0.3s"
                  calcMode="spline"
                  keySplines="0.05, 0.1, 0.25, 1"
                  fill="freeze"
                />
              </circle>
            ))}
          </>
        )}

        {/* Horizontal bars from left edge to center */}
        <defs>
          {ringData.map((ring) => (
            <linearGradient id={`bar-gradient-${uid}-${ring.id}`} key={`bar-grad-${ring.id}`}>
              <stop offset="0%" stopColor={ring.colorGradientEnd} stopOpacity="1" />
              <stop offset="100%" stopColor={ring.colorGradientStart} stopOpacity="1" />
            </linearGradient>
          ))}
        </defs>
        {ringData.map((ring) => (
          <rect
            key={`bar-${ring.id}`}
            x="0"
            y={BAR_PADDING + 0.5 * BAR_HEIGHT + (BAR_PADDING + BAR_HEIGHT) * ring.id}
            width={componentWidth / 2}
            height={BAR_HEIGHT}
            fill={empty ? PALETTE_SECONDARY_MAIN : ring.colorGradientEnd}
          />
        ))}

        {/* Empty state: colored left accent bars (standard only) */}
        {empty &&
          !isSmall &&
          ringData.map((ring) => (
            <rect
              key={`empty-bar-${ring.id}`}
              x="0"
              y={BAR_PADDING + 0.5 * BAR_HEIGHT + (BAR_PADDING + BAR_HEIGHT) * ring.id}
              width={10}
              height={BAR_HEIGHT}
              fill={`url(#bar-gradient-${uid}-${ring.id})`}
            />
          ))}

        {/* Standard variant: Labels, values, dotted lines, arc labels */}
        {!isSmall && (
          <>
            {/* Labels */}
            {ringData.map((ring) => {
              const rowY = BAR_PADDING + 0.5 * BAR_HEIGHT + (BAR_PADDING + BAR_HEIGHT) * ring.id;
              const textColor = empty ? PALETTE_TEXT_PRIMARY : PALETTE_COMMON_BLACK;

              return (
                <g key={`label-${ring.id}`}>
                  <foreignObject
                    x={10}
                    y={rowY}
                    width={componentWidth / 2 - 18}
                    height={BAR_HEIGHT}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        fontFamily: "Inter, Arial, sans-serif",
                        gap: "4px",
                        paddingLeft: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: empty ? 500 : 600,
                          color: textColor,
                        }}
                      >
                        {ring.label}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 400,
                          letterSpacing: "0.053px",
                          color: textColor,
                          ...(ring.secondaryToolTip
                            ? {
                                textDecorationLine: "underline",
                                textDecorationStyle: "dotted" as const,
                                textDecorationSkipInk: "none" as const,
                                textDecorationThickness: "9%",
                                cursor: "pointer",
                              }
                            : {}),
                        }}
                        title={ring.secondaryToolTip}
                      >
                        {ring.secondaryLabel}
                      </span>
                    </div>
                  </foreignObject>

                  <text
                    x={componentWidth / 2 - 8}
                    y={
                      BAR_PADDING +
                      0.5 * BAR_HEIGHT +
                      (BAR_PADDING + BAR_HEIGHT) * ring.id +
                      BAR_HEIGHT / 2 +
                      5
                    }
                    fontSize="14"
                    textAnchor="end"
                    fontFamily="Inter, Arial, sans-serif"
                    fontStyle="normal"
                    fontWeight="700"
                    fill={empty ? PALETTE_TEXT_PRIMARY : PALETTE_COMMON_BLACK}
                  >
                    {empty ? "--" : ring.value.toString()}
                    <tspan dx="2" fontSize="10" fontWeight="400">
                      W
                    </tspan>
                  </text>
                </g>
              );
            })}

            {/* Center dotted lines */}
            <line
              x1={(componentWidth - (MAX_RADIUS + BAR_HEIGHT - 2) * 2) / 2}
              y1={componentHeight / 2}
              x2={componentWidth / 2}
              y2={componentHeight / 2}
              stroke={PALETTE_DIVIDER}
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <line
              x1={componentWidth / 2}
              y1={(componentHeight - (MAX_RADIUS + BAR_HEIGHT - 2) * 2) / 2}
              x2={componentWidth / 2}
              y2={componentHeight / 2}
              stroke={PALETTE_DIVIDER}
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <line
              x1={componentWidth / 2}
              y1={componentHeight / 2}
              x2={componentWidth / 2 + (MAX_RADIUS + BAR_HEIGHT - 2) / Math.sqrt(2)}
              y2={componentHeight / 2 + (MAX_RADIUS + BAR_HEIGHT - 2) / Math.sqrt(2)}
              stroke={PALETTE_DIVIDER}
              strokeWidth="2"
              strokeDasharray="4,4"
            />

            {/* Arc labels */}
            <defs>
              <path
                id={`opportunityPath-${uid}`}
                d={`M ${componentWidth / 2},${componentHeight / 2 - MAX_RADIUS - BAR_HEIGHT - 2}
            A ${MAX_RADIUS + BAR_HEIGHT + 2},${MAX_RADIUS + BAR_HEIGHT + 2} 0 0,1
            ${componentWidth / 2 + MAX_RADIUS + BAR_HEIGHT + 2},${componentHeight / 2}`}
                fill="none"
              />
              <path
                id={`baselinePath-${uid}`}
                d={`M ${componentWidth / 2},${componentHeight / 2 + MAX_RADIUS + BAR_HEIGHT + 12}
            A ${MAX_RADIUS + BAR_HEIGHT + 12},${MAX_RADIUS + BAR_HEIGHT + 12} 0 0,0
            ${componentWidth / 2 + MAX_RADIUS + BAR_HEIGHT + 12},${componentHeight / 2}`}
                fill="none"
              />
              <path
                id={`strengthPath-${uid}`}
                d={`M ${componentWidth / 2 - MAX_RADIUS - BAR_HEIGHT - 12},${componentHeight / 2}
            A ${MAX_RADIUS + BAR_HEIGHT + 12},${MAX_RADIUS + BAR_HEIGHT + 12} 0 0,0
            ${componentWidth / 2},${componentHeight / 2 + MAX_RADIUS + BAR_HEIGHT + 12}`}
                fill="none"
              />
            </defs>

            <text
              fill={PALETTE_TEXT_SECONDARY}
              fontFamily="Inter, Arial, sans-serif"
              fontSize="12"
              textAnchor="middle"
            >
              <textPath href={`#opportunityPath-${uid}`} startOffset="50%">
                <tspan letterSpacing="1.5">OPPORTUNITY</tspan>
              </textPath>
            </text>
            <text
              fill={PALETTE_TEXT_SECONDARY}
              fontFamily="Inter, Arial, sans-serif"
              fontSize="12"
              textAnchor="middle"
            >
              <textPath href={`#baselinePath-${uid}`} startOffset="50%">
                <tspan letterSpacing="1.5">BASELINE</tspan>
              </textPath>
            </text>
            <text
              fill={PALETTE_TEXT_SECONDARY}
              fontFamily="Inter, Arial, sans-serif"
              fontSize="12"
              textAnchor="middle"
            >
              <textPath href={`#strengthPath-${uid}`} startOffset="50%">
                <tspan letterSpacing="1.5">STRENGTH</tspan>
              </textPath>
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default WfSnail;
