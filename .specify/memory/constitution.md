<!--
===================== SYNC IMPACT REPORT =====================
Version change: N/A → 1.0.0 (Initial ratification)
Modified principles: N/A (New document)
Added sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Quality Gates
  - Governance
Removed sections: N/A
Templates requiring updates:
  - plan-template.md: ✅ Compatible (Constitution Check section exists)
  - spec-template.md: ✅ Compatible (Requirements align with principles)
  - tasks-template.md: ✅ Compatible (Phase structure supports principles)
Follow-up TODOs: None
==============================================================
-->

# DB Query Tool Constitution

## Core Principles

### I. Type Safety First (NON-NEGOTIABLE)

- 后端 Python 代码类型标注覆盖率 MUST 达到 100%，使用 `mypy --strict` 检查
- 前端 MUST 启用 TypeScript strict 模式，禁止使用 `any` 类型
- 前后端类型 MUST 通过 OpenAPI Schema 自动同步，禁止前端手动重复定义后端类型
- Pydantic 模型 MUST 使用 `Field()` 提供字段描述和验证规则

**Rationale**: 数据库查询工具处理敏感数据，类型安全是防止运行时错误和数据泄露的第一道防线。

### II. API Contract Consistency

- API 端点 MUST 遵循 RESTful 风格，资源名使用复数形式、kebab-case
- 所有 API 路径 MUST 以 `/api/v1` 为基础路径
- 请求体和响应体 MUST 使用 JSON 格式，所有字段使用 camelCase
- 错误响应 MUST 使用统一结构：`{ "error": { "code": "ERROR_CODE", "message": "...", "details": {} } }`
- HTTP 状态码 MUST 正确使用：400 客户端错误、500 服务端错误、422 验证失败

**Rationale**: 一致的 API 契约降低前后端集成成本，提高开发效率和代码可维护性。

### III. Security by Default

- 生成的 SQL 默认 MUST 只允许 SELECT 语句
- INSERT/UPDATE/DELETE 操作 MUST 需要用户明确确认后才能开启
- DROP、TRUNCATE、ALTER 等危险操作 MUST 被禁止
- 数据库连接密码 MUST 加密存储，敏感字段在响应中 MUST 脱敏或排除
- 所有执行的 SQL 语句 MUST 被记录用于审计
- 查询 MUST 设置超时时间（默认 30 秒）和返回行数限制（默认 1000 行）

**Rationale**: 数据库查询工具直接操作用户数据，安全措施防止误操作和恶意攻击。

### IV. Async-First Architecture

- 数据库查询操作 MUST 使用异步方式执行，避免阻塞
- 前端服务端数据 MUST 通过 React Query 管理，利用缓存和自动刷新机制
- 大结果集 MUST 支持流式返回或分页处理
- 长时间未使用的连接 MUST 自动释放，应用关闭时 MUST 优雅关闭所有连接

**Rationale**: 异步架构确保应用在高负载下保持响应性，提升用户体验。

### V. Test Coverage Standards

- API 端点 MUST 编写集成测试，覆盖正常和异常场景
- 关键业务逻辑 MUST 编写单元测试
- 数据库相关测试 MUST 使用 SQLite 内存数据库或 testcontainers
- 关键交互流程 SHOULD 使用 Playwright 进行 E2E 测试
- 组件测试 MUST 关注用户行为而非实现细节

**Rationale**: 充分的测试覆盖确保代码质量，减少回归问题，支持持续重构。

## Technology Stack

### Backend

- **框架**: FastAPI + Pydantic，自动生成 OpenAPI 文档
- **数据库抽象**: SQLAlchemy，支持 PostgreSQL、MySQL、SQLite、SQL Server
- **代码质量**: Ruff (格式化 + lint), mypy --strict
- **测试**: pytest
- **LLM 集成**: OpenAI API 或兼容接口，API Key 通过环境变量配置

### Frontend

- **框架**: React 18+ + TypeScript strict mode
- **状态管理**: React Query (服务端状态) + Zustand (客户端状态)
- **代码编辑器**: Monaco Editor 或 CodeMirror (SQL 语法高亮)
- **代码质量**: ESLint + Prettier
- **测试**: Vitest (单元测试) + Playwright (E2E 测试)

### Naming Conventions

| 上下文 | 规则 | 示例 |
|--------|------|------|
| 变量/函数 | camelCase | `getUserConnections`, `queryResult` |
| 类/类型 | PascalCase | `ConnectionResponse`, `QueryService` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT`, `MAX_ROWS` |
| 文件名 (前端) | kebab-case | `query-editor.tsx`, `connection-list.tsx` |
| 文件名 (后端) | snake_case | `query_service.py`, `connection_model.py` |

## Quality Gates

### Code Review Requirements

- 所有代码变更 MUST 通过 PR 提交并经过 review
- PR MUST 通过所有自动化检查（lint、type check、tests）
- PR MUST 验证是否符合本宪法中的原则

### Documentation Requirements

- README MUST 包含项目简介、快速开始、环境变量说明
- API 文档由 FastAPI 自动生成，Pydantic 模型描述 MUST 完整
- 复杂业务逻辑 MUST 在代码注释中说明设计决策
- CHANGELOG MUST 记录版本变更

### Pre-Merge Checklist

- [ ] 类型检查通过 (mypy --strict / tsc --strict)
- [ ] Lint 检查通过 (Ruff / ESLint)
- [ ] 所有测试通过
- [ ] API 变更已更新 OpenAPI Schema
- [ ] 敏感信息已脱敏处理
- [ ] SQL 安全限制已验证

## Governance

- 本宪法优先于所有其他开发实践和约定
- 宪法修订 MUST 包含：变更说明、版本号更新、影响评估
- 复杂性偏离 MUST 在 PR 中明确说明理由和被拒绝的更简单替代方案
- 参考 `constitution_guide.md` 获取详细的开发指导

**Version**: 1.0.0 | **Ratified**: 2026-02-01 | **Last Amended**: 2026-02-01
