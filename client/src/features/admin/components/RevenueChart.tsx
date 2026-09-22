import { useState } from "react";
import type { RevenuePoint } from "../types";

interface RevenueChartProps {
    data: RevenuePoint[];
}

const WIDTH = 560;
const HEIGHT = 220;
const PAD_TOP = 20;
const PAD_BOTTOM = 30;
const PAD_X = 12;

const compactValue = (value: number) => `${Math.round(value / 1000)}k`;

const formatMoney = (value: number) =>
    `${value.toLocaleString("en-US", { maximumFractionDigits: 0 })} EGP`;

const RevenueChart = ({ data }: RevenueChartProps) => {
    const [hovered, setHovered] = useState<number | null>(null);

    const innerW = WIDTH - PAD_X * 2;
    const innerH = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const rawMin = Math.min(...data.map((point) => point.revenue));
    const rawMax = Math.max(...data.map((point) => point.revenue));

    const max = rawMax * 1.12 || 100;
    const min = rawMin < rawMax ? rawMin * 0.85 : max * 0.85;

    const x = (index: number) => PAD_X + (index * innerW) / (data.length - 1);
    const y = (value: number) =>
        PAD_TOP + innerH - ((value - min) / (max - min)) * innerH;

    const linePath = data
        .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.revenue)}`)
        .join(" ");

    const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD_TOP + innerH} L ${x(0)} ${
        PAD_TOP + innerH
    } Z`;

    const gridLines = [0, 0.25, 0.5, 0.75, 1];

    const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = (event.clientX - rect.left) / rect.width;
        const index = Math.round((ratio * (data.length - 1)));
        const clamped = Math.min(Math.max(index, 0), data.length - 1);
        setHovered(clamped);
    };

    return (
        <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-56 w-full cursor-crosshair sm:h-64"
            onMouseMove={handleMove}
            onMouseLeave={() => setHovered(null)}
        >
            <defs>
                <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e10000" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#e10000" stopOpacity="0.02" />
                </linearGradient>
            </defs>

            {gridLines.map((frac) => {
                const gy = PAD_TOP + innerH * frac;
                const label = max - (max - min) * frac;
                return (
                    <g key={frac}>
                        <line
                            x1={PAD_X}
                            y1={gy}
                            x2={WIDTH - PAD_X}
                            y2={gy}
                            stroke="var(--color-muted-foreground)"
                            strokeOpacity="0.15"
                            strokeDasharray="3 4"
                        />
                        <text
                            x={WIDTH - PAD_X}
                            y={gy - 4}
                            textAnchor="end"
                            fontSize="10"
                            fill="var(--color-muted-foreground)"
                            opacity="0.7"
                        >
                            {compactValue(label)}
                        </text>
                    </g>
                );
            })}

            <path d={areaPath} fill="url(#revenue-fill)" />
            <path
                d={linePath}
                fill="none"
                stroke="#e10000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {data.map((point, index) => (
                <text
                    key={point.day}
                    x={x(index)}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--color-muted-foreground)"
                    opacity={hovered === index ? 1 : 0.7}
                    fontWeight={hovered === index ? 600 : 400}
                >
                    {point.day}
                </text>
            ))}

            {hovered !== null && (
                <g>
                    <line
                        x1={x(hovered)}
                        y1={PAD_TOP}
                        x2={x(hovered)}
                        y2={PAD_TOP + innerH}
                        stroke="#e10000"
                        strokeOpacity="0.35"
                        strokeDasharray="3 3"
                    />
                    <circle
                        cx={x(hovered)}
                        cy={y(data[hovered].revenue)}
                        r="4.5"
                        fill="#e10000"
                        stroke="var(--color-card)"
                        strokeWidth="2"
                    />
                    <g>
                        <rect
                            x={Math.min(
                                Math.max(x(hovered) - 52, PAD_X),
                                WIDTH - PAD_X - 104
                            )}
                            y={y(data[hovered].revenue) - 44}
                            width="104"
                            height="30"
                            rx="6"
                            fill="var(--color-card)"
                            stroke="var(--color-border)"
                        />
                        <text
                            x={Math.min(Math.max(x(hovered), PAD_X + 52), WIDTH - PAD_X - 52)}
                            y={y(data[hovered].revenue) - 25}
                            textAnchor="middle"
                            fontSize="10"
                            fill="var(--color-secondary)"
                            fontWeight="600"
                        >
                            {data[hovered].day} · {formatMoney(data[hovered].revenue)}
                        </text>
                    </g>
                </g>
            )}
        </svg>
    );
};

export default RevenueChart;