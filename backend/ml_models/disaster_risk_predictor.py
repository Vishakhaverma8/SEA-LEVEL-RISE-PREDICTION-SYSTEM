"""
Disaster Risk Predictor - Flood & Landslide Assessment
Day 5: Complete Implementation
"""

class DisasterRiskPredictor:
    def __init__(self):
        """Initialize the disaster risk predictor"""
        self.risk_thresholds = {
            'low': 20,
            'medium': 40,
            'high': 70
        }
    
    def calculate_flood_risk(self, city_name, elevation, rainfall, humidity):
        """
        Calculate flood risk with detailed factors
        
        Args:
            city_name: Name of the city
            elevation: Elevation in meters
            rainfall: Rainfall in mm/24h
            humidity: Humidity percentage
        """
        
        # Ensure all inputs are valid numbers
        elevation = float(elevation) if elevation else 50.0
        rainfall = float(rainfall) if rainfall else 0.0
        humidity = float(humidity) if humidity else 70.0
        
        # Calculate individual factors (0-100 scale)
        # Rainfall factor: More rain = higher risk
        rainfall_factor = min(100, (rainfall / 100) * 100)
        
        # Elevation factor: Lower elevation = higher risk
        elevation_factor = max(0, 100 - (elevation / 2))
        
        # Drainage factor: Higher humidity = poorer drainage
        drainage_factor = max(0, 100 - (humidity * 0.8))
        
        # Combined flood risk score (weighted average)
        flood_score = (
            rainfall_factor * 0.4 +      # 40% weight
            elevation_factor * 0.4 +     # 40% weight
            drainage_factor * 0.2        # 20% weight
        )
        
        # Determine risk level
        if flood_score >= 70:
            risk_level = 'Critical'
            risk_color = '#cc0000'
        elif flood_score >= 40:
            risk_level = 'High'
            risk_color = '#ff4444'
        elif flood_score >= 20:
            risk_level = 'Medium'
            risk_color = '#ffa500'
        else:
            risk_level = 'Low'
            risk_color = '#00c851'
        
        # Generate warnings based on conditions
        warnings = []
        
        if rainfall > 75:
            warnings.append(f'🔴 CRITICAL: Heavy rainfall detected ({rainfall:.1f}mm/24h)')
        elif rainfall > 50:
            warnings.append(f'🟠 MODERATE: Significant rainfall expected ({rainfall:.1f}mm/24h)')
        elif rainfall > 25:
            warnings.append(f'🟡 WATCH: Elevated rainfall levels ({rainfall:.1f}mm/24h)')
        
        if elevation < 10:
            warnings.append(f'🔴 HIGH: Very low elevation area ({elevation:.1f}m above sea level)')
        elif elevation < 30:
            warnings.append(f'🟠 MODERATE: Low elevation - potential flooding risk')
        
        if humidity > 80:
            warnings.append('⚠️ Poor drainage conditions due to high humidity')
        
        if flood_score >= 70:
            warnings.append('🚨 EXTREME FLOOD RISK - Immediate action required')
        
        # Generate recommended actions
        actions = []
        
        if flood_score >= 70:
            actions.extend([
                '🚨 IMMEDIATE EVACUATION recommended for low-lying areas',
                '📱 Monitor emergency alerts and news constantly',
                '🎒 Keep emergency kit ready (food, water, medicine)',
                '🚗 Avoid driving through flooded areas',
                '🏠 Move to higher floors if possible'
            ])
        elif flood_score >= 40:
            actions.extend([
                '⚠️ Stay alert to weather changes',
                '🏠 Check and clear drainage systems',
                '📦 Move valuables to higher ground',
                '🔦 Prepare flashlights and batteries',
                '📱 Keep phone charged'
            ])
        elif flood_score >= 20:
            actions.extend([
                '👀 Monitor weather forecasts regularly',
                '🔧 Ensure drainage is clear',
                '📋 Review evacuation routes'
            ])
        else:
            actions.append('✓ Continue normal activities, stay informed of weather updates')
        
        return {
            'risk_score': round(flood_score, 1),
            'risk_level': risk_level,
            'risk_color': risk_color,
            'rainfall_factor': round(rainfall_factor, 1),
            'elevation_factor': round(elevation_factor, 1),
            'drainage_factor': round(drainage_factor, 1),
            'warnings': warnings,
            'actions': actions,
            'details': {
                'current_rainfall': round(rainfall, 1),
                'elevation': round(elevation, 1),
                'humidity': round(humidity, 1),
                'city': city_name
            }
        }
    
    def calculate_landslide_risk(self, city_name, elevation, rainfall):
        """
        Calculate landslide risk with detailed factors
        
        Args:
            city_name: Name of the city
            elevation: Elevation in meters
            rainfall: Rainfall in mm/24h
        """
        
        # Ensure valid inputs
        elevation = float(elevation) if elevation else 50.0
        rainfall = float(rainfall) if rainfall else 0.0
        
        # Calculate slope factor based on elevation
        # Higher elevation generally means steeper terrain
        if elevation > 500:
            slope_factor = min(100, (elevation / 10))
        elif elevation > 200:
            slope_factor = min(80, (elevation / 15))
        elif elevation > 100:
            slope_factor = min(60, (elevation / 20))
        else:
            slope_factor = max(0, (elevation / 30))
        
        # Rainfall impact on landslides (heavy rain saturates soil)
        rainfall_factor = min(100, (rainfall / 80) * 100)
        
        # Soil stability (inverse relationship with rainfall)
        # More rain = less stable soil
        soil_factor = max(0, 100 - (rainfall * 0.8))
        
        # Combined landslide risk score (weighted)
        landslide_score = (
            slope_factor * 0.5 +         # 50% weight (terrain most important)
            rainfall_factor * 0.35 +     # 35% weight (rainfall trigger)
            (100 - soil_factor) * 0.15   # 15% weight (soil instability)
        )
        
        # Determine risk level
        if landslide_score >= 70:
            risk_level = 'Critical'
            risk_color = '#cc0000'
        elif landslide_score >= 40:
            risk_level = 'High'
            risk_color = '#ff4444'
        elif landslide_score >= 20:
            risk_level = 'Medium'
            risk_color = '#ffa500'
        else:
            risk_level = 'Low'
            risk_color = '#00c851'
        
        # Determine terrain type
        if elevation > 500:
            terrain_type = 'Mountainous'
        elif elevation > 200:
            terrain_type = 'Hilly'
        elif elevation > 100:
            terrain_type = 'Rolling'
        else:
            terrain_type = 'Flat'
        
        # Generate warnings
        warnings = []
        
        if elevation > 500 and rainfall > 60:
            warnings.append('🔴 CRITICAL: Steep mountainous terrain + heavy rainfall = EXTREME LANDSLIDE RISK')
        elif elevation > 300 and rainfall > 50:
            warnings.append('🔴 HIGH: Mountainous area with significant rainfall')
        elif elevation > 200 and rainfall > 40:
            warnings.append('🟠 MODERATE: Hilly terrain with elevated rainfall')
        elif elevation > 100:
            warnings.append('🟡 WATCH: Elevated terrain - monitor for landslide signs')
        
        if rainfall > 80:
            warnings.append('⚠️ Saturated soil conditions significantly increase landslide risk')
        elif rainfall > 60:
            warnings.append('⚠️ Heavy rainfall may destabilize slopes')
        
        if landslide_score >= 70:
            warnings.append('🚨 EXTREME LANDSLIDE RISK - Evacuate hillside areas')
        
        # Generate actions
        actions = []
        
        if landslide_score >= 70:
            actions.extend([
                '🚨 EVACUATE from hillside and valley areas IMMEDIATELY',
                '🚫 Avoid all travel near steep slopes',
                '📱 Report any cracks in ground to authorities',
                '👂 Listen for unusual sounds (rumbling, cracking)',
                '🏃 Move to stable, flat ground away from slopes'
            ])
        elif landslide_score >= 40:
            actions.extend([
                '⚠️ Avoid travel near steep slopes and cliffs',
                '👂 Listen for unusual sounds (rumbling, trees cracking)',
                '👀 Watch for cracks in pavements or walls',
                '📱 Stay informed of weather warnings',
                '🏠 Inspect property for signs of ground movement'
            ])
        elif landslide_score >= 20:
            actions.extend([
                '🌧️ Monitor rainfall levels closely',
                '🏠 Inspect property for new cracks',
                '👀 Watch for changes in landscape',
                '📋 Know evacuation routes'
            ])
        else:
            actions.append('✓ No immediate action required - maintain awareness')
        
        return {
            'risk_score': round(landslide_score, 1),
            'risk_level': risk_level,
            'risk_color': risk_color,
            'slope_factor': round(slope_factor, 1),
            'rainfall_factor': round(rainfall_factor, 1),
            'soil_factor': round(soil_factor, 1),
            'warnings': warnings,
            'actions': actions,
            'details': {
                'elevation': round(elevation, 1),
                'current_rainfall': round(rainfall, 1),
                'terrain_type': terrain_type
            }
        }
    
    def assess_city_risk(self, city_name, elevation, current_weather):
        """
        Comprehensive risk assessment for a city
        
        Args:
            city_name: Name of the city
            elevation: Elevation in meters
            current_weather: Dict with rainfall, humidity, temperature
        """
        
        # Extract weather data with defaults
        rainfall = current_weather.get('rainfall', 0)
        humidity = current_weather.get('humidity', 70)
        temperature = current_weather.get('temperature', 25)
        
        # Calculate both risks
        flood_risk = self.calculate_flood_risk(city_name, elevation, rainfall, humidity)
        landslide_risk = self.calculate_landslide_risk(city_name, elevation, rainfall)
        
        # Calculate combined risk (weighted average)
        combined_risk = (flood_risk['risk_score'] * 0.6 + landslide_risk['risk_score'] * 0.4)
        
        # Determine overall status
        if combined_risk >= 70:
            overall_status = '🔴 CRITICAL ALERT'
        elif combined_risk >= 40:
            overall_status = '🟠 High Alert'
        elif combined_risk >= 20:
            overall_status = '🟡 Moderate Watch'
        else:
            overall_status = '🟢 Low Risk'
        
        return {
            'city': city_name,
            'flood_risk': flood_risk,
            'landslide_risk': landslide_risk,
            'combined_risk': round(combined_risk, 1),
            'overall_status': overall_status,
            'assessment_time': 'Current conditions',
            'weather_conditions': {
                'rainfall': round(rainfall, 1),
                'humidity': round(humidity, 1),
                'temperature': round(temperature, 1),
                'elevation': round(elevation, 1)
            }
        }
    
    def get_risk_level_info(self, score):
        """Get information about a risk level"""
        if score >= 70:
            return {
                'level': 'Critical',
                'color': '#cc0000',
                'description': 'Extreme danger - immediate action required'
            }
        elif score >= 40:
            return {
                'level': 'High',
                'color': '#ff4444',
                'description': 'High risk - prepare for evacuation'
            }
        elif score >= 20:
            return {
                'level': 'Medium',
                'color': '#ffa500',
                'description': 'Moderate risk - stay alert'
            }
        else:
            return {
                'level': 'Low',
                'color': '#00c851',
                'description': 'Low risk - normal monitoring'
            }