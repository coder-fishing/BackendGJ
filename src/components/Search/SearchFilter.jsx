// components/Search/SearchFilter.jsx
import React, { useState } from 'react';
import { AiOutlineSearch, AiOutlineEnvironment, AiOutlineDollar, AiOutlineClockCircle, AiOutlineTag, AiOutlineClear } from 'react-icons/ai';
import './SearchFilter.scss';

const SearchFilter = ({ filters, onFilterChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ search: searchInput });
  };

  // Để tự động apply filter khi chọn dropdown
  const handleSelectChange = (e) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      location: '',
      salary: '',
      jobType: '',
      status: ''
    });
  };

  return (
    <div className="search-filter-container">
      <form className="search-form" onSubmit={handleSearchSubmit}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Tìm theo tên công việc, công ty..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search jobs"
          />
          <button type="submit" className="search-button" aria-label="Search">
            <AiOutlineSearch />
          </button>
        </div>
      </form>
      
    </div>
  );
};

export default SearchFilter;