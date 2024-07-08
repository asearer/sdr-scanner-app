import React from 'react';
import { Box, Paper, Typography, Grid, Button } from '@mui/material';

const ScanResults = ({ results, onItemClick }) => {
    return (
        <Box sx={{ padding: 4, backgroundColor: '#1e1e2f', borderRadius: 2, marginTop: 4 }}>
            <Typography variant="h5" color="primary" gutterBottom>
                Scan Results
            </Typography>
            <Grid container spacing={2}>
                {results.map((result, index) => (
                    <Grid item xs={12} key={index}>
                        <Paper sx={{ padding: 2, backgroundColor: '#2e2e3f' }}>
                            <Typography variant="body1" gutterBottom>
                                Frequency: {result.frequency} Hz
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Signal Strength: {result.signalStrength} dB
                            </Typography>
                            <Button variant="outlined" onClick={() => onItemClick(result)}>
                                More Info
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ScanResults;
