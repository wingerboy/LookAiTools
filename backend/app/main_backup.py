#!/usr/bin/env python3
"""
AI工具导航站后端API
FastAPI应用主入口
"""

from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import asyncpg
import asyncio
import json
import os
import uuid
import time
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 分类名称映射
CATEGORY_NAMES = {
    "productivity": {"en": "Productivity", "zh": "生产力"},
    "chatbot": {"en": "Chatbot", "zh": "聊天机器人"},
    "image": {"en": "Image", "zh": "图像"},
    "code&it": {"en": "Code&IT", "zh": "编程开发"},
    "video": {"en": "Video", "zh": "视频"},
    "business": {"en": "Business", "zh": "商业"},
    "marketing": {"en": "Marketing", "zh": "营销"},
    "text&writing": {"en": "Text&Writing", "zh": "文本写作"},
    "3d": {"en": "3D", "zh": "3D"},
    "voice": {"en": "Voice", "zh": "语音"},
    "education": {"en": "Education", "zh": "教育"},
    "ai detector": {"en": "AI Detector", "zh": "AI检测"},
}

app = FastAPI(
    title="AI Tools Navigator API",
    description="AI工具导航站后端API",
    version="1.0.0"
)

# 添加gzip压缩中间件
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 性能监控中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)

    # 记录慢查询
    if process_time > 1.0:  # 超过1秒的请求
        print(f"⚠️  慢查询警告: {request.method} {request.url.path} - {process_time:.3f}s")

    return response

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # 前端开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库连接池
db_pool = None

# Pydantic模型
class BilingualText(BaseModel):
    en: str
    cn: str

class AIToolResponse(BaseModel):
    id: int
    name: BilingualText
    title: BilingualText
    slug: str
    url: str
    page_screenshot: Optional[str] = None
    description: BilingualText
    long_description: Optional[BilingualText] = None
    key_features: Optional[List[BilingualText]] = []
    use_cases: Optional[BilingualText] = None
    target_audience: Optional[BilingualText] = None
    category: str
    subcategory: Optional[BilingualText] = None
    tags: Optional[List[BilingualText]] = []
    industry_tags: Optional[List[BilingualText]] = []
    pricing_type: Optional[BilingualText] = None
    pricing_details: Optional[Dict[str, Any]] = {}
    trial_available: Optional[BilingualText] = None
    rating: Optional[float] = 0
    view_count: Optional[int] = 0
    traffic_estimate: Optional[int] = 0
    featured: Optional[bool] = False
    status: Optional[str] = "active"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    count: Optional[int] = 0

class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class APIResponse(BaseModel):
    data: Any
    pagination: Optional[PaginationResponse] = None
    success: bool = True
    message: Optional[str] = None

# 工具提交数据模型
class ToolSubmission(BaseModel):
    # Basic Information
    name: Dict[str, str]  # {"en": "...", "zh": "..."}
    title: Dict[str, str]
    description: Dict[str, str]
    long_description: Dict[str, str]
    url: str
    thumbnail_url: str = ""

    # Categorization
    category: str
    subcategory: Dict[str, str]
    tags: List[Dict[str, str]] = []
    industry_tags: List[Dict[str, str]] = []

    # Features and Use Cases
    key_features: List[Dict[str, str]] = []
    use_cases: Dict[str, str]
    target_audience: Dict[str, str]

    # Pricing Information
    pricing_type: Dict[str, str]
    pricing_details: Dict[str, str]
    trial_available: Dict[str, str]

    # Contact Information
    contact_email: str
    contact_name: str
    company_name: str = ""

# 数据库连接管理
async def get_db_connection():
    """获取数据库连接"""
    global db_pool
    if db_pool is None:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise HTTPException(status_code=500, detail="数据库连接配置错误")

        # 优化连接池配置
        db_pool = await asyncpg.create_pool(
            database_url,
            min_size=5,                              # 最小连接数
            max_size=20,                             # 最大连接数
            max_queries=50000,                       # 每个连接最大查询数
            max_inactive_connection_lifetime=300,    # 连接最大空闲时间(秒)
            command_timeout=30,                      # 命令超时时间(秒)
            server_settings={
                'application_name': 'lookaitools_api',
                'jit': 'off'                         # 关闭JIT以减少延迟
            }
        )
    return db_pool

