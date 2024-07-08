import React, { useState } from 'react';
import {
    Box, Button, Grid, Radio, RadioGroup, FormControlLabel, FormControl,
    FormLabel, TextField, Typography, Paper
} from '@mui/material';

const frequencyCategories = [
    { label: 'HF - Shortwave Radio', range: { start: 3e6, stop: 30e6 } },
    { label: 'VHF - TV Broadcast, FM Radio, Air Traffic Control', range: { start: 30e6, stop: 300e6 } },
    { label: 'UHF - Mobile Phones, Wi-Fi, Bluetooth, GPS', range: { start: 300e6, stop: 3e9 } },
    { label: 'SHF - Radar, Satellite Communications, Microwave Ovens', range: { start: 3e9, stop: 30e9 } },
    { label: 'EHF - Radio Astronomy, High-Frequency Data Links', range: { start: 30e9, stop: 300e9 } },
];

const frequencyUnits = ['Hz', 'kHz', 'MHz', 'GHz'];

function ConfigForm({ onSubmit, onStop, isScanning }) {
    const [config, setConfig] = useState({
        ppm_error: 0,
        tuner_gain: 10,
        bandwidth: 2.4e6,
        samples: 1024,
        fft: 1024,
        frequencies_ranges: [{ start: 100e6, stop: 110e6 }],
        ignored_frequencies_ranges: [{ start: 100e6, stop: 105e6 }],
        noise_level: -100,
        frequency_category: '',
        frequency_unit: 'Hz'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig((prevConfig) => ({
            ...prevConfig,
            [name]: value,
        }));
    };

    const handleCategoryChange = (e) => {
        const selectedCategory = frequencyCategories.find(category => category.label === e.target.value);
        if (selectedCategory) {
            setConfig((prevConfig) => ({
                ...prevConfig,
                frequencies_ranges: [selectedCategory.range],
                frequency_category: e.target.value
            }));
        }
    };

    const handleUnitChange = (e) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            frequency_unit: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(config);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ padding: 4, backgroundColor: '#1e1e2f', borderRadius: 2, marginTop: 4 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                    Configuration
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Box component={Paper} sx={{ padding: 2, backgroundColor: '#2e2e3f' }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Frequency Category</FormLabel>
                                <RadioGroup
                                    name="frequency_category"
                                    value={config.frequency_category}
                                    onChange={handleCategoryChange}
                                >
                                    {frequencyCategories.map((category, index) => (
                                        <FormControlLabel
                                            key={index}
                                            value={category.label}
                                            control={<Radio />}
                                            label={category.label}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box component={Paper} sx={{ padding: 2, backgroundColor: '#2e2e3f' }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Frequency Unit</FormLabel>
                                <RadioGroup
                                    name="frequency_unit"
                                    value={config.frequency_unit}
                                    onChange={handleUnitChange}
                                >
                                    {frequencyUnits.map((unit, index) => (
                                        <FormControlLabel
                                            key={index}
                                            value={unit}
                                            control={<Radio />}
                                            label={unit}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="PPM Error"
                            type="number"
                            name="ppm_error"
                            value={config.ppm_error}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Tuner Gain"
                            type="number"
                            name="tuner_gain"
                            value={config.tuner_gain}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Bandwidth"
                            type="number"
                            name="bandwidth"
                            value={config.bandwidth}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Samples"
                            type="number"
                            name="samples"
                            value={config.samples}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="FFT"
                            type="number"
                            name="fft"
                            value={config.fft}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Frequencies Range Start"
                            type="number"
                            name="frequencies_ranges_start"
                            value={config.frequencies_ranges[0].start}
                            onChange={(e) => handleChange({ target: { name: 'frequencies_ranges', value: [{ ...config.frequencies_ranges[0], start: e.target.value }] } })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Frequencies Range Stop"
                            type="number"
                            name="frequencies_ranges_stop"
                            value={config.frequencies_ranges[0].stop}
                            onChange={(e) => handleChange({ target: { name: 'frequencies_ranges', value: [{ ...config.frequencies_ranges[0], stop: e.target.value }] } })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Ignored Frequencies Range Start"
                            type="number"
                            name="ignored_frequencies_ranges_start"
                            value={config.ignored_frequencies_ranges[0].start}
                            onChange={(e) => handleChange({ target: { name: 'ignored_frequencies_ranges', value: [{ ...config.ignored_frequencies_ranges[0], start: e.target.value }] } })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Ignored Frequencies Range Stop"
                            type="number"
                            name="ignored_frequencies_ranges_stop"
                            value={config.ignored_frequencies_ranges[0].stop}
                            onChange={(e) => handleChange({ target: { name: 'ignored_frequencies_ranges', value: [{ ...config.ignored_frequencies_ranges[0], stop: e.target.value }] } })}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Noise Level"
                            type="number"
                            name="noise_level"
                            value={config.noise_level}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>
                <Box textAlign="center" mt={2}>
                    <Button type="submit" variant="contained" color="primary" disabled={isScanning}>
                        Start Scan
                    </Button>
                    {isScanning && (
                        <Button variant="contained" color="secondary" onClick={onStop} sx={{ ml: 2 }}>
                            Stop Scan
                        </Button>
                    )}
                </Box>
            </Box>
        </form>
    );
}

export default ConfigForm;
