import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/viewer");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/viewer-auth`,
      });
      if (error) throw error;
      
      toast({
        title: "Password reset email sent!",
        description: "Please check your email for instructions to reset your password.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4 p-0 h-auto font-normal"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portal Selection
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isForgotPassword ? "Reset Password" : "Invoice Viewer Portal"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Enter your email to receive password reset instructions"
                : "Sign in with your authorized credentials"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Loading..."
                  : isForgotPassword
                  ? "Send Reset Email"
                  : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 text-center space-y-2">
              <button
                onClick={() => setIsForgotPassword(!isForgotPassword)}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {isForgotPassword ? "Back to sign in" : "Forgot your password?"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
