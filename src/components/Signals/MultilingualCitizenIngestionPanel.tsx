import React, { useState } from 'react';
import {
  CheckCircle2,
  Globe,
  Mic,
  MicOff,
  MessageSquare,
  Radio,
  Send,
  Sparkles,
  Volume2
} from 'lucide-react';
import { DevelopmentRequest } from '../../types/development';
import { TextProvider } from '../../engine/ingestion/providers/TextProvider';
import { VoiceProvider } from '../../engine/ingestion/providers/VoiceProvider';
import { MessagingReplayProvider } from '../../engine/ingestion/providers/MessagingReplayProvider';
import { SocialProvider } from '../../engine/ingestion/providers/SocialProvider';
import { ReplayProvider } from '../../engine/ingestion/providers/ReplayProvider';

interface MultilingualCitizenIngestionPanelProps {
  onIngestRequest?: (request: DevelopmentRequest) => void;
}

export const MultilingualCitizenIngestionPanel: React.FC<MultilingualCitizenIngestionPanelProps> = ({
  onIngestRequest
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'messaging' | 'social'>('text');

  // Input states
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastExtractedRequest, setLastExtractedRequest] = useState<DevelopmentRequest | null>(null);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoiceFixtureIdx, setSelectedVoiceFixtureIdx] = useState<number>(0);

  // Messaging state
  const [selectedMsgFixtureIdx, setSelectedMsgFixtureIdx] = useState<number>(0);

  // Sample Language Quick Buttons
  const sampleLanguageTexts = [
    {
      label: 'Hindi',
      text: 'हमारे गांव में अस्पताल बहुत दूर है, आपातकालीन स्थिति में समस्या होती है।',
      lang: 'hi'
    },
    {
      label: 'English',
      text: 'Nearest hospital is 25 km away, need emergency ambulance facility.',
      lang: 'en'
    },
    {
      label: 'Hinglish',
      text: 'Yahan drinking water ka proper arrangement nahi hai, paani ki pipeline leak ho rahi hai.',
      lang: 'hinglish'
    }
  ];

  // Instantiated providers
  const textProvider = new TextProvider('LIVE');
  const voiceProvider = new VoiceProvider('LIVE');
  const messagingProvider = new MessagingReplayProvider();
  const socialProvider = new SocialProvider('LIVE');
  const replayProvider = new ReplayProvider();

  const handleIngestText = async (textToProcess: string) => {
    if (!textToProcess.trim()) return;
    setIsProcessing(true);

    const devReq = await textProvider.ingestRequest(textToProcess);
    setLastExtractedRequest(devReq);
    onIngestRequest?.(devReq);

    setIsProcessing(false);
  };

  const handleIngestVoiceFixture = async (idx: number) => {
    setIsProcessing(true);
    setSelectedVoiceFixtureIdx(idx);

    const fixture = VoiceProvider.SAMPLE_VOICE_FIXTURES[idx];
    const devReq = await voiceProvider.ingestRequest({
      transcriptText: fixture.rawText,
      authorHandle: fixture.authorHandle,
      location: fixture.location,
      isReplayFixture: true
    });

    setLastExtractedRequest(devReq);
    onIngestRequest?.(devReq);
    setIsProcessing(false);
  };

  const handleIngestMessagingFixture = async (idx: number) => {
    setIsProcessing(true);
    setSelectedMsgFixtureIdx(idx);

    const fixture = MessagingReplayProvider.SAMPLE_MESSAGING_FIXTURES[idx];
    const devReq = await messagingProvider.ingestRequest({
      messageText: fixture.rawText,
      senderPhoneOrHandle: fixture.sender,
      locationName: fixture.location,
      isReplayFixture: true
    });

    setLastExtractedRequest(devReq);
    onIngestRequest?.(devReq);
    setIsProcessing(false);
  };

  const handleIngestSocialFixture = async () => {
    setIsProcessing(true);

    const devReq = await socialProvider.ingestRequest({
      id: `social-live-${Date.now()}`,
      rawText: 'Waterlogging flooded major road underpass near Karol Bagh Metro station.',
      sourceChannel: 'SOCIAL',
      locationName: 'Karol Bagh Metro'
    });

    setLastExtractedRequest(devReq);
    onIngestRequest?.(devReq);
    setIsProcessing(false);
  };

  const handleIngestReplayBatch = async () => {
    setIsProcessing(true);

    const list = await replayProvider.fetchBatchRequests();
    if (list.length > 0) {
      setLastExtractedRequest(list[0]);
      list.forEach(r => onIngestRequest?.(r));
    }

    setIsProcessing(false);
  };

  return (
    <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-accent)', borderRadius: '12px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)' }}>
            <Globe size={18} color="var(--cyan-400)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Multilingual Citizen Ingestion Gateway
            </h3>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              BRICS Multi-Channel Ingestion: Voice • Text • Messaging • Social Replay
            </div>
          </div>
        </div>

        {/* Compact 4-Tab Channel Selector */}
        <div style={{ display: 'flex', background: 'var(--bg-canvas)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)', gap: '2px' }}>
          <button
            onClick={() => setActiveTab('voice')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'voice' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'voice' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Mic size={13} />
            <span>Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'text' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'text' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Globe size={13} />
            <span>Text</span>
          </button>

          <button
            onClick={() => setActiveTab('messaging')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'messaging' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'messaging' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <MessageSquare size={13} />
            <span>Messaging</span>
          </button>

          <button
            onClick={() => setActiveTab('social')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'social' ? 'var(--cyan-500)' : 'transparent',
              color: activeTab === 'social' ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Radio size={13} />
            <span>Replay/Social</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: VOICE */}
      {activeTab === 'voice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              VOICE — LIVE / REPLAY
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Multilingual Speech-to-Text & Voice Fixtures
            </span>
          </div>

          {/* Sample Voice Fixtures Buttons */}
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Select Realistic Voice Sample:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {VoiceProvider.SAMPLE_VOICE_FIXTURES.map((fixture, idx) => (
              <div
                key={fixture.id}
                onClick={() => handleIngestVoiceFixture(idx)}
                style={{
                  padding: '0.7rem',
                  borderRadius: '8px',
                  background: selectedVoiceFixtureIdx === idx ? 'var(--civic-blue-50)' : 'var(--bg-canvas)',
                  border: selectedVoiceFixtureIdx === idx ? '1.5px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Volume2 size={16} color="var(--cyan-400)" />
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>[{fixture.language.toUpperCase()}]</strong>: "{fixture.rawText}"
                  </div>
                </div>
                <span style={{ fontSize: '0.66rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--cyan-400)', fontWeight: 700 }}>
                  RUN VOICE AI
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TEXT */}
      {activeTab === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
              TEXT — MULTILINGUAL (HINDI / ENGLISH / HINGLISH)
            </span>
          </div>

          {/* Quick-fill Multilingual Sample Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {sampleLanguageTexts.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(sample.text);
                  handleIngestText(sample.text);
                }}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Load {sample.label} Sample
              </button>
            ))}
          </div>

          {/* Free Text Input Form */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <textarea
              rows={2}
              placeholder="e.g. 'আমাদের বা আমাদের এলাকায়...', 'हमारे गांव में अस्पताल बहुत दूर है', 'Yahan drinking water ka proper arrangement nahi hai'..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem',
                borderRadius: '8px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={() => handleIngestText(inputText)}
              disabled={isProcessing || !inputText.trim()}
              style={{
                padding: '0 1.1rem',
                borderRadius: '8px',
                background: 'var(--cyan-500)',
                border: 'none',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Send size={15} />
              <span>Ingest</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MESSAGING */}
      {activeTab === 'messaging' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
              MESSAGING — REPLAY (WHATSAPP SIMULATION)
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Simulated Citizen Messaging Chat Panel
            </span>
          </div>

          {/* WhatsApp-Style Chat Panel */}
          <div style={{ background: '#0b141a', border: '1px solid #202c33', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MessagingReplayProvider.SAMPLE_MESSAGING_FIXTURES.map((fixture, idx) => (
              <div
                key={fixture.id}
                onClick={() => handleIngestMessagingFixture(idx)}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: selectedMsgFixtureIdx === idx ? '#111b21' : '#182229',
                  border: selectedMsgFixtureIdx === idx ? '1.5px solid #00a884' : '1px solid #222d34',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#00a884', fontWeight: 700 }}>
                  <span>{fixture.sender}</span>
                  <span style={{ color: '#8696a0' }}>LANG: {fixture.language.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#e9edef' }}>
                  "{fixture.rawText}"
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8696a0', marginTop: '2px' }}>
                  Demand Theme: <strong>{fixture.demandTheme}</strong> • Location: <strong>{fixture.location}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: REPLAY / SOCIAL */}
      {activeTab === 'social' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
              SOCIAL / REPLAY — FIREHOSE STREAM
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handleIngestSocialFixture}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--cyan-400)',
                color: 'var(--cyan-400)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Radio size={15} />
              <span>Simulate Live Bluesky Post</span>
            </button>

            <button
              onClick={handleIngestReplayBatch}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <Sparkles size={15} color="var(--amber-400)" />
              <span>Run Full Replay Dataset</span>
            </button>
          </div>
        </div>
      )}

      {/* VISIBLE GEMINI AI EXTRACTION CARD */}
      {lastExtractedRequest && (
        <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', fontWeight: 800, color: 'var(--cyan-400)', textTransform: 'uppercase' }}>
              <Sparkles size={14} />
              Gemini AI Structured Request Extraction Output
            </div>
            <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
              REQ #{lastExtractedRequest.id}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', fontSize: '0.74rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>LANGUAGE DETECTED:</span>
              <div style={{ fontWeight: 800, color: 'var(--cyan-400)' }}>
                {lastExtractedRequest.language.toUpperCase()}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>CATEGORY CLASSIFIED:</span>
              <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                {lastExtractedRequest.category}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>DEMAND INTENSITY:</span>
              <div style={{ fontWeight: 800, color: lastExtractedRequest.demandIntensity >= 0.8 ? '#f87171' : 'var(--amber-400)' }}>
                {(lastExtractedRequest.demandIntensity * 100).toFixed(0)}% ({lastExtractedRequest.urgency?.toUpperCase()})
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '0.5rem', borderRadius: '6px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.66rem' }}>EXTRACTED LOCATION:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {lastExtractedRequest.location.locationName || lastExtractedRequest.location.district}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
