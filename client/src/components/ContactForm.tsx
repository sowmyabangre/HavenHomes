import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, Mail, MessageCircle, Clock } from 'lucide-react';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  agentName?: string;
  agentPhoto?: string;
  agentPhone?: string;
  agentEmail?: string;
  onSubmit?: (formData: ContactFormData) => void;
  className?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  preferredContact: string;
  bestTimeToCall: string;
}

export default function ContactForm({
  propertyId,
  propertyTitle,
  agentName = 'Property Agent',
  agentPhoto,
  agentPhone,
  agentEmail,
  onSubmit,
  className
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    message: '',
    preferredContact: 'email',
    bestTimeToCall: 'anytime',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Todo: Remove mock functionality - integrate with real contact system
    console.log('Contact form submitted:', {
      ...formData,
      propertyId,
      propertyTitle,
      agentName,
    });

    // Simulate API call
    setTimeout(() => {
      onSubmit?.(formData);
      setIsSubmitting(false);
      setIsSubmitted(true);

      // Reset form after success message
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          inquiryType: 'general',
          message: '',
          preferredContact: 'email',
          bestTimeToCall: 'anytime',
        });
      }, 3000);
    }, 1500);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isSubmitted) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
            <p className="text-muted-foreground text-sm">
              Thank you for your inquiry. {agentName} will get back to you within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agentPhoto} alt={agentName} />
            <AvatarFallback>{getInitials(agentName)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">Contact {agentName}</div>
            {propertyTitle && (
              <div className="text-sm text-muted-foreground font-normal">
                About: {propertyTitle}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Contact Options */}
        {(agentPhone || agentEmail) && (
          <div className="flex gap-2 pb-4 border-b">
            {agentPhone && (
              <Button variant="outline" size="sm" className="flex-1" data-testid="button-quick-call">
                <Phone className="h-3 w-3 mr-1" />
                Call
              </Button>
            )}
            {agentEmail && (
              <Button variant="outline" size="sm" className="flex-1" data-testid="button-quick-email">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact-name">Name *</Label>
              <Input
                id="contact-name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                data-testid="input-contact-name"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                data-testid="input-contact-email"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              data-testid="input-contact-phone"
            />
          </div>

          {/* Inquiry Type */}
          <div>
            <Label htmlFor="inquiry-type">I'm interested in</Label>
            <Select value={formData.inquiryType} onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}>
              <SelectTrigger data-testid="select-inquiry-type">
                <SelectValue placeholder="Select inquiry type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Information</SelectItem>
                <SelectItem value="viewing">Scheduling a Viewing</SelectItem>
                <SelectItem value="price">Price and Terms</SelectItem>
                <SelectItem value="financing">Financing Options</SelectItem>
                <SelectItem value="neighborhood">Neighborhood Info</SelectItem>
                <SelectItem value="similar">Similar Properties</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              placeholder="Tell us more about what you're looking for..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              data-testid="textarea-contact-message"
            />
          </div>

          {/* Communication Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferred-contact">Preferred Contact</Label>
              <Select value={formData.preferredContact} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContact: value }))}>
                <SelectTrigger data-testid="select-preferred-contact">
                  <SelectValue placeholder="How should we contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="text">Text Message</SelectItem>
                  <SelectItem value="any">Any Method</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="best-time">Best Time to Call</Label>
              <Select value={formData.bestTimeToCall} onValueChange={(value) => setFormData(prev => ({ ...prev, bestTimeToCall: value }))}>
                <SelectTrigger data-testid="select-best-time">
                  <SelectValue placeholder="When to reach you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anytime">Anytime</SelectItem>
                  <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                  <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                  <SelectItem value="weekends">Weekends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-testid="button-submit-contact"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Message...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </>
            )}
          </Button>

          {/* Response Time Notice */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Clock className="h-3 w-3" />
            Typical response time: within 2 hours
          </div>
        </form>
      </CardContent>
    </Card>
  );
}