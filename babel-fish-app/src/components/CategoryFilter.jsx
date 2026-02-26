import React from 'react';
import { brandColors, STAFF_CATEGORY_ORDER, CUSTOMER_CATEGORY_ORDER } from '../utils/constants';

const CategoryFilter = ({ selectedCategory, onCategoryChange, mode }) => {
  const categories = mode === 'staff' ? STAFF_CATEGORY_ORDER : CUSTOMER_CATEGORY_ORDER;

  return (
    <div className="category-filter" style={{ marginBottom: '2rem' }}>
      <h3 style={{ 
        color: brandColors.darkGreyText, 
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        Filter by Category:
      </h3>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => onCategoryChange('All')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: selectedCategory === 'All' 
              ? brandColors.filterButtonActiveBlue 
              : brandColors.filterButtonInactiveBg,
            color: selectedCategory === 'All' 
              ? 'white' 
              : brandColors.filterButtonInactiveText,
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (selectedCategory !== 'All') {
              e.target.style.backgroundColor = brandColors.filterButtonHoverBg;
            }
          }}
          onMouseLeave={(e) => {
            if (selectedCategory !== 'All') {
              e.target.style.backgroundColor = brandColors.filterButtonInactiveBg;
            }
          }}
        >
          All Categories
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              border: 'none',
              backgroundColor: selectedCategory === category 
                ? brandColors.filterButtonActiveBlue 
                : brandColors.filterButtonInactiveBg,
              color: selectedCategory === category 
                ? 'white' 
                : brandColors.filterButtonInactiveText,
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== category) {
                e.target.style.backgroundColor = brandColors.filterButtonHoverBg;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== category) {
                e.target.style.backgroundColor = brandColors.filterButtonInactiveBg;
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter; 