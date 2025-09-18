import PropertyGrid from '../PropertyGrid';
import { Property } from '../PropertyCard';
import familyHomeImage from '@assets/generated_images/modern_family_home_exterior_2bd95c80.png';
import condoImage from '@assets/generated_images/luxury_downtown_condo_building_a8a137b2.png';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function PropertyGridExample() {
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
      agentName: 'Sarah Johnson',
    },
    {
      id: '4',
      title: 'Contemporary Townhouse',
      address: '321 Modern Way, Uptown, CA 94107',
      price: 750000,
      bedrooms: 3,
      bathrooms: 2.5,
      squareFootage: 1600,
      imageUrl: condoImage,
      status: 'for-sale',
      agentName: 'Sarah Johnson',
    },
    {
      id: '5',
      title: 'Luxury Penthouse',
      address: '555 Sky Tower, Financial District, CA 94111',
      price: 8500,
      bedrooms: 3,
      bathrooms: 3,
      squareFootage: 2000,
      imageUrl: condoImage,
      status: 'for-rent',
      agentName: 'Sarah Johnson',
    },
    {
      id: '6',
      title: 'Cozy Cottage',
      address: '987 Garden Lane, Suburbs, CA 94123',
      price: 650000,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 1000,
      imageUrl: familyHomeImage,
      status: 'sold',
      agentName: 'Sarah Johnson',
    },
  ];

  const handlePropertySelect = (property: Property) => {
    console.log('Property selected:', property);
  };

  const handleFavoriteToggle = (propertyId: string) => {
    console.log('Favorite toggled:', propertyId);
  };

  const handleContactAgent = (propertyId: string) => {
    console.log('Contact agent for property:', propertyId);
  };

  return (
    <div className="container mx-auto p-6">
      <PropertyGrid
        properties={sampleProperties}
        onPropertySelect={handlePropertySelect}
        onFavoriteToggle={handleFavoriteToggle}
        onContactAgent={handleContactAgent}
        title="Featured Properties"
      />
    </div>
  );
}