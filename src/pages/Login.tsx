import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Zap } from "lucide-react";
import emailjs from "emailjs-com";

const SERVICE_ID = "your_service_id";
const TEMPLATE_ID = "your_template_id";
const PUBLIC_KEY = "your_public_key";

const sendWelcomeEmail = (email: string, type: "signup" | "signin") => {
  const templateParams = {
    user_email: email,
    subject:
      type === "signup"
        ? "Welcome to IoT Data Visualization Dashboard"
        : "Login Successful",
    message:
      type === "signup"
        ? "Your account has been created successfully."
        : "You've successfully logged into the IoT Data Visualization Dashboard.",
    time: new Date().toLocaleString(),
  };

  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
    .then((response) => {
      console.log("✅ Email sent:", response.status, response.text);
    })
    .catch((err) => {
      console.error("❌ Email failed:", err);
    });
};

const Login: React.FC = () => {
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, isAuthenticated } = useAuth();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInEmail || !signInPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await login(signInEmail, signInPassword);

    if (success) {
      sendWelcomeEmail(signInEmail, "signin");
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
    } else {
      toast({
        title: "Login Failed",
        description:
          "Invalid credentials. Please check your email and password.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpEmail || !signUpPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (signUpPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const success = await signup(signUpEmail, signUpPassword);

    if (success) {
      sendWelcomeEmail(signUpEmail, "signup");
      toast({
        title: "Account Created",
        description: "Welcome! Your account has been created successfully.",
      });
    } else {
      toast({
        title: "Sign Up Failed",
        description: "An account with this email already exists.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      <Card className="w-full max-w-md relative bg-gradient-card backdrop-blur-sm border-border/50 shadow-elevated">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold gradient-text">
              IoT Solar Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Monitor your solar panel performance in real-time
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form
                onSubmit={handleSignIn}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSignIn(e as unknown as React.FormEvent);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signin-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form
                onSubmit={handleSignUp}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="signup-password"
                    className="text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
