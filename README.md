# LookAiTools - AI工具导航站

## 项目简介

LookAiTools 是一个专门为AI工具发现和选择而设计的综合平台。通过智能化的数据采集、专业的内容处理和个性化推荐，帮助用户快速找到最适合其需求的AI工具。

## 核心功能

- 🔍 **智能搜索**: 支持多维度搜索和筛选
- 📊 **工具展示**: 结构化展示AI工具信息
- 🏷️ **分类浏览**: 按功能、行业、价格等分类
- 🤖 **AI处理**: 使用LLM自动处理和标准化工具信息
- 🌐 **多语言**: 支持中英文双语展示
- 📱 **响应式**: 适配桌面端和移动端

## 技术栈

### 前端
- **框架**: Vite + React 18 + TypeScript
- **样式**: Tailwind CSS + Headless UI
- **状态管理**: Zustand
- **路由**: React Router v6

### 后端
- **框架**: Python 3.11 + FastAPI
- **数据库**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy 2.0 + Alembic
- **文件存储**: AWS S3
- **向量数据库**: 本地FAISS/Chroma

### AI服务
- **LLM**: AWS Bedrock Claude (anthropic.claude-3-haiku)
- **向量化**: AWS Bedrock Embeddings / 本地向量库
- **翻译**: AWS Bedrock Claude

## 项目结构

```
LookAiTools/
├── docs/                    # 项目文档
├── backend/                 # 后端API服务
├── frontend/                # 前端Web应用
├── crawler/                 # 数据采集爬虫
├── scripts/                 # 部署和工具脚本
├── docker-compose.yml       # 开发环境配置
└── README.md
```

## 快速开始

### 环境要求

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (可选)

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd LookAiTools
```

2. **后端设置**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. **前端设置**
```bash
cd frontend
npm install
# 或使用 pnpm install
```

4. **环境变量配置**
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

5. **数据库初始化**
```bash
cd backend
alembic upgrade head
```

6. **启动服务**

后端服务:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

前端服务:
```bash
cd frontend
npm run dev
```

访问 http://localhost:5173 查看应用

## 开发指南

### 数据库连接

项目使用 Neon PostgreSQL 云数据库:
```bash
psql 'postgresql://neondb_owner:npg_IeXmbDL4Vw@ep-patient-morning-af0bzoyn-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### API文档

启动后端服务后，访问以下地址查看API文档:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 开发规范

- **代码风格**: 使用 Black (Python) 和 Prettier (TypeScript)
- **提交规范**: 使用 Conventional Commits
- **分支策略**: Git Flow
- **测试**: 重要功能必须有单元测试

## 部署

### 开发环境
```bash
docker-compose up -d
```

### 生产环境
详见 `docs/deployment.md`

## 文档

- [完整架构设计](docs/01-complete-architecture.md)
- [MVP架构设计](docs/02-mvp-architecture.md)
- [开发计划](docs/03-development-plan.md)
- [API文档](docs/04-api-documentation.md)

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: [your-email@example.com]

---

**当前状态**: MVP开发中  
**版本**: v0.1.0  
**最后更新**: 2025-01-23
