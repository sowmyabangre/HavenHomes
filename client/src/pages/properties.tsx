import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Filter, Bed, Bath, Square, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Property, User } from "@shared/schema";

interface PropertyFilters {
  status?: string;
  propertyType?: string;
  minPrice?: string;
  maxPrice?: string;
  minBedrooms?: string;
  maxBedrooms?: string;
  location?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default function Properties() {
  const [filters, setFilters] = useState<PropertyFilters>({
    status: 'for-sale',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Fetch properties with filters
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties', filters],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
      });
      return apiRequest(`/api/properties?${searchParams}`);
    }
  });

  // Fetch current user for favorites
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: () => apiRequest('/api/auth/user')
  });

  // Add/remove favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async ({ propertyId, action }: { propertyId: string; action: 'add' | 'remove' }) => {
      if (action === 'add') {
        return apiRequest('/api/favorites', 'POST', { propertyId });
      } else {
        return apiRequest(`/api/favorites/${propertyId}`, 'DELETE');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Favorites updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive",
      });
    }
  });

  const handleFilterChange = (key: keyof PropertyFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'for-sale',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'for-sale': return 'default';
      case 'for-rent': return 'secondary';
      case 'sold': return 'destructive';
      case 'pending': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Properties</h1>
        <p className="text-muted-foreground">
          Find your perfect home from our extensive collection of properties
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by location..."
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="pl-10"
                data-testid="input-search-location"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t">
              <Select value={filters.propertyType || ''} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger data-testid="select-property-type">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Price"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                data-testid="input-min-price"
              />

              <Input
                placeholder="Max Price"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                data-testid="input-max-price"
              />

              <Select value={filters.minBedrooms || ''} onValueChange={(value) => handleFilterChange('minBedrooms', value)}>
                <SelectTrigger data-testid="select-min-bedrooms">
                  <SelectValue placeholder="Min Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={filters.sortBy || 'createdAt'} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger data-testid="select-sort-by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Newest</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="bedrooms">Bedrooms</SelectItem>
                    <SelectItem value="squareFootage">Size</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
                  Clear
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (properties as Property[]).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(properties as Property[]).map((property: Property) => (
            <Card key={property.id} className="overflow-hidden hover-elevate" data-testid={`card-property-${property.id}`}>
              {/* Property Image */}
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground">No Image</span>
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-background/90 text-foreground">
                    {formatPrice(property.price)}
                  </Badge>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={getStatusBadgeVariant(property.status)}>
                    {property.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>

                {/* Favorite Button */}
                {user && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute bottom-4 right-4 bg-background/90 hover:bg-background"
                    onClick={() => favoriteMutation.mutate({ 
                      propertyId: property.id, 
                      action: 'add' // Will be determined by current favorite status
                    })}
                    disabled={favoriteMutation.isPending}
                    data-testid={`button-favorite-${property.id}`}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1">{property.title}</h3>
                
                {/* Property Details */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span>{property.bedrooms} bed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    <span>{property.bathrooms} bath</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="h-4 w-4" />
                    <span>{property.squareFootage.toLocaleString()} sqft</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{property.address}</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full" data-testid={`button-view-${property.id}`}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {(properties as Property[]).length > 0 && (properties as Property[]).length % 12 === 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            Load More Properties
          </Button>
        </div>
      )}
    </div>
  );
}