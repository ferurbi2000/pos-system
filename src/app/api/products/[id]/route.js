import { NextResponse } from 'next/server';
import { ProductService } from '@/backend/services/ProductService';

export async function DELETE(request, { params }) {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    ProductService.deleteProduct(id);
    return NextResponse.json({ success: true });
}

export async function PUT(request, { params }) {
    console.log('[API] PUT /api/products/[id] hit');
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    console.log(`[API] Parsed ID: ${id} (type: ${typeof id})`);

    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const data = await request.json();
    console.log(`[API] Update Data:`, data);

    const updatedProduct = ProductService.updateProduct(id, data);

    if (!updatedProduct) {
        console.error(`[API] Product with ID ${id} not found.`);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
}
