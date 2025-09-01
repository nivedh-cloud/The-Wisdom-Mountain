import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './PageHeader.css';

/**
 * Consistent page header component with theme support
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.actions - Optional action buttons/components on the right
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  className = '', 
  actions 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`page-header ${className} ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="page-header-content">
        <div className="page-header-left">
          {icon && <div className="page-header-icon">{icon}</div>}
          <div className="page-header-text">
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
