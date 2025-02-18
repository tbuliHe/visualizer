import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Layout, Input, Button, Card, Alert, Spin, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const App = () => {
  const [input, setInput] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVisualize = async () => {
    if (!input.trim()) {
      setError('请输入函数描述');
      return;
    }

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
    <Layout className="layout">
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
          <Title level={3} style={{ margin: '16px 0' }}>Fuzzy Function Visualizer</Title>
        </div>
      </Header>
      <Content style={{ 
        padding: '24px', 
        maxWidth: '100%', // 移除最大宽度限制
        margin: '0 auto' 
      }}>
        <Card style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%',
          padding: '24px'
        }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述您的函数 (例如: 'y is approximately x squared')"
            autoSize={{ minRows: 3, maxRows: 6 }}
            style={{ marginBottom: '16px' }}
          />
          <Button 
            type="primary" 
            onClick={handleVisualize} 
            loading={loading}
            icon={<LineChartOutlined />}
          >
            可视化
          </Button>

          {error && (
            <Alert 
              message="错误" 
              description={error} 
              type="error" 
              showIcon 
              style={{ marginTop: '16px' }}
            />
          )}

          {loading && (
            <div style={{ textAlign: 'center', margin: '20px' }}>
              <Spin size="large" />
            </div>
          )}

          {data && (
            <div style={{ 
              marginTop: '20px',
              width: '90vw', // 使用视窗宽度的90%
              height: '90vh', // 使用视窗高度的90%
              maxWidth: '90vh', // 确保宽度不超过高度，保持正方形
              margin: '20px auto'
            }}>
              <Plot
                data={[{
                  x: data.map(p => p.x),
                  y: data.map(p => p.y),
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: '#1890ff' },
                }]}
                layout={{
                  width: undefined,
                  height: undefined, // 移除固定高度
                  title: '函数可视化',
                  dragmode: 'zoom',
                  showlegend: false,
                  autosize: true,
                  margin: { l: 50, r: 50, t: 50, b: 50 },
                  xaxis: {
                    autorange: true,
                    scaleanchor: "y",
                    scaleratio: 1,
                    constrain: 'domain', // 确保比例约束在可用空间内
                  },
                  yaxis: {
                    autorange: true,
                    scaleanchor: "x", // 双向锁定比例
                    scaleratio: 1,
                    constrain: 'domain',
                  },
                  aspectratio: { x: 1, y: 1 }, // 强制 1:1 的比例
                }}
                config={{
                  scrollZoom: true,
                  displayModeBar: true,
                  responsive: true,
                }}
                style={{ 
                  width: '100%',
                  height: '100%' 
                }}
                useResizeHandler={true} // 启用自动调整大小
              />
            </div>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default App;
