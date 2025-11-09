import React, { useState, useEffect } from 'react';
import { Droplets, AlertTriangle, MapPin, TrendingUp, RefreshCw } from 'lucide-react';

const DisasterRiskAssessment = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const popularCities = [
    'Mumbai', 'Miami', 'Tokyo', 'Jakarta', 'Shanghai',
    'Bangkok', 'Manila', 'Rio de Janeiro', 'Venice'
  ];

  useEffect(() => {
    if (selectedCity) {
      fetchRiskAssessment(selectedCity);
    }
  }, [selectedCity]);

  const fetchRiskAssessment = async (city) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/risk/assess/${city}`);
      const result = await response.json();

      if (result.status === 'success') {
        setRiskData(result.data);
      } else {
        setError(result.message || 'Failed to fetch risk data');
      }
    } catch (err) {
      setError('Network error - Cannot reach server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSelectedCity(searchTerm.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      'Low': '#00c851',
      'Medium': '#ffa500',
      'High': '#ff4444',
      'Critical': '#cc0000'
    };
    return colors[level] || '#666';
  };

  const getRiskIcon = (score) => {
    if (score >= 70) return '🔴';
    if (score >= 40) return '🟠';
    if (score >= 20) return '🟡';
    return '🟢';
  };

  return (
    <div style={styles.container}>
      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchBar}>
          <MapPin size={20} color="#00d4ff" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter city name..."
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.searchBtn}>
            Search
          </button>
          <button 
            onClick={() => fetchRiskAssessment(selectedCity)} 
            style={styles.refreshBtn}
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <div style={styles.popularCities}>
          <span style={styles.popularLabel}>Quick Select:</span>
          {popularCities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              style={{
                ...styles.cityBtn,
                ...(selectedCity === city ? styles.activeCityBtn : {})
              }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Analyzing disaster risks for {selectedCity}...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={styles.error}>
          <AlertTriangle size={24} color="#ff4444" />
          <p>{error}</p>
          <button onClick={() => fetchRiskAssessment(selectedCity)} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
      )}

      {/* Risk Assessment Results */}
      {!loading && !error && riskData && (
        <div style={styles.results}>
          {/* Header */}
          <div style={styles.header}>
            <h2 style={styles.cityName}>
              <MapPin size={28} color="#00d4ff" />
              {riskData.city}
            </h2>
            <div style={styles.overallStatus}>
              <span style={styles.statusLabel}>Overall Status:</span>
              <span style={{
                ...styles.statusValue,
                color: getRiskColor(riskData.flood_risk?.risk_level)
              }}>
                {riskData.overall_status}
              </span>
            </div>
          </div>

          {/* Risk Cards */}
          <div style={styles.riskGrid}>
            {/* Flood Risk Card */}
            <div style={{
              ...styles.riskCard,
              borderLeft: `4px solid ${getRiskColor(riskData.flood_risk?.risk_level)}`
            }}>
              <div style={styles.cardHeader}>
                <Droplets size={32} color="#0077be" />
                <h3 style={styles.cardTitle}>Flood Risk</h3>
              </div>

              <div style={styles.scoreDisplay}>
                <div style={styles.scoreCircle}>
                  <span style={styles.scoreNumber}>
                    {getRiskIcon(riskData.flood_risk?.risk_score)}
                  </span>
                  <span style={styles.scoreLarge}>
                    {riskData.flood_risk?.risk_score.toFixed(1)}
                  </span>
                </div>
                <div style={styles.scoreInfo}>
                  <div style={{
                    ...styles.riskBadge,
                    background: getRiskColor(riskData.flood_risk?.risk_level)
                  }}>
                    {riskData.flood_risk?.risk_level} Risk
                  </div>
                  <p style={styles.scoreDesc}>
                    Risk Score (0-100)
                  </p>
                </div>
              </div>

              <div style={styles.metrics}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Rainfall Impact:</span>
                  <span style={styles.metricValue}>
                    {riskData.flood_risk?.rainfall_factor?.toFixed(1)}%
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Elevation Risk:</span>
                  <span style={styles.metricValue}>
                    {riskData.flood_risk?.elevation_factor?.toFixed(1)}%
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Drainage Capacity:</span>
                  <span style={styles.metricValue}>
                    {riskData.flood_risk?.drainage_factor?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {riskData.flood_risk?.warnings?.length > 0 && (
                <div style={styles.warnings}>
                  <h4 style={styles.warningTitle}>⚠️ Warnings:</h4>
                  <ul style={styles.warningList}>
                    {riskData.flood_risk.warnings.map((warning, idx) => (
                      <li key={idx} style={styles.warningItem}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {riskData.flood_risk?.actions?.length > 0 && (
                <div style={styles.actions}>
                  <h4 style={styles.actionTitle}>✓ Recommended Actions:</h4>
                  <ul style={styles.actionList}>
                    {riskData.flood_risk.actions.map((action, idx) => (
                      <li key={idx} style={styles.actionItem}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Landslide Risk Card */}
            <div style={{
              ...styles.riskCard,
              borderLeft: `4px solid ${getRiskColor(riskData.landslide_risk?.risk_level)}`
            }}>
              <div style={styles.cardHeader}>
                <AlertTriangle size={32} color="#ff6b6b" />
                <h3 style={styles.cardTitle}>Landslide Risk</h3>
              </div>

              <div style={styles.scoreDisplay}>
                <div style={styles.scoreCircle}>
                  <span style={styles.scoreNumber}>
                    {getRiskIcon(riskData.landslide_risk?.risk_score)}
                  </span>
                  <span style={styles.scoreLarge}>
                    {riskData.landslide_risk?.risk_score.toFixed(1)}
                  </span>
                </div>
                <div style={styles.scoreInfo}>
                  <div style={{
                    ...styles.riskBadge,
                    background: getRiskColor(riskData.landslide_risk?.risk_level)
                  }}>
                    {riskData.landslide_risk?.risk_level} Risk
                  </div>
                  <p style={styles.scoreDesc}>
                    Risk Score (0-100)
                  </p>
                </div>
              </div>

              <div style={styles.metrics}>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Slope Factor:</span>
                  <span style={styles.metricValue}>
                    {riskData.landslide_risk?.slope_factor?.toFixed(1)}%
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Rainfall Impact:</span>
                  <span style={styles.metricValue}>
                    {riskData.landslide_risk?.rainfall_factor?.toFixed(1)}%
                  </span>
                </div>
                <div style={styles.metric}>
                  <span style={styles.metricLabel}>Soil Stability:</span>
                  <span style={styles.metricValue}>
                    {riskData.landslide_risk?.soil_factor?.toFixed(1)}%
                  </span>
                </div>
              </div>

              {riskData.landslide_risk?.warnings?.length > 0 && (
                <div style={styles.warnings}>
                  <h4 style={styles.warningTitle}>⚠️ Warnings:</h4>
                  <ul style={styles.warningList}>
                    {riskData.landslide_risk.warnings.map((warning, idx) => (
                      <li key={idx} style={styles.warningItem}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {riskData.landslide_risk?.actions?.length > 0 && (
                <div style={styles.actions}>
                  <h4 style={styles.actionTitle}>✓ Recommended Actions:</h4>
                  <ul style={styles.actionList}>
                    {riskData.landslide_risk.actions.map((action, idx) => (
                      <li key={idx} style={styles.actionItem}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Combined Risk Indicator */}
          <div style={styles.combinedRisk}>
            <TrendingUp size={24} color="#00d4ff" />
            <div style={styles.combinedInfo}>
              <h3 style={styles.combinedTitle}>Combined Disaster Risk</h3>
              <div style={styles.combinedBar}>
                <div style={{
                  ...styles.combinedFill,
                  width: `${riskData.combined_risk}%`,
                  background: `linear-gradient(90deg, 
                    ${riskData.combined_risk > 70 ? '#cc0000' : 
                      riskData.combined_risk > 40 ? '#ff4444' : 
                      riskData.combined_risk > 20 ? '#ffa500' : '#00c851'} 0%, 
                    ${riskData.combined_risk > 70 ? '#ff4444' : 
                      riskData.combined_risk > 40 ? '#ffa500' : 
                      riskData.combined_risk > 20 ? '#00c851' : '#00ff88'} 100%)`
                }}>
                  <span style={styles.combinedValue}>
                    {riskData.combined_risk.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    padding: '2rem',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  searchSection: {
    marginBottom: '2rem',
  },
  searchBar: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
  },
  searchBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  refreshBtn: {
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  popularCities: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  popularLabel: {
    color: '#888',
    fontSize: '0.875rem',
  },
  cityBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  activeCityBtn: {
    background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
    color: '#000',
    fontWeight: 'bold',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#fff',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #00d4ff',
    borderRadius: '50%',
    margin: '0 auto 1rem',
    animation: 'spin 1s linear infinite',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    background: 'rgba(255, 0, 0, 0.1)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    color: '#fff',
  },
  retryBtn: {
    marginTop: '1rem',
    padding: '0.75rem 2rem',
    background: '#ff4444',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
  },
  results: {
    animation: 'fadeIn 0.5s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  cityName: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#fff',
    fontSize: '2rem',
    margin: 0,
  },
  overallStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusLabel: {
    color: '#888',
    fontSize: '0.875rem',
  },
  statusValue: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  riskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  riskCard: {
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    color: '#fff',
    fontSize: '1.5rem',
    margin: 0,
  },
  scoreDisplay: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  scoreCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(255, 255, 255, 0.2)',
  },
  scoreNumber: {
    fontSize: '2rem',
  },
  scoreLarge: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreInfo: {
    flex: 1,
  },
  riskBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  scoreDesc: {
    color: '#888',
    fontSize: '0.875rem',
    margin: 0,
  },
  metrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#aaa',
    fontSize: '0.875rem',
  },
  metricValue: {
    color: '#fff',
    fontWeight: 'bold',
  },
  warnings: {
    background: 'rgba(255, 68, 68, 0.1)',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid rgba(255, 68, 68, 0.3)',
  },
  warningTitle: {
    color: '#ff4444',
    fontSize: '1rem',
    margin: '0 0 0.5rem 0',
  },
  warningList: {
    margin: 0,
    paddingLeft: '1.5rem',
  },
  warningItem: {
    color: '#fff',
    fontSize: '0.875rem',
    marginBottom: '0.25rem',
  },
  actions: {
    background: 'rgba(0, 200, 81, 0.1)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(0, 200, 81, 0.3)',
  },
  actionTitle: {
    color: '#00c851',
    fontSize: '1rem',
    margin: '0 0 0.5rem 0',
  },
  actionList: {
    margin: 0,
    paddingLeft: '1.5rem',
  },
  actionItem: {
    color: '#fff',
    fontSize: '0.875rem',
    marginBottom: '0.25rem',
  },
  combinedRisk: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  combinedInfo: {
    flex: 1,
  },
  combinedTitle: {
    color: '#fff',
    fontSize: '1.25rem',
    margin: '0 0 1rem 0',
  },
  combinedBar: {
    height: '40px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
  },
  combinedFill: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '1rem',
    transition: 'width 1s ease',
  },
  combinedValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '1.125rem',
  },
};

export default DisasterRiskAssessment;