
## Objetivo

Adicionar quatro melhorias na plataforma Puente:
1. Upload de fotos/anexos em cada relato
2. Modo offline (PWA com cache)
3. Filtros de busca aprimorados
4. Nova landing page apresentando a plataforma

---

## 1. Upload de fotos e anexos

**Backend (migration):**
- Criar bucket público `report-attachments` no Storage
- Políticas RLS em `storage.objects`:
  - Leitura pública (qualquer um vê as fotos do relato)
  - INSERT permitido para `anon` e `authenticated` (relatos podem ser anônimos)
- Nova tabela `report_attachments` (id, report_id, storage_path, file_name, mime_type, size_bytes, created_at) com GRANTs e RLS (SELECT público, INSERT anon/auth, DELETE só pelo dono autenticado)

**Frontend:**
- Em `ReportForm.tsx`: campo de upload múltiplo (até 5 imagens, máx 5MB cada), com preview em miniatura, upload direto ao bucket antes do submit do relato, e vinculação dos anexos ao `report_id` criado
- Em `ReportDetail.tsx` e `ReportCard.tsx`: galeria de fotos com lightbox simples (clique amplia)
- Validação de tipo (image/jpeg, image/png, image/webp) e tamanho no cliente
- Compressão básica via canvas antes do upload para reduzir custo de banda em emergências

---

## 2. Modo offline (PWA)

Seguindo o caminho de "offline support" do skill PWA:
- Adicionar `vite-plugin-pwa` com `generateSW`, `registerType: "autoUpdate"`
- Criar wrapper único de registro em `src/lib/pwa-register.ts` com todos os guards exigidos (não registra em dev, iframe, preview Lovable, `?sw=off`)
- Manifest com nome "Puente", ícones (gerar via imagegen a partir da logo existente), `display: standalone`, theme color
- Estratégias de cache:
  - HTML/navegação: `NetworkFirst`
  - Assets hash: `CacheFirst`
  - Tiles do mapa OSM: `CacheFirst` com expiração
  - Excluir `/~oauth`
- Cache local (IndexedDB via `localforage`) dos últimos relatos baixados para visualização offline
- Fila offline: relatos criados sem rede ficam em IndexedDB e são sincronizados quando a conexão volta (com indicador visual "Pendente de sincronização")
- Banner discreto no header indicando "Offline" quando `navigator.onLine === false`

---

## 3. Filtros de busca aprimorados

Em `src/routes/index.tsx`:
- Campo de busca textual (título, descrição, cidade) com debounce
- Filtros existentes (tipo, categoria) + novos:
  - Status (pendente, em andamento, resolvido)
  - Urgência (1-5, slider)
  - Período (últimas 24h, 7 dias, 30 dias, tudo)
  - Distância da minha localização (raio km, requer geolocation)
  - Apenas com fotos
- Botão "Limpar filtros" e contagem de resultados
- Filtros persistidos na URL (query params) para compartilhamento
- Em mobile: filtros em Sheet/Drawer para não ocupar tela

---

## 4. Landing page

Mover o dashboard atual (mapa + lista) de `/` para `/map`. Nova `/` vira landing page institucional bilíngue (ES padrão / EN).

Seções:
- **Hero**: logo + título grande, subtítulo do propósito, CTAs ("Ver mapa", "Reportar necessidade"), imagem de fundo evocativa (gerar)
- **Estatísticas em tempo real**: nº de relatos ativos, necessidades atendidas, voluntários (lidos do DB)
- **Como funciona**: 3 passos (Reportar → Coincidir → Coordenar) com ícones
- **Para quem é**: vítimas, voluntários, ONGs, autoridades — cards
- **Categorias atendidas**: grid com ícones (água, comida, abrigo, médico, resgate, etc.)
- **Emergência**: callout vermelho com link para `/emergency`
- **Sobre**: missão, contexto do terremoto na Venezuela, valores (sem mencionar hackathon)
- **Footer**: links, idioma, contato

Design responsivo, mantendo paleta atual. SEO: `head()` com title/description únicos, og:image gerado, JSON-LD Organization.

Ajustar `Header.tsx` para incluir link "Inicio" (landing) e "Mapa" separados.

---

## Detalhes técnicos

- Migrations: 1 para tabela `report_attachments` + grants/RLS; bucket criado via tool `supabase--storage_create_bucket` (public=true); policies de storage.objects em migration separada
- Server functions: `createAttachment`, `listAttachmentsByReport` em `src/lib/attachments.functions.ts`
- Realtime já ativo no `reports`; adicionar canal para `report_attachments`
- Correção de runtime: erro "window is not defined" no SSR — adicionar guard `typeof window !== "undefined"` ou mover lógica problemática para `useEffect` (provavelmente no novo código de PWA/geolocation)
- Dependências novas: `vite-plugin-pwa`, `workbox-window`, `localforage`
- i18n: adicionar todas as strings novas em ES e EN
- Responsividade mobile mantida (Sheet para filtros, galeria em swipe)

---

## Ordem de implementação

1. Migration: tabela `report_attachments` + bucket + policies
2. Server fns de anexos + upload no `ReportForm` + galeria
3. Landing page nova em `/` + dashboard movido para `/map` + ajuste de header
4. Filtros aprimorados na rota do mapa
5. PWA: plugin, manifest, ícones, wrapper de registro, estratégias de cache
6. Fila offline + cache local de relatos
7. QA: Playwright para verificar landing, upload, filtros e service worker (em build de produção)
