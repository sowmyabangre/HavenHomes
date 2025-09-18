import Header from '../Header';

export default function HeaderExample() {
  const handleAuthClick = () => {
    console.log('Auth action triggered');
  };

  return (
    <div className="space-y-8">
      {/* Authenticated Agent Header */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Authenticated Agent</h3>
        <Header 
          isAuthenticated={true} 
          userRole="agent" 
          onAuthClick={handleAuthClick} 
        />
      </div>
      
      {/* Guest Header */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Guest User</h3>
        <Header 
          isAuthenticated={false} 
          onAuthClick={handleAuthClick} 
        />
      </div>
    </div>
  );
}