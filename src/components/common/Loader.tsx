import { Spinner } from "./widget/Spinner";

export const Loader = ({ text }: { text?: string }) => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white/60 backdrop-blur-md z-[9999] fixed inset-0 animate-in fade-in duration-300">
      <Spinner size={32} text={text} />
    </div>
  );
};
