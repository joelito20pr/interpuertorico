"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Filter, Download, MoreHorizontal, ExternalLink, Mail, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for sponsors
const mockSponsors = [
  {
    id: 1,
    name: "Empresa ABC",
    email: "contacto@empresaabc.com",
    phone: "787-123-4567",
    amount: "$600",
    tier: "Principal",
    date: "2023-05-01",
    status: "Pagado",
  },
  {
    id: 2,
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "787-234-5678",
    amount: "$150",
    tier: "Plata",
    date: "2023-04-28",
    status: "Pagado",
  },
  {
    id: 3,
    name: "Compañía XYZ",
    email: "info@xyz.com",
    phone: "787-345-6789",
    amount: "$300",
    tier: "Oro",
    date: "2023-04-25",
    status: "Pagado",
  },
  {
    id: 4,
    name: "María Rodríguez",
    email: "maria@example.com",
    phone: "787-456-7890",
    amount: "$150",
    tier: "Plata",
    date: "2023-04-20",
    status: "Pagado",
  },
  {
    id: 5,
    name: "Tienda Local",
    email: "info@tiendalocal.com",
    phone: "787-567-8901",
    amount: "$300",
    tier: "Oro",
    date: "2023-04-15",
    status: "Pagado",
  },
]

export default function PatrocinadoresPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [sponsors, setSponsors] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setSponsors(mockSponsors)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredSponsors = sponsors.filter(
    (sponsor) =>
      sponsor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sponsor.tier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTierColor = (tier) => {
    switch (tier) {
      case "Principal":
        return "bg-blue-100 text-blue-800"
      case "Oro":
        return "bg-yellow-100 text-yellow-800"
      case "Plata":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Patrocinadores</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Añadir Patrocinador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Patrocinadores</CardTitle>
          <CardDescription>Administra los patrocinadores que apoyan al equipo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar patrocinador..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
              <Button variant="outline" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-md">
                  <div className="w-1/4 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/5 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/6 h-5 bg-gray-200 rounded"></div>
                  <div className="w-1/6 h-5 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSponsors.map((sponsor) => (
                    <TableRow key={sponsor.id}>
                      <TableCell className="font-medium">{sponsor.name}</TableCell>
                      <TableCell>
                        <div>{sponsor.email}</div>
                        <div className="text-sm text-muted-foreground">{sponsor.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierColor(sponsor.tier)}>{sponsor.tier}</Badge>
                      </TableCell>
                      <TableCell>{sponsor.amount}</TableCell>
                      <TableCell>{sponsor.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {sponsor.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Enviar correo</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              <span>Ver detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patrocinadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sponsors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,500</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrocinador Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patrocinadores Oro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
