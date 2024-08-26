// Define variables for various elements in the document and API key
let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = 'bf185ff1b48bf76e729a95f984cf3ea1';
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecastCard = document.querySelector('.day-forecast'),
    aqiCard = document.querySelectorAll('.highlights .card')[0],
    sunriseCard = document.querySelectorAll('.highlights .card')[1],
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windSpeedVal = document.getElementById('windSpeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    hourlyForecastCard = document.querySelector('.hourly-forecast'),
    aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']; // Air Quality Index descriptions

// Function to get weather details based on the city's coordinates
function getWeatherDetails(name, lat, lon, country, state){

    // URLs for fetching weather, forecast, and air pollution data
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
    
        // Arrays for day and month names
        days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday'
        ],
        months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];

    // Fetch Air Quality Index data and update the UI
    fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
        let {co, no, no2, o3, so2, pm2_5, pm10, nh3} = data.list[0].components;
        aqiCard.innerHTML = `
            <div class="card-head">
                <p>Air Quality Index</p>
                <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
            </div>
            <div class="air-indices">
                <i class="fa-regular fa-wind fa-3x"></i>
                <div class="item">
                    <p>PM2.5</p>
                    <h2>${Math.round(pm2_5)}</h2>
                </div>
                <div class="item">
                    <p>PM10</p>
                    <h2>${Math.round(pm10)}</h2>
                </div>
                <div class="item">
                    <p>SO2</p>
                    <h2>${Math.round(so2)}</h2>
                </div>
                <div class="item">
                    <p>CO</p>
                    <h2>${Math.round(co)}</h2>
                </div>
                <div class="item">
                    <p>NO</p>
                    <h2>${Math.round(no)}</h2>
                </div>
                <div class="item">
                    <p>NO2</p>
                    <h2>${Math.round(no2)}</h2>
                </div>
                <div class="item">
                    <p>NH3</p>
                    <h2>${Math.round(nh3)}</h2>
                </div>
                <div class="item">
                    <p>O3</p>
                    <h2>${Math.round(o3)}</h2>
                </div>
            </div>
        `;
    }).catch(() => {
        alert('Failed to fetch Air Quality Index');
    });

    function capitalizeFirstLetter(string) {
      return string.replace(/\b\w/g, function(char) {
          return char.toUpperCase();
      });
  }

    // Fetch current weather data and update the UI
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        
        // Capitalize the description before inserting it into the HTML
        let weatherDescription = capitalizeFirstLetter(data.weather[0].description);

        // Update the current weather card
        currentWeatherCard.innerHTML = `
            <div class="current-weather">
                <div class="details">
                    <p>Now</p>
                    <h2>${Math.round(data.main.temp - 273.15)}&deg;C</h2>
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

        // Extract and format sunrise and sunset times
        let {sunrise, sunset} = data.sys,
            {timezone, visibility} = data,
            {humidity, pressure, feels_like} = data.main,
            {speed} = data.wind,
            sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
            sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

        // Update the sunrise and sunset card
        sunriseCard.innerHTML = `
            <div class="card-head">
                <p>Sunrise & Sunset</p>
            </div>
            <div class="sunrise-sunset">
                <div class="item">
                    <div class="icon">
                        <i class="fa-light fa-sunrise fa-4x"></i>
                    </div>
                    <div>
                        <p>Sunrise</p>
                        <h2>${sRiseTime}</h2>
                    </div>
                </div>
                <div class="item">
                    <div class="icon">
                        <i class="fa-light fa-sunset fa-4x"></i>
                    </div>
                    <div>
                        <p>Sunset</p>
                        <h2>${sSetTime}</h2>
                    </div>
                </div>
            </div>
        `;

        // Update other weather highlights
        humidityVal.innerHTML = `${Math.round(humidity)}%`;
        pressureVal.innerHTML = `${Math.round(pressure)}hPa`;
        visibilityVal.innerHTML = `${Math.round(visibility / 1000)}km`;
        windSpeedVal.innerHTML = `${Math.round(speed)}m/s`;
        feelsVal.innerHTML = `${Math.round(feels_like - 273.15)}&deg;C`;
    }).catch(() => {
        alert('Failed to fetch current weather');
    });

    // Fetch 5-day weather forecast data and update the UI
    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        hourlyForecastCard.innerHTML = '';

        // Populate hourly forecast for the first 8 hours
        for(let i = 0; i <= 7; i++){
            let hrForecastDate = new Date(data.list[i].dt_txt);
            let hr = hrForecastDate.getHours();
            let a = 'PM';
            if(hr < 12) a = 'AM';
            if(hr == 0) hr = 12;
            if(hr > 12) hr = hr - 12;
            hourlyForecastCard.innerHTML += `
                <div class="card">
                    <p>${hr} ${a}</p>
                    <img src="https://openweathermap.org/img/wn/${data.list[i].weather[0].icon}.png" alt="">
                    <p>${Math.round(data.list[i].main.temp - 273.15)}&deg;C</p>
                </div>
            `; 
        }

        // Filter out unique forecast days
        let uniqueForecastDays = [];
        let fiveDaysForecast = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Populate 5-day forecast
        fiveDaysForecastCard.innerHTML = '';
        for(let i = 1; i < fiveDaysForecast.length; i++){
            let date = new Date(fiveDaysForecast[i].dt_txt);
            fiveDaysForecastCard.innerHTML += `
                <div class="forecast-item">
                    <div class="icon-wrapper">
                        <img src="https://openweathermap.org/img/wn/${fiveDaysForecast[i].weather[0].icon}.png" alt="">
                        <span>${Math.round(fiveDaysForecast[i].main.temp - 273.15)}&deg;C</span>
                    </div>
                    <p>${date.getDate()} ${months[date.getMonth()]}</p>
                </div>
            `;
        }
    }).catch(() => {
        alert('Failed to fetch forecast data');
    });
}

// Function to get the coordinates of a city based on user input
function getCityCoordinates(){
    let city = cityInput.value.trim();
    if(city.length == 0) return alert('Please enter a city name');

    // URL for fetching city coordinates
    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert('Location not found!');
        let {name, lat, lon, country, state} = data[0];
        getWeatherDetails(name, lat, lon, country, state);
    }).catch(() => {
        alert('Failed to fetch coordinates');
    });
}

// Event listener for search button click to fetch weather data based on city input
searchBtn.addEventListener('click', getCityCoordinates);

// Event listener for location button click to fetch weather data based on user's current location
locationBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(
        pos => {
            let {latitude: lat, longitude: lon} = pos.coords;
            let REVERSE_GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${api_key}`;
            fetch(REVERSE_GEOCODING_API_URL).then(res => res.json()).then(data => {
                let {name, lat, lon, country, state} = data[0];
                getWeatherDetails(name, lat, lon, country, state);
            }).catch(() => {
                alert('Failed to fetch coordinates');
            });
        },
        err => {
            alert('Failed to fetch your location');
        },
        {enableHighAccuracy: true}
    );
});
