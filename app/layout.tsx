import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import {
  MembershipsProvider,
  ToastContextProvider,
  ServiceTokensProvider,
} from "@/context";
import { ProjectsInfoProvider } from "@/context/ProjectsInfoContext";
import { LogsProvider } from "@/context/LogsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tek Secrets",
  description: "Una aplicación segura para gestionar tus secretos",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <MembershipsProvider>
            <ProjectsInfoProvider>
              <ToastContextProvider>
                <LogsProvider>
                  <ServiceTokensProvider>
                    {children}
                    <div id="toast" />
                  </ServiceTokensProvider>
                </LogsProvider>
              </ToastContextProvider>
            </ProjectsInfoProvider>
          </MembershipsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
