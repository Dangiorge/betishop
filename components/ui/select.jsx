export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-colors ${className}`}
      {...props}>
      {children}
    </select>
  );
}
