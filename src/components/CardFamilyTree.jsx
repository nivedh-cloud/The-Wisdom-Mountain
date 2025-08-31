import React, { useState, useEffect } from 'react';
import { FaUser, FaCrown, FaStar, FaHeart, FaShieldAlt, FaInfo } from 'react-icons/fa';
import familyTreeData from '../assets/data/familyTreeData.json';
import '../styles/CardFamilyTree.css';

const iconComponents = {
  FaUser,
  FaCrown,
  FaStar,
  FaHeart,
  FaShield: FaShieldAlt
};

export default function CardFamilyTree({ treeType }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentGeneration, setCurrentGeneration] = useState([]);
  const [currentTree, setCurrentTree] = useState(treeType === 'adam-lineage' ? 'adamLineage' : 'abrahamLineage');
  const [modalPerson, setModalPerson] = useState(null);
  const [familyView, setFamilyView] = useState(null); // { person, parent, children }

  // Initialize with root person when treeType changes
  useEffect(() => {
    const newTree = treeType === 'adam-lineage' ? 'adamLineage' : 'abrahamLineage';
    setCurrentTree(newTree);
    const rootPerson = familyTreeData[newTree];
    setCurrentGeneration([rootPerson]);
    setSelectedPerson(null);
    setFamilyView(null);
  }, [treeType]);

  // Find person in tree data
  const findPersonByName = (tree, name) => {
    if (tree.name === name) return tree;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findPersonByName(child, name);
        if (found) return found;
      }
    }
    return null;
  };

  // Find parent of a person
  const findParent = (tree, targetName, parent = null) => {
    if (tree.name === targetName) return parent;
    if (tree.children) {
      for (const child of tree.children) {
        const found = findParent(child, targetName, tree);
        if (found !== null) return found;
      }
    }
    return null;
  };

  // Handle person card click to show family view
  const handlePersonClick = (person) => {
    const parent = findParent(familyTreeData[currentTree], person.name);
    const children = person.children || [];
    
    setFamilyView({
      person: person,
      parent: parent,
      children: children
    });
    setCurrentGeneration([]); // Clear generation view
  };

  // Handle info icon click to show modal
  const handleInfoClick = (person, e) => {
    e.stopPropagation();
    setModalPerson(person);
  };

  // Go back to generation view
  const goBackToGeneration = () => {
    setFamilyView(null);
    const rootPerson = familyTreeData[currentTree];
    setCurrentGeneration([rootPerson]);
  };

  // Render connecting lines for family view
  const renderFamilyConnectingLines = () => {
    if (!familyView) return null;

    const { parent, person, children } = familyView;
    const cardWidth = 200;
    const cardSpacing = 50;
    
    return (
      <svg 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* Line from parent to selected person */}
        {parent && (
          <>
            <line
              x1="50%"
              y1="180"
              x2="50%"
              y2="250"
              stroke="#4a5568"
              strokeWidth="3"
            />
          </>
        )}
        
        {/* Lines from selected person to children */}
        {children.length > 0 && (
          <>
            {/* Vertical line down from selected person */}
            <line
              x1="50%"
              y1="400"
              x2="50%"
              y2="470"
              stroke="#4a5568"
              strokeWidth="3"
            />
            
            {children.length > 1 && (
              <>
                {/* Horizontal line connecting all children */}
                <line
                  x1={`calc(50% - ${(children.length - 1) * (cardWidth + cardSpacing) / 2}px)`}
                  y1="470"
                  x2={`calc(50% + ${(children.length - 1) * (cardWidth + cardSpacing) / 2}px)`}
                  y2="470"
                  stroke="#4a5568"
                  strokeWidth="3"
                />
                
                {/* Vertical lines down to each child */}
                {children.map((_, index) => {
                  const offset = (index - (children.length - 1) / 2) * (cardWidth + cardSpacing);
                  return (
                    <line
                      key={index}
                      x1={`calc(50% + ${offset}px)`}
                      y1="470"
                      x2={`calc(50% + ${offset}px)`}
                      y2="520"
                      stroke="#4a5568"
                      strokeWidth="3"
                    />
                  );
                })}
              </>
            )}
          </>
        )}
      </svg>
    );
  };

  // Render connecting lines for generation view
  const renderGenerationConnectingLines = () => {
    if (currentGeneration.length <= 1) return null;

    const cardWidth = 200;
    const cardSpacing = 50;
    const totalWidth = currentGeneration.length * cardWidth + (currentGeneration.length - 1) * cardSpacing;
    const startX = (window.innerWidth - totalWidth) / 2;

    return (
      <svg 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '200px',
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        {/* Horizontal line connecting all cards */}
        <line
          x1={startX + cardWidth / 2}
          y1={50}
          x2={startX + totalWidth - cardWidth / 2}
          y2={50}
          stroke="#4a5568"
          strokeWidth="3"
        />
        
        {/* Vertical lines down to each card */}
        {currentGeneration.map((_, index) => {
          const cardX = startX + index * (cardWidth + cardSpacing) + cardWidth / 2;
          return (
            <line
              key={index}
              x1={cardX}
              y1={50}
              x2={cardX}
              y2={100}
              stroke="#4a5568"
              strokeWidth="3"
            />
          );
        })}
      </svg>
    );
  };

  // PersonCard component
  const PersonCard = ({ person, onPersonClick, onInfoClick, size = 'medium', isSelected = false }) => {
    const IconComponent = iconComponents[person.attributes?.icon] || FaUser;
    const hasChildren = person.children && person.children.length > 0;
    
    const iconSizes = {
      small: 20,
      medium: 24,
      large: 24
    };
    
    return (
      <div
        onClick={() => onPersonClick(person)}
        className={`person-card ${size} ${isSelected ? 'selected' : ''}`}
        style={{ borderColor: person.attributes?.color || '#e2e8f0' }}
      >
        {/* Info icon */}
        <div
          onClick={(e) => onInfoClick(person, e)}
          className="info-icon"
        >
          <FaInfo style={{ fontSize: '10px', color: '#fff' }} />
        </div>

        {/* Profile image/icon */}
        <div 
          className={`profile-circle ${size} ${isSelected ? 'selected' : ''}`}
          style={{
            background: isSelected 
              ? '#f7fafc'
              : (person.attributes?.color || '#6366f1')
          }}
        >
          <IconComponent style={{
            fontSize: iconSizes[size] + 'px',
            color: isSelected ? (person.attributes?.color || '#6366f1') : '#fff'
          }} />
        </div>

        {/* Name */}
        <h3 className={`person-name ${size} ${isSelected ? 'selected' : ''}`}>
          {person.name}
        </h3>

        {/* Role */}
        <div 
          className={`person-role ${size} ${isSelected ? 'selected' : ''}`}
          style={{
            color: isSelected ? '#fff' : (person.attributes?.color || '#6366f1'),
            background: isSelected 
              ? 'rgba(255,255,255,0.2)'
              : `${person.attributes?.color || '#6366f1'}15`
          }}
        >
          {person.attributes?.role}
        </div>

        {/* Basic info placeholders */}
        <div className={`info-placeholders ${isSelected ? 'selected' : ''}`}>
          <div className={`placeholder-line width-80 ${isSelected ? 'selected' : ''}`}></div>
          <div className={`placeholder-line width-60 ${isSelected ? 'selected' : ''}`}></div>
          <div className={`placeholder-line width-70 ${isSelected ? 'selected' : ''}`}></div>
        </div>

        {/* Children indicator */}
        {hasChildren && !isSelected && (
          <div className="children-indicator">
            {person.children.length} Children
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="family-tree-container">
      
      {/* Header with controls outside canvas */}
      <div className="header">
        <div className="header-content">
          <div className="header-controls">
            {/* Back button */}
            {familyView && (
              <button
                onClick={goBackToGeneration}
                className="back-button"
              >
                ← Back to Tree View
              </button>
            )}
          </div>

          {/* Title */}
          <h1 className="header-title">
            {familyView ? `${familyView.person.name}'s Family` : 
             (currentTree === 'adamLineage' ? "Adam's Lineage" : "Abraham's Lineage")}
          </h1>

          <div className="spacer"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Main canvas area - wider */}
      <div className="canvas">
        
        {/* Main content area */}
        <div className="content-area">
        
        {/* Family View - Three generations around selected person */}
        {familyView ? (
          <div>
            {/* Connecting lines for family */}
            {renderFamilyConnectingLines()}

            {/* Parent Section */}
            {familyView.parent && (
              <div className="section-header">
                <h3 className="section-title">Parent</h3>
                <div className="cards-container">
                  <PersonCard 
                    person={familyView.parent} 
                    onPersonClick={handlePersonClick}
                    onInfoClick={handleInfoClick}
                    size="small"
                  />
                </div>
              </div>
            )}

            {/* Selected Person Section */}
            <div className="section-header">
              <h3 className="selected-title">
                Selected: {familyView.person.name}
              </h3>
              <div className="cards-container">
                <PersonCard 
                  person={familyView.person} 
                  onPersonClick={handlePersonClick}
                  onInfoClick={handleInfoClick}
                  size="medium"
                  isSelected={true}
                />
              </div>
            </div>

            {/* Children Section */}
            {familyView.children.length > 0 && (
              <div className="section-header">
                <h3 className="section-title">
                  Children ({familyView.children.length})
                </h3>
                <div className="cards-container">
                  {familyView.children.map((child, index) => (
                    <PersonCard 
                      key={index}
                      person={child} 
                      onPersonClick={handlePersonClick}
                      onInfoClick={handleInfoClick}
                      size="medium"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No children message */}
            {familyView.children.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👶</div>
                <p className="empty-state-title">No children recorded</p>
              </div>
            )}
          </div>
        ) : (
          /* Generation View - Show current generation */
          <div>
            {/* Connecting lines */}
            {renderGenerationConnectingLines()}

            {/* Person cards */}
            <div className="generation-container">
              {currentGeneration.map((person, index) => (
                <PersonCard 
                  key={index}
                  person={person} 
                  onPersonClick={handlePersonClick}
                  onInfoClick={handleInfoClick}
                  size="medium"
                />
              ))}
            </div>

            {/* No generation message */}
            {currentGeneration.length === 0 && (
              <div className="empty-state generation">
                <div className="empty-state-icon generation">🌳</div>
                <p className="empty-state-title">Start exploring the family tree</p>
                <p className="empty-state-subtitle generation">Click on any person to see their family</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Person Details Modal */}
      {modalPerson && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Close button */}
            <button
              onClick={() => setModalPerson(null)}
              className="modal-close"
            >
              ×
            </button>

            {/* Profile header */}
            <div className="modal-header">
              <div 
                className="modal-profile-circle"
                style={{
                  background: modalPerson.attributes?.color || '#6366f1',
                  boxShadow: `0 8px 24px ${modalPerson.attributes?.color || '#6366f1'}40`
                }}
              >
                {React.createElement(iconComponents[modalPerson.attributes?.icon] || FaUser, {
                  style: { fontSize: '40px', color: '#fff' }
                })}
              </div>
              <h2 className="modal-name">
                {modalPerson.name}
              </h2>
              <div 
                className="modal-role"
                style={{ 
                  color: modalPerson.attributes?.color || '#6366f1',
                  background: `${modalPerson.attributes?.color || '#6366f1'}15`
                }}
              >
                {modalPerson.attributes?.role}
              </div>
            </div>

            {/* Details - Two Column Layout */}
            <div className="modal-details-grid">
              <div className="details-column">
                {modalPerson.attributes?.years && (
                  <div className="detail-item">
                    <span className="detail-label">Lifespan:</span> {modalPerson.attributes.years}
                  </div>
                )}
                {modalPerson.attributes?.born && (
                  <div className="detail-item">
                    <span className="detail-label">Born:</span> {modalPerson.attributes.born}
                  </div>
                )}
                {modalPerson.attributes?.father && (
                  <div className="detail-item">
                    <span className="detail-label">Father:</span> {modalPerson.attributes.father}
                  </div>
                )}
                {modalPerson.attributes?.spouse && (
                  <div className="detail-item">
                    <span className="detail-label">Spouse:</span> {modalPerson.attributes.spouse}
                  </div>
                )}
              </div>
              <div className="details-column">
                {modalPerson.attributes?.children && (
                  <div className="detail-item">
                    <span className="detail-label">Children:</span> {
                      Array.isArray(modalPerson.attributes.children) 
                        ? modalPerson.attributes.children.join(', ') 
                        : modalPerson.attributes.children
                    }
                  </div>
                )}
                {modalPerson.attributes?.description && (
                  <div className="detail-item">
                    <span className="detail-label">Description:</span> {modalPerson.attributes.description}
                  </div>
                )}
                {modalPerson.attributes?.significance && (
                  <div className="detail-item">
                    <span className="detail-label">Significance:</span> {modalPerson.attributes.significance}
                  </div>
                )}
              </div>
            </div>

            {/* Children count */}
            {modalPerson.children && modalPerson.children.length > 0 && (
              <div className="next-generation-box">
                <div className="next-gen-title">
                  Next Generation
                </div>
                <div className="next-gen-count">
                  {modalPerson.children.length} Children
                </div>
                <div className="next-gen-subtitle">
                  Click on the card to explore
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
