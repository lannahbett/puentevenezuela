# Plano: Plataforma de Coordenação Humanitária para Venezuela

## Contexto
O hackathon Build4Venezuela busca soluções tecnológicas após terremotos que causaram 188+ mortes e 1.500+ feridos. Conectividade instável, desinformação e falta de coordenação entre ajuda e necessidades são os gargalos críticos.

## O que vamos pesquisar e construir

### Fase 1 — Pesquisa de soluções eficientes (rápida)
Investigar o que funciona em desastres reais:
- Plataformas de crowdsourcing de necessidades (Ushahidi, Sahana Eden)
- Mapas colaborativos de danos e pontos de ajuda (OpenStreetMap + HOT)
- PWA offline-first para comunicação em áreas sem internet
- Sistemas de matching entre doadores e necessidades locais

### Fase 2 — Análise do que já existe no hackathon
Revisar os projetos já publicados para evitar duplicação e identificar lacunas:
- VenezuelaSOS (IA + offline, foco em desaparecidos)
- Sismicaid (relatos e pontos de ajuda)
- Venezuela Ayuda (coordenação comunitária)
- Venezuela Earthquake Map (heatmap)

### Fase 3 — Proposta de solução: "Puente" (nome provisório)
Uma plataforma web focada em **conectar quem precisa com quem pode ajudar**, em tempo real, mesmo com internet intermitente.

#### Funcionalidades principais
1. **Mapa interativo de necessidades e ofertas**
   - Pins de necessidade (água, comida, abrigo, medicamentos, resgate)
   - Pins de oferta (doadores, centros de distribuição, voluntários)
   - Filtros por tipo e urgência

2. **Relatos rápidos (funciona offline)**
   - Formulário simplificado para quem está no local reportar necessidades
   - Salva localmente e sincroniza quando online
   - Fotos georreferenciadas (quando possível)

3. **Matching inteligente**
   - Notifica quando uma oferta corresponde a uma necessidade próxima
   - Status de "em andamento" / "atendido" para evitar duplicidade

4. **Painel de transparência**
   - Visão geral de necessidades atendidas vs. pendentes por região
   - Dados abertos para ONGs e governos

#### Tecnologia
- TanStack Start (full-stack React) com PWA capabilities
- Lovable Cloud (PostgreSQL + auth) para persistência e sync
- Mapa: Leaflet ou MapLibre (open source, não precisa de API key)
- Offline: Service Worker + IndexedDB para queue de sync

## Por que isso é eficiente
- **Coordenação > Informação pura**: Mapas e relatos existem, mas a conexão entre oferta e demanda ainda é manual.
- **Offline-first**: Crítico para zonas de desastre com infraestrutura comprometida.
- **Leve e rápido**: Prioriza velocidade de uso sobre features pesadas.

## Entregáveis
- Aplicação web funcional com mapa, relatos e matching
- Deploy funcional no preview da Lovable
- README com instruções de uso para o hackathon

## Notas técnicas
- Design responsivo (muitos usuários estarão em mobile)
- Sem necessidade de OAuth social — cadastro rápido por telefone/email
- Dados públicos (não requer auth para ver mapa), mas relatos verificados por moderação comunitária