import { Link } from 'react-router-dom';
import Flap from '../components/Flap.jsx';

export default function NotFound() {
  return (
    <div className="container page empty">
      <Flap text="404" size="lg" label="Page not found" />
      <p>We could not find that page.</p>
      <Link to="/" className="btn">Back to home</Link>
    </div>
  );
}