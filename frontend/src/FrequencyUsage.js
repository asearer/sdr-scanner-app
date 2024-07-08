import React from 'react';
import { Box, Typography } from '@mui/material';

// Define a function to map frequencies to their typical usage
const getFrequencyUsage = (frequency) => {
    if (frequency >= 3e6 && frequency <= 30e6) {
        return 'HF - Shortwave Radio';
    } else if (frequency > 30e6 && frequency <= 300e6) {
        return 'VHF - TV Broadcast, FM Radio, Air Traffic Control';
    } else if (frequency > 300e6 && frequency <= 3e9) {
        return 'UHF - Mobile Phones, Wi-Fi, Bluetooth, GPS';
    } else if (frequency > 3e9 && frequency <= 30e9) {
        return 'SHF - Radar, Satellite Communications, Microwave Ovens';
    } else if (frequency > 30e9 && frequency <= 300e9) {
        return 'EHF - Radio Astronomy, High-Frequency Data Links';
    } else {
        return 'Unknown Frequency Range';
    }
};

function FrequencyUsage({ frequency }) {
    const usage = getFrequencyUsage(frequency);

    return (
        <Box sx={{ padding: 2, backgroundColor: '#1e1e2f', borderRadius: 2, marginTop: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>
                Frequency Usage
            </Typography>
            <Typography variant="body1" color="textSecondary">
                Frequency: {frequency} Hz
            </Typography>
            <Typography variant="body1" color="textSecondary">
                Typical Usage: {usage}
            </Typography>
        </Box>
    );
}

export default FrequencyUsage;
