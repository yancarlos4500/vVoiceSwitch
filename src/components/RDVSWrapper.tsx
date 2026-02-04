// NOTE: This wrapper should only be used via the main UI switch in src/app/page.tsx
// RDVS 3080 Interface - Industrial-Retro ATC aesthetic (800x600 display)
//
// CUSTOM LAYOUT SYSTEM:
// Format: rdvs-{header}-{q1}{q2}{q3}{q4}-{footer}-{funckeys}
//
// Header options:
//   A = default (bright/dim, pagination, IA/OVR/CA, readout)
//   B = alternate (status rect, IA/OVR/CA, keypad, pagination, dim/bright)
//
// Quadrant types (single letter each, 4 letters total for q1q2q3q4):
//   S = station (all station selector buttons)
//   F = frequency (line control panels, 4 per quadrant or 8 if stacked)
//   M = mixed (station buttons with function keys)
//   NOTE: Q2 must always be F (frequency) - other values will be auto-corrected
//
// Footer options:
//   A = default (page tabs left, HS/LS selectors right)
//   B = centered (page tabs centered, no HS/LS - use when HS/LS is in a quadrant)
//
// Function keys (comma-separated list for mixed quadrants):
//   Format: {quadrant}:{b1}={key},{b2}={key},...
//   Example: Q3:16=HOLD,17=REL,18=HL,19=RECON,20=FWD
//   Special keys: HOLD, REL, HL, RECON, FWD, OHL, RHL, RB, HS_LS
//
// Examples:
//   rdvs-A-SFMF-A-Q3:16=HOLD,17=REL,18=HL,19=RECON,20=FWD  (default layout)
//   rdvs-A-SFSM-A-Q4:16=HOLD,17=REL,18=HL,19=RECON,20=FWD  (rdvs-1 layout)
//   rdvs-B-SFSM-B-Q4:4=RECON,5=FWD,9=HL,10=RB,18=HS_LS,19=HOLD,20=REL  (rdvs-2 layout)
//
// Legacy variants still supported: 'default', 'rdvs-1', 'rdvs-2'

import React, { useState, useMemo } from 'react';
import { useCoreStore } from '../model';
import '../app/_components/vatlines/styles.css';

// Layout configuration types
type QuadrantType = 'S' | 'F' | 'M'; // Station, Frequency, Mixed
type HeaderType = 'A' | 'B';
type FooterType = 'A' | 'B';

interface LayoutConfig {
  header: HeaderType;
  quadrants: [QuadrantType, QuadrantType, QuadrantType, QuadrantType]; // Q1, Q2, Q3, Q4
  footer: FooterType;
  funcKeys: Record<string, Record<number, string>>; // { Q3: { 16: 'HOLD', ... }, Q4: { ... } }
}

// Parse custom layout string into config
function parseLayoutString(variant: string): LayoutConfig | null {
  // Check for legacy variants first
  if (variant === 'default') {
    return {
      header: 'A',
      quadrants: ['S', 'F', 'M', 'F'],
      footer: 'A',
      funcKeys: { Q3: { 16: 'HOLD', 17: 'REL', 18: 'HL', 19: 'RECON', 20: 'FWD' } }
    };
  }
  if (variant === 'rdvs-1') {
    return {
      header: 'A',
      quadrants: ['S', 'F', 'S', 'M'],
      footer: 'A',
      funcKeys: { Q4: { 16: 'HOLD', 17: 'REL', 18: 'HL', 19: 'RECON', 20: 'FWD' } }
    };
  }
  if (variant === 'rdvs-2') {
    return {
      header: 'B',
      quadrants: ['S', 'F', 'S', 'M'],
      footer: 'B',
      funcKeys: { Q4: { 4: 'RECON', 5: 'FWD', 9: 'HL', 10: 'RB', 18: 'HS_LS', 19: 'HOLD', 20: 'REL' } }
    };
  }

  // Parse custom format: rdvs-{header}-{q1q2q3q4}-{footer}-{funckeys}
  if (!variant.startsWith('rdvs-')) return null;

  const parts = variant.substring(5).split('-');
  if (parts.length < 3) return null;

  const header = parts[0].toUpperCase() as HeaderType;
  if (header !== 'A' && header !== 'B') return null;

  const quadrantStr = parts[1].toUpperCase();
  if (quadrantStr.length !== 4) return null;
  const quadrants = quadrantStr.split('') as [QuadrantType, QuadrantType, QuadrantType, QuadrantType];
  for (const q of quadrants) {
    if (q !== 'S' && q !== 'F' && q !== 'M') return null;
  }

  // Q2 must always be frequency (F) - enforce this constraint
  if (quadrants[1] !== 'F') {
    console.warn(`Warning: Q2 must be frequency (F), got '${quadrants[1]}'. Auto-correcting to F.`);
    quadrants[1] = 'F';
  }

  const footer = parts[2].toUpperCase() as FooterType;
  if (footer !== 'A' && footer !== 'B') return null;

  // Parse function keys (optional, remaining parts joined back together)
  const funcKeys: Record<string, Record<number, string>> = {};
  if (parts.length > 3) {
    const funcKeyStr = parts.slice(3).join('-'); // Rejoin in case there were dashes in keys
    const quadrantDefs = funcKeyStr.split(/(?=Q[1-4]:)/); // Split on Q1:, Q2:, etc.

    for (const def of quadrantDefs) {
      if (!def.trim()) continue;
      const match = def.match(/^Q([1-4]):(.+)$/);
      if (match) {
        const qName = `Q${match[1]}`;
        const keyDefs = match[2].split(',');
        funcKeys[qName] = {};
        for (const keyDef of keyDefs) {
          const [btnNum, keyName] = keyDef.split('=');
          if (btnNum && keyName) {
            funcKeys[qName][parseInt(btnNum, 10)] = keyName.trim().toUpperCase();
          }
        }
      }
    }
  }

  // Validate: Remove function keys from frequency quadrants (F type can't have function keys)
  const quadrantNames = ['Q1', 'Q2', 'Q3', 'Q4'];
  for (let i = 0; i < 4; i++) {
    if (quadrants[i] === 'F' && funcKeys[quadrantNames[i]]) {
      console.warn(`Warning: Function keys defined for frequency quadrant ${quadrantNames[i]} will be ignored`);
      delete funcKeys[quadrantNames[i]];
    }
  }

  return { header, quadrants, footer, funcKeys };
}

