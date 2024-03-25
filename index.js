const userTab = document.querySelector('[data-userWeather]')
const searchTab = document.querySelector('[data-searchWeather]')
const userContainer = document.querySelector('.weather-container');

const grantAccessContainer = document.querySelector('.grant-location-container');
const grantAccessButton = document.querySelector('[data-grantAccess]');
const searchForm = document.querySelector('[data-searchForm]');
const searchInput = document.querySelector('[data-searchInput]');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const errorContainer = document.querySelector('.error-container');

const key = "1ea03d37104cf73b90af496e1b523663";
let curentTab = userTab;
curentTab.classList.add('current-tab');
getFromSessionStorage();

function switchTab(clickedTab) {
    if(curentTab != clickedTab) {
        curentTab.classList.remove('current-tab');
        curentTab = clickedTab;
        curentTab.classList.add('current-tab');

        if(!searchForm.classList.contains('active')) {
            userInfoContainer.classList.remove('active');
            grantAccessContainer.classList.remove('active');
            errorContainer.classList.remove('active');
            searchForm.classList.add('active');

            searchInput.value = "";
        } else {
            errorContainer.classList.remove('active');
            userInfoContainer.classList.remove('active');
            searchForm.classList.remove('active');
            getFromSessionStorage();
        }
    }
}
userTab.addEventListener('click',()=>{
    // pass clicked tab as input parameter
    switchTab(userTab)
});

searchTab.addEventListener('click',()=>{
    // pass clicked tab as input parameter
    switchTab(searchTab)
});

function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add('active');
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // make grant container invisible 
    grantAccessContainer.classList.remove('active');
    // make loader visible
    loadingScreen.classList.add('active');

    // API CALL
    try {
        if(lat === undefined || lon === undefined) {
            throw -1;
        }
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data); 
    }
    catch(err) {
        loadingScreen.classList.remove('active');
        errorContainer.classList.add('active');
    }
}

function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weatherDesc]'); 
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0].description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getlocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        errorContainer.classList.add('active');
    }
}
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }
    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);  
}
grantAccessButton.addEventListener('click', getlocation);

searchForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(searchInput.value === "") return;
    fetchSearchWeatherInfo(searchInput.value);
})
async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessContainer.classList.remove('active');

    try{
        if(errorContainer.classList.contains('active')) {
            errorContainer.classList.remove('active');
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');

        if(data?.name === undefined) {
            throw -1;
        }

        renderWeatherInfo(data);

    } catch(e) {

        userInfoContainer.classList.remove('active');
        errorContainer.classList.add('active');

    }
}