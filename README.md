# Restaurant Analytics Dashboard

## Overview

This project is a web-based analytics dashboard built using:

* React (Vite)
* Express.js
* MySQL (Aiven Cloud)

The dashboard displays live analytics data from the restaurant database and allows users to browse and sort various business metrics.

---

## Features

The dashboard contains the following analytics pages:

1. Total Visits per Restaurant
2. Total Spent per Restaurant
3. Total Unique Customers per Restaurant
4. Total Food Spending per Restaurant
5. Total Alcohol Spending per Restaurant
6. Totals per Month
7. Totals per Year

For all restaurant-based metrics, the dashboard also displays an aggregate value across all restaurants.

Each page supports:

* Ascending sort
* Descending sort
* Alphabetical sort
* Pagination (10 records per page)

---

## Architecture

Frontend:

```text
React (Vite)
```

Backend:

```text
Express.js
```

Database:

```text
Aiven MySQL
```

Application Flow:

```text
React Frontend
        |
        v
Express REST API
        |
        v
Aiven MySQL Database
```

The frontend never connects directly to MySQL. All database communication occurs through the Express backend.

---

## Running the Application

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

---

### Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The React application will run on:

```text
http://localhost:5173
```

---

## Backend API Endpoints

### Health Check

```text
GET /api/health
```

---

### Dashboard Metrics

```text
GET /api/metrics/visits-per-restaurant
GET /api/metrics/total-per-restaurant
GET /api/metrics/unique-customers-per-restaurant
GET /api/metrics/food-per-restaurant
GET /api/metrics/alcohol-per-restaurant
GET /api/metrics/totals-per-month
GET /api/metrics/totals-per-year
```

Each endpoint returns JSON data used by the React frontend.

---

## Frontend Data Fetch Behavior

### Actions That Fetch Data From The Backend

The frontend sends a new API request when:

* The application first loads.
* The user clicks a different dashboard page in the sidebar.

Example:

```text
User clicks "Food Spent"
        |
        v
Frontend requests:
GET /api/metrics/food-per-restaurant
```

---

### Actions That Do NOT Fetch Data

The following operations are performed entirely in React using data already loaded into memory:

* Ascending sort
* Descending sort
* Alphabetical sort
* Next page
* Previous page

These actions do not trigger additional database queries.

---

## Business Logic

Food discounts are applied only to the food portion of a bill.

Adjusted Food Amount:

```text
FoodBill × (1 - FoodDiscountPercentage / 100)
```

Dashboard calculations use:

```text
Adjusted Food Amount
+ AlcoholBill
+ TipAmount
```

when computing total spending metrics.

---

## Security Notes

Database credentials are stored in:

```text
backend/.env
```

and should never be committed to source control.

Recommended additions to `.gitignore`:

```text
.env
ca.pem
node_modules/
```

The frontend does not contain any database credentials.
