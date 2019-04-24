import { TemplateFn, CHANGE_TYPE } from "../../../modules/wclib/build/es/wclib.js";
import { render } from '../../../modules/lit-html/lit-html.js'
import { SplashScreen } from "./splash-screen.js";

export const SplashScreenHTML = new TemplateFn<SplashScreen>(function (html, props) {
	return html`
		<div id="splashContainer" class="${{
			invisible: props.finished,
			visible: props.visible
		}}">
			<div id="splashVerticalCenterer">
				<div id="splashHorizontalCenterer">
					<div id="splashContent">
						<div id="splashTitle">${props.name}</div>
						<div id="splashLoaderCenterer">
							<div id="splashBarCont">
								<div id="progressBar"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div ?hidden="${!props.finished}" id="contentContainer">
			<slot id="content"></slot>
		</div>
	`;
}, CHANGE_TYPE.PROP, render);
