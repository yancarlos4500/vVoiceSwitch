/**
 * VACS Store Bridge
 *
 * Singleton that manages the VacsClient lifecycle and bridges VACS call state
 * into the existing zustand gg_status array. This way the UI buttons (ETVS/RDVS/IVSR)
 * can render VACS calls identically to AFV G/G lines.
 *
 * Usage from a React component or the store:
 *   import { vacsStore } from '@/lib/vacs/store';
 *   vacsStore.connectVacs(token, 'ZOA_33_CTR');
 *   vacsStore.callStation('KSFO_TWR');
 */

import { VacsClient } from './client';
import type { VacsClientEvent, VacsClientEventHandler } from './client';
import type {
  VacsConfig,
  VacsCall,
  CallId,
  ClientInfo,
  StationId,
  PositionId,
  ClientId,
} from './types';
import { VACS_DEV_CONFIG, VACS_PROD_CONFIG } from './types';

// ─── Store State ─────────────────────────────────────────────────────────────

export interface VacsStoreState {
  /** Whether the VACS signaling WebSocket is connected and authenticated */
  vacsConnected: boolean;
  /** VACS connection status message for UI display */
  vacsStatus: string;
  /** Our VACS client info (CID, displayName, frequency) */
  vacsClientInfo: ClientInfo | null;
  /** All clients connected to the VACS signaling server */
  vacsClients: ClientInfo[];
  /** All stations known to the VACS signaling server */
  vacsStations: Array<{ id: StationId; own: boolean }>;
  /** Active VACS calls */
  vacsCalls: VacsCall[];
  /** Last VACS error message */
  vacsError: string | null;
}

export const INITIAL_VACS_STATE: VacsStoreState = {
  vacsConnected: false,
  vacsStatus: 'disconnected',
  vacsClientInfo: null,
  vacsClients: [],
  vacsStations: [],
  vacsCalls: [],
  vacsError: null,
};

// ─── VACS Store Singleton ────────────────────────────────────────────────────

/** A VACS line configured in the position JSON (e.g. ["vacs:LON_S_CTR", 2, "LON,SOUTH"]) */
export interface VacsConfiguredLine {
  target: string;
  targetType: 'position' | 'station' | 'client';
  label: string;
  lineType: number;
  sortIndex: number;
}

class VacsStore {
  private client: VacsClient | null = null;
  private storeSet: ((partial: any) => void) | null = null;
  private storeGet: (() => any) | null = null;
  private listeners = new Set<VacsClientEventHandler>();
  /** VACS lines from the position JSON config */
  private configuredLines: VacsConfiguredLine[] = [];

  /** Bind to the zustand store's set/get functions */
  bindStore(set: (partial: any) => void, get: () => any): void {
    this.storeSet = set;
    this.storeGet = get;
  }

