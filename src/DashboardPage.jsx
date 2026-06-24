import { useEffect, useMemo, useState } from "react";

const ROWS_PER_PAGE = 10;

function formatValue(value, format) {
  const number = Number(value);

  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(number);
  }

  return new Intl.NumberFormat("en-US").format(number);
}

function DashboardPage({ page, apiBaseUrl }) {
  const [data, setData] = useState(null);
  const [sortMode, setSortMode] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setStatus("loading");
        setError("");

        const response = await fetch(`${apiBaseUrl}${page.endpoint}`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        setStatus("success");
      } catch (err) {
        setError(err.message);
        setStatus("error");
      }
    }

    loadData();
  }, [apiBaseUrl, page.endpoint]);

  const sortedRows = useMemo(() => {
    if (!data?.rows) return [];

    const rows = [...data.rows];

    if (sortMode === "asc") {
      rows.sort((a, b) => Number(a.value) - Number(b.value));
    } else if (sortMode === "desc") {
      rows.sort((a, b) => Number(b.value) - Number(a.value));
    } else if (sortMode === "alpha") {
      rows.sort((a, b) => String(a.label).localeCompare(String(b.label)));
    }

    return rows;
  }, [data, sortMode]);

  const maxValue = Math.max(
    ...sortedRows.map((row) => Number(row.value)),
    1
  );

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / ROWS_PER_PAGE));

  const visibleRows = sortedRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  function handleSort(newSortMode) {
    setSortMode(newSortMode);
    setCurrentPage(1);
  }

  if (status === "loading") {
    return <p className="status-message">Loading dashboard data...</p>;
  }

  if (status === "error") {
    return (
      <div className="error-box">
        <h2>Could not load data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="dashboard-page">
      <header className="page-header">
        <div>
          <h2>{data.title}</h2>
          <p>Live data from Aiven MySQL</p>
        </div>
      </header>

      {data.summaryLabel && (
        <div className="summary-card">
          <span>{data.summaryLabel}</span>
          <strong>{formatValue(data.summaryValue, page.format)}</strong>
        </div>
      )}

      <div className="table-card">
        <div className="table-toolbar">
          <div>
            <h3>{data.valueLabel}</h3>
            <p>
              Showing {visibleRows.length} of {sortedRows.length} records
            </p>
          </div>

          <div className="sort-buttons">
            <button
              className={sortMode === "desc" ? "active" : ""}
              onClick={() => handleSort("desc")}
            >
              Descending
            </button>
            <button
              className={sortMode === "asc" ? "active" : ""}
              onClick={() => handleSort("asc")}
            >
              Ascending
            </button>
            <button
              className={sortMode === "alpha" ? "active" : ""}
              onClick={() => handleSort("alpha")}
            >
              Alphabetical
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>{page.id === "month" ? "Month" : page.id === "year" ? "Year" : "Restaurant Name"}</th>
              <th>{data.valueLabel}</th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>
                  <div className="value-cell">
                    <div
                      className="value-bar"
                      style={{
                        width: `${(Number(row.value) / maxValue) * 100}%`,
                      }}
                    />
                    <span className="value-text">
                      {formatValue(row.value, page.format)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => setCurrentPage((pageNumber) => pageNumber - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((pageNumber) => pageNumber + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;