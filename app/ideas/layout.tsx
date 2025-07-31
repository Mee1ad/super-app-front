import { ReplicacheIdeasProvider } from "./atoms/ReplicacheIdeasContext";

export default function IdeasLayout({ children }: { children: React.ReactNode }) {
  return <ReplicacheIdeasProvider>{children}</ReplicacheIdeasProvider>;
}