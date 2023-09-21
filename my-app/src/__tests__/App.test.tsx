import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', ()=>{
  describe('displays basic structure', () =>{
    test('renders learn react link', () => {
      const wrapper = render(<App />);
      const title = wrapper.getAllByLabelText('title');
      expect(title).toBeInTheDocument();
    });
  })
});
