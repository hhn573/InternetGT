let cityInput = document.getElementById("city_input"),
  searchBtn = document.getElementById("searchBtn"),
  api_key = "bf185ff1b48bf76e729a95f984cf3ea1",
  currentWeatherCard = document.querySelectorAll(".weather-left .card")[0];

function getWeatherDetails(name, lat, lon, country, state) {
  let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
    WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
    AIR_QUALITY_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  fetch(WEATHER_API_URL)
    .then((res) => res.json())
    .then((data) => {
      let date = new Date();
      currentWeatherCard.innerHTML = `
            <div class="current-weather">
                <div class="details">
                    <p>Now</p>
                    <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                    <p>${data.weather[0].description}</p>
                </div>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                </div>
            </div>
            <hr>
            <div class="card-footer">
                <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
                <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
            </div>
        `;
      document.getElementById("humidityVal").innerText = `${data.main.humidity}%`;
      document.getElementById("pressureVal").innerText = `${data.main.pressure} hPa`;
      document.getElementById("visibilityVal").innerText = `${(data.visibility / 1000).toFixed(1)} km`;
      document.getElementById("windSpeedVal").innerText = `${data.wind.speed} m/s`;
      document.getElementById("feelsVal").innerText = `${data.main.feels_like.toFixed(1)}°C`;

      let sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      let sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      document.querySelector(".sunrise-sunset .item:first-child h2").innerText = sunriseTime;
      document.querySelector(".sunrise-sunset .item:last-child h2").innerText = sunsetTime;
    })
    .catch(() => {
      alert("Failed to fetch current weather");
    });

  fetch(FORECAST_API_URL)
    .then((res) => res.json())
    .then((data) => {
      let uniqueForecastDays = [];
      let forecastHTML = "";

      // Filter out the forecasts for the next 5 days
      let fiveDaysForecast = data.list.filter((forecast) => {
        let forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      // Generate the forecast HTML
      fiveDaysForecast.forEach((forecast) => {
        let forecastDate = new Date(forecast.dt_txt);
        forecastHTML += `
          <div class="forecast-item">
              <div class="icon-wrapper">
                  <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="">
                  <span>${(forecast.main.temp - 273.15).toFixed(2)}&deg;C</span>
              </div>
              <p>${days[forecastDate.getDay()]}</p>
              <p>${forecastDate.getDate()} ${months[forecastDate.getMonth()]}</p>
          </div>`;
      });

      document.querySelector(".day-forecast").innerHTML = forecastHTML;
    })
    .catch(() => {
      alert("Failed to fetch weather forecast");
    });

  fetch(AIR_QUALITY_API_URL)
    .then((res) => res.json())
    .then((data) => {
      let airQualityIndex = data.list[0].main.aqi;
      let components = data.list[0].components;

      // Update Air Quality Index
      document.querySelector(".air-index").textContent = getAirQualityText(airQualityIndex);

      // Update specific pollutant values
      document.querySelector(".air-indices .item:nth-child(1) h2").textContent = components.pm2_5 + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(2) h2").textContent = components.pm10 + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(3) h2").textContent = components.so2 + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(4) h2").textContent = components.co + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(5) h2").textContent = components.no + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(6) h2").textContent = components.no2 + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(7) h2").textContent = components.nh3 + " µg/m³";
      document.querySelector(".air-indices .item:nth-child(8) h2").textContent = components.o3 + " µg/m³";
    })
    .catch(() => {
      alert("Failed to fetch air quality data");
    });
}

function getCityCoordinates() {
  let cityName = cityInput.value.trim();
  cityInput.value = "";
  if (!cityName) return;
  let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
  fetch(GEOCODING_API_URL)
    .then((res) => res.json())
    .then((data) => {
      if (data.length === 0) {
        alert(`No results found for ${cityName}`);
        return;
      }
      let { name, lat, lon, country, state } = data[0];
      getWeatherDetails(name, lat, lon, country, state);
    })
    .catch(() => {
      alert(`Failed to fetch coordinates of ${cityName}`);
    });
}

searchBtn.addEventListener("click", getCityCoordinates);
