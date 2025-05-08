import { AdminTools } from "@/components/admin-tools"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Herramientas de Administración</h1>
        <p className="text-muted-foreground">
          Herramientas avanzadas para administrar la aplicación y la base de datos.
        </p>
      </div>

      <AdminTools />
    </div>
  )
}
