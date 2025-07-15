import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import {
  ProjectEnvironmentsProvider,
  RenderActionsProvider,
  ToastContextProvider,
  VercelActionsProvider,
} from "@/context";

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
          <ToastContextProvider>
            <ProjectEnvironmentsProvider>
              <RenderActionsProvider>
                <VercelActionsProvider>{children}</VercelActionsProvider>
              </RenderActionsProvider>
            </ProjectEnvironmentsProvider>
            <div id="toast" />
          </ToastContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
