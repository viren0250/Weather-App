const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

// for location not found
const notFound = document.querySelector(".errorContainer");
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

// Initially
let currentTab =  userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
getFromSessionStorage();

function switchTab(clickedTab) {
    if(currentTab != clickedTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            // kya search form vala tab is invisible, if yes then make it visible
            searchForm.classList.add("active");
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
        } else {
            // main pehle search tab per tha, ab your weather tab visible karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            // ab mai your weather tab me aa gya hu, to weather bhi display karna padega, so let's check local storage first for coordinates, if we have saved them there.
            getFromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if coordinates are already present in session storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("userCoordinates");
    // console.log(localCoordinates);
    if(!localCoordinates) {
        // when local coordinates is not available
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        // console.log(coordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grantAccessContainer invisible
    grantAccessContainer.classList.remove("active");
    // for loader visible
    loadingScreen.classList.add("active");

    // API call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(err) {
        loadingContainer.classList.remove('active');
        // console.log("data is getting....");

        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
    }
}

function renderWeatherInfo(weatherInfo) {
    // first we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} M/S`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

const grantAccessButton = document.querySelector("[data-grantAccess]");

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        // show an alert for no geolocation support available
        // window.alert("location can not be identified");
        console.log("coordinates not found");
        grantAccessButton.style.display = 'none';
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    };

    sessionStorage.setItem("userCoordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

grantAccessButton.addEventListener('click', getLocation);

const searchInput = document.querySelector('[data-searchInput]');

const searchBtn = document.querySelector("[data-searchBtn]");

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "") {
        return;
    }
    console.log(cityName);
    fetchSearchWeatherInfo(cityName);
    searchInput.value = "";
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");

    // API call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();

        if (!data.sys) {
            throw data;
        }

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(err) {
        console.log(err.message);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
    }
}
