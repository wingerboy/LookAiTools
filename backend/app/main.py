#!/usr/bin/env python3
"""
AI工具导航站后端API - 多语言架构版本
FastAPI应用主入口
"""

import os
import asyncio
import asyncpg
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv
import json

# 加载环境变量
load_dotenv()

app = FastAPI(title="LookAiTools API - Multilingual", version="2.0.0")

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据库连接池
db_pool = None

# 响应模型
class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int

class APIResponse(BaseModel):
    data: Any
    pagination: Optional[PaginationResponse] = None

async def get_db_connection():
    """获取数据库连接池"""
    global db_pool
    if db_pool is None:
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            raise ValueError("DATABASE_URL环境变量未设置")

        db_pool = await asyncpg.create_pool(
            database_url,
            min_size=1,
            max_size=10,
            command_timeout=60
        )
        print("✓ 数据库连接池创建成功")
    return db_pool

def normalize_language_code(language: str) -> str:
    """标准化语言代码"""
    lang_map = {
        'zh': 'cn',
        'zh-CN': 'cn',
        'zh-cn': 'cn',
        'chinese': 'cn',
        'english': 'en'
    }
    return lang_map.get(language.lower(), language.lower())

def format_tool_response(tool_row: Dict, language: str = 'en') -> Dict:
    """格式化工具响应数据"""
    # 处理图片URL
    screenshot = tool_row.get('page_screenshot', '')
    if screenshot:
        # 检查是否是完整URL
        if not screenshot.startswith(('http://', 'https://')):
            # 从环境变量获取基础URL
            base_url = os.getenv('FRONTEND_IMAGE_BASE_URL', '/screenshots')
            if base_url.startswith('/'):
                # 本地路径，转换为相对URL
                screenshot = f"/api/images/{screenshot}"
            else:
                # S3或其他URL
                screenshot = f"{base_url.rstrip('/')}/{screenshot}"

    return {
        "id": tool_row.get('id'),
        "slug": tool_row.get('slug', ''),
        "name": tool_row.get('name', ''),
        "title": tool_row.get('title', ''),
        "description": tool_row.get('description', ''),
        "url": tool_row.get('url', ''),
        "thumbnail_url": screenshot,
        "category": tool_row.get('category_key', ''),
        "category_name": tool_row.get('category_name', ''),
        "pricing_type": tool_row.get('pricing_type', 'freemium'),
        "rating": float(tool_row.get('rating', 0)),
        "view_count": tool_row.get('view_count', 0),
        "featured": tool_row.get('featured', False),
        "tags": tool_row.get('tags', []),
        "created_at": str(tool_row.get('created_at', '')),
        "trial_available": tool_row.get('trial_available', False),
    }

