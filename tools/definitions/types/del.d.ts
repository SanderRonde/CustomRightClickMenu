export = del;
declare function del(patterns: string|string[], opts?: any): Promise<void>;
declare namespace del {
	function sync(patterns: string|string[], opts?: any): void;
}