  /** Subscribe to VACS client events */
  on(handler: VacsClientEventHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  /** Whether VACS is connected */
  get isConnected(): boolean {
    return this.client?.isConnected ?? false;
  }

  /** The VacsClient instance (for advanced usage) */
  get vacsClient(): VacsClient | null {
    return this.client;
  }

  // ─── Connection ──────────────────────────────────────────────────────

  /**
   * Connect to the VACS signaling server.
   * @param token - WebSocket token from /api/vacs/token
   * @param positionId - VATSIM position (e.g. "ZOA_33_CTR")
   * @param useProd - Use production server (default: false = dev/sandbox)
   */
  connectVacs(token: string, positionId?: PositionId, useProd = false): void {
    // Disconnect existing client if any
    if (this.client) {
      this.client.destroy();
    }

    const config = useProd ? VACS_PROD_CONFIG : VACS_DEV_CONFIG;
    this.client = new VacsClient(config);

    // Subscribe to events
    this.client.on((event) => this.handleEvent(event));

    this.updateState({ vacsStatus: 'connecting', vacsError: null });
    this.client.connect(token, positionId?.toUpperCase());
  }

  /** Disconnect from VACS */
  disconnectVacs(): void {
    if (this.client) {
      this.client.disconnect();
      this.client.destroy();
      this.client = null;
    }
    this.updateState({
      ...INITIAL_VACS_STATE,
    });
  }

  // ─── Configured Lines ────────────────────────────────────────────────

  /**
   * Set the VACS lines parsed from the position JSON.
   * Called by model.ts resetWindow() when position config is loaded.
   */
  setConfiguredLines(lines: VacsConfiguredLine[]): void {
    this.configuredLines = lines;
    // Immediately refresh gg_status so static VACS buttons appear
    this.refreshGgStatus();
  }

  /** Get the configured VACS lines */
  getConfiguredLines(): VacsConfiguredLine[] {
    return this.configuredLines;
  }

  // ─── Call Management ─────────────────────────────────────────────────

  /** Call a station by its ID */
  callStation(stationId: StationId, prio = false): CallId | null {
    return this.client?.callStation(stationId.toUpperCase(), prio) ?? null;
  }

  /** Call a position by its ID */
  callPosition(positionId: PositionId, prio = false): CallId | null {
    return this.client?.callPosition(positionId.toUpperCase(), prio) ?? null;
  }

  /** Call a specific client (by CID) */
  callClient(clientId: ClientId, prio = false): CallId | null {
    return this.client?.callClient(clientId, prio) ?? null;
  }

  /** Accept an incoming call */
  acceptCall(callId: CallId): void {
    this.client?.acceptCall(callId);
  }

  /** Reject an incoming call */
  rejectCall(callId: CallId): void {
    this.client?.rejectCall(callId);
  }

  /** End an active call */
  endCall(callId: CallId): void {
    this.client?.endCall(callId);
  }

  /**
   * Handle a G/G button press for a VACS call.
   * Called from the existing button handlers when a VACS-backed button is pressed.
   *
   * @param vacsCallId - The VACS call ID attached to the button
   * @param currentStatus - The current button status (off, chime, ringing, ok, etc.)
   */
  handleButtonPress(vacsCallId: CallId, currentStatus: string): void {
    switch (currentStatus) {
      case 'off':
        // Button was idle — check if this is a configured line target to initiate a call
        if (vacsCallId.startsWith('vacs_cfg:')) {
          if (!this.client) {
            console.warn('[VACS Store] Cannot call: not connected to VACS');
            return;
          }
          const parts = vacsCallId.split(':');
          const targetType = parts[1]; // pos, stn, cid
          const targetId = parts.slice(2).join(':'); // handle colons in IDs
          if (targetType === 'pos') this.callPosition(targetId);
          else if (targetType === 'stn') this.callStation(targetId);
          else if (targetType === 'cid') this.callClient(targetId);
        }
        break;
      case 'chime':
        // Incoming call ringing — accept it
        this.acceptCall(vacsCallId);
        break;
      case 'ringing':
        // Outgoing call ringing — cancel/end it
        this.endCall(vacsCallId);
        break;
      case 'ok':
      case 'active':
        // Active call — end it
        this.endCall(vacsCallId);
        break;
      default:
        // Unknown state — try ending
        if (vacsCallId && !vacsCallId.startsWith('vacs_cfg:')) {
          this.endCall(vacsCallId);
        }
        break;
    }
  }

  // ─── G/G Status Bridge ──────────────────────────────────────────────

  /**
   * Get VACS entries for gg_status.
   * Merges configured (static) lines with active call state:
   * - Configured lines appear as idle buttons when no call is active for that target
   * - When a call is active for a configured target, the entry reflects the call state
   * - Dynamic incoming calls not matching any configured line are also included
   */
  getGgStatusEntries(): any[] {
    const activeEntries = this.client?.getGgStatusEntries() ?? [];

    if (this.configuredLines.length === 0) {
      // No configured lines — return only dynamic active call entries
      return activeEntries;
    }

    const entries: any[] = [];
    const matchedCallIds = new Set<string>();

    for (const cfgLine of this.configuredLines) {
      // Try to find an active call matching this configured target
      const matchingCall = activeEntries.find((entry: any) => {
        const remoteId = (entry.call || '').replace('VACS_', '').toUpperCase();
        return remoteId === cfgLine.target.toUpperCase();
      });

      if (matchingCall) {
        // Active call matches this configured line — use call state
        matchedCallIds.add(matchingCall.vacsCallId);
        entries.push({
          ...matchingCall,
          call_name: cfgLine.label, // Prefer config label over remote display name
          lineType: cfgLine.lineType,
          vacsTarget: cfgLine.target,
          vacsTargetType: cfgLine.targetType,
        });
      } else {
        // No active call — show as idle button ready to initiate a call
        const abbrevType = cfgLine.targetType === 'position' ? 'pos'
          : cfgLine.targetType === 'station' ? 'stn' : 'cid';
        entries.push({
          call: `VACS_${cfgLine.target}`,
          call_name: cfgLine.label,
          status: 'off',
          isVacs: true,
          vacsCallId: `vacs_cfg:${abbrevType}:${cfgLine.target}`,
          vacsTarget: cfgLine.target,
          vacsTargetType: cfgLine.targetType,
          lineType: cfgLine.lineType,
        });
      }
    }

    // Add any active calls that don't match a configured line (incoming from unknown targets)
    for (const entry of activeEntries) {
      if (!matchedCallIds.has(entry.vacsCallId)) {
        entries.push(entry);
      }
    }

    return entries;
  }

  // ─── Event Handling ──────────────────────────────────────────────────

  private handleEvent(event: VacsClientEvent): void {
    // Forward to external listeners
    for (const handler of this.listeners) {
      try {
        handler(event);
      } catch (err) {
        console.error('[VACS Store] Event handler error:', err);
      }
    }

    // Update zustand store state
    switch (event.type) {
      case 'connected':
        this.updateState({
          vacsConnected: true,
          vacsStatus: 'connected',
          vacsClientInfo: event.clientInfo,
          vacsError: null,
        });
        console.log('[VACS Store] Connected:', event.clientInfo.displayName);
        break;

      case 'disconnected':
        this.updateState({
          vacsConnected: false,
          vacsStatus: 'disconnected',
          vacsClientInfo: null,
          vacsClients: [],
          vacsStations: [],
          vacsCalls: [],
        });
        console.log('[VACS Store] Disconnected');
        break;

      case 'callStateChanged':
        this.updateState({
          vacsCalls: this.client?.activeCalls ?? [],
        });
        // Trigger a gg_status refresh so the UI re-renders with VACS buttons
        this.refreshGgStatus();
        break;

      case 'callEnded':
        this.updateState({
          vacsCalls: this.client?.activeCalls ?? [],
        });
        this.refreshGgStatus();
        break;

      case 'clientsUpdated':
        this.updateState({
          vacsClients: event.clients,
        });
        break;

      case 'stationsUpdated':
        this.updateState({
          vacsStations: event.stations,
        });
        break;

      case 'error':
        this.updateState({
          vacsError: event.error,
        });
        console.error('[VACS Store] Error:', event.error);
        break;
    }
  }

  /** Update the zustand store with VACS state */
  private updateState(partial: Partial<VacsStoreState>): void {
    if (this.storeSet) {
      this.storeSet(partial);
    }
  }

  /**
   * Trigger a refresh of gg_status to include VACS entries.
   * We append VACS call buttons after the AFV G/G entries.
   */
  private refreshGgStatus(): void {
    if (!this.storeGet || !this.storeSet) return;

    const state = this.storeGet();
    const currentGg = state.gg_status || [];

    // Filter out any previous VACS entries from gg_status
    const afvGg = currentGg.filter((entry: any) => !entry.isVacs);

    // Get current VACS entries
    const vacsGg = this.getGgStatusEntries();

    // Merge: AFV entries first, then VACS entries
    const merged = [...afvGg, ...vacsGg];

    this.storeSet({ gg_status: merged });
  }

  /** Clean up all resources */
  destroy(): void {
    this.client?.destroy();
    this.client = null;
    this.listeners.clear();
  }
}

/** Singleton VACS store bridge */
export const vacsStore = new VacsStore();