// Layout: 10x8 grid total = 80 squares, divided into 4 quadrants (2x2 arrangement)
// Each quadrant: 5 cols x 4 rows = 20 squares
// Q1 = top-left (cols 0-4, rows 0-3), Q2 = top-right (cols 5-9, rows 0-3)
// Q3 = bottom-left (cols 0-4, rows 4-7), Q4 = bottom-right (cols 5-9, rows 4-7)
const GRID_COLS = 10;
const GRID_ROWS = 8;
const BUTTONS_PER_PAGE = 80; // 10 cols x 8 rows

// Container dimensions - 800x600 is the screen size
const CONTAINER_WIDTH = 800;
const CONTAINER_HEIGHT = 600;
const PADDING = 10; // 10px padding on all sides
const HEADER_HEIGHT = 60;
const FOOTER_HEIGHT = 46;
const GAP = 6;

// Calculate available space after padding and header/footer
// Available width: 800 - 2*10 = 780px for 2 quadrants + 1 gap
// Available height: 600 - 2*10 (top/bottom padding) - header - footer = 600 - 20 - 60 - 46 = 474px for 2 quadrants + 1 gap
const AVAILABLE_WIDTH = CONTAINER_WIDTH - (PADDING * 2); // 780px
const AVAILABLE_HEIGHT = CONTAINER_HEIGHT - (PADDING * 2) - HEADER_HEIGHT - FOOTER_HEIGHT; // 474px

// Quadrant dimensions - each quadrant gets exactly half the available space minus gap
const QUADRANT_WIDTH = (AVAILABLE_WIDTH - GAP) / 2; // 377px each
const QUADRANT_HEIGHT = Math.floor((AVAILABLE_HEIGHT - GAP) / 2); // 230px each

// Button dimensions calculated from quadrant size
// 5 buttons + 4 gaps per quadrant width: (QUADRANT_WIDTH - 4*GAP) / 5
// 4 buttons + 3 gaps per quadrant height: (QUADRANT_HEIGHT - 3*GAP) / 4
const BTN_WIDTH = Math.floor((QUADRANT_WIDTH - 4 * GAP) / 5); // ~70px
const BTN_HEIGHT = Math.floor((QUADRANT_HEIGHT - 3 * GAP) / 4); // ~53px

// Line panel dimensions (same as button dimensions)
const LINE_PANEL_HEIGHT = BTN_HEIGHT;

// Color Palette per specification
const COLORS = {
  RED: '#FF0000',      // Override buttons
  BLUE: '#0000FF',     // Call/Intercom buttons
  GREY: '#666666',     // Function keys
  CYAN: '#00FFFF',     // Text/Lines
  GREEN: '#00FF00',    // Selection/Active
  BLACK: '#000000',    // Background
  WHITE: '#FFFFFF',    // Text
  DARK_GREY: '#333333' // Empty cells
};

// Quadrant helpers
// Button numbering within a quadrant: B1-B5 = row 1, B6-B10 = row 2, B11-B15 = row 3, B16-B20 = row 4
const getQuadrantButtonNum = (quadrantRow: number, quadrantCol: number): number => {
  return quadrantRow * 5 + quadrantCol + 1; // 1-indexed
};

