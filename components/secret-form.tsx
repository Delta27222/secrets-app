"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { createSecret, updateSecret } from "@/lib/api"

interface SecretFormProps {
  secret?: {
    id: string
    name: string
    value: string
    description?: string
  }
}

export function SecretForm({ secret }: SecretFormProps = {}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showValue, setShowValue] = useState(false)
  const [formData, setFormData] = useState({
    name: secret?.name || "",
    value: secret?.value || "",
    description: secret?.description || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (secret) {
        await updateSecret(secret.id, formData)
      } else {
        await createSecret(formData)
      }
      router.push("/secretos")
      router.refresh()
    } catch (error) {
      console.error("Error al guardar el secreto:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Clave API"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  type={showValue ? "text" : "password"}
                  placeholder="Introduce el valor del secreto"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowValue(!showValue)}
                >
                  {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="¿Para qué se utiliza este secreto?"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : secret ? "Actualizar Secreto" : "Guardar Secreto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

