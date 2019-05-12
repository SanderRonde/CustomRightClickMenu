import { CrmApp, AddedPermissionsTabContainerEl, ScriptUpdatesToastEl, CodeSettingsDialogEl, ChooseFileDialogEl } from "../options/crm-app/crm-app";
import { PaperToggleOption } from '../options/inputs/paper-toggle-option/paper-toggle-option';
import { WebComponent } from "../../modules/wclib/build/es/wclib";

export type WCTagNameMaps = {
	'crm-app': CrmApp;
	'paper-input': any; // TODO:
	'paper-icon-button': any; //TODO:
	'paper-checkbox': any; //TODO:
	'paper-dropdown-menu': any; //TODO:
	'paper-array-input': any; //TODO:
	'paper-toggle-option': PaperToggleOption;
}

export type TagNameMaps = WCTagNameMaps & 
	HTMLElementTagNameMap & ElementTagNameMap;

declare global {
	interface HTMLPaperIconButtonElement extends WebComponent {
		icon: string;
	}

	interface PaperDialogBase extends WebComponent {
		opened: boolean;
		toggle(): void;
		close(): void;
		open(): void;
		fit(): void;
	}

	interface HTMLPaperDialogElement extends PaperDialogBase {
		init(): void;
	}

	interface HTMLPaperToastElement extends WebComponent {
		hide(): void;
		show(): void;
		text: string;
		duration: number;
	}

	interface HTMLPaperInputElement extends WebComponent {
		invalid: boolean;
		errorMessage: string;
		label: string;
		value: string;
	}

	interface HTMLPaperInputContainerElement extends WebComponent {
		
	}

	interface HTMLPaperCheckboxElement extends WebComponent {
		checked: boolean;
		disabled: boolean;
	}

	interface HTMLDomRepeatElement extends WebComponent {
		items: Array<any>;
		as: string;
		render(): void;
	}

	interface HTMLDomIfElement extends WebComponent {
		if: boolean;
		render(): void;
	}

	//TODO: 
	type HTMLPaperMenuElement = any; // PaperMenu;

	interface HTMLPaperSpinnerElement extends WebComponent {
		active: boolean;
	}

	interface HTMLPaperRadioGroupElement extends WebComponent {
		selected: string;
	}

	interface HTMLPaperRadioButtonElement extends WebComponent {
		checked: boolean;
	}

	interface HTMLPaperMaterialElement extends WebComponent {
		elevation: string;
	}

	interface HTMLPaperButtonElement extends WebComponent {
		
	}

	interface HTMLPaperTextareaElement extends WebComponent {
		invalid: boolean;
		value: string;
	}

	interface HTMLPaperItemElement extends WebComponent {

	}

	interface HTMLPaperToggleButtonElement extends WebComponent {
		checked: boolean;
	}

	interface HTMLPaperToolbarElement extends WebComponent {

	}

	interface SVGElement {
		readonly style: CSSStyleDeclaration;
	}

	interface HTMLMetadataElement extends SVGElement {}
	interface HTMLGElement extends SVGElement {}
	interface HTMLPathElement extends SVGElement {}
	interface HTMLRectElement extends SVGElement {}

	//TODO: all of these
	type HTMLPaperLibrariesSelectorElement = any; // PaperLibrariesSelector;
	type HTMLPaperGetPagePropertiesElement = any; // PaperGetPageProperties;
	type HTMLCrmEditPageElement = any; // CrmEditPage;
	type HTMLPaperToggleOptionElement = PaperToggleOption;
	type HTMLEditCrmElement = any; // EditCrm;
	type HTMLEditCrmItemElement = any; // EditCrmItem;
	type HTMLCenterElementElement = any; // CenterElement;
	type HTMLPaperSearchWebsiteDialogElement = any; // PaperSearchWebsiteDialog;
	type HTMLUseExternalEditorElement = any; // UseExternalEditor;
	type HTMLTypeSwitcherElement = any; // TypeSwitcher;
	type HTMLPaperDropdownMenuElement = any; // PaperDropdownMenu;
	type HTMLPaperArrayInputElement = any; // PaperArrayInput;
	type HTMLPaperRipplElement = any; // HTMLElement;
	type HTMLEchoHtmlElement = any; // EchoHtml;
	type HTMLMonacoEditorElement = any; // MonacoEditor;
	type HTMLChangeLogElement = any; // ChangeLog;
	type HTMLCrmAppElement = any; // CrmApp;
	type HTMLDefaultLinkElement = any; // DefaultLink;
	type HTMLDividerEditElement = any; // NodeEditBehaviorDividerInstance;
	type HTMLErrorReportingToolElement = any; // ErrorReportingTool;
	type HTMLInstallConfirmElement = any; // InstallConfirm;
	type HTMLInstallErrorElement = any; // Polymer.El<'install-error', {}>;
	type HTMLInstallPageElement = any; // InstallPage;
	type HTMLLinkEditElement = any; // NodeEditBehaviorLinkInstance;
	type HTMLLogConsoleElement = any; // LogConsole;
	type HTMLLogPageElement = any; // LogPage;
	type HTMLMenuEditElement = any; // NodeEditBehaviorMenuInstance;
	type HTMLScriptEditElement = any; // CodeEditBehaviorScriptInstance;
	type HTMLStylesheetEditElement = any; // CodeEditBehaviorStylesheetInstance;
	type HTMLSplashScreenElement = any; // SplashScreen;
	type HTMLAnimatedButtonElement = any; // AnimatedButton;
	type HTMLLangSelectorElement = any; // LangSelector;

	type AddedPermissionsTabContainer = AddedPermissionsTabContainerEl; //TODO:
	type CodeSettingsDialog = CodeSettingsDialogEl; //TODO:
	type ScriptUpdatesToast = ScriptUpdatesToastEl; //TODO:
	type ChooseFileDialog = ChooseFileDialogEl; //TODO:
}

