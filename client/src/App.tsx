import { useState } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Import components
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import PropertyGrid from './components/PropertyGrid';
import PropertyDetails from './components/PropertyDetails';
import AuthModal from './components/AuthModal';
import { Property } from './components/PropertyCard';

// Import images
import familyHomeImage from '@assets/generated_images/modern_family_home_exterior_2bd95c80.png';
import condoImage from '@assets/generated_images/luxury_downtown_condo_building_a8a137b2.png';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

function HomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  
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

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    console.log('User authenticated:', user);
  };

  const handleHeroSearch = (query: string, location: string) => {
    console.log('Hero search:', { query, location });
    // Todo: Navigate to search results
  };

  const handlePropertySelect = (property: Property) => {
    // Create extended property data for details view
    const extendedProperty = {
      ...property,
      description: `This stunning ${property.title.toLowerCase()} offers the perfect blend of contemporary design and comfortable living. Located in a desirable neighborhood, this property features an open-concept layout, high-end finishes, and beautiful surroundings.`,
      features: [
        'Hardwood floors throughout',
        'Granite countertops', 
        'Stainless steel appliances',
        'Walk-in closets',
        'Central air conditioning',
        'Modern lighting fixtures',
        'Energy-efficient windows'
      ],
      yearBuilt: 2018,
      lotSize: '0.25 acres',
      parkingSpaces: 2,
      images: [property.imageUrl, condoImage, familyHomeImage],
      agent: {
        id: '1',
        name: 'Sarah Johnson',
        title: 'Senior Real Estate Agent',
        photo: agentPhoto,
        phone: '(555) 123-4567',
        email: 'sarah.johnson@propertyhub.com',
        bio: 'With over 10 years of experience in luxury real estate, Sarah specializes in helping clients find their dream homes.',
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
        ],
        amenities: [
          'Whole Foods Market',
          'Starbucks Coffee',
          'Oak Park',
          'Public Library',
          'Fitness Center',
          'Medical Center'
        ],
      },
    };
    setSelectedProperty(extendedProperty);
  };

  const handleFavoriteToggle = (propertyId: string) => {
    console.log('Favorite toggled:', propertyId);
  };

  const handleContactAgent = (propertyId: string) => {
    console.log('Contact agent for property:', propertyId);
  };

  // Show property details if selected
  if (selectedProperty) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          isAuthenticated={!!currentUser} 
          userRole={currentUser?.role} 
          onAuthClick={handleAuthClick} 
        />
        <PropertyDetails
          property={selectedProperty}
          onBack={() => setSelectedProperty(null)}
          onContactAgent={handleContactAgent}
          onScheduleViewing={(propertyId) => console.log('Schedule viewing:', propertyId)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isAuthenticated={!!currentUser} 
        userRole={currentUser?.role} 
        onAuthClick={handleAuthClick} 
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
      
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
