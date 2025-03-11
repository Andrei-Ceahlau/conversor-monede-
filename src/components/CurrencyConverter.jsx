import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./CurrencyConverter.css";
import ExchangeRateChart from "./ExchangeRateChart";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [recentConversions, setRecentConversions] = useState(() => {
    return JSON.parse(localStorage.getItem("recentConversions")) || [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("darkMode")) ?? true;
    } catch {
      return true;
    }
  });

  // Fetch lista de monede la încărcare
  useEffect(() => {
    fetch("https://api.frankfurter.app/currencies")
      .then((res) => res.json())
      .then((data) => {
        setCurrencies(Object.keys(data));
      })
      .catch((err) => console.error("Eroare la preluarea valutelor:", err));
  }, []);

  // Funcție pentru conversie la apăsarea butonului
  const convertCurrency = () => {
    if (amount > 0 && fromCurrency !== toCurrency) {
      fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=${toCurrency}`)
        .then((res) => res.json())
        .then((data) => {
          const result = (amount * data.rates[toCurrency]).toFixed(2);
          setConvertedAmount(result);
          saveConversion(amount, fromCurrency, result, toCurrency);
        })
        .catch((err) => console.error("Eroare la conversie:", err));
    }
  };

  // Funcție pentru salvarea conversiilor în Local Storage (maxim 5)
  const saveConversion = (amount, from, result, to) => {
    const newConversion = {
      id: Date.now(),
      text: `${amount} ${from} = ${result} ${to}`,
    };

    const updatedConversions = [newConversion, ...recentConversions.slice(0, 4)]; // Păstrăm max 5
    setRecentConversions(updatedConversions);
    localStorage.setItem("recentConversions", JSON.stringify(updatedConversions));
  };

  // Schimbă tema și salvează în Local Storage
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      return newMode;
    });
  };

  return (
    <div className={`container mt-5 ${darkMode ? "dark-mode" : ""}`}>
      <div className="animated-background"></div>

      <h2 className="fade-in">Conversor de Monede 💱</h2>

      {/* Buton Dark Mode */}
      <div className="dark-mode-switch fade-in" onClick={toggleDarkMode}>
        {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </div>

      <div className="card p-4 fade-in">
        <div className="mb-3">
          <label className="form-label">Sumă:</label>
          <input
            type="number"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
          />
        </div>

        <div className="row">
          <div className="col">
            <label className="form-label">Din:</label>
            <select
              className="form-select"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
            <label className="form-label">În:</label>
            <select
              className="form-select"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="btn btn-primary mt-3" onClick={convertCurrency}>
          🔄 Convertește
        </button>

        {convertedAmount && (
          <h4>
            {amount} {fromCurrency} = {convertedAmount} {toCurrency}
          </h4>
        )}

        {/* Graficul este mereu vizibil */}
        <ExchangeRateChart fromCurrency={fromCurrency} toCurrency={toCurrency} />
      </div>

      {/* Istoricul conversiilor */}
      <div className="card history mt-3 p-3 fade-in">
  <h5>📌 Istoricul Conversiilor</h5>
  {recentConversions.length > 0 ? (
    <ul className="list-group">
      {recentConversions.map((conv) => (
        <li key={conv.id} className="list-group-item">
          {conv.text}
        </li>
      ))}
    </ul>
  ) : (
    <p>🔍 Nicio conversie recentă.</p>
  )}
</div>

    </div>
  );
};

export default CurrencyConverter;
