"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Flame, Shield } from "lucide-react"

interface StreakFreezeModalProps {
  open: boolean
  onClose: () => void
  onPurchase: () => void
  gems: number
}

export function StreakFreezeModal({ open, onClose, onPurchase, gems }: StreakFreezeModalProps) {
  const cost = 100

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            Gel de série
          </DialogTitle>
          <DialogDescription>Protège ta série pendant 1 jour si tu manques une leçon</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 text-center">
            <Flame className="h-12 w-12 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Ta série actuelle ne sera pas perdue si tu oublies de faire une leçon demain
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-card border rounded-xl">
            <span className="font-semibold">Prix</span>
            <span className="text-xl font-bold text-blue-600">{cost} 💎</span>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Tes gemmes</span>
            <span className="font-bold">{gems} 💎</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Annuler
            </Button>
            <Button onClick={onPurchase} disabled={gems < cost} className="flex-1">
              Acheter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
