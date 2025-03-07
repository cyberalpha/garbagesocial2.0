
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import ContactForm from './ContactForm';

interface ContactDialogProps {
  children?: React.ReactNode;
}

const ContactDialog = ({ children }: ContactDialogProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            Contáctanos
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Contáctanos</AlertDialogTitle>
          <AlertDialogDescription>
            Envíanos un mensaje y te responderemos lo antes posible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <ContactForm onClose={() => setOpen(false)} />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ContactDialog;
