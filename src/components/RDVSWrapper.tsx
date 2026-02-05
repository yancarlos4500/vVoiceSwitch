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

// Layout: 10x10 unified grid
// Row 0: Header modules
// Rows 1-8: Communication matrix (4 quadrants in 2x2 arrangement)
// Row 9: Footer (empty for now)
// Q1 = cols 0-4, rows 1-4 | Q2 = cols 5-9, rows 1-4
// Q3 = cols 0-4, rows 5-8 | Q4 = cols 5-9, rows 5-8
const GRID_COLS = 10;
const GRID_ROWS = 10;
const BUTTONS_PER_PAGE = 80; // Communication matrix: 10 cols x 8 rows

// Container dimensions - 800x600 is the screen size
const CONTAINER_WIDTH = 800;
const CONTAINER_HEIGHT = 600;
const PADDING = 10; // 10px padding on all sides
const GAP = 6;

// Calculate available space after padding (full 10x10 grid)
const AVAILABLE_WIDTH = CONTAINER_WIDTH - (PADDING * 2); // 780px
const AVAILABLE_HEIGHT = CONTAINER_HEIGHT - (PADDING * 2); // 580px

// Cell dimensions for unified 10x10 grid (10 cols with 9 gaps, 10 rows with 9 gaps)
const CELL_WIDTH = Math.floor((AVAILABLE_WIDTH - 9 * GAP) / 10); // ~72px
const CELL_HEIGHT = Math.floor((AVAILABLE_HEIGHT - 9 * GAP) / 10); // ~52px

// Handedness: 'left' (default) or 'right' - will be configurable via position JSON later
const HANDEDNESS: 'left' | 'right' = 'left';

