import argparse
import datetime
import json
import logging
import os
from pyrtlsdr import RtlSdr
import signal
import subprocess
import time
import wave
import numpy as np

def config_logger(verbose, dir):
    """
    Configure the logger based on verbosity level and log directory.

    Args:
        verbose (int): Verbosity level.
        dir (str): Log directory path.
    """
    params = {}

    levels = [logging.ERROR, logging.WARNING, logging.INFO, logging.DEBUG]
    level = levels[min(len(levels) - 1, verbose)]

    params["format"] = "[%(asctime)s][%(levelname)7s][%(name)6s] %(message)s"
    params["level"] = level
    params["datefmt"] = "%Y-%m-%d %H:%M:%S"

    if dir:
        now = datetime.datetime.now()
        os.makedirs(f"{dir}/{now.year:04d}-{now.month:02d}-{now.day:02d}", exist_ok=True)
        filename = f"{dir}/{now.year:04d}-{now.month:02d}-{now.day:02d}/{now.hour:02d}_{now.minute:02d}_{now.second:02d}.txt"
        params["filename"] = filename

    logging.basicConfig(**params)

def __get_frequency_power(device, start, stop, **kwargs):
    """
    Get frequency power using RTL-SDR device.

    Args:
        device (RtlSdr): RTL-SDR device instance.
        start (int): Start frequency.
        stop (int): Stop frequency.
        kwargs (dict): Additional parameters.

    Returns:
        tuple: Frequencies and corresponding powers.
    """
    samples = kwargs["samples"]
    fft = kwargs["fft"]

    device.center_freq = (start + stop) // 2
    samples = device.read_samples(samples)
    powers, frequencies = np.abs(np.fft.fft(samples, fft)), np.fft.fftfreq(len(samples), 1/device.sample_rate)
    return frequencies + device.center_freq, np.log10(powers)

def __is_frequency_ok(frequency, **kwargs):
    """
    Check if the frequency is within the ignored ranges.

    Args:
        frequency (int): Frequency to check.
        kwargs (dict): Additional parameters.

    Returns:
        bool: True if frequency is okay, False otherwise.
    """
    ignored_frequencies_ranges = kwargs["ignored_frequencies_ranges"]
    return not any(_range["start"] <= frequency <= _range["stop"] for _range in ignored_frequencies_ranges)

def __filter_frequencies(frequencies, powers, **kwargs):
    """
    Filter frequencies based on power and ignore ranges.

    Args:
        frequencies (np.ndarray): Array of frequencies.
        powers (np.ndarray): Array of power levels.
        kwargs (dict): Additional parameters.

    Returns:
        tuple: Filtered frequencies and corresponding powers.
    """
    print_best_frequencies = max(1, kwargs["print_best_frequencies"])
    sorted_frequencies_indexes = np.argsort(powers)[::-1]

    indexes = []
    total = 0
    for i in sorted_frequencies_indexes:
        if __is_frequency_ok(int(frequencies[i]), **kwargs):
            indexes.append(i)
            total += 1
        if print_best_frequencies <= total:
            break
    return frequencies[indexes], powers[indexes]

