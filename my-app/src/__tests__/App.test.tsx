import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {LocalizationProvider} from "@mui/x-date-pickers";

describe('App', ()=>{
  describe('displays basic structure', () =>{
    test('renders components', () => {
      render(
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <App />
          </LocalizationProvider>
      );
      const header = screen.getByLabelText('Header');
      expect(header).toBeInTheDocument();
      const filters = screen.getByLabelText('Filters');
      expect(filters).toBeInTheDocument();
      const chart = screen.getByLabelText('Chart');
      expect(chart).toBeInTheDocument();
    });
  })
});
