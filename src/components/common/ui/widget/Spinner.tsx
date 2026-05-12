import { ClipLoader } from "react-spinners";

interface SpinnerProps {
  text?: string;
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner = ({
  text,
  size = 28,
  color = "#1D1D1F",
  className = "",
}: SpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <ClipLoader size={size} color={color} speedMultiplier={0.8} />
      </div>
      {text && (
        <p className="font-medium text-gray-500 text-[13px] tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};
