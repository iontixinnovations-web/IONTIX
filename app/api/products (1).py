from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.product import Product
from typing import Optional

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("/")
async def get_products(
    category: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db)
):
    """Fetch products with optional filters"""
    try:
        query = select(Product)
        
        if category:
            query = query.where(Product.category == category)
        if gender:
            query = query.where(Product.gender == gender)
        
        # Get total count
        count_query = select(func.count(Product.id))
        if category:
            count_query = count_query.where(Product.category == category)
        if gender:
            count_query = count_query.where(Product.gender == gender)
        
        result = await db.execute(count_query)
        total = result.scalar()
        
        # Get paginated results
        query = query.offset(offset).limit(limit)
        result = await db.execute(query)
        products = result.scalars().all()
        
        return {
            "success": True,
            "data": [p.to_dict() for p in products],
            "total": total
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch single product with reviews"""
    try:
        stmt = select(Product).where(Product.id == product_id)
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {
            "success": True,
            "data": product.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
