# Feature Specification: DB Query Tool MVP

**Feature Branch**: `main`  
**Created**: 2026-02-01  
**Status**: Draft  
**Input**: User description: "PostgreSQL + MariaDB MVP: connection management, metadata browsing (schema/table/view/column/relations), SELECT-only SQL queries, natural language to SQL, results table display/export; extensible via DB adapters later"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 连接并执行只读查询 (Priority: P1)

用户可以创建并测试 PostgreSQL 连接，选择连接后执行仅包含 SELECT 的查询，并查看结构化结果。

**Why this priority**: 这是产品的最小可用价值，用户必须先能连接并查询数据库。

**Independent Test**: 仅通过创建连接并执行一个 SELECT 查询即可验证完整流程并获得结果表格。

**Acceptance Scenarios**:

1. **Given** 用户提供有效连接信息，**When** 用户保存并测试连接，**Then** 系统显示连接成功状态并可被选择使用。
2. **Given** 用户已选择连接且输入单条 SELECT 查询，**When** 用户执行查询，**Then** 系统在超时限制内返回包含列定义与行数据的结果。
3. **Given** 用户输入非 SELECT 或多语句 SQL，**When** 用户执行查询，**Then** 系统拒绝执行并返回可读错误信息。

---

### User Story 2 - 浏览元数据与关系 (Priority: P2)

用户可以浏览所选连接的 schema、表、视图、列以及关系信息，并查看元数据刷新状态。

**Why this priority**: 元数据可视化是查询编写与理解数据库结构的关键支撑。

**Independent Test**: 仅通过打开元数据浏览与刷新操作即可验证，无需执行查询。

**Acceptance Scenarios**:

1. **Given** 用户已选择连接且存在可用元数据，**When** 用户打开元数据浏览，**Then** 系统展示 schema → table/view → columns 的树形结构。
2. **Given** 用户请求刷新元数据，**When** 刷新完成，**Then** 系统更新元数据并展示最新刷新时间与状态。
3. **Given** 数据库存在外键关系，**When** 用户查看关系视图，**Then** 系统展示表之间的关系信息。

---

### User Story 3 - 自然语言生成 SQL 与结果导出 (Priority: P3)

用户可以用自然语言生成 SQL，并在确认后执行查询与导出结果。

**Why this priority**: 降低 SQL 门槛并支持结果导出，提高可用性与工作效率。

**Independent Test**: 仅通过一次自然语言生成与导出操作即可独立验证。

**Acceptance Scenarios**:

1. **Given** 用户提供自然语言问题与目标 schema/表范围，**When** 用户生成 SQL，**Then** 系统仅返回单条 SELECT SQL。
2. **Given** 用户获得生成的 SQL，**When** 用户未确认执行，**Then** 系统不会自动执行查询。
3. **Given** 用户成功执行查询并获得结果，**When** 用户选择导出，**Then** 系统生成可下载的结果文件。

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- 连接信息无效或权限不足时，系统应返回清晰错误并不保存为可用连接。
- 元数据刷新失败时，系统保留旧缓存并标记失败原因与时间。
- 查询超时或结果超过上限时，系统中止并返回可理解的限制提示。
- 生成的 SQL 不满足只读约束时，系统拒绝执行并引导修正。
- 结果包含二进制或超大字段时，系统以安全方式处理并提示用户。

## Assumptions

- 当前为单用户或无鉴权场景，连接与历史仅对当前用户可见。
- 默认导出格式为 CSV，后续可扩展其他格式。
- 默认最大返回行数为 1000，可在配置中调整。
- 元数据缓存存储在本地 SQLite 文件中，路径固定为 ./db_query/db_query.db。

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: 系统 MUST 允许用户创建、测试、选择与删除 PostgreSQL 与 MariaDB 连接，并展示连接状态与最近使用时间。
- **FR-002**: 系统 MUST 获取并展示 schema、表、视图、列与关系元数据，且可手动刷新并记录刷新状态。
- **FR-003**: 系统 MUST 在执行前校验 SQL，仅允许单条 SELECT（含 CTE）并拒绝任何写入或多语句。
- **FR-004**: 系统 MUST 在缺少 LIMIT 时自动追加默认上限，并在超过最大上限时提供明确提示。
- **FR-005**: 系统 MUST 以结构化结果返回列定义与行数据，并保持时间、数值、空值与二进制数据的安全表示。
- **FR-006**: 系统 MUST 支持查询超时与最大返回行数限制，并在触发时返回清晰错误说明。
- **FR-007**: 系统 MUST 在数据库支持时允许用户取消正在执行的查询，否则提示不支持。
- **FR-008**: 系统 MUST 记录查询历史（SQL、来源、执行时间、耗时、返回行数与错误信息）。
- **FR-009**: 系统 MUST 支持自然语言生成 SQL，输出仅包含 SQL，且使用当前连接的方言语义。
- **FR-010**: 系统 MUST 对生成的 SQL 执行同等校验，且在用户确认前不得执行。
- **FR-011**: 系统 MUST 支持结果导出，并提供成功或失败的明确反馈。
- **FR-012**: 系统 SHOULD 通过统一能力声明支持未来新增数据库类型，而不改变核心用户流程。

### Non-Functional Requirements

- **NFR-001**: 后端 MUST 使用 SQL 解析器对所有 SQL 进行语法检查并限制为单条 SELECT。
- **NFR-002**: 后端 MUST 通过 CORS 允许所有 origin 访问 API。
- **NFR-003**: 自然语言生成 SQL MUST 使用 ModelScope 推理服务提供支持。
- **NFR-004**: 前端 MUST 使用 Monaco Editor 作为 SQL 编辑器。
- **NFR-005**: 前端 MUST 使用 React + refine + Ant Design + Tailwind 作为 UI 技术栈。

### Key Entities *(include if feature involves data)*

- **Connection**: 连接配置与状态（名称、类型、创建时间、最近使用、测试结果）。
- **MetadataSnapshot**: 元数据快照（schema、表、视图、列、关系与刷新状态）。
- **Schema**: 逻辑命名空间，包含表与视图集合。
- **Table/View**: 数据结构对象，包含列与约束信息。
- **Column**: 字段定义（名称、类型、可空、默认值、注释）。
- **Relationship**: 表之间的外键关系与关联信息。
- **QueryRequest**: 用户查询请求（SQL、来源、限制参数）。
- **QueryResult**: 查询返回（列定义、行数据、执行摘要）。
- **QueryHistory**: 查询历史记录（时间、耗时、行数、错误）。
- **SqlGenerationRequest**: 自然语言生成请求（问题、上下文范围）。
- **ExportArtifact**: 导出结果文件及其状态。

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 新用户在 5 分钟内完成连接创建并成功执行首个查询。
- **SC-002**: 95% 的查询在 30 秒内返回结果或明确的超时提示（结果不超过 1000 行）。
- **SC-003**: 90% 的自然语言生成请求在首次尝试时输出可通过校验的 SELECT SQL。
- **SC-004**: 结果导出在 60 秒内完成且成功率达到 99%（结果不超过 1000 行）。
