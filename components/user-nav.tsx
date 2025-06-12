"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import type { User } from "next-auth"

export function UserNav({ user }: { user: User | undefined }) {
  if (!user) return null

  // Usar displayName si está disponible, de lo contrario usar name
  const displayName = user.displayName || user.name

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user.username?.substring(0, 2).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={displayName || user.username || "Usuario"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName || user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.id && (
              <p className="text-xs leading-none text-muted-foreground mt-1">ID: {user.id.substring(0, 8)}...</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
