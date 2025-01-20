async function addToSearchList(productId) {
    try {
        const button = document.getElementById(`add-button-${productId}`);
        const arrow = document.getElementById('jumping-arrow'); // Select the arrow element

        // Add loading state (optional)
        button.disabled = true;
        button.style.backgroundColor = '#ccc'; // Gray for loading state

        const response = await fetch('/search/add_to_search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        });

        const data = await response.json();

        if (response.status === 400) {
            if (data.alreadyInList) {
                // Product is already in the list
                button.style.backgroundColor = 'orange';
                button.querySelector('.button__icon').innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="200px" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" height="24" fill="none" class="svg">
                        <line x1="12" y1="4" x2="12" y2="12"></line>
                        <circle cx="12" cy="18" r="1.5"></circle>
                    </svg>
                `;

                arrow.classList.remove('hidden');
                setTimeout(() => {
                    arrow.classList.add('hidden');
                }, 20000); // 20 seconds
                showToast('Product already in search list!', 'warning');

                button.querySelector('.button__text').textContent = 'Already in list';
                button.disabled = true;
            } else if (data.moreThan) {
                // More than 5 products in the list
                button.style.backgroundColor = 'orange';
                button.querySelector('.button__icon').innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="200px" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" height="24" fill="none" class="svg">
                        <line x1="12" y1="4" x2="12" y2="12"></line>
                        <circle cx="12" cy="18" r="1.5"></circle>
                    </svg>
                `;
                
                // Show the arrow for 20 seconds
                arrow.classList.remove('hidden');
                setTimeout(() => {
                    arrow.classList.add('hidden');
                }, 20000); // 20 seconds
                showToast('No more than 5 products can be added in list!', 'warning');

                button.querySelector('.button__text').textContent = 'More than 5 products!';
                button.disabled = true;
            } else {
                // Other error case
                showToast('Failed product did not added to search list!.', 'error');
                throw new Error(data.error);
            }
        } else if (data.success) {

            const totalItemsElement = document.getElementById('total-items-count');
            if (totalItemsElement) {
                totalItemsElement.textContent = data.totalItems;
            }

            // On success, update button to green checkmark
            button.style.backgroundColor = 'green';
            button.querySelector('.button__icon').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="200px" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" height="24" fill="none" class="svg">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;

            // Show the arrow for 20 seconds
            arrow.classList.remove('hidden');
            setTimeout(() => {
                arrow.classList.add('hidden');
            }, 20000); // 20 seconds
            showToast('Product added to search list!', 'success');

            button.querySelector('.button__text').textContent = 'Added!';
            button.disabled = true; // Prevent further clicks
        }
    } catch (error) {
        console.error('Error adding product:', error);

        // On failure, update button to red X
        const button = document.getElementById(`add-button-${productId}`);
        button.style.backgroundColor = 'red';
        button.querySelector('.button__icon').innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="200px" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" height="24" fill="none" class="svg">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        `;

        showToast('Failed product did not added to search list!.', 'error');

        button.querySelector('.button__text').textContent = 'Failed!';
    } finally {
        // Optionally reset button state after a delay
        setTimeout(() => {
            if (!button.disabled) {
                button.style.backgroundColor = ''; // Reset to original
                button.querySelector('.button__text').textContent = 'Add for best retailer choice';
                button.querySelector('.button__icon').innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="200px" viewBox="0 0 24 24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" height="24" fill="none" class="svg">
                        <line y2="19" y1="5" x2="12" x1="12"></line>
                        <line y2="12" y1="12" x2="19" x1="5"></line>
                    </svg>
                `;
            }
        }, 2000);
    }
}


function filterProducts() {
    const selectedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(checkbox =>
        checkbox.value.toLowerCase()
    );
    const productElements = document.querySelectorAll('.index-product-box');

    productElements.forEach(product => {
        const brand = product.getAttribute('data-brand').toLowerCase();

        // Show the product if its brand is in the selected brands or no brands are selected
        if (selectedBrands.length === 0 || selectedBrands.includes(brand)) {
            product.style.display = "block";
        } else {
            product.style.display = "none";
        }
    });
}


function toggleFilters() {
    const filters = document.getElementById('filters');
    if (filters.classList.contains('hidden')) {
        filters.classList.remove('hidden');
        filters.classList.add('visible');
    } else {
        filters.classList.remove('visible');
        filters.classList.add('hidden');
    }
}


function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // Add success or error styling
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Remove the toast after 20 seconds
    setTimeout(() => {
        toast.remove();
    }, 20000);
}