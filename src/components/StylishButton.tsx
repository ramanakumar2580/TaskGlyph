"use client";

export default function StylishButton({
  onClick,
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  icon,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  className?: string;
  icon?: React.ElementType; // Icon component
}) {
  const baseStyle =
    "px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";

  const primaryStyle =
    "bg-gray-900 text-white hover:bg-gray-700 focus:ring-gray-900";

  const secondaryStyle =
    "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400";

  const disabledStyle = "opacity-50 cursor-not-allowed";

  const IconComponent = icon;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyle}
        ${variant === "primary" ? primaryStyle : secondaryStyle}
        ${disabled ? disabledStyle : ""}
        ${className}
      `}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {children}
    </button>
  );
}
