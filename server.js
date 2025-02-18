import express from 'express';
import cors from 'cors';
import axios from 'axios';
import vm from 'vm';
import * as math from 'mathjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL;

const SYSTEM_PROMPT = `You are a math expert that converts fuzzy function descriptions into JavaScript code using mathjs. 
Return ONLY valid JavaScript code that generates data points for plotting. The code must:
1. Use the provided 'math' object for calculations (it's already imported)
2. Store results in global.dataPoints variable (NOT const/let dataPoints)
3. Handle regular, parametric, and polar functions
4. Return array of {x, y} points
5. Default x range should be [-10, 10] with 200 points unless specified otherwise
6. Analyze function behavior to adjust range appropriately
7. Ensure reasonable y-axis scaling relative to x-axis

Example:
// Define the function
const func = (x) => x * math.log(math.abs(x));
// Generate x values with appropriate range and density
const xMin = -10, xMax = 10;
const numPoints = 200;
const xValues = math.range(xMin, xMax, (xMax - xMin) / numPoints).toArray();
// Calculate y values
const yValues = xValues.map(func);
// Create data points
global.dataPoints = xValues.map((x, i) => ({ x, y: yValues[i] }));`;

const MAX_RETRIES = 3;

app.post('/api/visualize', async (req, res) => {
  let retries = 0;
  
  const makeRequest = async () => {
    try {
      const { functionDesc } = req.body;
      console.log(`Attempt ${retries + 1} of ${MAX_RETRIES}`);
      
      const requestBody = {
        model: "meta-llama/Llama-3.3-70B-Instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: functionDesc }
        ],
        stream: false,
        max_tokens: 512,
        stop: ["null"],
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        frequency_penalty: 0.5,
        n: 1,
        response_format: {
          type: "text"
        }
      };

      const response = await axios.post(API_URL, requestBody, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      // 添加响应日志以便调试
      console.log('API Response:', JSON.stringify(response.data, null, 2));

      // 检查响应结构
      if (!response.data.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response format');
      }

      const code = response.data.choices[0].message.content.replace(/```javascript|```/g, '').trim();
      // 添加代码日志
      console.log('Generated code:', code);

      const context = {
        math,
        global: {},  // 添加全局对象
        console: { log: console.log }
      };

      try {
        vm.createContext(context);
        vm.runInContext(code, context, { timeout: 5000 });
        
        // 从全局对象中获取数据点
        const dataPoints = context.global.dataPoints;
        
        console.log('Context after execution:', {
          hasDataPoints: !!dataPoints,
          dataPointsLength: dataPoints?.length
        });

        if (!dataPoints) {
          throw new Error('No data points generated');
        }

        return res.json({ dataPoints });
      } catch (vmError) {
        console.error('VM execution error:', vmError);
        throw new Error('Code execution failed: ' + vmError.message);
      }

    } catch (error) {
      if (retries < MAX_RETRIES - 1 && error.response?.data?.code === 50501) {
        retries++;
        console.log(`Retrying... (${retries}/${MAX_RETRIES})`);
        return makeRequest();
      }
      
      console.error('Final error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      return res.status(500).json({
        error: '服务暂时不可用，请稍后再试',
        details: error.response?.data
      });
    }
  };

  await makeRequest();
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
