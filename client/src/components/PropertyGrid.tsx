import { useState } from 'react';
import PropertyCard, { Property } from './PropertyCard';
import PropertySearch, { SearchFilters } from './PropertySearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Filter, Grid3X3, List } from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  onFavoriteToggle?: (propertyId: string) => void;
  onContactAgent?: (propertyId: string) => void;
  showSearch?: boolean;
  title?: string;
}

export default function PropertyGrid({
  properties,
  onPropertySelect,
  onFavoriteToggle,
  onContactAgent,
  showSearch = true,
  title = 'Browse Properties'
}: PropertyGridProps) {
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearch = (filters: SearchFilters) => {
    // Todo: Remove mock functionality - integrate with real search API
    console.log('Search filters applied:', filters);
    
    let filtered = [...properties];
    
    // Apply basic filtering (mock implementation)
    if (filters.query) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        p.address.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(p => 
        p.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.status !== 'any') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.bedrooms !== 'any') {
      const minBedrooms = parseInt(filters.bedrooms);
      filtered = filtered.filter(p => p.bedrooms >= minBedrooms);
    }
    
    if (filters.bathrooms !== 'any') {
      const minBathrooms = parseFloat(filters.bathrooms);
      filtered = filtered.filter(p => p.bathrooms >= minBathrooms);
    }
    
    // Price range filtering
    filtered = filtered.filter(p => 
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );
    
    setFilteredProperties(filtered);
  };

  const handleClearFilters = () => {
    setFilteredProperties(properties);
  };

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption);
    const sorted = [...filteredProperties];
    
    switch (sortOption) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'bedrooms':
        sorted.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'sqft':
        sorted.sort((a, b) => b.squareFootage - a.squareFootage);
        break;
      case 'newest':
      default:
        // Keep original order for newest
        break;
    }
    
    setFilteredProperties(sorted);
    console.log('Properties sorted by:', sortOption);
  };

  const handlePropertyClick = (property: Property) => {
    onPropertySelect?.(property);
    console.log('Property selected:', property.id);
  };

  const handleFavorite = (propertyId: string) => {
    onFavoriteToggle?.(propertyId);
    console.log('Favorite toggled:', propertyId);
  };

  const handleContact = (propertyId: string) => {
    onContactAgent?.(propertyId);
    console.log('Contact agent for property:', propertyId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" data-testid="text-properties-title">{title}</h2>
          <p className="text-muted-foreground" data-testid="text-properties-count">
            {filteredProperties.length} properties found
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-background"
            data-testid="select-sort"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="bedrooms">Most Bedrooms</option>
            <option value="sqft">Largest Size</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              data-testid="button-grid-view"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              data-testid="button-list-view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Toggle (Mobile) */}
          {showSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="md:hidden"
              data-testid="button-toggle-search"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filter
            </Button>
          )}
        </div>
      </div>

      {/* Search Component */}
      {showSearch && (
        <div className={`${isSearchExpanded ? 'block' : 'hidden'} md:block`}>
          <PropertySearch
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
          />
        </div>
      )}

      {/* Results */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No properties found matching your criteria</div>
          <Button variant="outline" onClick={handleClearFilters} data-testid="button-clear-all-filters">
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
          data-testid="container-properties"
        >
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onFavoriteToggle={handleFavorite}
              onViewDetails={() => handlePropertyClick(property)}
              onContactAgent={handleContact}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredProperties.length > 0 && (
        <div className="text-center pt-8">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            Load More Properties
          </Button>
        </div>
      )}
    </div>
  );
}