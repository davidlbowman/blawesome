import { useCallback, useEffect, useState } from "react";

export function useRestTimer() {
	const [time, setTime] = useState(0);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		let intervalId: ReturnType<typeof setInterval>;

		if (isRunning) {
			intervalId = setInterval(() => {
				setTime((prev) => prev + 1);
			}, 1000);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [isRunning]);

	const start = useCallback(() => {
		setTime(0);
		setIsRunning(true);
	}, []);

	const stop = useCallback(() => {
		setIsRunning(false);
	}, []);

	const reset = useCallback(() => {
		setTime(0);
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