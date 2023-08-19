// City vairable
var city;

// The function generates HTML Markup
function generateHTMLMarkup(data){
    document.querySelector(".heading").innerHTML = city;
    let oldData = document.querySelector(".oldData");
    if (data.length == 0){
        // If no data found
        oldData.innerHTML += `<div class="record">Sorry, no results found for ${city}.</div>`;
    }else{
        // If data found
        data.forEach(day => {
            oldData.innerHTML += `<div class="record record${day.id}"></div>`;
            let recordHTML = document.querySelector(`.record${day.id}`);
            recordHTML.innerHTML += `
                ${day.date_accessed}                    
                ${day.day_accessed}<br>
                <img id="icon" src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather_condition}">
                <p>Temperature: ${day.temperature}</p>
                <p>Weather Condition: ${day.weather_condition}</p>
                <p>Humidity: ${day.humidity}%</p>
                <p>Atmospheric Pressure: ${day.pressure}hPa</p>
                <p>Wind Speed: ${day.wind}m/s</p>
                <p>Sunrise: ${day.sunrise}</p>
                <p>Sunset: ${day.sunset}</p>
                <p>Time Accessed: ${day.time_accessed}</p>                    
            `;
        })
    }
}

// This function sets color to the page
function setColor(){
    document.documentElement.style.setProperty("--color1", "#2A2F4F");
    document.documentElement.style.setProperty("--color2", "#E5BEEC");
    document.documentElement.style.setProperty("--color3", "#917FB3");
    document.documentElement.style.setProperty("--color4", "#FDE2F3");
    document.documentElement.style.setProperty("--color8", "#FFFFFF");
    document.documentElement.style.setProperty("--color9", "#000000");
}

// This function fetches data from php
async function fetchData(city){
	const data = {"city": city}
    let res = await fetch("select.php", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) 
    })
    let phpRes = await res.json();
    console.log("Data from database");
    return phpRes
}

// This function gets city name from url
function getParams ()
{
    var result = {};
    var tmp = [];

    location.search
        .substr (1)
        .split ("&")
        .forEach (function (item)
        {
            tmp = item.split ("=");
            result [tmp[0]] = decodeURIComponent (tmp[1]);
        });
    return result["city"];
}

// Assigning getParams to location
location.getParams = getParams;

// This function is called when loading page
async function afterLoad(){
    setColor();
    document.querySelector('.goBack').addEventListener('click', () => {
        window.history.back();
    });
    city = location.getParams();
    const data = await fetchData(city);
    generateHTMLMarkup(data)
}

afterLoad();