async def close_db_connection():
    """关闭数据库连接"""
    global db_pool
    if db_pool:
        await db_pool.close()

# 启动和关闭事件
@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库连接"""
    await get_db_connection()
    print("✓ 数据库连接池已初始化")

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    await close_db_connection()
    print("✓ 数据库连接池已关闭")

# 工具函数
def parse_jsonb_field(value: str) -> Any:
    """解析JSONB字段"""
    if value is None:
        return None
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return value

def format_tool_response(tool_row: dict, language: str = "en") -> dict:
    """格式化工具响应数据"""
    # 解析JSONB字段
    name = parse_jsonb_field(tool_row.get('name', '{}'))
    title = parse_jsonb_field(tool_row.get('title', '{}'))
    description = parse_jsonb_field(tool_row.get('description', '{}'))
    long_description = parse_jsonb_field(tool_row.get('long_description', '{}'))
    key_features = parse_jsonb_field(tool_row.get('key_features', '[]'))
    use_cases = parse_jsonb_field(tool_row.get('use_cases', '{}'))
    target_audience = parse_jsonb_field(tool_row.get('target_audience', '{}'))
    subcategory = parse_jsonb_field(tool_row.get('subcategory', '{}'))
    tags = parse_jsonb_field(tool_row.get('tags', '[]'))
    industry_tags = parse_jsonb_field(tool_row.get('industry_tags', '[]'))
    pricing_type = parse_jsonb_field(tool_row.get('pricing_type', '{}'))
    pricing_details = parse_jsonb_field(tool_row.get('pricing_details', '{}'))
    trial_available = parse_jsonb_field(tool_row.get('trial_available', '{}'))

    # 辅助函数：根据语言获取文本
    def get_localized_text(text_obj, lang):
        if not text_obj:
            return ''
        if isinstance(text_obj, dict):
            # 支持 zh, zh-CN, zh-Hans 等中文变体
            if lang.startswith('zh'):
                return text_obj.get('cn', text_obj.get('zh', text_obj.get('en', '')))
            else:
                return text_obj.get('en', text_obj.get('cn', ''))
        return str(text_obj)

    # 为前端兼容性，提供简化的字段
    return {
        "id": str(tool_row.get('id')),
        "name": get_localized_text(name, language),
        "title": get_localized_text(title, language),
        "description": get_localized_text(description, language),
        "url": tool_row.get('url', ''),
        "thumbnail_url": tool_row.get('page_screenshot', ''),
        "category": tool_row.get('category', ''),
        "tags": [get_localized_text(tag, language) for tag in tags] if isinstance(tags, list) else [],
        "pricing": get_localized_text(pricing_type, language).lower() if pricing_type else 'unknown',
        "featured": tool_row.get('featured', False),
        "traffic": tool_row.get('traffic_estimate', 0),
        "created_at": str(tool_row.get('created_at', '')),
        "updated_at": str(tool_row.get('updated_at', '')),
        # 完整的双语数据
        "full_data": {
            "name": name,
            "title": title,
            "description": description,
            "long_description": long_description,
            "key_features": key_features,
            "use_cases": use_cases,
            "target_audience": target_audience,
            "subcategory": subcategory,
            "tags": tags,
            "industry_tags": industry_tags,
            "pricing_type": pricing_type,
            "pricing_details": pricing_details,
            "trial_available": trial_available,
            "rating": tool_row.get('rating', 0),
            "view_count": tool_row.get('view_count', 0),
            "traffic_estimate": tool_row.get('traffic_estimate', 0),
            "featured": tool_row.get('featured', False),
            "status": tool_row.get('status', 'active'),
            "slug": tool_row.get('slug', ''),
            "page_screenshot": tool_row.get('page_screenshot', ''),
        }
    }

def format_new_tool_response(tool_row: dict, language: str = "en", minimal: bool = False) -> dict:
    """格式化新数据库结构的工具响应数据"""

    # 获取本地化文本的辅助函数
    def get_text(en_field, cn_field):
        if language == 'cn':
            return tool_row.get(cn_field, '') or tool_row.get(en_field, '')
        else:
            return tool_row.get(en_field, '') or tool_row.get(cn_field, '')

    # 处理tags - 提取简化的标签数组
    tags = tool_row.get('tags', [])
    simplified_tags = []
    if tags:
        for tag in tags:
            if isinstance(tag, dict):
                # 根据语言选择标签文本
                if language == 'cn':
                    simplified_tags.append(tag.get('cn', '') or tag.get('en', ''))
                else:
                    simplified_tags.append(tag.get('en', '') or tag.get('cn', ''))
            else:
                simplified_tags.append(str(tag))

    # 基础响应数据
    response = {
        "id": str(tool_row.get('id')),
        "name": get_text('name_en', 'name_cn'),
        "title": get_text('title_en', 'title_cn'),
        "description": get_text('description_en', 'description_cn'),
        "url": tool_row.get('url', ''),
        "thumbnail_url": tool_row.get('page_screenshot', ''),
        "category": tool_row.get('category_slug', ''),
        "pricing": tool_row.get('pricing_type', 'unknown'),
        "featured": tool_row.get('featured', False),
        "traffic": tool_row.get('traffic_estimate', 0),
        "created_at": str(tool_row.get('created_at', '')),
        "updated_at": str(tool_row.get('updated_at', '')),
        "slug": tool_row.get('slug', ''),
        "rating": tool_row.get('rating', 0),
        "view_count": tool_row.get('view_count', 0),
        "tags": simplified_tags
    }

    # 如果不是minimal模式，添加完整数据
    if not minimal:
        response["full_data"] = {
            "name": {"en": tool_row.get('name_en', ''), "cn": tool_row.get('name_cn', '')},
            "title": {"en": tool_row.get('title_en', ''), "cn": tool_row.get('title_cn', '')},
            "description": {"en": tool_row.get('description_en', ''), "cn": tool_row.get('description_cn', '')},
            "long_description": {"en": tool_row.get('long_description_en', ''), "cn": tool_row.get('long_description_cn', '')},
            "category": {
                "slug": tool_row.get('category_slug', ''),
                "name": {"en": tool_row.get('category_name_en', ''), "cn": tool_row.get('category_name_cn', '')}
            },
            "pricing_type": tool_row.get('pricing_type', ''),
            "pricing_details": tool_row.get('pricing_details', {}),
            "has_trial": tool_row.get('has_trial', False),
            "rating": tool_row.get('rating', 0),
            "view_count": tool_row.get('view_count', 0),
            "traffic_estimate": tool_row.get('traffic_estimate', 0),
            "featured": tool_row.get('featured', False),
            "status": tool_row.get('status', 'active'),
            "meta_info": tool_row.get('meta_info', {}),
            "slug": tool_row.get('slug', ''),
            "tags": tool_row.get('tags', []),
            "industry_tags": tool_row.get('industry_tags', []),
            "key_features": tool_row.get('key_features', [])
        }

    return response

# API路由
@app.get("/")
async def root():
    """根路径"""
    return {"message": "AI Tools Navigator API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """健康检查"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.get("/api/tools")
