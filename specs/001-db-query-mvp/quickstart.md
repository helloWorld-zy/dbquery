# Quickstart: DB Query Tool MVP

## Overview
本快速开始说明如何在本地启动前后端并验证核心流程（连接 → 查询 → 结果展示）。

## Prerequisites
- Python 3.12+（后端）
- Node.js 22+（前端）
- PostgreSQL 或 MariaDB 实例
- ModelScope 推理服务已配置（用于 NL2SQL）

## Environment Variables
在项目根目录创建 .env，后端需要以下环境变量（示例）：
- MODELSCOPE_BASE_URL
- MODELSCOPE_SDK_TOKEN
- MODELSCOPE_MODEL_NAME
- DEFAULT_QUERY_TIMEOUT_SECONDS
- DEFAULT_MAX_ROWS
- MAX_MAX_ROWS

## Backend (FastAPI)
1. 安装依赖
2. 运行后端服务（默认开启 CORS 允许所有 origin）
3. 确认 SQLite 缓存文件位于 ./db_query/db_query.db

## Frontend (React + refine + Ant Design + Tailwind + Monaco)
1. 安装依赖
2. 启动前端开发服务器
3. 打开浏览器访问前端页面

## Smoke Test
1. 创建并测试 PostgreSQL 或 MariaDB 连接
2. 浏览元数据树（schema → table/view → columns）
3. 输入并执行 SELECT 查询（自动补 LIMIT 1000）
4. 查看结果表格与导出功能
5. 使用自然语言生成 SQL，并在确认后执行

## Expected Results
- 查询结果以 JSON 返回并在前端表格化显示
- 非 SELECT 语句被拒绝并提示错误
- 缺少 LIMIT 时自动追加 LIMIT 1000
- 元数据缓存可刷新并保留历史状态
