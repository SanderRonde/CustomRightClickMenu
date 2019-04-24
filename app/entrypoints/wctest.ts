import { 
	TemplateResult, PropertyCommitter, EventPart, 
	BooleanAttributePart, AttributeCommitter, 
	NodePart, isDirective, noChange 
} from '../modules/lit-html/lit-html.js';
import { SplashScreen } from "../wc-elements/util/splash-screen/splash-screen.js";
import { WebComponentTemplateManager } from "../modules/wclib/build/es/wclib.js";

WebComponentTemplateManager.initComplexTemplateProvider({
	TemplateResult, PropertyCommitter, EventPart,BooleanAttributePart,
	AttributeCommitter, NodePart, isDirective, noChange
});
SplashScreen.define();