# Puente Venezuela

Plataforma web de coordenação humanitária construída para o hackathon [Build4Venezuela](https://build4venezuela.com/en), após os terremotos de 24 de junho de 2026 na Venezuela.

## O que faz

Conecta em tempo real quem precisa de ajuda com quem pode oferecer ajuda:

- **Mapa interativo** com pins de necessidades e ofertas de ajuda
- **Relatos rápidos** — qualquer pessoa pode reportar uma necessidade ou oferta, sem precisar criar conta
- **Filtros por categoria** — água, comida, abrigo, medicamentos, resgate, voluntários, transporte
- **Status em tempo real** — pendente, em andamento ou resolvido
- **Design responsivo** — funciona em celular e desktop

## Tecnologia

- **Frontend**: React 19 + TanStack Start + Tailwind CSS v4
- **Backend**: Lovable Cloud (PostgreSQL + server functions)
- **Mapa**: Leaflet + OpenStreetMap
- **Deploy**: Preview automático da Lovable

## Como rodar localmente

```bash
# Instalar dependências
bun install

# Rodar dev server
bun dev
```

## Como usar

1. Abra o app no navegador
2. Veja no mapa as necessidades (vermelho) e ofertas de ajuda (verde)
3. Use os filtros para encontrar o que precisa
4. Clique em **Relatar** para adicionar uma nova necessidade ou oferta
5. Preencha o formulário com título, categoria, localização e contato

## Estrutura do banco

Tabela `reports`:
- `type`: need | offer
- `category`: water | food | shelter | medicine | rescue | volunteer | transport | other
- `title`, `description`
- `latitude`, `longitude`, `location_name`
- `contact_name`, `contact_phone`, `contact_email`
- `status`: pending | in_progress | resolved
- `urgency`: 1 a 5

## Dados demo

A base já vem preenchida com 10 relatos reais de demonstração em cidades venezuelanas afetadas (Caracas, Maracaibo, Valencia, Los Teques).

## Licença

Código aberto para uso humanitário.
