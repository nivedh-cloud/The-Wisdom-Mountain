import React from 'react';
import { FaClock } from 'react-icons/fa';
import DataGrid from '../components/DataGrid';
import keyErasData from '../assets/data/keyErasData.json';
import menuConfig from '../assets/data/menuConfig.json';

export default function KeyErasGrid({ lang, section = 'united-kingdom' }) {
  // Load menu config for icon and color
  const keyErasMenu = menuConfig.menus.keyeras.find(m => m.key === section) || {};
  const Icon = FaClock;
  const iconColor = '#f59e0b';

  // Create table headers for key eras
  const t = {
    en: {
      era: 'Era',
      period: 'Time Period',
      duration: 'Duration (Years)',
      keyFigures: 'Key Figures',
      significance: 'Significance',
      title: 'Biblical Key Eras',
      chartLabel: 'Era Duration (Years)'
    },
    te: {
      era: 'యుగం',
      period: 'కాలం',
      duration: 'వ్యవధి (సంవత్సరాలు)',
      keyFigures: 'ముఖ్య వ్యక్తులు',
      significance: 'ప్రాముఖ్యత',
      title: 'ముఖ్య యుగాలు',
      chartLabel: 'యుగ వ్యవధి (సంవత్సరాలు)'
    }
  };

  const translations = t[lang] || t.en;
  
  // Transform key eras data for DataGrid
  const data = keyErasData.keyEras.map((era, index) => ({
    era: lang === 'te' ? era.nameTelugu || era.name : era.name,
    period: era.period || era.dateRange || 'Ancient Times',
    duration: era.duration || calculateDuration(era.period) || (50 + index * 25), // Fallback calculation
    keyFigures: Array.isArray(era.keyFigures) 
      ? era.keyFigures.slice(0, 3).join(', ') 
      : era.keyFigures || 'Various',
    significance: era.description && era.description[lang] 
      ? era.description[lang].substring(0, 60) + '...' 
      : era.significance && era.significance[lang]
      ? era.significance[lang].substring(0, 60) + '...'
      : 'Historical significance',
    // Keep original data for detailed view
    _original: era
  }));

  // Helper function to calculate duration from period string
  function calculateDuration(period) {
    if (!period) return null;
    
    // Try to extract years from period strings like "1050-1010 BC"
    const matches = period.match(/(\d+).*?(\d+)/);
    if (matches && matches.length >= 3) {
      const start = parseInt(matches[1]);
      const end = parseInt(matches[2]);
      return Math.abs(start - end);
    }
    return null;
  }

  // Define columns for the key eras grid
  const columns = [
    {
      header: translations.era,
      dataKey: 'era'
    },
    {
      header: translations.period,
      dataKey: 'period'
    },
    {
      header: translations.duration,
      dataKey: 'duration'
    },
    {
      header: translations.keyFigures,
      dataKey: 'keyFigures'
    },
    {
      header: translations.significance,
      dataKey: 'significance'
    }
  ];

  // Chart configuration
  const chartConfig = {
    dataKey: 'duration',
    xDataKey: 'era',
    label: translations.chartLabel,
    xLabel: translations.era,
    yLabel: translations.chartLabel
  };

  // Icon configuration
  const iconConfig = {
    Icon: Icon,
    color: iconColor
  };

  return (
    <div style={{ 
      height: '100%', 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <DataGrid
        data={data}
        columns={columns}
        translations={translations}
        lang={lang}
        title={translations.title}
        icon={iconConfig}
        chartConfig={chartConfig}
      />
    </div>
  );
}
