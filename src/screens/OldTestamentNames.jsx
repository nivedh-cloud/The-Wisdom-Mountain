import React, { useState } from 'react';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import { FaCrown } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import namesOfGodData from '../assets/data/namesOfGodData.json';

const OldTestamentNames = ({ lang }) => {
  const { isDarkMode } = useTheme();
  const [selectedName, setSelectedName] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const oldTestamentNames = namesOfGodData.oldTestamentNames || [];
  const headers = namesOfGodData.tableHeaders?.[lang] || namesOfGodData.tableHeaders?.en || {};

  const handleNameClick = (name) => {
    setSelectedName(name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedName(null);
  };

  // Prepare data for DataGrid
  const gridData = (oldTestamentNames || []).map(name => ({
    name: lang === 'te' ? (name?.nameTelugu || name?.name) : (name?.name || ''),
    meaning: name?.meaning?.[lang] || '',
    reference: name?.reference?.[lang] || '',
    description: name?.description?.[lang] || '',
    category: lang === 'te' ? (name?.categoryTelugu || name?.category) : (name?.category || ''),
    _originalData: name // Keep original data for modal
  }));

  // Define columns for DataGrid
  const columns = [
    {
      dataKey: 'name',
      header: headers.name,
      width: '20%',
      clickable: true
    },
    {
      dataKey: 'meaning',
      header: headers.meaning,
      width: '25%'
    },
    {
      dataKey: 'reference',
      header: headers.reference,
      width: '20%'
    },
    {
      dataKey: 'description',
      header: headers.description,
      width: '30%',
      truncate: 100
    },
    {
      dataKey: 'category',
      header: lang === 'te' ? 'వర్గం' : 'Category',
      width: '15%'
    }
  ];

  // Handle cell click for names
  const handleCellClick = (rowData, columnKey) => {
    if (columnKey === 'name') {
      setSelectedName(rowData._originalData);
      setIsModalOpen(true);
    }
  };

  return (
    <div style={{
      padding: '20px',
      backgroundColor: isDarkMode ? '#1a1a2e' : '#f8fafc',
      minHeight: '100vh'
    }}>
      <DataGrid
        data={gridData}
        columns={columns}
        translations={headers}
        lang={lang}
        title={lang === 'te' ? 'పాత నిబంధన దేవుని నామాలు' : 'Old Testament Names of God'}
        icon={{
          Icon: FaCrown,
          color: '#8b5cf6'
        }}
        onCellClick={handleCellClick}
        chartConfig={null} // Remove chart functionality
      />

      {/* Modal for detailed view */}
      {isModalOpen && selectedName && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: isDarkMode ? '#1e293b' : 'white',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              color: 'white'
            }}>
              <FaCrown style={{ fontSize: '2rem', color: '#fbbf24' }} />
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem' }}>
                  {lang === 'te' ? selectedName.nameTelugu : selectedName.name}
                </h2>
                <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>
                  {selectedName.meaning[lang]}
                </p>
              </div>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  color: isDarkMode ? '#8b5cf6' : '#6366f1',
                  borderBottom: `2px solid ${isDarkMode ? '#8b5cf6' : '#6366f1'}`,
                  paddingBottom: '8px',
                  marginBottom: '15px'
                }}>
                  {lang === 'te' ? 'సూత్రధార వచనం' : 'Scripture Reference'}
                </h3>
                <p style={{ 
                  fontSize: '1.1rem',
                  padding: '10px',
                  backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${isDarkMode ? '#8b5cf6' : '#6366f1'}`
                }}>
                  {selectedName.reference[lang]}
                </p>
              </div>

              <div>
                <h3 style={{ 
                  color: isDarkMode ? '#8b5cf6' : '#6366f1',
                  borderBottom: `2px solid ${isDarkMode ? '#8b5cf6' : '#6366f1'}`,
                  paddingBottom: '8px',
                  marginBottom: '15px'
                }}>
                  {lang === 'te' ? 'వివరణ' : 'Description'}
                </h3>
                <p style={{ 
                  lineHeight: '1.6',
                  fontSize: '1rem',
                  textAlign: 'left'
                }}>
                  {selectedName.description[lang]}
                </p>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h3 style={{ 
                  color: isDarkMode ? '#8b5cf6' : '#6366f1',
                  borderBottom: `2px solid ${isDarkMode ? '#8b5cf6' : '#6366f1'}`,
                  paddingBottom: '8px',
                  marginBottom: '15px'
                }}>
                  {lang === 'te' ? 'వర్గం' : 'Category'}
                </h3>
                <p style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: isDarkMode ? '#8b5cf6' : '#6366f1',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}>
                  {lang === 'te' ? selectedName.categoryTelugu : selectedName.category}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OldTestamentNames;
