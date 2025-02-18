import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Layout, Input, Button, Card, Alert, Spin, Typography, List, Switch, Tag, Row, Col } from 'antd';
import { LineChartOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const App = () => {
  const [input, setInput] = useState('');
  const [functions, setFunctions] = useState([]); // 存储多个函数的数据
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 添加新函数
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
      
      // 添加新函数到列表
      setFunctions(prev => [...prev, {
        id: Date.now(),
        description: input,
        data: result.dataPoints,
        visible: true,
        color: `hsl(${Math.random() * 360}, 70%, 50%)` // 随机颜色
      }]);
      
      // 清空输入框
      setInput('');
    } catch (err) {
      console.error('Visualization error:', err);
      setError(err.response?.data?.error || '服务暂时不可用，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 删除函数
  const handleDelete = (id) => {
    setFunctions(prev => prev.filter(f => f.id !== id));
  };

  // 切换函数可见性
  const handleToggleVisibility = (id) => {
    setFunctions(prev => prev.map(f => 
      f.id === id ? { ...f, visible: !f.visible } : f
    ));
  };

  return (
    <Layout className="layout">
      <Header style={{ background: '#fff', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <LineChartOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
          <Title level={3} style={{ margin: '16px 0' }}>Fuzzy Function Visualizer</Title>
        </div>
      </Header>
      <Content style={{ padding: '24px', height: 'calc(100vh - 64px)' }}>
        <Row gutter={24}>
          {/* 左侧控制面板 */}
          <Col span={8}>
            <Card style={{ height: '100%', overflow: 'auto' }}>
              <div style={{ marginBottom: '20px' }}>
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
                  icon={<PlusOutlined />}
                >
                  添加函数
                </Button>
              </div>

              {error && (
                <Alert 
                  message="错误" 
                  description={error} 
                  type="error" 
                  showIcon 
                  style={{ marginBottom: '16px' }}
                />
              )}

              {loading && (
                <div style={{ textAlign: 'center', margin: '20px' }}>
                  <Spin size="large" />
                </div>
              )}

              {functions.length > 0 && (
                <List
                  style={{ marginBottom: '20px' }}
                  itemLayout="horizontal"
                  dataSource={functions}
                  renderItem={(func) => (
                    <List.Item
                      actions={[
                        <Switch
                          checked={func.visible}
                          onChange={() => handleToggleVisibility(func.id)}
                          checkedChildren="显示"
                          unCheckedChildren="隐藏"
                          size="small"
                        />,
                        <Button 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleDelete(func.id)}
                        />
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Tag color={func.color} style={{ width: '20px', height: '20px' }} />
                        }
                        title={
                          <div style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            maxWidth: '200px' 
                          }}>
                            {func.description}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          {/* 右侧图表区域 */}
          <Col span={16}>
            <Card style={{ height: '100%' }}>
              {functions.length > 0 && (
                <Plot
                  data={functions
                    .filter(f => f.visible)
                    .map(f => ({
                      x: f.data.map(p => p.x),
                      y: f.data.map(p => p.y),
                      type: 'scatter',
                      mode: 'lines',
                      name: f.description.substring(0, 30) + (f.description.length > 30 ? '...' : ''),
                      line: { color: f.color },
                    }))}
                  layout={{
                    width: undefined,
                    height: undefined,
                    title: '函数可视化',
                    showlegend: true,
                    autosize: true,
                    margin: { l: 50, r: 50, t: 50, b: 50 },
                    xaxis: {
                      autorange: true,
                      scaleanchor: "y",
                      scaleratio: 1,
                    },
                    yaxis: {
                      autorange: true,
                      scaleanchor: "x",
                      scaleratio: 1,
                    },
                    legend: {
                      orientation: 'h',
                      yanchor: 'bottom',
                      y: -0.2,
                      xanchor: 'center',
                      x: 0.5,
                      traceorder: 'normal'
                    }
                  }}
                  config={{
                    scrollZoom: true,
                    displayModeBar: true,
                    responsive: true,
                  }}
                  style={{ 
                    width: '100%',
                    height: 'calc(100vh - 160px)'
                  }}
                  useResizeHandler={true}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default App;
