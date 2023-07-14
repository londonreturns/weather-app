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