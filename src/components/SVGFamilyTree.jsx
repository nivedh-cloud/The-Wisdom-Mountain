import React, { useState, useEffect } from 'react';
import { FaUser, FaCrown, FaStar, FaHeart, FaShieldAlt } from 'react-icons/fa';
import familyTreeData from '../assets/data/familyTreeData.json';

const iconComponents = {
  FaUser,
  FaCrown,
  FaStar,
  FaHeart,
  FaShield: FaShieldAlt
};

export default function SVGFamilyTree() {
  const [selected, setSelected] = useState(null);
  const [currentTree, setCurrentTree] = useState('adamLineage');
  const [animatedLeaves, setAnimatedLeaves] = useState([]);

  // Generate floating leaves animation
  useEffect(() => {
    const leaves = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 1400,
      y: Math.random() * 800,
      rotation: Math.random() * 360,
      size: Math.random() * 0.5 + 0.5,
      animationDelay: Math.random() * 5
    }));
    setAnimatedLeaves(leaves);
  }, []);

  // Tree structure for SVG positioning
  const getTreePositions = () => {
    const treeData = familyTreeData[currentTree];
    
    if (currentTree === 'adamLineage') {
      return {
        trunk: { x: 700, y: 750 },
        mainBranches: [
          { x: 400, y: 600, angle: -30 }, // Cain branch
          { x: 700, y: 500, angle: 0 },   // Seth branch (main)
          { x: 1000, y: 600, angle: 30 }   // Abel branch
        ],
        people: [
          // Root
          { name: 'Adam', x: 700, y: 680, generation: 0 },
          
          // First generation - increased horizontal spacing
          { name: 'Cain', x: 350, y: 580, generation: 1 },
          { name: 'Abel', x: 1050, y: 580, generation: 1 },
          { name: 'Seth', x: 700, y: 550, generation: 1 },
          
          // Second generation - increased spacing
          { name: 'Enoch (Cain\'s son)', x: 250, y: 480, generation: 2 },
          { name: 'Enosh', x: 700, y: 420, generation: 2 },
          
          // Third generation - increased spacing
          { name: 'Irad', x: 150, y: 380, generation: 3 },
          { name: 'Kenan', x: 700, y: 290, generation: 3 },
          
          // Fourth generation and beyond - increased spacing
          { name: 'Mahalalel', x: 600, y: 220, generation: 4 },
          { name: 'Jared', x: 800, y: 220, generation: 4 },
          { name: 'Enoch', x: 700, y: 160, generation: 5 },
          { name: 'Methuselah', x: 550, y: 160, generation: 5 },
          { name: 'Lamech', x: 850, y: 160, generation: 5 },
          { name: 'Noah', x: 700, y: 120, generation: 6 }
        ]
      };
    } else {
      // Abraham lineage positioning - increased spacing
      return {
        trunk: { x: 700, y: 750 },
        mainBranches: [
          { x: 500, y: 600, angle: -20 },
          { x: 900, y: 600, angle: 20 }
        ],
        people: [
          { name: 'Abraham', x: 700, y: 680, generation: 0 },
          { name: 'Isaac', x: 500, y: 550, generation: 1 },
          { name: 'Ishmael', x: 900, y: 550, generation: 1 },
          { name: 'Jacob', x: 550, y: 320, generation: 2 },
          { name: 'Esau', x: 650, y: 320, generation: 2 },
          { name: 'Joseph', x: 480, y: 190, generation: 3 },
          { name: 'Benjamin', x: 550, y: 190, generation: 3 },
          { name: 'Judah', x: 620, y: 190, generation: 3 }
        ]
      };
    }
  };

  const treePositions = getTreePositions();
  const treeData = familyTreeData[currentTree];

  // Find person data by name
  const findPersonData = (name, node = treeData) => {
    if (node.name === name) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findPersonData(name, child);
        if (found) return found;
      }
    }
    return null;
  };

  // Generate branch paths
  const generateBranches = () => {
    const branches = [];
    const { trunk, mainBranches, people } = treePositions;

    // Main trunk
    branches.push(
      <path
        key="trunk"
        d={`M ${trunk.x} ${trunk.y + 100} Q ${trunk.x} ${trunk.y + 50} ${trunk.x} ${trunk.y}`}
        stroke="#8B4513"
        strokeWidth="25"
        fill="none"
        strokeLinecap="round"
      />
    );

    // Main branches
    mainBranches.forEach((branch, i) => {
      const startX = trunk.x;
      const startY = trunk.y;
      const controlX = trunk.x + (branch.x - trunk.x) * 0.3;
      const controlY = trunk.y - 50;
      
      branches.push(
        <path
          key={`main-branch-${i}`}
          d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${branch.x} ${branch.y}`}
          stroke="#8B4513"
          strokeWidth="15"
          fill="none"
          strokeLinecap="round"
        />
      );
    });

    // Secondary branches connecting people
    people.forEach((person, i) => {
      if (person.generation > 0) {
        const parentGen = people.filter(p => p.generation === person.generation - 1);
        const closestParent = parentGen.reduce((closest, parent) => {
          const dist = Math.abs(parent.x - person.x);
          return dist < Math.abs(closest.x - person.x) ? parent : closest;
        }, parentGen[0]);

        if (closestParent) {
          branches.push(
            <path
              key={`branch-${i}`}
              d={`M ${closestParent.x} ${closestParent.y + 30} Q ${(closestParent.x + person.x) / 2} ${(closestParent.y + person.y) / 2} ${person.x} ${person.y - 30}`}
              stroke="#8B4513"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />
          );
        }
      }
    });

    return branches;
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#e0f4ff', position: 'relative' }}>
      
      {/* Header with dropdown outside canvas */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.9)', borderBottom: '1px solid #DAA520' }}>
        <select
          value={currentTree}
          onChange={(e) => {
            setCurrentTree(e.target.value);
            setSelected(null);
          }}
          style={{
            padding: '12px 20px',
            borderRadius: 25,
            border: '3px solid #DAA520',
            background: '#ffd700',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#8B4513',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
        >
          <option value="adamLineage">🌍 Adam's Lineage</option>
          <option value="abrahamLineage">⭐ Abraham's Lineage</option>
        </select>
      </div>

      {/* SVG Canvas */}
      <div style={{ width: '100%', height: '80vh', borderRadius: 20, overflow: 'hidden', position: 'relative' }}>

      {/* SVG Tree */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Animated background clouds */}
        <defs>
          {/* Marker definitions for arrows if needed */}
        </defs>

        {/* Floating clouds */}
        {[...Array(6)].map((_, i) => (
          <ellipse
            key={`cloud-${i}`}
            cx={200 + i * 200}
            cy={100 + (i % 2) * 50}
            rx="80"
            ry="40"
            fill="rgba(255,255,255,0.6)"
            opacity="0.6"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,0; 20,${Math.sin(i) * 10}; 0,0`}
              dur={`${15 + i * 2}s`}
              repeatCount="indefinite"
            />
          </ellipse>
        ))}

        {/* Animated falling leaves */}
        {animatedLeaves.map(leaf => (
          <g key={`leaf-${leaf.id}`}>
            <path
              d="M0,0 Q5,-10 10,0 Q5,10 0,0"
              fill="#228B22"
              opacity="0.7"
              transform={`scale(${leaf.size})`}
            >
              <animateTransform
                attributeName="transform"
                type="translate"
                values={`${leaf.x},${leaf.y}; ${leaf.x + 50},${leaf.y + 100}; ${leaf.x + 100},${leaf.y + 200}`}
                dur="10s"
                repeatCount="indefinite"
                begin={`${leaf.animationDelay}s`}
              />
              <animateTransform
                attributeName="transform"
                type="rotate"
                values={`${leaf.rotation}; ${leaf.rotation + 360}`}
                dur="8s"
                repeatCount="indefinite"
                additive="sum"
              />
            </path>
          </g>
        ))}

        {/* Tree branches */}
        {generateBranches()}

        {/* People nodes */}
        {treePositions.people.map((position, i) => {
          const personData = findPersonData(position.name);
          if (!personData) return null;

          const IconComponent = iconComponents[personData.attributes?.icon] || FaUser;
          const color = personData.attributes?.color || '#6366f1';
          const isSelected = selected?.name === position.name;

          return (
            <g key={`person-${i}`} transform={`translate(${position.x}, ${position.y})`}>
              {/* Glow effect for selected */}
              {isSelected && (
                <circle
                  r="50"
                  fill={color}
                  opacity="0.3"
                  filter="blur(8px)"
                >
                  <animate
                    attributeName="r"
                    values="45;55;45"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* Golden banner behind person */}
              <g transform="translate(-60, 35)">
                <path
                  d="M 0 8 Q 0 0 8 0 L 112 0 Q 120 0 120 8 L 120 16 Q 120 24 112 24 L 8 24 Q 0 24 0 16 Z"
                  fill="#ffd700"
                  stroke="#DAA520"
                  strokeWidth="2"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                />
                <text
                  x="60"
                  y="16"
                  textAnchor="middle"
                  fill="#8B4513"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="serif"
                >
                  {position.name.length > 12 ? position.name.substring(0, 12) + '...' : position.name}
                </text>
              </g>

              {/* Person circle */}
              <circle
                r="30"
                fill="#fff8dc"
                stroke={color}
                strokeWidth="4"
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(personData)}
              >
                <animate
                  attributeName="stroke-width"
                  values="4;6;4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Icon inside circle */}
              <foreignObject x="-12" y="-12" width="24" height="24" style={{ pointerEvents: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                  <IconComponent style={{ fontSize: 20, color: color }} />
                </div>
              </foreignObject>

              {/* Hover effect */}
              <circle
                r="30"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(personData)}
                onMouseEnter={(e) => {
                  e.target.previousElementSibling.previousElementSibling.setAttribute('r', '35');
                }}
                onMouseLeave={(e) => {
                  e.target.previousElementSibling.previousElementSibling.setAttribute('r', '30');
                }}
              />
            </g>
          );
        })}
      </svg>
      </div>

      {/* Profile Modal */}
      {selected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          borderRadius: 20
        }}>
          <div style={{
            background: '#fff8dc',
            borderRadius: 20,
            padding: 32,
            maxWidth: 500,
            width: '90%',
            border: '4px solid #DAA520',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Close button */}
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: '#FF6B6B',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 40,
                height: 40,
                fontSize: 20,
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>

            {/* Profile content */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: selected.attributes?.color || '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '4px solid #DAA520'
              }}>
                {React.createElement(iconComponents[selected.attributes?.icon] || FaUser, {
                  style: { fontSize: 32, color: '#fff' }
                })}
              </div>
              <h3 style={{ color: '#8B4513', fontSize: '2em', margin: '0 0 8px 0', fontFamily: 'serif' }}>
                {selected.name}
              </h3>
              <div style={{ 
                color: selected.attributes?.color, 
                fontSize: '1.2em', 
                fontWeight: 'bold',
                background: 'rgba(255,215,0,0.3)',
                padding: '8px 16px',
                borderRadius: 15,
                display: 'inline-block',
                border: '2px solid #DAA520'
              }}>
                {selected.attributes?.role}
              </div>
            </div>

            <div style={{ color: '#654321', lineHeight: 1.6, fontSize: '16px' }}>
              <div style={{ marginBottom: 12 }}><strong>Lifespan:</strong> {selected.attributes?.years}</div>
              <div style={{ marginBottom: 12 }}><strong>Born:</strong> {selected.attributes?.born}</div>
              <div style={{ marginBottom: 12 }}><strong>Father:</strong> {selected.attributes?.father}</div>
              <div style={{ marginBottom: 12 }}><strong>Significance:</strong> {selected.attributes?.significance}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
