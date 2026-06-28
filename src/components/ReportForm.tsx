import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReport, type listReports } from "@/lib/reports.functions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

type ReportRow = Awaited<ReturnType<typeof listReports>>[number];

const categories = [
  { value: "water", label: "Água" },
  { value: "food", label: "Comida" },
  { value: "shelter", label: "Abrigo" },
  { value: "medicine", label: "Medicamentos" },
  { value: "rescue", label: "Resgate" },
  { value: "volunteer", label: "Voluntário" },
  { value: "transport", label: "Transporte" },
  { value: "other", label: "Outro" },
];

interface ReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultLat?: number;
  defaultLng?: number;
}

export function ReportForm({ open, onOpenChange, defaultLat, defaultLng }: ReportFormProps) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<"need" | "offer">("need");
  const [category, setCategory] = useState("water");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState(defaultLat?.toString() ?? "10.48");
  const [longitude, setLongitude] = useState(defaultLng?.toString() ?? "-66.9");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [urgency, setUrgency] = useState("3");

  const mutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Relato enviado com sucesso!");
      resetForm();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar relato");
    },
  });

  function resetForm() {
    setTitle("");
    setDescription("");
    setLocationName("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    setUrgency("3");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error("Coordenadas inválidas");
      return;
    }
    mutation.mutate({
      type,
      category: category as any,
      title,
      description: description || undefined,
      latitude: lat,
      longitude: lng,
      location_name: locationName || undefined,
      contact_name: contactName || undefined,
      contact_phone: contactPhone || undefined,
      contact_email: contactEmail || undefined,
      urgency: parseInt(urgency, 10),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Relato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "need" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setType("need")}
            >
              Necessidade
            </Button>
            <Button
              type="button"
              variant={type === "offer" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setType("offer")}
            >
              Oferta de Ajuda
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Família precisa de água potável"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da necessidade ou oferta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input id="latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input id="longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationName">Nome do local</Label>
            <Input
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ex: Caracas, El Hatillo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgência (1-5)</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="urgency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Baixa</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3 — Média</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 — Crítica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Nome de contato</Label>
            <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefone</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Enviando..." : "Enviar Relato"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
