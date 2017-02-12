/// <reference path="./elements.d.ts" />

interface IDMap {
	'error-reporting-tool': {
		'cropCanvas': HTMLCanvasElement;
		'overlay': HTMLElement;
		'highlightingRightSquare': ErrorReportingToolSquare;
		'highlightingLeftSquare': ErrorReportingToolSquare;
		'highlightingTopSquare': ErrorReportingToolSquare;
		'highlightingBotSquare': ErrorReportingToolSquare;
		'highlightButtons': HTMLElement;
		'errorReportingDialog': PaperDialog;
		'bugButton': HTMLElement;
		'reportingButtonElevation': PaperMaterial;
		'bugCheckmarkCont': HTMLElement;
		'bugCheckmark': HTMLElement;
	}
}