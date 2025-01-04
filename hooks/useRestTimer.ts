import { useCallback, useEffect, useState } from "react";

const DEFAULT_REST_TIME = 90; // 90 seconds

export function useRestTimer() {
	const [time, setTime] = useState(DEFAULT_REST_TIME);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		if (isRunning && time > 0) {
			intervalId = setInterval(() => {
				setTime((prev) => prev - 1);
			}, 1000);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isRunning, time]);

	const start = useCallback(() => {
		setTime(DEFAULT_REST_TIME);
		setIsRunning(true);
	}, []);

	const stop = useCallback(() => {
		setIsRunning(false);
	}, []);

	const reset = useCallback(() => {
		setTime(DEFAULT_REST_TIME);
		setIsRunning(false);
	}, []);

	const formatTime = useCallback((seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}, []);

	return {
		time,
		isRunning,
		start,
		stop,
		reset,
		formatTime,
	};
} 