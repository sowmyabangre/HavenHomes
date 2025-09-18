import PropertyCard, { Property } from '../PropertyCard';
import familyHomeImage from '@assets/generated_images/modern_family_home_exterior_2bd95c80.png';
import condoImage from '@assets/generated_images/luxury_downtown_condo_building_a8a137b2.png';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function PropertyCardExample() {
  // Todo: Remove mock functionality - replace with real property data
  const sampleProperties: Property[] = [
    {
      id: '1',
      title: 'Modern Family Home',
      address: '123 Oak Street, Greenville, CA 94102',
      price: 850000,
      bedrooms: 4,
      bathrooms: 3,
      squareFootage: 2400,
      imageUrl: familyHomeImage,
      status: 'for-sale',
      isFavorited: false,
      agentName: 'Sarah Johnson',
      agentPhoto: agentPhoto,
    },
    {
      id: '2',
      title: 'Luxury Downtown Condo',
      address: '456 Metropolitan Ave, Downtown, CA 94105',
      price: 4200,
      bedrooms: 2,
      bathrooms: 2,
      squareFootage: 1200,
      imageUrl: condoImage,
      status: 'for-rent',
      isFavorited: true,
      agentName: 'Sarah Johnson',
      agentPhoto: agentPhoto,
    },
    {
      id: '3',
      title: 'Charming Victorian',
      address: '789 Heritage Lane, Historic District, CA 94110',
      price: 1200000,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1800,
      imageUrl: familyHomeImage,
      status: 'pending',
      isFavorited: false,
      agentName: 'Sarah Johnson',
    },
  ];

  const handleFavoriteToggle = (propertyId: string) => {
    console.log('Favorite toggled for property:', propertyId);
  };

  const handleViewDetails = (propertyId: string) => {
    console.log('View details for property:', propertyId);
  };

  const handleContactAgent = (propertyId: string) => {
    console.log('Contact agent for property:', propertyId);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {sampleProperties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onFavoriteToggle={handleFavoriteToggle}
          onViewDetails={handleViewDetails}
          onContactAgent={handleContactAgent}
        />
      ))}
    </div>
  );
}