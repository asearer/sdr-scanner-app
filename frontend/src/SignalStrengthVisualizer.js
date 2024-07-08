import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const SignalStrengthVisualizer = ({ strength }) => {
    // Calculate color based on signal strength (example)
    const getColor = (strength) => {
        if (strength >= 80) return '#00ff00'; // Green
        if (strength >= 50) return '#ffff00'; // Yellow
        return '#ff0000'; // Red
    };

    return (
        <Box sx={{ padding: 4, backgroundColor: '#1e1e2f', borderRadius: 2, marginTop: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
                Signal Strength
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={strength} sx={{ borderRadius: 10 }} style={{ backgroundImage: `linear-gradient(to right, ${getColor(strength)} ${strength}%, transparent ${strength}% 100%)` }} />
                </Box>
                <Typography variant="body1" color="textSecondary">
                    {strength.toFixed(0)} dB
                </Typography>
            </Box>
        </Box>
    );
};

export default SignalStrengthVisualizer;
