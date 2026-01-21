import { NextResponse } from 'next/server';
import { SalesRepository } from '@/backend/repositories/SalesRepository';
import { ProductRepository } from '@/backend/repositories/ProductRepository';

export async function PATCH(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (body.status) {
            const updated = SalesRepository.updateStatus(id, body.status);
            if (!updated) {
                return NextResponse.json({ error: "Sale not found" }, { status: 404 });
            }

            // Restore stock if voiding
            if (body.status === 'VOID' && updated.items && Array.isArray(updated.items)) {
                updated.items.forEach(item => {
                    ProductRepository.updateStock(item.id, item.quantity); // Positive delta to restore
                });
            }

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
