import HeroSection from '../HeroSection';

export default function HeroSectionExample() {
  const handleSearch = (query: string, location: string) => {
    console.log('Hero search triggered:', { query, location });
  };

  return <HeroSection onSearch={handleSearch} />;
}