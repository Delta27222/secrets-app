"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DialogContainerProps {
  dialogInfo: {
    title: string;
    description?: string;
    badge?: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
    className?: string;
  }
  closeButton?: boolean;
  children: React.ReactNode;
}

export function DialogContainer({ dialogInfo, closeButton=false, children}: DialogContainerProps) {
  const { title, description, badge, isOpen, setIsOpen, className='max-w-3xl' } = dialogInfo;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={className}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {title} {badge}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
          {closeButton ? (
            <DialogFooter className="flex justify-between items-center">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          ) : null}
        </DialogContent>
      </Dialog>
  )
}

