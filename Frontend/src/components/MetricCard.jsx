// src/components/MetricCard.jsx
export default function MetricCard({ label, value, secondary }) {
  return (
    <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-500 truncate">{label}</div>
        <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
      </div>
      {secondary && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {secondary}
        </span>
      )}
    </div>
  );
}
