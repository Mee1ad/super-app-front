"use client";
export default function TransitionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {children}
    </div>
  );
}