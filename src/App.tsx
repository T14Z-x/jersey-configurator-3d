import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Camera,
  Check,
  FileText,
  Image as ImageIcon,
  Layers,
  Moon,
  Palette,
  Redo2,
  RotateCcw,
  RotateCw,
  Share2,
  Shirt,
  Sparkles,
  Sun,
  Type,
  Undo2,
  Users,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { EditorPanel } from './components/EditorPanel';
import { RosterQuoteModal } from './components/RosterQuoteModal';
import { DEFAULT_JERSEY_CONFIG, SPORTS } from './data/presets';
import { JerseyStage, JerseyStageHandle } from './three/JerseyStage';
import {
  BackdropMode,
  CameraPreset,
  EditorTab,
  JerseyConfig,
  SavedDesign,
} from './types/jersey';
import { downloadDataUrl, openPrintableSpecSheet } from './utils/specSheet';
import { buildDesignHash, parseDesignHash } from './utils/urlState';

const STORAGE_KEY = 't14z_studio_saved_designs_v1';

const NAV_TABS: { id: EditorTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'sport', label: 'Sport', icon: Shirt },
  { id: 'pattern', label: 'Design', icon: Layers },
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'logos', label: 'Logos', icon: ImageIcon },
  { id: 'saved', label: 'Locker', icon: Bookmark },
];

