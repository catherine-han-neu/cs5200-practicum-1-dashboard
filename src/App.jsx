import { useState } from "react";
import DashboardPage from "./DashboardPage";
import "./App.css";

const API_BASE_URL = "http://localhost:5000";

const pages = [
  {
    id: "visits",
    label: "Total Visits",
    endpoint: "/api/metrics/visits-per-restaurant",
    format: "number",
  },
  {
    id: "total",
    label: "Total per Restaurant",
    endpoint: "/api/metrics/total-per-restaurant",
    format: "currency",
  },
  {
    id: "customers",
    label: "Unique Customers",
    endpoint: "/api/metrics/unique-customers-per-restaurant",
    format: "number",
  },
  {
    id: "food",
    label: "Food Spent",
    endpoint: "/api/metrics/food-per-restaurant",
    format: "currency",
  },
  {
    id: "alcohol",
    label: "Alcohol Spent",
    endpoint: "/api/metrics/alcohol-per-restaurant",
    format: "currency",
  },
  {
    id: "month",
    label: "Totals per Month",
    endpoint: "/api/metrics/totals-per-month",
    format: "currency",
  },
  {
    id: "year",
    label: "Totals per Year",
    endpoint: "/api/metrics/totals-per-year",
    format: "currency",
  },
];

function App() {
  const [activePage, setActivePage] = useState(pages[0]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Restaurant Dashboard</h1>
          <p>CS5200 Summer 2026</p>
          <p>Catherine Han</p>
        </div>

        <nav className="sidebar-nav">
          {pages.map((page) => (
            <button
              key={page.id}
              className={activePage.id === page.id ? "nav-button active" : "nav-button"}
              onClick={() => setActivePage(page)}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <DashboardPage
          key={activePage.id}
          page={activePage}
          apiBaseUrl={API_BASE_URL}
        />
      </main>
    </div>
  );
}

export default App;