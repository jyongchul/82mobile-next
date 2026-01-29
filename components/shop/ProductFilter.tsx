'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FilterOptions {
  duration: string[];
  dataAmount: string[];
  type: string[];
  sortBy: 'price-asc' | 'price-desc' | 'newest';
}

interface ProductFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  productsCount?: number;
  totalCount?: number;
}

export default function ProductFilter({ onFilterChange, productsCount, totalCount }: ProductFilterProps) {
  const t = useTranslations();
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [selectedDataAmounts, setSelectedDataAmounts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('newest');
  const [isOpen, setIsOpen] = useState(false);

  const durations = ['3 Days', '5 Days', '10 Days', '20 Days', '30 Days'];
  const dataAmounts = ['3GB', '5GB', '10GB', '20GB', 'Unlimited'];
  const types = ['eSIM', 'Physical'];

  const handleDurationToggle = (duration: string) => {
    const newDurations = selectedDurations.includes(duration)
      ? selectedDurations.filter((d) => d !== duration)
      : [...selectedDurations, duration];

    setSelectedDurations(newDurations);
    onFilterChange({
      duration: newDurations,
      dataAmount: selectedDataAmounts,
      type: selectedTypes,
      sortBy
    });
  };

  const handleDataAmountToggle = (amount: string) => {
    const newAmounts = selectedDataAmounts.includes(amount)
      ? selectedDataAmounts.filter((a) => a !== amount)
      : [...selectedDataAmounts, amount];

    setSelectedDataAmounts(newAmounts);
    onFilterChange({
      duration: selectedDurations,
      dataAmount: newAmounts,
      type: selectedTypes,
      sortBy
    });
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(newTypes);
    onFilterChange({
      duration: selectedDurations,
      dataAmount: selectedDataAmounts,
      type: newTypes,
      sortBy
    });
  };

  const handleSortChange = (newSort: FilterOptions['sortBy']) => {
    setSortBy(newSort);
    onFilterChange({
      duration: selectedDurations,
      dataAmount: selectedDataAmounts,
      type: selectedTypes,
      sortBy: newSort
    });
  };

  const clearFilters = () => {
    setSelectedDurations([]);
    setSelectedDataAmounts([]);
    setSelectedTypes([]);
    setSortBy('newest');
    onFilterChange({
      duration: [],
      dataAmount: [],
      type: [],
      sortBy: 'newest'
    });
  };

  const activeFiltersCount = selectedDurations.length + selectedDataAmounts.length + selectedTypes.length;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      {/* Mobile Toggle Button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg font-medium"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('products.filters.filters')}
            {activeFiltersCount > 0 && (
              <span className="bg-dancheong-red text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Type Filter */}
          <div>
            <h3 className="font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-jade-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {t('products.filters.type')}
            </h3>
            <div className="space-y-2">
              {types.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 text-jade-green border-gray-300 rounded focus:ring-jade-green"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-jade-green transition-colors">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div>
            <h3 className="font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-dancheong-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('products.filters.duration')}
            </h3>
            <div className="space-y-2">
              {durations.map((duration) => (
                <label
                  key={duration}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedDurations.includes(duration)}
                    onChange={() => handleDurationToggle(duration)}
                    className="w-4 h-4 text-dancheong-red border-gray-300 rounded focus:ring-dancheong-red"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-dancheong-red transition-colors">
                    {duration}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Data Amount Filter */}
          <div>
            <h3 className="font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-hanbok-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {t('products.filters.dataAmount')}
            </h3>
            <div className="space-y-2">
              {dataAmounts.map((amount) => (
                <label
                  key={amount}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedDataAmounts.includes(amount)}
                    onChange={() => handleDataAmountToggle(amount)}
                    className="w-4 h-4 text-hanbok-blue border-gray-300 rounded focus:ring-hanbok-blue"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-hanbok-blue transition-colors">
                    {amount}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="product-sort" className="font-heading font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-jade-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              {t('products.filters.sortBy')}
            </label>
            <select
              id="product-sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-green focus:border-jade-green text-sm"
            >
              <option value="newest">{t('products.filters.newestFirst')}</option>
              <option value="price-asc">{t('products.filters.priceAsc')}</option>
              <option value="price-desc">{t('products.filters.priceDesc')}</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                activeFiltersCount > 0
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {t('products.filters.clearAll')}
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {selectedTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-jade-50 text-jade-green rounded-full text-sm font-medium"
                >
                  {type}
                  <button
                    onClick={() => handleTypeToggle(type)}
                    className="hover:bg-jade-green hover:text-white rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {selectedDurations.map((duration) => (
                <span
                  key={duration}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-dancheong-red rounded-full text-sm font-medium"
                >
                  {duration}
                  <button
                    onClick={() => handleDurationToggle(duration)}
                    className="hover:bg-dancheong-red hover:text-white rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              {selectedDataAmounts.map((amount) => (
                <span
                  key={amount}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-50 text-hanbok-blue rounded-full text-sm font-medium"
                >
                  {amount}
                  <button
                    onClick={() => handleDataAmountToggle(amount)}
                    className="hover:bg-hanbok-blue hover:text-white rounded-full p-0.5 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
