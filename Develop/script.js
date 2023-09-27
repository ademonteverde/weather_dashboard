const apiKey = "79ce5698f640b6e72655a5440a21d55d";

const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const currentWeatherSection = document.querySelector(".current-weather");
const forecastSection = document.querySelector(".forecast");
const searchHistorySection = document.querySelector(".search-history");

// Event listener
searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (city !== "") {
        // Fetch lat and lon with city name
        const geolocationData = await getWeatherGeolocation(city);

        if (geolocationData) {
            // Fetch current weather data and 5-day forecast
            const weatherData = await getWeatherDataByLatLon(geolocationData.lat, geolocationData.lon);

            if (weatherData) {
                displayCurrentWeather(weatherData);
                displayForecast(weatherData);

                // Add city to the search history
                addToSearchHistory(city);
                cityInput.value = "";
            } else {
                alert("City not found. Please try again.");
            }
        } else {
            alert("Geolocation data not found. Please try again.");
        }
    }
});

// Fetch lat and lon with city name
async function getWeatherGeolocation(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${apiKey}`);
        const data = await response.json();

        if (data.length > 0) {
            const { lat, lon } = data[0];
            return { lat, lon };
        } else {
            console.error("No data found for the given location.");
            return null;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
};

// Fetch current weather and 5-day forecast based on lat and lon
async function getWeatherDataByLatLon(lat, lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
};

// Function to display current weather data
function displayCurrentWeather(data) {
    const cityName = data.city.name;
    const date = new Date(data.list[0].dt * 1000);
    const iconCode = data.list[0].weather[0].icon;
    const temperature = data.list[0].main.temp;
    const humidity = data.list[0].main.humidity;
    const windSpeed = data.list[0].wind.speed;
    const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

    const currentWeatherHtml = `
    <div class="current-location">
    <h2>${cityName}
    ${date.toLocaleDateString()}</h2>
    <img src="${iconUrl}" alt="Weather Icon">
    </div>
    <p>Temperature: ${temperature}°F</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} m/s</p>
    `;

    currentWeatherSection.innerHTML = currentWeatherHtml;
}

// Function to display 5-day forecast data
function displayForecast(data) {
    // The next 5 days' data
    const forecastList = data.list.slice(1, 6);

    let forecastHtml = '<h2>5-Day Forecast:</h2>';
    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000);
        const iconCode = forecast.weather[0].icon;
        const temperature = forecast.main.temp;
        const humidity = forecast.main.humidity;
        const windSpeed = forecast.wind.speed;
        const iconUrl = `https://openweathermap.org/img/w/${iconCode}.png`;

        forecastHtml += `
            <div class="forecast-item">
            <b>
                <p>${date.toLocaleDateString()}</p>
                <img src="${iconUrl}" alt="Weather Icon">
                <p>Temp: ${temperature}°F</p>
                <p>Wind: ${windSpeed} m/s</p>
                <p>Humidity: ${humidity}%</p>
                </b>
            </div>
        `;
    });

    forecastSection.innerHTML = forecastHtml;
}

// Function to add a city to the search history
function addToSearchHistory(city) {
    const listItem = document.createElement("li");
    listItem.textContent = city;
    listItem.setAttribute("data-city", city);

    // City in the search history is clicked, new search with the selected city
    listItem.addEventListener("click", () => {
        const selectedCity = listItem.getAttribute("data-city");
        searchWeatherByCity(selectedCity);
    });

    searchHistorySection.appendChild(listItem);
}

// New Search with selected city
async function searchWeatherByCity(city) {
    const geolocationData = await getWeatherGeolocation(city);

    if (geolocationData) {
        const weatherData = await getWeatherDataByLatLon(geolocationData.lat, geolocationData.lon);

        if (weatherData) {
            displayCurrentWeather(weatherData);
            displayForecast(weatherData);
        } else {
            alert("City not found. Please try again.");
        }
    } else {
        alert("Geolocation data not found. Please try again.");
    }
}

// Get the user's current location using Geolocation API
window.addEventListener("load", async () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const weatherData = await getWeatherDataByLatLon(lat, lon);

            if (weatherData) {
                displayCurrentWeather(weatherData);
                displayForecast(weatherData);
            } else {
                alert("Error fetching weather data for current location.");
            }
        }, (error) => {
            console.error("Error getting current location:", error);
        });
    } else {
        console.error("Geolocation is not supported in this browser.");
    }
});
