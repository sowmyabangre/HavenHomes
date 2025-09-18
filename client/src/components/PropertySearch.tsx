import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, MapPin } from 'lucide-react';

export interface SearchFilters {
  query: string;
  location: string;
  propertyType: string;
  priceRange: [number, number];
  bedrooms: string;
  bathrooms: string;
  status: string;
}

interface PropertySearchProps {
  onSearch?: (filters: SearchFilters) => void;
  onClearFilters?: () => void;
  className?: string;
}

export default function PropertySearch({ onSearch, onClearFilters, className }: PropertySearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    propertyType: 'any',
    priceRange: [0, 2000000],
    bedrooms: 'any',
    bathrooms: 'any',
    status: 'any',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search triggered with filters:', filters);
    onSearch?.(filters);
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      location: '',
      propertyType: 'any',
      priceRange: [0, 2000000],
      bedrooms: 'any',
      bathrooms: 'any',
      status: 'any',
    };
    setFilters(clearedFilters);
    onClearFilters?.();
    console.log('Filters cleared');
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const hasActiveFilters = () => {
    return (
      filters.query !== '' ||
      filters.location !== '' ||
      filters.propertyType !== 'any' ||
      filters.priceRange[0] !== 0 ||
      filters.priceRange[1] !== 2000000 ||
      filters.bedrooms !== 'any' ||
      filters.bathrooms !== 'any' ||
      filters.status !== 'any'
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Properties
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Badge variant="secondary" className="text-xs">
                {Object.values(filters).filter(v => v !== 'any' && v !== '' && !(Array.isArray(v) && v[0] === 0 && v[1] === 2000000)).length} active
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? 'Hide' : 'Filters'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-query">Search</Label>
              <Input
                id="search-query"
                type="text"
                placeholder="Property type, neighborhood..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                data-testid="input-search-query"
              />
            </div>
            <div>
              <Label htmlFor="search-location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search-location"
                  type="text"
                  placeholder="City, state, or ZIP code"
                  className="pl-10"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  data-testid="input-search-location"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {isExpanded && (
            <div className="space-y-4 pt-4 border-t">
              {/* Property Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property-type">Property Type</Label>
                  <Select value={filters.propertyType} onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}>
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue placeholder="Any type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Any status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Status</SelectItem>
                      <SelectItem value="for-sale">For Sale</SelectItem>
                      <SelectItem value="for-rent">For Rent</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
                    <SelectTrigger data-testid="select-bedrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Select value={filters.bathrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bathrooms: value }))}>
                    <SelectTrigger data-testid="select-bathrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="1.5">1.5+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Label>Price Range</Label>
                <div className="px-2 py-4">
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={2000000}
                    min={0}
                    step={50000}
                    className="w-full"
                    data-testid="slider-price-range"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" data-testid="button-search">
              <Search className="h-4 w-4 mr-2" />
              Search Properties
            </Button>
            {hasActiveFilters() && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}