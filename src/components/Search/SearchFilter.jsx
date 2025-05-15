// components/Search/SearchFilter.jsx
import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './SearchFilter.scss';

const SearchFilter = ({ filters, onFilterChange }) => {
  const [searchText, setSearchText] = useState(filters.search || '');
  
  const handleSearch = () => {
    onFilterChange({ search: searchText });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-filter">
      <div className="search-row">
        <Input
          placeholder="Tìm kiếm theo tên công việc..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={handleKeyPress}
          prefix={<SearchOutlined />}
          className="search-input"
          allowClear
        />
        <Button 
          type="primary" 
          onClick={handleSearch}
          icon={<SearchOutlined />}
        >
          Tìm kiếm
        </Button>
      </div>
    </div>
  );
};

export default SearchFilter;