// Check which quadrant a position belongs to
const getQuadrant = (rowIdx: number, colIdx: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' => {
  if (rowIdx < 4 && colIdx < 5) return 'Q1';
  if (rowIdx < 4 && colIdx >= 5) return 'Q2';
  if (rowIdx >= 4 && colIdx < 5) return 'Q3';
  return 'Q4';
};

// Get row/col within the quadrant (0-indexed)
const getQuadrantPosition = (rowIdx: number, colIdx: number): { qRow: number; qCol: number } => {
  const qRow = rowIdx % 4;
  const qCol = colIdx % 5;
  return { qRow, qCol };
};

interface RDVSWrapperProps {
  variant?: string; // 'default', 'rdvs-1', 'rdvs-2', or custom format like 'rdvs-A-SFMF-A-Q3:16=HOLD,...'
}

export default function RDVSWrapper({ variant = 'default' }: RDVSWrapperProps) {
  // Parse the layout configuration
  const layoutConfig = useMemo(() => {
    const config = parseLayoutString(variant);
    if (!config) {
      console.warn(`Invalid RDVS layout string: ${variant}, falling back to default`);
      return parseLayoutString('default')!;
    }
    return config;
  }, [variant]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ovrActive, setOvrActive] = useState(false);

  const sendMsg = useCoreStore((s: any) => s.sendMessageNow);
  const selectedPositions = useCoreStore((s: any) => s.selectedPositions);
  const gg_status = useCoreStore((s: any) => s.gg_status);
  const ag_status = useCoreStore((s: any) => s.ag_status);
  const ptt = useCoreStore((s: any) => s.ptt);

  const currentPosition = selectedPositions?.[0] || null;

  // Build line buttons from position data
  const lineButtons = useMemo(() => {
    const btns: any[] = [];
    if (currentPosition?.lines) {
      currentPosition.lines.forEach((line: any) => {
        const lineType = Array.isArray(line) ? line[1] : line.type;
        const call_id = Array.isArray(line) ? line[0] : (line.id || '');
        const label = Array.isArray(line) && line[2] ? String(line[2]) : '';
        const parts = label.split(',');
        const line1 = parts[0]?.trim() || '';
        const line2 = parts[1]?.trim() || '';

        let typeLetter = '';
        if (lineType === 0) typeLetter = 'O';
        else if (lineType === 1) typeLetter = 'C';
        else if (lineType === 2) typeLetter = 'A';

        let statusObj: any = {};
        if (gg_status) {
          statusObj = gg_status.find((s: any) =>
            s?.call === call_id || String(s?.call).endsWith(call_id)
          ) || {};
        }

        const callStatus = statusObj.status || 'off';
        let indicatorState = 'off';
        if (lineType === 0) {
          if (callStatus === 'ok' || callStatus === 'active') indicatorState = 'on';
          else if (callStatus === 'busy') indicatorState = 'flutter';
        } else if (lineType === 1) {
          if (callStatus === 'chime') indicatorState = 'flashing';
          else if (callStatus === 'ok') indicatorState = 'flutter';
        } else if (lineType === 2) {
          if (callStatus === 'ok' || callStatus === 'online') indicatorState = 'flutter';
        }

        btns.push({
          call_id,
          lineType,
          typeLetter,
          line1,
          line2,
          indicatorState,
          statusObj
        });
      });
    }
    return btns;
  }, [currentPosition, gg_status]);

  const maxPage = Math.max(1, Math.ceil(lineButtons.length / BUTTONS_PER_PAGE));
  const pageStartIdx = (currentPage - 1) * BUTTONS_PER_PAGE;
  const pageButtons = lineButtons.slice(pageStartIdx, pageStartIdx + BUTTONS_PER_PAGE);

  const setPage = (p: number) => {
    if (p < 1) setCurrentPage(1);
    else if (p > maxPage) setCurrentPage(maxPage);
    else setCurrentPage(p);
  };

  const formatFreq = (freq: number) => freq ? (freq / 1_000_000).toFixed(3) : '';

  const handleLineClick = (btn: any) => {
    const { call_id, lineType, statusObj } = btn;
    const status = statusObj?.status || 'off';

    if (lineType === 0) {
      if (status === 'off' || status === 'idle' || !status) sendMsg({ type: 'call', cmd1: call_id, dbl1: 0 });
      else if (status === 'ok') sendMsg({ type: 'stop', cmd1: call_id, dbl1: 0 });
    } else if (lineType === 1) {
      if (status === 'off' || status === 'idle' || !status) sendMsg({ type: 'call', cmd1: call_id, dbl1: 2 });
      else sendMsg({ type: 'stop', cmd1: call_id, dbl1: 2 });
    } else if (lineType === 2) {
      if (status === 'off' || status === 'idle' || !status) sendMsg({ type: 'call', cmd1: call_id, dbl1: 2 });
      else sendMsg({ type: 'stop', cmd1: call_id, dbl1: 1 });
    }
  };

  // Get button color based on line type
  const getButtonColor = (lineType: number | undefined, typeLetter: string) => {
    if (typeLetter === 'O' || lineType === 0) return COLORS.RED;   // Override = Red
    if (typeLetter === 'C' || lineType === 1) return COLORS.BLUE;  // Call/Intercom = Blue
    if (typeLetter === 'A' || lineType === 2) return COLORS.BLUE;  // Alert/Shout = Blue
    if (lineType === 3) return COLORS.GREY;                         // Dial = Grey
    return COLORS.BLACK;                                            // Empty
  };

  // Check if a position is in a frequency quadrant (displayed as line panels instead of buttons)
  const isFrequencyQuadrant = (rowIdx: number, colIdx: number): boolean => {
    const quadrant = getQuadrant(rowIdx, colIdx);
    const quadrantIndex = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 }[quadrant];
    return layoutConfig.quadrants[quadrantIndex] === 'F';
  };

  // Check if a quadrant is mixed type (has function keys)
  const isMixedQuadrant = (quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'): boolean => {
    const quadrantIndex = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 }[quadrant];
    return layoutConfig.quadrants[quadrantIndex] === 'M';
  };

  // Get function key label for a position (if it's a function key)
  const getFunctionKeyLabel = (rowIdx: number, colIdx: number): string | null => {
    const quadrant = getQuadrant(rowIdx, colIdx);
    const { qRow, qCol } = getQuadrantPosition(rowIdx, colIdx);
    const btnNum = getQuadrantButtonNum(qRow, qCol);

    // Check if this quadrant has function keys defined
    const quadrantFuncKeys = layoutConfig.funcKeys[quadrant];
    if (quadrantFuncKeys && quadrantFuncKeys[btnNum]) {
      return quadrantFuncKeys[btnNum];
    }

    return null;
  };

  // Render a function key button
  const renderFunctionButton = (label: string, rowIdx: number, colIdx: number) => {
    const w = BTN_WIDTH;
    const h = BTN_HEIGHT;

    // Special HS/LS stacked button for rdvs-2
    // Rect is 30px wide starting at x=4, so ends at x=34. Circle r=6, center at 34 + 12 (gap) + 6 (radius) = 52
    if (label === 'HS_LS') {
      const circleX = 52; // 30px rect + 4px start + 12px gap + 6px radius = 52px center for circle
      return (
        <svg
          key={`func-${rowIdx}-${colIdx}`}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ cursor: 'pointer' }}
          onClick={() => console.log('HS/LS selector pressed')}
        >
          <rect x="0" y="0" width={w} height={h} fill={COLORS.BLACK} stroke={COLORS.BLACK} strokeWidth="1" />
          {/* HS row */}
          <rect x="4" y="4" width="30" height="18" fill="none" stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="19" y="17" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">HS</text>
          <circle cx={circleX} cy="13" r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          {/* LS row */}
          <rect x="4" y={h - 22} width="30" height="18" fill="none" stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="19" y={h - 9} textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">LS</text>
          <circle cx={circleX} cy={h - 13} r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
        </svg>
      );
    }

    return (
      <svg
        key={`func-${rowIdx}-${colIdx}`}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ cursor: 'pointer' }}
        onClick={() => console.log(`${label} pressed`)}
      >
        <rect x="0" y="0" width={w} height={h} fill={COLORS.GREY} stroke={COLORS.BLACK} strokeWidth="1" />
        <text
          x={w / 2}
          y={h / 2 - 4}
          textAnchor="middle"
          fill={COLORS.WHITE}
          fontSize="14"
          fontFamily="Consolas, monospace"
          fontWeight="100"
        >
          {label}
        </text>
        <rect x={(w - 14) / 2} y={h - 18} width="14" height="14" fill={COLORS.BLACK} stroke={COLORS.CYAN} strokeWidth="1" />
      </svg>
    );
  };

  // Count station button positions before this position (for indexing into pageButtons)
  const getStationButtonIndex = (rowIdx: number, colIdx: number): number => {
    let idx = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (r === rowIdx && c === colIdx) return idx;
        // Skip frequency quadrants
        if (isFrequencyQuadrant(r, c)) continue;
        // Skip function keys
        if (getFunctionKeyLabel(r, c)) continue;
        idx++;
      }
    }
    return idx;
  };

  // Render a station selector button using SVG (scaled for 800x600)
  const renderStationButton = (rowIdx: number, colIdx: number) => {
    const w = BTN_WIDTH;
    const h = BTN_HEIGHT;

    // Skip frequency quadrant positions (they're rendered as line panels)
    if (isFrequencyQuadrant(rowIdx, colIdx)) {
      return null;
    }

    // Check if this is a function key position
    const funcLabel = getFunctionKeyLabel(rowIdx, colIdx);
    if (funcLabel) {
      return renderFunctionButton(funcLabel, rowIdx, colIdx);
    }

    // Get the station button for this position
    const stationIdx = getStationButtonIndex(rowIdx, colIdx);
    const btn = pageButtons[stationIdx];

    if (!btn) {
      return (
        <svg
          key={`empty-${rowIdx}-${colIdx}`}
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
        >
          <rect x="0" y="0" width={w} height={h} fill={COLORS.BLACK} stroke={COLORS.BLACK} strokeWidth="1" />
        </svg>
      );
    }

    const { typeLetter, line1, line2, indicatorState, lineType } = btn;
    const bgColor = getButtonColor(lineType, typeLetter);
    const indicatorFill = indicatorState !== 'off' ? COLORS.GREEN : COLORS.BLACK;

    return (
      <svg
        key={`btn-${rowIdx}-${colIdx}`}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handleLineClick(btn)}
      >
        <rect x="0" y="0" width={w} height={h} fill={bgColor} stroke={COLORS.BLACK} strokeWidth="1" />
        <text
          x={w / 2}
          y={16}
          textAnchor="middle"
          fill={COLORS.WHITE}
          fontSize="14"
          fontFamily="Consolas, monospace"
          fontWeight="bold"
        >
          {line1}
        </text>
        {line2 && (
          <text
            x={w / 2}
            y={30}
            textAnchor="middle"
            fill={COLORS.WHITE}
            fontSize="14"
            fontFamily="Consolas, monospace"
            fontWeight="bold"
          >
            {line2}
          </text>
        )}
        <rect x={(w - 16) / 2} y={h - 21} width="16" height="16" fill={indicatorFill} stroke={COLORS.WHITE} strokeWidth="1" />
        <text
          x={w / 2}
          y={h - 21 + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.WHITE}
          fontSize="10"
          fontFamily="Consolas, monospace"
          fontWeight="100"
        >
          {typeLetter}
        </text>
      </svg>
    );
  };

  // Render line control panel (right side) - scaled for 800x600
  // Uses 5 equal-width cells matching station button width
  const renderLineControlPanel = (rowIdx: number) => {
    const ag = ag_status?.[rowIdx] || {};
    const freq = ag.freq || 0;
    const isRx = !!ag.r;
    const isTx = !!ag.t;
    const isHs = !!ag.h;
    const isLs = !!ag.l;

    // Each cell width accounts for removed gaps: 5 cells need to fill space of 5 buttons + 4 gaps
    // So each cell is BTN_WIDTH + (4*GAP/5) to distribute the gap space evenly
    const cellW = BTN_WIDTH + Math.floor((4 * GAP) / 5);
    const cellH = BTN_HEIGHT;

    return (
      <div
        key={`line-${rowIdx}`}
        style={{
          display: 'flex',
          gap: '0px',
          width: '100%',
        }}
      >
        {/* Cell 1: HS/LS Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="20" fill={isHs ? COLORS.GREEN : COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">HS</text>
          <text x="6" y="40" fill={isLs ? COLORS.GREEN : COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">LS</text>
          {/* HS indicator box - top half */}
          <line x1="38" y1="8" x2="54" y2="8" stroke={COLORS.GREEN} strokeWidth="1" />
          <line x1="38" y1="8" x2="38" y2="27" stroke={COLORS.GREEN} strokeWidth="1" />
          <line x1="54" y1="8" x2="54" y2="27" stroke={COLORS.GREEN} strokeWidth="1" />
          <rect x="39" y="9" width="14" height="17" fill={isHs ? COLORS.GREEN : 'none'} stroke="none" />
          {/* LS indicator box - bottom half */}
          <line x1="38" y1="27" x2="38" y2="46" stroke={COLORS.GREEN} strokeWidth="1" />
          <line x1="54" y1="27" x2="54" y2="46" stroke={COLORS.GREEN} strokeWidth="1" />
          <line x1="38" y1="46" x2="54" y2="46" stroke={COLORS.GREEN} strokeWidth="1" />
          <rect x="39" y="28" width="14" height="17" fill={isLs ? COLORS.GREEN : 'none'} stroke="none" />
        </svg>

        {/* Cell 2: RX Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">RX</text>
          <rect x="30" y="6" width="30" height="15" fill={isRx ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="6" y="42" fill={COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">{formatFreq(freq)}</text>
        </svg>

        {/* Cell 3: M/S Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">M/S</text>
          <rect x="44" y="6" width="15" height="15" fill={COLORS.GREEN} stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="51" y="18" textAnchor="middle" fill={COLORS.BLACK} fontSize="15" fontFamily="Consolas, monospace" fontWeight="100">M</text>
        </svg>

        {/* Cell 4: TX Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">TX</text>
          <rect x="30" y="6" width="30" height="15" fill={isTx ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
          {/* TX radial selector */}
          <circle cx="45" cy="34" r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
        </svg>

        {/* Cell 5: Secondary M/S Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="Consolas, monospace" fontWeight="100">M/S</text>
          <rect x="44" y="6" width="15" height="15" fill={COLORS.GREEN} stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="51" y="18" textAnchor="middle" fill={COLORS.BLACK} fontSize="15" fontFamily="Consolas, monospace" fontWeight="100">M</text>
        </svg>
      </div>
    );
  };

  // Chamfered tab with aggressive angled cuts on top-left and top-right corners, 3px padding
  // Active page = grey border/text, inactive = white border/text, always black background
  const renderPageTab = (pageNum: number, isActive: boolean) => {
    const w = 80;
    const h = 22; // 3px top + ~16px text + 3px bottom
    const chamfer = 12; // More aggressive corner cutoff
    const tabColor = isActive ? COLORS.GREY : COLORS.WHITE;

    return (
      <svg
        key={`tab-${pageNum}`}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setPage(pageNum)}
      >
        <polygon
          points={`
            ${chamfer},0
            ${w - chamfer},0
            ${w},${chamfer}
            ${w},${h}
            0,${h}
            0,${chamfer}
          `}
          fill={COLORS.BLACK}
          stroke={tabColor}
          strokeWidth="1"
        />
        <text
          x={w / 2}
          y={h / 2 + 4}
          textAnchor="middle"
          fill={tabColor}
          fontSize="13"
          fontFamily="Consolas, monospace"
          fontWeight="100"
        >
          PAGE {pageNum}
        </text>
      </svg>
    );
  };

  // Arrow for pagination (continuous stem + arrowhead shape)
  const renderHexArrow = (direction: 'prev' | 'next') => {
    const w = 65;
    const h = 32;
    const isPrev = direction === 'prev';
    const midY = h / 2;
    const stemHalfHeight = 9; // stem thickness (half)
    const headSize = 14; // arrowhead size

    // Create a continuous arrow shape (no line between stem and head)
    // Points trace the outline: tip -> top of head -> top of stem -> bottom of stem -> bottom of head -> back to tip
    const prevPoints = `
      0,${midY}
      ${headSize},${midY - headSize}
      ${headSize},${midY - stemHalfHeight}
      ${w},${midY - stemHalfHeight}
      ${w},${midY + stemHalfHeight}
      ${headSize},${midY + stemHalfHeight}
      ${headSize},${midY + headSize}
    `;
    const nextPoints = `
      ${w},${midY}
      ${w - headSize},${midY - headSize}
      ${w - headSize},${midY - stemHalfHeight}
      0,${midY - stemHalfHeight}
      0,${midY + stemHalfHeight}
      ${w - headSize},${midY + stemHalfHeight}
      ${w - headSize},${midY + headSize}
    `;

    return (
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setPage(currentPage + (isPrev ? -1 : 1))}
      >
        <polygon
          points={isPrev ? prevPoints : nextPoints}
          fill="none"
          stroke={COLORS.WHITE}
          strokeWidth="1"
        />
        <text
          x={w / 2}
          y={h / 2 + 4}
          textAnchor="middle"
          fill={COLORS.WHITE}
          fontSize="13"
          fontFamily="Consolas, monospace"
          fontWeight="100"
        >
          {isPrev ? 'PREV' : 'NEXT'}
        </text>
      </svg>
    );
  };

  return (
    <div
      style={{
        backgroundColor: COLORS.BLACK,
        padding: '20px',
        display: 'inline-block',
      }}
    >
      <div
        style={{
          width: `${CONTAINER_WIDTH}px`,
          height: `${CONTAINER_HEIGHT}px`,
          backgroundColor: COLORS.BLACK,
          color: COLORS.WHITE,
          fontFamily: 'Consolas, monospace',
          fontWeight: 100,
          fontSize: '14px',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          textTransform: 'uppercase',
          padding: `${PADDING}px`,
          boxSizing: 'border-box',
        }}
      >
      {/* Header Module */}
      <div
        style={{
          height: `${HEADER_HEIGHT}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          marginBottom: `${GAP}px`,
        }}
      >
        {layoutConfig.header === 'B' ? (
          <>
            {/* RDVS-2 Header: Status rect, IA/OVR/CA, Keypad rect, Page arrows, Dim/Bright */}

            {/* Status Display (same format as readout on far right of other variant) */}
            <svg width="120" height="40" viewBox="0 0 120 40">
              <rect x="0" y="0" width="120" height="40" fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="1" />
            </svg>

            {/* Status Indicators: IA, OVR, CA */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <svg width="26" height="36" viewBox="0 0 26 36">
                <text x="13" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">IA</text>
                <rect x="4" y="16" width="18" height="18" fill="none" stroke={COLORS.WHITE} strokeWidth="1" />
              </svg>
              <svg width="30" height="36" viewBox="0 0 30 36">
                <text x="15" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">OVR</text>
                <rect x="6" y="16" width="18" height="18" fill={ovrActive ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
              </svg>
              <svg width="26" height="36" viewBox="0 0 26 36">
                <text x="13" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">CA</text>
                <rect x="4" y="16" width="18" height="18" fill="none" stroke={COLORS.WHITE} strokeWidth="1" />
              </svg>
            </div>

            {/* Keypad: gray text on black background, above larger hollow gray rect */}
            <svg width="80" height="50" viewBox="0 0 80 50">
              <text x="40" y="14" textAnchor="middle" fill={COLORS.GREY} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">KEYPAD</text>
              <rect x="5" y="20" width="70" height="26" fill={COLORS.BLACK} stroke={COLORS.GREY} strokeWidth="1" />
            </svg>

            {/* Pagination Control with Page X and of X */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="80" height="16" viewBox="0 0 80 16">
                <text x="40" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="Consolas, monospace" fontWeight="100">PAGE {currentPage}</text>
              </svg>
              <div style={{ display: 'flex', gap: '4px' }}>
                {renderHexArrow('prev')}
                {renderHexArrow('next')}
              </div>
              <svg width="50" height="16" viewBox="0 0 50 16">
                <text x="25" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="Consolas, monospace" fontWeight="100">OF {maxPage}</text>
              </svg>
            </div>

            {/* Dim/Bright controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="40" height="44" viewBox="0 0 40 44">
                  <text x="20" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="13" fontFamily="Consolas, monospace" fontWeight="100">DIM</text>
                  <circle cx="20" cy="30" r="12" fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="2" />
                </svg>
              </div>
              <svg width="36" height="20" viewBox="0 0 36 20">
                <text x="18" y="14" textAnchor="middle" fill={COLORS.CYAN} fontSize="14" fontFamily="Consolas, monospace" fontWeight="100">47%</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="56" height="44" viewBox="0 0 56 44">
                  <text x="28" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="13" fontFamily="Consolas, monospace" fontWeight="100">BRIGHT</text>
                  <circle cx="28" cy="30" r="12" fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="2" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Default/RDVS-1 Header: Brightness, Pagination, IA/OVR/CA, Readout */}

            {/* Brightness Control - larger circles and +2pt font */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="56" height="44" viewBox="0 0 56 44">
                  <text x="28" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="13" fontFamily="Consolas, monospace" fontWeight="100">BRIGHT</text>
                  <circle cx="28" cy="30" r="12" fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="2" />
                </svg>
              </div>
              <svg width="36" height="20" viewBox="0 0 36 20">
                <text x="18" y="14" textAnchor="middle" fill={COLORS.CYAN} fontSize="14" fontFamily="Consolas, monospace" fontWeight="100">47%</text>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="40" height="44" viewBox="0 0 40 44">
                  <text x="20" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="13" fontFamily="Consolas, monospace" fontWeight="100">DIM</text>
                  <circle cx="20" cy="30" r="12" fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Pagination Control */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="80" height="16" viewBox="0 0 80 16">
                <text x="40" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="Consolas, monospace" fontWeight="100">PAGE {currentPage}</text>
              </svg>
              <div style={{ display: 'flex', gap: '4px' }}>
                {renderHexArrow('prev')}
                {renderHexArrow('next')}
              </div>
              <svg width="50" height="16" viewBox="0 0 50 16">
                <text x="25" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="Consolas, monospace" fontWeight="100">OF {maxPage}</text>
              </svg>
            </div>

            {/* Status Indicators: IA, OVR, CA */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <svg width="26" height="36" viewBox="0 0 26 36">
                <text x="13" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">IA</text>
                <rect x="4" y="16" width="18" height="18" fill="none" stroke={COLORS.WHITE} strokeWidth="1" />
              </svg>
              <svg width="30" height="36" viewBox="0 0 30 36">
                <text x="15" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">OVR</text>
                <rect x="6" y="16" width="18" height="18" fill={ovrActive ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
              </svg>
              <svg width="26" height="36" viewBox="0 0 26 36">
                <text x="13" y="12" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="Consolas, monospace" fontWeight="100">CA</text>
                <rect x="4" y="16" width="18" height="18" fill="none" stroke={COLORS.WHITE} strokeWidth="1" />
              </svg>
            </div>

            {/* Readout Display */}
            <svg width="120" height="40" viewBox="0 0 120 40">
              <rect x="0" y="0" width="120" height="40" fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="1" />
            </svg>
          </>
        )}
      </div>

      {/* Main Communication Matrix - quadrant-based layout */}
      {/* If Q2 and Q4 are both frequency, use stacked layout (Q1+Q3 left, Q2+Q4 right as 8 panels) */}
      {/* Otherwise use 2x2 quadrant layout */}
      {layoutConfig.quadrants[1] === 'F' && layoutConfig.quadrants[3] === 'F' ? (
        // Stacked layout: Q1+Q3 (5 cols x 8 rows) side by side with Q2+Q4 (8 line panels)
        <div style={{ flex: 1, display: 'flex', gap: `${GAP}px`, width: '100%' }}>
          {/* Left: Q1 + Q3 stacked */}
          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: `repeat(5, 1fr)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, ${BTN_HEIGHT}px)`,
              gap: `${GAP}px`,
              backgroundColor: COLORS.BLACK,
            }}
          >
            {Array.from({ length: GRID_ROWS }).map((_, rowIdx) =>
              Array.from({ length: 5 }).map((_, colIdx) =>
                renderStationButton(rowIdx, colIdx)
              )
            )}
          </div>
          {/* Right: Q2 + Q4 as 8 line panels */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: `${GAP}px`,
            }}
          >
            {Array.from({ length: 8 }).map((_, rowIdx) =>
              renderLineControlPanel(rowIdx)
            )}
          </div>
        </div>
      ) : (
        // RDVS-1/RDVS-2: Top row (Q1 + Q2 panels), Bottom row (Q3 + Q4)
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${GAP}px`, width: '100%' }}>
          {/* Top row: Q1 (5 cols) + Q2 (4 line panels) */}
          <div style={{ flex: 1, display: 'flex', gap: `${GAP}px`, width: '100%' }}>
            {/* Q1: 5 cols x 4 rows */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(5, 1fr)`,
                gridTemplateRows: `repeat(4, ${BTN_HEIGHT}px)`,
                gap: `${GAP}px`,
                backgroundColor: COLORS.BLACK,
              }}
            >
              {Array.from({ length: 4 }).map((_, rowIdx) =>
                Array.from({ length: 5 }).map((_, colIdx) =>
                  renderStationButton(rowIdx, colIdx)
                )
              )}
            </div>
            {/* Q2: 4 line panels */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: `${GAP}px`,
              }}
            >
              {Array.from({ length: 4 }).map((_, rowIdx) =>
                renderLineControlPanel(rowIdx)
              )}
            </div>
          </div>
          {/* Bottom row: Q3 (5 cols) + Q4 (5 cols) */}
          <div style={{ flex: 1, display: 'flex', gap: `${GAP}px`, width: '100%' }}>
            {/* Q3: 5 cols x 4 rows */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(5, 1fr)`,
                gridTemplateRows: `repeat(4, ${BTN_HEIGHT}px)`,
                gap: `${GAP}px`,
                backgroundColor: COLORS.BLACK,
              }}
            >
              {Array.from({ length: 4 }).map((_, qRowIdx) =>
                Array.from({ length: 5 }).map((_, colIdx) =>
                  renderStationButton(qRowIdx + 4, colIdx)
                )
              )}
            </div>
            {/* Q4: 5 cols x 4 rows */}
            <div
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: `repeat(5, 1fr)`,
                gridTemplateRows: `repeat(4, ${BTN_HEIGHT}px)`,
                gap: `${GAP}px`,
                backgroundColor: COLORS.BLACK,
              }}
            >
              {Array.from({ length: 4 }).map((_, qRowIdx) =>
                Array.from({ length: 5 }).map((_, colIdx) =>
                  renderStationButton(qRowIdx + 4, colIdx + 5)
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Module */}
      <div
        style={{
          height: `${FOOTER_HEIGHT}px`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: layoutConfig.footer === 'B' ? 'center' : 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Page Tabs */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
          {Array.from({ length: Math.min(maxPage, 3) }).map((_, idx) =>
            renderPageTab(idx + 1, currentPage === idx + 1)
          )}
        </div>

        {/* Master Audio Status - global HS/LS radial selectors (hidden for footer type B) */}
        {layoutConfig.footer === 'A' && (
          <div style={{ display: 'flex', gap: '12px', paddingBottom: '4px' }}>
            <svg width="56" height="22" viewBox="0 0 56 22">
              <rect x="0" y="2" width="30" height="18" fill="none" stroke={COLORS.GREEN} strokeWidth="1" />
              <text x="15" y="15" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="Consolas, monospace" fontWeight="100">HS</text>
              <circle cx="46" cy="11" r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
            </svg>
            <svg width="56" height="22" viewBox="0 0 56 22">
              <rect x="0" y="2" width="30" height="18" fill="none" stroke={COLORS.GREEN} strokeWidth="1" />
              <text x="15" y="15" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="Consolas, monospace" fontWeight="100">LS</text>
              <circle cx="46" cy="11" r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
            </svg>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
