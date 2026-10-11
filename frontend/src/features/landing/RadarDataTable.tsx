import type { RadarData } from "../../lib/types";

// Accessible text/table equivalent of the radar chart (FR-6.4): screen-reader readable.
export function RadarDataTable({ data }: { data: RadarData }) {
  return (
    <table className="w-full border-collapse text-sm" data-testid="radar-data-table">
      <caption className="sr-only">Required vs current skill levels</caption>
      <thead>
        <tr className="border-b border-slate-300 text-left">
          <th scope="col" className="py-2">Skill</th>
          <th scope="col" className="py-2">Required</th>
          <th scope="col" className="py-2">You</th>
          <th scope="col" className="py-2">Gap</th>
        </tr>
      </thead>
      <tbody>
        {data.axes.map((a) => {
          const gap = Math.max(0, a.required - a.current);
          return (
            <tr key={a.skillId} className="border-b border-slate-100">
              <th scope="row" className="py-2 font-normal">{a.skillName}</th>
              <td className="py-2">{Math.round(a.required * 100)}%</td>
              <td className="py-2">{Math.round(a.current * 100)}%</td>
              <td className="py-2">{Math.round(gap * 100)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
