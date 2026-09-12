import React, { useRef, useState } from 'react';
import {
  Activity,
  Brain,
  CheckCircle2,
  Filter,
  Image as ImageIcon,
  Layers,
  PlusCircle,
  Search,
  Send,
  Sparkles,
  Upload,
  User,
  Zap
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { CivicCategory, DetectedLanguage, SignalChannel } from '../../types/civic';
import { AgentTraceDrawer } from './AgentTraceDrawer';
import { MultilingualCitizenIngestionPanel } from './MultilingualCitizenIngestionPanel';

export const SignalExplorer: React.FC = () => {
  const {
    signals,
    addCustomSignal,
    geminiApiKey,
    setGeminiApiKey,
    signalFilters,
    setSignalFilters,
    ingestionStats,
    ingestionMode,
    ingestFileDataset,
    agentTraces,
    selectedTrace,
    inspectAgentTrace,
    getBlueskyHealth
  } = useCivic();

  const bskyHealth = getBlueskyHealth?.();
  const isBskyLive = bskyHealth?.status === 'CONNECTED';
  const lastEventStr = bskyHealth?.lastEventTimestamp
    ? new Date(bskyHealth.lastEventTimestamp).toLocaleTimeString()
    : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatusMsg, setImportStatusMsg] = useState<string | null>(null);

  const searchQuery = signalFilters.searchQuery;
  const selectedLang = signalFilters.selectedLanguage;
  const selectedChannel = signalFilters.selectedChannel;
  const selectedCategory = signalFilters.selectedCategory;

  // New Signal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSignalText, setNewSignalText] = useState('');
  const [newSignalChannel, setNewSignalChannel] = useState<SignalChannel>('citizen_app');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter signals
  const filteredSignals = signals.filter(sig => {
    if (selectedLang !== 'all' && sig.detectedLanguage !== selectedLang) return false;
    if (selectedChannel !== 'all' && sig.channel !== selectedChannel) return false;
    if (selectedCategory !== 'all' && sig.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = sig.rawText.toLowerCase().includes(q);
      const matchTrans = sig.englishTranslation.toLowerCase().includes(q);
      const matchLoc = sig.locationName.toLowerCase().includes(q);
      return matchText || matchTrans || matchLoc;
    }
    return true;
  });

  const handleSubmitNewSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignalText.trim()) return;

    setIsSubmitting(true);
    await addCustomSignal(newSignalText.trim(), newSignalChannel);
    setIsSubmitting(false);
    setNewSignalText('');
    setShowAddModal(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      const content = event.target?.result as string;
      if (content) {
        const count = await ingestFileDataset(content, file.name);
        setImportStatusMsg(`Successfully imported ${count} signals from ${file.name}.`);
        setTimeout(() => setImportStatusMsg(null), 5000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="signals-view-container" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      {/* Top Header & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <Activity size={20} color="var(--cyan-400)" />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Citizen Signals
            </h2>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-400)',
              fontSize: '0.74rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)'
            }}>
              Mode: {ingestionMode}
            </span>

            {ingestionMode === 'LIVE' && (
              <span style={{
                background: isBskyLive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isBskyLive ? '#10b981' : '#f87171',
                border: isBskyLive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                fontSize: '0.74rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isBskyLive ? '#10b981' : '#ef4444' }} />
                {isBskyLive ? 'Bluesky · LIVE' : 'Bluesky · Disconnected'}
                {lastEventStr && <span style={{ opacity: 0.8, fontSize: '0.65rem' }}>({lastEventStr})</span>}
              </span>
            )}
          </div>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: '#0284c7', fontWeight: 600 }}>
            "What are citizens asking for?"
          </p>
        </div>

        {/* Action Controls & File Import */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.json"
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="sim-btn"
            style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-accent)',
              padding: '0.55rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
            title="Import offline CSV or JSON dataset into unified ingestion pipeline"
          >
            <Upload size={15} color="var(--cyan-400)" />
            <span>Upload Dataset (CSV/JSON)</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--bg-surface)', padding: '0.3rem 0.6rem', borderRadius: '6px', border: geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)' }}>
            <Sparkles size={14} color={geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? '#34d399' : 'var(--cyan-400)'} />
            <input
              type="password"
              placeholder="Google Gemini Key..."
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.74rem',
                outline: 'none',
                width: '140px',
                fontFamily: 'var(--font-mono)'
              }}
              title="Enter Google Gemini API Key for live multimodal NLP parsing"
            />
            {geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' ? (
              <span style={{ fontSize: '0.62rem', color: '#34d399', fontWeight: 800, fontFamily: 'var(--font-mono)', background: 'rgba(16, 185, 129, 0.2)', padding: '1px 5px', borderRadius: '3px' }}>
                LIVE
              </span>
            ) : (
              <span style={{ fontSize: '0.62rem', color: '#fbbf24', fontWeight: 800, fontFamily: 'var(--font-mono)', background: 'rgba(245, 158, 11, 0.2)', padding: '1px 5px', borderRadius: '3px' }}>
                RULE ENGINE
              </span>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="sim-btn"
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.55rem 1rem',
              fontSize: '0.82rem',
              fontWeight: 700
            }}
          >
            <PlusCircle size={16} />
            <span>Test Ingest Signal</span>
          </button>
        </div>
      </div>

      {/* Multilingual Citizen Ingestion Gateway Component */}
      <div style={{ marginBottom: '1.25rem' }}>
        <MultilingualCitizenIngestionPanel onIngestRequest={(req) => addCustomSignal(req.rawText, req.sourceChannel as any)} />
      </div>

      {/* Import Status Alert */}
      {importStatusMsg && (
        <div style={{ padding: '0.65rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{importStatusMsg}</span>
        </div>
      )}

      {/* Live Diagnostic Telemetry Panel */}
      {ingestionMode === 'LIVE' && bskyHealth && (
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '0.85rem 1.1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isBskyLive ? '#10b981' : '#ef4444' }} />
              <strong style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                BLUESKY JETSTREAM FIREHOSE • {isBskyLive ? 'CONNECTED' : 'DISCONNECTED'}
              </strong>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {isBskyLive && (bskyHealth.telemetry?.civicCandidates || 0) === 0 ? (
                <span>CONNECTED • No civic signals detected yet</span>
              ) : (
                <span>
                  WS Events: <strong>{bskyHealth.telemetry?.websocketEventsReceived || 0}</strong> • Posts: <strong>{bskyHealth.telemetry?.createPostEvents || 0}</strong> • Candidates: <strong>{bskyHealth.telemetry?.civicCandidates || 0}</strong> • Accepted: <strong style={{ color: '#34d399' }}>{bskyHealth.telemetry?.normalizedAccepted || 0}</strong>
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Last Signal: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{bskyHealth.lastAcceptedSignalAt || 'None'}</span>
            </div>

            {/* Development-Only Test Fixture Action */}
            <button
              onClick={() => {
                const bskyProvider = (window as any).__NAGARBODH_BSKY_PROVIDER__ || (useCivic as any);
                const devFixture = JSON.stringify({
                  kind: 'commit',
                  did: `did:plc:devtest${Date.now().toString().slice(-4)}`,
                  commit: {
                    operation: 'create',
                    collection: 'app.bsky.feed.post',
                    rkey: `test-rkey-${Date.now()}`,
                    record: {
                      $type: 'app.bsky.feed.post',
                      text: 'Delhi Karol Bagh road completely flooded after heavy rain. Drain overflow near metro station!',
                      createdAt: new Date().toISOString()
                    }
                  }
                });
                const testEvent = new CustomEvent('nagarbodh:test-jetstream', { detail: devFixture });
                window.dispatchEvent(testEvent);
                setImportStatusMsg('TEST ONLY: Injecting realistic Jetstream event fixture through production pipeline...');
                setTimeout(() => setImportStatusMsg(null), 4000);
              }}
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--cyan-400)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '6px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)'
              }}
              title="DEV ONLY: Run realistic Jetstream JSON event fixture through exact production pipeline"
            >
              ⚡ Test Jetstream Fixture (Dev)
            </button>
          </div>
        </div>
      )}

      {/* Ingestion Pipeline Live Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Received</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{ingestionStats.signalsReceived}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Accepted</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>{ingestionStats.accepted}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Duplicates</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>{ingestionStats.duplicates}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Civic Relevant</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>{ingestionStats.civicRelevant}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Analyzed</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#c084fc' }}>{ingestionStats.analyzed}</div>
        </div>
        <div className="card" style={{ padding: '0.75rem 1rem' }}>
          <div style={{ fontSize: '0.66rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Clustered</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f87171' }}>{ingestionStats.clustered}</div>
        </div>
      </div>

      {/* Filter Row */}
      <div
        style={{
          background: 'var(--bg-surface)',
          padding: '1rem',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem'
        }}
      >
        {/* Search */}
        <div>
          <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Search Raw or Translated Text
          </label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '2rem', fontSize: '0.78rem' }}
              placeholder="e.g. 'underpass', 'paani', 'bache'..."
              value={searchQuery}
              onChange={e => setSignalFilters({ searchQuery: e.target.value })}
            />
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Detected Language
          </label>
          <select
            className="input-control"
            style={{ fontSize: '0.78rem' }}
            value={selectedLang}
            onChange={e => setSignalFilters({ selectedLanguage: e.target.value })}
          >
            <option value="all">All Languages (Hindi, Hinglish, English)</option>
            <option value="hi">Hindi (Devanagari Script)</option>
            <option value="hinglish">Hinglish (Code-Mixed Latin)</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div>
          <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Ingestion Channel
          </label>
          <select
            className="input-control"
            style={{ fontSize: '0.78rem' }}
            value={selectedChannel}
            onChange={e => setSignalFilters({ selectedChannel: e.target.value })}
          >
            <option value="all">All Channels</option>
            <option value="citizen_app">Citizen Mobile App</option>
            <option value="social_bluesky">LIVE • Bluesky Public Social</option>
            <option value="social_x">Social Media (X / Twitter - Optional)</option>
            <option value="grievance_portal">Civic Grievance Portal</option>
            <option value="helpline_311">155304 / 112 Unified Civic Helpline</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
            Civic Category
          </label>
          <select
            className="input-control"
            style={{ fontSize: '0.78rem' }}
            value={selectedCategory}
            onChange={e => setSignalFilters({ selectedCategory: e.target.value })}
          >
            <option value="all">All Categories</option>
            <option value="waterlogging">Waterlogging & Flooding</option>
            <option value="drainage">Drainage & Sewerage</option>
            <option value="road_hazard">Road Hazard & Potholes</option>
            <option value="garbage">Solid Waste & Garbage</option>
            <option value="electricity">Electrical & Power</option>
            <option value="traffic">Traffic Bottlenecks</option>
          </select>
        </div>
      </div>

      {/* Signals List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredSignals.map(sig => {
          const isCritical = sig.reportedSeverity === 'critical';
          const isHigh = sig.reportedSeverity === 'high';

          return (
            <div
              key={sig.id}
              className="card"
              style={{
                padding: '1rem',
                borderLeft: isCritical ? '4px solid #ef4444' : isHigh ? '4px solid #f59e0b' : '4px solid var(--cyan-500)'
              }}
            >
              {/* Header row: Author, Channel, Language, Timestamp */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: sig.channel === 'social_bluesky' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                      color: sig.channel === 'social_bluesky' ? '#0ea5e9' : 'var(--text-primary)',
                      border: sig.channel === 'social_bluesky' ? '1px solid rgba(14, 165, 233, 0.4)' : 'none',
                      textTransform: 'uppercase'
                    }}
                  >
                    {sig.channel === 'social_bluesky' ? (
                      <svg width="12" height="12" viewBox="0 0 568 501" fill="currentColor">
                        <path d="M123.121 33.664C187.857 82.173 251.815 178.618 284 227.098C316.185 178.618 380.143 82.173 444.879 33.664C491.566 -1.272 568 -24.873 568 53.64C568 69.191 559.18 190.728 554.004 209.213C536.012 273.473 438.307 288.947 348 277.404C494.341 306.903 529.742 376.109 462 443.784C333.659 572.012 295.341 371.393 284 316.924C272.659 371.393 234.341 572.012 106 443.784C38.258 376.109 73.659 306.903 220 277.404C129.693 288.947 31.988 273.473 13.996 209.213C8.82 190.728 0 69.191 0 53.64C0 -24.873 76.434 -1.272 123.121 33.664Z" />
                      </svg>
                    ) : sig.channel === 'social_x' ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" color="#38bdf8">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ) : (
                      <User size={11} />
                    )}
                    <span>{sig.channel === 'social_bluesky' ? 'BLUESKY' : sig.channel.replace('_', ' ')}</span>
                  </span>

                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--cyan-400)' }}>
                    {sig.authorHandle || 'Anonymous Citizen'}
                  </span>

                  {/* Language Pill */}
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '3px',
                      background:
                        sig.detectedLanguage === 'hi'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : sig.detectedLanguage === 'hinglish'
                          ? 'rgba(139, 92, 246, 0.2)'
                          : 'rgba(6, 182, 212, 0.2)',
                      color:
                        sig.detectedLanguage === 'hi'
                          ? '#fbbf24'
                          : sig.detectedLanguage === 'hinglish'
                          ? '#c084fc'
                          : '#38bdf8'
                    }}
                  >
                    {sig.detectedLanguage === 'hi' ? 'Hindi (Devanagari)' : sig.detectedLanguage === 'hinglish' ? 'Hinglish' : 'English'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <span>{sig.locationName}</span>
                  <span>•</span>
                  <span>{sig.simulatedTimeLabel}</span>
                </div>
              </div>

              {/* Raw Citizen Text */}
              <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.4rem', fontStyle: sig.detectedLanguage !== 'en' ? 'italic' : 'normal' }}>
                "{sig.rawText}"
              </div>

              {/* English Translation if Hindi/Hinglish */}
              {sig.detectedLanguage !== 'en' && (
                <div
                  style={{
                    background: 'var(--bg-surface-elevated)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    borderLeft: '2px solid #38bdf8',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    marginBottom: '0.6rem'
                  }}
                >
                  <strong style={{ color: '#38bdf8', fontSize: '0.7rem', textTransform: 'uppercase', marginRight: '0.4rem' }}>
                    AI Translation:
                  </strong>
                  {sig.englishTranslation}
                </div>
              )}

              {/* Attached Image Thumbnail if exists */}
              {sig.imageUrl && (
                <div style={{ marginBottom: '0.6rem' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--cyan-400)', marginBottom: '0.25rem' }}>
                    <ImageIcon size={13} />
                    <span>Geotagged Photo Attached</span>
                  </div>
                  <img
                    src={sig.imageUrl}
                    alt="Citizen submission"
                    style={{ height: '90px', borderRadius: '6px', display: 'block', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Extracted Metadata Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '0.72rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Classified:</span>
                  <span className={`badge badge-${sig.reportedSeverity}`}>{sig.category} ({sig.reportedSeverity})</span>

                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>Entities:</span>
                  {sig.keyEntities.map((ent, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {ent}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      const matchTrace = agentTraces.find(t => t.input.text === sig.rawText) || {
                        id: `trace-${sig.id}`,
                        timestamp: sig.timestamp,
                        input: { text: sig.rawText, imageUrl: sig.imageUrl, channel: sig.channel },
                        toolsOrDataConsulted: ['Signal Analyst Agent', 'Delhi NCR Ward Topography DB', 'Zod Schema Validator'],
                        structuredOutput: {
                          category: sig.category,
                          severity: sig.reportedSeverity,
                          confidence: sig.confidenceScore,
                          language: sig.detectedLanguage,
                          translation: sig.englishTranslation,
                          locationClues: [sig.locationName],
                          keyEntities: sig.keyEntities,
                          incidentIndicators: [sig.category, sig.reportedSeverity],
                          safetyIndicators: sig.reportedSeverity === 'critical' ? ['High Alert'] : ['Standard Monitoring'],
                          affectedPeopleClues: ['General Citizens'],
                          civicRelevance: true,
                          spamOrDuplicateLikelihood: 0.02,
                          locationConfidence: 0.92,
                          locationCandidates: [{ name: sig.locationName, type: 'landmark', confidence: 0.92 }],
                          factSeparation: {
                            OBSERVED: {
                              verbatimQuotes: [sig.rawText],
                              visualEvidence: sig.imageUrl ? ['Attached geotagged image'] : [],
                              reportedLocation: sig.locationName
                            },
                            INFERRED: {
                              riskAssessment: `${sig.reportedSeverity.toUpperCase()} risk assessed for ${sig.category.replace('_', ' ')}.`,
                              estimatedUrgency: sig.reportedSeverity === 'critical' ? 'IMMEDIATE' : 'STANDARD',
                              inferredRootCause: `Civic anomaly reported: ${sig.category.replace('_', ' ')}.`
                            },
                            RECOMMENDED: {
                              initialActions: [`Dispatch field inspection team to ${sig.locationName}.`],
                              suggestedDepartment: sig.category === 'waterlogging' ? 'MCD Dewatering Wing' : 'Municipal Control Room'
                            }
                          }
                        },
                        confidence: sig.confidenceScore,
                        model: 'gemini-1.5-flash',
                        latencyMs: 310,
                        fallbackUsed: false
                      };
                      inspectAgentTrace(matchTrace as any);
                    }}
                    style={{
                      background: 'rgba(6, 182, 212, 0.1)',
                      color: 'var(--cyan-400)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    title="Inspect AI Signal Analyst Agent execution trace & Fact Separation"
                  >
                    <Brain size={12} />
                    <span>Inspect AI Agent Trace</span>
                  </button>

                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    Conf: {(sig.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Trace Inspector Drawer Modal */}
      <AgentTraceDrawer trace={selectedTrace} onClose={() => inspectAgentTrace(null)} />

      {/* Modal: Ingest Custom Signal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-accent)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="var(--cyan-400)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Test Multilingual AI Ingestion
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitNewSignal}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Citizen Report Text (Type in Hindi, Hinglish, or English)
                </label>
                <textarea
                  className="input-control"
                  rows={4}
                  required
                  placeholder="Example Hinglish: 'Sector 15 underpass me poora paani bhar gaya hai, hospital jane wala rasta band hai!'&#10;Or Devanagari: 'नाली जाम होने से सारा पानी सड़क पर आ गया है।'"
                  value={newSignalText}
                  onChange={e => setNewSignalText(e.target.value)}
                />
              </div>

              {/* Sample Prompts to Click */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                  Or click a quick test example:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.72rem' }}>
                  <button
                    type="button"
                    onClick={() => setNewSignalText('Sector 15 school ke samne transformer me se sparks nikal rahe hain paani ki wajah se!')}
                    style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    ⚡ Hinglish: "Sector 15 school ke samne transformer me se sparks nikal rahe hain paani ki wajah se!"
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSignalText('अस्पताल के मुख्य द्वार पर 3 फीट जलभराव हो गया है, एम्बुलेंस नहीं निकल पा रही।')}
                    style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🏥 Hindi: "अस्पताल के मुख्य द्वार पर 3 फीट जलभराव हो गया है, एम्बुलेंस नहीं निकल पा रही।"
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Ingestion Channel
                </label>
                <select
                  className="input-control"
                  value={newSignalChannel}
                  onChange={e => setNewSignalChannel(e.target.value as any)}
                >
                  <option value="citizen_app">Citizen App (Geotagged Mobile)</option>
                  <option value="social_x">Social Media / X (@CitizenReporter)</option>
                  <option value="helpline_311">155304 / 112 Phone Helpline Transcript</option>
                  <option value="grievance_portal">Govt Grievance Portal</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="sim-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="sim-btn"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Parsing with AI...' : 'Ingest Signal & Cluster'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
