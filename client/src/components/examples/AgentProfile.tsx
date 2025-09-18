import AgentProfile, { Agent } from '../AgentProfile';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function AgentProfileExample() {
  // Todo: Remove mock functionality - replace with real agent data
  const sampleAgent: Agent = {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Senior Real Estate Agent',
    photo: agentPhoto,
    phone: '(555) 123-4567',
    email: 'sarah.johnson@propertyhub.com',
    bio: 'With over 10 years of experience in luxury real estate, Sarah specializes in helping clients find their dream homes in the greater metropolitan area. Known for her attention to detail and personalized service.',
    rating: 4.9,
    reviewCount: 127,
    yearsExperience: 10,
    propertiesSold: 245,
    specialties: ['Luxury Homes', 'First-Time Buyers', 'Investment Properties'],
    certifications: ['Certified Residential Specialist (CRS)', 'Graduate REALTOR Institute (GRI)'],
  };

  const handleContact = (agentId: string, method: 'phone' | 'email' | 'message') => {
    console.log(`Contact agent ${agentId} via ${method}`);
  };

  const handleViewListings = (agentId: string) => {
    console.log(`View listings for agent ${agentId}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Full Agent Profile</h3>
        <div className="flex justify-center">
          <AgentProfile
            agent={sampleAgent}
            onContact={handleContact}
            onViewListings={handleViewListings}
            compact={false}
          />
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Compact Agent Card</h3>
        <div className="max-w-md">
          <AgentProfile
            agent={sampleAgent}
            onContact={handleContact}
            onViewListings={handleViewListings}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
}