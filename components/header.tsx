import Link from "next/link"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"

// Eliminamos la directiva 'use client' y la función asíncrona
export function Header({ user }: { user: any }) {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl">
          Tek Secrets
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
            Documentación CLI
          </Link>
          {user && (
            <Link href="/sdk-demo" className="text-sm font-medium hover:text-primary transition-colors">
              SDK Demo
            </Link>
          )}
          {user ? (
            <>
              <UserNav user={user} />
            </>
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}

