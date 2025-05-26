import { forwardRef } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const variantClass = {
  success: "bg-green-100 text-green-700 border border-green-300",
  error: "bg-red-100 text-red-700 border border-red-300",
  info: "bg-blue-100 text-blue-700 border border-blue-300",
  warning: "bg-yellow-100 text-yellow-700 border border-yellow-300",
};

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningAmberIcon,
};

export const CustomSnackbar = forwardRef(({ message, variant }, ref) => {
  const Icon = variantIcon[variant] || InfoIcon;

  return (
    <div
      ref={ref}
      className={`p-3 rounded-md shadow-md mb-2 text-sm font-medium flex items-start gap-2 ${
        variantClass[variant] || ""
      }`}
    >
      <Icon className="mt-[2px]" fontSize="small" />
      <span>{message}</span>
    </div>
  );
});
