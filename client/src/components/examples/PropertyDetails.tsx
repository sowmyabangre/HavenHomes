import PropertyDetails from '../PropertyDetails';
import familyHomeImage from '@assets/generated_images/modern_family_home_exterior_2bd95c80.png';
import condoImage from '@assets/generated_images/luxury_downtown_condo_building_a8a137b2.png';
import heroImage from '@assets/generated_images/luxury_residential_building_hero_7ddcd010.png';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function PropertyDetailsExample() {
  // Todo: Remove mock functionality - replace with real property data
  const sampleProperty = {
    id: '1',
    title: 'Modern Family Home',
    address: '123 Oak Street, Greenville, CA 94102',
    price: 850000,
    bedrooms: 4,
    bathrooms: 3,
    squareFootage: 2400,
    imageUrl: familyHomeImage,
    status: 'for-sale' as const,
    isFavorited: false,
    agentName: 'Sarah Johnson',
    agentPhoto: agentPhoto,
    description: 'This stunning modern family home offers the perfect blend of contemporary design and comfortable living. Located in the desirable Greenville neighborhood, this property features an open-concept layout, high-end finishes, and a beautifully landscaped yard. The gourmet kitchen boasts stainless steel appliances and granite countertops, while the master suite includes a walk-in closet and spa-like bathroom.',
    features: [
      'Hardwood floors throughout',
      'Granite countertops',
      'Stainless steel appliances',
      'Walk-in closets',
      'Central air conditioning',
      'Fireplace in living room',
      'Two-car garage',
      'Fenced backyard',
      'Modern lighting fixtures',
      'Energy-efficient windows'
    ],
    yearBuilt: 2018,
    lotSize: '0.25 acres',
    parkingSpaces: 2,
    images: [familyHomeImage, condoImage, heroImage, familyHomeImage],
    agent: {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Real Estate Agent',
      photo: agentPhoto,
      phone: '(555) 123-4567',
      email: 'sarah.johnson@propertyhub.com',
      bio: 'With over 10 years of experience in luxury real estate, Sarah specializes in helping clients find their dream homes in the greater metropolitan area.',
      rating: 4.9,
      reviewCount: 127,
      yearsExperience: 10,
      propertiesSold: 245,
      specialties: ['Luxury Homes', 'First-Time Buyers', 'Investment Properties'],
      certifications: ['Certified Residential Specialist (CRS)', 'Graduate REALTOR Institute (GRI)'],
    },
    neighborhood: {
      walkScore: 75,
      schools: [
        { name: 'Greenville Elementary', rating: 8, distance: '0.3 miles' },
        { name: 'Oak Middle School', rating: 9, distance: '0.8 miles' },
        { name: 'Valley High School', rating: 7, distance: '1.2 miles' },
      ],
      amenities: [
        'Whole Foods Market',
        'Starbucks Coffee',
        'Oak Park',
        'Public Library',
        'Fitness Center',
        'Medical Center',
        'Shopping Plaza',
        'Restaurants & Cafes'
      ],
    },
  };

  const handleBack = () => {
    console.log('Back to search triggered');
  };

  const handleContactAgent = (propertyId: string) => {
    console.log('Contact agent for property:', propertyId);
  };

  const handleScheduleViewing = (propertyId: string) => {
    console.log('Schedule viewing for property:', propertyId);
  };

  return (
    <PropertyDetails
      property={sampleProperty}
      onBack={handleBack}
      onContactAgent={handleContactAgent}
      onScheduleViewing={handleScheduleViewing}
    />
  );
}