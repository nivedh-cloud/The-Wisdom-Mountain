import React from 'react';
import { FaCrown } from 'react-icons/fa';
import { GiCrownCoin } from 'react-icons/gi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend, Cell } from 'recharts';
import DataGrid from '../components/DataGrid';
import kingsData from '../assets/data/kingsData.json';
import menuConfig from '../assets/data/menuConfig.json';
import { useTheme } from '../contexts/ThemeContext';

export default function KingsGrid({ lang, section = 'judah-kings' }) {
  const { isDarkMode } = useTheme();
  
  // Load menu config for icon and color
  const kingsMenu = menuConfig.menus.kings.find(m => m.key === section) || {};
  const Icon = kingsMenu.icon === 'GiCrownCoin' ? GiCrownCoin : FaCrown;
  const iconColor = kingsMenu.iconColor || '#6366f1';

  const t = (kingsData.tableHeaders && kingsData.tableHeaders[lang]) || kingsData.tableHeaders.en;
  const data = kingsData[section].map(king => ({
    king: lang === 'te' ? king.kingTelugu : king.king,
    year: lang === 'te' ? king.yearTelugu : king.year,
    yearsRuled: lang === 'te' ? king.yearsRuledTelugu : king.yearsRuled,
    goodBad: lang === 'te' ? king.goodBadTelugu : king.goodBad,
    prophet: lang === 'te' ? king.prophetTelugu : king.prophet
  }));

  // Color categorization for kings based on Good/Bad/Repented status
  const getKingCategoryColor = (goodBad) => {
    const goodBadMapped = lang === 'te' ? {
      'మంచి': '#22c55e',
      'చెడు': '#ef4444',
      'మిశ్రమ': '#f59e0b',
      'పశ్చాత్తాపపడిన': '#8b5cf6'
    } : {
      'Good': '#22c55e',
      'Bad': '#ef4444',
      'Good/Bad': '#f59e0b',
      'Bad/Repented': '#8b5cf6'
    };
    return goodBadMapped[goodBad] || '#6b7280';
  };

  // Get category label
  const getCategoryLabel = (goodBad) => {
    const labels = {
      'Good': lang === 'te' ? 'మంచి రాజులు' : 'Good Kings',
      'Bad': lang === 'te' ? 'చెడ్డ రాజులు' : 'Bad Kings',
      'Good/Bad': lang === 'te' ? 'మిశ్రమ రాజులు' : 'Mixed Kings',
      'Bad/Repented': lang === 'te' ? 'పశ్చాత్తాపపడిన రాజులు' : 'Repented Kings'
    };
    return labels[goodBad] || goodBad;
  };

  // Prepare chart data with colors
  const chartData = data.map(king => ({
    ...king,
    color: getKingCategoryColor(king.goodBad),
    category: getCategoryLabel(king.goodBad)
  }));

  // Custom chart renderer for kings with color categorization
  const renderKingsChart = () => {
    const colors = {
      primary: isDarkMode ? '#818cf8' : '#6366f1',
      background: isDarkMode ? '#1e293b' : '#ffffff',
      text: isDarkMode ? '#e2e8f0' : '#334155',
      border: isDarkMode ? '#334155' : '#e5e7eb'
    };

    // Create legend data
    const legendData = [
      { value: lang === 'te' ? 'మంచి రాజులు' : 'Good Kings', color: '#22c55e' },
      { value: lang === 'te' ? 'చెడ్డ రాజులు' : 'Bad Kings', color: '#ef4444' },
      { value: lang === 'te' ? 'మిశ్రమ రాజులు' : 'Mixed Kings', color: '#f59e0b' },
      { value: lang === 'te' ? 'పశ్చాత్తాపపడిన రాజులు' : 'Repented Kings', color: '#8b5cf6' }
    ];

    return (
      <div className="chart-container" style={{ height: '500px', width: '100%' }}>
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
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="king"
              angle={-45} 
              textAnchor="end" 
              interval={0} 
              height={100}
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
                        {data.king}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'సంవత్సరం: ' : 'Year: '}</strong>
                        {data.year}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'పాలించిన సంవత్సరాలు: ' : 'Years Ruled: '}</strong>
                        {data.yearsRuled}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>{lang === 'te' ? 'వర్గం: ' : 'Category: '}</strong>
                        <span style={{ color: data.color, fontWeight: 'bold' }}>
                          {data.category}
                        </span>
                      </div>
                      <div>
                        <strong>{lang === 'te' ? 'ప్రవక్త: ' : 'Prophet: '}</strong>
                        {data.prophet}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="yearsRuled">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList 
                dataKey="yearsRuled" 
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

  // Define columns for the kings grid
  const columns = [
    {
      header: t.king,
      dataKey: 'king'
    },
    {
      header: t.year,
      dataKey: 'year'
    },
    {
      header: t.yearsRuled,
      dataKey: 'yearsRuled'
    },
    {
      header: t.goodBad,
      dataKey: 'goodBad'
    },
    {
      header: t.prophet,
      dataKey: 'prophet'
    }
  ];

  // Custom row renderer to show color indicators
  const customRowRenderer = (row, rowIndex, tooltipHandlers = {}) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseMove } = tooltipHandlers;
    const categoryColor = getKingCategoryColor(row.goodBad);
    
    return (
      <tr key={rowIndex} className="data-row">
        {columns.map((column, colIndex) => {
          const value = row[column.dataKey];
          
          // Special handling for goodBad column to show color indicator
          if (column.dataKey === 'goodBad') {
            return (
              <td 
                key={colIndex} 
                className="table-cell"
                onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
                onMouseLeave={handleMouseLeave || undefined}
                onMouseMove={handleMouseMove || undefined}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: categoryColor,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }}></div>
                  <span style={{ 
                    color: categoryColor, 
                    fontWeight: '600' 
                  }}>
                    {value}
                  </span>
                </div>
              </td>
            );
          }
          
          // Regular cell rendering
          return (
            <td 
              key={colIndex} 
              className="table-cell"
              onMouseEnter={handleMouseEnter ? (e) => handleMouseEnter(e, value) : undefined}
              onMouseLeave={handleMouseLeave || undefined}
              onMouseMove={handleMouseMove || undefined}
            >
              {value}
            </td>
          );
        })}
      </tr>
    );
  };

  // Enhanced chart configuration with custom renderer
  const chartConfig = {
    dataKey: 'yearsRuled',
    xDataKey: 'king',
    label: t.chartLabel,
    xLabel: t.king,
    yLabel: t.chartLabel,
    customRenderer: renderKingsChart
  };

  // Get the appropriate title based on section
  const getTitle = () => {
    if (section === 'judah-kings') {
      return t.judahTitle || 'Judah Kings';
    } else if (section === 'israel-kings') {
      return t.israelTitle || 'Israel Kings';
    }
    return t.title || 'Kings';
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
        translations={t}
        lang={lang}
        title={getTitle()}
        icon={iconConfig}
        chartConfig={chartConfig}
        customRowRenderer={customRowRenderer}
      />
    </div>
  );
}
