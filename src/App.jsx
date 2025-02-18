import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const App = () => {
  const [input, setInput] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVisualize = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/visualize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functionDesc: input })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Visualization failed');
      }
      
      if (!result.dataPoints) {
        throw new Error('No data points received');
      }
      
      setData(result.dataPoints);
    } catch (err) {
      console.error('Visualization error:', err);
      setError(err.response?.data?.error || '服务暂时不可用，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Fuzzy Function Visualizer</h1>
      <div className="input-section">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your function (e.g., 'y is approximately x squared')"
        />
        <button onClick={handleVisualize} disabled={loading}>
          {loading ? 'Processing...' : 'Visualize'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {data && (
        <Plot
          data={[{
            x: data.map(p => p.x),
            y: data.map(p => p.y),
            type: 'scatter',
            mode: 'lines',
          }]}
          layout={{
            width: 800,
            height: 600,
            title: 'Function Visualization',
            dragmode: 'zoom',
          }}
          config={{
            scrollZoom: true,
            displayModeBar: true,
          }}
        />
      )}
    </div>
  );
};

export default App;
