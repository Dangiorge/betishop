export default function Button({
  variant = "primary",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800",
    secondary:
      "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50",
    danger: "border border-red-200 text-red-600 bg-white hover:bg-red-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
