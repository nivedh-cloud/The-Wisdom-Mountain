import React, { useState } from 'react';
import { FaCrown, FaInfoCircle } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import postExilicData from '../assets/data/postExilicRulers.json';
import menuConfig from '../assets/data/menuConfig.json';
import { useTheme } from '../contexts/ThemeContext';

export default function PostExilicGrid({ lang, section = 'post-exilic-period' }) {
  const { isDarkMode } = useTheme();
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);

  // Load menu config for icon and color
  const kingsMenu = menuConfig.menus.kings.find(m => m.key === section) || {};
  const Icon = FaCrown;
  const iconColor = kingsMenu.iconColor || '#8b5cf6';

  const t = (postExilicData.tableHeaders && postExilicData.tableHeaders[lang]) || postExilicData.tableHeaders.en;
  
  const data = postExilicData.postExilicRulers.map(ruler => ({
    ruler: lang === 'te' ? ruler.rulerTelugu : ruler.ruler,
    period: lang === 'te' ? ruler.periodTelugu : ruler.period,
    empire: lang === 'te' ? ruler.empireTelugu : ruler.empire,
    yearsRuled: ruler.yearsRuled,
    biblicalFigures: lang === 'te' ? ruler.biblicalFiguresTelugu : ruler.biblicalFigures,
    significance: lang === 'te' ? ruler.significanceTelugu : ruler.significance,
    // Keep original numeric values for chart regardless of language
    yearsRuledNumeric: ruler.yearsRuled,
    // Keep original empire name for color mapping
    originalEmpire: ruler.empire,
    // Use unique ID for lookup instead of name
    _rulerId: ruler.id,
    // Keep original data for detailed view
    _originalData: ruler
  }));

  // Function to handle ruler name click
  const handleRulerClick = (rulerId) => {
    const rulerDetail = postExilicData.postExilicRulers.find(r => r.id === rulerId);
    if (rulerDetail) {
      setSelectedLeader(rulerDetail);
      setShowLeaderModal(true);
    }
  };

  // Chart data for visualization - grouped by Empire
  const chartData = (() => {
    const empireGroups = {};
    
    // Group rulers by empire and calculate total years
    data.forEach(ruler => {
      const empireKey = ruler.empire;
      if (!empireGroups[empireKey]) {
        empireGroups[empireKey] = {
          name: empireKey,
          totalYears: 0,
          rulerCount: 0,
          rulers: []
        };
      }
      empireGroups[empireKey].totalYears += ruler.yearsRuledNumeric;
      empireGroups[empireKey].rulerCount += 1;
      empireGroups[empireKey].rulers.push(ruler.ruler);
    });
    
    // Convert to chart format with colors based on total years
    return Object.values(empireGroups).map(empire => ({
      name: empire.name.length > 15 ? empire.name.substring(0, 15) + '...' : empire.name,
      fullName: empire.name,
      years: empire.totalYears,
      rulerCount: empire.rulerCount,
      rulers: empire.rulers,
      fill: empire.totalYears > 200 ? '#10b981' : empire.totalYears > 100 ? '#f59e0b' : empire.totalYears > 50 ? '#3b82f6' : '#ef4444'
    })).sort((a, b) => b.years - a.years); // Sort by total years descending
  })();

  // Get the appropriate title
  const getTitle = () => {
    return t.title || 'Post-Exilic Period Rulers';
  };

  const columns = [
    {
      header: t.ruler,
      dataKey: 'ruler',
      render: (value, row) => (
        <button
          onClick={() => handleRulerClick(row._rulerId)}
          className="text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
          style={{ color: isDarkMode ? '#60a5fa' : '#2563eb' }}
        >
          {value}
        </button>
      )
    },
    {
      header: t.period,
      dataKey: 'period'
    },
    {
      header: t.empire,
      dataKey: 'empire'
    },
    {
      header: t.yearsRuled,
      dataKey: 'yearsRuled'
    },
    {
      header: t.biblicalFigures,
      dataKey: 'biblicalFigures',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      header: t.significance,
      dataKey: 'significance',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    }
  ];

  // Custom chart renderer showing individual rulers as vertical bars (like KingsGrid)
  const renderEmpireChart = () => {
    console.log('renderEmpireChart called');
    console.log('data:', data);
    
    const colors = {
      primary: isDarkMode ? '#818cf8' : '#6366f1',
      background: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#e2e8f0' : '#334155',
      border: isDarkMode ? '#334155' : '#e5e7eb'
    };

    // Empire colors for individual rulers (support both English and Telugu names)
    const empireColors = {
      'Babylonian Empire': '#e74c3c',
      'బాబిలోనియన్ సామ్రాజ్యం': '#e74c3c',
      'Persian Empire': '#f39c12',
      'పర్షియన్ సామ్రాజ్యం': '#f39c12',
      'Greek Empire': '#3498db',
      'గ్రీకు సామ్రాజ్యం': '#3498db',
      'Roman Empire': '#9b59b6',
      'రోమన్ సామ్రాజ్యం': '#9b59b6'
    };

    // Empire legend data with Telugu translations
    const empireTranslations = {
      'Babylonian Empire': lang === 'te' ? 'బాబిలోనియన్ సామ్రాజ్యం' : 'Babylonian Empire',
      'Persian Empire': lang === 'te' ? 'పర్షియన్ సామ్రాజ్యం' : 'Persian Empire',
      'Greek Empire': lang === 'te' ? 'గ్రీకు సామ్రాజ్యం' : 'Greek Empire',
      'Roman Empire': lang === 'te' ? 'రోమన్ సామ్రాజ్యం' : 'Roman Empire'
    };

    // Prepare chart data with individual rulers and their empire colors
    const chartData = data.map(ruler => ({
      ...ruler,
      color: empireColors[ruler.originalEmpire] || colors.primary,
      yearsRuledNumeric: parseInt(ruler.yearsRuled) || 0
    }));

    console.log('chartData:', chartData);

    if (chartData.length === 0) {
      return (
        <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-4">No Chart Data Available</h3>
          <p>Unable to generate chart data from the current dataset.</p>
        </div>
      );
    }

    // Create legend data for empires with proper translations
    const legendData = Object.entries(empireTranslations).map(([empireKey, displayName]) => ({
      value: displayName,
      color: empireColors[empireKey]
    }));

    return (
      <div className="chart-container" style={{ height: '600px', width: '100%' }}>
        {/* Custom Legend */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {legendData.map((item, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                backgroundColor: item.color,
                borderRadius: '4px'
              }}></div>
              <span style={{ 
                color: colors.text, 
                fontWeight: '500',
                fontSize: '14px'
              }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <XAxis 
              dataKey="ruler"
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={80}
              tick={{ fill: colors.text, fontSize: 11 }}
            />
            <YAxis 
              label={{ 
                value: lang === 'te' ? 'పాలించిన సంవత్సరాలు' : 'Years Ruled', 
                angle: -90, 
                position: 'insideLeft', 
                fill: colors.primary, 
                fontWeight: 'bold' 
              }}
              tick={{ fill: colors.text }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div style={{
                      backgroundColor: colors.background,
                      border: `2px solid ${colors.border}`,
                      borderRadius: '12px',
                      padding: '16px',
                      color: colors.text,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      minWidth: '200px'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '16px', 
                        marginBottom: '8px',
                        color: data.color
                      }}>
                        {data.ruler}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'కాలం: ' : 'Period: '}</strong>
                        {data.period}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'పాలించిన సంవత్సరాలు: ' : 'Years Ruled: '}</strong>
                        {data.yearsRuled}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'సామ్రాజ్యం: ' : 'Empire: '}</strong>
                        <span style={{ color: data.color, fontWeight: 'bold' }}>
                          {data.empire}
                        </span>
                      </div>
                      <div>
                        <strong>{lang === 'te' ? 'ప్రాముఖ్యత: ' : 'Significance: '}</strong>
                        <div style={{ fontSize: '12px', marginTop: '4px', maxWidth: '250px' }}>
                          {data.significance}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="yearsRuledNumeric">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="yearsRuledNumeric" 
                position="top" 
                fill={colors.text}
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Enhanced chart configuration with custom renderer
  const chartConfig = {
    dataKey: 'yearsRuledNumeric', // Use individual ruler years
    xDataKey: 'ruler',
    label: lang === 'te' ? 'పాలకుల పాలన కాలం' : 'Rulers by Years Ruled',
    xLabel: lang === 'te' ? 'పాలకుడు' : 'Ruler',
    yLabel: lang === 'te' ? 'సంవత్సరాలు' : 'Years',
    customRenderer: renderEmpireChart
  };

  return (
    <div className="post-exilic-grid">
      

      <DataGrid
        data={data}
        columns={columns}
        title={getTitle()}
        lang={lang}
        chartConfig={chartConfig}
      />

      {/* Leader Details Modal */}
      <Modal
        isOpen={showLeaderModal}
        onClose={() => setShowLeaderModal(false)}
        title={selectedLeader ? (lang === 'te' ? selectedLeader.rulerTelugu : selectedLeader.ruler) : ''}
      >
        {selectedLeader && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                  {lang === 'te' ? 'పాత్র' : 'Role'}
                </h4>
                <p>{lang === 'te' ? selectedLeader.empireTelugu : selectedLeader.empire}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                  {lang === 'te' ? 'పాలన కాలం' : 'Reign Period'}
                </h4>
                <p>{selectedLeader.period}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                  {lang === 'te' ? 'పాలన సంవత్సరాలు' : 'Years Ruled'}
                </h4>
                <p>{selectedLeader.yearsRuled} {lang === 'te' ? 'సంవత్సరాలు' : 'years'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                {lang === 'te' ? 'చారిత్రిక ప్రాముఖ్యత' : 'Historical Significance'}
              </h4>
              <p className="mt-2">
                {lang === 'te' ? selectedLeader.significanceTelugu : selectedLeader.significance}
              </p>
            </div>
            {selectedLeader.biblicalReferences && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                  {lang === 'te' ? 'బైబిలు సూచనలు' : 'Biblical References'}
                </h4>
                <p className="text-blue-600 dark:text-blue-400 mt-2">
                  {selectedLeader.biblicalReferences}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
