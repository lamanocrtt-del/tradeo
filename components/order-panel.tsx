"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface OrderPanelProps {
  currentPrice: number
  balance: number
  onOrder: (type: "buy" | "sell", quantity: number, price: number) => void
}

export function OrderPanel({ currentPrice, balance, onOrder }: OrderPanelProps) {
  const [orderType, setOrderType] = useState<"market" | "limit">("market")
  const [quantity, setQuantity] = useState("10")
  const [limitPrice, setLimitPrice] = useState(currentPrice.toString())

  const handleSubmit = (type: "buy" | "sell") => {
    const qty = Number.parseInt(quantity) || 0
    const price = orderType === "market" ? currentPrice : Number.parseFloat(limitPrice) || currentPrice

    if (qty > 0) {
      onOrder(type, qty, price)
    }
  }

  return (
    <div className="bg-card border rounded-xl p-4 space-y-4">
      <div className="flex gap-2">
        <Button
          variant={orderType === "market" ? "default" : "outline"}
          onClick={() => setOrderType("market")}
          className="flex-1"
        >
          Marché
        </Button>
        <Button
          variant={orderType === "limit" ? "default" : "outline"}
          onClick={() => setOrderType("limit")}
          className="flex-1"
        >
          Limite
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="quantity">Quantité</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1"
          />
        </div>

        {orderType === "limit" && (
          <div>
            <Label htmlFor="price">Prix limite</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>Prix actuel: ${currentPrice.toFixed(2)}</p>
          <p>Solde disponible: ${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => handleSubmit("buy")} className="bg-green-500 hover:bg-green-600">
          Acheter
        </Button>
        <Button onClick={() => handleSubmit("sell")} className="bg-red-500 hover:bg-red-600">
          Vendre
        </Button>
      </div>
    </div>
  )
}
