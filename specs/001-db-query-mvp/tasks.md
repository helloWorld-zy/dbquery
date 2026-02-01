---

description: "Task list for DB Query Tool MVP"
---

# Tasks: DB Query Tool MVP

**Input**: Design documents from `/specs/001-db-query-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD required by user. All user story phases include test-first tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend project scaffolding in backend/ (app layout, package init)
- [ ] T002 Create frontend project scaffolding in frontend/ (React + refine)
- [ ] T003 [P] Configure backend tooling in backend/pyproject.toml (ruff, mypy, pytest)
- [ ] T004 [P] Configure frontend tooling in frontend/package.json (eslint, prettier, vitest, playwright)
- [ ] T005 [P] Add environment config templates in backend/.env.example and frontend/.env.example
- [ ] T006 [P] Add root README quickstart references in README.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T007 Define base Pydantic models with camelCase aliasing in backend/src/models/base.py
- [ ] T008 Define unified error response model in backend/src/models/errors.py
- [ ] T009 [P] Implement request ID middleware in backend/src/utils/request_id.py
- [ ] T010 [P] Implement structured logging setup in backend/src/utils/logging.py
- [ ] T011 Implement CORS configuration allowing all origins in backend/src/api/app.py
- [ ] T012 Define adapter interfaces and capability matrix in backend/src/adapters/base.py
- [ ] T013 Implement SQLite repository base and connection in backend/src/repositories/sqlite.py
- [ ] T014 Create metadata repository schema in backend/src/repositories/metadata_repo.py
- [ ] T015 Create query history repository in backend/src/repositories/history_repo.py
- [ ] T016 Create shared config loader in backend/src/utils/settings.py
- [ ] T017 Add API router skeleton in backend/src/api/router.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 连接并执行只读查询 (Priority: P1) 🎯 MVP

**Goal**: 连接管理与只读查询执行，返回结构化 JSON 结果。

**Independent Test**: 通过创建连接并执行一个 SELECT 查询验证端到端链路。

### Tests for User Story 1 (TDD)

- [ ] T018 [P] [US1] Contract test for connections API in backend/tests/contract/test_connections.py
- [ ] T019 [P] [US1] Contract test for query API in backend/tests/contract/test_query.py
- [ ] T020 [P] [US1] Unit test for SQL validator (SELECT-only + limit) in backend/tests/unit/test_sql_validator.py
- [ ] T021 [P] [US1] Integration test for query execution in backend/tests/integration/test_query_execution.py
- [ ] T022 [P] [US1] Frontend component test for connection form in frontend/tests/connection-form.test.tsx

### Implementation for User Story 1

- [ ] T023 [P] [US1] Implement SQL validator using sqlglot[rs] in backend/src/services/sql_validator.py
- [ ] T024 [P] [US1] Add query execution service (timeout/maxRows) in backend/src/services/query_service.py
- [ ] T025 [P] [US1] Implement PostgreSQL adapter in backend/src/adapters/postgres_adapter.py
- [ ] T026 [P] [US1] Implement MariaDB adapter in backend/src/adapters/mariadb_adapter.py
- [ ] T027 [P] [US1] Implement connection service in backend/src/services/connection_service.py
- [ ] T028 [US1] Add connection APIs in backend/src/api/connections.py
- [ ] T029 [US1] Add query API in backend/src/api/query.py
- [ ] T030 [US1] Wire routes in backend/src/api/router.py
- [ ] T031 [P] [US1] Create connection management page in frontend/src/pages/connections.tsx
- [ ] T032 [P] [US1] Create query workspace page shell in frontend/src/pages/workspace.tsx
- [ ] T033 [P] [US1] Implement API client for connections in frontend/src/services/connections.ts
- [ ] T034 [P] [US1] Implement API client for query in frontend/src/services/query.ts
- [ ] T035 [US1] Render query results table in frontend/src/components/query-results-table.tsx
- [ ] T036 [US1] Add SQL editor with Monaco in frontend/src/components/sql-editor.tsx

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 浏览元数据与关系 (Priority: P2)

**Goal**: 元数据抓取、缓存与浏览（含关系视图）。

**Independent Test**: 打开元数据树并刷新，确认缓存与关系视图可用。

### Tests for User Story 2 (TDD)

- [ ] T037 [P] [US2] Contract test for metadata API in backend/tests/contract/test_metadata.py
- [ ] T038 [P] [US2] Unit test for metadata normalization in backend/tests/unit/test_metadata_normalizer.py
- [ ] T039 [P] [US2] Integration test for metadata refresh in backend/tests/integration/test_metadata_refresh.py
- [ ] T040 [P] [US2] Frontend component test for metadata tree in frontend/tests/metadata-tree.test.tsx

### Implementation for User Story 2

- [ ] T041 [P] [US2] Implement metadata normalizer in backend/src/services/metadata_normalizer.py
- [ ] T042 [P] [US2] Implement metadata service in backend/src/services/metadata_service.py
- [ ] T043 [P] [US2] Add metadata repository operations in backend/src/repositories/metadata_repo.py
- [ ] T044 [P] [US2] Implement metadata fetch in PostgreSQL adapter in backend/src/adapters/postgres_adapter.py
- [ ] T045 [P] [US2] Implement metadata fetch in MariaDB adapter in backend/src/adapters/mariadb_adapter.py
- [ ] T046 [US2] Add metadata APIs in backend/src/api/metadata.py
- [ ] T047 [P] [US2] Implement metadata tree UI in frontend/src/components/metadata-tree.tsx
- [ ] T048 [P] [US2] Implement relationship view UI in frontend/src/components/relationship-view.tsx
- [ ] T049 [P] [US2] Implement metadata API client in frontend/src/services/metadata.ts
- [ ] T050 [US2] Wire metadata panel into workspace page in frontend/src/pages/workspace.tsx

**Checkpoint**: User Story 2 should be independently functional

---

## Phase 5: User Story 3 - 自然语言生成 SQL 与结果导出 (Priority: P3)

**Goal**: NL2SQL 生成、确认执行、结果导出。

**Independent Test**: 使用自然语言生成 SQL 并导出结果文件。

### Tests for User Story 3 (TDD)

- [ ] T051 [P] [US3] Contract test for generate-sql API in backend/tests/contract/test_generate_sql.py
- [ ] T052 [P] [US3] Contract test for export API in backend/tests/contract/test_export.py
- [ ] T053 [P] [US3] Unit test for prompt builder in backend/tests/unit/test_prompt_builder.py
- [ ] T054 [P] [US3] Frontend component test for NL2SQL panel in frontend/tests/nl2sql-panel.test.tsx

### Implementation for User Story 3

- [ ] T055 [P] [US3] Implement LLM prompt builder using metadata context in backend/src/services/prompt_builder.py
- [ ] T056 [P] [US3] Implement Ollama client in backend/src/services/ollama_client.py
- [ ] T057 [US3] Implement SQL generation service in backend/src/services/sql_generation_service.py
- [ ] T058 [US3] Add generate-sql API in backend/src/api/generate_sql.py
- [ ] T059 [P] [US3] Implement export service in backend/src/services/export_service.py
- [ ] T060 [US3] Add export API in backend/src/api/exports.py
- [ ] T061 [P] [US3] Implement NL2SQL panel UI in frontend/src/components/nl2sql-panel.tsx
- [ ] T062 [P] [US3] Implement export controls in frontend/src/components/export-controls.tsx
- [ ] T063 [P] [US3] Implement generate-sql API client in frontend/src/services/generate_sql.ts
- [ ] T064 [P] [US3] Implement export API client in frontend/src/services/exports.ts
- [ ] T065 [US3] Wire NL2SQL + export into workspace page in frontend/src/pages/workspace.tsx

**Checkpoint**: User Story 3 should be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T066 [P] Add API error mapping and UI error surfaces in frontend/src/components/error-banner.tsx
- [ ] T067 [P] Add query history UI in frontend/src/components/query-history.tsx
- [ ] T068 Add query history API endpoint in backend/src/api/history.py
- [ ] T069 [P] Add query history service in backend/src/services/history_service.py
- [ ] T070 [P] Add data export documentation in docs/export.md
- [ ] T071 [P] Performance tuning for metadata caching in backend/src/services/metadata_service.py
- [ ] T072 Run quickstart validation steps in specs/001-db-query-mvp/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses adapters and repositories from Phase 2
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on metadata availability for context

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration

---

## Parallel Execution Examples per Story

### User Story 1

- Task: "Contract test for connections API in backend/tests/contract/test_connections.py"
- Task: "Contract test for query API in backend/tests/contract/test_query.py"
- Task: "Unit test for SQL validator (SELECT-only + limit) in backend/tests/unit/test_sql_validator.py"
- Task: "Frontend component test for connection form in frontend/tests/connection-form.test.tsx"

### User Story 2

- Task: "Contract test for metadata API in backend/tests/contract/test_metadata.py"
- Task: "Unit test for metadata normalization in backend/tests/unit/test_metadata_normalizer.py"
- Task: "Frontend component test for metadata tree in frontend/tests/metadata-tree.test.tsx"

### User Story 3

- Task: "Contract test for generate-sql API in backend/tests/contract/test_generate_sql.py"
- Task: "Contract test for export API in backend/tests/contract/test_export.py"
- Task: "Unit test for prompt builder in backend/tests/unit/test_prompt_builder.py"
- Task: "Frontend component test for NL2SQL panel in frontend/tests/nl2sql-panel.test.tsx"

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo
3. Add User Story 2 → Test independently → Demo
4. Add User Story 3 → Test independently → Demo

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story is independently completable and testable
- Tests must fail before implementation (TDD)
- Commit after each task or logical group
