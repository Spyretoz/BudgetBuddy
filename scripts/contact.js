async function sendEmail() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    try {
        const response = await fetch('/contact/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                message,
            }),
        });
    
        if (response.ok) {
            showToast('Email sent successfully!', 'success');
        } else {
            showToast('Failed to send email. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An unexpected error occurred while sending the email.', 'error');
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