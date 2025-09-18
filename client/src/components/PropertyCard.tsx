import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, MapPin, Bed, Bath, Square, Eye } from 'lucide-react';

export interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  imageUrl: string;
  status: 'for-sale' | 'for-rent' | 'sold' | 'pending';
  isFavorited?: boolean;
  agentName: string;
  agentPhoto?: string;
}

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string) => void;
  onViewDetails?: (propertyId: string) => void;
  onContactAgent?: (propertyId: string) => void;
}

export default function PropertyCard({ 
  property, 
  onFavoriteToggle, 
  onViewDetails, 
  onContactAgent 
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavoriteToggle?.(property.id);
    console.log('Favorite toggled for property:', property.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(property.id);
    console.log('View details for property:', property.id);
  };

  const handleContactAgent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContactAgent?.(property.id);
    console.log('Contact agent for property:', property.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'for-sale':
        return 'bg-primary text-primary-foreground';
      case 'for-rent':
        return 'bg-chart-2 text-white';
      case 'sold':
        return 'bg-muted text-muted-foreground';
      case 'pending':
        return 'bg-chart-4 text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusText = (status: Property['status']) => {
    switch (status) {
      case 'for-sale':
        return 'For Sale';
      case 'for-rent':
        return 'For Rent';
      case 'sold':
        return 'Sold';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <Card className="group cursor-pointer overflow-hidden hover-elevate transition-all duration-300" onClick={handleViewDetails} data-testid={`card-property-${property.id}`}>
      <div className="relative">
        {/* Property Image */}
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Overlays */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <Badge className={getStatusColor(property.status)} data-testid={`badge-status-${property.id}`}>
            {getStatusText(property.status)}
          </Badge>
          
          <Button
            variant="secondary"
            size="icon"
            className={`backdrop-blur-sm ${isFavorited ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 bg-white/80 hover:bg-white/90`}
            onClick={handleFavoriteClick}
            data-testid={`button-favorite-${property.id}`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Price Overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-sm rounded-md px-3 py-1">
            <span className="font-bold text-lg text-foreground" data-testid={`text-price-${property.id}`}>
              {formatPrice(property.price)}
            </span>
            {property.status === 'for-rent' && (
              <span className="text-muted-foreground text-sm">/month</span>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Property Title & Address */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1" data-testid={`text-title-${property.id}`}>
            {property.title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="line-clamp-1" data-testid={`text-address-${property.id}`}>
              {property.address}
            </span>
          </div>
        </div>

        {/* Property Features */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1" data-testid={`text-bedrooms-${property.id}`}>
            <Bed className="h-3 w-3" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-1" data-testid={`text-bathrooms-${property.id}`}>
            <Bath className="h-3 w-3" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-1" data-testid={`text-sqft-${property.id}`}>
            <Square className="h-3 w-3" />
            <span>{property.squareFootage.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Agent Info & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {property.agentPhoto && (
              <img
                src={property.agentPhoto}
                alt={property.agentName}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-muted-foreground" data-testid={`text-agent-${property.id}`}>
              {property.agentName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              data-testid={`button-view-${property.id}`}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              onClick={handleContactAgent}
              data-testid={`button-contact-${property.id}`}
            >
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}