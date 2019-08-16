import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange, directive, Part
} from '../modules/lit-html/lit-html.js';
import { WebComponent } from "../modules/wc-lib/build/es/wc-lib.js";
import { SplashScreen } from "../wc-elements/util/splash-screen/splash-screen.js";
// import { CrmApp } from '../wc-elements/options/crm-app/crm-app.js';
import '@polymer/paper-button/paper-button.js';
import { ExtensionI18N } from '../js/shared.js';

WebComponent.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});

WebComponent.initI18N({
	urlFormat: '/localestemp/$LANG$/messages.json',
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