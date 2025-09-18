import PropertySearch, { SearchFilters } from '../PropertySearch';

export default function PropertySearchExample() {
  const handleSearch = (filters: SearchFilters) => {
    console.log('Search executed with filters:', filters);
  };

  const handleClearFilters = () => {
    console.log('Filters cleared');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <PropertySearch 
        onSearch={handleSearch} 
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}