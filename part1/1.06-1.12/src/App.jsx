import { useState } from 'react'

const StatisticLine = ({ text, value }) => (
  <tr>
    <td>{text}</td>
    <td>{value}</td>
  </tr>
)

const Statistics = ({ good, neutral, bad }) => {
  const total = good + neutral + bad

  if (total === 0) {
    return <div><p>No feedback given</p></div>
  }

  const average = (good - bad) / total
  const positive = (good / total) * 100

  return (
    <div>
      <h1>Statistics</h1>
      <table>
        <tbody>
          <StatisticLine text="Good" value={good} />
          <StatisticLine text="Neutral" value={neutral} />
          <StatisticLine text="Bad" value={bad} />
          <StatisticLine text="All" value={total} />
          <StatisticLine text="Average" value={average + ' %'} />
          <StatisticLine text="Positive" value={positive + ' %'} />
        </tbody>
      </table>
    </div>
  )
}

const Button = ({ handleClick, text }) => (
  <button onClick={handleClick}>
    {text}
  </button>
)

const App = () => {
  // guarda los clics de cada botón en su propio estado
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)


  const setGoodClick = () => {
    setGood(good + 1)
  }
  const setNeutralClick = () => {
    setNeutral(neutral + 1)
  }
  const setBadClick = () => {
    setBad(bad + 1)
  }

  return (
    <div>
      <h1>Give Feedback </h1>
      <Button handleClick={setGoodClick} text="Good" />
      <Button handleClick={setNeutralClick} text="Neutral" />
      <Button handleClick={setBadClick} text="Bad" />
      <Statistics good={good} neutral={neutral} bad={bad} />      
    </div>
  )
}

export default App