# OLHOS DE DEUS

## A visão inteligente de Moçambique

**OLHOS DE DEUS** é uma plataforma de consciência situacional nacional baseada em dados públicos e fontes explicitamente autorizadas.

O objetivo é transformar sinais dispersos — clima, sismos, incêndios, aviação, atividade marítima, notícias, alertas e outras fontes legítimas — numa visão operacional única, verificável e geográfica.

> **Ver. Compreender. Antecipar. Agir.**

## Princípio fundamental

OLHOS DE DEUS não é uma ferramenta de vigilância privada. A plataforma segue um modelo **public-and-authorized-data**:

- apenas APIs públicas, datasets abertos e transmissões/câmaras explicitamente públicas;
- fontes institucionais apenas quando houver autorização;
- cada evento deve manter origem, momento de recolha e termos/licença quando disponíveis;
- não recolhe contas privadas, credenciais vazadas, dados pessoais não públicos nem acessa câmaras sem autorização;
- observação e interpretação são separadas: um sinal não é automaticamente uma conclusão.

## Command Center

A rota `/olhos` é o centro nacional da plataforma. Ela apresenta:

- globo 3D interactivo baseado em MapLibre;
- foco inicial em Moçambique;
- camadas nacionais activáveis;
- estado `LIVE`, `SYNCING` ou `DEGRADED`;
- contagem real de eventos por camada;
- detalhe e proveniência de eventos;
- actualização automática do quadro nacional;
- governação de fontes visível na interface.

MapLibre suporta a projecção `globe` e renderização WebGL para mapas interactivos. Consulte a documentação oficial para detalhes da projecção. 

## Arquitectura

```text
┌─────────────────────────────────────────────┐
│              OLHOS DE DEUS UI               │
│       Command Center · Globe · Layers       │
├─────────────────────────────────────────────┤
│             Normalized Event Model           │
│  source · observedAt · location · severity  │
├─────────────────────────────────────────────┤
│               Next.js API Routes              │
│ /api/olhos/overview                          │
│ /api/olhos/earthquakes                       │
│ /api/olhos/weather                           │
├─────────────────────────────────────────────┤
│          Public / Authorized Sources          │
│ USGS · Open-Meteo · NASA FIRMS · ...        │
└─────────────────────────────────────────────┘
```

## Dados actualmente integrados

### Sismos — USGS

O adaptador usa o feed GeoJSON público de sismos M2.5+ e filtra os eventos pelo território definido para Moçambique. Os eventos são normalizados para o contrato de inteligência do projecto.

### Meteorologia — Open-Meteo

O centro nacional consulta condições actuais para o centro geográfico de Moçambique. A API oferece condições actuais e previsões através de modelos meteorológicos globais; a documentação publicada pela Open-Meteo indica licença CC BY 4.0 para os dados/API públicos. 

### Incêndios — NASA FIRMS

A estrutura do adaptador FIRMS está preparada, mas a ingestão programática depende de uma chave `FIRMS_MAP_KEY`. Sem essa credencial, a plataforma não inventa hotspots: a fonte permanece indisponível.

## Camadas previstas

| Camada | Estado |
|---|---|
| Alertas | estrutura pronta |
| Clima | **integrado** |
| Desastres | estrutura pronta |
| Incêndios | adaptador preparado / chave necessária |
| Sismos | **integrado** |
| Aviação | integração futura |
| Marítimo | integração futura / feed autorizado |
| Câmaras públicas | catálogo público/autorizado |
| Notícias | integração futura |
| Satélites | integração futura |

A ausência de uma fonte não é substituída por dados simulados.

## API nacional

`GET /api/olhos/overview` devolve um snapshot normalizado com:

- país e área operacional;
- timestamp de geração;
- fontes disponíveis;
- eventos;
- contagens por camada;
- saúde dos feeds.

`GET /api/olhos/earthquakes` devolve eventos sísmicos filtrados para Moçambique.

`GET /api/olhos/weather` devolve condições meteorológicas actuais para o centro nacional.

## Modelo de evento

Cada evento segue, em essência:

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

A proveniência faz parte do produto, não é um detalhe opcional.

## Desenvolvimento

```bash
git clone https://github.com/khossastudio-commits/OlhosDeDeus.git
cd OlhosDeDeus
npm install
npm run dev
```

Depois, abra `http://localhost:3000/olhos`.

## Variáveis de ambiente

A regra é simples: **segredos ficam no servidor e nunca no cliente**.

```env
# Opcional — necessário para ingestão programática NASA FIRMS
FIRMS_MAP_KEY=
```

Outras integrações podem adicionar credenciais próprias quando forem oficialmente autorizadas.

## Próximas integrações

1. NASA FIRMS com chave server-side.
2. Alertas meteorológicos e hidrológicos relevantes para Moçambique.
3. Fontes de aviação com limites de uso claros.
4. Dados marítimos através de fornecedor autorizado.
5. Catálogo de webcams/câmaras que sejam inequivocamente públicas.
6. Notícias com RSS/API e geolocalização responsável.
7. Motor de correlação para ligar eventos relacionados.
8. Camada de IA para produzir resumos com fontes e nível de confiança.
9. Histórico temporal e replay de eventos.
10. Integrações institucionais apenas através de acordos e APIs autorizadas.

## Segurança

Este projecto herda uma base OSINT open-source, mas a versão OLHOS DE DEUS deve permanecer orientada a consciência situacional defensiva, dados públicos e integrações autorizadas. Funcionalidades de intrusão, acesso não autorizado ou recolha de dados privados não fazem parte do produto nacional.

## Licença

O projecto mantém a licença MIT do código-base open-source. Consulte `LICENSE` para os termos completos.

---

**OLHOS DE DEUS**  
**Observação · Localização · Inteligência · Operacional · Situacional**
