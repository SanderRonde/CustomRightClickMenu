export = crisper;
declare function crisper(options: {
	source?: string;
	jsFileName?: string;
	scriptInHead?: boolean;
	onlySplit?: boolean;
	alwaysWriteScript?: boolean;
	cleanup?: boolean;
}): {
	html: string;
	js: string;
};
