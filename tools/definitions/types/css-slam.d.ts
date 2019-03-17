export = cssSlam;
declare namespace cssSlam {
	function css(content: string, options?: {
		stripWhitespace?: boolean;
	}): string;
	function html(content: string, options?: {
		stripWhitespace?: boolean;
	}): string;
}