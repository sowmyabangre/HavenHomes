import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Property } from './PropertyCard';
import ContactForm from './ContactForm';
import AgentProfile from './AgentProfile';
import { 
  Heart, 
  Share, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Calendar,
  Ruler,
  Home,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

interface PropertyDetailsProps {
  property: Property & {
    description: string;
    features: string[];
    yearBuilt: number;
    lotSize: string;
    parkingSpaces: number;
    images: string[];
    agent: {
      id: string;
      name: string;
      title: string;
      photo?: string;
      phone: string;
      email: string;
      bio: string;
      rating: number;
      reviewCount: number;
      yearsExperience: number;
      propertiesSold: number;
      specialties: string[];
      certifications: string[];
    };
    neighborhood: {
      walkScore: number;
      schools: Array<{ name: string; rating: number; distance: string }>;
      amenities: string[];
    };
  };
  onBack?: () => void;
  onContactAgent?: (propertyId: string) => void;
  onScheduleViewing?: (propertyId: string) => void;
}

export default function PropertyDetails({
  property,
  onBack,
  onContactAgent,
  onScheduleViewing
}: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(property.isFavorited || false);
  const [activeTab, setActiveTab] = useState('overview');

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    console.log('Favorite toggled for property:', property.id);
  };

  const handleShare = () => {
    console.log('Share property:', property.id);
  };

  const handleScheduleViewing = () => {
    onScheduleViewing?.(property.id);
    console.log('Schedule viewing for property:', property.id);
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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Back Button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4" data-testid="button-back">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Search
        </Button>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge className={getStatusColor(property.status)} data-testid="badge-property-status">
              {getStatusText(property.status)}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleFavoriteToggle}
                className={isFavorited ? 'text-red-500' : ''}
                data-testid="button-favorite-property"
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} data-testid="button-share-property">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-property-title">
            {property.title}
          </h1>
          
          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span data-testid="text-property-address">{property.address}</span>
          </div>
          
          <div className="text-3xl font-bold text-primary" data-testid="text-property-price">
            {formatPrice(property.price)}
            {property.status === 'for-rent' && (
              <span className="text-lg text-muted-foreground font-normal">/month</span>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleScheduleViewing} data-testid="button-schedule-viewing">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Viewing
          </Button>
          <Button onClick={() => onContactAgent?.(property.id)} data-testid="button-contact-agent">
            Contact Agent
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <Card>
        <CardContent className="p-0">
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {property.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                  onClick={handlePreviousImage}
                  data-testid="button-prev-image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                  onClick={handleNextImage}
                  data-testid="button-next-image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.images.length}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnail Strip */}
          {property.images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Features */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Bed className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-semibold" data-testid="text-detail-bedrooms">{property.bedrooms}</div>
                  <div className="text-sm text-muted-foreground">Bedrooms</div>
                </div>
                <div className="text-center">
                  <Bath className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-semibold" data-testid="text-detail-bathrooms">{property.bathrooms}</div>
                  <div className="text-sm text-muted-foreground">Bathrooms</div>
                </div>
                <div className="text-center">
                  <Square className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-semibold" data-testid="text-detail-sqft">{property.squareFootage.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Sq Ft</div>
                </div>
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-semibold" data-testid="text-detail-parking">{property.parkingSpaces}</div>
                  <div className="text-sm text-muted-foreground">Parking</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Info Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
              <TabsTrigger value="neighborhood" data-testid="tab-neighborhood">Neighborhood</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-property-description">
                    {property.description}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year Built:</span>
                      <span data-testid="text-year-built">{property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lot Size:</span>
                      <span data-testid="text-lot-size">{property.lotSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Property Type:</span>
                      <span className="capitalize">House</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Parking:</span>
                      <span>{property.parkingSpaces} spaces</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm" data-testid={`text-feature-${index}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="neighborhood" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Neighborhood Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Walk Score</span>
                      <Badge variant="secondary">{property.neighborhood.walkScore}/100</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {property.neighborhood.walkScore >= 90 ? 'Walker\'s Paradise' :
                       property.neighborhood.walkScore >= 70 ? 'Very Walkable' :
                       property.neighborhood.walkScore >= 50 ? 'Somewhat Walkable' : 'Car-Dependent'}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Nearby Schools</h4>
                    <div className="space-y-2">
                      {property.neighborhood.schools.map((school, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{school.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{school.rating}/10</Badge>
                            <span className="text-muted-foreground">{school.distance}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Nearby Amenities</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {property.neighborhood.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-2 w-2 bg-chart-2 rounded-full" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Agent Contact */}
          <ContactForm
            propertyId={property.id}
            propertyTitle={property.title}
            agentName={property.agent.name}
            agentPhoto={property.agent.photo}
            agentPhone={property.agent.phone}
            agentEmail={property.agent.email}
            onSubmit={(formData) => console.log('Contact form submitted:', formData)}
          />

          {/* Agent Profile */}
          <AgentProfile
            agent={property.agent}
            compact={true}
            onContact={(agentId, method) => console.log(`Contact agent ${agentId} via ${method}`)}
            onViewListings={(agentId) => console.log(`View listings for agent ${agentId}`)}
          />
        </div>
      </div>
    </div>
  );
}