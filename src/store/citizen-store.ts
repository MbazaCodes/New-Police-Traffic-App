import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CitizenUser = {
  id: string;
  citizenId: string | null;
  name: string;
  phone: string;
  email: string;
  nida: string;
  isDriver: boolean;
  driverPoints: number;
  goodConductPoints: number;
  profileComplete: boolean;
  token?: string;
};

type CitizenStore = {
  citizen: CitizenUser | null;
  isAuthenticated: boolean;
  setCitizen: (c: CitizenUser) => void;
  logout: () => void;
};

export const useCitizenStore = create<CitizenStore>()(
  persist(
    (set) => ({
      citizen: null,
      isAuthenticated: false,
      setCitizen: (c) => set({ citizen: c, isAuthenticated: true }),
      logout: () => {
        set({ citizen: null, isAuthenticated: false });
        if (typeof window !== "undefined") {
          localStorage.removeItem("citizen-token");
          localStorage.removeItem("citizen-session");
          localStorage.removeItem("tpf-citizen-store");
          // Navigate to /api/auth/logout?redirect=/citizen which clears
          // NextAuth cookies and redirects back to the citizen portal.
          window.location.href = "/api/auth/logout?redirect=/citizen";
        }
      },
    }),
    { name: "tpf-citizen-store" }
  )
);
