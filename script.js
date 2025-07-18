const countries = ["HU", "HU", "US", "US", "US", "US", "US", "FR", "NL"];
const cities = [
  "Hajdúböszörmény",
  "Üröm",
  "Los Angeles",
  "San Francisco",
  "Las Vegas",
  "Washington D.C.",
  "New York",
  "Párizs",
  "Amszterdam",
];
const coordinates = [
  { lat: 47.6691, lon: 21.5121 }, // Hajdúböszörmény
  { lat: 47.6142, lon: 18.9632 }, // Üröm
  { lat: 34.0522, lon: -118.2437 }, // Los Angeles
  { lat: 37.7749, lon: -122.4194 }, // San Francisco
  { lat: 36.1699, lon: -115.1398 }, // Las Vegas
  { lat: 38.89511, lon: -77.03637 }, // Washington D.C.
  { lat: 40.7128, lon: -74.006 }, // New York
  { lat: 48.8566, lon: 2.3522 }, // Párizs
  { lat: 52.3676, lon: 4.9041 }, // Amszterdam
];

const bg = document.querySelector(".bg");

function isNight(timeZone) {
  const now = new Date();
  const localHour = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone,
  }).format(now);
  const hour = parseInt(localHour);
  return hour >= 20 || hour < 6;
}

for (let i = 0; i < cities.length; i++) {
  const cityCard = document.createElement("div");
  cityCard.classList.add("city-card");

  const cityInfo = document.createElement("div");
  cityInfo.classList.add("city-info");

  const flagImg = document.createElement("img");
  flagImg.src = `https://flagsapi.com/${countries[i]}/flat/64.png`;

  const cityName = document.createElement("span");
  cityName.classList.add("city-name");
  cityName.textContent = cities[i];

  const timeSpan = document.createElement("span");
  timeSpan.classList.add("time");

  let timeZone;
  switch (cities[i]) {
    case "Los Angeles":
      timeZone = "America/Los_Angeles";
      break;
    case "San Francisco":
      timeZone = "America/Los_Angeles";
      break;
    case "Las Vegas":
      timeZone = "America/Los_Angeles";
      break;
    case "New York":
      timeZone = "America/New_York";
      break;
    case "Párizs":
      timeZone = "Europe/Paris";
      break;
    case "Amszterdam":
      timeZone = "Europe/Amsterdam";
      break;
    case "Washington D.C.":
      timeZone = "America/New_York";
      break;
    case "Üröm":
      timeZone = "Europe/Budapest";
      break;
    case "Hajdúböszörmény":
      timeZone = "Europe/Budapest";
      break;
    default:
      timeZone = "UTC";
  }

  function updateTimeAndTheme() {
    const now = new Date();
    timeSpan.textContent = new Intl.DateTimeFormat("hu-HU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: timeZone,
    }).format(now);

    if (isNight(timeZone)) {
      cityCard.style.background = "rgba(0, 0, 0, 0.8)";
      cityCard.style.color = "#eee";
    } else {
      cityCard.style.background = "rgba(255, 255, 255, 0.3)";
      cityCard.style.color = "#000";
    }
  }

  updateTimeAndTheme();
  setInterval(updateTimeAndTheme, 1000);

  cityInfo.appendChild(flagImg);
  cityInfo.appendChild(cityName);
  cityCard.appendChild(cityInfo);
  cityCard.appendChild(timeSpan);
  bg.appendChild(cityCard);
}

const cityInfos = document.querySelectorAll(".city-card");
const idojarasablak = document.querySelector(".idojaras");
cityInfos.forEach((info, index) => {
  info.addEventListener("click", () => {
    idojarasablak.classList.remove("idojaras-rejtett");
    // console.log(cities[index].split("/")[0]);
    // console.log(`lat: ${coordinates[index].lat}, lon: ${coordinates[index].lon}`);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coordinates[index].lat}&longitude=${coordinates[index].lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current=temperature_2m,rain,relative_humidity_2m,wind_speed_10m&timezone=auto&daily=weather_code&current=weather_code`
    )
      .then((r) => r.json())
      .then((data) => {
        console.log(data);
        adatkiirás(data, index);
      });
  });
});

