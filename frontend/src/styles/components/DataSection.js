import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, TrendingUp, Droplets } from 'lucide-react';

const DataSection = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={styles.container}>
      {/* Data Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.toggleButton}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={styles.buttonContent}>
          <div style={styles.iconWrapper}>
            <Database size={24} color="#00d4ff" />
          </div>
          <div style={styles.buttonText}>
            <h3 style={styles.buttonTitle}>Historical Climate Data</h3>
            <p style={styles.buttonSubtitle}>
              {isOpen ? 'Click to hide datasets' : 'Click to view temperature trends and sea level data'}
            </p>
          </div>
        </div>
        <div style={styles.chevronWrapper}>
          {isOpen ? (
            <ChevronUp size={24} color="#00d4ff" />
          ) : (
            <ChevronDown size={24} color="#00d4ff" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div style={styles.content}>
          <div style={styles.datasetGrid}>
            {/* Temperature Dataset Card */}
            <div style={styles.datasetCard}>
              <div style={styles.datasetHeader}>
                <TrendingUp size={20} color="#ff6b6b" />
                <h4 style={styles.datasetTitle}>Global Temperature Rise (1950-2024)</h4>
              </div>
              <div style={styles.datasetBadge}>
                <span style={styles.badgeText}>1950-2024</span>
              </div>
              <p style={styles.datasetDesc}>
                Historical temperature data showing global warming trends over 74 years
              </p>
            </div>

            {/* Sea Level Dataset Card */}
            <div style={styles.datasetCard}>
              <div style={styles.datasetHeader}>
                <Droplets size={20} color="#0077be" />
                <h4 style={styles.datasetTitle}>Real-Time Sea Level Data</h4>
              </div>
              <div style={styles.datasetBadge}>
                <span style={styles.badgeText}>NASA/NOAA</span>
              </div>
              <p style={styles.datasetDesc}>
                Live data from NASA/CU Sea Level Research Group
              </p>
            </div>
          </div>

          {/* Alert Info */}
          <div style={styles.alertBox}>
            <div style={styles.alertIcon}>⚠️</div>
            <div style={styles.alertContent}>
              <strong style={styles.alertTitle}>Climate Alert:</strong>
              <span style={styles.alertText}>
                Global temperature has increased by <strong>+1.2°C</strong> since pre-industrial times. 
                The last 9 years (2015-2023) were the warmest on record.
              </span>
            </div>
          </div>

          {/* Render Children (Charts) */}
          <div style={styles.chartsContainer}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    marginBottom: '2rem',
  },
  toggleButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%)',
    border: '2px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 212, 255, 0.2)',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flex: 1,
  },
  iconWrapper: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 212, 255, 0.2)',
    borderRadius: '12px',
    border: '1px solid rgba(0, 212, 255, 0.4)',
  },
  buttonText: {
    textAlign: 'left',
  },
  buttonTitle: {
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '0.25rem',
  },
  buttonSubtitle: {
    color: '#aaa',
    fontSize: '0.875rem',
    margin: 0,
  },
  chevronWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '8px',
  },
  content: {
    marginTop: '1rem',
    padding: '2rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    animation: 'slideDown 0.3s ease',
  },
  datasetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  datasetCard: {
    padding: '1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  datasetHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  datasetTitle: {
    color: '#fff',
    fontSize: '1rem',
    margin: 0,
    fontWeight: '600',
  },
  datasetBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(0, 212, 255, 0.2)',
    borderRadius: '20px',
    border: '1px solid rgba(0, 212, 255, 0.4)',
    marginBottom: '0.75rem',
  },
  badgeText: {
    color: '#00d4ff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  datasetDesc: {
    color: '#aaa',
    fontSize: '0.875rem',
    margin: 0,
    lineHeight: '1.5',
  },
  alertBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.5rem',
    background: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  alertIcon: {
    fontSize: '1.5rem',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: '#ffa500',
    fontSize: '1rem',
    marginRight: '0.5rem',
  },
  alertText: {
    color: '#ddd',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  chartsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
};

export default DataSection;