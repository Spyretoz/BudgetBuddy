function deleteItem(productId, retailerId) {
    fetch('/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, retailerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Refresh the cart
        }
    });
}


async function updateQuantity(productId, retailerId, change) {
    try {
        const response = await fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, retailerId, quantityChange: change })
        });

        const data = await response.json();

        if (data.success) {
            location.reload(); // Refresh the cart dynamically (or update UI without reload)
        } else {
            alert(data.message || "Failed to update quantity.");
        }
    } catch (error) {
        console.error("Error updating quantity:", error);
        alert("An error occurred while updating the quantity.");
    }
}