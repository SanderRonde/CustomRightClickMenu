import { Stream } from "stream";

export = NodeStreamZip;

interface FileEntry {

}

declare class NodeStreamZip {
	constructor(config: {
		file?: string;
		storeEntries?: boolean;
		skipEntryNameValidation?: boolean;
	});

	entries(): {[key: string]: FileEntry};
	entry(name: string): FileEntry;
	stream(entry: FileEntry, fn: (err: Error|null, stm: Stream) => void): void;
	extract(filename: string|null, files: string, callback: (err?: Error) => void): void;
	close(): void;

	on(event: string, callback: () => void): void;
}
