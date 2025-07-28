'use client';
import VscsComponent from '../_components/vatlines/vscs';
import { Configuration } from '../_components/vatlines/App';

// Mock configuration based on example-config.json structure
const mockConfiguration: Configuration = {
  id: 'mock-config',
  name: 'Mock VSCS Configuration',
  layouts: [
    {
      order: 0,
      button: {
        shortName: 'LC1',
        longName: 'Local Control 1',
        target: 'LC1',
        type: 'RING' as any,
        dialCode: '5001'
      }
    },
    {
      order: 1,
      button: {
        shortName: 'LC2',
        longName: 'Local Control 2',
        target: 'LC2',
        type: 'OVERRIDE' as any,
        dialCode: '5002'
      }
    },
    // Add more buttons as needed...
  ]
};

export default function VscsPage() {
  return (
    <div className="min-h-screen bg-zinc-700 p-4">
      <VscsComponent
        activeLandlines={[]}
        incomingLandlines={[]}
        outgoingLandlines={[]}
        heldLandlines={[]}
        config={mockConfiguration}
        buttonPress={() => {}}
        holdBtn={() => {}}
        toggleGg={() => {}}
        ggLoud={false}
        toggleOver={() => {}}
        overrideLoud={false}
        releaseBtn={() => {}}
        settingsEdit={() => {}}
        volume={{
          volume: 50,
          setVolume: () => {},
        }}
        playError={() => {}}
        metadata={{
          position: 'VSCS Demo',
          sector: 'DEMO',
          facilityId: 'TEST',
        }}
      />
    </div>
  );
}