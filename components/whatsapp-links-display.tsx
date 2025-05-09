"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhoneIcon as WhatsappIcon, Copy, ExternalLink, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WhatsAppLink {
  name: string
  phone: string
  link: string
}

interface WhatsAppLinksDisplayProps {
  links: WhatsAppLink[]
  onClose?: () => void
}

export function WhatsAppLinksDisplay({ links, onClose }: WhatsAppLinksDisplayProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("list")

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    toast({
      title: "Enlace copiado",
      description: "El enlace ha sido copiado al portapapeles.",
    })
  }

  const handleCopyAllLinks = () => {
    const allLinks = links.map((link) => `${link.name} (${link.phone}): ${link.link}`).join("\n\n")
    navigator.clipboard.writeText(allLinks)
    toast({
      title: "Enlaces copiados",
      description: "Todos los enlaces han sido copiados al portapapeles.",
    })
  }

  const handleOpenLink = (link: string) => {
    window.open(link, "_blank")
  }

  if (links.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Enlaces de WhatsApp</CardTitle>
          <CardDescription>No hay enlaces de WhatsApp disponibles.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Enlaces de WhatsApp</CardTitle>
          <CardDescription>
            {links.length} {links.length === 1 ? "enlace disponible" : "enlaces disponibles"}
          </CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="bulk">Envío masivo</TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {links.map((link, index) => (
                  <Card key={index}>
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{link.name}</CardTitle>
                      <CardDescription>{link.phone}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-3 pt-0 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleCopyLink(link.link)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                      <Button variant="default" size="sm" onClick={() => handleOpenLink(link.link)}>
                        <WhatsappIcon className="h-3 w-3 mr-1" />
                        Abrir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="bulk">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Envío masivo</CardTitle>
                  <CardDescription>
                    Copia todos los enlaces o ábrelos uno por uno para enviar mensajes a todos los participantes.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleCopyAllLinks}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar todos
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="default">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir enlaces
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Abrir enlaces de WhatsApp</DialogTitle>
                        <DialogDescription>
                          Haz clic en cada enlace para abrirlo en una nueva pestaña.
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="space-y-2">
                          {links.map((link, index) => (
                            <div key={index} className="flex justify-between items-center p-2 border-b">
                              <div>
                                <p className="font-medium">{link.name}</p>
                                <p className="text-sm text-muted-foreground">{link.phone}</p>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleOpenLink(link.link)}>
                                <WhatsappIcon className="h-3 w-3 mr-1" />
                                Abrir
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="default" onClick={() => setActiveTab(activeTab === "list" ? "bulk" : "list")}>
          {activeTab === "list" ? "Ver envío masivo" : "Ver lista"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Componente de icono de WhatsApp
// function WhatsappIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       {...props}
//     >
//       <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
//       <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
//       <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
//       <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
//     </svg>
//   )
// }
