import Total from './Total';
import Content from './Content';
import Header from './Header';

const Course = ({ course }) => {
  const { name, parts } = course;
  return (
    <div>
      <Header courseName={name} />
      <Content parts={parts} />
      <Total parts={course.parts} />
    </div>
  );
}

export default Course