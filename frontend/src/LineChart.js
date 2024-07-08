import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                <p><strong>Frequency:</strong> {label} Hz</p>
                <p><strong>Power:</strong> {payload[0].value.toFixed(2)} dB</p>
            </div>
        );
    }
    return null;
};

const CustomLineChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="frequency" type="number" domain={['auto', 'auto']} allowDataOverflow />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="power" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CustomLineChart;
