from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import requests
from dotenv import load_dotenv
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from ml_models.disaster_risk_predictor import DisasterRiskPredictor

load_dotenv()

app = Flask(__name__)
CORS(app)

OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
MAPBOX_TOKEN = os.getenv('MAPBOX_TOKEN')
WEATHER_BASE_URL = "http://api.openweathermap.org/data/2.5"

# BASIC ENDPOINTS
@app.route('/')
def home():
    return jsonify({
        'status': 'success',
        'message': '🌍 Climate Alert System API',
        'version': '5.0.0',
        'endpoints': {
            '/api/weather/<city>': 'Get current weather',
            '/api/sealevel/current': 'Get sea level data',
            '/api/climate/co2/current': 'Get CO2 data',
            '/api/ml/sealevel/predict/any/<city>': 'Predict sea level for any city',
            '/api/risk/assess/<city>': 'Assess disaster risks'
        }
    })

@app.route('/api/status')
def api_status():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/mapbox-token')
def get_mapbox_token():
    if not MAPBOX_TOKEN:
        return jsonify({'status': 'error', 'message': 'Mapbox token not configured'}), 500
    return jsonify({'status': 'success', 'token': MAPBOX_TOKEN})


# WEATHER ENDPOINTS
@app.route('/api/weather/<city>')
def get_weather(city):
    try:
        if not OPENWEATHER_API_KEY:
            return jsonify({'status': 'error', 'message': 'API key not configured'}), 500

        response = requests.get(
            f"{WEATHER_BASE_URL}/weather",
            params={'q': city, 'appid': OPENWEATHER_API_KEY, 'units': 'metric'},
            timeout=10
        )
        
        if response.status_code == 404:
            return jsonify({'status': 'error', 'message': f'City "{city}" not found'}), 404
        
        if response.status_code != 200:
            return jsonify({'status': 'error', 'message': 'Failed to fetch weather'}), response.status_code
        
        data = response.json()
        
        return jsonify({
            'status': 'success',
            'city': data['name'],
            'country': data['sys']['country'],
            'coordinates': {'lat': data['coord']['lat'], 'lon': data['coord']['lon']},
            'weather': {
                'description': data['weather'][0]['description'].capitalize(),
                'icon': data['weather'][0]['icon'],
                'icon_url': f"http://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png"
            },
            'temperature': {
                'current': round(data['main']['temp'], 1),
                'feels_like': round(data['main']['feels_like'], 1),
                'min': round(data['main']['temp_min'], 1),
                'max': round(data['main']['temp_max'], 1)
            },
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure'],
            'wind': {'speed': round(data['wind']['speed'] * 3.6, 1)},
            'visibility': data.get('visibility', 0) / 1000,
            'sunrise': datetime.fromtimestamp(data['sys']['sunrise']).strftime('%H:%M'),
            'sunset': datetime.fromtimestamp(data['sys']['sunset']).strftime('%H:%M'),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/weather/coords')
def get_weather_by_coords():
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        
        if lat is None or lon is None:
            return jsonify({'status': 'error', 'message': 'Lat/lon required'}), 400
        
        response = requests.get(
            f"{WEATHER_BASE_URL}/weather",
            params={'lat': lat, 'lon': lon, 'appid': OPENWEATHER_API_KEY, 'units': 'metric'},
            timeout=10
        )
        
        if response.status_code != 200:
            return jsonify({'status': 'error', 'message': 'Failed to fetch weather'}), response.status_code
        
        data = response.json()
        
        return jsonify({
            'status': 'success',
            'city': data['name'],
            'coordinates': {'lat': data['coord']['lat'], 'lon': data['coord']['lon']},
            'temperature': {'current': round(data['main']['temp'], 1)},
            'humidity': data['main']['humidity'],
            'weather': {'description': data['weather'][0]['description'].capitalize()}
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# SEA LEVEL & CO2 DATA ENDPOINTS
@app.route('/api/sealevel/current')
def get_current_sea_level():
    try:
        # Generate fallback data (IPCC-based)
        recent_data = []
        base_year = 1993.0
        
        for i in range(125):
            year = base_year + (i * 0.25)
            level = i * 0.925  # 3.7mm/year
            recent_data.append({
                'year': round(year, 2),
                'level': round(level, 2),
                'uncertainty': 4.0
            })
        
        latest = recent_data[-1]
        
        return jsonify({
            'status': 'success',
            'data': {
                'current_level': latest['level'],
                'year': latest['year'],
                'rate_per_year': 3.7,
                'recent_data': recent_data,
                'source': 'IPCC AR6 Report Data',
                'last_updated': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/climate/co2/current')
def get_current_co2():
    try:
        recent_data = []
        base_co2 = 420.0
        
        for i in range(52):
            week_date = datetime.now() - timedelta(weeks=(52-i))
            co2_value = base_co2 + (i * 0.05) + (2 * (i % 26 - 13) / 26)
            recent_data.append({
                'date': week_date.strftime('%Y-%m-%d'),
                'co2': round(co2_value, 2)
            })
        
        return jsonify({
            'status': 'success',
            'data': {
                'current_co2': 424.5,
                'date': datetime.now().strftime('%Y-%m-%d'),
                'recent_data': recent_data,
                'source': 'Based on Mauna Loa trends',
                'last_updated': datetime.now().isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ML SEA LEVEL PREDICTION
class SeaLevelPredictor:
    def __init__(self):
        self.poly_model = None
        self.poly_features = PolynomialFeatures(degree=2)
        self.is_trained = False
        
        self.historical_years = np.array([
            1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990,
            2000, 2005, 2010, 2015, 2020, 2021, 2022, 2023, 2024
        ])
        
        self.historical_levels = np.array([
            0, 10, 15, 25, 40, 50, 70, 95, 120, 155,
            205, 225, 245, 270, 282, 287, 291, 298, 305
        ])
        
        self.city_factors = {
            'Miami': {'factor': 1.8, 'elevation': 2, 'vulnerability': 'critical'},
            'Venice': {'factor': 2.0, 'elevation': 1, 'vulnerability': 'critical'},
            'Amsterdam': {'factor': 1.6, 'elevation': -2, 'vulnerability': 'critical'},
            'Mumbai': {'factor': 1.5, 'elevation': 14, 'vulnerability': 'critical'},
            'Shanghai': {'factor': 1.7, 'elevation': 4, 'vulnerability': 'critical'},
            'Jakarta': {'factor': 1.9, 'elevation': 8, 'vulnerability': 'critical'},
            'Bangkok': {'factor': 1.7, 'elevation': 1.5, 'vulnerability': 'critical'},
            'New York': {'factor': 1.4, 'elevation': 10, 'vulnerability': 'high'},
            'London': {'factor': 1.3, 'elevation': 11, 'vulnerability': 'high'},
            'Tokyo': {'factor': 1.2, 'elevation': 40, 'vulnerability': 'moderate'},
            'Sydney': {'factor': 1.1, 'elevation': 58, 'vulnerability': 'moderate'},
            'Delhi': {'factor': 1.0, 'elevation': 216, 'vulnerability': 'low'},
        }
    
    def train(self):
        X = self.historical_years.reshape(-1, 1)
        y = self.historical_levels
        X_poly = self.poly_features.fit_transform(X)
        self.poly_model = LinearRegression()
        self.poly_model.fit(X_poly, y)
        self.is_trained = True
        print("✅ ML Model trained successfully!")
    
    def predict_any_city(self, city_name, coordinates, target_years, scenario='moderate'):
        if not self.is_trained:
            self.train()
        
        lat = coordinates.get('lat', 0)
        lon = coordinates.get('lon', 0)
        elevation = coordinates.get('elevation', 50)
        
        coastal_distance = self._estimate_coastal_distance(lat, lon)
        
        if elevation <= 5 or coastal_distance < 10:
            vulnerability = 'critical'
            factor = 1.8
        elif elevation <= 15 or coastal_distance < 50:
            vulnerability = 'high'
            factor = 1.5
        elif elevation <= 30 or coastal_distance < 100:
            vulnerability = 'moderate'
            factor = 1.2
        else:
            vulnerability = 'low'
            factor = 0.9
        
        predictions = []
        scenario_mult = {'optimistic': 0.85, 'moderate': 1.0, 'pessimistic': 1.35}
        multiplier = scenario_mult.get(scenario, 1.0)
        
        for year in target_years:
            X_pred = np.array([[year]])
            X_poly = self.poly_features.transform(X_pred)
            global_rise = self.poly_model.predict(X_poly)[0] * multiplier
            local_rise = global_rise * factor
            
            flooding_risk = min(100, (local_rise / (elevation * 1000)) * 100) if elevation > 0 else min(100, 80 + (local_rise / 10))
            
            if coastal_distance > 100:
                flooding_risk *= 0.5
            
            predictions.append({
                'year': year,
                'global_rise': round(global_rise, 2),
                'local_rise': round(local_rise, 2),
                'elevation': elevation,
                'flooding_risk': round(flooding_risk, 2),
                'vulnerability': vulnerability
            })
        
        return {
            'city': city_name,
            'predictions': predictions,
            'city_factor': round(factor, 2),
            'elevation': elevation,
            'vulnerability': vulnerability
        }
    
    def _estimate_coastal_distance(self, lat, lon):
        coastal_regions = [
            {'lat_range': (25, 45), 'lon_range': (-80, -70), 'distance': 5},
            {'lat_range': (25, 50), 'lon_range': (-125, -115), 'distance': 5},
            {'lat_range': (35, 60), 'lon_range': (-10, 30), 'distance': 10},
            {'lat_range': (0, 40), 'lon_range': (100, 140), 'distance': 10},
            {'lat_range': (-20, 25), 'lon_range': (40, 100), 'distance': 10},
        ]
        
        for region in coastal_regions:
            if (region['lat_range'][0] <= lat <= region['lat_range'][1] and
                region['lon_range'][0] <= lon <= region['lon_range'][1]):
                return region['distance']
        return 200
    
    def get_available_cities(self):
        return sorted(list(self.city_factors.keys()))

ml_predictor = SeaLevelPredictor()
ml_predictor.train()

@app.route('/api/ml/sealevel/predict/any/<city>')
def predict_any_city_sea_level(city):
    try:
        scenario = request.args.get('scenario', 'moderate')
        years = request.args.get('years', '2030,2050,2100')
        target_years = [int(y.strip()) for y in years.split(',')]
        
        response = requests.get(
            "http://api.openweathermap.org/data/2.5/weather",
            params={'q': city, 'appid': OPENWEATHER_API_KEY, 'units': 'metric'},
            timeout=10
        )
        
        if response.status_code == 404:
            return jsonify({'status': 'error', 'message': f'City "{city}" not found'}), 404
        
        weather_data = response.json()
        
        coordinates = {
            'lat': weather_data['coord']['lat'],
            'lon': weather_data['coord']['lon'],
            'elevation': 50
        }
        
        try:
            elev_response = requests.get(
                "https://api.open-meteo.com/v1/elevation",
                params={'latitude': coordinates['lat'], 'longitude': coordinates['lon']},
                timeout=5
            )
            if elev_response.status_code == 200:
                elev_data = elev_response.json()
                if 'elevation' in elev_data and elev_data['elevation']:
                    coordinates['elevation'] = round(elev_data['elevation'][0], 1)
        except:
            pass
        
        result = ml_predictor.predict_any_city(weather_data['name'], coordinates, target_years, scenario)
        
        return jsonify({'status': 'success', 'data': result})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/ml/sealevel/cities')
def get_available_cities():
    try:
        return jsonify({
            'status': 'success',
            'cities': ml_predictor.get_available_cities(),
            'count': len(ml_predictor.get_available_cities())
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# DISASTER RISK ASSESSMENT
disaster_predictor = DisasterRiskPredictor()

@app.route('/api/risk/assess/<city>')
def assess_disaster_risk(city):
    try:
        weather_result = get_weather_data_internal(city)
        
        if not weather_result:
            return jsonify({'status': 'error', 'message': 'Could not fetch weather data'}), 404
        
        elevation = weather_result.get('elevation', 50)
        humidity = weather_result.get('humidity', 70)
        rainfall = weather_result.get('rainfall', humidity / 2)
        
        current_weather = {
            'rainfall': rainfall,
            'humidity': humidity,
            'temperature': weather_result.get('temperature', 25)
        }
        
        assessment = disaster_predictor.assess_city_risk(weather_result.get('city', city), elevation, current_weather)
        
        return jsonify({'status': 'success', 'data': assessment})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def get_weather_data_internal(city):
    try:
        response = requests.get(
            f"{WEATHER_BASE_URL}/weather",
            params={'q': city, 'appid': OPENWEATHER_API_KEY, 'units': 'metric'},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            return {
                'city': data['name'],
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'rainfall': data.get('rain', {}).get('1h', 0) * 24,
                'elevation': 50
            }
    except:
        pass
    return None

# ERROR HANDLERS
@app.errorhandler(404)
def not_found(error):
    return jsonify({'status': 'error', 'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

# START SERVER
if __name__ == '__main__':
    print("=" * 60)
    print("🌍 Climate Alert System Backend")
    print("=" * 60)
    print("✅ Server starting...")
    print("📡 API: http://localhost:5000")
    print("🌤️  Weather: " + ("✅" if OPENWEATHER_API_KEY else "❌"))
    print("🗺️  Mapbox: " + ("✅" if MAPBOX_TOKEN else "❌"))
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)