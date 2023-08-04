// Initializing and declaring variables / constants
const weatherApiKey = "aed665453c27a5f70380c4ed539caae8";
const timezoneApiKey = "RZOE6Z1ETE2M";
const defaultCity = "East Lindsey District";
let workingInCity = "";
let currentCity = "";

// This function displays animation or stops
function loadAnimation(isLoad) {
    // if true start animation
    if (isLoad) {
        let dots = "";
        startLoading = setInterval(() => {
            if (dots.length === 4) {
                dots = "";
            } 
            dots += ".";
            const div = document.querySelector(".currentDay");
            div.innerHTML = 'Loading' + dots;
        }, 500);
        return startLoading;
    } else {
        // if false end animation
        clearInterval(startLoading);
    }
}

// The function returns timezone from position using timezoneDB api
async function getTimezoneFromLocation(lat, lon) {
    const apiUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&by=position&lat=${lat}&lng=${lon}&format=json`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    // if place not found
    if (data.Error) {
        return data;
    }
    return data;
}

// This function changes the color of ui according to the temperature
function setColor(temp){
    if (temp >= 30){
        document.documentElement.style.setProperty("--color1", "#411530"); 
        document.documentElement.style.setProperty("--color2", "#E95C63");
        document.documentElement.style.setProperty("--color3", "#C74B50"); 
        document.documentElement.style.setProperty("--color4", "#FFEE63");
        document.documentElement.style.setProperty("--color8", "#FFFFFF");
        document.documentElement.style.setProperty("--color9", "#000000");
    }else if (temp >= 10){
        document.documentElement.style.setProperty("--color1", "#2A2F4F");
        document.documentElement.style.setProperty("--color2", "#E5BEEC");
        document.documentElement.style.setProperty("--color3", "#917FB3");
        document.documentElement.style.setProperty("--color4", "#FDE2F3");
        document.documentElement.style.setProperty("--color8", "#FFFFFF");
        document.documentElement.style.setProperty("--color9", "#000000");
    } else {
        document.documentElement.style.setProperty("--color1", "#1F6E8C");
        document.documentElement.style.setProperty("--color2", "#0E2954");
        document.documentElement.style.setProperty("--color3", "#2E8A99");
        document.documentElement.style.setProperty("--color4", "#84A7A1");
        document.documentElement.style.setProperty("--color8", "#FFFFFF");
        document.documentElement.style.setProperty("--color9", "#000000");
    }
}

// This function generates HTML markup from api data
function generateHTMLMarkup(data, icon, cityCountry, dateTime) {
    let currentWeather = document.querySelector(".currentDay");
    currentWeather.innerHTML = `
            <div class="weatherDetails">
                <div id="flexBox1">
                    <div id="logo"><img id="icon" src="${icon}" alt="${icon}"></div>
                    <div id="box1">
                        <div id="temperature"> <img width="80" height="80" src="https://img.icons8.com/color/96/thermometer.png" alt="thermometer"/>${data.main.temp}°C</div>
                        <div id="cityName">${cityCountry}</div>
                    </div>
                </div>
                <br>
                <div id="description">Weather Condition: ${data.weather.description}</div>
                <div id="flexBox2">
                    <div id="humidity"><img width="80" height="80" src="https://img.icons8.com/color/96/humidity.png" alt="humidity"/> ${data.main.humidity}%</div>
                    <div id="pressure"><img width="80" height="80" src="https://img.icons8.com/color/96/atmospheric-pressure.png" alt="atmospheric-pressure"/> ${data.main.pressure} hPa</div>
                    <div id="wind"><img width="80" height="80" src="https://img.icons8.com/color/96/wind.png" alt="wind"/>  ${data.wind.speed} m/s</div>
                </div>
                <br>
                <div id="sunrise"><img width="80" height="80" src="https://img.icons8.com/color/96/sunrise.png" alt="sunrise"/>  ${values.sys.sunrise}</div>
                <div id="sunset"><img width="80" height="80" src="https://img.icons8.com/color/96/sunset.png" alt="sunset"/>  ${values.sys.sunset}</div><br>
                <div id="dateTime">Accessed at ${values.time} ${values.date}</div>
            </div>`
}

// This function calculates date time values
async function calculateDateTime (values) {
    try{
        let timezone = await getTimezoneFromLocation(values.coord.lat, values.coord.lon);
        let sunrise = new Date(values.sys.sunrise * 1000).toLocaleString("en-US", { timeZone: timezone.zoneName }) + ` ${timezone.abbreviation}`;
        let sunset = new Date(values.sys.sunset * 1000).toLocaleString("en-US", { timeZone: timezone.zoneName }) + ` ${timezone.abbreviation}`;
        let today = new Date();
        let date = today.toDateString();
        let time = today.toTimeString();
        return { sunrise, sunset, date, time };    
    }catch{
        let sunrise = `Sunrise not available`;
        let sunset = `Sunset not available`;
        let date = `Date not available`;
        let time = `Time not available`;
        return { sunrise, sunset, date, time };
    }
}

// This function unpacks data from open weather api
async function parseData(city, data) {
    let cityCountry = ``;
    let currentWeather = document.querySelector(".currentDay");
    loadAnimation(false);
    values = {
        'cod': data['cod'],
        'coord': {
            'lat': data['coord']['lat'],
            'lon': data['coord']['lon']
        },
        'weather': {
            'icon': data['weather'][0]['icon'],
            'description': data['weather'][0]['description']
        },
        'sys': {
            'country': data['sys']['country'],
            'sunrise': data['sys']['sunrise'],
            'sunset': data['sys']['sunset']
        },
        'name': data['name'],
        'main': {
            'temp': data['main']['temp'],
            'humidity': data['main']['humidity'],
            'pressure': data['main']['pressure']
        },
        'wind': {
            'speed': data['wind']['speed']
        }
    }
    // If city not found
    if (values.cod == 404) {
        currentWeather.innerHTML = `Sorry "${city}" city not found`;
    } else {
        // If city found
        let icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        if (values.sys.country == undefined){
            cityCountry = values.name;
        }else{
            cityCountry = `${values.name}, ${values.sys.country}`;
        }
        dateTime = await calculateDateTime(values);
        setColor(values.main.temp);
        values['sys']['sunrise'] = dateTime["sunrise"];
        values['sys']['sunset'] = dateTime["sunset"];
        values['date'] = dateTime["date"]
        values['time'] = dateTime["time"]
        generateHTMLMarkup(values, icon, cityCountry);
    }
    setCustomEventListeners(true);
}

// This function gets weather details from open weather api
async function fetchWeather(city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        // If error occurs
        if (data.cod > 400) {
            loadAnimation(false);
            throw new Error("City not found");
        } else {
            return data;
        }
    } catch (error) {
        loadAnimation(false);
        document.querySelector(".currentDay").textContent = `Failed to get weather details of ${city}, please try again.`;
        setCustomEventListeners(true);
    }
}

// This function gets city from position from reverse open weather api
async function getCityFromLatLong(lat, long) {
    try{
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&units=metric&appid=${weatherApiKey}`)
        const data = await response.json();
        currentCity = data[0].name;
        // Open weather does not takes in municipality
        if (currentCity.includes("Municipality")) {
            currentCity = currentCity.slice(0, -13);
        }
        workingInCity = currentCity;
    }catch(error) {
        currentWeather.textContent = "Failed to get weather details, please try again.";
        };
}

