import { useState } from 'react';
import AuthModal from '../AuthModal';
import { Button } from '@/components/ui/button';

export default function AuthModalExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleAuthSuccess = (user: { id: string; name: string; email: string; role: string }) => {
    setCurrentUser(user);
    console.log('Authentication successful:', user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    console.log('User signed out');
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      {currentUser ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold">Welcome back!</h3>
            <p className="text-sm text-muted-foreground">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <p className="text-xs text-muted-foreground capitalize">Role: {currentUser.role}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Click below to test the authentication modal</p>
          <Button onClick={() => setIsModalOpen(true)} data-testid="button-open-auth">
            Sign In / Sign Up
          </Button>
        </div>
      )}

      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}