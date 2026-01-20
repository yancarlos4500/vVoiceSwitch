"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useCoreStore, findDialCodeTable, resolveDialCode } from '~/model';

interface RdvsDialpadProps {
  /** The trunk name from the type 3 line label (e.g., "APCH", "S-BAY", "E/W/V") */
  trunkName: string;
  /** Callback when dialpad is closed */
  onClose: () => void;
  /** Optional: Callback when a call is successfully initiated */
  onCallInitiated?: (target: string) => void;
}

/**
 * RDVS Dialpad Component
 * 
 * Displays a dialpad for entering 2-digit codes when a type 3 (dial) line is selected.
 * Looks up the entered code in the dialCodeTable and initiates a call to the resolved target.
 */
export default function RdvsDialpad({ trunkName, onClose, onCallInitiated }: RdvsDialpadProps) {
  const sendMsg = useCoreStore((s: any) => s.sendMessageNow);
  const sendDialCall = useCoreStore((s: any) => s.sendDialCall);
  const positionData = useCoreStore((s: any) => s.positionData);
  const selectedPositions = useCoreStore((s: any) => s.selectedPositions);
  const dialCallStatus = useCoreStore((s: any) => s.dialCallStatus);
  
  const [dialedCode, setDialedCode] = useState<string>('');
  const [resolvedTarget, setResolvedTarget] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get the dialCodeTable for the current position
  const currentCallsign = selectedPositions?.[0]?.cs;
  const dialCodeTable = currentCallsign ? findDialCodeTable(positionData, currentCallsign) : null;
  
  // Get available codes for this trunk (for reference display)
  const trunkCodes = dialCodeTable?.[trunkName] || {};
  
  // Resolve dial code as user types
  useEffect(() => {
    if (dialedCode.length === 2 && dialCodeTable) {
      const target = resolveDialCode(dialCodeTable, trunkName, dialedCode);
      if (target) {
        setResolvedTarget(target);
        setError(null);
      } else {
        setResolvedTarget(null);
        setError(`Code ${dialedCode} not found for ${trunkName}`);
      }
    } else {
      setResolvedTarget(null);
      setError(null);
    }
  }, [dialedCode, dialCodeTable, trunkName]);
  
  // Handle digit press
  const handleDigitPress = useCallback((digit: string) => {
    if (dialedCode.length < 2) {
      setDialedCode(prev => prev + digit);
    }
  }, [dialedCode.length]);
  
  // Handle clear
  const handleClear = useCallback(() => {
    setDialedCode('');
    setResolvedTarget(null);
    setError(null);
  }, []);
  
  // Handle backspace
  const handleBackspace = useCallback(() => {
    setDialedCode(prev => prev.slice(0, -1));
  }, []);
  
  // Handle call button
  const handleCall = useCallback(() => {
    if (resolvedTarget && dialedCode.length === 2) {
      console.log('[RdvsDialpad] Initiating call:', { trunkName, dialedCode, resolvedTarget });
      sendDialCall(trunkName, dialedCode);
      onCallInitiated?.(resolvedTarget);
    }
  }, [resolvedTarget, dialedCode, trunkName, sendDialCall, onCallInitiated]);
  
  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && resolvedTarget) {
        handleCall();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigitPress, handleBackspace, handleCall, resolvedTarget, onClose]);
  
  // Keypad button layout
  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['CLR', '0', '←']
  ];
  
  // Button style based on status
  const getStatusColor = () => {
    switch (dialCallStatus) {
      case 'dialing': return '#FFFF00'; // Yellow
      case 'ringback': return '#00FF00'; // Green flashing
      case 'connected': return '#00FF00'; // Green solid
      case 'busy': return '#FF0000'; // Red
      case 'error': return '#FF0000'; // Red
      default: return '#00FFFF'; // Cyan
    }
  };
  
  return (
    <div 
      className="rdvs-dialpad"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1a1a2e',
        border: '2px solid #00FFFF',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '280px',
        zIndex: 2000,
        fontFamily: 'RDVS, monospace'
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          borderBottom: '1px solid #00FFFF',
          paddingBottom: '8px'
        }}
      >
        <span style={{ color: '#00FFFF', fontSize: '14px', fontWeight: 'bold' }}>
          DIAL: {trunkName}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#FF6666',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>
      
      {/* Display */}
      <div 
        style={{
          backgroundColor: '#0a0a14',
          border: '1px solid #333',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '12px',
          textAlign: 'center'
        }}
      >
        {/* Dialed code */}
        <div 
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: getStatusColor(),
            letterSpacing: '8px',
            minHeight: '40px'
          }}
        >
          {dialedCode || '--'}
        </div>
        
        {/* Resolved target or status */}
        <div 
          style={{
            fontSize: '12px',
            color: error ? '#FF6666' : (resolvedTarget ? '#00FF00' : '#666'),
            marginTop: '4px',
            minHeight: '16px'
          }}
        >
          {error || resolvedTarget || (dialCallStatus !== 'idle' ? dialCallStatus.toUpperCase() : 'Enter 2-digit code')}
        </div>
      </div>
      
      {/* Keypad */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        {keypadRows.flat().map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'CLR') handleClear();
              else if (key === '←') handleBackspace();
              else handleDigitPress(key);
            }}
            style={{
              backgroundColor: key === 'CLR' ? '#442222' : key === '←' ? '#333322' : '#222244',
              border: '1px solid #444',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '12px',
              cursor: 'pointer',
              transition: 'background-color 0.1s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = key === 'CLR' ? '#663333' : key === '←' ? '#555533' : '#333366'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = key === 'CLR' ? '#442222' : key === '←' ? '#333322' : '#222244'}
          >
            {key}
          </button>
        ))}
      </div>
      
      {/* Call button */}
      <button
        onClick={handleCall}
        disabled={!resolvedTarget || dialCallStatus === 'dialing' || dialCallStatus === 'ringback'}
        style={{
          width: '100%',
          backgroundColor: resolvedTarget ? '#006600' : '#333',
          border: '1px solid ' + (resolvedTarget ? '#00FF00' : '#444'),
          borderRadius: '4px',
          color: resolvedTarget ? '#FFFFFF' : '#666',
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '12px',
          cursor: resolvedTarget ? 'pointer' : 'not-allowed',
          transition: 'background-color 0.1s'
        }}
        onMouseEnter={(e) => resolvedTarget && (e.currentTarget.style.backgroundColor = '#008800')}
        onMouseLeave={(e) => resolvedTarget && (e.currentTarget.style.backgroundColor = '#006600')}
      >
        {dialCallStatus === 'dialing' || dialCallStatus === 'ringback' 
          ? dialCallStatus.toUpperCase() + '...'
          : `CALL ${resolvedTarget || ''}`}
      </button>
      
      {/* Quick reference - show a few available codes */}
      {Object.keys(trunkCodes).length > 0 && (
        <div 
          style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#0a0a14',
            borderRadius: '4px',
            maxHeight: '100px',
            overflowY: 'auto'
          }}
        >
          <div style={{ color: '#666', fontSize: '10px', marginBottom: '4px' }}>
            Quick Reference:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {Object.entries(trunkCodes).slice(0, 12).map(([code, target]) => (
              <span 
                key={code}
                onClick={() => setDialedCode(code)}
                style={{
                  fontSize: '9px',
                  color: '#00FFFF',
                  backgroundColor: '#1a1a2e',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                {code}:{String(target).substring(0, 8)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
