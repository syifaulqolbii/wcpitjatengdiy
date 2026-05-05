import { BrandLogo } from "@/components/shared/BrandLogo";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center space-y-4">
        <BrandLogo className="w-full max-w-md justify-center" />
        <h1 className="text-3xl text-foreground font-display font-black uppercase tracking-tight">World Cup 2026 Predictor</h1>
        <p className="text-muted-foreground text-lg font-sans">
          Welcome to the World Cup 2026 Prediction App.
        </p>
      </div>
    </main>
  );
}
