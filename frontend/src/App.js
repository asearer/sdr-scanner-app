import React, { useState } from 'react';
import { Box, Button, Grid, Typography, Paper } from '@mui/material';
import ConfigForm from './ConfigForm';
import LineChart from './LineChart';

function App() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState([]);
    const [frequencyDetails, setFrequencyDetails] = useState(null);

    const handleStartScan = (config) => {
        setIsScanning(true);
        // Simulate scan and set results
        const results = generateMockResults(config);
        setScanResults(results);
        setIsScanning(false);
    };

    const handleStopScan = () => {
        setIsScanning(false);
    };

    const handleClearResults = () => {
        setScanResults([]);
    };

    const handleResultClick = (result) => {
        setFrequencyDetails(result);
    };

    const generateMockResults = (config) => {
        // Generate some mock data based on the config
        return [
            { frequency: config.frequencies_ranges[0].start, strength: Math.random() * 100 },
            { frequency: config.frequencies_ranges[0].stop, strength: Math.random() * 100 },
        ];
    };

    return (
        <Box sx={{ padding: 4, backgroundColor: '#1e1e2f', minHeight: '100vh' }}>
            <Typography variant="h3" color="primary" gutterBottom>
                SDR Scanner
            </Typography>
            <ConfigForm onSubmit={handleStartScan} onStop={handleStopScan} isScanning={isScanning} />
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                    Scan Results
                </Typography>
                {scanResults.length > 0 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box component={Paper} sx={{ padding: 2, backgroundColor: '#2e2e3f' }}>
                                <Typography variant="h6" color="secondary">Results</Typography>
                                {scanResults.map((result, index) => (
                                    <Button key={index} onClick={() => handleResultClick(result)}>
                                        Frequency: {result.frequency} Hz - Strength: {result.strength}
                                    </Button>
                                ))}
                                <Button variant="contained" color="secondary" onClick={handleClearResults}>
                                    Clear Results
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {frequencyDetails && (
                                <Box component={Paper} sx={{ padding: 2, backgroundColor: '#2e2e3f' }}>
                                    <Typography variant="h6" color="secondary">Frequency Details</Typography>
                                    <Typography>Frequency: {frequencyDetails.frequency} Hz</Typography>
                                    <Typography>Strength: {frequencyDetails.strength}</Typography>
                                </Box>
                            )}
                        </Grid>
                    </Grid>
                )}
                {scanResults.length > 0 && (
                    <Box sx={{ marginTop: 4 }}>
                        <LineChart data={scanResults} />
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default App;
