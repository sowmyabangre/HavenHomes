import ContactForm, { ContactFormData } from '../ContactForm';
import agentPhoto from '@assets/generated_images/professional_agent_headshot_woman_018b07d9.png';

export default function ContactFormExample() {
  const handleSubmit = (formData: ContactFormData) => {
    console.log('Contact form submitted:', formData);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <ContactForm
        propertyId="1"
        propertyTitle="Modern Family Home"
        agentName="Sarah Johnson"
        agentPhoto={agentPhoto}
        agentPhone="(555) 123-4567"
        agentEmail="sarah.johnson@propertyhub.com"
        onSubmit={handleSubmit}
      />
    </div>
  );
}