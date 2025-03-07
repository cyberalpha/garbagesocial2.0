
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ContactFormProps {
  onClose: () => void;
}

const ContactForm = ({ onClose }: ContactFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !message) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate sending email (in a real implementation, this would call an API)
      // This is just a placeholder - we'll implement real email functionality later
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Mensaje enviado",
        description: "¡Gracias por contactarnos! Te responderemos pronto.",
      });
      
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Tu nombre" 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input 
          id="email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="tu@correo.com" 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje</Label>
        <Textarea 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="¿En qué podemos ayudarte?" 
          className="min-h-[120px]" 
          required
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar mensaje"}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
