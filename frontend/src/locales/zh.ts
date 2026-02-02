/** 中文本地化文本 */
const zh = {
  // App
  app: {
    title: "数据库查询工具",
    tabs: {
      connections: "连接管理",
      workspace: "工作区",
    },
  },

  // Connections Page (已本地化)
  connections: {
    badge: "数据库连接",
    title: "连接管理",
    description: "统一管理数据库连接，支持测试、编辑与删除操作。连接测试结果会实时刷新。",
    current: "当前",
    count: "连接",
    add: "新增连接",
    list: "连接列表",
    recentStatus: "最近状态",
    form: {
      name: "名称",
      namePlaceholder: "例如：生产库",
      nameRequired: "请输入名称",
      dbType: "数据库类型",
      dbTypePlaceholder: "选择数据库类型",
      dbTypeRequired: "请选择数据库",
      connectionUrl: "连接地址",
      connectionUrlPlaceholder: "postgresql://user:pass@host:5432/db",
      connectionUrlRequired: "请输入连接地址",
      connectionUrlKeep: "留空则保持不变",
    },
    actions: {
      create: "创建连接",
      test: "测试",
      edit: "编辑",
      delete: "删除",
      save: "保存",
      cancel: "取消",
    },
    status: {
      success: "通过",
      failed: "失败",
      unknown: "未测试",
    },
    messages: {
      createSuccess: "连接创建成功",
      testSuccess: "连接测试通过",
      testFailed: "连接测试失败",
      deleteSuccess: "连接已删除",
      updateSuccess: "连接已更新",
    },
    editModal: {
      title: "编辑连接",
    },
  },

  // Workspace Page
  workspace: {
    loadConnections: "加载连接",
    selectConnection: "选择连接",
    selectConnectionFirst: "请先选择连接",
    runQuery: "执行查询",
    sqlEditor: "SQL 编辑器",
    metadata: "元数据",
    refresh: "刷新",
    results: "查询结果",
    noResults: "暂无结果",
    nl2sql: "自然语言转 SQL",
  },

  // NL2SQL Panel
  nl2sql: {
    placeholder: "用自然语言描述您想查询的内容...",
    generate: "生成 SQL",
    error: "生成失败，请检查模型授权配置。",
  },

  // Export Controls
  export: {
    csv: "导出 CSV",
    noResults: "暂无可导出的查询结果",
    ready: "导出完成",
  },

  // Metadata Tree
  metadata: {
    table: "表",
    view: "视图",
  },

  // Relationship View
  relationships: {
    noRelationships: "暂无表关系",
  },

  // Error Banner
  error: {
    title: "错误",
    close: "关闭",
  },

  // Query History
  history: {
    title: "查询历史",
    empty: "暂无历史记录",
    clearAll: "清空历史",
    rerun: "重新执行",
    cleared: "历史记录已清空",
  },
} as const;

export default zh;
