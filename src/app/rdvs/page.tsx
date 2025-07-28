'use client';
import RdvsComponent from '../_components/vatlines/rdvs';
import { type Configuration } from '../_components/vatlines/App';

// Mock configuration based on example-config.json structure
const mockConfiguration: Configuration = {
  id: 'mock-config',
  name: 'Mock RDVS Configuration',
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

export default function RdvsPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <RdvsComponent
        activeLandlines={[]}
        incomingLandlines={[]}
        outgoingLandlines={[]}
        heldLandlines={[]}
        config={mockConfiguration}
        buttonPress={() => {}}
        toggleGg={() => {}}
        ggRoute={false}
        toggleOver={() => {}}
        overrideRoute={false}
        holdBtn={() => {}}
        releaseBtn={() => {}}
        settingsEdit={() => {}}
        volume={{
          volume: 50,
          setVolume: () => {},
        }}
        playError={() => {}}
        metadata={{
          position: 'RDVS Demo',
          sector: 'DEMO',
          facilityId: 'TEST',
        }}
      />
    </div>
  );
}