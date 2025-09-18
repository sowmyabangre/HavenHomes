import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Home } from 'lucide-react';
import { SiGoogle, SiApple, SiGithub } from 'react-icons/si';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: (user: { id: string; name: string; email: string; role: string }) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: '',
  });
  
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Todo: Remove mock functionality - integrate with real authentication
    console.log('Sign in attempt:', signInForm);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: signInForm.email,
        role: 'buyer',
      };
      
      onAuthSuccess?.(mockUser);
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Todo: Remove mock functionality - integrate with real authentication
    console.log('Sign up attempt:', signUpForm);
    
    // Simulate API call
    setTimeout(() => {
      const mockUser = {
        id: '2',
        name: signUpForm.name,
        email: signUpForm.email,
        role: signUpForm.role,
      };
      
      onAuthSuccess?.(mockUser);
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`${provider} authentication triggered`);
    // Todo: Remove mock functionality - integrate with real OAuth
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
              <Home className="h-3 w-3 text-primary-foreground" />
            </div>
            Welcome to PropertyHub
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" data-testid="tab-signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  data-testid="input-signin-email"
                />
              </div>

              <div>
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={signInForm.password}
                    onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    data-testid="input-signin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signin">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  data-testid="input-signup-name"
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                  data-testid="input-signup-email"
                />
              </div>

              <div>
                <Label htmlFor="role">I am a</Label>
                <Select value={signUpForm.role} onValueChange={(value) => setSignUpForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="buyer">Home Buyer</SelectItem>
                    <SelectItem value="seller">Home Seller</SelectItem>
                    <SelectItem value="agent">Real Estate Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                  data-testid="input-signup-password"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  data-testid="input-confirm-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-signup">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('Google')}
              data-testid="button-google-auth"
            >
              <SiGoogle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('Apple')}
              data-testid="button-apple-auth"
            >
              <SiApple className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialAuth('GitHub')}
              data-testid="button-github-auth"
            >
              <SiGithub className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </DialogContent>
    </Dialog>
  );
}