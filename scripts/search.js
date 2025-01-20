async function fetchSearchData() {
    const option = document.getElementById('searchOption').value; 
    window.location.href = `/search?option=${option}`;
}



function deleteItem(productId) {

    fetch('/search/remove_from_search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        }
    });
}