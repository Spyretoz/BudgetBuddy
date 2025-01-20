async function addToSearchList(productId) {
    try {

        const arrow = document.getElementById('jumping-arrow'); // Select the arrow element

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

                arrow.classList.remove('hidden');
                setTimeout(() => {
                    arrow.classList.add('hidden');
                }, 20000); // 20 seconds
                showToast('Product already in search list!', 'warning');
            } else if (data.moreThan) {

                arrow.classList.remove('hidden');
                setTimeout(() => {
                    arrow.classList.add('hidden');
                }, 20000); // 20 seconds
                showToast('No more than 5 products can be added in list!', 'warning');
            } else {
                showToast('Failed product did not added to search list!.', 'error');
            }
        } else if (data.success) {

            arrow.classList.remove('hidden');
            setTimeout(() => {
                arrow.classList.add('hidden');
            }, 20000); // 20 seconds
            showToast('Product added to search list!', 'success');
        }

    } catch (error) {
        showToast('Failed product did not added to search list!.', 'error');
        console.error('Error adding products to search list: ', error);
    }
}


function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; // Add success or error styling
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // Remove the toast after 4 seconds
    setTimeout(() => {
        toast.remove();
    }, 20000);
}