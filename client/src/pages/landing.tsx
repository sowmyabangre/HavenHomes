// Landing page for logged-out users based on blueprint:javascript_log_in_with_replit
import { useSEO } from '@/hooks/useSEO';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import PropertyGrid from '../components/PropertyGrid';
import { Property } from '../components/PropertyCard';

// Import images
import familyHomeImage from '@assets/generated_images/modern_family_home_exterior_2bd95c80.png';
import condoImage from '@assets/generated_images/luxury_downtown_condo_building_a8a137b2.png';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function Landing() {
  // SEO metadata for landing page
  useSEO({
    title: 'PropertyHub - Buy, Sell, Rent Properties',
    description: 'Discover your dream home with PropertyHub. Browse luxury properties, connect with top agents, and start your search today.',
    ogTitle: 'PropertyHub - Real Estate Marketplace',
    ogDescription: 'Find luxury homes, condos, and apartments. Connect with professional real estate agents.',
    canonical: typeof window !== 'undefined' ? window.location.origin + '/' : undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.origin + '/' : undefined
  });

  // Todo: Remove mock functionality - replace with real property data
  const featuredProperties: Property[] = [
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
  ];

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleHeroSearch = (query: string, location: string) => {
    console.log('Hero search (guest):', { query, location });
    // Todo: Navigate to search results or prompt to log in
  };

  const handlePropertySelect = (property: Property) => {
    console.log('Property selected (guest):', property.id);
    // Todo: Show limited property info or prompt to log in
  };

  const handleFavoriteToggle = (propertyId: string) => {
    console.log('Favorite clicked (guest) - redirect to login:', propertyId);
    handleLogin();
  };

  const handleContactAgent = (propertyId: string) => {
    console.log('Contact agent clicked (guest) - redirect to login:', propertyId);
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={false} 
        userRole={undefined} 
        onAuthClick={handleLogin} 
      />
      
      <main>
        <HeroSection onSearch={handleHeroSearch} />
        
        <section className="container mx-auto px-4 py-16">
          <PropertyGrid
            properties={featuredProperties}
            onPropertySelect={handlePropertySelect}
            onFavoriteToggle={handleFavoriteToggle}
            onContactAgent={handleContactAgent}
            showSearch={false}
            title="Featured Properties"
          />
        </section>
      </main>
    </div>
  );
}