function adatkiirás(data, index) {
  idojarasablak.innerHTML = `
  <button onclick="bezar()">&times;</button>
  <h4>${cities[index]}, ${countries[index]}</h4>
  <h3>
  ${getWeatherIcon(data.current.weather_code).icon} ${
    data.current.temperature_2m
  } ${data.daily_units.temperature_2m_max}
  ${getWeatherIcon(data.current.weather_code).description}
  </h3>
  <p>
  🌡️ ${data.daily.temperature_2m_min[0]}${
    data.daily_units.temperature_2m_max
  } → ${data.daily.temperature_2m_max[0]}${data.daily_units.temperature_2m_max}
  </p>
  <p>🌧️ ${data.current.rain}${
    data.current_units.relative_humidity_2m
  } csapadék</p>
  <p>💨 ${data.current.wind_speed_10m}${
    data.current_units.wind_speed_10m
  } szélsebesség</p>
  `;
  // console.log(getWeatherIcon(4))
  let table = `<table>
    <thead>
      <tr>
        <th>Dátum</th>
        <th>Nap</th>
        <th>Időjárás</th>
        <th>Min hőm.</th>
        <th>Max hőm.</th>
      </tr>
    </thead>
    <tbody>
  `;
  for (let i = 1; i < 7; i++) {
    const iconObj = getWeatherIcon(data.daily.weather_code[i]);
    table += `
      <tr>
        <td>${data.daily.time[i]}</td>
        <td>${melyiknap(data.daily.time[i])}</td>
        <td>${iconObj.icon} ${iconObj.description}</td>
        <td>${data.daily.temperature_2m_min[i]}${data.daily_units.temperature_2m_min}</td>
        <td>${data.daily.temperature_2m_max[i]}${data.daily_units.temperature_2m_max}</td>
      </tr>
    `;
  }
  table += `</tbody></table>`;
  idojarasablak.innerHTML += table;
}

function bezar() {
  idojarasablak.innerHTML = "";
  idojarasablak.classList.add("idojaras-rejtett");
}

function getWeatherIcon(weatherCode) {
  const weatherMap = {
    0: { icon: "☀️", description: "Derült égbolt" },
    1: { icon: "🌤️", description: "Többnyire derült" },
    2: { icon: "⛅", description: "Részben felhős" },
    3: { icon: "☁️", description: "Borult" },
    45: { icon: "🌫️", description: "Köd" },
    48: { icon: "🌫️", description: "Zúzmarás köd" },
    51: { icon: "🌧️", description: "Enyhe szitálás" },
    53: { icon: "🌧️", description: "Mérsékelt szitálás" },
    55: { icon: "🌧️", description: "Sűrű szitálás" },
    56: { icon: "🌨️", description: "Enyhe ónos szitálás" },
    57: { icon: "🌨️", description: "Sűrű ónos szitálás" },
    61: { icon: "🌦️", description: "Enyhe eső" },
    63: { icon: "🌦️", description: "Mérsékelt eső" },
    65: { icon: "🌧️", description: "Heves eső" },
    66: { icon: "🌨️", description: "Enyhe ónos eső" },
    67: { icon: "🌨️", description: "Heves ónos eső" },
    71: { icon: "❄️", description: "Enyhe havazás" },
    73: { icon: "❄️", description: "Mérsékelt havazás" },
    75: { icon: "❄️", description: "Heves havazás" },
    77: { icon: "🌨️", description: "Hószemcsék" },
    80: { icon: "🌦️", description: "Enyhe záporok" },
    81: { icon: "🌦️", description: "Mérsékelt záporok" },
    82: { icon: "⛈️", description: "Heves záporok" },
    85: { icon: "🌨️", description: "Enyhe hózáporok" },
    86: { icon: "🌨️", description: "Heves hózáporok" },
    95: { icon: "⛈️", description: "Zivatar" },
    96: { icon: "⛈️", description: "Zivatar enyhe jégesővel" },
    99: { icon: "⛈️", description: "Zivatar heves jégesővel" },
  };

  return (
    weatherMap[weatherCode] || { icon: "❓", description: "Unknown weather" }
  );
}

function melyiknap(datum) {
  const date = new Date(datum);

  // Napok nevei
  const daysOfWeek = ["Vas", "H", "Ke", "Szer", "Csüt", "Pén", "Szo"];

  const dayName = daysOfWeek[date.getDay()];

  return dayName;
}
