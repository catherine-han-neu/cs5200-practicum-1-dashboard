/* eslint-disable no-undef */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: true,
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA),
  },
});

const discountedFoodSql = `
  COALESCE(v.FoodBill, 0) * (1 - COALESCE(v.FoodDiscountPercentage, 0) / 100)
`;

const totalSpentSql = `
  ${discountedFoodSql}
  + COALESCE(v.AlcoholBill, 0)
  + COALESCE(v.TipAmount, 0)
`;

async function queryRows(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/api/metrics/visits-per-restaurant", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        r.RestaurantName AS label,
        COUNT(v.vID) AS value
      FROM Restaurant r
      LEFT JOIN Visit v ON r.rID = v.rID
      GROUP BY r.rID, r.RestaurantName;
    `);

    const summaryRows = await queryRows(`
      SELECT COUNT(*) AS total
      FROM Visit;
    `);

    res.json({
      title: "Total Visits per Restaurant",
      valueLabel: "Total Visits",
      summaryLabel: "Total Visits Across All Restaurants",
      summaryValue: summaryRows[0].total,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/metrics/total-per-restaurant", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        r.RestaurantName AS label,
        COALESCE(SUM(${totalSpentSql}), 0) AS value
      FROM Restaurant r
      LEFT JOIN Visit v ON r.rID = v.rID
      GROUP BY r.rID, r.RestaurantName;
    `);

    const summaryRows = await queryRows(`
      SELECT COALESCE(SUM(${totalSpentSql}), 0) AS total
      FROM Visit v;
    `);

    res.json({
      title: "Total Spent per Restaurant",
      valueLabel: "Total Spent",
      summaryLabel: "Total Spent Across All Restaurants",
      summaryValue: summaryRows[0].total,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/metrics/unique-customers-per-restaurant", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        r.RestaurantName AS label,
        COUNT(DISTINCT v.cID) AS value
      FROM Restaurant r
      LEFT JOIN Visit v ON r.rID = v.rID
      GROUP BY r.rID, r.RestaurantName;
    `);

    const summaryRows = await queryRows(`
      SELECT COUNT(DISTINCT cID) AS total
      FROM Visit;
    `);

    res.json({
      title: "Unique Customers per Restaurant",
      valueLabel: "Unique Customers",
      summaryLabel: "Unique Customers Across All Restaurants",
      summaryValue: summaryRows[0].total,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/metrics/food-per-restaurant", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        r.RestaurantName AS label,
        COALESCE(SUM(${discountedFoodSql}), 0) AS value
      FROM Restaurant r
      LEFT JOIN Visit v ON r.rID = v.rID
      GROUP BY r.rID, r.RestaurantName;
    `);

    const summaryRows = await queryRows(`
      SELECT COALESCE(SUM(${discountedFoodSql}), 0) AS total
      FROM Visit v;
    `);

    res.json({
      title: "Total Spent on Food per Restaurant",
      valueLabel: "Food Total",
      summaryLabel: "Food Total Across All Restaurants",
      summaryValue: summaryRows[0].total,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/metrics/alcohol-per-restaurant", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        r.RestaurantName AS label,
        COALESCE(SUM(v.AlcoholBill), 0) AS value
      FROM Restaurant r
      LEFT JOIN Visit v ON r.rID = v.rID
      GROUP BY r.rID, r.RestaurantName;
    `);

    const summaryRows = await queryRows(`
      SELECT COALESCE(SUM(AlcoholBill), 0) AS total
      FROM Visit;
    `);

    res.json({
      title: "Total Spent on Alcohol per Restaurant",
      valueLabel: "Alcohol Total",
      summaryLabel: "Alcohol Total Across All Restaurants",
      summaryValue: summaryRows[0].total,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/metrics/totals-per-month", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        DATE_FORMAT(v.VisitDate, '%Y-%m') AS label,
        COALESCE(SUM(${totalSpentSql}), 0) AS value
      FROM Visit v
      WHERE v.VisitDate IS NOT NULL
      GROUP BY DATE_FORMAT(v.VisitDate, '%Y-%m')
      ORDER BY label;
    `);

    res.json({
      title: "Totals per Month",
      valueLabel: "Total Spent",
      summaryLabel: null,
      summaryValue: null,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/metrics/totals-per-year", async (req, res) => {
  try {
    const rows = await queryRows(`
      SELECT 
        YEAR(v.VisitDate) AS label,
        COALESCE(SUM(${totalSpentSql}), 0) AS value
      FROM Visit v
      WHERE v.VisitDate IS NOT NULL
      GROUP BY YEAR(v.VisitDate)
      ORDER BY label;
    `);

    res.json({
      title: "Totals per Year",
      valueLabel: "Total Spent",
      summaryLabel: null,
      summaryValue: null,
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Dashboard API running on port ${PORT}`);
});