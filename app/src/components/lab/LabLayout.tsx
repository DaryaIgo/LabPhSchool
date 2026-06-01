import { Link } from "react-router";
import { FlaskConical, ArrowLeft } from "lucide-react";

interface LabLayoutProps {
  title: string;
  topic: string;
  children: React.ReactNode;
}

export default function LabLayout({ title, topic, children }: LabLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#262e33]">
      {/* Header */}
      <div className="bg-[#1a1f22] border-b border-[#37474f]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/labs"
              className="inline-flex items-center gap-1 text-[#798389] hover:text-[#2eff8c] text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Все лабораторные
            </Link>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2eff8c]/10 text-[#2eff8c] text-xs font-medium">
              <FlaskConical size={14} />
              {topic}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-10">
        {children}
      </div>
    </div>
  );
}
