import { createFileRoute } from "@tanstack/react-router";
import { Heart, MapPin, Users, Radio } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre — Puente Venezuela" },
      { name: "description", content: "Plataforma de coordenação humanitária para o hackathon Build4Venezuela." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <Heart className="mx-auto h-10 w-10 text-destructive mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Puente Venezuela</h1>
          <p className="mt-2 text-muted-foreground">
            Construído com urgência para o hackathon Build4Venezuela
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">O que é esta plataforma?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Puente Venezuela é uma plataforma web de coordenação humanitária criada para conectar
              pessoas afetadas pelos terremotos de 24 de junho na Venezuela com quem pode ajudar.
              Nosso foco é tornar visível — em tempo real e no mapa — as necessidades reais e as
              ofertas de ajuda, reduzindo o desperdício de recursos e acelerando o socorro.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Como funciona</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center p-4">
                <MapPin className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-medium text-foreground">Mapeie</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Relate necessidades ou ofertas de ajuda diretamente no mapa.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Users className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-medium text-foreground">Conecte</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Doadores e voluntários encontram quem precisa de ajuda na mesma região.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <Radio className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-medium text-foreground">Acompanhe</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Status em tempo real: pendente, em andamento ou resolvido.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">Sobre o hackathon</h2>
            <p className="text-muted-foreground leading-relaxed">
              O <a href="https://build4venezuela.com/en" target="_blank" rel="noopener noreferrer" className="underline text-primary">Build4Venezuela</a>{" "}
              é um hackathon humanitário global realizado nos dias 26, 27 e 28 de junho de 2026.
              Os terremotos que atingiram a Venezuela em 24 de junho causaram mais de 188 mortes
              e 1.500 feridos. Equipes de resgate ainda buscam sobreviventes, e comunidades inteiras
              precisam de apoio. Tecnologia, usada com urgência e sem ruído, pode ser uma forma de solidariedade.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">Dados e privacidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos os relatos são públicos para maximizar a visibilidade das necessidades.
              Informações de contato são opcionais e de responsabilidade de quem publica.
              Não armazenamos dados sensíveis de saúde ou documentos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
