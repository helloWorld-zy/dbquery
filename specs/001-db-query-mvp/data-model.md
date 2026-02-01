# Data Model: DB Query Tool MVP

## Entity: Connection
**Represents**: 用户保存的数据库连接配置与状态

**Fields**:
- id (uuid)
- name (string, required, unique per user)
- dbType (enum: postgres, mariadb)
- connectionUrl (string, encrypted at rest)
- createdAt (datetime, required)
- lastUsedAt (datetime, nullable)
- lastTestedAt (datetime, nullable)
- lastTestStatus (enum: success, failed, unknown)
- lastTestError (string, nullable)

**Validation Rules**:
- name 非空且长度 1–100
- connectionUrl 必须为有效连接串格式

**State Transitions**:
- lastTestStatus: unknown → success | failed

## Entity: MetadataSnapshot
**Represents**: 某连接在特定时间点的元数据快照

**Fields**:
- id (uuid)
- connectionId (fk → Connection)
- capturedAt (datetime, required)
- status (enum: ready, refreshing, failed)
- errorMessage (string, nullable)
- schemaCount (int)
- tableCount (int)
- viewCount (int)
- relationshipCount (int)

**Validation Rules**:
- capturedAt 必须存在

## Entity: Schema
**Represents**: 数据库 schema

**Fields**:
- id (uuid)
- snapshotId (fk → MetadataSnapshot)
- name (string, required)

**Relationships**:
- Schema 1..N → Table
- Schema 1..N → View

## Entity: Table
**Represents**: 数据库表

**Fields**:
- id (uuid)
- schemaId (fk → Schema)
- name (string, required)
- comment (string, nullable)

**Relationships**:
- Table 1..N → Column
- Table 0..N → Relationship (as source/target)

## Entity: View
**Represents**: 数据库视图

**Fields**:
- id (uuid)
- schemaId (fk → Schema)
- name (string, required)
- definition (string, nullable)
- comment (string, nullable)

**Relationships**:
- View 1..N → Column

## Entity: Column
**Represents**: 表/视图列

**Fields**:
- id (uuid)
- ownerType (enum: table, view)
- ownerId (uuid)
- name (string, required)
- dataType (string, required)
- isNullable (bool, required)
- defaultValue (string, nullable)
- ordinalPosition (int, required)
- comment (string, nullable)

**Validation Rules**:
- ordinalPosition ≥ 1

## Entity: Relationship
**Represents**: 外键关系（表之间）

**Fields**:
- id (uuid)
- snapshotId (fk → MetadataSnapshot)
- sourceTableId (fk → Table)
- sourceColumns (string[], required)
- targetTableId (fk → Table)
- targetColumns (string[], required)
- name (string, nullable)

## Entity: QueryHistory
**Represents**: 查询历史记录

**Fields**:
- id (uuid)
- connectionId (fk → Connection)
- sqlText (string, required)
- source (enum: manual, llm)
- startedAt (datetime, required)
- durationMs (int, required)
- rowCount (int, required)
- status (enum: success, failed, timeout, canceled)
- errorMessage (string, nullable)

## Entity: QueryResult
**Represents**: 查询返回结果（非持久化或临时缓存）

**Fields**:
- columns (array of { name: string, type: string })
- rows (array of array)
- limitApplied (int)
- durationMs (int)

## Entity: SqlGenerationRequest
**Represents**: 自然语言生成 SQL 请求

**Fields**:
- id (uuid)
- connectionId (fk → Connection)
- prompt (string, required)
- contextTables (string[], optional)
- createdAt (datetime, required)
- modelName (string, required)
- generatedSql (string, nullable)
- status (enum: success, failed)
- errorMessage (string, nullable)

## Entity: ExportArtifact
**Represents**: 导出结果文件

**Fields**:
- id (uuid)
- queryHistoryId (fk → QueryHistory)
- format (enum: csv)
- filePath (string, required)
- createdAt (datetime, required)
- status (enum: success, failed)
- errorMessage (string, nullable)
