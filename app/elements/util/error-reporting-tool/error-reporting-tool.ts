/// <reference path="../../elements.d.ts" />

import { Polymer } from '../../../../tools/definitions/polymer';

declare global {
	interface ErrorReportingToolSquare extends HTMLElement {
		xPos: string;
		yPos: string;
	}
}

namespace ErrorReportingToolElement {
	export const errorReportingTool: {
		reportType: string;
		hide: boolean;
	} = {
		/**
		 * The type of the report
		 */
		reportType: {
			type: String,
			value: 'bug',
			notify: true
		},
		/**
		 * Whether this overlay needs to be hidden
		 */
		hide: {
			type: Boolean,
			value: true,
			notify: true
		}
	} as any;

	interface ErrorHandler {
		(event: Event | string, source?: string, fileno?: number, columnNumber?: number, error?: Error): boolean|undefined;
	}

	export class ERT {
		static is: any = 'error-reporting-tool';
		/**
		 * The last error that occurred in the console
		 */
		static lastErrors: {
			message: string;
			source: any;
			lineno: number;
			colno: number;
			error: Error;
			handled: boolean;
		}[] = [];

		static properties = errorReportingTool;

		static toggleVisibility(this: ErrorReportingTool) {
			this.hide = !this.hide;
		};

		static isBugType(this: ErrorReportingTool, reportType: string): boolean {
			return reportType === 'bug';
		}

		static reportBug(this: ErrorReportingTool) {
			this.reportType = 'bug';
			this.$.errorReportingDialog.open();
		};

		static async submitErrorReport(this: ErrorReportingTool) {
			//Take the user to the github page
			const messageBody = 'WRITE MESSAGE HERE\n';
			const title = (this.reportType === 'bug' ? 'Bug: ' : 'Feature: ') + 'TITLE HERE';
			window.open('https://github.com/SanderRonde/CustomRightClickMenu/issues/new?title=' + title + '&body=' + messageBody, '_blank');
		};

		private static _onError(this: ErrorReportingTool, message: string, 
			source: any, lineno: number, colno: number, error: 
			Error, handled: boolean) {
				this.lastErrors.push({
					message, source, lineno, colno, error, handled
				});
			};

		private static _registerOnError(this: ErrorReportingTool) {
			const handlers: ErrorHandler[] = [];
			if (window.onerror) {
				handlers.push(window.onerror as ErrorHandler);
			}
			window.onerror = (message: string, source: any, lineno: number, colno: number, error: Error) => {
				let handled: boolean = false;
				handlers.forEach((handler) => {
					if (handler(message, source, lineno, colno, error)) {
						handled = true;
					}
				});
				this._onError(message, source, lineno, colno, error, handled);
				if (handled) {
					return true;
				}
				return undefined;
			}

			Object.defineProperty(window, 'onerror', {
				set(handler: ErrorHandler) {
					handlers.push(handler);
				}
			});
		}

		static ready(this: ErrorReportingTool) {
			window.errorReportingTool = this;
			this._registerOnError();
		}
	}

	if (window.objectify) {
		window.register(ERT);
	} else {
		window.addEventListener('RegisterReady', () => {
			window.register(ERT);
		});
	}
}

export type ErrorReportingTool = Polymer.El<'error-reporting-tool', typeof ErrorReportingToolElement.ERT & 
	typeof ErrorReportingToolElement.errorReportingTool>;