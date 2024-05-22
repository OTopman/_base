import { AppSocket } from '@/Services/AppSocket';
import type socket from 'socket.io';
import { type DefaultEventsMap } from 'socket.io/dist/typed-events';

/**
 * Wraps a function to catch and handle asynchronous errors.
 *
 * @param {Function} fn - the function to be wrapped
 * @return {Promise} a promise that resolves or rejects based on the original function's behavior
 */
export default function catchIOAsync(fn: Function) {
	return (
		data?: any,
		io?: socket.Socket<
			DefaultEventsMap,
			DefaultEventsMap,
			DefaultEventsMap,
			any
		>,
	) => {
		return fn(data, io)!.catch((e: any) => {
			const { eventName } = data;
			if (!io) {
				io = AppSocket.init() as any;
			}
			// Handle production error
			if (process.env.NODE_ENV === 'production') {
				sendProductionError(e, eventName, io!);
			} else if (process.env.NODE_ENV === 'development') {
				sendDevelopmentError(e, eventName, io!);
			}
		});
	};
}

const sendProductionError = (
	err: any,
	eventName: string = 'general',
	io: socket.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
	if (err.isOperational) {
		return io.emit('error', {
			status: err.status,
			message: err.message,
			event: eventName,
			error: err,
		});
	} else {
		return io.emit('error', {
			status: 'failed',
			message: 'Something went wrong!',
			error: err,
			event: eventName,
			stack: err.stack,
		});
	}
};

const sendDevelopmentError = (
	err: any,
	eventName: string = 'general',
	io: socket.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
	return io.emit('error', {
		status: err.status,
		message: err.message,
		error: err,
		event: eventName,
		stackTrace: err.stack,
	});
};
