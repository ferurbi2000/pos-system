import { ProductRepository } from '../repositories/ProductRepository';

export class ProductService {
    static getProducts() {
        return ProductRepository.getAll();
    }

    static addProduct(data) {
        // Basic validation
        if (!data.name || !data.price) {
            throw new Error('Name and price are required');
        }

        return ProductRepository.add({
            ...data,
            price: parseFloat(data.price),
            stock: parseInt(data.stock) || 0,
            image: data.image || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=300&q=80'
        });
    }

    static deleteProduct(id) {
        return ProductRepository.delete(id);
    }

    static updateProduct(id, data) {
        const updateData = { ...data };
        if (updateData.price) updateData.price = parseFloat(updateData.price);
        if (updateData.stock) updateData.stock = parseInt(updateData.stock);

        return ProductRepository.update(id, updateData);
    }
}
