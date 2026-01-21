import { NextResponse } from 'next/server';
import { SalesRepository } from '@/backend/repositories/SalesRepository';
import { ProductRepository } from '@/backend/repositories/ProductRepository';

export async function GET() {
    const sales = SalesRepository.getAll();
    return NextResponse.json(sales);
}

export async function POST(request) {
    try {
        const data = await request.json();
        console.log(`[Sales API] Received new sale with ${data.items?.length || 0} items`);

        const newSale = SalesRepository.add(data);

        // Deduct stock for each item
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                console.log(`[Sales API] Deducting stock for item ${item.id}, quantity: ${item.quantity}`);
                ProductRepository.updateStock(item.id, -item.quantity);
            });
        }

        return NextResponse.json(newSale, { status: 201 });
    } catch (error) {
        console.error(`[Sales API] Error processing sale: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
