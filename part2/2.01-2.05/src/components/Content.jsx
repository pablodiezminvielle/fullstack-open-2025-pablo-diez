const Content = ({ parts }) => (
    <ul>
    {parts.map(part => (
      <li key={part.id}>
        {part.name} {part.exercises}
      </li>
    ))}
  </ul>
  )
  
  export default Content