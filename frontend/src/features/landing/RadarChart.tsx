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
        backgroundColor: "rgba(99, 102, 241, 0.18)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: currentSeriesLabel,
        data: data.axes.map((a) => a.current),
        backgroundColor: "rgba(16, 185, 129, 0.18)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    scales: {
      r: {
        min: 0,
        max: 1,
        ticks: { stepSize: 0.2, showLabelBackdrop: false, color: "#94a3b8", font: { size: 11 } },
        grid: { color: "#e2e8f0" },
        angleLines: { color: "#e2e8f0" },
        pointLabels: { color: "#334155", font: { size: 13, weight: 600 as const } },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { font: { size: 13 }, usePointStyle: true, padding: 16 },
      },
    },
  };

  return (
    <div
      data-testid="radar-chart"
      aria-hidden="true"
      className="mx-auto w-full max-w-xl rounded-xl bg-white p-2"
    >
      <Radar data={chartData} options={options} />
    </div>
  );
}
