"use client"

import React, { useState, useEffect } from "react"
import { useServiceTokens } from "@/hooks/useServiceTokens"
import { Button } from "@/components/ui/button"
import { ServiceTokenList } from "./ServiceTokenList"
import { ServiceTokenCreate } from "./ServiceTokenCreate"
import { Plus } from "lucide-react"

export function ServiceTokensManager({ projectId }: { projectId: string }) {
  const { listTokens, error } = useServiceTokens()
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    listTokens(projectId)
  }, [projectId, listTokens])

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Tokens de Servicio</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear Token
        </Button>
      </div>

      <ServiceTokenList projectId={projectId} />

      <ServiceTokenCreate
        projectId={projectId}
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => setShowCreateModal(false)}
      />
    </div>
  )
}
