import React, { useState } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { NodeConfigSidebar } from './components/NodeConfigSidebar';
import { ExecutionLogDrawer } from './components/ExecutionLogDrawer';
import { JSONModal } from './components/JSONModal';

export const App: React.FC = () => {
  const [isJSONModalOpen, setIsJSONModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      <Toolbar onOpenJSONModal={() => setIsJSONModalOpen(true)} />

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 relative overflow-hidden">
          <Canvas />
        </main>

        <NodeConfigSidebar />
      </div>

      <ExecutionLogDrawer />

      <JSONModal
        isOpen={isJSONModalOpen}
        onClose={() => setIsJSONModalOpen(false)}
      />
    </div>
  );
};

export default App;
