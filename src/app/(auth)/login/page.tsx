"use client";

import { Suspense, useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BrandLogo } from "@/components/shared/BrandLogo";

const loginSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  invitationCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const invCode = searchParams.get("inv");
  
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (modeParam === "register") {
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [modeParam]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (invCode) {
      setValue("invitationCode", invCode);
    }
  }, [invCode, setValue]);

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset();
    setErrorMsg("");
  };

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg("");
    try {
      if (isRegister) {
        if (!data.name) {
          setErrorMsg("Name is required for registration.");
          return;
        }
        if (!data.invitationCode) {
          setErrorMsg("Kode undangan wajib diisi");
          return;
        }
        const { error } = await authClient.signUp.email({
          email: data.email,
          password: data.password,
          name: data.name,
          invitationCode: data.invitationCode,
        } as any);

        if (error) {
          if (error.code === 'INVALID_INVITATION_CODE') {
            setErrorMsg("Kode undangan tidak valid. Hubungi admin untuk mendapatkan kode.");
            toast.error("Kode undangan tidak valid.");
          } else {
            setErrorMsg(error.message || "Failed to register.");
            toast.error(error.message || "Failed to register.");
          }
          return;
        }
        
        toast.success("Registration successful! You are now logged in.");
        router.push("/dashboard");
      } else {
        const { error } = await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

        if (error) {
          setErrorMsg(error.message || "Failed to login. Please check your credentials.");
          toast.error(error.message || "Failed to login.");
          return;
        }

        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center text-center">
        <BrandLogo className="mb-4 w-full justify-center px-4" />
        <h1 className="font-display font-black text-3xl tracking-tighter text-foreground uppercase mb-2">
          WC 2026 Predictor
        </h1>
        <p className="font-sans text-sm uppercase tracking-[0.2em] text-muted-foreground font-bold">
          Predict. Compete. Win. 🏆
        </p>
      </div>

      {/* Form Container (Glassmorphism) */}
      <div className="w-full bg-card/80 backdrop-blur-md rounded-xl p-6 shadow-[0px_24px_48px_rgba(0,0,0,0.6)] border border-border/50">
        
        {/* Toggle Login/Register */}
        <div className="flex bg-secondary/50 p-1 rounded-md mb-6">
           <button 
             type="button"
             onClick={() => !isRegister || toggleMode()}
             className={cn("flex-1 py-2 text-sm font-display font-bold rounded uppercase transition-colors", !isRegister ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground")}
           >
             Login
           </button>
           <button 
             type="button"
             onClick={() => isRegister || toggleMode()}
             className={cn("flex-1 py-2 text-sm font-display font-bold rounded uppercase transition-colors", isRegister ? "bg-background text-primary shadow" : "text-muted-foreground hover:text-foreground")}
           >
             Register
           </button>
         </div>

         {isRegister && invCode && (
           <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-md flex items-start gap-3">
             <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
             <div>
               <p className="font-sans text-sm font-bold text-foreground">Kamu diundang untuk bergabung!</p>
               <p className="font-sans text-xs text-muted-foreground mt-1">Lengkapi data di bawah untuk mendaftar.</p>
             </div>
           </div>
         )}

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Name Input (Only for Register) */}
          {isRegister && (
            <div>
              <label className="block font-sans text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={cn(
                    "block w-full pl-10 bg-secondary/50 border border-transparent rounded-md text-foreground font-sans text-base focus:border-primary focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors placeholder:text-muted-foreground/50 py-3"
                  )}
                  {...register("name")}
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block font-sans text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="enter@email.com"
                className={cn(
                  "block w-full pl-10 bg-secondary/50 border border-transparent rounded-md text-foreground font-sans text-base focus:border-primary focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors placeholder:text-muted-foreground/50 py-3",
                  errors.email && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block font-sans text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "block w-full pl-10 pr-10 bg-secondary/50 border border-transparent rounded-md text-foreground font-sans text-base focus:border-primary focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors placeholder:text-muted-foreground/50 py-3",
                  errors.password && "border-destructive focus:border-destructive focus:ring-destructive"
                )}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
            )}
            {!isRegister && (
               <div className="flex justify-end mt-2">
                 <a className="font-sans text-xs text-muted-foreground hover:text-primary transition-colors" href="#">
                   Lupa password?
                 </a>
               </div>
            )}
          </div>

          {/* Invitation Code Input (Only for Register) */}
          {isRegister && !invCode && (
            <div>
              <label className="block font-sans text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider" htmlFor="invitationCode">
                Kode Undangan
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="invitationCode"
                  type="text"
                  placeholder="Masukkan kode undangan"
                  className={cn(
                    "block w-full pl-10 bg-secondary/50 border border-transparent rounded-md text-foreground font-sans text-base focus:border-primary focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors placeholder:text-muted-foreground/50 py-3",
                    errors.invitationCode && "border-destructive focus:border-destructive focus:ring-destructive"
                  )}
                  {...register("invitationCode")}
                />
              </div>
              {errors.invitationCode && (
                <p className="mt-1 text-xs text-destructive">{errors.invitationCode.message}</p>
              )}
            </div>
          )}
          {isRegister && invCode && (
            <input type="hidden" {...register("invitationCode")} />
          )}

          {/* Global Error */}
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase text-lg py-3 rounded-md shadow-[0_0_15px_rgba(0,230,118,0.2)] hover:shadow-[0_0_25px_rgba(0,230,118,0.4)] transition-all active:scale-[0.98] mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
          >
            {isSubmitting ? "LOADING..." : (isRegister ? "DAFTAR" : "MASUK")}
            {!isSubmitting && <ArrowRight className="h-5 w-5 font-bold" />}
          </button>
        </form>

        {/* Quick Login / Social */}
        <div className="mt-6 pt-5 border-t border-border/50 text-center">
          <p className="font-sans text-xs text-muted-foreground mb-4 uppercase tracking-widest">
            Or continue with
          </p>
          <div className="flex justify-center gap-4">
            <button
              type="button"
              className="w-12 h-12 bg-secondary rounded-md flex items-center justify-center hover:bg-secondary/80 transition-colors group"
            >
              <svg className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
