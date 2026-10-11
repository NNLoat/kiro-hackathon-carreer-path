import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { RadarData } from "../../lib/types";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface RadarChartProps {
  data: RadarData;
  currentSeriesLabel?: string;
  careerLabel?: string;
}

// Chart.js radar: required (active career) vs current competency. Canvas is not screen-reader
// readable, so RadarDataTable renders the same data accessibly (FR-6.4).
export function RadarChart({ data, currentSeriesLabel = "You", careerLabel = "Required" }: RadarChartProps) {
  const chartData = {
    labels: data.axes.map((a) => a.skillName),
    datasets: [
      {
        label: careerLabel,
        data: data.axes.map((a) => a.required),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "rgb(99, 102, 241)",
        pointBackgroundColor: "rgb(99, 102, 241)",
      },
      {
        label: currentSeriesLabel,
        data: data.axes.map((a) => a.current),
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        borderColor: "rgb(16, 185, 129)",
        pointBackgroundColor: "rgb(16, 185, 129)",
      },
    ],
  };

  const options = {
    responsive: true,
    scales: { r: { min: 0, max: 1, ticks: { stepSize: 0.2 } } },
    plugins: { legend: { position: "top" as const } },
  };

  return (
    <div data-testid="radar-chart" aria-hidden="true" className="mx-auto max-w-md">
      <Radar data={chartData} options={options} />
    </div>
  );
}
