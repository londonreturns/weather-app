const weatherApiKey = "aed665453c27a5f70380c4ed539caae8";
const timezoneApiKey = "RZOE6Z1ETE2M";
const defaultCity = "East Lindsey District";
let workingInCity = "";
let currentCity = "";

function loadAnimation(isLoad) {
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
        clearInterval(startLoading);
    }
}

async function getTimezoneFromLocation(lat, lon) {
    const apiUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneApiKey}&by=position&lat=${lat}&lng=${lon}&format=json`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.Error) {
        throw new Error("City not found");
    }
    return data;
}

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

async function parseData(city, data) {
    let cityCountry = ``;
    let currentWeather = document.querySelector(".currentDay");
    console.log(city);
    console.log(data);
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
    if (values.cod == 404) {
        currentWeather.innerHTML = `Sorry "${city}" city not found`;
    } else {
        let icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        if (values.sys.country == undefined){
            cityCountry = values.name;
        }else{
            cityCountry = `${values.name}, ${values.sys.country}`;
        }
        dateTime = await calculateDateTime(values);
        setColor(values.main.temp);
        generateHTMLMarkup(values, icon, cityCountry, dateTime);
    }
    setCustomEventListeners(true);
}

async function fetchWeather(city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.cod > 400) {
            loadAnimation(false);
            throw new Error("City not found");
        } else {
            return data;
        }
    } catch (error) {
        loadAnimation(false);
        document.querySelector(".currentDay").textContent = `Failed to get weather details, please try again.`;
        setCustomEventListeners(true);
    }
}

async function getCityFromLatLong(lat, long) {
    try{
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&units=metric&appid=${weatherApiKey}`)
        const data = await response.json();
        currentCity = data[0].name;
        if (currentCity.includes("Municipality")) {
            currentCity = currentCity.slice(0, -13);
        }
        workingInCity = currentCity;
    }catch(error) {
        currentWeather.textContent = "Failed to get weather details, please try again.";
        };
}

const resolveLocation = position => {
    getCityFromLatLong(position.coords.latitude, position.coords.longitude);
}

const rejectLocation = () => {
    const currentWeather = document.querySelector(".currentDay");
    currentWeather.textContent = "Browser failed to get location. Please give location access.";
    loadAnimation(false);
}

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


async function triggerForLocation(event) {
    setCustomEventListeners(false);
    loadAnimation(true);
    let triggeredBy = this.id;
    if (event === defaultCity) {
            workingInCity = event;
    } else if (triggeredBy === "searchIcon" || event.target.classList[0] === "search") {
        let textInputCity = document.querySelector(".search").value;
        if (textInputCity === "") {
            alert("City name not found");
            loadAnimation(false);
            setCustomEventListeners(true);
            return;
            }
        workingInCity = textInputCity;
    } else if (triggeredBy === "currentLocation") {
        if (currentCity == ""){
            await getCurrentLocation();
        }else{
            workingInCity = currentCity;
        }
    }
    setTimeout(async () => {
        if (triggeredBy == "currentLocation" && currentCity == "") {
            setCustomEventListeners(true);
            return
        }else{
                parseData(workingInCity, await fetchWeather(workingInCity));
        } 
    }, 2000);  
}


function setCustomEventListeners(isTrue){
    if (isTrue){
        document.querySelector("#searchIcon").addEventListener("click", triggerForLocation);
        document.querySelector("#currentLocation").addEventListener("click", triggerForLocation);
    }else{
        document.querySelector("#searchIcon").removeEventListener("click", triggerForLocation);
        document.querySelector("#currentLocation").removeEventListener("click", triggerForLocation);
    }
}


function pageBegin() {
    document.getElementById("pageHead").textContent = "WeatherApp";
    setCustomEventListeners(true);
    let timeoutId;
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

pageBegin();