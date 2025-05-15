import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import './SearchBar.scss';

const SearchBar = ({
  placeholder = 'Tìm kiếm...',
  onSearch,
  filters = [],
  className = '',
  autoFocus = false,
  debounceTime = 300
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.({ searchTerm, filter: selectedFilter });
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedFilter, onSearch, debounceTime]);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  };

  return (
    <div 
      ref={searchRef}
      className={`search-bar ${isExpanded ? 'expanded' : ''} ${className}`}
      onClick={() => setIsExpanded(true)}
    >
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="search-input"
          autoFocus={autoFocus}
        />
        {searchTerm && (
          <button className="clear-button" onClick={handleClear}>
            <FaTimes />
          </button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="search-filters">
          <button
            className={`filter-button ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tất cả
          </button>
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={`filter-button ${selectedFilter === filter.value ? 'active' : ''}`}
              onClick={() => handleFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 