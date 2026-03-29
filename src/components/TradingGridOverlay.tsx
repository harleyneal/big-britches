"use client";

export default function TradingGridOverlay() {
  // Use the Trade Leopard blue palette
  const gridColor = "rgba(26, 151, 244, 0.04)";   // --sl-blue at ~4% for grid lines
  const accentColor = "rgba(26, 151, 244, 0.063)"; // --sl-blue for dashed accent lines
  const lineColor = "rgba(26, 151, 244, 0.108)";   // --sl-blue for the chart polyline
  const fillColor = "rgba(26, 151, 244, 0.032)";   // --sl-blue for the area fill
  const candleColor = "rgba(26, 151, 244, 0.05)";  // --sl-blue for candle bars

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: "-25%",
          transform: "rotate(-10deg)",
          maskImage: "radial-gradient(ellipse 80% 75% at 50% 55%, black 25%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 50% 55%, black 25%, transparent 85%)",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1600 1000" preserveAspectRatio="none">
          {/* Horizontal grid lines */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((y) => (
            <line key={`h-${y}`} x1="0" y1={y} x2="1600" y2={y} stroke={gridColor} strokeWidth="0.6" />
          ))}
          {/* Vertical grid lines */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500].map((x) => (
            <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="1000" stroke={gridColor} strokeWidth="0.6" />
          ))}
          {/* Dashed accent lines (support/resistance levels) */}
          <line x1="0" y1="600" x2="1600" y2="600" stroke={accentColor} strokeWidth="1" strokeDasharray="10 6" />
          <line x1="0" y1="440" x2="1600" y2="440" stroke={accentColor} strokeWidth="1" strokeDasharray="10 6" />
          <line x1="0" y1="280" x2="1600" y2="280" stroke={accentColor} strokeWidth="1" strokeDasharray="10 6" />
          {/* Area fill under the chart line */}
          <path
            d="M 0,680 L 80,720 L 140,680 L 200,640 L 260,590 L 320,625 L 380,562 L 440,520 L 500,558 L 560,492 L 620,452 L 680,492 L 740,422 L 800,382 L 860,418 L 920,352 L 980,308 L 1040,358 L 1100,288 L 1160,252 L 1220,292 L 1280,222 L 1340,188 L 1400,228 L 1460,172 L 1520,148 L 1580,178 L 1600,158 L 1600,950 L 0,950 Z"
            fill={fillColor}
          />
          {/* Chart polyline */}
          <polyline
            points="0,680 80,720 140,680 200,640 260,590 320,625 380,562 440,520 500,558 560,492 620,452 680,492 740,422 800,382 860,418 920,352 980,308 1040,358 1100,288 1160,252 1220,292 1280,222 1340,188 1400,228 1460,172 1520,148 1580,178 1600,158"
            stroke={lineColor}
            fill="none"
            strokeWidth="2.5"
          />
          {/* Candlestick bars along the bottom */}
          {[
            [-8,912,16,38],[72,906,16,44],[132,918,16,32],[192,914,16,36],
            [252,895,16,55],[312,904,16,46],[372,900,16,50],[432,908,16,42],
            [492,912,16,38],[552,898,16,52],[612,902,16,48],[672,908,16,42],
            [732,892,16,58],[792,888,16,62],[852,904,16,46],[912,894,16,56],
            [972,886,16,64],[1032,900,16,50],[1092,894,16,56],[1152,896,16,54],
            [1212,904,16,46],[1272,890,16,60],[1332,884,16,66],[1392,898,16,52],
            [1452,882,16,68],[1512,878,16,72],[1572,892,16,58],[1592,886,16,64],
          ].map(([x, y, w, h], i) => (
            <rect key={`c-${i}`} x={x} y={y} width={w} height={h} fill={candleColor} />
          ))}
        </svg>
      </div>
    </div>
  );
}
