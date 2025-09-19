// Home page for authenticated users
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useSEO } from '@/hooks/useSEO';
import type { User, Property as DbProperty } from '@shared/schema';
import { Property } from '../components/PropertyCard';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import PropertyGrid from '../components/PropertyGrid';
import PropertyDetails from '../components/PropertyDetails';

// Import images
import familyHomeImage from '@assets/generated_images/modern_family_home_exterior_2bd95c80.png';
import condoImage from '@assets/generated_images/luxury_downtown_condo_building_a8a137b2.png';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function Home() {
  const { user } = useAuth() as { user: User | undefined };
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // SEO metadata
  useSEO({
    title: 'PropertyHub - Find Your Perfect Home',
    description: 'Discover luxury properties, connect with top real estate agents, and find your dream home. Browse thousands of listings.',
    ogTitle: 'PropertyHub - Real Estate Marketplace',
    ogDescription: 'Find your perfect home with PropertyHub. Browse luxury properties and connect with professional agents.',
    canonical: typeof window !== 'undefined' ? window.location.origin + '/' : undefined,
    ogUrl: typeof window !== 'undefined' ? window.location.origin + '/' : undefined
  });
  
  // Fetch featured properties from the database
  const { data: dbProperties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => fetch('/api/properties?limit=8&sortBy=createdAt&sortOrder=desc').then(res => res.json())
  });

  // Transform database properties to match PropertyCard interface
  const featuredProperties: Property[] = dbProperties.slice(0, 4).map((property: DbProperty) => ({
    id: property.id,
    title: property.title,
    address: property.address,
    price: parseFloat(property.price),
    bedrooms: property.bedrooms,
    bathrooms: parseFloat(property.bathrooms.toString()),
    squareFootage: property.squareFootage,
    imageUrl: (property.images && property.images.length > 0) ? property.images[0] : '',
    status: property.status as 'for-sale' | 'for-rent' | 'sold' | 'pending',
    agentName: 'Agent', // TODO: Fetch agent name from agentId
    agentPhoto: undefined,
  }));

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleHeroSearch = (query: string, location: string) => {
    console.log('Hero search (authenticated):', { query, location });
    // Todo: Navigate to search results
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleFavoriteToggle = (propertyId: string) => {
    console.log('Favorite toggled (authenticated):', propertyId);
    // Todo: Implement real favorite functionality
  };

  const handleContactAgent = (propertyId: string) => {
    console.log('Contact agent for property (authenticated):', propertyId);
    // Todo: Implement real messaging functionality
  };

  // Show property details if selected
  if (selectedProperty) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          isAuthenticated={true} 
          userRole={user?.role} 
          onAuthClick={handleLogout} 
        />
        <PropertyDetails
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          onContactAgent={handleContactAgent}
          onScheduleViewing={(propertyId) => console.log('Schedule viewing:', propertyId)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={true} 
        userRole={user?.role} 
        onAuthClick={handleLogout} 
      />
      
      <main>
        <HeroSection onSearch={handleHeroSearch} />
        
        <section className="container mx-auto px-4 py-16">
          {isLoadingProperties ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading featured properties...</p>
            </div>
          ) : featuredProperties.length > 0 ? (
            <PropertyGrid
              properties={featuredProperties}
              onPropertySelect={handlePropertySelect}
              onFavoriteToggle={handleFavoriteToggle}
              onContactAgent={handleContactAgent}
              showSearch={false}
              title="Featured Properties"
            />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No Properties Yet</h3>
              <p className="text-muted-foreground mb-4">
                Properties will appear here once agents start adding listings.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}