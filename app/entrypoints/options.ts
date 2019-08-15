import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange, directive, Part, DirectiveFn 
} from '../modules/lit-html/lit-html.js';
import { WebComponent } from "../modules/wc-lib/build/es/wc-lib.js";
import { SplashScreen } from "../wc-elements/util/splash-screen/splash-screen.js";
// import { CrmApp } from '../wc-elements/options/crm-app/crm-app.js';
import { I18NMessage } from '../localestemp/i18n';
import '@polymer/paper-button/paper-button.js';

WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});

namespace ExtensionI18N {
	type I18NMap = {
		[key: string]: I18NMessage;
	}
	type ParsedI18NMap = {
		[key: string]: {
			message: string;
			placeholders: {
				content: string;
				expr: RegExp;
			}[];
		}
	};

	const INDEX_REGEXPS = [
		new RegExp(/\$1/g),
		new RegExp(/\$2/g),
		new RegExp(/\$3/g),
		new RegExp(/\$4/g),
		new RegExp(/\$5/g),
		new RegExp(/\$6/g),
		new RegExp(/\$7/g),
		new RegExp(/\$8/g),
		new RegExp(/\$9/g)
	];

	const langFiles: WeakMap<I18NMap, ParsedI18NMap> = new WeakMap();
	function parseLangFile(file: I18NMap) {
		const parsed: ParsedI18NMap = {};
		for (const key in file) {
			if (key === '$schema' || key === 'comments') continue;
			const item = file[key];

			const placeholders: {
				content: string;
				expr: RegExp;
			}[] = [];
			for (const key in item.placeholders || {}) {
				const { content } = item.placeholders[key];
				placeholders.push({
					content,
					expr: new RegExp(`\\$${key}\\$`, 'gi')
				});
			}
			parsed[key] = {
				message: item.message || `{{${key}}}`,
				placeholders: placeholders
			};
		}
		return parsed;
	}
	function getLangFile(file: I18NMap) {
		if (!langFiles.has(file)) {
			langFiles.set(file, parseLangFile(file));
		}
		return langFiles.get(file)!;
	}

	class DummyPart<R> implements Part {
		public promise: Promise<R>;
		private _resolve: (value: R) => any;

		constructor(fn: DirectiveFn) {
			this.promise = new Promise((resolve) => {
				this._resolve = resolve;
			});
			fn(this);
		}

		public value: R = undefined;

		public setValue(value: R) {
			this.value = value;
		}

		public commit() {
			this._resolve(this.value);
		}
	}

	export async function getMessage(rawLangFile: I18NMap, key: string, values: any[]) {
		const langFile = getLangFile(rawLangFile);
		const entryData = langFile[key];
		if (!entryData) return `{{${key}}}`;

		let { message, placeholders } = entryData;
		if (!message) return `{{${key}}}`;
		if (!placeholders) return message;

		for (let i = 0; i < values.length; i++) {
			while (isDirective(values[i])) {
				values[i] = await new DummyPart(values[i]).promise;
			}
		}
		
		for (let i = 0; i < values.length; i++) {
			const expr = INDEX_REGEXPS[i];
			message = message.replace(expr, values[i]);
			placeholders.forEach((placeholder) => {
				placeholder.content = placeholder.content.replace(expr, values[i]);
			});
		}
		for (const { expr, content } of placeholders) {
			message = message.replace(expr, content);
		}
		return message;
	}
}

WebComponent.initI18N({
	urlFormat: '/_locales/$LANG$/messages.json',
	defaultLang: 'en',
	returner: directive((promise: Promise<string>, content: string) => (part: Part) => {
		part.setValue(content);
		promise.then((value) => {
			if (part.value === content) {
				part.setValue(value);
				part.commit();
			}
		});
	}),
	getMessage: ExtensionI18N.getMessage
});
SplashScreen.define();
// CrmApp.define();