export function App() {
  const [config, setConfig] = useState<JerseyConfig>(() =>
    parseDesignHash(window.location.hash)
  );
  const [history, setHistory] = useState<JerseyConfig[]>([]);
  const [future, setFuture] = useState<JerseyConfig[]>([]);
  const [activeTab, setActiveTab] = useState<EditorTab>('sport');
  const [autoRotate, setAutoRotate] = useState(false);
  const [backdrop, setBackdrop] = useState<BackdropMode>('studio-dark');
  const [activeView, setActiveView] = useState<CameraPreset>('three-quarter');
  const [copiedLink, setCopiedLink] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteSnapshot, setQuoteSnapshot] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SavedDesign[]) : [];
    } catch {
      return [];
    }
  });

  const stageRef = useRef<JerseyStageHandle>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((curr) => (curr === msg ? null : curr));
    }, 2400);
  }, []);

  // Sync URL hash as #/sport/baseball/cut/men/color/maroon/<hash>
  useEffect(() => {
    const nextHash = buildDesignHash(config);
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [config]);

  const updateConfig = useCallback((next: JerseyConfig) => {
    setConfig((prev) => {
      setHistory((h) => [...h.slice(-29), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [config, ...f]);
    setConfig(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, config]);
    setConfig(next);
  };

  const handleReset = () => {
    updateConfig(structuredClone(DEFAULT_JERSEY_CONFIG));
    stageRef.current?.setCameraPreset('three-quarter');
    setActiveView('three-quarter');
    showToast('Reset to Maroon Baseball Classic');
  };

  const handleCameraPreset = (preset: CameraPreset) => {
    setActiveView(preset);
    setAutoRotate(false);
    stageRef.current?.setCameraPreset(preset);
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      showToast('Shareable 3D design link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      showToast('URL updated in address bar — copy to share!');
    }
  };

  const handleExportPng = () => {
    const dataUrl = stageRef.current?.captureSnapshot();
    if (!dataUrl) return;
    downloadDataUrl(
      dataUrl,
      `t14z-${config.sport}-${(config.teamName.text || 'jersey').toLowerCase()}.png`
    );
    showToast('High-res 3D PNG downloaded!');
  };

  const handleExportSpecSheet = async () => {
    if (!stageRef.current) return;
    const { front, back } = await stageRef.current.captureFrontAndBack();
    openPrintableSpecSheet(config, front, back, window.location.href);
  };

  const handleOpenQuote = () => {
    const snap = stageRef.current?.captureSnapshot() ?? '';
    setQuoteSnapshot(snap);
    setQuoteOpen(true);
  };

  const handleSaveDesign = (name: string) => {
    const thumb = stageRef.current?.captureSnapshot() ?? '';
    const entry: SavedDesign = {
      id: `kit-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      thumbnail: thumb,
      config: structuredClone(config),
    };
    const next = [entry, ...savedDesigns].slice(0, 20);
    setSavedDesigns(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
    showToast(`Saved "${name}" to locker`);
  };

  const handleLoadDesign = (design: SavedDesign) => {
    updateConfig(structuredClone(design.config));
    showToast(`Loaded "${design.name}"`);
  };

  const handleDeleteDesign = (id: string) => {
    const next = savedDesigns.filter((d) => d.id !== id);
    setSavedDesigns(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const sportMeta = SPORTS.find((s) => s.id === config.sport) ?? SPORTS[0];

  const cycleBackdrop = () => {
    setBackdrop((prev) =>
      prev === 'studio-dark'
        ? 'studio-light'
        : prev === 'studio-light'
          ? 'arena'
          : 'studio-dark'
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* TOP STUDIO HEADER */}
      <header className="h-14 shrink-0 border-b border-zinc-800/90 bg-zinc-950/95 px-4 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-rose-900 flex items-center justify-center font-black text-white text-[11px] tracking-tighter shadow-md shadow-rose-950">
              T14Z
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-sm font-extrabold tracking-wide text-white">
                T14Z STUDIO
              </div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-400">
                3D Uniform Configurator
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.colors.primary }} />
            <span className="font-semibold text-white">{sportMeta.name}</span>
            <span className="text-zinc-600">/</span>
            <span className="capitalize text-zinc-400">{config.cut}&apos;s</span>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400 font-mono font-semibold">
              ${sportMeta.basePrice}
            </span>
          </div>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Undo"
              className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              title="Redo"
              className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              title="Reset Design"
              className="p-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleShareLink}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-200 transition"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>{copiedLink ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handleExportPng}
            title="Download 3D PNG Snapshot"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-200 transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">PNG</span>
          </button>

          <button
            onClick={handleExportSpecSheet}
            title="Open Printable Production Spec Sheet"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-200 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Spec Sheet</span>
          </button>

          <button
            onClick={handleOpenQuote}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/60 transition"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Roster &amp; Quote</span>
          </button>
        </div>
      </header>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex min-h-0 relative">
        {/* LEFT STEP RAIL */}
        <nav className="w-16 shrink-0 border-r border-zinc-800/90 bg-zinc-950 flex flex-col items-center py-3 gap-1.5 z-10">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-12 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition ${
                  active
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-semibold tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* CUSTOMIZATION SIDEBAR */}
        <aside className="w-72 sm:w-80 shrink-0 border-r border-zinc-800/90 bg-zinc-950/95 flex flex-col min-h-0 z-10">
          <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
              {NAV_TABS.find((t) => t.id === activeTab)?.label} Studio
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">LIVE 3D</span>
          </div>
          <div className="flex-1 min-h-0">
            <EditorPanel
              activeTab={activeTab}
              config={config}
              onChange={updateConfig}
              savedDesigns={savedDesigns}
              onSaveDesign={handleSaveDesign}
              onLoadDesign={handleLoadDesign}
              onDeleteDesign={handleDeleteDesign}
              onFocusBack={() => handleCameraPreset('back')}
              onFocusFront={() => handleCameraPreset('front')}
            />
          </div>
        </aside>

        {/* CENTER 3D INTERACTIVE STAGE */}
        <main className="flex-1 relative min-w-0 min-h-0">
          <JerseyStage
            ref={stageRef}
            config={config}
            autoRotate={autoRotate}
            backdrop={backdrop}
          />

          {/* Top-right Viewport Utility Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={cycleBackdrop}
              title="Switch Studio Lighting Backdrop"
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-700/70 text-zinc-200 transition shadow-lg"
            >
              {backdrop === 'studio-light' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : backdrop === 'arena' ? (
                <Sparkles className="w-4 h-4 text-rose-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-300" />
              )}
            </button>
            <button
              onClick={() => stageRef.current?.zoomBy(-0.4)}
              title="Zoom In"
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-700/70 text-zinc-200 transition shadow-lg"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => stageRef.current?.zoomBy(0.4)}
              title="Zoom Out"
              className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur border border-zinc-700/70 text-zinc-200 transition shadow-lg"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Drag Hint Badge */}
          <div className="pointer-events-none absolute top-4 left-4 px-3 py-1.5 rounded-full bg-zinc-900/70 backdrop-blur border border-white/10 text-[11px] text-zinc-300">
            Drag to rotate 360° • Scroll to zoom
          </div>

          {/* Bottom Floating Camera View Switcher */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 rounded-2xl bg-zinc-900/85 backdrop-blur-md border border-zinc-700/80 shadow-2xl z-10">
            {(
              [
                ['front', 'Front'],
                ['back', 'Back'],
                ['left', 'Right Side'],
                ['right', 'Left Side'],
                ['three-quarter', '3/4'],
              ] as [CameraPreset, string][]
            ).map(([preset, label]) => (
              <button
                key={preset}
                onClick={() => handleCameraPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeView === preset && !autoRotate
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}

            <div className="w-px h-5 bg-zinc-700 mx-1" />

            <button
              onClick={() => setAutoRotate((r) => !r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                autoRotate
                  ? 'bg-emerald-600 text-white'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">360° Spin</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-zinc-900/95 border border-rose-500/50 text-xs font-semibold text-white shadow-xl z-20">
              {toast}
            </div>
          )}
        </main>
      </div>

      {/* ROSTER & QUOTE MODAL */}
      <RosterQuoteModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        config={config}
        snapshot={quoteSnapshot}
        onExportSpecSheet={handleExportSpecSheet}
      />
    </div>
  );
}

export default App;
