import React, { useState, useEffect } from 'react';
import { AlertCircle, CloudRain, Droplets, Info, RefreshCw, Radio, AlertTriangle } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const WeatherBanner: React.FC = () => {
  const { currentStep, ingestionMode, liveWeatherEnvelope, refreshWeather } = useCivic();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setTick] = useState(0);

  // Force re-render every 10 seconds to update "X seconds ago" freshness counter
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshWeather();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Determine whether to show live weather or simulation step weather
  const isLiveMode = ingestionMode === 'LIVE';
  const liveData = liveWeatherEnvelope?.data;
  const liveModeStatus = liveWeatherEnvelope?.mode || (isLiveMode ? 'live' : 'simulation');
  const hasError = isLiveMode && liveModeStatus === 'error';

  const condition = isLiveMode && liveData ? liveData.condition : 'Monsoon Overcast';
  const description = isLiveMode && liveData ? (liveData.description || liveData.alertDescription) : currentStep.weatherCondition.description;
  const alertLevel = isLiveMode && liveData ? liveData.alertLevel : currentStep.weatherCondition.alertLevel;
  const rainfallMm = isLiveMode && liveData ? (liveData.precipitationMmPerHour ?? 0) : currentStep.weatherCondition.rainfallMmPerHour;
  const stationName = isLiveMode && liveData ? liveData.stationName : 'Simulation Baseline Station';
  const tempCelsius = isLiveMode && liveData ? liveData.temperatureCelsius : null;

  const isAlert = alertLevel === 'orange' || alertLevel === 'red' || hasError;

  // Calculate freshness label
  let freshnessLabel = 'Simulation Static Baseline';
  if (isLiveMode && liveWeatherEnvelope) {
    if (liveWeatherEnvelope.timestamp) {
      const elapsedMs = Date.now() - new Date(liveWeatherEnvelope.timestamp).getTime();
      const elapsedSec = Math.max(0, Math.floor(elapsedMs / 1000));
      if (elapsedSec < 60) {
        freshnessLabel = `Fetched ${elapsedSec}s ago`;
      } else {
        const mins = Math.floor(elapsedSec / 60);
        freshnessLabel = `Fetched ${mins}m ago`;
      }
    } else {
      freshnessLabel = liveWeatherEnvelope.dataFreshness || 'Live Feed';
    }
  }

  return (
    <div
      className="weather-alert-strip"
      style={{
        background: hasError
          ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.2) 100%)'
          : alertLevel === 'red'
          ? 'linear-gradient(90deg, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.25) 100%)'
          : alertLevel === 'orange'
          ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)'
          : 'linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
        borderBottom: isAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.45rem 1rem',
        fontSize: '0.8rem'
      }}
    >
      {/* Left Section: Mode Badge, Title & Condition */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {/* Mode Pill Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            fontSize: '0.65rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            background: hasError
              ? 'rgba(239, 68, 68, 0.25)'
              : isLiveMode && liveModeStatus === 'live'
              ? 'rgba(16, 185, 129, 0.25)'
              : 'rgba(245, 158, 11, 0.25)',
            color: hasError
              ? '#fca5a5'
              : isLiveMode && liveModeStatus === 'live'
              ? '#34d399'
              : '#fbbf24',
            border: hasError
              ? '1px solid rgba(239, 68, 68, 0.5)'
              : isLiveMode && liveModeStatus === 'live'
              ? '1px solid rgba(16, 185, 129, 0.5)'
              : '1px solid rgba(245, 158, 11, 0.5)'
          }}
        >
          {isLiveMode && liveModeStatus === 'live' ? (
            <>
              <Radio size={10} className="pulse" /> LIVE OPENWEATHER
            </>
          ) : hasError ? (
            <>
              <AlertTriangle size={10} /> WEATHER API ERROR
            </>
          ) : (
            <>
              <Info size={10} /> SIMULATION MODE
            </>
          )}
        </span>

        {/* Alert / Warning Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAlert ? <AlertCircle size={15} color="#f87171" /> : <CloudRain size={15} color="#38bdf8" />}
          <span style={{ fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {hasError
              ? 'WEATHER API ERROR'
              : alertLevel === 'red'
              ? 'IMD RED ALERT: Flash Waterlogging'
              : alertLevel === 'orange'
              ? 'IMD ORANGE WARNING: Heavy Downpour'
              : `IMD WEATHER: ${condition.toUpperCase()}`}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.74rem' }}>
            — {hasError ? liveWeatherEnvelope?.error || 'Failed to fetch OpenWeather API' : description}
          </span>
        </div>
      </div>

      {/* Right Section: Telemetry Metrics & Manual Refresh Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.73rem' }}>
        {tempCelsius !== null && tempCelsius !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Temp: <strong style={{ color: '#fff' }}>{tempCelsius}°C</strong></span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Droplets size={13} color="#38bdf8" />
          <span>Precipitation: <strong style={{ color: '#fff' }}>{rainfallMm} mm/hr</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }} title={stationName}>
          <span>{freshnessLabel}</span>
        </div>

        {/* Manual Refresh Action Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Fetch latest OpenWeather data"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            padding: '0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            fontSize: '0.7rem'
          }}
        >
          <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};
