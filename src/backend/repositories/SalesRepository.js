
// In-memory store (simulating database)
if (!globalThis.salesStore) {
    globalThis.salesStore = [];
}
// Initialize counter based on existing sales
if (!globalThis.orderCounter) {
    const maxOrder = globalThis.salesStore.reduce((max, s) => Math.max(max, s.orderNumber || 0), 0);
    globalThis.orderCounter = maxOrder;
}

let sales = globalThis.salesStore;

export class SalesRepository {
    static getAll() {
        return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    static getById(id) {
        return sales.find(s => s.id === id);
    }

    static add(saleData) {
        globalThis.orderCounter += 1;
        const orderNumber = globalThis.orderCounter;

        const newSale = {
            ...saleData,
            id: crypto.randomUUID(),
            orderNumber: orderNumber,
            date: new Date().toISOString(),
            status: 'COMPLETED'
        };
        sales.push(newSale);
        return newSale;
    }

    static updateStatus(id, status) {
        const index = sales.findIndex(s => s.id === id);
        if (index !== -1) {
            sales[index] = { ...sales[index], status };
            return sales[index];
        }
        return null;
    }
}