async def get_tools(
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(12, ge=1, le=100, description="每页数量"),
    category: Optional[str] = Query(None, description="分类筛选"),
    featured: Optional[bool] = Query(None, description="是否精选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    language: str = Query("en", description="语言"),
    minimal: bool = Query(False, description="是否返回最小字段集"),
    all: bool = Query(False, description="是否返回所有数据（忽略分页）")
):
    """获取工具列表 - 适配简化架构版本"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 构建查询条件
            where_conditions = ["t.status = 'active'"]
            params = []
            param_count = 0

            if category:
                param_count += 1
                where_conditions.append(f"c.category_key = ${param_count}")
                params.append(category)

            if featured is not None:
                param_count += 1
                where_conditions.append(f"t.featured = ${param_count}")
                params.append(featured)

            if search:
                param_count += 1
                where_conditions.append(f"""
                    (tt.name ILIKE ${param_count} OR
                     tt.title ILIKE ${param_count} OR
                     tt.description ILIKE ${param_count})
                """)
                params.append(f"%{search}%")

            where_clause = " AND ".join(where_conditions)

            # 构建基础查询
            param_count += 1
            lang_param = param_count
            base_query = f"""
                FROM tools t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN tool_translations tt ON t.id = tt.tool_id AND tt.language_code = ${lang_param}
                WHERE {where_clause}
            """
            params.append(language)

            # 获取总数
            count_query = f"SELECT COUNT(DISTINCT t.id) {base_query}"
            total = await conn.fetchval(count_query, *params)

            # 获取数据
            if all:
                # 如果all=true，返回所有数据，忽略分页
                query = f"""
                    SELECT
                        t.id, t.slug, t.url, t.page_screenshot,
                        tt.name, tt.title, tt.description,
                        c.category_key as category,
                        t.rating, t.view_count, t.featured, t.created_at,
                        t.pricing_type
                    {base_query}
                    ORDER BY t.featured DESC, t.view_count DESC, t.created_at DESC
                """
            else:
                # 正常分页
                offset = (page - 1) * limit
                param_count += 1
                limit_param = param_count
                param_count += 1
                offset_param = param_count

                query = f"""
                    SELECT
                        t.id, t.slug, t.url, t.page_screenshot,
                        tt.name, tt.title, tt.description,
                        c.category_key as category,
                        t.rating, t.view_count, t.featured, t.created_at,
                        t.pricing_type
                    {base_query}
                    ORDER BY t.featured DESC, t.view_count DESC, t.created_at DESC
                    LIMIT ${limit_param} OFFSET ${offset_param}
                """
                params.extend([limit, offset])

            rows = await conn.fetch(query, *params)

            # 格式化响应
            tools = []
            for row in rows:
                if minimal:
                    # 最小字段集
                    tool = {
                        "id": str(row['id']),
                        "name": row['name'] or '',
                        "title": row['title'] or '',
                        "url": row['url'] or '',
                        "category": row['category'] or '',
                        "slug": row['slug'] or ''
                    }
                else:
                    # 完整字段集
                    tool = {
                        "id": str(row['id']),
                        "name": row['name'] or '',
                        "title": row['title'] or '',
                        "description": row['description'] or '',
                        "url": row['url'] or '',
                        "thumbnail_url": row['page_screenshot'] or '',
                        "category": row['category'] or '',
                        "tags": [],  # 简化版本暂不包含标签
                        "pricing": row['pricing_type'] or 'unknown',
                        "featured": row['featured'] or False,
                        "traffic": row['view_count'] or 0,
                        "created_at": str(row['created_at']) if row['created_at'] else '',
                        "updated_at": str(row['created_at']) if row['created_at'] else '',
                        "slug": row['slug'] or '',
                        "rating": float(row['rating']) if row['rating'] else 0,
                        "view_count": row['view_count'] or 0
                    }
                tools.append(tool)

            total_pages = (total + limit - 1) // limit

            return APIResponse(
                data=tools,
                pagination=PaginationResponse(
                    page=page,
                    limit=limit,
                    total=total,
                    total_pages=total_pages
                )
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取工具列表失败: {str(e)}")

@app.get("/api/tools/{tool_identifier}")
async def get_tool(tool_identifier: str, language: str = Query("en", description="语言")):
    """获取单个工具详情 - 新规范化架构版本"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 构建查询，包含分类信息
            base_query = """
                SELECT t.*,
                       c.slug as category_slug,
                       c.name_en as category_name_en,
                       c.name_cn as category_name_cn
                FROM ai_tools t
                LEFT JOIN ai_tool_categories atc ON t.id = atc.tool_id AND atc.is_primary = true
                LEFT JOIN categories c ON atc.category_id = c.id
                WHERE t.status = 'active'
            """

            # 尝试通过slug查找，如果失败则通过ID查找
            if tool_identifier.isdigit():
                # 如果是数字，按ID查找
                query = base_query + " AND t.id = $1"
                row = await conn.fetchrow(query, int(tool_identifier))
            else:
                # 如果不是数字，按slug查找
                query = base_query + " AND t.slug = $1"
                row = await conn.fetchrow(query, tool_identifier)

            if not row:
                raise HTTPException(status_code=404, detail="工具不存在")

            # 获取标签信息
            tags_query = """
                SELECT tag.name_en, tag.name_cn, tag.type
                FROM ai_tool_tags att
                JOIN tags tag ON att.tag_id = tag.id
                WHERE att.tool_id = $1
            """
            tags = await conn.fetch(tags_query, row['id'])

            # 获取核心特性
            features_query = """
                SELECT feature_en, feature_cn
                FROM key_features
                WHERE tool_id = $1
                ORDER BY priority
            """
            features = await conn.fetch(features_query, row['id'])

            # 格式化工具数据
            tool_data = dict(row)
            tool_data['tags'] = [{"en": tag['name_en'], "cn": tag['name_cn']} for tag in tags if tag['type'] == 'general']
            tool_data['industry_tags'] = [{"en": tag['name_en'], "cn": tag['name_cn']} for tag in tags if tag['type'] == 'industry']
            tool_data['key_features'] = [{"en": f['feature_en'], "cn": f['feature_cn']} for f in features]

            tool = format_new_tool_response(tool_data, language, minimal=False)

            return APIResponse(data=tool)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取工具详情失败: {str(e)}")

@app.get("/api/tools/{tool_id}/related")
async def get_related_tools(tool_id: str, language: str = Query("en", description="语言"), limit: int = Query(4, description="返回数量")):
    """获取相关工具"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 首先获取当前工具信息
            if tool_id.isdigit():
                current_tool_query = "SELECT category FROM ai_tools WHERE id = $1 AND status = 'active'"
                current_tool = await conn.fetchrow(current_tool_query, int(tool_id))
            else:
                current_tool_query = "SELECT category FROM ai_tools WHERE slug = $1 AND status = 'active'"
                current_tool = await conn.fetchrow(current_tool_query, tool_id)

            if not current_tool:
                raise HTTPException(status_code=404, detail="工具不存在")

            # 获取同分类的其他工具
            if tool_id.isdigit():
                query = """
                    SELECT * FROM ai_tools
                    WHERE category = $1 AND id != $2 AND status = 'active'
                    ORDER BY featured DESC, view_count DESC, created_at DESC
                    LIMIT $3
                """
                rows = await conn.fetch(query, current_tool['category'], int(tool_id), limit)
            else:
                query = """
                    SELECT * FROM ai_tools
                    WHERE category = $1 AND slug != $2 AND status = 'active'
                    ORDER BY featured DESC, view_count DESC, created_at DESC
                    LIMIT $3
                """
                rows = await conn.fetch(query, current_tool['category'], tool_id, limit)

            # 如果同分类工具不够，补充其他工具
            if len(rows) < limit:
                remaining = limit - len(rows)
                if tool_id.isdigit():
                    additional_query = """
                        SELECT * FROM ai_tools
                        WHERE category != $1 AND id != $2 AND status = 'active'
                        ORDER BY featured DESC, view_count DESC, created_at DESC
                        LIMIT $3
                    """
                    additional_rows = await conn.fetch(additional_query, current_tool['category'], int(tool_id), remaining)
                else:
                    additional_query = """
                        SELECT * FROM ai_tools
                        WHERE category != $1 AND slug != $2 AND status = 'active'
                        ORDER BY featured DESC, view_count DESC, created_at DESC
                        LIMIT $3
                    """
                    additional_rows = await conn.fetch(additional_query, current_tool['category'], tool_id, remaining)
                rows.extend(additional_rows)

            # 格式化响应
            tools = [format_tool_response(dict(row), language) for row in rows]

            return APIResponse(data=tools)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取相关工具失败: {str(e)}")

@app.get("/api/categories")
async def get_categories(language: str = Query("en", description="语言")):
    """获取分类列表 - 适配简化架构版本"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 获取分类及其工具数量
            query = """
                SELECT
                    c.category_key,
                    ct.category_name,
                    COUNT(t.id) as tool_count
                FROM categories c
                LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_code = $1
                LEFT JOIN tools t ON c.id = t.category_id AND t.status = 'active'
                GROUP BY c.category_key, ct.category_name
                ORDER BY tool_count DESC
            """
            rows = await conn.fetch(query, language)

            # 格式化分类数据
            categories = []
            for row in rows:
                categories.append({
                    "id": row['category_key'],
                    "name": row['category_name'] or row['category_key'].replace('-', ' ').title(),
                    "slug": row['category_key'],
                    "count": row['tool_count']
                })

            return APIResponse(data=categories)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分类列表失败: {str(e)}")

@app.get("/api/homepage-data")
async def get_homepage_data(language: str = Query("en", description="语言")):
    """批量获取首页所有数据 - 减少请求数量，提升性能"""
    try:
        pool = await get_db_connection()

        # 使用独立连接执行每个查询
        async def get_categories():
            async with pool.acquire() as conn:
                return await get_categories_data(conn, language)

        async def get_featured():
            async with pool.acquire() as conn:
                return await get_featured_tools_data(conn, language)

        async def get_latest():
            async with pool.acquire() as conn:
                return await get_latest_tools_data(conn, language)

        async def get_popular():
            async with pool.acquire() as conn:
                return await get_popular_tools_data(conn, language)

        # 并发执行所有查询
        categories, featured_tools, latest_tools, popular_tools = await asyncio.gather(
            get_categories(),
            get_featured(),
            get_latest(),
            get_popular()
        )

        return APIResponse(data={
            "categories": categories,
            "featured_tools": featured_tools,
            "latest_tools": latest_tools,
            "popular_tools": popular_tools
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取首页数据失败: {str(e)}")

async def get_categories_data(conn, language: str):
    """获取分类数据"""
    query = """
        SELECT
            c.category_key,
            ct.category_name,
            COUNT(t.id) as tool_count
        FROM categories c
        LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_code = $1
        LEFT JOIN tools t ON c.id = t.category_id AND t.status = 'active'
        GROUP BY c.category_key, ct.category_name
        ORDER BY tool_count DESC
    """
    rows = await conn.fetch(query, language)

    return [
        {
            "id": row['category_key'],
            "name": row['category_name'] or row['category_key'].replace('-', ' ').title(),
            "slug": row['category_key'],
            "count": row['tool_count']
        }
        for row in rows
    ]

async def get_featured_tools_data(conn, language: str):
    """获取精选工具数据"""
    return await get_tools_data(conn, language, featured=True, limit=8)

async def get_latest_tools_data(conn, language: str):
    """获取最新工具数据"""
    return await get_tools_data(conn, language, order_by="created_at", limit=8)

async def get_popular_tools_data(conn, language: str):
    """获取热门工具数据"""
    return await get_tools_data(conn, language, order_by="view_count", limit=8)

async def get_tools_data(conn, language: str, featured: bool = None, order_by: str = "view_count", limit: int = 8):
    """通用工具数据获取函数"""
    where_conditions = ["t.status = 'active'"]
    params = [language]
    param_count = 1

    if featured is not None:
        param_count += 1
        where_conditions.append(f"t.featured = ${param_count}")
        params.append(featured)

    where_clause = " AND ".join(where_conditions)

    # 根据排序字段构建ORDER BY
    if order_by == "created_at":
        order_clause = "t.created_at DESC"
    elif order_by == "view_count":
        order_clause = "t.view_count DESC, t.created_at DESC"
    else:
        order_clause = "t.featured DESC, t.view_count DESC, t.created_at DESC"

    query = f"""
        SELECT
            t.id, t.slug, t.url, t.page_screenshot,
            tt.name, tt.title, tt.description,
            c.category_key as category,
            t.rating, t.view_count, t.featured, t.created_at,
            t.pricing_type
        FROM tools t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN tool_translations tt ON t.id = tt.tool_id AND tt.language_code = $1
        WHERE {where_clause}
        ORDER BY {order_clause}
        LIMIT {limit}
    """

    rows = await conn.fetch(query, *params)

    return [
        {
            "id": str(row['id']),
            "name": row['name'] or '',
            "title": row['title'] or '',
            "description": row['description'] or '',
            "url": row['url'] or '',
            "thumbnail_url": row['page_screenshot'] or '',
            "category": row['category'] or '',
            "tags": [],
            "pricing": row['pricing_type'] or 'unknown',
            "featured": row['featured'] or False,
            "traffic": row['view_count'] or 0,
            "created_at": str(row['created_at']) if row['created_at'] else '',
            "updated_at": str(row['created_at']) if row['created_at'] else '',
            "slug": row['slug'] or '',
            "rating": float(row['rating']) if row['rating'] else 0,
            "view_count": row['view_count'] or 0
        }
        for row in rows
    ]

@app.get("/api/subcategories")
async def get_subcategories(language: str = Query("en", description="语言")):
    """获取子分类列表"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 获取所有子分类及其工具数量
            query = """
                SELECT
                    subcategory,
                    COUNT(*) as count
                FROM ai_tools
                WHERE status = 'active' AND subcategory IS NOT NULL AND subcategory != '{}'
                GROUP BY subcategory
                ORDER BY count DESC
            """
            rows = await conn.fetch(query)

            # 格式化子分类数据
            subcategories = []
            for row in rows:
                subcategory_data = parse_jsonb_field(row['subcategory'])
                if subcategory_data:
                    subcategory_name = subcategory_data.get('en', '') if language == 'en' else subcategory_data.get('cn', subcategory_data.get('en', ''))
                    if subcategory_name:
                        subcategories.append({
                            "id": subcategory_name.lower().replace(' ', '-'),
                            "name": subcategory_name,
                            "slug": subcategory_name.lower().replace(' ', '-'),
                            "count": row['count']
                        })

            return APIResponse(data=subcategories)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取子分类列表失败: {str(e)}")

@app.get("/api/tags")
async def get_tags(language: str = Query("en", description="语言")):
    """获取标签列表 - 适配新数据库结构"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 获取标签及其使用次数
            query = """
                SELECT
                    t.id,
                    t.tag_key,
                    tt.tag_name,
                    COUNT(tl.tool_id) as tool_count
                FROM tags t
                LEFT JOIN tag_translations tt ON t.id = tt.tag_id AND tt.language_code = $1
                LEFT JOIN tool_tags tl ON t.id = tl.tag_id
                LEFT JOIN tools tool ON tl.tool_id = tool.id AND tool.status = 'active'
                GROUP BY t.id, t.tag_key, tt.tag_name
                HAVING COUNT(tl.tool_id) > 0
                ORDER BY tool_count DESC, t.tag_key
            """
            rows = await conn.fetch(query, language)

            # 格式化标签数据
            tags_list = []
            for row in rows:
                tag_name = row['tag_name'] or row['tag_key'].replace('-', ' ').title()
                tags_list.append({
                    "id": row['tag_key'],
                    "name": tag_name,
                    "slug": row['tag_key'],
                    "count": row['tool_count']
                })

            return APIResponse(data=tags_list)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取标签列表失败: {str(e)}")

@app.post("/api/tools/submit")
async def submit_tool(submission: ToolSubmission):
    """提交AI工具"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 生成唯一ID和slug
            tool_id = str(uuid.uuid4())
            slug = submission.name.get('en', '').lower().replace(' ', '-').replace('_', '-')

            # 确保slug唯一
            existing_slug = await conn.fetchval(
                "SELECT slug FROM ai_tools WHERE slug = $1", slug
            )
            if existing_slug:
                slug = f"{slug}-{str(uuid.uuid4())[:8]}"

            # 准备数据
            current_time = datetime.now().isoformat()

            # 构建full_data JSON
            full_data = {
                "name": submission.name,
                "title": submission.title,
                "description": submission.description,
                "long_description": submission.long_description,
                "key_features": submission.key_features,
                "use_cases": submission.use_cases,
                "target_audience": submission.target_audience,
                "subcategory": submission.subcategory,
                "tags": submission.tags,
                "industry_tags": submission.industry_tags,
                "pricing_type": submission.pricing_type,
                "pricing_details": submission.pricing_details,
                "trial_available": submission.trial_available,
                "rating": "0",
                "view_count": 0,
                "traffic_estimate": 0,
                "featured": False,
                "status": "pending",  # 待审核状态
                "slug": slug,
                "page_screenshot": submission.thumbnail_url,
                "contact_email": submission.contact_email,
                "contact_name": submission.contact_name,
                "company_name": submission.company_name,
                "submitted_at": current_time
            }

            # 插入到数据库 - 只插入基本字段
            await conn.execute("""
                INSERT INTO ai_tools (
                    id, name, title, description, url, thumbnail_url,
                    category, tags, featured, traffic,
                    created_at, updated_at, full_data
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                )
            """,
                tool_id,
                submission.name.get('en', ''),
                submission.title.get('en', ''),
                submission.description.get('en', ''),
                submission.url,
                submission.thumbnail_url,
                submission.category,
                json.dumps([tag.get('en', '') for tag in submission.tags]),
                False,  # 新提交的工具默认不是featured
                0,  # 初始流量为0
                current_time,
                current_time,
                json.dumps(full_data)
            )

            return APIResponse(
                data={"id": tool_id, "slug": slug, "status": "pending"},
                message="工具提交成功，我们将在2-3个工作日内审核"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"提交工具失败: {str(e)}")

@app.get("/health")
async def health_check():
    """健康检查端点"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
