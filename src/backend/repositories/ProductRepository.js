/**
 * @author Fernando Urbina
 * @description Product Repository with in-memory persistence
 */
import { products as initialProducts } from '@/lib/data';

// In-memory store (simulating database) - Persistent in dev
if (!globalThis.productsStore) {
    globalThis.productsStore = [...initialProducts];
} else {
    // Hot-patch: Update images from initialProducts (allows seeing image changes without restart)
    // while preserving stock changes
    globalThis.productsStore = globalThis.productsStore.map(p => {
        const initial = initialProducts.find(ip => ip.id === p.id);
        return initial ? { ...p, image: initial.image } : p;
    });
}

export class ProductRepository {
    static get products() {
        return globalThis.productsStore;
    }

    static getAll() {
        return this.products;
    }

    static getById(id) {
        return this.products.find(p => p.id === id);
    }

    static add(product) {
        const newProduct = { ...product, id: Date.now() };
        this.products.push(newProduct);
        return newProduct;
    }

    static delete(id) {
        globalThis.productsStore = this.products.filter(p => p.id !== id);
        return true;
    }

    static update(id, data) {
        console.log(`[Repo] Updating ID: ${id}`);
        // Log all IDs to see if we have a match
        const availableIds = this.products.map(p => p.id);
        console.log(`[Repo] Available IDs: ${availableIds.join(', ')}`);

        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...data };
            console.log(`[Repo] Update successful for ID ${id}`);
            return this.products[index];
        }
        console.warn(`[Repo] ID ${id} not found in store.`);
        return null;
    }

    static updateStock(id, delta) {
        console.log(`[ProductRepository] Updating stock for ID ${id} by ${delta}`);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            const currentStock = this.products[index].stock || 0;
            const newStock = Math.max(0, currentStock + delta); // Prevent negative stock
            console.log(`[ProductRepository] Stock changed: ${currentStock} -> ${newStock}`);
            this.products[index] = { ...this.products[index], stock: newStock };
            return this.products[index];
        }
        console.log(`[ProductRepository] Product ID ${id} not found for stock update`);
        return null;
    }
}
