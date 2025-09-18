import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Phone, Mail, MessageCircle, Award, TrendingUp, Users } from 'lucide-react';

export interface Agent {
  id: string;
  name: string;
  title: string;
  photo?: string;
  phone: string;
  email: string;
  bio: string;
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  propertiesSold: number;
  specialties: string[];
  certifications: string[];
}

interface AgentProfileProps {
  agent: Agent;
  onContact?: (agentId: string, method: 'phone' | 'email' | 'message') => void;
  onViewListings?: (agentId: string) => void;
  compact?: boolean;
}

export default function AgentProfile({ agent, onContact, onViewListings, compact = false }: AgentProfileProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const handleContact = (method: 'phone' | 'email' | 'message') => {
    onContact?.(agent.id, method);
    console.log(`Contact agent ${agent.id} via ${method}`);
  };

  const handleViewListings = () => {
    onViewListings?.(agent.id);
    console.log(`View listings for agent ${agent.id}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (compact) {
    return (
      <Card className="hover-elevate cursor-pointer" onClick={() => setIsExpanded(true)} data-testid={`card-agent-${agent.id}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={agent.photo} alt={agent.name} />
              <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate" data-testid={`text-agent-name-${agent.id}`}>
                {agent.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{agent.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{agent.rating}</span>
                <span className="text-xs text-muted-foreground">({agent.reviewCount} reviews)</span>
              </div>
            </div>

            <Button size="sm" data-testid={`button-contact-${agent.id}`}>
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md" data-testid={`card-agent-full-${agent.id}`}>
      <CardHeader className="text-center pb-4">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage src={agent.photo} alt={agent.name} />
          <AvatarFallback className="text-lg">{getInitials(agent.name)}</AvatarFallback>
        </Avatar>
        
        <div>
          <h2 className="text-xl font-bold" data-testid={`text-agent-name-full-${agent.id}`}>
            {agent.name}
          </h2>
          <p className="text-muted-foreground">{agent.title}</p>
          
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{agent.rating}</span>
            <span className="text-muted-foreground">({agent.reviewCount} reviews)</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-lg" data-testid={`text-experience-${agent.id}`}>
              {agent.yearsExperience}
            </div>
            <div className="text-xs text-muted-foreground">Years Exp.</div>
          </div>
          <div>
            <div className="font-semibold text-lg" data-testid={`text-properties-sold-${agent.id}`}>
              {agent.propertiesSold}
            </div>
            <div className="text-xs text-muted-foreground">Properties Sold</div>
          </div>
          <div>
            <div className="font-semibold text-lg">{agent.reviewCount}</div>
            <div className="text-xs text-muted-foreground">Reviews</div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {agent.bio}
          </p>
        </div>

        {/* Specialties */}
        {agent.specialties.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {agent.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {agent.certifications.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-1">
              <Award className="h-4 w-4" />
              Certifications
            </h3>
            <div className="space-y-1">
              {agent.certifications.map((cert, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  • {cert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Actions */}
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleContact('phone')}
              data-testid={`button-phone-${agent.id}`}
            >
              <Phone className="h-3 w-3 mr-1" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleContact('email')}
              data-testid={`button-email-${agent.id}`}
            >
              <Mail className="h-3 w-3 mr-1" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleContact('message')}
              data-testid={`button-message-${agent.id}`}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Message
            </Button>
          </div>
          
          <Button
            className="w-full"
            onClick={handleViewListings}
            data-testid={`button-view-listings-${agent.id}`}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            View My Listings
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1 pt-2 border-t">
          <div data-testid={`text-phone-${agent.id}`}>{agent.phone}</div>
          <div data-testid={`text-email-${agent.id}`}>{agent.email}</div>
        </div>
      </CardContent>
    </Card>
  );
}