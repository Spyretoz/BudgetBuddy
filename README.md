# BudgetBuddy


1. Κατεβάστε το repo
    ```bash
    git clone https://github.com/Spyretoz/BudgetBuddy.git
    ```

2. Εγκαταστήστε τα απαραίτητα προγράμματα
    ```bash
    npm install
    ```
    
3. Δημιουργήστε ένα αρχείο με όνομα `.env` στο project:
    ```bash
    touch .env
    ```

4. Ανοίξτε το αρχείο και προσθέστε τις παρακάτω γραμμές, προσαρμόζοντας τις τιμές όπου χρειάζεται

    ```env
    # Ρυθμίσεις Βάσης Δεδομένων
    DATABASE_CONNECTION=YOUR_CONNECTION_STRING

    # Ορισμός κόστους μεταφορικών για κάθε retailer
    SHIPPING_COST_PER_RETAILER=3

    # Ρυθμίσεις email για λήψη emails από σελίδα contact
    MY_EMAIL=YOUR_PERSONAL_EMAIL
    SKR_EMAIL=YOUR_ENTERPRISE_EMAIL
    SKR_APP_PASSWORD=YOUR_ENTERPRISE_PASSWORD

5. Εκκινήστε την εφαρμογή:
    ```bash
    npm start.js
    ```
