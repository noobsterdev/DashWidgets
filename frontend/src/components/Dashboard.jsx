import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function Dashboard() {
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("price_update", (data) => {
      if (data.symbol === "BTC") {
        setPrice(data.price);
      }
    });

    return () => socket.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-96 text-center border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-4">Bitcoin (BTC)</h1>

        {price ? (
          <p className="text-5xl font-semibold text-green-400 animate-pulse">
            ${price.toLocaleString()}
          </p>
        ) : (
          <p className="text-gray-400 text-lg">Loading...</p>
        )}

        <p className="text-gray-500 mt-6 text-sm">
          Real-time BTC price via CoinGecko
        </p>
      </div>
    </div>
  );
}
