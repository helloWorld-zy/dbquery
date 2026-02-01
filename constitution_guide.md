## 一、技术栈规范

### 后端

- **框架**：使用 FastAPI，与 Pydantic 深度集成，自动生成 OpenAPI 文档
- **数据库连接**：使用 SQLAlchemy 作为数据库抽象层，支持多种数据库类型（PostgreSQL、MySQL、SQLite、SQL Server 等）
- **异步处理**：数据库查询操作使用异步方式，避免阻塞
- **LLM 集成**：自然语言转 SQL 功能通过 OpenAI API 或兼容接口实现，API Key 通过环境变量配置

### 前端

- **框架**：React 18+ 配合 TypeScript 严格模式
- **状态管理**：使用 React Query (TanStack Query) 管理服务端状态，Zustand 管理客户端状态
- **UI 组件库**：根据项目风格选择（如 Ant Design、Shadcn/ui 等）
- **代码编辑器**：SQL 输入区域使用 Monaco Editor 或 CodeMirror，提供语法高亮

------

## 二、API 设计规范

### 端点设计

- 使用 RESTful 风格，资源名使用复数形式、kebab-case
- 基础路径统一为 `/api/v1`
- 主要端点示例：
  - `POST /api/v1/connections` — 创建数据库连接
  - `GET /api/v1/connections/{id}/metadata` — 获取数据库元数据
  - `POST /api/v1/connections/{id}/query` — 执行 SQL 查询
  - `POST /api/v1/connections/{id}/generate-sql` — 自然语言生成 SQL

### 请求与响应

- 请求体和响应体统一使用 JSON 格式
- 所有字段使用 camelCase（后端 Pydantic 模型配置 `alias_generator = to_camel`）
- 分页响应统一结构：包含 `items`、`total`、`page`、`pageSize` 字段
- 查询结果返回时，包含列定义信息（列名、数据类型）和行数据

### 错误响应

- 统一错误响应结构：`{ "error": { "code": "ERROR_CODE", "message": "人类可读的描述", "details": {} } }`
- 使用语义化错误码，如 `CONNECTION_FAILED`、`INVALID_SQL`、`QUERY_TIMEOUT`
- HTTP 状态码正确使用：400 客户端错误、500 服务端错误、422 验证失败

------

## 三、数据模型规范

### Pydantic 模型设计

- 所有模型继承自统一的 `BaseModel`，预配置 camelCase 转换和 ORM 模式
- 输入模型与输出模型分离（如 `ConnectionCreate` vs `ConnectionResponse`）
- 使用 `Field()` 提供字段描述和验证规则，自动生成 API 文档
- 敏感字段（如数据库密码）在响应模型中排除或脱敏

### 前后端类型同步

- 后端生成 OpenAPI Schema，前端使用工具（如 openapi-typescript）自动生成 TypeScript 类型
- 禁止前端手动重复定义与后端相同的类型，保持单一数据源

------

## 四、数据库连接管理

### 连接存储

- 数据库连接配置存储在内存中（单用户场景）或本地 SQLite（持久化场景）
- 连接 URL 中的密码加密存储，使用时解密

### 连接池管理

- 每个用户添加的数据库连接创建独立的连接池
- 设置合理的连接池大小和超时时间
- 连接长时间未使用时自动释放
- 应用关闭时优雅地关闭所有连接

### 多数据库支持

- 通过 SQLAlchemy 方言统一处理不同数据库的差异
- 元数据获取逻辑针对不同数据库类型做适配（表、视图、列、索引、外键等）

------

## 五、自然语言转 SQL 规范

### Prompt 工程

- 将数据库 schema 信息（表名、列名、数据类型、注释）作为上下文注入 prompt
- 明确指定目标数据库类型，生成对应方言的 SQL
- 要求 LLM 只返回 SQL 语句，不包含解释性文字
- 支持多轮对话，允许用户对生成的 SQL 进行追问和修改

### 安全检查

- 生成的 SQL 默认只允许 SELECT 语句
- 提供可选开关允许 INSERT/UPDATE/DELETE（需用户明确确认）
- 禁止生成 DROP、TRUNCATE、ALTER 等危险操作

------

## 六、查询执行规范

### 安全限制

- 设置查询超时时间（默认 30 秒，可配置）
- 设置返回行数限制（默认 1000 行，可配置）
- 记录所有执行的 SQL 语句（用于审计和调试）

### 结果处理

- 大结果集支持流式返回或分页
- 二进制数据（BLOB）转为 Base64 或提供下载链接
- 日期时间统一转为 ISO 8601 格式字符串
- NULL 值在 JSON 中保持为 `null`

------

## 七、前端规范

### 组件设计

- 采用原子化设计，基础组件、业务组件、页面组件分层
- 表格组件支持排序、筛选、列宽调整、导出功能
- SQL 编辑器支持语法高亮、自动补全（基于元数据）、格式化

### 状态管理

- 服务端数据（连接列表、元数据、查询结果）通过 React Query 管理，利用缓存和自动刷新
- 客户端状态（当前选中的连接、编辑器内容、UI 状态）使用 Zustand
- 查询历史记录存储在 localStorage

### 用户体验

- 数据库连接状态实时显示（连接中、已连接、连接失败）
- 查询执行时显示 loading 状态和预计耗时
- 支持取消正在执行的查询
- 错误信息清晰展示，包含可操作的修复建议

------

## 八、代码风格规范

### Python 后端

- 使用 Ruff 进行代码格式化和 lint
- 类型标注覆盖率 100%，使用 `mypy --strict` 检查
- 函数和类使用 docstring 说明用途
- 私有函数以单下划线开头
- 异步函数命名不需要特殊前缀，通过类型标注区分

### TypeScript 前端

- 使用 ESLint + Prettier 进行代码规范和格式化
- 启用 TypeScript strict 模式，禁止 `any` 类型
- React 组件使用函数式组件 + Hooks
- 组件 props 使用 interface 定义，命名为 `XxxProps`

### 通用命名约定

- 变量和函数：camelCase
- 类和类型：PascalCase
- 常量：UPPER_SNAKE_CASE
- 文件名：kebab-case（前端）、snake_case（后端）

## 九、测试规范

### 后端测试

- 使用 pytest 作为测试框架
- API 端点编写集成测试，覆盖正常和异常场景
- 数据库相关测试使用 SQLite 内存数据库或 testcontainers
- 关键业务逻辑编写单元测试

### 前端测试

- 使用 Vitest 进行单元测试
- 关键交互流程使用 Playwright 进行 E2E 测试
- 组件测试关注用户行为而非实现细节

------

## 十、文档规范

- README 包含项目简介、快速开始、环境变量说明
- API 文档由 FastAPI 自动生成，保持 Pydantic 模型描述完整
- 复杂业务逻辑在代码注释中说明设计决策
- CHANGELOG 记录版本变更