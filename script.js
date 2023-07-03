const apiKey = 'aed665453c27a5f70380c4ed539caae8';
let workingInCity = "";
let currentCity = "";
let currentData = "";

async function fetchWeather(city) {
    return await new Promise((resolve, reject) => {
        let apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                if (data.Error) {
                    reject("City not found");
                } else {
                    resolve(data);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    });
}

function triggerForLocation(event) {
    loadAnimation(true);
    let textInputCity = document.querySelector(".search").value;
    let triggeredBy = this.id;
    if (event === "Kathmandu") {
        currentCity = event;
    } else if (triggeredBy === "searchIcon" || event.target.classList[0] === "search") {
        if (textInputCity === "") {
            alert("City name not found");
            return;
        }
        currentCity = textInputCity;
    } else if (triggeredBy === "currentLocation") {
        getCurrentLocation();
    }
    setTimeout(async () => {
        setWeather(currentCity, await fetchWeather(currentCity));
    }, 650);
}


function pageBegin() {
    let buttonClasses = ["#searchIcon", "#currentLocation"];
    document.getElementById("pageHead").textContent = "WeatherApp";
    buttonClasses.forEach(button => { document.querySelector(button).addEventListener("click", triggerForLocation); });
    document.querySelector("#searchIcon").addEventListener("click", triggerForLocation);
    document.querySelector("#currentLocation").addEventListener("click", triggerForLocation);
    document.querySelector(".search").addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            triggerForLocation(event);
        }
    });
    triggerForLocation("Kathmandu");
}

pageBegin();