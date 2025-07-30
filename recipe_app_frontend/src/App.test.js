import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Recipe Explorer brand', () => {
  render(<App />);
  const brandElement = screen.getByText(/Recipe Explorer/i);
  expect(brandElement).toBeInTheDocument();
});
