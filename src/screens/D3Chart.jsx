import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FaDownload, FaSearchPlus, FaSearchMinus, FaRedo, FaChartLine, FaHandPaper, FaArrowsAltV, FaArrowsAltH, FaExpandArrowsAlt, FaCompressArrowsAlt, FaSitemap } from 'react-icons/fa';
import genealogyBilingualData from '../assets/data/genealogy-bilingual-improved.json';
import translationsData from '../assets/data/translations.json';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../contexts/ThemeContext';
import JesusImage from '../assets/images/JesusImageThumbnail.png';

export default function D3Chart({ lang = 'en' }) {
  
  const svgRef = useRef();
  const { isDarkMode } = useTheme();
  const [selectedNode, setSelectedNode] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [transform, setTransform] = useState(d3.zoomIdentity);
  const [savedTransform, setSavedTransform] = useState(null); // Store transform during language change
  const [savedTransformForLineStyle, setSavedTransformForLineStyle] = useState(null); // Store transform during line style change
  const [zoomLevel, setZoomLevel] = useState(50); // Track zoom level percentage
  const [isPanMode, setIsPanMode] = useState(true); // Pan is always enabled
  const [isVertical, setIsVertical] = useState(true); // Track layout orientation
  const [searchTerm, setSearchTerm] = useState(''); // Search functionality
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [showSearchResults, setShowSearchResults] = useState(false); // Show/hide search dropdown
  const [lineStyle, setLineStyle] = useState(() => {
    // Check localStorage for saved line style preference, default to 'curved'
    const savedLineStyle = localStorage.getItem('d3ChartLineStyle');
    return savedLineStyle || 'curved';
  }); // Line style: 'straight', 'curved', 'diagonal'
  const [expandAll, setExpandAll] = useState(false); // Track expand all state
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render counter
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false); // Mobile panel state
  
  const translations = translationsData[lang] || translationsData.en;

  // Helper function to create tooltip with current language
  const createInlineTooltip = (event, d) => {
    
    // Remove any existing tooltips first
    d3.selectAll(".d3-tooltip").remove();
    
    // Use language-specific fields for tooltip content
    const tooltipName = lang === 'te' 
      ? (d.data.nameTe || d.data.nameEn || d.data.name)
      : (d.data.nameEn || d.data.name);
    
    const tooltipSpouse = lang === 'te'
      ? (d.data.spouseTe || d.data.spouseEn || d.data.spouse)
      : (d.data.spouseEn || d.data.spouse);
      
    const tooltipDetail = lang === 'te'
      ? (d.data.detailTe || d.data.detailEn || d.data.detail)
      : (d.data.detailEn || d.data.detail);
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "14px")
      .style("line-height", "1.4")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
      .style("max-width", "320px")
      .style("opacity", 0);

    // Build comprehensive tooltip content using language-specific fields
    let content = `<strong style="font-size: 16px; color: #fbbf24;">${tooltipName}</strong>`;
    
    // Class information
    if (d.data.class) {
      const classLabel = lang === 'te' ? 'వర్గము:' : 'Class:';
      content += `<br/><span style="color: #34d399;">${classLabel}</span> ${d.data.class}`;
    }
    
    // Birth and Death information
    if (d.data.birth) {
      const bornLabel = lang === 'te' ? 'జన్మ:' : 'Born:';
      content += `<br/><span style="color: #60a5fa;">${bornLabel}</span> ${d.data.birth}`;
    }
    
    if (d.data.death) {
      const diedLabel = lang === 'te' ? 'మరణము:' : 'Died:';
      content += `<br/><span style="color: #f87171;">${diedLabel}</span> ${d.data.death}`;
    }
    
    // Age information
    if (d.data.age) {
      const ageLabel = lang === 'te' ? 'వయస్సు:' : 'Age:';
      const yearsLabel = lang === 'te' ? 'సంవత్సరాలు' : 'years';
      content += `<br/><span style="color: #60a5fa;">${ageLabel}</span> ${d.data.age} ${yearsLabel}`;
    }
    
    // Spouse information
    if (tooltipSpouse && tooltipSpouse.length > 0) {
      const spouseLabel = lang === 'te' ? 'భార్య/భర్త:' : 'Spouse:';
      const spouseText = Array.isArray(tooltipSpouse) ? tooltipSpouse.join(", ") : tooltipSpouse;
      const cleanSpouseText = spouseText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      content += `<br/><span style="color: #fb7185;">${spouseLabel}</span> ${cleanSpouseText}`;
    }
    
    // Children information
    if (d.data.children && Array.isArray(d.data.children) && d.data.children.length > 0) {
      const childrenLabel = lang === 'te' ? 'పిల్లలు:' : 'Children:';
      const childrenNames = d.data.children.map(child => {
        return lang === 'te' 
          ? (child.nameTe || child.nameEn || child.name) 
          : (child.nameEn || child.name);
      });
      const childrenText = childrenNames.length > 5 ? 
        `${childrenNames.slice(0, 5).join(", ")} మరియు ${childrenNames.length - 5} మరిన్ని` :
        childrenNames.join(", ");
      content += `<br/><span style="color: #f97316;">${childrenLabel}</span> ${childrenText}`;
    }
    
    // Description/Detail information
    if (tooltipDetail) {
      const detailText = tooltipDetail
        .replace(/<br\s*\/?>/gi, ' | ')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const cleanDetail = detailText.length > 150 ? 
        detailText.substring(0, 147) + "..." : 
        detailText;
      content += `<br/><br/><span style="color: #a78bfa;">${cleanDetail}</span>`;
    }

    tooltip.html(content)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px")
      .transition()
      .duration(200)
      .style("opacity", 1);
  };

  // Add safety check for translations
  const safeTranslations = {
    d3Chart: {
      title: "Biblical Family Tree",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out",
      resetView: "Reset View",
      downloadChart: "Download Chart",
      panTool: "Pan Tool (Drag to Move)",
      verticalLayout: "Vertical Layout",
      horizontalLayout: "Horizontal Layout",
      ...translations?.d3Chart
    }
  };

    // Helper function to get text color based on theme
    const getTextColor = () => {
      return isDarkMode ? '#ffffff' : '#1f2937'; // White for dark mode, dark gray for light mode
    };

    // Helper function to get stroke color based on theme
    const getStrokeColor = () => {
      return isDarkMode ? '#ffffff' : 'rgb(180, 180, 180)'; // White for dark mode, light gray for light mode
    };

  // Helper function to create detailed tooltip - made reactive to language changes
  const createDetailedTooltip = useCallback((event, d) => {
    
    // Use language-specific fields for tooltip content
    const tooltipName = lang === 'te' 
      ? (d.data.nameTe || d.data.nameEn || d.data.name)
      : (d.data.nameEn || d.data.name);
    
    const tooltipSpouse = lang === 'te'
      ? (d.data.spouseTe || d.data.spouseEn || d.data.spouse)
      : (d.data.spouseEn || d.data.spouse);
      
    const tooltipDetail = lang === 'te'
      ? (d.data.detailTe || d.data.detailEn || d.data.detail)
      : (d.data.detailEn || d.data.detail);

    // Remove any existing tooltips first
    d3.selectAll(".d3-tooltip").remove();
    
    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "14px")
      .style("line-height", "1.4")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
      .style("max-width", "320px")
      .style("opacity", 0);

    // Build comprehensive tooltip content using language-specific fields
    let content = `<strong style="font-size: 16px; color: #fbbf24;">${tooltipName}</strong>`;
    
    // Class information
    if (d.data.class) {
      const classLabel = lang === 'te' ? 'వర్గము:' : 'Class:';
      content += `<br/><span style="color: #34d399;">${classLabel}</span> ${d.data.class}`;
    }
    
    // Birth and Death information
    if (d.data.birth) {
      const bornLabel = lang === 'te' ? 'జన్మ:' : 'Born:';
      content += `<br/><span style="color: #60a5fa;">${bornLabel}</span> ${d.data.birth}`;
    }
    
    if (d.data.death) {
      const diedLabel = lang === 'te' ? 'మరణము:' : 'Died:';
      content += `<br/><span style="color: #f87171;">${diedLabel}</span> ${d.data.death}`;
    }
    
    // Age information
    if (d.data.age) {
      const ageLabel = lang === 'te' ? 'వయస్సు:' : 'Age:';
      const yearsLabel = lang === 'te' ? 'సంవత్సరాలు' : 'years';
      content += `<br/><span style="color: #60a5fa;">${ageLabel}</span> ${d.data.age} ${yearsLabel}`;
    }
    
    // Spouse information
    if (tooltipSpouse && tooltipSpouse.length > 0) {
      const spouseLabel = lang === 'te' ? 'భార్య/భర్త:' : 'Spouse:';
      // Handle spouse as string or array
      const spouseText = Array.isArray(tooltipSpouse) ? tooltipSpouse.join(", ") : tooltipSpouse;
      // Clean HTML tags from spouse text
      const cleanSpouseText = spouseText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      content += `<br/><span style="color: #fb7185;">${spouseLabel}</span> ${cleanSpouseText}`;
    }
    
    // Children information - show inline
    if (d.data.children && Array.isArray(d.data.children) && d.data.children.length > 0) {
      const childrenLabel = lang === 'te' ? 'పిల్లలు:' : 'Children:';
      const childrenNames = d.data.children.map(child => {
        return lang === 'te' 
          ? (child.nameTe || child.nameEn || child.name) 
          : (child.nameEn || child.name);
      });
      const childrenText = childrenNames.length > 5 ? 
        `${childrenNames.slice(0, 5).join(", ")} మరియు ${childrenNames.length - 5} మరిన్ని` :
        childrenNames.join(", ");
      content += `<br/><span style="color: #f97316;">${childrenLabel}</span> ${childrenText}`;
    }
    
    // Role/abilities information (excluding gender)
    if (d.data.abilities && d.data.abilities.length > 0) {
      const abilities = d.data.abilities.filter(ability => ability !== 'male' && ability !== 'female');
      if (abilities.length > 0) {
        const roleLabel = lang === 'te' ? 'పాత్ర:' : 'Role:';
        content += `<br/><span style="color: #34d399;">${roleLabel}</span> ${abilities.join(", ")}`;
      }
    }
    
    // Additional legacy fields
    if (d.data.total_lifespan && d.data.total_lifespan !== null) {
      const lifespanLabel = lang === 'te' ? 'జీవితకాలము:' : 'Total Lifespan:';
      const yearsLabel = lang === 'te' ? 'సంవత్సరాలు' : 'years';
      content += `<br/><span style="color: #60a5fa;">${lifespanLabel}</span> ${d.data.total_lifespan} ${yearsLabel}`;
    }
    
    if (d.data.age_at_fatherhood && d.data.age_at_fatherhood !== null) {
      const parenthoodLabel = lang === 'te' ? 'తల్లిదండ్రుల వయస్సు:' : 'Age at Parenthood:';
      const yearsLabel = lang === 'te' ? 'సంవత్సరాలు' : 'years';
      content += `<br/><span style="color: #fb7185;">${parenthoodLabel}</span> ${d.data.age_at_fatherhood} ${yearsLabel}`;
    }
    
    // Biblical reference
    if (d.data.verse_reference) {
      const scriptureLabel = lang === 'te' ? 'గ్రంథము:' : 'Scripture:';
      content += `<br/><span style="color: #fbbf24;">${scriptureLabel}</span> ${d.data.verse_reference}`;
    }
    
    // Legacy children names (fallback)
    if (d.data.children_names && d.data.children_names.length > 0 && (!d.data.children || d.data.children.length === 0)) {
      const childrenText = d.data.children_names.length > 5 ? 
        `${d.data.children_names.slice(0, 5).join(", ")} and ${d.data.children_names.length - 5} more` :
        d.data.children_names.join(", ");
      const childrenLabel = lang === 'te' ? 'పిల్లలు:' : 'Children:';
      content += `<br/><span style="color: #f97316;">${childrenLabel}</span> ${childrenText}`;
    }
    
    if (d.data.reign) {
      const reignLabel = lang === 'te' ? 'పాలన:' : 'Reign:';
      content += `<br/><span style="color: #fbbf24;">${reignLabel}</span> ${d.data.reign}`;
    }
    
    if (d.data.tribe) {
      const tribeLabel = lang === 'te' ? 'వంశము:' : 'Tribe:';
      content += `<br/><span style="color: #34d399;">${tribeLabel}</span> ${d.data.tribe}`;
    }
    
    // Description/Detail information - use language-specific fields
    if (tooltipDetail) {
      // Clean up HTML tags and format the detail text
      const detailText = tooltipDetail
        .replace(/<br\s*\/?>/gi, ' | ')  // Replace <br> tags with separators
        .replace(/<[^>]*>/g, '')         // Remove other HTML tags
        .replace(/\s+/g, ' ')            // Normalize whitespace
        .trim();
      
      const cleanDetail = detailText.length > 150 ? 
        detailText.substring(0, 147) + "..." : 
        detailText;
      content += `<br/><br/><span style="color: #a78bfa;">${cleanDetail}</span>`;
    } else if (d.data.description) {
      // Fallback to description if detail is not available
      const desc = d.data.description.length > 120 ? 
        d.data.description.substring(0, 117) + "..." : 
        d.data.description;
      content += `<br/><br/><span style="color: #a78bfa;">${desc}</span>`;
    }

    tooltip.html(content)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px")
      .transition()
      .duration(200)
      .style("opacity", 1);
      
    return tooltip;
  }, [lang, isDarkMode]); // Depend on lang and isDarkMode so it updates when language changes

  useEffect(() => {
    
    // Clean up any existing tooltips
    d3.selectAll(".d3-tooltip").remove();
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = isVertical ? 3200 : 5000; // Increased width to accommodate better spacing
    const height = isVertical ? 5000 : 3200; // Increased height to accommodate better spacing
    const margin = { top: 150, right: 150, bottom: 150, left: 150};

    svg
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background", "var(--card-bg)")
      .style("border", "1px solid var(--border-color)")
      .style("border-radius", "8px")
      .style("display", "block")
      .style("max-width", "100%")
      .style("max-height", "100%"); // Ensure SVG is visible and fills container

    const container = svg.append("g");

    // Add a debug text to show current language
    svg.append("text")
      .attr("x", 20)
      .attr("y", 30)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .style("fill", lang === 'te' ? "#e11d48" : "#3b82f6")
      .text(`Lang: ${lang} ${lang === 'te' ? '(తెలుగు)' : '(English)'}`);

    svg.append("text")
      .attr("x", 20)
      .attr("y", 55)
      .style("font-size", "12px")
      .style("font-family", "'Segoe UI', 'Noto Sans Telugu', 'Telugu Sangam MN', Arial, sans-serif")
      .style("fill", getTextColor())
      .text(`Test Telugu: ఆదాము, నోవహు, అబ్రాహాము`);

    // Use the bilingual data and display names based on language preference
    const selectedData = genealogyBilingualData;
    const hierarchyData = convertToHierarchy(selectedData, lang);

    // Helper function to find and update a node in the hierarchyData
    const updateNodeInHierarchy = (rootData, targetName, updateFn) => {
      const findAndUpdate = (node) => {
        if (node.name === targetName) {
          updateFn(node);
          return true;
        }
        
        // Search in children
        if (node.children) {
          for (let child of node.children) {
            if (findAndUpdate(child)) return true;
          }
        }
        
        // Search in _children
        if (node._children) {
          for (let child of node._children) {
            if (findAndUpdate(child)) return true;
          }
        }
        
        return false;
      };
      
      findAndUpdate(rootData);
    };

    // Function to toggle expand/collapse of a node
    const toggleNode = (nodeData) => {
      
      // Update the node in the original hierarchyData
      updateNodeInHierarchy(hierarchyData, nodeData.name, (targetNode) => {
        if (targetNode._children && targetNode._children.length > 0) {
          // Node is currently collapsed (has _children) - EXPAND it
          targetNode.children = [...targetNode._children];
          targetNode._children = null;
          targetNode._expandedByUser = true; // Mark that this was expanded by user
        } else if (targetNode.children && targetNode.children.length > 0 && targetNode._expandedByUser) {
          // Node is currently expanded by user (has children) - COLLAPSE it
          targetNode._children = [...targetNode.children];
          targetNode.children = null;
          targetNode._expandedByUser = false;
        }
      });
      
      // Re-render the tree
      updateTree();
    };

    // Function to update/re-render the tree
    const updateTree = () => {
      // Clear existing content
      container.selectAll("*").remove();
      
      // Recreate the tree with current data (using the modified hierarchyData)
      const newRoot = d3.hierarchy(hierarchyData);
      const newTreeData = treeLayout(newRoot);
      
      // Adjust coordinates
      newTreeData.descendants().forEach(d => {
        if (isVertical) {
          d.x = d.x * 2.2; // Increase horizontal spacing significantly for better text readability
          d.y = d.y * 2.0; // Increase vertical spacing for better visual separation
        } else {
          const temp = d.x;
          d.x = d.y * 2.2; // Increase horizontal spacing significantly
          d.y = temp * 2.5; // Increase vertical spacing even more for horizontal layout
        }
      });
      
      // Recreate links and nodes
      createTreeElements(newTreeData);
    };

    // Create D3 hierarchy
    const root = d3.hierarchy(hierarchyData);
    
    // Create tree layout with dynamic orientation and much better spacing
    const treeLayout = d3.tree()
      .size([
        isVertical ? width - margin.left - margin.right : height - margin.top - margin.bottom,
        isVertical ? height - margin.top - margin.bottom : width - margin.left - margin.right
      ])
      .separation((a, b) => {
        return a.parent === b.parent ? 12 : 18; // Even more generous separation for better readability
      });

    // Create zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        setTransform(event.transform);
        setZoomLevel(Math.round(event.transform.k * 100)); // Update zoom level percentage
      });

    svg.call(zoom);

    // Store zoom behavior for later use
    svg.node().zoomBehavior = zoom;

    // Function to create tree elements (links and nodes)
    const createTreeElements = (treeData) => {
      // Add links (connections between parent and children) - dynamic layout with customizable line styles
      const links = container.selectAll(".link")
        .data(treeData.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => {
          const sourceX = d.source.x + margin.left;
          const sourceY = d.source.y + margin.top;
          const targetX = d.target.x + margin.left;
          const targetY = d.target.y + margin.top;
          
          // Generate path based on selected line style
          if (lineStyle === 'curved') {
            // Use D3's built-in curved lines
            if (isVertical) {
              return d3.linkVertical()
                .x(d => d.x + margin.left)
                .y(d => d.y + margin.top)(d);
            } else {
              return d3.linkHorizontal()
                .x(d => d.x + margin.left)
                .y(d => d.y + margin.top)(d);
            }
          } else if (lineStyle === 'diagonal') {
            // Direct diagonal lines
            return `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
          } else {
            // Default: step-like straight lines with right angles
            if (isVertical) {
              const midY = sourceY + (targetY - sourceY) / 2;
              return `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
            } else {
              const midX = sourceX + (targetX - sourceX) / 2;
              return `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;
            }
          }
        })
        .style("fill", "none")
        .style("stroke", d => {
          // Highlight connections in the messianic line with a distinctive color
          const targetHasMessianicLine = d.target.data.class && d.target.data.class.includes('messianicLine');
          const sourceHasMessianicLine = d.source.data.class && d.source.data.class.includes('messianicLine');
          
          if (targetHasMessianicLine && sourceHasMessianicLine) {
            return "#9333ea"; // Purple for Adam to Yeshua lineage connections
          }
          return "#999"; // Lighter gray for other connections
        })
        .style("stroke-width", d => {
          // Make messianic line connections much thicker and more prominent
          const targetHasMessianicLine = d.target.data.class && d.target.data.class.includes('messianicLine');
          const sourceHasMessianicLine = d.source.data.class && d.source.data.class.includes('messianicLine');
          
          if (targetHasMessianicLine && sourceHasMessianicLine) {
            return 4; // Much thicker for messianic line
          }
          return 1.5; // Thinner for other connections
        })
        .style("stroke-opacity", d => {
          // Make messianic line connections very prominent
          const targetHasMessianicLine = d.target.data.class && d.target.data.class.includes('messianicLine');
          const sourceHasMessianicLine = d.source.data.class && d.source.data.class.includes('messianicLine');
          
          if (targetHasMessianicLine && sourceHasMessianicLine) {
            return 1; // Full opacity for messianic line
          }
          return 0.4; // More subtle for other connections
        });

    // Add nodes
    const nodeGroups = container.selectAll(".node")
      .data(treeData.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x + margin.left},${d.y + margin.top})`)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        setSelectedNode(d.data);
        setShowModal(true);
        zoomToNodeOnClick(d.data);
      });

    // Function to create a star path
    const createStarPath = (outerRadius = 15, innerRadius = 6, numPoints = 5) => {
      const angleStep = (Math.PI * 2) / numPoints;
      let path = '';
      
      for (let i = 0; i < numPoints * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * angleStep / 2) - (Math.PI / 2); // Start from top
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
          path += `M ${x} ${y}`;
        } else {
          path += ` L ${x} ${y}`;
        }
      }
      path += ' Z'; // Close the path
      return path;
    };

    // Add shapes for nodes - squares for males, circles for females, star for David
    nodeGroups.each(function(d) {
      const node = d3.select(this);
      // Check gender based on class field or name field (females have "female" in class or "sister" in name)
      const isFemale = (d.data.class && d.data.class.includes('female')) || 
                       (d.data.name && d.data.name.toLowerCase().includes('sister'));
      const isMale = !isFemale; // Default to male if not explicitly female
      // Check if this is the Jesus node (case-insensitive, robust)
      const isJesus = d.data.name && d.data.name.toLowerCase().includes('jesus') && d.data.name.toLowerCase().includes('yeshua');
      // Check if this is the David node (case-insensitive)
      const isDavid = d.data.name && d.data.name.toLowerCase().includes('david');
      // Check if this is the Abraham/Abram node (case-insensitive)
      const isAbraham = d.data.name && (d.data.name.toLowerCase().includes('abraham') || d.data.name.toLowerCase().includes('abram'));
      // Check if this node should be rendered as a star (David or Abraham)
      const isStar = isDavid || isAbraham;
      // Determine color based on class (keeping existing color logic)
      let fillColor = "#f97316"; // default - Others (orange)
      if (d.data.class && d.data.class.includes('major')) fillColor = "#dc2626";
      else if (d.data.class && d.data.class.includes('priest')) fillColor = "#7c2d12";
      else if (d.data.class && d.data.class.includes('Israel')) fillColor = "#16a34a";
      if (isJesus) {
        // Render Jesus node as an image with border
        // Add border rectangle first
        node.append("rect")
          .attr("x", -19.5) // Slightly larger than image to create border effect
          .attr("y", -19.5)
          .attr("width", 39)
          .attr("height", 39)
          .style("fill", "none")
          .style("stroke", getStrokeColor())
          .style("stroke-width", 3)
          .style("cursor", "pointer")
          .on("click", function(event, d) {
            setSelectedNode(d.data);
            setShowModal(true);
            zoomToNodeOnClick(d.data);
          });
        
        // Add the image on top
        node.append("image")
          .attr("xlink:href", JesusImage)
          .attr("x", -18)
          .attr("y", -18)
          .attr("width", 36)
          .attr("height", 36)
          .style("cursor", "pointer")
          .on("click", function(event, d) {
            setSelectedNode(d.data);
            setShowModal(true);
            zoomToNodeOnClick(d.data);
          })
          .on("mouseover", function(event, d) {
            // Create tooltip inline to use current lang value
            
            // Remove any existing tooltips first
            d3.selectAll(".d3-tooltip").remove();
            
            // Use language-specific fields for tooltip content
            const tooltipName = lang === 'te' 
              ? (d.data.nameTe || d.data.nameEn || d.data.name)
              : (d.data.nameEn || d.data.name);
            
            const tooltipSpouse = lang === 'te'
              ? (d.data.spouseTe || d.data.spouseEn || d.data.spouse)
              : (d.data.spouseEn || d.data.spouse);
              
            const tooltipDetail = lang === 'te'
              ? (d.data.detailTe || d.data.detailEn || d.data.detail)
              : (d.data.detailEn || d.data.detail);
            
            // Create tooltip
            const tooltip = d3.select("body").append("div")
              .attr("class", "d3-tooltip")
              .style("position", "absolute")
              .style("background", "rgba(0, 0, 0, 0.9)")
              .style("color", "white")
              .style("padding", "12px")
              .style("border-radius", "8px")
              .style("font-size", "14px")
              .style("line-height", "1.4")
              .style("pointer-events", "none")
              .style("z-index", "1000")
              .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
              .style("max-width", "320px")
              .style("opacity", 0);

            // Build comprehensive tooltip content using language-specific fields
            let content = `<strong style="font-size: 16px; color: #fbbf24;">${tooltipName}</strong>`;
            
            // Class information
            if (d.data.class) {
              const classLabel = lang === 'te' ? 'వర్గము:' : 'Class:';
              content += `<br/><span style="color: #34d399;">${classLabel}</span> ${d.data.class}`;
            }
            
            // Birth and Death information
            if (d.data.birth) {
              const bornLabel = lang === 'te' ? 'జన్మ:' : 'Born:';
              content += `<br/><span style="color: #60a5fa;">${bornLabel}</span> ${d.data.birth}`;
            }
            
            if (d.data.death) {
              const diedLabel = lang === 'te' ? 'మరణము:' : 'Died:';
              content += `<br/><span style="color: #f87171;">${diedLabel}</span> ${d.data.death}`;
            }
            
            // Age information
            if (d.data.age) {
              const ageLabel = lang === 'te' ? 'వయస్సు:' : 'Age:';
              const yearsLabel = lang === 'te' ? 'సంవత్సరాలు' : 'years';
              content += `<br/><span style="color: #60a5fa;">${ageLabel}</span> ${d.data.age} ${yearsLabel}`;
            }
            
            // Spouse information
            if (tooltipSpouse && tooltipSpouse.length > 0) {
              const spouseLabel = lang === 'te' ? 'భార్య/భర్త:' : 'Spouse:';
              // Handle spouse as string or array
              const spouseText = Array.isArray(tooltipSpouse) ? tooltipSpouse.join(", ") : tooltipSpouse;
              // Clean HTML tags from spouse text
              const cleanSpouseText = spouseText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
              content += `<br/><span style="color: #fb7185;">${spouseLabel}</span> ${cleanSpouseText}`;
            }
            
            // Children information - show inline
            if (d.data.children && Array.isArray(d.data.children) && d.data.children.length > 0) {
              const childrenLabel = lang === 'te' ? 'పిల్లలు:' : 'Children:';
              const childrenNames = d.data.children.map(child => {
                return lang === 'te' 
                  ? (child.nameTe || child.nameEn || child.name) 
                  : (child.nameEn || child.name);
              });
              const childrenText = childrenNames.length > 5 ? 
                `${childrenNames.slice(0, 5).join(", ")} మరియు ${childrenNames.length - 5} మరిన్ని` :
                childrenNames.join(", ");
              content += `<br/><span style="color: #f97316;">${childrenLabel}</span> ${childrenText}`;
            }
            
            // Description/Detail information - use language-specific fields
            if (tooltipDetail) {
              // Clean up HTML tags and format the detail text
              const detailText = tooltipDetail
                .replace(/<br\s*\/?>/gi, ' | ')  // Replace <br> tags with separators
                .replace(/<[^>]*>/g, '')         // Remove other HTML tags
                .replace(/\s+/g, ' ')            // Normalize whitespace
                .trim();
              
              const cleanDetail = detailText.length > 150 ? 
                detailText.substring(0, 147) + "..." : 
                detailText;
              content += `<br/><br/><span style="color: #a78bfa;">${cleanDetail}</span>`;
            }

            tooltip.html(content)
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px")
              .transition()
              .duration(200)
              .style("opacity", 1);
            // Scale up both image and border on hover
            d3.select(this)
              .transition()
              .duration(200)
              .attr("width", 42)
              .attr("height", 42)
              .attr("x", -21)
              .attr("y", -21);
            // Also scale the border
            d3.select(this.parentNode).select("rect")
              .transition()
              .duration(200)
              .attr("width", 45)
              .attr("height", 45)
              .attr("x", -22.5)
              .attr("y", -22.5)
              .style("stroke-width", 4);
          })
          .on("mouseout", function(event, d) {
            d3.selectAll(".d3-tooltip").remove();
            // Scale back both image and border
            d3.select(this)
              .transition()
              .duration(200)
              .attr("width", 36)
              .attr("height", 36)
              .attr("x", -18)
              .attr("y", -18);
            // Also scale back the border
            d3.select(this.parentNode).select("rect")
              .transition()
              .duration(200)
              .attr("width", 39)
              .attr("height", 39)
              .attr("x", -19.5)
              .attr("y", -19.5)
              .style("stroke-width", 3);
          })
          .on("mousemove", function(event, d) {
            d3.selectAll(".d3-tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          });
        return;
      } else if (isStar) {
        // Render David and Abraham nodes as stars
        node.append("path")
          .attr("d", createStarPath(15, 6, 5)) // 5-pointed star
          .style("fill", fillColor)
          .style("stroke", getStrokeColor())
          .style("stroke-width", 3)
          .style("cursor", "pointer")
          .on("click", function(event, d) {
            setSelectedNode(d.data);
            setShowModal(true);
            zoomToNodeOnClick(d.data);
          })
          .on("mouseover", function(event, d) {
            // Create detailed tooltip
            createInlineTooltip(event, d);
            
            // Add hover effect for star
            d3.select(this)
              .transition()
              .duration(200)
              .attr("d", createStarPath(18, 7, 5)) // Larger star on hover
              .style("stroke-width", 4);
          })
          .on("mouseout", function(event, d) {
            // Remove tooltip
            d3.selectAll(".d3-tooltip").remove();
            
            // Remove hover effect for star
            d3.select(this)
              .transition()
              .duration(200)
              .attr("d", createStarPath(15, 6, 5)) // Back to normal size
              .style("stroke-width", 3);
          })
          .on("mousemove", function(event, d) {
            // Update tooltip position as mouse moves
            d3.selectAll(".d3-tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          });
        return;
      } else if (isMale) {
        // Create square for males
        node.append("rect")
          .attr("x", -12)
          .attr("y", -12)
          .attr("width", 24)
          .attr("height", 24)
          .style("fill", fillColor)
          .style("stroke", getStrokeColor())
          .style("stroke-width", 3)
          .style("cursor", "pointer")
          .on("click", function(event, d) {
            setSelectedNode(d.data);
            setShowModal(true);
            zoomToNodeOnClick(d.data);
          })
          .on("mouseover", function(event, d) {
            // Create detailed tooltip
            createInlineTooltip(event, d);
            
            // Add hover effect for squares
            d3.select(this)
              .transition()
              .duration(200)
              .attr("width", 30)
              .attr("height", 30)
              .attr("x", -15)
              .attr("y", -15)
              .style("stroke-width", 4);
          })
          .on("mouseout", function(event, d) {
            // Remove tooltip
            d3.selectAll(".d3-tooltip").remove();
            
            // Remove hover effect for squares
            d3.select(this)
              .transition()
              .duration(200)
              .attr("width", 24)
              .attr("height", 24)
              .attr("x", -12)
              .attr("y", -12)
              .style("stroke-width", 3);
          })
          .on("mousemove", function(event, d) {
            // Update tooltip position as mouse moves
            d3.selectAll(".d3-tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          });
      } else if (isFemale) {
        // Create circle for females
        node.append("circle")
          .attr("r", 12)
          .style("fill", fillColor)
          .style("stroke", getStrokeColor())
          .style("stroke-width", 3)
          .style("cursor", "pointer")
          .on("click", function(event, d) {
            setSelectedNode(d.data);
            setShowModal(true);
            zoomToNodeOnClick(d.data);
          })
          .on("mouseover", function(event, d) {
            // Create detailed tooltip
            createInlineTooltip(event, d);
            
            // Add hover effect for circles
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 15)
              .style("stroke-width", 4);
          })
          .on("mouseout", function(event, d) {
            // Remove tooltip
            d3.selectAll(".d3-tooltip").remove();
            
            // Remove hover effect for circles
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 12)
              .style("stroke-width", 3);
          })
          .on("mousemove", function(event, d) {
            // Update tooltip position as mouse moves
            d3.selectAll(".d3-tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          });
      } else {
        // Default circle for unknown gender
        node.append("circle")
          .attr("r", 12)
          .style("fill", fillColor)
          .style("stroke", getStrokeColor())
          .style("stroke-width", 3)
          .style("cursor", "pointer")
          .on("click", function(event, d) {
            setSelectedNode(d.data);
            setShowModal(true);
            zoomToNodeOnClick(d.data);
          })
          .on("mouseover", function(event, d) {
            // Create detailed tooltip
            createInlineTooltip(event, d);
            
            // Add hover effect
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 15)
              .style("stroke-width", 4);
          })
          .on("mouseout", function(event, d) {
            // Remove tooltip
            d3.selectAll(".d3-tooltip").remove();
            
            // Remove hover effect
            d3.select(this)
              .transition()
              .duration(200)
              .attr("r", 12)
              .style("stroke-width", 3);
          })
          .on("mousemove", function(event, d) {
            // Update tooltip position as mouse moves
            d3.selectAll(".d3-tooltip")
              .style("left", (event.pageX + 15) + "px")
              .style("top", (event.pageY - 10) + "px");
          });
      }
    });

    // Add background rectangles for text labels first
    const textBackgrounds = nodeGroups.append("rect")
      .attr("class", "text-background")
      .style("fill", isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)")
      .style("stroke", isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)")
      .style("stroke-width", "0.5px")
      .style("rx", "3px") // Rounded corners
      .style("ry", "3px")
      .style("pointer-events", "none");

    // Add simple text labels positioned based on layout orientation
    const textLabels = nodeGroups.append("text")
      .attr("class", "node-label") // Add class to identify node name labels
      .attr("dy", isVertical ? "30px" : "0.35em") // Below for vertical with more padding, center for horizontal
      .attr("dx", isVertical ? "0" : "20px") // Center for vertical, right for horizontal
      .style("text-anchor", isVertical ? "middle" : "start") // Center for vertical, left for horizontal
      .style("font-size", "8px")
      .style("font-weight", "600")
      .style("font-family", "'Segoe UI', 'Noto Sans Telugu', 'Telugu Sangam MN', Arial, sans-serif") // Better Telugu font support
      .style("fill", getTextColor)
      .style("pointer-events", "none")
      .text(d => {
        // Improved fallback logic that respects language preference
        let name;
        if (lang === 'te') {
          // For Telugu: try displayName, then nameTe, then nameEn, then name
          name = d.data.displayName || d.data.nameTe || d.data.nameEn || d.data.name;
        } else {
          // For English: try displayName, then nameEn, then name
          name = d.data.displayName || d.data.nameEn || d.data.name;
        }
        
        // Debug logging for specific nodes
        if (d.data.name === 'Adam' || d.data.nameEn === 'Adam' || d.data.name === 'Seth' || 
            d.data.name === 'Methuselah' || d.data.name === 'Lamech') {
        }
        // Truncate long names
        return name.length > 20 ? name.substring(0, 17) + "..." : name;
      });

    // Position and size the background rectangles based on text dimensions
    textLabels.each(function(d) {
      const textElement = d3.select(this);
      const bbox = textElement.node().getBBox();
      const backgroundRect = d3.select(this.parentNode).select('.text-background');
      
      // Add padding around the text
      const padding = 2;
      backgroundRect
        .attr("x", bbox.x - padding)
        .attr("y", bbox.y - padding)
        .attr("width", bbox.width + (padding * 2))
        .attr("height", bbox.height + (padding * 2));
    });

    // Add expand/collapse icons - FINAL LOGIC
    nodeGroups.each(function(d) {
      const nodeGroup = d3.select(this);
      
      // FINAL RULE: 
      // Show expand (+) icon: if node has _children and no visible children
      // Show collapse (-) icon: if node has visible children AND was expanded by user
      // Show NO icon: if node has visible children from original data (not expanded by user)
      const hasHiddenChildren = d.data._children && Array.isArray(d.data._children) && d.data._children.length > 0;
      const hasVisibleChildren = d.data.children && Array.isArray(d.data.children) && d.data.children.length > 0;
      const wasExpandedByUser = d.data._expandedByUser === true;
      
      if (hasHiddenChildren && !hasVisibleChildren) {
        // Show expand icon
        
        const button = nodeGroup.append("g")
          .attr("class", "expand-collapse-btn")
          .style("cursor", "pointer")
          .attr("transform", isVertical ? "translate(12, -12)" : "translate(15, -8)")
          .on("click", function(event, d) {
            event.stopPropagation();
            toggleNode(d.data);
          });
        
        button.append("circle")
          .attr("r", 4)
          .style("fill", isDarkMode ? "#374151" : "#f3f4f6")
          .style("stroke", isDarkMode ? "#6b7280" : "#9ca3af")
          .style("stroke-width", 0.5);
        
        button.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.25em")
          .style("font-size", "6px")
          .style("font-weight", "bold")
          .style("fill", isDarkMode ? "#d1d5db" : "#374151")
          .style("pointer-events", "none")
          .text("+");
      } else if (hasVisibleChildren && wasExpandedByUser) {
        // Show collapse icon (only for user-expanded nodes)

        
        const button = nodeGroup.append("g")
          .attr("class", "expand-collapse-btn")
          .style("cursor", "pointer")
          .attr("transform", isVertical ? "translate(12, -12)" : "translate(15, -8)")
          .on("click", function(event, d) {
            event.stopPropagation();
            toggleNode(d.data);
          });
        
        button.append("circle")
          .attr("r", 4)
          .style("fill", isDarkMode ? "#374151" : "#f3f4f6")
          .style("stroke", isDarkMode ? "#6b7280" : "#9ca3af")
          .style("stroke-width", 0.5);
        
        button.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.25em")
          .style("font-size", "6px")
          .style("font-weight", "bold")
          .style("fill", isDarkMode ? "#d1d5db" : "#374151")
          .style("pointer-events", "none")
          .text("-");
      } else {
      }
    });

    }; // End of createTreeElements function

    // Initial tree creation
    const treeData = treeLayout(root);

    // Adjust coordinates based on layout orientation
    treeData.descendants().forEach(d => {
      if (isVertical) {
        // Vertical layout - keep original coordinates
        d.x = d.x * 2.2; // Increase horizontal spacing significantly for better text readability
        d.y = d.y * 2.0; // Increase vertical spacing for better visual separation
      } else {
        // Horizontal layout - swap x and y coordinates
        const temp = d.x;
        d.x = d.y * 2.2; // Increase horizontal spacing significantly
        d.y = temp * 2.5; // Increase vertical spacing even more for horizontal layout
      }
    });

    // Create initial tree
    createTreeElements(treeData);

    // Debug: List all available nodes in the chart for search debugging
    setTimeout(() => {
      const svg = d3.select(svgRef.current);
      const nodes = svg.selectAll('.node');

      nodes.each(function(d, i) {

      });

      
      // Zoom to Adam after everything is rendered and debug info is logged
      if (nodes.size() > 0) {
        zoomToPerson("Adam");
      }
    }, 500); // Increased delay to ensure everything is fully rendered

  }, [isVertical, lineStyle, expandAll, forceUpdate]); // Removed 'lang' - language changes only affect text, not structure

  // Handle language changes by updating only the text elements (no chart rebuild needed)
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    // Update language indicator
    svg.select("text")
      .style("fill", lang === 'te' ? "#e11d48" : "#3b82f6")
      .text(`Lang: ${lang} ${lang === 'te' ? '(తెలుగు)' : '(English)'}`);
    
    // Update all node text labels to show correct language (but NOT expand/collapse button text)
    svg.selectAll('.node text.node-label')
      .text(d => {
        // Use the same logic as in main chart creation
        let name;
        if (lang === 'te') {
          // For Telugu: try displayName, then nameTe, then nameEn, then name
          name = d.data.displayName || d.data.nameTe || d.data.nameEn || d.data.name;
        } else {
          // For English: try displayName, then nameEn, then name
          name = d.data.displayName || d.data.nameEn || d.data.name;
        }
        
        // Truncate long names
        return name.length > 20 ? name.substring(0, 17) + "..." : name;
      });

    // Update text background rectangles to fit new text
    svg.selectAll('.node').each(function(d) {
      const nodeGroup = d3.select(this);
      const textElement = nodeGroup.select('text');
      const backgroundRect = nodeGroup.select('.text-background');
      
      if (textElement.node() && backgroundRect.node()) {
        const bbox = textElement.node().getBBox();
        const padding = 2;
        backgroundRect
          .attr("x", bbox.x - padding)
          .attr("y", bbox.y - padding)
          .attr("width", bbox.width + (padding * 2))
          .attr("height", bbox.height + (padding * 2));
      }
    });
    
  }, [lang]); // Only run when language changes

  // Handle zoom preservation during expand/collapse all changes  
  useEffect(() => {
    // Save current transform BEFORE expand/collapse change triggers re-render
    const svg = d3.select(svgRef.current);
    
    if (svgRef.current) {
      try {
        const currentTransform = d3.zoomTransform(svgRef.current);
        if (currentTransform && (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {

          setSavedTransform(currentTransform);
        }
      } catch (error) {

      }
    }
  }, [expandAll]); // Save transform when expandAll changes

  // Handle zoom preservation during line style changes
  useEffect(() => {
    // Save current transform when line style is about to change
    const currentTransform = transform;
    if (currentTransform && (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {
      setSavedTransformForLineStyle(currentTransform);
    }
  }, [lineStyle]); // Save transform when line style changes

  // Save line style preference to localStorage
  useEffect(() => {
    localStorage.setItem('d3ChartLineStyle', lineStyle);
  }, [lineStyle]);

  // Restore zoom after chart re-render
  useEffect(() => {
    if ((savedTransform || savedTransformForLineStyle) && svgRef.current) {
      const svg = d3.select(svgRef.current);
      
      // Wait for the chart to be fully rendered, then restore transform
      const attemptRestore = () => {
        const zoomBehavior = svg.node()?.zoomBehavior;
        const hasContent = svg.selectAll('g.node').size() > 0; // Check if nodes are rendered
        
        if (zoomBehavior && hasContent) {
          const transformToRestore = savedTransformForLineStyle || savedTransform;

          
          try {
            svg.call(zoomBehavior.transform, transformToRestore);

            setSavedTransform(null); // Clear saved transform after restoration
            setSavedTransformForLineStyle(null); // Clear line style transform after restoration
          } catch (error) {

            setSavedTransform(null);
            setSavedTransformForLineStyle(null);
          }
        } else {
          // If chart not ready, try again in a bit
          setTimeout(attemptRestore, 100);
        }
      };
      
      // Start restoration attempt after a small delay
      setTimeout(attemptRestore, 200);
    }
  }, [savedTransform, savedTransformForLineStyle]); // Restore when either savedTransform is set

  // Update text colors when theme changes
  useEffect(() => {
    if (!svgRef.current) return;

    
    const svg = d3.select(svgRef.current);
    
    // Update all node text colors (only node labels, not expand/collapse buttons)
    svg.selectAll('.node text.node-label')
      .style('fill', getTextColor());
    
    // Update text background colors
    svg.selectAll('.text-background')
      .style('fill', isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.9)")
      .style('stroke', isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)");
      
  }, [isDarkMode]); // Update colors when theme changes

  // Function to convert bilingual genealogy data to hierarchical format
  const convertToHierarchy = (data, language = 'en') => {

    
    const addTranslatedNames = (node, currentDepth = 0, maxDepth = 6) => {
      // Use correct fields as specified:
      // For display: nameEn/nameTe, spouseEn/spouseTe, detailEn/detailTe
      // For search: always use "name" field
      const displayName = language === 'te' 
        ? (node.nameTe || node.nameEn || node.name) 
        : (node.nameEn || node.name);
      const displaySpouse = language === 'te' 
        ? (node.spouseTe || node.spouseEn || node.spouse)
        : (node.spouseEn || node.spouse);
      const displayDetail = language === 'te' 
        ? (node.detailTe || node.detailEn || node.detail)
        : (node.detailEn || node.detail);
      
      // Debug logging for first few nodes
      if ((node.name === 'Adam') || currentDepth <= 1 || 
          node.name === 'Methuselah' || node.name === 'Lamech') {
        // Debug information available but not logged
      }
      
      const result = {
        ...node,
        displayName: displayName,
        searchName: node.name, // Keep original "name" field for search functionality
        nameEn: node.nameEn,
        nameTe: node.nameTe,
        // Use language-specific display fields
        spouse: displaySpouse,
        spouseEn: node.spouseEn,
        spouseTe: node.spouseTe,
        detail: displayDetail,
        detailEn: node.detailEn,
        detailTe: node.detailTe
      };
      
      // Clean up empty children string - remove if empty
      if (node.children === "" || node.children === null || node.children === undefined) {
        delete result.children;
      }
      
      // If node has children array, these will be visible immediately
      if (currentDepth < maxDepth && node.children && Array.isArray(node.children) && node.children.length > 0) {
        result.children = node.children.slice(0, 3).map(child => addTranslatedNames(child, currentDepth + 1, maxDepth));
      }
      
      // Handle _children based on expandAll state
      if (currentDepth < maxDepth && node._children && Array.isArray(node._children) && node._children.length > 0) {

        if (expandAll) {
          // If expandAll is true, move _children to children (expand them)
          const expandedChildren = node._children.slice(0, 3).map(child => addTranslatedNames(child, currentDepth + 1, maxDepth));
          if (result.children) {
            result.children = [...result.children, ...expandedChildren];
          } else {
            result.children = expandedChildren;
          }
          result._expandedByUser = true;

        } else {
          // If expandAll is false, keep _children hidden
          result._children = node._children.slice(0, 3).map(child => addTranslatedNames(child, currentDepth + 1, maxDepth));
          // Don't create visible children if we have _children and expandAll is false
          if (!node.children || !Array.isArray(node.children) || node.children.length === 0) {
            delete result.children;
          }

        }
      }
      
      return result;
    };
    
    return addTranslatedNames(data);
  };

  // Function to expand all nodes with _children
  const expandAllNodes = () => {

    
    // Save current transform before state change
    const currentTransform = transform;
    if (currentTransform && (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {
      setSavedTransform(currentTransform);
    }
    
    setExpandAll(true);
    setForceUpdate(prev => prev + 1); // Force re-render

  };

  // Function to collapse all user-expanded nodes  
  const collapseAllNodes = () => {

    
    // Save current transform before state change
    const currentTransform = transform;
    if (currentTransform && (currentTransform.k !== 1 || currentTransform.x !== 0 || currentTransform.y !== 0)) {
      setSavedTransform(currentTransform);
    }
    
    setExpandAll(false);
    setForceUpdate(prev => prev + 1); // Force re-render

  };

  // Function to toggle expand/collapse all
  const toggleExpandCollapseAll = () => {

    if (expandAll) {

      collapseAllNodes();
    } else {

      expandAllNodes();
    }
  };

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    const zoom = svg.node().zoomBehavior;
    if (zoom) {
      const newScale = Math.min(transform.k * 1.2, 5);
      svg.transition().duration(300).call(
        zoom.transform,
        d3.zoomIdentity.translate(transform.x, transform.y).scale(newScale)
      );
    }
  };

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    const zoom = svg.node().zoomBehavior;
    if (zoom) {
      const newScale = Math.max(transform.k / 1.2, 0.1);
      svg.transition().duration(300).call(
        zoom.transform,
        d3.zoomIdentity.translate(transform.x, transform.y).scale(newScale)
      );
    }
  };

  const handleReset = () => {
    const svg = d3.select(svgRef.current);
    const zoom = svg.node().zoomBehavior;
    if (zoom) {
      const width = isVertical ? 2400 : 4000;
      const height = isVertical ? 4000 : 2400;
      const initialScale = 0.5;
      const translateX = (width / 2) - (width * initialScale / 4);
      const translateY = 30;
      
      svg.transition().duration(500).call(
        zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY).scale(initialScale)
      );
    }
  };

  const handleZoomSlider = (event) => {
    const newZoomLevel = parseInt(event.target.value);
    const newScale = newZoomLevel / 100;
    const svg = d3.select(svgRef.current);
    const zoom = svg.node().zoomBehavior;
    
    if (zoom) {
      // Get the SVG dimensions
      const svgNode = svg.node();
      const rect = svgNode.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate the transform to zoom from center
      const currentTransform = d3.zoomTransform(svgNode);
      const scaleRatio = newScale / currentTransform.k;
      
      // Calculate new translation to maintain center point
      const newTranslateX = centerX - (centerX - currentTransform.x) * scaleRatio;
      const newTranslateY = centerY - (centerY - currentTransform.y) * scaleRatio;
      
      svg.call(
        zoom.transform,
        d3.zoomIdentity.translate(newTranslateX, newTranslateY).scale(newScale)
      );
    }
  };

  const handleDownload = () => {
    const svgElement = svgRef.current;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'genealogy-chart.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Search functionality
  const handleSearch = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    
    if (term.length >= 2) {

      
      const results = [];
      const maxResults = 10;
      const searchTerm = term.toLowerCase();
      
      // Function to search in bilingual data
      const searchInBilingualData = () => {
        const searchInNode = (node) => {
          if (results.length >= maxResults) return;
          
          // As specified: Use only "name" field for search
          const searchName = (node.name || '').toLowerCase();
          
          // Search only in the "name" field as per user requirement
          if (searchName.includes(searchTerm)) {

            
            // Use the appropriate display name based on current language
            const displayName = lang === 'te' 
              ? (node.nameTe || node.nameEn || node.name) 
              : (node.nameEn || node.name);
            
            results.push({
              name: displayName,
              description: node.description || node.detail,
              birth: node.birth,
              node: node, // Keep the original node reference for better matching
              id: node.id || node.name,
              // Add additional fields for better matching
              originalName: node.name,
              nameEn: node.nameEn,
              nameTe: node.nameTe
            });
          }
          
          // Search in children
          if (node.children && Array.isArray(node.children)) {
            node.children.forEach(child => searchInNode(child));
          }
          
          // Search in _children (collapsed nodes)
          if (node._children && Array.isArray(node._children)) {
            node._children.forEach(child => searchInNode(child));
          }
        };
        
        // Search in the bilingual data
        if (genealogyBilingualData) {
          searchInNode(genealogyBilingualData);
        }
      };
      
      searchInBilingualData();

      
      // Debug: log what nodes are actually in the search results

      results.forEach((result, index) => {

      });
      
      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const zoomToPerson = (person) => {
    try {

      const svg = d3.select(svgRef.current);
      const zoom = svg.node()?.zoomBehavior;
      
      if (!zoom) {

        return;
      }
      
      // Find the node in the SVG by name since we don't have consistent IDs
      const nodes = svg.selectAll('.node');
      let targetNode = null;
      
      // Get the target name from the person object
      const targetName = typeof person === 'string' ? person : (person.name || (person.node && person.node.name));

      
      // Also get the original node data for more robust matching
      const originalNode = typeof person === 'object' ? person.node : null;

      
      nodes.each(function(d) {

        
        // Multiple matching strategies for better results with bilingual data
        let isMatch = false;
        
        // Strategy 1: Direct name match (current display name)
        if (d.data.name && targetName && 
            d.data.name.toLowerCase() === targetName.toLowerCase()) {
          isMatch = true;

        }
        
        // Strategy 2: Match with bilingual names (nameEn, nameTe)
        if (!isMatch && originalNode) {
          if ((d.data.nameEn && originalNode.nameEn && 
               d.data.nameEn.toLowerCase() === originalNode.nameEn.toLowerCase()) ||
              (d.data.nameTe && originalNode.nameTe && 
               d.data.nameTe.toLowerCase() === originalNode.nameTe.toLowerCase()) ||
              (d.data.originalName && originalNode.originalName && 
               d.data.originalName.toLowerCase() === originalNode.originalName.toLowerCase())) {
            isMatch = true;

          }
        }
        
        // Strategy 3: Contains match for any name variant
        if (!isMatch && d.data && targetName) {
          const checkFields = [d.data.name, d.data.nameEn, d.data.nameTe, d.data.displayName];
          for (const field of checkFields) {
            if (field && field.toLowerCase().includes(targetName.toLowerCase())) {
              isMatch = true;

              break;
            }
          }
        }
        
        // Strategy 4: Try reverse contains (target contains node name)
        if (!isMatch && d.data.name && targetName && 
            targetName.toLowerCase().includes(d.data.name.toLowerCase())) {
          isMatch = true;

        }
        
        if (isMatch) {
          targetNode = d;

          return; // Exit the loop early
        }
      });
      
      if (targetNode) {
        const margin = { top: 150, right: 150, bottom: 150, left: 150};
        const targetX = targetNode.x + margin.left;
        const targetY = targetNode.y + margin.top;
        
        // Get actual container dimensions (browser viewport)
        const containerElement = svg.node().parentElement;
        const containerRect = containerElement.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;



        
        // Calculate transform to center the target node with 5x zoom for search (500%)
        const scale = 5;
        const translateX = centerX - (targetX * scale);
        const translateY = centerY - (targetY * scale);

        
        // Animate to the target
        svg.transition()
          .duration(1000)
          .call(
            zoom.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
          );
        
        // Update zoom level display
        setZoomLevel(500);

        
        // Also highlight the found node temporarily
        // Find the actual DOM element for this node
        const allNodes = svg.selectAll('.node');
        let targetDOMElement = null;
        
        allNodes.each(function(d) {
          if (d === targetNode) {
            targetDOMElement = this; // 'this' is the DOM element
          }
        });
        
        if (targetDOMElement) {
          const nodeElement = d3.select(targetDOMElement);
          const circle = nodeElement.select('circle');
          
          if (!circle.empty()) {
            const originalFill = circle.attr('fill');
            
            // Flash the node to indicate it was found
            circle
              .transition()
              .duration(300)
              .attr('fill', '#ff6b6b')
              .transition()
              .duration(300)
              .attr('fill', originalFill)
              .transition()
              .duration(300)
              .attr('fill', '#ff6b6b')
              .transition()
              .duration(300)
              .attr('fill', originalFill);
          }
        }
          
      } else {


        nodes.each(function(d) {

        });
        
        // Show an alert or notification that the person wasn't found
        if (typeof person !== 'string' || person !== 'Adam') { // Don't show alert for initial Adam zoom
          alert(lang === 'te' ? 
            'వ్యక్తి చార్ట్‌లో కనుగొనబడలేదు. వారు కుంచించబడి ఉండవచ్చు.' : 
            'Person not found in chart. They might be collapsed under a parent node.');
        }
      }
      
      // Clear search
      setSearchTerm('');
      setShowSearchResults(false);
      setSearchResults([]);
      
    } catch (error) {

      // Don't show error alert for initial Adam zoom
      if (typeof person !== 'string' || person !== 'Adam') {
        alert('Error occurred while searching. Please try again.');
      }
    }
  };

  // Function to zoom to a specific node when clicked (750% zoom)
  const zoomToNodeOnClick = (nodeData) => {

    const svg = d3.select(svgRef.current);
    const zoom = svg.node().zoomBehavior;
    
    if (!zoom) return;
    
    // Find the node in the SVG
    const nodes = svg.selectAll('.node');
    let targetNode = null;
    
    nodes.each(function(d) {
      if (d.data.name === nodeData.name) {
        targetNode = d;

      }
    });
    
    if (targetNode) {
      const margin = { top: 150, right: 150, bottom: 150, left: 150};
      const targetX = targetNode.x + margin.left;
      const targetY = targetNode.y + margin.top;
      
      // Get actual container dimensions (browser viewport)
      const containerElement = svg.node().parentElement;
      const containerRect = containerElement.getBoundingClientRect();
      const centerX = containerRect.width / 2;
      const centerY = containerRect.height / 2;



      
      // Calculate transform to center the target node with 7.5x zoom for node clicks (750%)
      const scale = 7.5;
      const translateX = centerX - (targetX * scale);
      const translateY = centerY - (targetY * scale);

      
      // Animate to the target
      svg.transition()
        .duration(1000)
        .call(
          zoom.transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
      
      // Update zoom level display
      setZoomLevel(750);

    } else {

    }
  };

  // Function to zoom to a specific node (for click events)
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Mobile panel functions
  const toggleMobilePanel = () => {
    setIsMobilePanelOpen(!isMobilePanelOpen);
  };

  const closeMobilePanelAfterAction = () => {
    // Auto-close mobile panel after performing any action
    if (window.innerWidth <= 768) {
      setIsMobilePanelOpen(false);
    }
  };

  // Wrapper functions that include auto-close for mobile
  const handleZoomInMobile = () => {
    handleZoomIn();
    closeMobilePanelAfterAction();
  };

  const handleZoomOutMobile = () => {
    handleZoomOut();
    closeMobilePanelAfterAction();
  };

  const handleResetMobile = () => {
    handleReset();
    closeMobilePanelAfterAction();
  };

  const handleDownloadMobile = () => {
    handleDownload();
    closeMobilePanelAfterAction();
  };

  const setIsVerticalMobile = (value) => {
    setIsVertical(value);
    closeMobilePanelAfterAction();
  };

  const setLineStyleMobile = (style) => {
    setLineStyle(style);
    closeMobilePanelAfterAction();
  };

  return (
    <div>
      <PageHeader 
        title={lang === 'te' ? 'బైబిలికల్ ఫ్యామిలీ ట్రీ' : 'Biblical Family Tree'}
        icon={<FaSitemap />}
      />
    <div className="d3-chart-container" style={{ 
      position: 'relative',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
        : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #fef3c7 100%)',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Title Header */}

      {/* Mobile Panel Toggle Button */}
      <button
        className="mobile-panel-toggle"
        onClick={toggleMobilePanel}
        style={{
          position: 'fixed',
          top: '50%',
          right: isMobilePanelOpen ? '100vw' : '10px',
          transform: 'translateY(-50%)',
          zIndex: 1200,
          background: isDarkMode ? '#6366f1' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '12px 0 0 12px',
          width: '50px',
          height: '50px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          display: 'none' // Hidden on desktop
        }}
        title={isMobilePanelOpen ? 'Close Panel' : 'Open Controls'}
      >
        {isMobilePanelOpen ? '×' : '⚙'}
      </button>

      {/* Floating Controls Panel */}
      <div className={`d3-chart-controls-panel ${isMobilePanelOpen ? 'mobile-open' : ''}`} style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1100,
        background: isDarkMode 
          ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(51, 65, 85, 0.95) 100%)' 
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        backdropFilter: 'blur(15px)',
        padding: '25px',
        borderRadius: '20px',
        border: `2px solid ${isDarkMode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.2)'}`,
        boxShadow: isDarkMode 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.4)' 
          : '0 25px 50px -12px rgba(79, 70, 229, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minWidth: '320px',
        overflow: 'visible',
        // Mobile styles will be overridden by CSS media queries
      }}>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobilePanelOpen(false)}
          style={{
            display: 'none', // Hidden on desktop, shown on mobile via CSS
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            width: '40px',
            height: '40px',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 1200,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          className="mobile-close-button"
        >
          ×
        </button>

        {/* Search Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: getTextColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {lang === 'te' ? 'వెతకండి' : 'Search'}
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={lang === 'te' ? 'వ్యక్తి పేరు వెతకండి...' : 'Search for a person...'}
              style={{
                width: '100%',
                padding: '8px 30px 8px 12px',
                fontSize: '14px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'var(--card-bg)',
                color: getTextColor(),
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
                // Delay hiding results to allow click on result
                setTimeout(() => setShowSearchResults(false), 200);
              }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            )}

            {/* Search Dropdown - positioned directly under input */}
            {showSearchResults && searchResults.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                zIndex: 1200,
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '4px'
              }}>
                {searchResults.map((person, index) => (
                  <div
                    key={person.id || index}
                    onClick={() => zoomToPerson(person)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: index < searchResults.length - 1 ? '1px solid var(--border-color)' : 'none',
                      cursor: 'pointer',
                      color: getTextColor(),
                      transition: 'background-color 0.2s ease',
                      fontSize: '14px',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      margin: '2px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                      {person.displayName || person.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zoom Controls Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: getTextColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {lang === 'te' ? 'జూమ్ నియంత్రణలు' : 'Zoom Controls'}
          </label>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={handleZoomOutMobile} 
              title={safeTranslations.d3Chart.zoomOut}
              style={{
                padding: '8px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <FaSearchMinus />
            </button>

            {/* Zoom Range Slider */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              backgroundColor: 'var(--card-bg)',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              flex: 1
            }}>
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                minWidth: '25px'
              }}>
                10%
              </span>
              <input
                type="range"
                min="10"
                max="1000"
                value={zoomLevel}
                onChange={handleZoomSlider}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${((zoomLevel - 10) / (1000 - 10)) * 100}%, var(--border-color) ${((zoomLevel - 10) / (1000 - 10)) * 100}%, var(--border-color) 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--text-secondary)',
                minWidth: '35px'
              }}>
                1000%
              </span>
              <span style={{ 
                fontSize: '12px', 
                color: getTextColor(),
                fontWeight: '600',
                minWidth: '40px'
              }}>
                {zoomLevel}%
              </span>
            </div>
            
            <button 
              onClick={handleZoomInMobile} 
              title={safeTranslations.d3Chart.zoomIn}
              style={{
                padding: '8px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <FaSearchPlus />
            </button>
          </div>
        </div>
        {/* Actions & Layout Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: getTextColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {lang === 'te' ? 'చర్యలు, లేఅవుట్ & లైన్ స్టైల్' : 'Actions, Layout & Line Style'}
          </label>
          
          {/* All Buttons in One Row */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {/* Pan Tool Button */}
            <button 
              title={safeTranslations.d3Chart.panTool}
              style={{
                padding: '6px 8px',
                backgroundColor: isPanMode ? '#10b981' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <FaHandPaper />
              <span style={{ fontSize: '10px' }}></span>
            </button>
            
            <button 
              onClick={handleResetMobile} 
              title={safeTranslations.d3Chart.resetView}
              style={{
                padding: '6px 8px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <FaRedo />
              <span style={{ fontSize: '10px' }}></span>
            </button>
            
            <button 
              onClick={handleDownloadMobile} 
              title={safeTranslations.d3Chart.downloadChart}
              style={{
                padding: '6px 8px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              <FaDownload />
              <span style={{ fontSize: '10px' }}></span>
            </button>
            
            {/* Layout Controls */}
            <button 
              onClick={() => setIsVerticalMobile(true)}
              title={safeTranslations.d3Chart.verticalLayout}
              style={{
                padding: '6px 8px',
                backgroundColor: isVertical ? '#10b981' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (!isVertical) e.target.style.backgroundColor = '#475569';
              }}
              onMouseOut={(e) => {
                if (!isVertical) e.target.style.backgroundColor = '#64748b';
              }}
            >
              <FaArrowsAltV />
              <span style={{ fontSize: '10px' }}></span>
            </button>

            <button 
              onClick={() => setIsVerticalMobile(false)}
              title={safeTranslations.d3Chart.horizontalLayout}
              style={{
                padding: '6px 8px',
                backgroundColor: !isVertical ? '#10b981' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                if (isVertical) e.target.style.backgroundColor = '#475569';
              }}
              onMouseOut={(e) => {
                if (isVertical) e.target.style.backgroundColor = '#64748b';
              }}
            >
              <FaArrowsAltH />
              <span style={{ fontSize: '10px' }}></span>
            </button>
            <button 
              onClick={() => setLineStyleMobile('straight')}
              title={lang === 'te' ? 'నేరుగా లైన్లు' : 'Straight Lines'}
              style={{
                padding: '8px',
                backgroundColor: lineStyle === 'straight' ? '#10b981' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                height: '36px'
              }}
              onMouseOver={(e) => {
                if (lineStyle !== 'straight') e.target.style.backgroundColor = '#475569';
              }}
              onMouseOut={(e) => {
                if (lineStyle !== 'straight') e.target.style.backgroundColor = '#64748b';
              }}
            >
              ┌─┐
            </button>
            
            <button 
              onClick={() => setLineStyleMobile('curved')}
              title={lang === 'te' ? 'వంకర లైన్లు' : 'Curved Lines'}
              style={{
                padding: '8px',
                backgroundColor: lineStyle === 'curved' ? '#10b981' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                height: '36px'
              }}
              onMouseOver={(e) => {
                if (lineStyle !== 'curved') e.target.style.backgroundColor = '#475569';
              }}
              onMouseOut={(e) => {
                if (lineStyle !== 'curved') e.target.style.backgroundColor = '#64748b';
              }}
            >
              ╭─╮
            </button>
            
            <button 
              onClick={() => setLineStyleMobile('diagonal')}
              title={lang === 'te' ? 'వికర్ణ లైన్లు' : 'Diagonal Lines'}
              style={{
                padding: '8px',
                backgroundColor: lineStyle === 'diagonal' ? '#10b981' : '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                height: '36px'
              }}
              onMouseOver={(e) => {
                if (lineStyle !== 'diagonal') e.target.style.backgroundColor = '#475569';
              }}
              onMouseOut={(e) => {
                if (lineStyle !== 'diagonal') e.target.style.backgroundColor = '#64748b';
              }}
            >
              ╱
            </button>
          </div>
        </div>

        {/* Expand/Collapse All Controls - TEMPORARILY HIDDEN */}
        {/* 
        <div style={{ 
          padding: '16px', 
          background: isDarkMode 
            ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)' 
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
          border: `1px solid ${isDarkMode ? '#475569' : '#e2e8f0'}`,
          borderRadius: '12px',
          minWidth: '200px',
          backdropFilter: 'blur(10px)',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontSize: '12px', 
            fontWeight: '600', 
            color: getTextColor(),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {lang === 'te' ? 'అన్నింటినీ విస్తరించు/కుంచించు' : 'Expand/Collapse All'}
          </label>
          
          <button 
            onClick={toggleExpandCollapseAll}
            title={expandAll ? 
              (lang === 'te' ? 'అన్నింటినీ కుంచించు' : 'Collapse All') : 
              (lang === 'te' ? 'అన్నింటినీ విస్తరించు' : 'Expand All')
            }
            style={{
              padding: '8px 12px',
              backgroundColor: expandAll ? '#ef4444' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              minWidth: '140px',
              height: '36px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = expandAll ? '#dc2626' : '#059669';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = expandAll ? '#ef4444' : '#10b981';
            }}
          >
            {expandAll ? <FaCompressArrowsAlt /> : <FaExpandArrowsAlt />}
            {expandAll ? 
              (lang === 'te' ? 'Collapse All' : 'Collapse All') : 
              (lang === 'te' ? 'Expand All' : 'Expand All')
            }
          </button>
        </div>
        */}

        {/* Legends Container - Side by Side */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          flexWrap: 'nowrap'
        }}>
          {/* Color Legend */}
          <div style={{ 
            padding: '16px',
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)' 
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            borderRadius: '12px',
            border: `2px solid ${isDarkMode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.2)'}`,
            boxShadow: isDarkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.25)' 
              : '0 10px 25px -5px rgba(79, 70, 229, 0.1)',
            flex: '1',
            minWidth: '200px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: getTextColor(),
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {lang === 'te' ? 'రంగు వివరణ' : 'Legend'}
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '16px', 
                  height: '3px', 
                  backgroundColor: '#9333ea',
                  borderRadius: '2px'
                }}></div>
                <span style={{ color: getTextColor(), fontWeight: '600' }}>
                  {lang === 'te' ? 'ఆదము నుండి యేసు వరకు' : 'Adam to Jesus'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#dc2626', 
                  borderRadius: '50%',
                  border: '1px solid #fff'
                }}></div>
                <span style={{ color: getTextColor() }}>
                  {lang === 'te' ? 'ప్రధాన వ్యక్తులు' : 'Major Figures'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#7c2d12', 
                  borderRadius: '50%',
                  border: '1px solid #fff'
                }}></div>
                <span style={{ color: getTextColor() }}>
                  {lang === 'te' ? 'యాజకులు' : 'Priests'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#16a34a', 
                  borderRadius: '50%',
                  border: '1px solid #fff'
                }}></div>
                <span style={{ color: getTextColor() }}>
                  {lang === 'te' ? 'ఇశ్రాయేలు గోత్రాలు' : 'Israel Tribes'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#f97316', 
                  borderRadius: '50%',
                  border: '1px solid #fff'
                }}></div>
                <span style={{ color: getTextColor() }}>
                  {lang === 'te' ? 'ఇతరులు' : 'Others'}
                </span>
              </div>
            </div>
          </div>

          {/* Gender Legend */}
          <div style={{ 
            padding: '16px',
            background: isDarkMode 
              ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%)' 
              : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            borderRadius: '12px',
            border: `2px solid ${isDarkMode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(79, 70, 229, 0.2)'}`,
            boxShadow: isDarkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.25)' 
              : '0 10px 25px -5px rgba(79, 70, 229, 0.1)',
            flex: '0 0 auto',
            minWidth: '120px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: getTextColor(),
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {lang === 'te' ? 'లింగ వివరణ' : 'Gender'}
            </div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#6b7280',
                  border: '1px solid #fff'
                }}></div>
                <span style={{ color: getTextColor() }}>
                  {lang === 'te' ? 'పురుషులు' : 'Male'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#6b7280', 
                  borderRadius: '50%',
                  border: '1px solid #fff'
                }}></div>
                <span style={{ color: getTextColor() }}>
                  {lang === 'te' ? 'స్త్రీలు' : 'Female'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separate Search Results Panel - Only for no results message */}
      {(showSearchResults && searchResults.length === 0 && searchTerm.length >= 2) && (
        <div className="search-results-panel" style={{
          position: 'absolute',
          top: '90px',
          right: '20px',
          zIndex: 1200,
          backgroundColor: '#ffffff',
          backdropFilter: 'blur(10px)',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          minWidth: '300px',
          maxWidth: '400px',
          maxHeight: '300px',
          overflow: 'visible'
        }}>
          <div style={{
            padding: '20px',
            color: getTextColor(),
            textAlign: 'center',
            fontSize: '14px',
            fontStyle: 'italic'
          }}>
            {lang === 'te' ? 'ఫలితాలు లేవు' : 'No results found'}
          </div>
        </div>
      )}

      {/* Full Screen Chart Area */}
      <div className="d3-chart-wrapper" style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'grab',
        zIndex: 200
      }}
      onMouseDown={(e) => e.target.style.cursor = 'grabbing'}
      onMouseUp={(e) => e.target.style.cursor = 'grab'}
      onMouseLeave={(e) => e.target.style.cursor = 'grab'}
      >
        <svg ref={svgRef}></svg>
      </div>

      {showModal && selectedNode && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="person-modal">
            <h2>{selectedNode.displayName || selectedNode.name}</h2>
            <div className="person-details">
              {selectedNode.birth && <p><strong>Birth:</strong> {selectedNode.birth}</p>}
              {selectedNode.death && <p><strong>Death:</strong> {selectedNode.death}</p>}
              {selectedNode.age && <p><strong>Age:</strong> {selectedNode.age}</p>}
              {selectedNode.spouse && <p><strong>Spouse:</strong> {selectedNode.spouse}</p>}
              {selectedNode.detail && (
                <div>
                  <strong>Details:</strong>
                  <div dangerouslySetInnerHTML={{ __html: selectedNode.detail }} />
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
    </div>
  );
}