def __detect_best_signal(frequencies, powers, filtered_frequencies, filtered_powers, **kwargs):
    """
    Detect the best signal based on power levels.

    Args:
        frequencies (np.ndarray): Array of frequencies.
        powers (np.ndarray): Array of power levels.
        filtered_frequencies (np.ndarray): Filtered array of frequencies.
        filtered_powers (np.ndarray): Filtered array of power levels.
        kwargs (dict): Additional parameters.

    Returns:
        tuple: Best frequency, power, and recording flag.
    """
    try:
        noise_level = float(kwargs["noise_level"])
    except ValueError:
        i = np.argmax(filtered_powers)
        if abs(filtered_frequencies[i] - frequencies[len(frequencies) // 2]) <= 1000:
            noise_level = filtered_powers[i]
        else:
            noise_level = -100

    for i in range(len(filtered_frequencies)):
        return (int(filtered_frequencies[i]), float(filtered_powers[i]), noise_level < float(filtered_powers[i]))

    return (0, -100.0, 0, False)

def __scan(device, **kwargs):
    """
    Perform frequency scan using the RTL-SDR device.

    Args:
        device (RtlSdr): RTL-SDR device instance.
        kwargs (dict): Additional parameters.
    """
    logger = logging.getLogger("sdr")
    print_best_frequencies = kwargs["print_best_frequencies"]
    filter_best_frequencies = kwargs["filter_best_frequencies"]
    bandwidth = kwargs["bandwidth"]
    disable_recording = kwargs["disable_recording"]

    recording = False
    best_frequencies = np.zeros(shape=0, dtype=np.int)
    best_powers = np.zeros(shape=0, dtype=np.float)
    for _range in kwargs["frequencies_ranges"]:
        start = _range["start"]
        stop = _range["stop"]
        for substart in range(start, stop, bandwidth):
            frequencies, powers = __get_frequency_power(device, substart, substart + bandwidth, **kwargs)
            filtered_frequencies, filtered_powers = __filter_frequencies(frequencies, powers, **kwargs)
            (frequency, power, _recording) = __detect_best_signal(frequencies, powers, filtered_frequencies, filtered_powers, **kwargs)

            recording = recording or _recording
            best_frequencies = np.concatenate((best_frequencies, filtered_frequencies))
            best_powers = np.concatenate((best_powers, filtered_powers))

            if _recording and not disable_recording:
                record(device, frequency, power, _range, **kwargs)

    if recording or not filter_best_frequencies:
        indexes = np.argsort(best_powers)[::-1][:print_best_frequencies]
        best_frequencies = best_frequencies[indexes]
        best_powers = best_powers[indexes]
        indexes = np.argsort(best_frequencies)
        best_frequencies = best_frequencies[indexes]
        best_powers = best_powers[indexes]
        for i in range(len(best_frequencies)):
            logger.debug(format_frequency_power(int(best_frequencies[i]), float(best_powers[i])))
        if 1 < print_best_frequencies:
            logger.debug("-" * 80)

def __filter_ranges(**kwargs):
    """
    Filter and adjust frequency ranges to fit the bandwidth.

    Args:
        kwargs (dict): Additional parameters.

    Returns:
        list: Adjusted frequency ranges.
    """
    ranges = []
    logger = logging.getLogger("sdr")
    bandwidth = kwargs["bandwidth"]
    for _range in kwargs["frequencies_ranges"]:
        start = _range["start"]
        stop = _range["stop"]
        if (stop - start) % bandwidth != 0:
            _range["stop"] = start + (bandwidth * math.ceil((stop - start) / bandwidth))
            logger.warning(
                "frequency range: %s error! range not fit to bandwidth: %s! adjusting range end to %s!",
                format_frequency_range(start, stop),
                format_frequency(bandwidth),
                format_frequency(_range["stop"]),
            )
        ranges.append(_range)
    if ranges:
        return ranges
    else:
        logger.error("empty frequency ranges! quitting!")
        exit(1)

def run(**kwargs):
    """
    Main function to run the SDR scanner.

    Args:
        kwargs (dict): Parameters for the SDR scanner.
    """
    print_ignored_frequencies(kwargs["ignored_frequencies_ranges"])
    print_frequencies_ranges(kwargs["frequencies_ranges"])
    separator("scanning started")
    kwargs["frequencies_ranges"] = __filter_ranges(**kwargs)
    try:
        device = RtlSdr()
        device.set_freq_correction(kwargs["ppm_error"])
        device.set_gain(kwargs["tuner_gain"])
        device.sample_rate = kwargs["bandwidth"]
        killer = ApplicationKiller()
        while killer.is_running:
            __scan(device, **kwargs)
    except Exception as e:
        logger = logging.getLogger("sdr")
        logger.critical("Device error, error message: " + str(e) + " quitting!")
        exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("config", help="path to config file", type=str, metavar="file")
    parser.add_argument("-ld", "--log_directory", help="store logs in directory", type=str, metavar="directory", default="")
    parser.add_argument("-v", "--verbose", action="count", help="verbose level", default=0)
    args = parser.parse_args()

    try:
        with open(args.config, "r") as fd:
            config = json.load(fd)
    except Exception as e:
        print("Error while loading json config: " + str(e))
        exit(1)

    config_logger(args.verbose, args.log_directory)
    run(**config)
