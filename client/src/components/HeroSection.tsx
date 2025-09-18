import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, TrendingUp } from 'lucide-react';
import heroImage from '@assets/generated_images/luxury_residential_building_hero_7ddcd010.png';

interface HeroSectionProps {
  onSearch?: (query: string, location: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Hero search triggered:', { searchQuery, location });
    onSearch?.(searchQuery, location);
  };

  // Todo: Remove mock functionality - replace with real stats
  const stats = [
    { label: 'Active Listings', value: '15,000+' },
    { label: 'Cities Covered', value: '200+' },
    { label: 'Happy Clients', value: '50K+' }
  ];

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury residential building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 bg-white/10 border-white/20 text-white backdrop-blur-sm">
            <TrendingUp className="h-3 w-3 mr-1" />
            Most Trusted Real Estate Platform
          </Badge>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Dream
            <br />
            <span className="text-white/90">Home Today</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Discover luxury properties, connect with top agents, and make your real estate dreams a reality with our modern marketplace.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg max-w-2xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Property type, neighborhood..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12"
                  data-testid="input-hero-search"
                />
              </div>
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="City, state, or ZIP code"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="h-12 pl-10"
                    data-testid="input-hero-location"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" className="h-12 px-8" data-testid="button-hero-search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-lg mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white" data-testid={`stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm" data-testid={`stat-label-${index}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}