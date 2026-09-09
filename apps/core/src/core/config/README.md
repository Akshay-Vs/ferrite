# Ferrite Core Config System

Configuration system powered by **Cosmiconfig**, **Zod**, and **NestJS ConfigModule**.

---

## 1. Resolution Priority

High → Low precedence:

1. **Environment Variables**
   - Direct match (e.g. `PORT`, `ORIGIN_URL`)
   - `FERRITE_` prefix fallback (e.g. `FERRITE_PORT`)
   - Nested dot-notation mapping (`OBSERVABILITY_INSTRUMENTATION` → `observability.instrumentation`)
2. **Config Files (Cosmiconfig)**
   - `ferrite-core.config.ts` (native Bun loader)
   - `ferrite-core.config.js` / `.cjs`
   - `.ferrite-corerc.json` / `.yaml` / `.yml`
   - `package.json` (`"ferrite-core"` key)
3. **Zod Schema Defaults**
   - Defined in `ferrite.schema.ts` & domain schemas (`storefrontAuth`)

---

## 2. Config Lifecycle

```
process.env → Cosmiconfig search → Merge overrides → Zod safeParse → ConfigService ('ferrite')
```

- **Pre-Bootstrap (OTel Instrumentation):**
  `instrumentation.ts` executes **before** NestJS bootstrap. Reads `process.env.OBSERVABILITY_INSTRUMENTATION` directly.
- **Post-Bootstrap (NestJS DI):**
  `FerriteConfigModule` loads `ferriteConfig`. Services inject `ConfigService` to read `ferriteConfig.KEY`.

---

## 3. Observability Toggles

| Env Variable | Config Path | Default | Effect |
|--------------|-------------|---------|--------|
| `OBSERVABILITY_INSTRUMENTATION` | `observability.instrumentation` | `true` | OTel NodeSDK auto-instrumentation & exporters |
| `OBSERVABILITY_TRACER` | `observability.tracer` | `true` | Custom application spans (`TracerService`) |
| `OBSERVABILITY_LOGGER_LOKI` | `observability.logger.loki` | `true` | Remote HTTP log push to Grafana Loki |
| `OBSERVABILITY_LOGGER_TTY` | `observability.logger.tty` | `true` | Console pino-pretty log output |

---

## 4. TypeScript Config Example

File: `ferrite-core.config.ts`

```ts
import type { FerriteConfig } from './src/core/config/ferrite.schema';

const config: Partial<FerriteConfig> = {
  port: 4000,
  observability: {
    instrumentation: true,
    tracer: true,
    logger: {
      loki: true,
      tty: true,
    },
  },
};

export default config;
```
