import { useQuery, useMutation } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Bed, Bath, Square, MapPin, Trash2, ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Favorite, Property } from "@shared/schema";

interface FavoriteWithProperty extends Favorite {
  property: Property;
}

export default function Favorites() {
  const { toast } = useToast();

  // SEO metadata
  useSEO({
    title: 'My Favorites - Saved Properties | PropertyHub',
    description: 'View and manage your saved properties. Keep track of homes and properties you\'re interested in buying or renting.',
    ogTitle: 'My Favorite Properties - PropertyHub',
    ogDescription: 'View your saved properties and manage your real estate favorites.',
    canonical: typeof window !== 'undefined' ? window.location.origin + '/favorites' : undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.origin + '/favorites' : undefined
  });

  // Fetch user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['/api/favorites'],
    queryFn: () => apiRequest('/api/favorites')
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: (propertyId: string) => apiRequest(`/api/favorites/${propertyId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Success",
        description: "Property removed from favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  });

  const handleRemoveFavorite = (propertyId: string) => {
    if (window.confirm('Are you sure you want to remove this property from your favorites?')) {
      removeFavoriteMutation.mutate(propertyId);
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price);
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
        <h1 className="text-3xl font-bold text-foreground mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          Properties you've saved for later viewing
        </p>
      </div>

      {/* Favorites List */}
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
      ) : (favorites as FavoriteWithProperty[]).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring properties and save your favorites for easy access later.
            </p>
            <Button data-testid="button-browse-properties">
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-muted-foreground">
              {(favorites as FavoriteWithProperty[]).length} saved {(favorites as FavoriteWithProperty[]).length === 1 ? 'property' : 'properties'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(favorites as FavoriteWithProperty[]).map((favorite: FavoriteWithProperty) => {
              const property = favorite.property;
              
              return (
                <Card key={favorite.id} className="overflow-hidden hover-elevate" data-testid={`card-favorite-${property.id}`}>
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

                    {/* Favorite Heart (filled) */}
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-background/90 rounded-full p-2">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-4 left-4 bg-background/90 hover:bg-background"
                      onClick={() => handleRemoveFavorite(property.id)}
                      disabled={removeFavoriteMutation.isPending}
                      data-testid={`button-remove-${property.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{property.address}</span>
                    </div>

                    {/* Saved Date */}
                    <p className="text-xs text-muted-foreground">
                      Saved {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }).format(new Date(favorite.createdAt!))}
                    </p>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button className="flex-1" data-testid={`button-view-${property.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveFavorite(property.id)}
                      disabled={removeFavoriteMutation.isPending}
                      data-testid={`button-remove-footer-${property.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}