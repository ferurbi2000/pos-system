import { NextResponse } from 'next/server';
import { ProductService } from '@/backend/services/ProductService';

export const dynamic = 'force-dynamic';

export async function GET() {
    const products = ProductService.getProducts();
    return NextResponse.json(products);
}

export async function POST(request) {
    try {
        const data = await request.json();
        const newProduct = ProductService.addProduct(data);
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    // In a real app, we'd parse ID from URL, but for simplicity let's pass ID in body or query param
    // But standard REST uses /api/products/[id]. 
    // For this MVP, let's assume we might receive ID in body for simplicity or implement dynamic route.
    // Let's implement dynamic route properly.
    return NextResponse.json({ error: "Method not allowed on collection" }, { status: 405 });
}
