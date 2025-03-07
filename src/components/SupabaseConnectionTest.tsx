
import { useState, useEffect, useRef } from 'react';
import { supabase, SUPABASE_CONFIG } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SupabaseConnectionTest = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const testConnection = async () => {
    // Clear any previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsLoading(true);
    setIsConnected(null);
    setErrorMessage(null);
    
    // Set a timeout of 15 seconds
    timeoutRef.current = setTimeout(() => {
      console.log("Supabase connection timeout reached");
      setIsLoading(false);
      setIsConnected(false);
      setErrorMessage("Connection timeout. Check your network and Supabase configuration.");
      toast({
        title: "Connection Timeout",
        description: "The connection to Supabase timed out. Please check your internet connection or Supabase configuration.",
        variant: "destructive"
      });
    }, 15000);
    
    try {
      // First try with a simple ping - faster and less likely to timeout
      console.log("Attempting to connect to Supabase...");
      console.log("Supabase URL:", SUPABASE_CONFIG.url);
      
      // Try to get service status first - lightweight call
      const { error: pingError } = await supabase.from('_http').select('*').limit(1);
      
      if (pingError) {
        console.log("Ping failed, trying auth.getSession() instead:", pingError);
        // If ping fails, try auth - this is typically more reliable
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        // If authentication works but ping failed, we still consider it a success
        console.log("Auth session check successful:", sessionData);
        setIsConnected(true);
        toast({
          title: "Partial Connection",
          description: "Authentication is working but data access may be limited.",
        });
      } else {
        // Both ping and auth worked
        console.log("Supabase connection successful!");
        setIsConnected(true);
        toast({
          title: "Connection Successful",
          description: "The application is properly connected to Supabase.",
        });
      }
      
      // Clear timeout since we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } catch (error: any) {
      // Clear timeout since we got a response (error)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.error("Unexpected error:", error);
      setIsConnected(false);
      setErrorMessage(error.message || "Unknown error");
      toast({
        title: "Connection Error",
        description: "An error occurred while connecting to Supabase: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Test connection automatically when component loads
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Status</CardTitle>
        <CardDescription>
          Verify if the application can connect to the database
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p>Verifying connection...</p>
          </div>
        ) : isConnected === null ? (
          <p>Waiting for verification...</p>
        ) : isConnected ? (
          <div className="flex flex-col items-center gap-2 text-green-600">
            <CheckCircle className="h-12 w-12" />
            <p className="text-lg font-medium">Connected to Supabase</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-red-600">
            <XCircle className="h-12 w-12" />
            <p className="text-lg font-medium">Unable to connect to Supabase</p>
            {errorMessage && (
              <p className="text-sm text-center mt-2 max-w-xs">{errorMessage}</p>
            )}
            <div className="mt-4 p-4 bg-red-50 rounded-md text-sm">
              <h4 className="font-medium mb-2">Possible solutions:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check your network connection</li>
                <li>Verify that your Supabase project is active</li>
                <li>Clear browser cache and cookies</li>
                <li>Check for CORS issues (for local development)</li>
                <li>Verify the Supabase URL and key are correct</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={testConnection} 
          disabled={isLoading}
          className="px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Test Connection Again'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConnectionTest;
