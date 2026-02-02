# Research: DB Query Tool MVP

**Date**: 2026-02-01
**Scope**: Resolve technical decisions and clarify constraints for implementation planning.

## Decision 1: Backend language/runtime
- **Decision**: Python 3.12+（以实现时最新稳定版为准）
- **Rationale**: 与 FastAPI、SQLAlchemy、sqlglot 生态兼容且成熟；异步支持完善。
- **Alternatives considered**: Python 3.11（稳定但非最新），Node.js（与既有约束不匹配）。

## Decision 2: SQL 解析与只读限制
- **Decision**: 使用 sqlglot[rs] 进行解析与只读校验，并在缺失 LIMIT 时自动追加 LIMIT 1000。
- **Rationale**: 解析性能更好，能返回清晰语法错误；同时便于进行 AST 级别的安全限制。
- **Alternatives considered**: sqlparse（不够严格）、直接 regex 检测（不安全）。

## Decision 3: LLM 提供方式
- **Decision**: 使用 ModelScope 推理服务生成 SQL。
- **Rationale**: 提供托管模型能力与稳定的 OpenAI 兼容接口；便于统一接入。
- **Alternatives considered**: 本地 Ollama（需要本地模型与运维）。

## Decision 4: 数据库适配器架构
- **Decision**: 采用“适配器接口 + 能力矩阵”的多数据库架构，MVP 支持 PostgreSQL 与 MariaDB。
- **Rationale**: 保证业务层与具体数据库解耦，便于未来扩展。
- **Alternatives considered**: 直接在服务层硬编码 PostgreSQL（扩展成本高）。

## Decision 5: 元数据缓存与存储
- **Decision**: 元数据与历史记录存储在本地 SQLite，路径为 ./db_query/db_query.db。
- **Rationale**: 本地轻量、易部署，适合单用户场景；避免额外 DB 依赖。
- **Alternatives considered**: 使用内存缓存（重启丢失）、使用外部数据库（复杂度提升）。

## Decision 6: 前端技术栈
- **Decision**: React + refine + Ant Design + Tailwind + Monaco Editor。
- **Rationale**: 符合已有约束；Ant Design 适合表格展示与操作，Monaco 适合 SQL 编辑体验。
- **Alternatives considered**: Material UI、CodeMirror（不符合当前约束）。

## Decision 7: CORS 策略
- **Decision**: 后端开启 CORS 并允许所有 origin。
- **Rationale**: 单用户/本地开发场景下简化配置；后续可引入白名单策略。
- **Alternatives considered**: 限制 origin（配置复杂度更高）。

## Decision 8: 测试策略（TDD）
- **Decision**: 后端采用 pytest 的 TDD 流程，前端采用 Vitest + Playwright（关键路径）。
- **Rationale**: 与宪法要求一致，确保核心查询链路与安全限制可验证。
- **Alternatives considered**: 仅集成测试（覆盖不足）。
