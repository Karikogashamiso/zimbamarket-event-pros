import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEmailService } from "@/hooks/useEmailService";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { z } from "zod";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isVerifyingSession, setIsVerifyingSession] = useState(() => {
    // Check if this is a recovery callback
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    return params.get('type') === 'recovery' || params.get('code') || hash.includes('type=recovery');
  });
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [recoverySession, setRecoverySession] = useState<unknown>(null);
  const [passwordUpdateForm, setPasswordUpdateForm] = useState({
    password: "",
    confirmPassword: "",
  });
  
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validation schemas
  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  });

  const signupSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const resetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
  });

  const updatePasswordSchema = z.object({
    password: z.string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  // Handle email confirmation and password recovery - both hash tokens and PKCE code flow
  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check for PKCE code in search params first
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const type = searchParams.get('type');
      
      if (code) {
        console.log('Found PKCE code, type:', type, ', exchanging for session...');
        setIsVerifyingSession(true);
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code:', error);
            toast({
              title: "Verification Error",
              description: type === 'recovery' ? "Failed to establish session. Please request a new reset link." : "Email verification failed. Please try signing up again.",
              variant: "destructive",
            });
            setShowPasswordUpdate(false);
            setShowForgotPassword(type === 'recovery');
            setIsVerifyingSession(false);
          } else if (data.session) {
            console.log('PKCE session established successfully, type:', type);
            
            // Handle based on callback type
            if (type === 'recovery') {
              // Store the recovery session
              setRecoverySession(data.session);
              
              // Wait a bit to ensure session is persisted
              await new Promise(resolve => setTimeout(resolve, 500));
              
              // Double-check session is available
              const { data: { session: verifiedSession } } = await supabase.auth.getSession();
              
              if (verifiedSession) {
                setShowPasswordUpdate(true);
                setShowForgotPassword(false);
                setResetEmailSent(false);
                setActiveTab('login');
                setIsVerifyingSession(false);
              } else {
                console.error('Session not persisted after exchange');
                toast({
                  title: "Session Error",
                  description: "Failed to establish session. Please request a new reset link.",
                  variant: "destructive",
                });
                setShowPasswordUpdate(false);
                setShowForgotPassword(true);
                setIsVerifyingSession(false);
              }
            } else {
              // Email confirmation (signup) - user is now verified
              setIsVerifyingSession(false);
              toast({
                title: "Email Verified!",
                description: "Your email has been confirmed. Welcome to ZimEventPro!",
              });
              // Navigate to home page
              navigate("/");
            }
          }
        } catch (error) {
          console.error('PKCE callback error:', error);
          toast({
            title: type === 'recovery' ? "Recovery Failed" : "Verification Failed",
            description: type === 'recovery' ? "An error occurred. Please request a new reset link." : "Email verification failed. Please try again.",
            variant: "destructive",
          });
          setShowPasswordUpdate(false);
          setShowForgotPassword(type === 'recovery');
          setIsVerifyingSession(false);
        }
        return;
      }
      
      // Fallback: Check for tokens in hash (legacy flow)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashType = hashParams.get('type');
      
      if (hashType === 'recovery' || hashType === 'signup') {
        console.log('Found hash-based auth callback, type:', hashType);
        setIsVerifyingSession(true);
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error('Error setting session:', error);
              toast({
                title: hashType === 'recovery' ? "Session Error" : "Verification Failed",
                description: hashType === 'recovery' ? "Failed to establish session. Please request a new reset link." : "Email verification failed. Please try signing up again.",
                variant: "destructive",
              });
              setShowPasswordUpdate(false);
              setShowForgotPassword(hashType === 'recovery');
              setIsVerifyingSession(false);
            } else {
              console.log('Hash-based session established successfully');
              
              if (hashType === 'recovery') {
                // Store the recovery session
                setRecoverySession(data.session);
                
                // Wait to ensure session is persisted
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Verify session
                const { data: { session: verifiedSession } } = await supabase.auth.getSession();
                
                if (verifiedSession) {
                  setShowPasswordUpdate(true);
                  setShowForgotPassword(false);
                  setResetEmailSent(false);
                  setActiveTab('login');
                  setIsVerifyingSession(false);
                } else {
                  console.error('Session not persisted after setting');
                  toast({
                    title: "Session Error",
                    description: "Failed to establish session. Please request a new reset link.",
                    variant: "destructive",
                  });
                  setShowPasswordUpdate(false);
                  setShowForgotPassword(true);
                  setIsVerifyingSession(false);
                }
              } else {
                // Email confirmation (signup)
                setIsVerifyingSession(false);
                toast({
                  title: "Email Verified!",
                  description: "Your email has been confirmed. Welcome to ZimEventPro!",
                });
                // Navigate to home page
                navigate("/");
              }
            }
          } catch (error) {
            console.error('Hash auth callback error:', error);
            setShowPasswordUpdate(false);
            setShowForgotPassword(hashType === 'recovery');
            setIsVerifyingSession(false);
          }
        } else {
          console.error('Missing tokens in hash');
          toast({
            title: hashType === 'recovery' ? "Invalid Reset Link" : "Invalid Verification Link",
            description: hashType === 'recovery' ? "The reset link is invalid. Please request a new one." : "The verification link is invalid. Please try signing up again.",
            variant: "destructive",
          });
          setShowPasswordUpdate(false);
          setShowForgotPassword(hashType === 'recovery');
          setIsVerifyingSession(false);
        }
      } else {
        setIsVerifyingSession(false);
      }
    };
    
    handleAuthCallback();
  }, [toast, navigate]);

  // Check URL parameters for tab and password reset
  useEffect(() => {
    const tab = searchParams.get('tab');
    const type = searchParams.get('type');
    
    if (type === 'recovery') {
      // PRIORITY: Handle password recovery first
      setShowPasswordUpdate(true);
      setShowForgotPassword(false);
      setResetEmailSent(false);
      setActiveTab('login');
      return; // Exit early to prevent other tab logic
    }
    
    if (tab === 'signup' || tab === 'login') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Allow access to auth page for all users
  // Users may want to access this page to signup even if they're logged in

  // Handle auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // CRITICAL: Check URL and hash synchronously - don't rely on state
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const code = urlParams.get('code');
      const type = urlParams.get('type');
      const hashType = hashParams.get('type');
      
      // BLOCK ANY REDIRECT if we're in recovery mode
      if (code || type === 'recovery' || hashType === 'recovery') {
        console.log('Recovery mode detected in auth state change, showing password update form');
        // Ensure password update form is shown
        setShowPasswordUpdate(true);
        setShowForgotPassword(false);
        setResetEmailSent(false);
        return; // Exit immediately - don't redirect
      }
      
      // Only redirect on normal sign-in (not recovery)
      if (event === 'SIGNED_IN' && session && !showPasswordUpdate && type !== 'recovery' && hashType !== 'recovery') {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, showPasswordUpdate]);

  const validateField = (schema: z.ZodSchema, data: any, field: string) => {
    try {
      schema.parse(data);
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => err.path.includes(field));
        if (fieldError) {
          setFormErrors(prev => ({
            ...prev,
            [field]: fieldError.message
          }));
        }
      }
      return false;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      const validatedData = loginSchema.parse(loginForm);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes("Email not confirmed")) {
          setFormErrors({ email: "Please verify your email first" });
          toast({
            title: "Email Not Verified",
            description: "Please check your email inbox and spam folder for the verification link. You can also request a new verification email from the signup page.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      const validatedData = signupSchema.parse(signupForm);
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast({
            title: "Account Already Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("login");
          setLoginForm(prev => ({ ...prev, email: validatedData.email }));
        } else {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Check if email confirmation is required
        const needsEmailConfirmation = data.user && !data.session;
        
        if (needsEmailConfirmation) {
          setIsEmailSent(true);
          toast({
            title: "Account Created!",
            description: "Please check your email for a verification link to complete your registration.",
          });
        } else {
          // Email confirmation is disabled, user is automatically logged in
          toast({
            title: "Account Created Successfully!",
            description: "Welcome to ZimEventPro! You're now signed in.",
          });
          navigate("/");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      const validatedData = resetPasswordSchema.parse({ email: resetEmail });
      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          toast({
            title: "Too Many Requests",
            description: "Too many password reset attempts. Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else if (error.message.includes('not found')) {
          // Don't reveal if email exists for security
          setResetEmailSent(true);
          toast({
            title: "Reset Link Sent!",
            description: "If an account exists with that email, you'll receive a password reset link.",
          });
        } else {
          toast({
            title: "Reset Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        setResetEmailSent(true);
        toast({
          title: "Reset Link Sent!",
          description: "Please check your email for a password reset link.",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      } else {
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});

    try {
      const validatedData = updatePasswordSchema.parse(passwordUpdateForm);

      // Use the stored recovery session or get current session
      let session = recoverySession;
      
      if (!session) {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        session = currentSession;
        
        if (sessionError || !session) {
          console.error('Session missing during password update:', sessionError);
          toast({
            title: "Session Expired",
            description: "Your reset session has expired. Please request a new password reset link.",
            variant: "destructive",
          });
          setShowPasswordUpdate(false);
          setShowForgotPassword(true);
          setIsLoading(false);
          return;
        }
      }

      console.log('Valid session confirmed, updating password...');

      // Update the password - the recovery session allows this
      const { error } = await supabase.auth.updateUser({
        password: validatedData.password
      });

      if (error) {
        console.error('Password update error:', error);
        if (error.message.includes('session_not_found') || error.message.includes('invalid_token') || error.message.includes('expired')) {
          toast({
            title: "Reset Link Expired",
            description: "Your password reset link has expired. Please request a new one.",
            variant: "destructive",
          });
          setShowPasswordUpdate(false);
          setShowForgotPassword(true);
        } else if (error.message.includes('same password')) {
          toast({
            title: "Password Not Changed",
            description: "Please choose a different password than your current one.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Password Update Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Password Updated Successfully!",
          description: "Redirecting you to the app...",
        });
        
        // Clear the form
        setPasswordUpdateForm({ password: "", confirmPassword: "" });
        setShowPasswordUpdate(false);
        
        // Redirect to home page - user is already authenticated after recovery
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1500);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      } else {
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                We've sent a verification link to <strong>{signupForm.email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Click the link in the email to verify your account and complete your registration.
              </p>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </AlertDescription>
            </Alert>

            
            <div className="flex flex-col gap-2">
              <Button 
                variant="default" 
                onClick={async () => {
                  setIsLoading(true);
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: signupForm.email,
                    options: {
                      emailRedirectTo: `${window.location.origin}/`,
                    }
                  });
                  
                  setIsLoading(false);
                  
                  if (error) {
                    toast({
                      title: "Failed to Resend",
                      description: error.message,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Email Resent!",
                      description: "Please check your email for the verification link.",
                    });
                  }
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEmailSent(false);
                  setActiveTab("login");
                }}
                className="w-full"
              >
                Back to Sign In
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsEmailSent(false)}
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                We've sent a password reset link to <strong>{resetEmail}</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Click the link in the email to reset your password.
              </p>
            </div>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Didn't receive the email? Check your spam folder or wait a few minutes.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="default" 
                onClick={async () => {
                  setIsLoading(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                    redirectTo: `${window.location.origin}/auth`,
                  });
                  
                  setIsLoading(false);
                  
                  if (error) {
                    toast({
                      title: "Failed to Resend",
                      description: error.message,
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Reset Email Resent!",
                      description: "Please check your email for the password reset link.",
                    });
                  }
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Reset Email
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setResetEmailSent(false);
                  setShowForgotPassword(false);
                }}
                className="w-full"
              >
                Back to Sign In
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setResetEmailSent(false);
                  setResetEmail("");
                }}
                className="w-full"
              >
                Try Different Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setShowForgotPassword(false)}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPasswordUpdate) {
    // Show loading while verifying session
    if (isVerifyingSession) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p className="text-center text-muted-foreground">
                  Verifying your reset link...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Create New Password</CardTitle>
            <p className="text-muted-foreground">
              Enter your new password below. Make sure it's secure and easy to remember.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={passwordUpdateForm.password}
                    onChange={(e) => setPasswordUpdateForm(prev => ({ ...prev, password: e.target.value }))}
                    onBlur={() => validateField(updatePasswordSchema, passwordUpdateForm, "password")}
                    className={`pl-10 pr-10 ${formErrors.password ? 'border-destructive' : ''}`}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Must contain uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={passwordUpdateForm.confirmPassword}
                    onChange={(e) => setPasswordUpdateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    onBlur={() => validateField(updatePasswordSchema, passwordUpdateForm, "confirmPassword")}
                    className={`pl-10 ${formErrors.confirmPassword ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {formErrors.confirmPassword && (
                  <p className="text-xs text-destructive mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your new password will be applied to your account immediately after confirmation.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowPasswordUpdate(false);
                  setPasswordUpdateForm({ password: "", confirmPassword: "" });
                  navigate("/auth?tab=login", { replace: true });
                }}
                className="w-full"
              >
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to ZimEventPro</span>
          </Link>
        </div>
      </div>

      {/* Auth Form */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to ZimEventPro</h1>
            <p className="text-muted-foreground">
              Join Zimbabwe's premier event planning platform
            </p>
          </div>

          <Card className="shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          onBlur={() => validateField(loginSchema, loginForm, "email")}
                          className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className={`pl-10 pr-10 ${formErrors.password ? 'border-destructive' : ''}`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup">
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="John"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm(prev => ({ ...prev, firstName: e.target.value }))}
                            onBlur={() => validateField(signupSchema, signupForm, "firstName")}
                            className={`pl-10 ${formErrors.firstName ? 'border-destructive' : ''}`}
                            required
                          />
                        </div>
                        {formErrors.firstName && (
                          <p className="text-xs text-destructive mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          placeholder="Doe"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, lastName: e.target.value }))}
                          onBlur={() => validateField(signupSchema, signupForm, "lastName")}
                          className={formErrors.lastName ? 'border-destructive' : ''}
                          required
                        />
                        {formErrors.lastName && (
                          <p className="text-xs text-destructive mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                          onBlur={() => validateField(signupSchema, signupForm, "email")}
                          className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {formErrors.email && (
                        <p className="text-xs text-destructive mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                          onBlur={() => validateField(signupSchema, signupForm, "password")}
                          className={`pl-10 pr-10 ${formErrors.password ? 'border-destructive' : ''}`}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {formErrors.password && (
                        <p className="text-xs text-destructive mt-1">{formErrors.password}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Must contain uppercase, lowercase, and number
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupForm.confirmPassword}
                          onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          onBlur={() => validateField(signupSchema, signupForm, "confirmPassword")}
                          className={`pl-10 ${formErrors.confirmPassword ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{formErrors.confirmPassword}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        By creating an account, you agree to our Terms of Service and Privacy Policy.
                      </AlertDescription>
                    </Alert>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;