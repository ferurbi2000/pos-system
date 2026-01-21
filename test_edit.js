// Native fetch used
async function testUpdate() {
    const baseUrl = 'http://localhost:3000';

    // First get a valid ID
    console.log('Fetching products...');
    const products = await fetch(`${baseUrl}/api/products`).then(r => r.json());
    if (products.length === 0) {
        console.log('No products to test update with.');
        return;
    }

    const targetId = products[0].id;
    console.log(`Testing update on Product ID: ${targetId}`);

    const updateData = {
        name: products[0].name + ' (Updated)',
        price: 99.99
    };

    const res = await fetch(`${baseUrl}/api/products/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
    });

    console.log(`Update Response Status: ${res.status}`);
    const body = await res.json();
    console.log('Response Body:', body);
}

testUpdate();
