import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { rateLimiter, RateLimitPresets, formatResetTime } from "@/utils/rateLimiter";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY: Rate limiting to prevent brute-force attacks
    const rateLimitKey = `login:${email}`;
    const rateLimit = rateLimiter.check(rateLimitKey, RateLimitPresets.LOGIN);
    
    if (!rateLimit.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Attempts",
        description: `Please wait ${formatResetTime(rateLimit.resetIn || 0)} before trying again.`,
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Success - reset rate limit
      rateLimiter.reset(rateLimitKey);
      navigate("/viewer");
    } catch (error: any) {
      // Show remaining attempts if getting close to limit
      if (rateLimit.remaining <= 2) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: `${error.message}. ${rateLimit.remaining} attempt${rateLimit.remaining === 1 ? '' : 's'} remaining.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
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

    // SECURITY: Rate limiting for password reset to prevent abuse
    const rateLimitKey = `password-reset:${email}`;
    const rateLimit = rateLimiter.check(rateLimitKey, RateLimitPresets.PASSWORD_RESET);
    
    if (!rateLimit.allowed) {
      toast({
        variant: "destructive",
        title: "Too Many Requests",
        description: `Please wait ${formatResetTime(rateLimit.resetIn || 0)} before requesting another password reset.`,
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
