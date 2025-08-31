import React from 'react';
import { FaMapMarkerAlt, FaMap } from 'react-icons/fa';
import DataGrid from '../components/DataGrid';
import Modal from '../components/Modal';
import mapsData from '../assets/data/mapsData.json';
import menuConfig from '../assets/data/menuConfig.json';
import translationsData from '../assets/data/translations.json';

export default function MapsGrid({ lang, section = 'old-testament-maps' }) {
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [selectedDetails, setSelectedDetails] = React.useState(null);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);

  const translations = translationsData[lang] || translationsData.en;

  // Get data based on section
  let rawData = [];
  if (section === 'old-testament-maps') {
    rawData = mapsData.oldTestamentMaps || [];
  } else if (section === 'new-testament-maps') {
    rawData = mapsData.newTestamentMaps || [];
  } else {
    // Default to all maps
    rawData = [...(mapsData.oldTestamentMaps || []), ...(mapsData.newTestamentMaps || [])];
  }

  // Transform data for DataGrid with special values for icons
  const transformedData = rawData.map(item => ({
    title: lang === 'te' ? (item.titleTelugu || item.title) : item.title,
    period: item.period,
    modernLocation: item.modernLocation,
    scripture: item.scripture,
    details: item.imageFile ? 'MAP_ICON' : (item.description || item.significance) ? 'DETAILS_ICON' : '-',
    _original: item // Store original data for modal
  }));

  // Define columns for the maps grid
  const columns = [
    {
      header: translations?.maps?.map || 'Map',
      dataKey: 'title'
    },
    {
      header: 'Period',
      dataKey: 'period'
    },
    {
      header: translations?.common?.location || 'Location',
      dataKey: 'modernLocation'
    },
    {
      header: 'Scripture',
      dataKey: 'scripture'
    },
    {
      header: translations?.common?.details || 'Details',
      dataKey: 'details',
      customDisplayValue: (value) => {
        if (value === 'MAP_ICON' || value === 'DETAILS_ICON') {
          return value; // Keep it for custom renderer
        }
        return value;
      }
    }
  ];

  // Custom row renderer for maps with icons
  const customRowRenderer = (row, rowIndex) => {
    return (
      <tr key={rowIndex} className="data-row">
        {columns.map((column, colIndex) => {
          const value = row[column.dataKey];
          
          // Special handling for details column - show map icon if image available, otherwise details icon
          if (value === 'MAP_ICON') {
            return (
              <td key={colIndex} className="table-cell text-center">
                <FaMap
                  onClick={() => handleMapClick(row)}
                  className="details-icon"
                  title="View Map Image"
                  style={{ cursor: 'pointer', color: '#10b981', fontSize: '18px' }}
                />
              </td>
            );
          }
          
          // Special handling for details icon column
          if (value === 'DETAILS_ICON') {
            return (
              <td key={colIndex} className="table-cell text-center">
                <FaMapMarkerAlt
                  onClick={() => handleDetailsClick(row)}
                  className="details-icon"
                  title="View Details"
                  style={{ cursor: 'pointer', color: '#f59e0b', fontSize: '18px' }}
                />
              </td>
            );
          }
          
          // Regular cell rendering
          return (
            <td key={colIndex} className="table-cell">
              {value}
            </td>
          );
        })}
      </tr>
    );
  };

  // Function to handle map icon click
  const handleMapClick = (rowData) => {
    console.log('Map icon clicked!', rowData);
    const originalData = rowData._original;
    console.log('Original data:', originalData);
    if (originalData && originalData.imageFile) {
      // For Vite, use the public folder path directly
      const imagePath = `/${originalData.imageFile}`;
      
      console.log('Loading image from public folder:', imagePath);
      
      setSelectedImage(imagePath);
      setShowImageModal(true);
      console.log('Modal state should be true now:', showImageModal);
    } else {
      console.log('No image file found in original data');
    }
  };

  // Function to handle details icon click
  const handleDetailsClick = (rowData) => {
    const originalData = rowData._original;
    if (originalData) {
      setSelectedDetails(originalData);
      setShowDetailsModal(true);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedDetails(null);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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
        data={transformedData}
        columns={columns}
        customRowRenderer={customRowRenderer}
        lang={lang}
        title={translations?.maps?.title || 'Biblical Maps'}
        icon={{ Icon: FaMap, color: '#10b981' }}
      />

      {/* Details Modal */}
      {showDetailsModal && selectedDetails && (
        <Modal
          isOpen={showDetailsModal}
          title={selectedDetails.title || translations?.maps?.mapNotFound || 'Map not found'}
          onClose={closeDetailsModal}
          closeLabel={translations?.common?.close || 'Close'}
        >
          <div className="modal-details">
            {selectedDetails.period && (
              <div className="mb-20">
                <strong>Period:</strong>
                <p>{selectedDetails.period}</p>
              </div>
            )}
            
            {selectedDetails.description && (
              <div className="mb-20">
                <strong>{translations?.common?.description || 'Description'}:</strong>
                <p>{lang === 'te' ? selectedDetails.description.te : selectedDetails.description.en}</p>
              </div>
            )}
            
            {selectedDetails.significance && (
              <div className="mb-20">
                <strong>{translations?.common?.significance || 'Significance'}:</strong>
                <p>{lang === 'te' ? selectedDetails.significance.te : selectedDetails.significance.en}</p>
              </div>
            )}
            
            {selectedDetails.modernLocation && (
              <div className="mb-20">
                <strong>Modern Location:</strong>
                <p>{selectedDetails.modernLocation}</p>
              </div>
            )}
            
            {selectedDetails.scripture && (
              <div className="mb-20">
                <strong>Scripture Reference:</strong>
                <p>{selectedDetails.scripture}</p>
              </div>
            )}
            
            {selectedDetails.keyLocations && selectedDetails.keyLocations.length > 0 && (
              <div className="mb-20">
                <strong>Key Locations:</strong>
                <ul>
                  {selectedDetails.keyLocations.map((location, index) => (
                    <li key={index}>{location}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <Modal
          isOpen={showImageModal}
          title={translations?.maps?.mapImage || 'Map Image'}
          onClose={closeImageModal}
          closeLabel={translations?.common?.close || 'Close'}
          maxWidth="900px"
        >
          <div className="text-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Biblical Map"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                onError={(e) => {
                  console.log('Image load error:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', selectedImage);
                }}
              />
            )}
            <div 
              className="image-error-message" 
              style={{ 
                display: 'none',
                padding: '2rem',
                color: 'var(--text-secondary)',
                fontSize: '1.1rem'
              }}
            >
              {translations?.maps?.mapNotFound || 'Map image not found'}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
