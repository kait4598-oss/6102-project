import React from 'react';
import ReactECharts from 'echarts-for-react';

interface AnalysisDashboardProps {
  data: {
    ai: {
      summary: string;
      steps: string[];
      preview: any[];
    };
    heatmap: {
      columns: string[];
      data: any[];
    };
    ml: {
      accuracy: number;
      feature: string;
      target: string;
      x: number[];
      y: number[];
      r2: number;
    } | null;
    error: string | null;
  };
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ data }) => {
  const { ai, heatmap, ml } = data;

  const getHeatmapOption = () => {
    return {
      tooltip: { position: 'top' },
      grid: { height: '70%', top: '10%' },
      xAxis: {
        type: 'category',
        data: heatmap.columns,
        splitArea: { show: true }
      },
      yAxis: {
        type: 'category',
        data: heatmap.columns,
        splitArea: { show: true }
      },
      visualMap: {
        min: -1,
        max: 1,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
        }
      },
      series: [{
        name: 'Correlation',
        type: 'heatmap',
        data: heatmap.data,
        label: { show: true },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };
  };

  const getLineOption = () => {
    if (!ml) return {};
    return {
      title: { text: `Prediction: ${ml.feature} vs ${ml.target}`, left: 'center', textStyle: { fontSize: 14 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', name: ml.feature },
      yAxis: { type: 'value', name: ml.target },
      series: [{
        data: ml.x.map((x, i) => [x, ml.y[i]]),
        type: 'scatter',
        symbolSize: 8,
      }]
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Window A: Data Preprocessing */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col">
        <h3 className="text-lg font-bold mb-2 border-b pb-2">A: AI Preprocessing</h3>
        <div className="mb-4 text-sm text-gray-600 italic">
          {ai.summary}
        </div>
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {ai.preview[0] && Object.keys(ai.preview[0]).map(key => (
                  <th key={key} className="px-2 py-1 border">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ai.preview.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {Object.values(row).map((val: any, j) => (
                    <td key={j} className="px-2 py-1 border truncate max-w-[100px]">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-2 bg-blue-50 rounded text-xs">
          <p className="font-bold text-blue-800 mb-1">AI Cleaning Steps:</p>
          <ul className="list-disc list-inside text-blue-700">
            {ai.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ul>
        </div>
      </div>

      {/* Window B: Heatmap */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-bold mb-2 border-b pb-2">B: Correlation Heatmap</h3>
        <div className="h-full pb-10">
          <ReactECharts option={getHeatmapOption()} style={{ height: '100%' }} />
        </div>
      </div>

      {/* Window C: Prediction */}
      <div className="bg-white p-4 rounded-lg shadow border flex flex-col">
        <h3 className="text-lg font-bold mb-2 border-b pb-2">C: Model Prediction</h3>
        <div className="flex-1">
          {ml ? (
            <ReactECharts option={getLineOption()} style={{ height: '100%' }} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Not enough numeric data for prediction
            </div>
          )}
        </div>
        {ml && (
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold text-green-600">{(ml.accuracy * 100).toFixed(2)}%</div>
            <div className="text-sm text-gray-500 font-medium">Model Accuracy (R²)</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisDashboard;
