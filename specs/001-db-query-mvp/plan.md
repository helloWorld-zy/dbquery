# Implementation Plan: DB Query Tool MVP

**Branch**: `main` | **Date**: 2026-02-01 | **Spec**: [specs/001-db-query-mvp/spec.md](specs/001-db-query-mvp/spec.md)
**Input**: Feature specification from `/specs/001-db-query-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

交付一个支持 PostgreSQL 与 MariaDB 的数据库查询 Web 应用：连接管理、元数据浏览（含关系）、仅 SELECT 的 SQL 查询、自然语言生成 SQL、结果表格展示与导出；整体采用后端 FastAPI + sqlglot[rs] + Ollama 与前端 React/refine/Ant Design/Tailwind/Monaco，数据元缓存存于本地 SQLite，并通过统一适配器架构为后续多数据库扩展做准备。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.12+（后端，使用实现时的最新稳定版）, Node.js 22+（前端工具链）  
**Primary Dependencies**: FastAPI, SQLAlchemy, sqlglot[rs], Ollama, React 18+, refine, Ant Design, Tailwind, Monaco Editor  
**Storage**: PostgreSQL 与 MariaDB（业务数据源），SQLite（元数据/历史缓存：./db_query/db_query.db）  
**Testing**: pytest（后端 TDD），Vitest + Playwright（前端）  
**Target Platform**: 本地或自托管 Web 应用（Windows/Mac/Linux）  
**Project Type**: Web application（frontend + backend）  
**Performance Goals**: 95% 查询在 30 秒内完成或返回超时，默认返回行数 ≤ 1000  
**Constraints**: 仅 SELECT；自动补 LIMIT 1000；CORS 允许所有 origin；生成 SQL 不自动执行  
**Scale/Scope**: 单用户/无鉴权场景；MVP 覆盖连接、元数据、查询、NL2SQL、导出

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ I. Type Safety First：后端 100% 类型标注（mypy --strict），前端 TS strict，OpenAPI 类型同步。
- ✅ II. API Contract Consistency：RESTful + /api/v1 + camelCase + 统一错误结构。
- ✅ III. Security by Default：仅 SELECT、危险语句禁用、SQL 记录、超时/行数限制。
- ✅ IV. Async-First Architecture：异步查询、流式/分页、连接池管理。
- ✅ V. Test Coverage Standards：pytest + Vitest/Playwright，关键路径覆盖。

### Post-Design Constitution Check (after Phase 1)

- ✅ I. Type Safety First：数据模型与契约采用类型明确的字段结构，满足强类型要求。
- ✅ II. API Contract Consistency：OpenAPI 契约保持 RESTful + /api/v1 + camelCase。
- ✅ III. Security by Default：契约明确只读 SQL 校验与限制，导出与查询分离。
- ✅ IV. Async-First Architecture：设计中保留异步查询与可取消能力。
- ✅ V. Test Coverage Standards：测试策略仍与 TDD 要求一致。

## Project Structure

### Documentation (this feature)

```text
specs/001-db-query-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
backend/
├── src/
│   ├── api/
│   ├── adapters/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── utils/
└── tests/
  ├── integration/
  └── unit/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/
```

**Structure Decision**: 采用 Web application 结构，分离 backend/ 与 frontend/ 以支持独立构建、测试与部署。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified.
