import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, LogIn, Mail, Lock, User, Phone, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(255),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address").max(255),
  phone: z.string().min(10, "Please enter a valid phone number").max(20),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

interface AuthDialogProps {
  children: React.ReactNode;
  defaultTab?: "login" | "register";
}

const AuthDialog = ({ children, defaultTab = "login" }: AuthDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();

  const validateField = (fieldName: string, value: string, isLogin: boolean = false) => {
    try {
      const schema = isLogin ? loginSchema : registerSchema;
      const fieldSchema = schema.shape[fieldName as keyof typeof schema.shape];
      fieldSchema.parse(value);
      
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors(prev => ({
          ...prev,
          [fieldName]: error.errors[0].message
        }));
      }
      return false;
    }
  };

  const handleFieldBlur = (fieldName: string, value: string, isLogin: boolean = false) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value, isLogin);
  };

  const getFieldError = (fieldName: string) => {
    return touchedFields[fieldName] ? formErrors[fieldName] : undefined;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    
    const formData = new FormData(e.target as HTMLFormElement);
    const loginData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    try {
      // Validate form data
      loginSchema.parse(loginData);

      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Sign in failed",
            description: "The email or password you entered is incorrect. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email not verified",
            description: "Please check your email and click the verification link before signing in.",
            variant: "destructive",
          });
        } else if (error.message.includes('Too many requests')) {
          toast({
            title: "Too many attempts",
            description: "Please wait a few minutes before trying to sign in again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: "Unable to sign in right now. Please try again or contact support if the problem persists.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      setIsOpen(false);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
            setTouchedFields(prev => ({ ...prev, [err.path[0] as string]: true }));
          }
        });
        setFormErrors(newErrors);
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    
    const formData = new FormData(e.target as HTMLFormElement);
    const registerData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
    };

    try {
      // Validate form data
      registerSchema.parse(registerData);

      const { error } = await signUp(
        registerData.email, 
        registerData.password, 
        registerData.firstName, 
        registerData.lastName, 
        registerData.phone
      );
      
      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('User already registered')) {
          toast({
            title: "Account already exists",
            description: "An account with this email already exists. Please sign in instead or use the password reset option.",
            variant: "destructive",
          });
        } else if (error.message.includes('Password should be at least')) {
          toast({
            title: "Weak password",
            description: "Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.",
            variant: "destructive",
          });
        } else if (error.message.includes('email address is invalid')) {
          toast({
            title: "Invalid email",
            description: "Please enter a valid email address.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: "Unable to create your account right now. Please try again or contact support.",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to ZimEventPro! Please check your email to verify your account before signing in.",
      });
      setIsOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
            setTouchedFields(prev => ({ ...prev, [err.path[0] as string]: true }));
          }
        });
        setFormErrors(newErrors);
      } else {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            ZimEventPro
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your ZimEventPro account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className={`pl-10 ${getFieldError('email') ? 'border-destructive focus:border-destructive' : ''}`}
                        onBlur={(e) => handleFieldBlur('email', e.target.value, true)}
                        required
                      />
                      {getFieldError('email') && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('email')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className={`pl-10 ${getFieldError('password') ? 'border-destructive focus:border-destructive' : ''}`}
                        onBlur={(e) => handleFieldBlur('password', e.target.value, true)}
                        required
                      />
                      {getFieldError('password') && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('password')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>
                  Join Zimbabwe's premier event marketplace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          name="firstName"
                          placeholder="First name"
                          className={`pl-10 ${getFieldError('firstName') ? 'border-destructive focus:border-destructive' : ''}`}
                          onBlur={(e) => handleFieldBlur('firstName', e.target.value)}
                          required
                        />
                        {getFieldError('firstName') && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {getFieldError('firstName')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Last name"
                        className={getFieldError('lastName') ? 'border-destructive focus:border-destructive' : ''}
                        onBlur={(e) => handleFieldBlur('lastName', e.target.value)}
                        required
                      />
                      {getFieldError('lastName') && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {getFieldError('lastName')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registerEmail"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+263 77 123 4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="registerPassword"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    By creating an account, you agree to our{" "}
                    <a href="/terms-of-service" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy-policy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;