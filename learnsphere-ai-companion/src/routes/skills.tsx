import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlassCard, PageHeader, GradientCard } from "@/components/ui-kit/Card";
import { Radar as RadarIcon } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/skills")({
  head: () => ({ meta: [{ title: "Skill Radar — LearnSphere AI" }] }),
  component: Skills,
});

const data = [
  { skill: "Coding", value: 92 },
  { skill: "Communication", value: 68 },
  { skill: "Aptitude", value: 85 },
  { skill: "Leadership", value: 74 },
  { skill: "Creativity", value: 80 },
  { skill: "Critical Thinking", value: 88 },
];

function Skills() {
  return (
    <AppLayout>
      <div className="bg-sky-50/40 -m-4 sm:-m-6 p-4 sm:p-6 rounded-3xl min-h-screen space-y-6">
        <PageHeader 
          title="Skill Radar" 
          subtitle="A real-time radar of your six core competencies." 
          icon={RadarIcon} 
        />
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
          <div className="bg-white border border-sky-200 rounded-3xl p-6 shadow-md shadow-sky-100/50 flex flex-col justify-center">
            <div className="h-[420px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#bae6fd" strokeWidth={1.5} />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fill: "#0c4a6e", fontSize: 13, fontWeight: "800" }} 
                  />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar 
                    dataKey="value" 
                    stroke="#0284c7" 
                    fill="url(#radarFill)" 
                    fillOpacity={0.45} 
                    strokeWidth={3.5} 
                    dot={{ r: 5, fill: "#0ea5e9", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.35} />
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3.5 flex flex-col justify-between">
            {data.map((d) => (
              <div 
                key={d.skill} 
                className="bg-white border border-sky-200/90 rounded-2xl p-4.5 shadow-sm hover:border-sky-300 hover:shadow-md transition flex flex-col justify-center"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-sky-950 text-sm tracking-wide">{d.skill}</span>
                  <span className="text-base font-extrabold font-mono text-sky-600 bg-sky-100/70 border border-sky-200 px-2.5 py-0.5 rounded-lg">
                    {d.value}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-sky-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-sky-500 shadow-sm" 
                    style={{ width: `${d.value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

