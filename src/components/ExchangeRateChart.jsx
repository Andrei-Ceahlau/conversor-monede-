import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Înregistrăm componentele necesare pentru grafic
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExchangeRateChart = ({ fromCurrency, toCurrency }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRateHistory = async () => {
      setLoading(true);
      setError(null);

      const today = new Date();
      const past30Days = [...Array(30)].map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return date.toISOString().split("T")[0]; // Format YYYY-MM-DD
      }).reverse(); // Inversăm ordinea pentru a fi cronologic

      try {
        const res = await fetch(
          `https://api.frankfurter.app/${past30Days[0]}..?from=${fromCurrency}&to=${toCurrency}`
        );
        const data = await res.json();

        if (data.rates) {
          const dates = Object.keys(data.rates);
          const values = dates.map((date) => data.rates[date][toCurrency]);

          if (!values.length || values.every((val) => val === values[0])) {
            setError(`⚠️ Date insuficiente pentru ${fromCurrency} → ${toCurrency}.`);
            setChartData(null);
            return;
          }

          setChartData({
            labels: dates,
            datasets: [
              {
                label: `Evoluția ${fromCurrency} → ${toCurrency} (30 zile)`,
                data: values,
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.2)",
                borderWidth: 2,
                tension: 0.4,
              },
            ],
          });
        } else {
          setError("⚠️ Nu există date disponibile pentru această pereche valutară.");
          setChartData(null);
        }
      } catch (error) {
        setError("⚠️ Eroare la preluarea datelor.");
        setChartData(null);
      }

      setLoading(false);
    };

    fetchExchangeRateHistory();
  }, [fromCurrency, toCurrency]);

  return (
    <div className="chart-container">
      {loading ? (
        <p>🔄 Se încarcă graficul...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : chartData ? (
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      ) : (
        <p>⚠️ Nu există date disponibile.</p>
      )}
    </div>
  );
};

export default ExchangeRateChart;
