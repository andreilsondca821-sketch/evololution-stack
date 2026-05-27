// ============================================
// WEATHER DASHBOARD - Frontend
// ============================================

class WeatherDashboard {
  constructor() {
    this.isCelsius = true;
    this.currentLocation = null;
    this.currentWeather = null;
    this.temperatureChart = null;
    this.precipitationChart = null;
    this.init();
  }

  // ==================== INITIALIZATION ====================

  init() {
    this.setupEventListeners();
    this.loadDefaultLocation();
  }

  setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
    document.getElementById('searchInput').addEventListener('input', (e) => this.handleSuggestions(e.target.value));
    document.getElementById('locationBtn').addEventListener('click', () => this.getGeolocation());
    document.getElementById('unitToggle').addEventListener('click', () => this.toggleUnit());
  }

  // ==================== LOCATION ====================

  loadDefaultLocation() {
    // Default location: New York
    this.fetchWeather(40.7128, -74.0060, 'New York');
  }

  getGeolocation() {
    if (!navigator.geolocation) {
      this.showToast('Geolocation not supported', 'error');
      return;
    }

    this.showLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.fetchWeather(latitude, longitude, 'Current Location');
      },
      () => {
        this.showToast('Could not get your location', 'error');
        this.showLoading(false);
      }
    );
  }

  // ==================== SEARCH ====================

  async handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
      this.showToast('Please enter a city name', 'error');
      return;
    }

    this.showLoading(true);

    try {
      const response = await fetch(`/api/weather/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!data.success || data.data.length === 0) {
        this.showToast('City not found', 'error');
        this.showLoading(false);
        return;
      }

      const city = data.data[0];
      this.fetchWeather(city.latitude, city.longitude, city.name);
      document.getElementById('searchInput').value = '';
      document.getElementById('suggestions').classList.remove('active');
    } catch (error) {
      console.error('Search error:', error);
      this.showToast('Search failed', 'error');
      this.showLoading(false);
    }
  }

  async handleSuggestions(query) {
    if (query.length < 2) {
      document.getElementById('suggestions').classList.remove('active');
      return;
    }

    try {
      const response = await fetch(`/api/weather/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      const suggestionsEl = document.getElementById('suggestions');
      suggestionsEl.innerHTML = '';

      if (data.success && data.data.length > 0) {
        data.data.slice(0, 5).forEach(city => {
          const item = document.createElement('div');
          item.className = 'suggestion-item';
          item.innerHTML = `
            <strong>${city.name}</strong><br>
            <small>${city.country} ${city.admin1 ? '(' + city.admin1 + ')' : ''}</small>
          `;
          item.addEventListener('click', () => {
            this.fetchWeather(city.latitude, city.longitude, city.name);
            document.getElementById('searchInput').value = '';
            suggestionsEl.classList.remove('active');
          });
          suggestionsEl.appendChild(item);
        });
        suggestionsEl.classList.add('active');
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }

  // ==================== FETCH WEATHER ====================

  async fetchWeather(latitude, longitude, cityName) {
    this.showLoading(true);
    this.hideError();

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `/api/weather/current?lat=${latitude}&lon=${longitude}`
      );
      const currentData = await currentResponse.json();

      // Fetch forecast
      const forecastResponse = await fetch(
        `/api/weather/forecast?lat=${latitude}&lon=${longitude}&days=5`
      );
      const forecastData = await forecastResponse.json();

      // Fetch hourly data
      const hourlyResponse = await fetch(
        `/api/weather/hourly?lat=${latitude}&lon=${longitude}&hours=24`
      );
      const hourlyData = await hourlyResponse.json();

      if (!currentData.success) {
        throw new Error('Failed to fetch weather');
      }

      this.currentLocation = { lat: latitude, lon: longitude, name: cityName };
      this.currentWeather = currentData.data;

      this.displayCurrentWeather(cityName, currentData.data);
      this.displayHourlyForecast(hourlyData.data);
      this.displayForecast(forecastData.data);
      this.createCharts(forecastData.data);

      this.showLoading(false);
      this.showToast(`Weather for ${cityName} loaded`, 'success');
    } catch (error) {
      console.error('Weather fetch error:', error);
      this.showError('Failed to load weather data');
      this.showLoading(false);
    }
  }

  // ==================== DISPLAY CURRENT WEATHER ====================

  displayCurrentWeather(cityName, data) {
    const current = data.current;
    const weatherCode = current.weather_code;
    const weatherDescription = this.getWeatherDescription(weatherCode);

    document.getElementById('cityName').textContent = cityName;
    document.getElementById('lastUpdated').textContent = `Last updated: ${new Date(current.time).toLocaleTimeString()}`;

    const temp = Math.round(current.temperature_2m);
    const displayTemp = this.isCelsius ? temp : this.celsius2Fahrenheit(temp);
    const unit = this.isCelsius ? '°C' : '°F';

    document.getElementById('temp').textContent = displayTemp;
    document.querySelector('.unit').textContent = unit;
    document.getElementById('weatherDescription').textContent = weatherDescription;

    const feelsLike = Math.round(current.apparent_temperature);
    const displayFeelsLike = this.isCelsius ? feelsLike : this.celsius2Fahrenheit(feelsLike);
    document.getElementById('feelsLike').textContent = `${displayFeelsLike}${unit}`;

    document.getElementById('weatherIcon').className = `fas ${this.getWeatherIcon(weatherCode)}`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('windSpeed').textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    document.getElementById('precipitation').textContent = `${current.precipitation} mm`;

    document.getElementById('currentWeather').style.display = 'block';
  }

  // ==================== DISPLAY HOURLY FORECAST ====================

  displayHourlyForecast(data) {
    const container = document.getElementById('hourlyForecast');
    container.innerHTML = '';

    const hourly = data.hourly;
    const times = hourly.time;
    const temps = hourly.temperature_2m;
    const weatherCodes = hourly.weather_code;

    times.slice(0, 24).forEach((time, index) => {
      const date = new Date(time);
      const hour = date.getHours().toString().padStart(2, '0');
      const temp = Math.round(temps[index]);
      const displayTemp = this.isCelsius ? temp : this.celsius2Fahrenheit(temp);
      const unit = this.isCelsius ? '°C' : '°F';

      const item = document.createElement('div');
      item.className = 'hourly-item';
      item.innerHTML = `
        <div class="hourly-time">${hour}:00</div>
        <div class="hourly-icon">
          <i class="fas ${this.getWeatherIcon(weatherCodes[index])}"></i>
        </div>
        <div class="hourly-temp">${displayTemp}${unit}</div>
      `;
      container.appendChild(item);
    });

    document.getElementById('hourlySection').style.display = 'block';
  }

  // ==================== DISPLAY FORECAST ====================

  displayForecast(data) {
    const container = document.getElementById('dailyForecast');
    container.innerHTML = '';

    const daily = data.daily;
    const dates = daily.time;
    const weatherCodes = daily.weather_code;
    const maxTemps = daily.temperature_2m_max;
    const minTemps = daily.temperature_2m_min;
    const precipitation = daily.precipitation_sum;

    dates.forEach((date, index) => {
      const d = new Date(date);
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const weatherDesc = this.getWeatherDescription(weatherCodes[index]);

      const maxTemp = Math.round(maxTemps[index]);
      const minTemp = Math.round(minTemps[index]);
      const displayMaxTemp = this.isCelsius ? maxTemp : this.celsius2Fahrenheit(maxTemp);
      const displayMinTemp = this.isCelsius ? minTemp : this.celsius2Fahrenheit(minTemp);
      const unit = this.isCelsius ? '°C' : '°F';

      const item = document.createElement('div');
      item.className = 'daily-item';
      item.innerHTML = `
        <div class="daily-date">${dateStr}</div>
        <div class="daily-icon">
          <i class="fas ${this.getWeatherIcon(weatherCodes[index])}"></i>
        </div>
        <div class="temp-range">
          <span class="temp-max">${displayMaxTemp}${unit}</span>
          <span class="temp-min">${displayMinTemp}${unit}</span>
        </div>
        <div class="daily-info">
          <strong>${weatherDesc}</strong><br>
          💧 ${precipitation[index]} mm
        </div>
      `;
      container.appendChild(item);
    });

    document.getElementById('forecastSection').style.display = 'block';
  }

  // ==================== CHARTS ====================

  createCharts(data) {
    const daily = data.daily;
    const dates = daily.time.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const maxTemps = daily.temperature_2m_max;
    const minTemps = daily.temperature_2m_min;
    const precipitation = daily.precipitation_sum;

    this.createTemperatureChart(dates, maxTemps, minTemps);
    this.createPrecipitationChart(dates, precipitation);

    document.getElementById('chartsSection').style.display = 'grid';
  }

  createTemperatureChart(dates, maxTemps, minTemps) {
    const ctx = document.getElementById('temperatureChart').getContext('2d');

    if (this.temperatureChart) {
      this.temperatureChart.destroy();
    }

    const displayMaxTemps = this.isCelsius ? maxTemps : maxTemps.map(t => this.celsius2Fahrenheit(Math.round(t)));
    const displayMinTemps = this.isCelsius ? minTemps : minTemps.map(t => this.celsius2Fahrenheit(Math.round(t)));

    this.temperatureChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Max Temperature',
            data: displayMaxTemps,
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Min Temperature',
            data: displayMinTemps,
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  createPrecipitationChart(dates, precipitation) {
    const ctx = document.getElementById('precipitationChart').getContext('2d');

    if (this.precipitationChart) {
      this.precipitationChart.destroy();
    }

    this.precipitationChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Precipitation (mm)',
            data: precipitation,
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: '#3498db',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // ==================== UTILITIES ====================

  toggleUnit() {
    this.isCelsius = !this.isCelsius;
    if (this.currentWeather) {
      this.displayCurrentWeather(this.currentLocation.name, this.currentWeather);
    }
    document.getElementById('unitToggle').textContent = this.isCelsius ? '°C / °F' : '°F / °C';
  }

  celsius2Fahrenheit(celsius) {
    return Math.round((celsius * 9/5) + 32);
  }

  getWeatherIcon(code) {
    // WMO Weather interpretation codes
    if (code === 0) return 'fa-sun'; // Clear sky
    if (code === 1 || code === 2) return 'fa-cloud-sun'; // Mainly clear
    if (code === 3) return 'fa-cloud'; // Overcast
    if (code === 45 || code === 48) return 'fa-smog'; // Foggy
    if (code >= 51 && code <= 67) return 'fa-cloud-rain'; // Drizzle
    if (code >= 71 && code <= 77) return 'fa-snowflake'; // Snow
    if (code >= 80 && code <= 82) return 'fa-cloud-rain'; // Rain showers
    if (code >= 85 && code <= 86) return 'fa-snowflake'; // Snow showers
    if (code >= 80 && code <= 99) return 'fa-bolt'; // Thunderstorm
    return 'fa-cloud';
  }

  getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy (rime)',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  }

  // ==================== UI HELPERS ====================

  showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
  }

  showError(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }

  hideError() {
    document.getElementById('error').style.display = 'none';
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  new WeatherDashboard();
  console.log('✅ Weather Dashboard loaded');
});
