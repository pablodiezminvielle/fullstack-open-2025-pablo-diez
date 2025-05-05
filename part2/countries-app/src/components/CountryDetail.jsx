import { useState, useEffect } from 'react'
import axios from 'axios'

const CountryDetail = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY

  const capital = country.capital[0]

  useEffect(() => {
    setLoading(true)
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`)
      .then(response => {
        setWeather(response.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching weather data:", err)
        setLoading(false)
      })
  }, [capital, apiKey])

  return (
    <div>
      <h2>{country.name.common}</h2>
      <p>Capital: {capital}</p>
      <p>Area: {country.area} km²</p>
      <h4>Languages:</h4>
      <ul>
        {Object.values(country.languages).map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>
      <img src={country.flags.svg} alt={`flag of ${country.name.common}`} width="150" />
      <h3>Weather in {capital}</h3>
      {loading && <p>Loading weather data...</p>}
      {weather && !loading && (
        <div>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Wind: {weather.wind.speed} m/s</p>
          <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="weather icon" />
        </div>
      )}
    </div>
  )
}

export default CountryDetail
