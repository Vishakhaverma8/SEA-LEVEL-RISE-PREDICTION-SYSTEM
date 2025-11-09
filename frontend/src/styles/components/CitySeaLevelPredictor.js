import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, MapPin, TrendingUp, AlertTriangle, Waves } from 'lucide-react';
import { predictAnyCitySeaLevel } from '../services/api';

const CitySeaLevelPredictor = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scenario, setScenario] = useState('moderate');
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPredictions = async (city, scen) => {
    setLoading(true);
    setError(null);

    try {
      const response = await predictAnyCitySeaLevel(city, scen, '2030,2040,2050,2075,2100');

      if (response.success && response.data.status === 'success') {
        setPredictions(response.data.data);
      } else {
        setError('Failed to fetch predictions');
      }
    } catch (err) {
      setError('Failed to fetch predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setSearchTerm('');
    fetchPredictions(city, scenario);
  };

  const handleScenarioChange = (newScenario) => {
    setScenario(newScenario);
    if (selectedCity) {
      fetchPredictions(selectedCity, newScenario);
    }
  };

  const getVulnerabilityColor = (vulnerability) => {
    const colors = {
      'critical': '#ff4444',
      'high': '#ffa500',
      'moderate': '#ffd700',
      'low': '#00c851'
    };
    return colors[vulnerability] || '#888';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>Year: {payload[0].payload.year}</p>
          <p style={styles.tooltipValue}>Local Rise: {payload[0].value}mm</p>
          <p style={styles.tooltipValue}>Flood Risk: {payload[0].payload.flooding_risk}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <Waves size={32} color="#00d4ff" />
          <div>
            <h3 style={styles.title}>🤖 AI-Powered City Sea Level Predictions</h3>
            <p style={styles.subtitle}>Search any coastal city to see ML-based predictions</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <Search size={20} color="#888" style={styles.searchIcon} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchTerm && handleCitySelect(searchTerm)}
            placeholder="Enter city name and press Enter..."
            style={styles.searchInput}
          />
        </div>

        {/* Popular Cities Quick Select */}
        <div style={styles.popularCities}>
          <span style={styles.popularLabel}>Quick Select:</span>
          {['Mumbai', 'Miami', 'Venice', 'Shanghai', 'Amsterdam', 'New York'].map(city => (
            <button
              key={city}
              style={{
                ...styles.cityButton,
                ...(selectedCity === city ? styles.cityButtonActive : {})
              }}
              onClick={() => handleCitySelect(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Selector */}
      {selectedCity && (
        <div style={styles.scenarioSection}>
          <span style={styles.selectorLabel}>Emission Scenario:</span>
          <button
            style={{
              ...styles.scenarioBtn,
              ...(scenario === 'optimistic' ? styles.scenarioBtnActive : {}),
              borderColor: '#00c851'
            }}
            onClick={() => handleScenarioChange('optimistic')}
          >
            🟢 Optimistic
          </button>
          <button
            style={{
              ...styles.scenarioBtn,
              ...(scenario === 'moderate' ? styles.scenarioBtnActive : {}),
              borderColor: '#ffa500'
            }}
            onClick={() => handleScenarioChange('moderate')}
          >
            🟡 Moderate
          </button>
          <button
            style={{
              ...styles.scenarioBtn,
              ...(scenario === 'pessimistic' ? styles.scenarioBtnActive : {}),
              borderColor: '#ff4444'
            }}
            onClick={() => handleScenarioChange('pessimistic')}
          >
            🔴 Pessimistic
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Running ML predictions for {selectedCity}...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={24} color="#ff4444" />
          <span>{error}</span>
        </div>
      )}

      {/* Predictions */}
      {predictions && !loading && (
        <div style={styles.predictionsContainer}>
          {/* City Info Card */}
          <div style={styles.cityInfoCard}>
            <div style={styles.cityHeader}>
              <div>
                <h4 style={styles.cityTitle}>
                  <MapPin size={24} color="#00d4ff" />
                  {predictions.city}
                </h4>
                <div style={styles.cityMeta}>
                  <span>Elevation: {predictions.elevation}m</span>
                  <span style={styles.separator}>•</span>
                  <span>City Factor: {predictions.city_factor}x</span>
                  <span style={styles.separator}>•</span>
                  <span style={{
                    color: getVulnerabilityColor(predictions.vulnerability),
                    fontWeight: 'bold'
                  }}>
                    {predictions.vulnerability.toUpperCase()} Risk
                  </span>
                </div>
              </div>
              <div style={{
                ...styles.riskBadge,
                background: getVulnerabilityColor(predictions.vulnerability)
              }}>
                {predictions.vulnerability}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={styles.chartsGrid}>
            {/* Sea Level Rise Chart */}
            <div style={styles.chartCard}>
              <h5 style={styles.chartTitle}>
                <TrendingUp size={20} color="#00d4ff" />
                Predicted Sea Level Rise
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions.predictions}>
                  <defs>
                    <linearGradient id="localRiseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" stroke="#888" />
                  <YAxis stroke="#00d4ff" label={{ value: 'Rise (mm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="global_rise"
                    stroke="#888"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Global Average"
                  />
                  <Line
                    type="monotone"
                    dataKey="local_rise"
                    stroke="#00d4ff"
                    strokeWidth={3}
                    fill="url(#localRiseGradient)"
                    dot={{ fill: '#00d4ff', r: 5 }}
                    name="Local Prediction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Flooding Risk Chart */}
            <div style={styles.chartCard}>
              <h5 style={styles.chartTitle}>
                <Waves size={20} color="#ff6b6b" />
                Flooding Risk Evolution
              </h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={predictions.predictions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" stroke="#888" />
                  <YAxis stroke="#ff6b6b" label={{ value: 'Risk (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="flooding_risk" fill="#ff6b6b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Predictions Table */}
          <div style={styles.tableCard}>
            <h5 style={styles.chartTitle}>Detailed Predictions by Year</h5>
            <div style={styles.table}>
              <div style={styles.tableHeader}>
                <div style={styles.tableCell}>Year</div>
                <div style={styles.tableCell}>Global Rise</div>
                <div style={styles.tableCell}>Local Rise</div>
                <div style={styles.tableCell}>Flood Risk</div>
                <div style={styles.tableCell}>Vulnerability</div>
              </div>
              {predictions.predictions.map((pred, index) => (
                <div key={index} style={styles.tableRow}>
                  <div style={styles.tableCell}>{pred.year}</div>
                  <div style={styles.tableCell}>+{pred.global_rise}mm</div>
                  <div style={{ ...styles.tableCell, color: '#00d4ff', fontWeight: 'bold' }}>
                    +{pred.local_rise}mm
                  </div>
                  <div style={{ ...styles.tableCell, color: '#ff6b6b', fontWeight: 'bold' }}>
                    {pred.flooding_risk}%
                  </div>
                  <div style={{
                    ...styles.tableCell,
                    color: getVulnerabilityColor(pred.vulnerability)
                  }}>
                    {pred.vulnerability}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div style={styles.warningBox}>
            <AlertTriangle size={24} color="#ffa500" />
            <div>
              <strong>ML Prediction Notice:</strong> These predictions are generated using machine learning
              models trained on historical data (1900-2024). Actual outcomes depend on global emissions,
              local geography, and adaptation measures.
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedCity && !loading && (
        <div style={styles.emptyState}>
          <Search size={64} color="#444" />
          <h4 style={styles.emptyTitle}>Search for a Coastal City</h4>
          <p style={styles.emptyText}>
            Enter a city name or select from quick options above
          </p>
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
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  header: {
    marginBottom: '1.5rem'
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#888',
    margin: '0.5rem 0 0 0'
  },
  searchSection: {
    marginBottom: '2rem'
  },
  searchContainer: {
    position: 'relative',
    marginBottom: '1rem'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1rem 1rem 3rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none'
  },
  popularCities: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  popularLabel: {
    color: '#888',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  cityButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease'
  },
  cityButtonActive: {
    background: 'linear-gradient(135deg, #00d4ff, #00ff88)',
    border: 'none'
  },
  scenarioSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  selectorLabel: {
    color: '#fff',
    fontWeight: '500',
    minWidth: '150px'
  },
  scenarioBtn: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '2px solid',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.3s ease'
  },
  scenarioBtnActive: {
    background: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
    gap: '1rem',
    color: '#fff'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid #00d4ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid rgba(255, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#ff4444'
  },
  predictionsContainer: {
    animation: 'fadeIn 0.5s ease-out'
  },
  cityInfoCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  cityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cityTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: '0 0 0.5rem 0'
  },
  cityMeta: {
    display: 'flex',
    gap: '0.75rem',
    fontSize: '0.875rem',
    color: '#888',
    flexWrap: 'wrap'
  },
  separator: {
    color: '#444'
  },
  riskBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  chartCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  chartTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '1rem'
  },
  tooltip: {
    background: 'rgba(0, 0, 0, 0.95)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  tooltipLabel: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: '0.25rem'
  },
  tooltipValue: {
    color: '#00d4ff',
    fontSize: '0.875rem',
    margin: '0.25rem 0'
  },
  tableCard: {
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  table: {
    width: '100%'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    padding: '1rem',
    background: 'rgba(0, 212, 255, 0.1)',
    borderRadius: '8px 8px 0 0',
    fontWeight: 'bold',
    color: '#00d4ff'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    padding: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff'
  },
  tableCell: {
    textAlign: 'center'
  },
  warningBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255, 165, 0, 0.1)',
    border: '1px solid rgba(255, 165, 0, 0.3)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#fff',
    lineHeight: '1.6'
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#888'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: '1rem 0 0.5rem 0'
  },
  emptyText: {
    fontSize: '1rem',
    lineHeight: '1.6'
  }
};

export default CitySeaLevelPredictor;