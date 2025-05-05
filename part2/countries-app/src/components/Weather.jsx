import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ capital }) => {
  const [weatherData, setWeatherData] = useState(null)
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

  useEffect(() => {
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}`)
      .then(response => {
        setWeatherData(response.data)
      })
  }, [capital, apiKey])

  if (!weatherData) return <div>Loading weather data...</div>

  return (
    <div>
      <h3>Weather in {capital}</h3>
      <div>Temperature: {weatherData.main.temp} °C</div>
      <img
        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
        alt={weatherData.weather[0].description}
      />
      <div>Wind: {weatherData.wind.speed} m/s</div>
    </div>
  )
}

export default Weather
