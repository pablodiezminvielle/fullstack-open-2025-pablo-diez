import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryDetail from './components/CountryDetail'

const App = () => {
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)

  useEffect(() => {
    if (query.length === 0) {
      setCountries([])
      setSelectedCountry(null)
      return
    }
  
    axios
      .get(`https://restcountries.com/v3.1/name/${query}`)
      .then(response => {
        setCountries(response.data)
        if (response.data.length === 1) {
          setSelectedCountry(response.data[0])
        } else {
          setSelectedCountry(null)
        }
      })
      .catch(error => {
        console.error("Error fetching countries:", error.message)
        setCountries([])
        setSelectedCountry(null)
      })
  }, [query])
  

  const handleShow = (country) => {
    setSelectedCountry(country)
  }

  return (
    <div>
      <h1>Country Info</h1>
      <div>
        Find countries: <input value={query} onChange={e => setQuery(e.target.value)} />
      </div>
  
      {selectedCountry ? (
        <CountryDetail country={selectedCountry} />
      ) : countries.length > 10 ? (
        <p>Too many matches, specify another filter</p>
      ) : countries.length > 1 ? (
        countries.map(c => (
          <div key={c.cca3}>
            {c.name.common} <button onClick={() => handleShow(c)}>show</button>
          </div>
        ))
      ) : countries.length === 1 ? (
        <CountryDetail country={countries[0]} />
      ) : (
        query && <p>No matches</p>
      )}
    </div>
  )
}

export default App
