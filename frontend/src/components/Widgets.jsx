import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

export default function Widget({ widget, socket, onRemove }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (update) => {
      setData((prev) => [...prev.slice(-19), update]); // keep last 20 points
    };

    socket.on("price_update", handleUpdate);
    return () => socket.off("price_update", handleUpdate);
  }, [socket]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/10 hover:border-indigo-400 transition"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{widget.title}</h2>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-400 transition"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={["auto", "auto"]} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#60A5FA"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 text-sm text-gray-300">
        <strong>Last Price:</strong>{" "}
        {data.length > 0 ? `$${data[data.length - 1].price}` : "Loading..."}
      </div>
    </motion.div>
  );
}