@app.on_event("startup")
async def startup_event():
    """应用启动时初始化数据库连接"""
    try:
        await get_db_connection()
        print("✓ 数据库连接池已初始化 (多语言架构)")
    except Exception as e:
        print(f"✗ 数据库连接失败: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    global db_pool
    if db_pool:
        await db_pool.close()
        print("✓ 数据库连接池已关闭")

@app.get("/health")
async def health_check():
    """健康检查"""
    try:
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return {"status": "healthy", "database": "connected", "architecture": "multilingual"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

@app.get("/api/tools")
async def get_tools(
    page: int = Query(1, ge=1, description="页码"),
    limit: int = Query(12, ge=1, le=100, description="每页数量"),
    category: Optional[str] = Query(None, description="分类筛选"),
    tags: Optional[str] = Query(None, description="标签筛选"),
    featured: Optional[str] = Query(None, description="是否精选"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    language: str = Query("en", description="语言"),
    minimal: Optional[str] = Query(None, description="简化响应"),
    all: bool = Query(False, description="是否返回所有数据（忽略分页）")
):
    """获取工具列表 - 多语言架构版本"""
    try:
        # 标准化语言代码
        language = normalize_language_code(language)
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 构建查询条件
            where_conditions = ["t.status = 'active'"]
            params = []
            param_count = 0

            # 分类筛选
            if category:
                param_count += 1
                where_conditions.append(f"c.category_key = ${param_count}")
                params.append(category)

            # 精选筛选
            if featured and featured.lower() in ['true', '1']:
                where_conditions.append("t.featured = true")

            # 搜索功能
            if search:
                param_count += 1
                where_conditions.append(f"""
                    (tt.name ILIKE ${param_count} OR
                     tt.title ILIKE ${param_count} OR
                     tt.description ILIKE ${param_count})
                """)
                params.append(f"%{search}%")

            where_clause = " AND ".join(where_conditions)

            # 构建主查询
            base_query = f"""
                SELECT
                    t.*,
                    c.category_key,
                    ct.category_name,
                    tt.name, tt.title, tt.description
                FROM tools t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN tool_translations tt ON t.id = tt.tool_id AND tt.language_code = ${param_count + 1}
                LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_code = ${param_count + 1}
                WHERE {where_clause}
                ORDER BY t.featured DESC, t.rating DESC, t.view_count DESC, t.created_at DESC
            """
            params.append(language)

            # 获取总数
            count_query = f"""
                SELECT COUNT(DISTINCT t.id)
                FROM tools t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN tool_translations tt ON t.id = tt.tool_id AND tt.language_code = ${param_count + 1}
                LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_code = ${param_count + 1}
                WHERE {where_clause}
            """
            total = await conn.fetchval(count_query, *params)

            # 分页查询
            if not all:
                offset = (page - 1) * limit
                base_query += f" LIMIT {limit} OFFSET {offset}"

            rows = await conn.fetch(base_query, *params)

            # 格式化响应
            tools = []
            for row in rows:
                tool_data = dict(row)
                tools.append(format_tool_response(tool_data, language))

            if all:
                # 返回所有数据时，分页信息特殊处理
                return APIResponse(
                    data=tools,
                    pagination=PaginationResponse(
                        page=1,
                        limit=total,  # limit设为总数
                        total=total,
                        totalPages=1  # 只有1页
                    )
                )
            else:
                # 正常分页
                total_pages = (total + limit - 1) // limit
                return APIResponse(
                    data=tools,
                    pagination=PaginationResponse(
                        page=page,
                        limit=limit,
                        total=total,
                        totalPages=total_pages
                    )
                )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取工具列表失败: {str(e)}")

@app.get("/api/tools/{tool_identifier}")
async def get_tool(tool_identifier: str, language: str = Query("en", description="语言")):
    """获取单个工具详情 - 多语言架构版本"""
    try:
        # 标准化语言代码
        language = normalize_language_code(language)
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            # 构建查询 - 支持通过slug或ID查找
            base_query = """
                SELECT
                    t.*,
                    c.category_key,
                    ct.category_name, ct.category_description,
                    tt.name, tt.title, tt.description, tt.long_description,
                    tt.use_cases, tt.target_audience, tt.subcategory
                FROM tools t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN tool_translations tt ON t.id = tt.tool_id AND tt.language_code = $1
                LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_code = $1
                WHERE t.status = 'active' AND (t.slug = $2 OR t.id::text = $2)
            """

            row = await conn.fetchrow(base_query, language, tool_identifier)

            if not row:
                raise HTTPException(status_code=404, detail="工具不存在")

            # 获取标签
            tags_query = """
                SELECT ttr.tag_name, tt.tag_type
                FROM tool_tags tt
                JOIN tag_translations ttr ON tt.tag_id = ttr.tag_id
                WHERE tt.tool_id = $1 AND ttr.language_code = $2
            """
            tags = await conn.fetch(tags_query, row['id'], language)

            # 获取功能特性
            features_query = """
                SELECT feature_text
                FROM tool_features
                WHERE tool_id = $1 AND language_code = $2
                ORDER BY sort_order
            """
            features = await conn.fetch(features_query, row['id'], language)

            # 格式化工具数据
            tool_data = dict(row)
            tool_data['tags'] = [tag['tag_name'] for tag in tags if tag['tag_type'] == 'general']
            tool_data['industry_tags'] = [tag['tag_name'] for tag in tags if tag['tag_type'] == 'industry']
            tool_data['key_features'] = [f['feature_text'] for f in features]

            # 构建完整响应
            response_data = format_tool_response(tool_data, language)
            response_data.update({
                "long_description": tool_data.get('long_description', ''),
                "use_cases": tool_data.get('use_cases', ''),
                "target_audience": tool_data.get('target_audience', ''),
                "subcategory": tool_data.get('subcategory', ''),
                "industry_tags": tool_data.get('industry_tags', []),
                "key_features": tool_data.get('key_features', []),
                "category_description": tool_data.get('category_description', '')
            })

            return APIResponse(data=response_data)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取工具详情失败: {str(e)}")

@app.get("/api/categories")
async def get_categories(language: str = Query("en", description="语言")):
    """获取分类列表 - 多语言架构版本"""
    try:
        # 标准化语言代码
        language = normalize_language_code(language)
        pool = await get_db_connection()
        async with pool.acquire() as conn:
            query = """
                SELECT
                    c.category_key,
                    ct.category_name,
                    ct.category_description,
                    COUNT(t.id) as tool_count
                FROM categories c
                LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.language_code = $1
                LEFT JOIN tools t ON c.id = t.category_id AND t.status = 'active'
                GROUP BY c.id, c.category_key, ct.category_name, ct.category_description, c.sort_order
                ORDER BY c.sort_order, tool_count DESC
            """
            rows = await conn.fetch(query, language)

            categories = []
            for row in rows:
                categories.append({
                    "id": row['category_key'],
                    "name": row['category_name'] or row['category_key'],
                    "slug": row['category_key'],
                    "description": row['category_description'] or '',
                    "count": row['tool_count']
                })

            return APIResponse(data=categories)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分类列表失败: {str(e)}")

@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """提供图片文件服务"""
    try:
        # 从环境变量获取图片基础路径
        base_path = os.getenv('FRONTEND_IMAGE_BASE_URL', '/Users/wingerliu/Downloads/startups/LookAiTools/crawler/screenshots')

        # 构建完整文件路径 - 添加toolify子目录
        file_path = os.path.join(base_path, 'toolify', filename)

        # 检查文件是否存在
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="图片不存在")

        # 返回文件
        return FileResponse(
            file_path,
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=3600"}
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取图片失败: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
