const toggleBtn = document.querySelector('.toggle_btn');
const toggleBtnIcon = document.querySelector('.toggle_btn i');
const dropDownMenu = document.querySelector('.dropdown_menu');

toggleBtn.onclick = function () {
	dropDownMenu.classList.toggle('open')
	const isOpen = dropDownMenu.classList.contains('open')

	toggleBtnIcon.classList = isOpen
		? 'fa-solid fa-xmark'
		: 'fa-solid fa-bars'
}

// Function to fetch product suggestions as the user types
function searchProducts() {
	let query = document.getElementById("search-input").value;

	if (query.length > 0) {
		// Updated fetch URL to match the backend route
		fetch(`/search?query=${query}`)
			.then(response => response.json())
			.then(data => {
				let resultsContainer = document.getElementById("search-results");
				resultsContainer.innerHTML = ''; // Clear previous results

				if (data.length > 0) {
					resultsContainer.style.display = 'block';
					data.forEach(product => {
						let listItem = document.createElement('li');
						
						
						// Create a container for the product name, image, and price
						let productInfo = document.createElement('div');
						productInfo.innerHTML = `
							<img src="${product.imageurl}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;">
							<p>${product.name}</p>
							<p>Price: $${product.minprice}</p>
						`;
						
						listItem.appendChild(productInfo);
						
						listItem.onclick = function() {
							document.getElementById("search-input").value = product.name;
							resultsContainer.style.display = 'none';
							searchRedirect();
						};

						resultsContainer.appendChild(listItem);
					});
				} else {
					resultsContainer.style.display = 'none';
				}
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});
	} else {
		document.getElementById("search-results").style.display = 'none';
	}
}

// Function to redirect to the search results page when a suggestion is clicked
function searchRedirect() {
	let query = document.getElementById("search-input").value;
	if (query.length > 0) {
		window.location.href = `/products?q=${encodeURIComponent(query)}`;
	}
}