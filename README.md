# OLHOS DE DEUS

## A visão inteligente de Moçambique

**OLHOS DE DEUS** é uma plataforma de consciência situacional nacional baseada em dados públicos e fontes explicitamente autorizadas.

> **Ver. Compreender. Antecipar. Agir.**

A plataforma agrega sinais dispersos — clima, sismos, incêndios, aviação, desastres, notícias e, mediante autorização, dados marítimos, câmaras públicas e satélites — num modelo geográfico único com proveniência e estado de saúde dos feeds.

## Princípio fundamental

- apenas APIs públicas, datasets abertos e transmissões/câmaras inequivocamente públicas;
- fontes institucionais apenas com autorização;
- cada evento mantém origem, timestamp, localização quando disponível e termos/licença quando disponíveis;
- sem contas privadas, credenciais vazadas, PII não pública ou acesso não autorizado a câmaras/sistemas;
- **observação ≠ interpretação**: alertas derivados são claramente identificados e exigem validação humana antes de decisões operacionais.

## Command Center

A rota `/olhos` apresenta:

- globo 3D interactivo com MapLibre/WebGL;
- foco inicial em Moçambique;
- camadas nacionais activáveis;
- estado `LIVE`, `SYNCING` ou `DEGRADED`;
- contagem real de eventos por camada;
- painel de situação e detalhe de eventos;
- alertas derivados de sinais públicos críticos/warning;
- proveniência da fonte e link de origem;
- sincronização automática.

MapLibre GL JS suporta projecção globe e renderização WebGL para mapas interactivos. citeturn0search14turn0search11

## Arquitectura

```text
Public / Authorized Data Sources
            ↓
      Feed Adapters
            ↓
 Normalized Intelligence Events
            ↓
        Next.js API
            ↓
 National Situation Snapshot
            ↓
   3D Globe + Situation UI
            ↓
 Derived Alerts / Future AI Layer
```

## Dados integrados

| Camada | Fonte | Estado |
|---|---|---|
| Sismos | USGS GeoJSON | **live** |
| Clima | Open-Meteo | **live** |
| Incêndios | NASA FIRMS | chave server-side opcional |
| Aviação | OpenSky Network | **live**, sujeito a limites do fornecedor |
| Desastres | GDACS | **live** |
| Notícias | GDELT | **live** |
| Alertas | derivados de eventos públicos | **live quando existem sinais elegíveis** |
| Marítimo | fornecedor AIS autorizado | integração opcional |
| Câmaras | catálogo público/autorizado | integração opcional |
| Satélites | fornecedor autorizado/N2YO | integração opcional |

O USGS recomenda os feeds GeoJSON em tempo real para aplicações automatizadas e os seus feeds são actualizados frequentemente. citeturn0search0turn0search13

O GDACS disponibiliza feeds e APIs de dados de desastres, incluindo eventos geoespaciais, com actualizações frequentes. citeturn1search3turn1search36

O GDELT DOC 2.0 disponibiliza pesquisa de notícias com saída JSON e listas de artigos, permitindo construir a camada de notícias OSINT. citeturn1search0

O OpenSky disponibiliza uma API REST para estados de aeronaves; limites e autenticação devem ser respeitados conforme a política actual do fornecedor. citeturn1search2turn1search6

## APIs

```text
GET /api/olhos/status
GET /api/olhos/health
GET /api/olhos/overview
GET /api/olhos/earthquakes
GET /api/olhos/aviation
GET /api/olhos/disasters
GET /api/olhos/news
```

`/api/olhos/overview` devolve um snapshot nacional com país, camadas, fontes, eventos, contagens, saúde dos feeds, integrações opcionais e regras de governação.

## Modelo de evento

```ts
{
  id,
  layer,
  title,
  summary,
  severity,
  observedAt,
  location,
  source,
  confidence,
  tags
}
```

A proveniência faz parte do produto.

## Variáveis de ambiente

Segredos ficam **apenas no servidor**. Consulte `.env.example`.

Principais integrações opcionais:

```env
FIRMS_API_KEY=
OPENSKY_CLIENT_ID=
OPENSKY_CLIENT_SECRET=
AISSTREAM_API_KEY=
N2YO_API_KEY=
PUBLIC_CAMERA_FEED_URL=
```

Nunca use `NEXT_PUBLIC_` para estas credenciais.

## Desenvolvimento

```bash
git clone https://github.com/khossastudio-commits/OlhosDeDeus.git
cd OlhosDeDeus
npm ci
npm run dev
```

Abra `/olhos`.

## CI

O repositório inclui GitHub Actions para executar `npm ci`, lint e build em pushes para `master` e pull requests.

## Estado de implementação

A base nacional já possui o contrato normalizado de inteligência, registry de fontes, agregador multi-feed, health endpoint, adapters para USGS/Open-Meteo/NASA FIRMS/OpenSky/GDACS/GDELT, alertas derivados, Command Center e governação explícita.

As integrações marítima, câmaras e satélites permanecem deliberadamente condicionadas a fornecedores/fontes autorizados. **Não há dados simulados para preencher essas camadas.**

## Segurança e governação

OLHOS DE DEUS é uma plataforma de consciência situacional defensiva. Não inclui intrusão, recolha de credenciais, acesso não autorizado, vigilância privada ou tratamento de dados pessoais não públicos.

## Licença

O código-base open-source mantém a licença MIT original. Consulte `LICENSE`.

---

**OLHOS DE DEUS**  
**Observação · Localização · Inteligência · Operacional · Situacional**