// Legacy compatibility aliases
const BTN_WIDTH = CELL_WIDTH;
const BTN_HEIGHT = CELL_HEIGHT;
const LINE_PANEL_HEIGHT = CELL_HEIGHT;

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
          <text x="19" y="17" textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="RDVSimulated, monospace" fontWeight="100">HS</text>
          <circle cx={circleX} cy="13" r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          {/* LS row */}
          <rect x="4" y={h - 22} width="30" height="18" fill="none" stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="19" y={h - 9} textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="RDVSimulated, monospace" fontWeight="100">LS</text>
          <circle cx={circleX} cy={h - 13} r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
        </svg>
      );
    }

    // Same indicator positioning as DA buttons
    const indicatorSize = 16;
    const indicatorMargin = 2;
    const indicatorY = h - indicatorSize - indicatorMargin;

    // Single line text at Y=20 (same as single-line DA buttons)
    const textY = 20;

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
          y={textY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={COLORS.WHITE}
          fontSize="18"
          fontFamily="RDVSimulated, monospace"
          fontWeight="100"
        >
          {label}
        </text>
        <rect x={(w - indicatorSize) / 2} y={indicatorY} width={indicatorSize} height={indicatorSize} fill={COLORS.BLACK} stroke={COLORS.CYAN} strokeWidth="1" />
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
    const indicatorFill = indicatorState !== 'off' ? COLORS.GREEN : COLORS.BLACK;

    // Override buttons: black background, red outline, cyan text
    // Other buttons: colored background, black outline, white text
    const isOverride = typeLetter === 'O' || lineType === 0;
    const bgColor = isOverride ? COLORS.BLACK : getButtonColor(lineType, typeLetter);
    const strokeColor = isOverride ? COLORS.RED : COLORS.BLACK;
    const textColor = isOverride ? COLORS.CYAN : COLORS.WHITE;

    // Format labels: line1 max 5 chars, line2 max 2 chars (centered)
    const displayLine1 = (line1 || '').substring(0, 5);
    const displayLine2 = (line2 || '').substring(0, 2);

    // Indicator rect at bottom of button (with small margin)
    const indicatorSize = 16;
    const indicatorMargin = 2;
    const indicatorY = h - indicatorSize - indicatorMargin;

    // Fixed Y positions for text
    const hasLine2 = !!displayLine2;
    const line1Y = hasLine2 ? 13 : 20; // Single line: Y=20, Double line 1: Y=13
    const line2Y = 28; // Double line 2: Y=28

    return (
      <svg
        key={`btn-${rowIdx}-${colIdx}`}
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handleLineClick(btn)}
      >
        <rect x="0" y="0" width={w} height={h} fill={bgColor} stroke={strokeColor} strokeWidth="1" />
        <text
          x={w / 2}
          y={line1Y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize="18"
          fontFamily="RDVSimulated, monospace"
          fontWeight="100"
        >
          {displayLine1}
        </text>
        {displayLine2 && (
          <text
            x={w / 2}
            y={line2Y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize="18"
            fontFamily="RDVSimulated, monospace"
            fontWeight="100"
          >
            {displayLine2}
          </text>
        )}
        <rect x={(w - indicatorSize) / 2} y={indicatorY} width={indicatorSize} height={indicatorSize} fill={indicatorFill} stroke={textColor} strokeWidth="1" />
        <text
          x={w / 2}
          y={indicatorY + indicatorSize - 2}
          textAnchor="middle"
          dominantBaseline="auto"
          fill={COLORS.WHITE}
          fontSize="12"
          fontFamily="RDVSimulated, monospace"
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
          <text x="6" y="20" fill={isHs ? COLORS.GREEN : COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">HS</text>
          <text x="6" y="40" fill={isLs ? COLORS.GREEN : COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">LS</text>
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
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">RX</text>
          <rect x="30" y="6" width="30" height="15" fill={isRx ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="6" y="42" fill={COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">{formatFreq(freq)}</text>
        </svg>

        {/* Cell 3: M/S Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">M/S</text>
          <rect x="44" y="6" width="15" height="15" fill={COLORS.GREEN} stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="51" y="18" textAnchor="middle" fill={COLORS.BLACK} fontSize="15" fontFamily="RDVSimulated, monospace" fontWeight="100">M</text>
        </svg>

        {/* Cell 4: TX Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">TX</text>
          <rect x="30" y="6" width="30" height="15" fill={isTx ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
          {/* TX radial selector */}
          <circle cx="45" cy="34" r="6" fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
        </svg>

        {/* Cell 5: Secondary M/S Section */}
        <svg width={cellW} height={cellH} viewBox={`0 0 ${cellW} ${cellH}`} style={{ display: 'block', flexShrink: 0 }}>
          <rect x="0" y="0" width={cellW} height={cellH} fill={COLORS.BLACK} stroke={COLORS.RED} strokeWidth="1" />
          <text x="6" y="18" fill={COLORS.CYAN} fontSize="16" fontFamily="RDVSimulated, monospace" fontWeight="100">M/S</text>
          <rect x="44" y="6" width="15" height="15" fill={COLORS.GREEN} stroke={COLORS.GREEN} strokeWidth="1" />
          <text x="51" y="18" textAnchor="middle" fill={COLORS.BLACK} fontSize="15" fontFamily="RDVSimulated, monospace" fontWeight="100">M</text>
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
          fontFamily="RDVSimulated, monospace"
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
          fontFamily="RDVSimulated, monospace"
          fontWeight="bold"
        >
          {isPrev ? 'Prev' : 'Next'}
        </text>
      </svg>
    );
  };

  // ============================================================
  // HEADER MODULE RENDERERS (Grid-based, spans multiple columns)
  // ============================================================

  // Activity Display: 3-column module with white outline
  const renderActivityDisplay = (width: number, height: number) => {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect x="0" y="0" width={width} height={height} fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="1" />
      </svg>
    );
  };

  // IA/OVR/CA Status Indicators: 2-column module, no outline
  const renderStatusIndicators = (width: number, height: number) => {
    // IA and CA boxes match Keypad size, OVR box is half that width
    const iaBoxWidth = 28; // Match Keypad rect width style
    const ovrBoxWidth = 14;
    const boxHeight = 26; // Match Keypad rect height
    const textY = 14; // Aligned with Keypad text
    const boxY = height - boxHeight - 4; // Aligned with Keypad rect position

    // Module spans 2 cells with a gap between them
    // IA centered in left cell, CA centered in right cell, OVR centered in module
    const cellWidth = (width - GAP) / 2; // Width of each cell

    // IA: centered in left cell
    const iaCenterX = cellWidth / 2;
    const iaX = iaCenterX - iaBoxWidth / 2;

    // OVR: centered in entire module
    const ovrCenterX = width / 2;
    const ovrX = ovrCenterX - ovrBoxWidth / 2;

    // CA: centered in right cell
    const caCenterX = cellWidth + GAP + cellWidth / 2;
    const caX = caCenterX - iaBoxWidth / 2;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* IA */}
        <text x={iaCenterX} y={textY} textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="RDVSimulated, monospace" fontWeight="bold">IA</text>
        <rect x={iaX} y={boxY} width={iaBoxWidth} height={boxHeight} fill="none" stroke={COLORS.WHITE} strokeWidth="1" />
        {/* OVR */}
        <text x={ovrCenterX} y={textY} textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="RDVSimulated, monospace" fontWeight="bold">OVR</text>
        <rect x={ovrX} y={boxY} width={ovrBoxWidth} height={boxHeight} fill={ovrActive ? COLORS.GREEN : 'none'} stroke={COLORS.GREEN} strokeWidth="1" />
        {/* CA */}
        <text x={caCenterX} y={textY} textAnchor="middle" fill={COLORS.WHITE} fontSize="11" fontFamily="RDVSimulated, monospace" fontWeight="bold">CA</text>
        <rect x={caX} y={boxY} width={iaBoxWidth} height={boxHeight} fill="none" stroke={COLORS.WHITE} strokeWidth="1" />
      </svg>
    );
  };

  // PAD (Keypad): 1-column module with title and gray outlined rect
  const renderPadModule = (width: number, height: number) => {
    const rectHeight = Math.min(26, height - 20);
    const rectY = height - rectHeight - 4;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x={width / 2} y="14" textAnchor="middle" fill={COLORS.GREY} fontSize="11" fontFamily="RDVSimulated, monospace" fontWeight="bold">Keypad</text>
        <rect x="4" y={rectY} width={width - 8} height={rectHeight} fill={COLORS.BLACK} stroke={COLORS.GREY} strokeWidth="1" />
      </svg>
    );
  };

  // Page Control: 2-column module with arrows and page indicators
  const renderPageControl = (width: number, height: number) => {
    const arrowW = Math.floor((width - 8) / 2);
    const arrowH = Math.min(28, height - 24);

    return (
      <div style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={width} height="18" viewBox={`0 0 ${width} 18`}>
          <text x={width / 2} y="14" textAnchor="middle" fill={COLORS.WHITE} fontSize="19" fontFamily="RDVSimulated, monospace" fontWeight="bold">Page {currentPage}</text>
        </svg>
        <div style={{ display: 'flex', gap: '4px' }}>
          {renderHexArrow('prev')}
          {renderHexArrow('next')}
        </div>
        <svg width={width} height="18" viewBox={`0 0 ${width} 18`}>
          <text x={width / 2} y="14" textAnchor="middle" fill={COLORS.WHITE} fontSize="19" fontFamily="RDVSimulated, monospace" fontWeight="bold">of {maxPage}</text>
        </svg>
      </div>
    );
  };

  // DIM Knob: 1-column module
  const renderDimKnob = (width: number, height: number) => {
    const knobRadius = Math.min(12, (height - 20) / 2);
    const knobY = height / 2 + 6;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x={width / 2} y="14" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="RDVSimulated, monospace" fontWeight="bold">Dim</text>
        <circle cx={width / 2} cy={knobY} r={knobRadius} fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="2" />
      </svg>
    );
  };

  // BRIGHT Knob: 1-column module
  const renderBrightKnob = (width: number, height: number) => {
    const knobRadius = Math.min(12, (height - 20) / 2);
    const knobY = height / 2 + 6;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <text x={width / 2} y="14" textAnchor="middle" fill={COLORS.WHITE} fontSize="12" fontFamily="RDVSimulated, monospace" fontWeight="bold">Bright</text>
        <circle cx={width / 2} cy={knobY} r={knobRadius} fill={COLORS.BLACK} stroke={COLORS.WHITE} strokeWidth="2" />
      </svg>
    );
  };

  // Brightness percentage overlay (positioned between DIM and BRIGHT)
  const renderBrightnessValue = (height: number) => {
    return (
      <svg width="40" height={height} viewBox={`0 0 40 ${height}`} style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        <text x="20" y={height / 2 + 4} textAnchor="middle" fill={COLORS.CYAN} fontSize="13" fontFamily="RDVSimulated, monospace" fontWeight="100">47%</text>
      </svg>
    );
  };

  // Header row renderer - uses grid positioning
  const renderHeaderRow = () => {
    // Left-hand mode (default): Activity Display | IA/OVR/CA | PAD | Page Control | DIM | BRIGHT
    // Each module spans specific columns in row 0
    const moduleConfigs = HANDEDNESS === 'left'
      ? [
          { key: 'activity', cols: 3, render: renderActivityDisplay },
          { key: 'status', cols: 2, render: renderStatusIndicators },
          { key: 'pad', cols: 1, render: renderPadModule },
          { key: 'page', cols: 2, render: renderPageControl },
          { key: 'dim', cols: 1, render: renderDimKnob },
          { key: 'bright', cols: 1, render: renderBrightKnob },
        ]
      : [
          { key: 'bright', cols: 1, render: renderBrightKnob },
          { key: 'dim', cols: 1, render: renderDimKnob },
          { key: 'page', cols: 2, render: renderPageControl },
          { key: 'pad', cols: 1, render: renderPadModule },
          { key: 'status', cols: 2, render: renderStatusIndicators },
          { key: 'activity', cols: 3, render: renderActivityDisplay },
        ];

    let colStart = 1; // CSS grid is 1-indexed
    const elements: React.ReactNode[] = [];

    moduleConfigs.forEach((config, idx) => {
      const moduleWidth = config.cols * CELL_WIDTH + (config.cols - 1) * GAP;
      const moduleHeight = CELL_HEIGHT;

      // Special handling for brightness value between DIM and BRIGHT
      const isDimOrBright = config.key === 'dim' || config.key === 'bright';

      elements.push(
        <div
          key={`header-${config.key}`}
          style={{
            gridColumn: `${colStart} / span ${config.cols}`,
            gridRow: '1',
            position: isDimOrBright ? 'relative' : undefined,
          }}
        >
          {config.render(moduleWidth, moduleHeight)}
        </div>
      );

      // Add brightness value overlay after DIM (for left-hand) or after BRIGHT (for right-hand)
      if ((HANDEDNESS === 'left' && config.key === 'dim') || (HANDEDNESS === 'right' && config.key === 'bright')) {
        elements.push(
          <div
            key="brightness-value"
            style={{
              gridColumn: `${colStart} / span 2`,
              gridRow: '1',
              position: 'relative',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {renderBrightnessValue(moduleHeight)}
          </div>
        );
      }

      colStart += config.cols;
    });

    return elements;
  };

  // Render communication matrix cells (rows 1-8, all 10 columns)
  const renderCommunicationMatrix = () => {
    const elements: React.ReactNode[] = [];

    // For stacked layout (Q2 and Q4 both frequency): left half is station buttons, right half is line panels
    // For 2x2 layout: Q1/Q3 are station buttons (cols 0-4), Q2 is line panels (cols 5-9, rows 1-4), Q4 is station or mixed (cols 5-9, rows 5-8)
    const isStackedLayout = layoutConfig.quadrants[1] === 'F' && layoutConfig.quadrants[3] === 'F';

    // Rows 1-8 in the 10x10 grid (communication matrix)
    for (let gridRow = 2; gridRow <= 9; gridRow++) {
      const matrixRow = gridRow - 2; // 0-7 for the communication matrix

      for (let col = 0; col < GRID_COLS; col++) {
        const isRightHalf = col >= 5;
        const isTopHalf = matrixRow < 4;

        // Determine if this cell should be a line panel or station button
        let isLinePanel = false;
        if (isStackedLayout) {
          // Stacked: right half (cols 5-9) are all line panels
          isLinePanel = isRightHalf;
        } else {
          // 2x2 layout: Q2 (top-right) is always line panels
          isLinePanel = isRightHalf && isTopHalf;
        }

        if (isLinePanel) {
          // Line panels span 5 columns (cols 5-9) for each row
          if (col === 5) {
            elements.push(
              <div
                key={`line-${matrixRow}`}
                style={{
                  gridColumn: '6 / span 5',
                  gridRow: `${gridRow}`,
                }}
              >
                {renderLineControlPanel(matrixRow)}
              </div>
            );
          }
          // Skip cols 6-9 since line panel spans them
          continue;
        } else {
          // Station button
          elements.push(
            <div
              key={`btn-${matrixRow}-${col}`}
              style={{
                gridColumn: `${col + 1}`,
                gridRow: `${gridRow}`,
              }}
            >
              {renderStationButton(matrixRow, col)}
            </div>
          );
        }
      }
    }

    return elements;
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
          fontFamily: 'RDVSimulated, monospace',
          fontWeight: 100,
          fontSize: '14px',
          userSelect: 'none',
          padding: `${PADDING}px`,
          boxSizing: 'border-box',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_WIDTH}px)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, ${CELL_HEIGHT}px)`,
          gap: `${GAP}px`,
        }}
      >
        {/* Row 0: Header modules */}
        {renderHeaderRow()}

        {/* Rows 1-8: Communication matrix */}
        {renderCommunicationMatrix()}

        {/* Row 9: Footer (empty for now) */}
        <div
          style={{
            gridColumn: '1 / span 10',
            gridRow: '10',
          }}
        >
          {/* Footer content removed - reserved for future use */}
        </div>
      </div>
    </div>
  );
}
