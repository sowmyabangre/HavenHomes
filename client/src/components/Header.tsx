import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Heart, Menu, X } from 'lucide-react';
import { Link } from 'wouter';

interface HeaderProps {
  isAuthenticated?: boolean;
  userRole?: 'buyer' | 'seller' | 'agent' | 'admin';
  onAuthClick?: () => void;
}

export default function Header({ isAuthenticated = false, userRole = 'buyer', onAuthClick }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search triggered:', searchValue);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PH</span>
              </div>
              <span className="font-bold text-xl text-foreground">PropertyHub</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search by location, property type..."
                className="pl-10 pr-4"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                data-testid="input-search"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/properties" data-testid="link-properties">
              <Button variant="ghost" className="hover-elevate">
                Browse
              </Button>
            </Link>
            
            {isAuthenticated && userRole === 'agent' && (
              <Link href="/add-property" data-testid="link-add-property">
                <Button variant="ghost" className="hover-elevate">
                  Add Listing
                </Button>
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-favorites">
                  <Heart className="h-4 w-4" />
                </Button>
                
                <Badge variant="secondary" className="capitalize">
                  {userRole}
                </Badge>
                
                <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-profile">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={onAuthClick} data-testid="button-login">
                  Sign In
                </Button>
                <Button onClick={onAuthClick} data-testid="button-signup">
                  Get Started
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover-elevate"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search properties..."
              className="pl-10 pr-4"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              data-testid="input-search-mobile"
            />
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t pb-4">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link href="/properties" data-testid="link-properties-mobile">
                <Button variant="ghost" className="w-full justify-start hover-elevate">
                  Browse Properties
                </Button>
              </Link>
              
              {isAuthenticated && userRole === 'agent' && (
                <Link href="/add-property" data-testid="link-add-property-mobile">
                  <Button variant="ghost" className="w-full justify-start hover-elevate">
                    Add Listing
                  </Button>
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" className="w-full justify-start hover-elevate" data-testid="button-favorites-mobile">
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                  <Button variant="ghost" className="w-full justify-start hover-elevate" data-testid="button-profile-mobile">
                    <User className="h-4 w-4 mr-2" />
                    Profile ({userRole})
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button variant="ghost" onClick={onAuthClick} className="w-full justify-start hover-elevate" data-testid="button-login-mobile">
                    Sign In
                  </Button>
                  <Button onClick={onAuthClick} className="w-full" data-testid="button-signup-mobile">
                    Get Started
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}