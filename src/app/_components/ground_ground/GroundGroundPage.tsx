// components/GroundGroundPage.tsx
'use client'

import React, { useState } from 'react';
import DAButton from './DAButton';
import SquareSelectorButton from '../base_button/SquareSelectorButton';

import FrequencyConfig from 'example-config.json';

const GroundGroundPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1); // State to track current page

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderButtons = () => {
    const buttons: React.JSX.Element[] = [];
  
    // Select the correct array from GGLines based on currentPage
    const currentLines = FrequencyConfig.GGLines[currentPage - 1];
  
    // Map over the currentLines array to get the buttons
    if(currentLines)
    currentLines.map((line, index) => {
      buttons.push(
        <DAButton
          key={index}
          topLine={line.name_top}
          bottomLine={line.name_bottom}
          onClick={() => console.log(`Ground Ground Button ${line.name_top} clicked`)}
          latching={false}
          dialLine={line.dial_line}
        />
      );
    });
  
    return buttons;
  };

  return (
    <div className="p-4">
      {/* // extras left out flex flex-col items-center justify-center */}
      {/* Render 3 pages of buttons */}
      <div className="grid grid-cols-3 mb-2.5 gap-2.5">
        {renderButtons()}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-2.5">
        {[1, 2, 3].map((page) => (
          <SquareSelectorButton
            key={page}
            topLine={`G/G ${page}`}
            onClick={() => handlePageChange(page)}
          />
        ))}
      </div>

      {/* Selected page */}
      <div className="text-white text-center items-center justify-center font-bold text-lg">
        G/G PAGE {currentPage}
      </div>
    </div>
  );
};

export default GroundGroundPage;