// If geolocation is resolved
const resolveLocation = position => {
    getCityFromLatLong(position.coords.latitude, position.coords.longitude);
}

// If geolocation is rejected
const rejectLocation = () => {
    const currentWeather = document.querySelector(".currentDay");
    currentWeather.textContent = "Browser failed to get location. Please give location access.";
    loadAnimation(false);
}

// This function uses geolocation using browser api and returns city
async function getCurrentLocation() {
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            loadAnimation(false);
            resolveLocation(position);
        } catch (error) {   
            document.querySelector(".currentDay").textContent = "Some error occured, please try again."
            loadAnimation(false);
            rejectLocation();
        }
    } else {
        document.querySelector(".currentDay").textContent = "Geolocation not available.";
    }
}

// This function
async function triggerForLocation(event) {
    setCustomEventListeners(false);
    loadAnimation(true);
    let triggeredBy = this.id;
    // If this function is called when page is loaded 
    if (event === defaultCity) {
            workingInCity = event;
    // If this function is loaded when search button is pressed or enter key is pressed
    } else if (triggeredBy === "searchIcon" || event.target.classList[0] === "search") {
        let textInputCity = document.querySelector(".search").value;
        // If text input is empty
        if (textInputCity === "") {
            alert("Empty text field found, please enter valid city name.");
            loadAnimation(false);
            setCustomEventListeners(true);
            return;
            }
        workingInCity = textInputCity;
    // If this function is loaded when current location button is pressed
    } else if (triggeredBy === "currentLocation") {
        if (currentCity == ""){
            await getCurrentLocation();
        }else{
            workingInCity = currentCity;
        }
    }
    // Start this after 2 seconds of the triggered
    setTimeout(async () => {
        if (triggeredBy == "currentLocation" && currentCity == "") {
            setCustomEventListeners(true);
            return
        }else{
                parseData(workingInCity, await fetchWeather(workingInCity));
        } 
    }, 2000);  
}

// This function adds event listeners
function setCustomEventListeners(isTrue){
    if (isTrue){
        document.querySelector("#searchIcon").addEventListener("click", triggerForLocation);
        document.querySelector("#currentLocation").addEventListener("click", triggerForLocation);
    }else{
        document.querySelector("#searchIcon").removeEventListener("click", triggerForLocation);
        document.querySelector("#currentLocation").removeEventListener("click", triggerForLocation);
    }
}

// This function is called when the page is loaded
function pageBegin() {
    document.getElementById("pageHead").textContent = "WeatherApp";
    setCustomEventListeners(true);
    let timeoutId;
    // Setting enter key event listener
    document.querySelector(".search").addEventListener("keyup", function (event) {
        clearTimeout(timeoutId);
        if (event.key === "Enter") {
            timeoutId = setTimeout(function () {
                triggerForLocation(event);
            }, 500);
        }
    });
    triggerForLocation(defaultCity);
}

// calling pageBegin when page is loaded
pageBegin();