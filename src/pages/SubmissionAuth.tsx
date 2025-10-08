
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { passwordSchema, passwordRequirements } from "@/lib/passwordValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubmissionAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [signUpEmailSent, setSignUpEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password on sign-up
    if (isSignUp) {
      try {
        passwordSchema.parse(password);
        setPasswordError(null);
      } catch (error: any) {
        setPasswordError(error.errors[0]?.message || "Invalid password");
        return;
      }
    }
    
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/submission-portal`,
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        if (error) throw error;
        setSignUpEmailSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/submission-portal");
      }
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
        redirectTo: `${window.location.origin}/submission-auth`,
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
              {isForgotPassword ? "Reset Password" : isSignUp ? "Create Submission Account" : "Invoice Submission Portal"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword
                ? "Enter your email to receive password reset instructions"
                : isSignUp
                ? "Sign up for invoice submission access"
                : "Sign in to submit invoices"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            ) : isSignUp && signUpEmailSent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Please check your email to verify your account.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    required
                  />
                  {isSignUp && (
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {passwordRequirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {passwordError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{passwordError}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Loading..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </Button>
              </form>
            )}
            
            <div className="mt-4 text-center space-y-2">
              {!isForgotPassword && (
                <>
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setSignUpEmailSent(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-primary block w-full"
                  >
                    {isSignUp
                      ? "Already have an account? Sign in"
                      : "Need an account? Sign up"}
                  </button>
                  {!isSignUp && (
                    <button
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Forgot your password?
                    </button>
                  )}
                </>
              )}
              {isForgotPassword && (
                <button
                  onClick={() => setIsForgotPassword(false)}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
