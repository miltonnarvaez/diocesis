import React from 'react';
import './AdminFilters.css';

const AdminFilters = ({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Buscar...",
  filters = [],
  onClearFilters,
  totalItems,
  filteredItems,
  showCount = true
}) => {
  const hasActiveFilters = searchQuery || filters.some(f => f.value !== f.defaultValue);

  return (
    <div className="admin-filters">
      <div className="filters-row">
        <div className="filter-group filter-search">
          <label htmlFor="admin-search">Buscar</label>
          <input
            type="text"
            id="admin-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        {filters.map((filter, index) => (
          <div key={index} className="filter-group">
            <label htmlFor={`filter-${filter.name}`}>{filter.label}</label>
            <select
              id={`filter-${filter.name}`}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="filter-select"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn btn-secondary btn-clear-filters"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      
      {showCount && (
        <div className="filters-info">
          <span>
            Mostrando {filteredItems} de {totalItems} registro(s)
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminFilters;

















