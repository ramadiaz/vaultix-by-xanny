 "use client";

import { HeroUIProvider } from "@heroui/react";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";

type HeroUIProviderProps = {
  children: ReactNode;
};

export function HeroUIRootProvider({ children }: HeroUIProviderProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      {children}
    </HeroUIProvider>
  );
}

