import React from 'react';
import { AlertCircle, CloudRain, Droplets, Info } from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const WeatherBanner: React.FC = () => {
  const { currentStep } = useCivic();
  const weather = currentStep.weatherCondition;

  const isAlert = weather.alertLevel === 'orange' || weather.alertLevel === 'red';

  return (
    <div
      className="weather-alert-strip"
      style={{
        background:
          weather.alertLevel === 'red'
            ? 'linear-gradient(90deg, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.25) 100%)'
            : weather.alertLevel === 'orange'
            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.25) 100%)'
            : 'linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
        borderBottom: isAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        {isAlert ? <AlertCircle size={15} color="#f87171" /> : <CloudRain size={15} color="#38bdf8" />}
        <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
          {weather.alertLevel === 'red'
            ? 'IMD RED ALERT: Flash Waterlogging & Convective Cloudburst Active'
            : weather.alertLevel === 'orange'
            ? 'IMD ORANGE WARNING: Heavy Monsoon Downpour Active'
            : 'METEOROLOGICAL TELEMETRY: Standard Precipitation Monitoring'}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.74rem' }}>
          — {weather.description}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontFamily: 'var(--font-mono)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Droplets size={13} color="#38bdf8" />
          <span>Precipitation: <strong style={{ color: '#fff' }}>{weather.rainfallMmPerHour} mm/hr</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          <Info size={13} />
          <span>Critical Runoff Threshold: 30 mm/hr</span>
        </div>
      </div>
    </div>
  );
};
