import * as logSymbols from 'log-symbols';
import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';

function dashesToUppercase(name: string) {
	let newName = '';
	for (let i = 0; i < name.length; i++) {
		if (name[i] === '-') {
			newName += name[i + 1].toUpperCase();
			i++;
		} else {
			newName += name[i];
		}
	}
	return newName;
}

function capitalize(name: string) {
	return name[0].toUpperCase() + name.slice(1);
}

const wclibPath = 'wclib/build/es/wclib.js';
const litHtmlPath = 'lit-html/lit-html.js';

const indexTemplate = (name: string, modulePath: string) => 
`import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '${modulePath}/${wclibPath}';
import { ${capitalize(dashesToUppercase(name))}IDMap, ${capitalize(dashesToUppercase(name))}ClassMap } from './${name}-querymap';
import { ${capitalize(dashesToUppercase(name))}HTML } from './${name}.html.js';
import { ${capitalize(dashesToUppercase(name))}CSS } from './${name}.css.js';

@config({
	is: '${name}',
	css: ${capitalize(dashesToUppercase(name))}CSS,
	html: ${capitalize(dashesToUppercase(name))}HTML
})
export class ${capitalize(dashesToUppercase(name))} extends ConfigurableWebComponent<{
	IDS: ${capitalize(dashesToUppercase(name))}IDMap;
	CLASSES: ${capitalize(dashesToUppercase(name))}ClassMap;
}> {
	props = Props.define(this, {
		// ...
	});

	mounted() {
		// ...
	}

	firstRender() {
		// ...
	}
}`;

const htmlTemplate = (name: string, modulePath: string) => 
`import { TemplateFn, CHANGE_TYPE } from '${modulePath}/${wclibPath}';
import { render } from '${modulePath}/${litHtmlPath}';
import { ${capitalize(dashesToUppercase(name))} } from './${name}.js';

export const ${capitalize(dashesToUppercase(name))}HTML = new TemplateFn<${
	capitalize(dashesToUppercase(name))
}>(function (html, props) {
	return html\`
		<div></div>
	\`
}, CHANGE_TYPE.PROP, render);
`;

const cssTemplate = (name: string, modulePath: string) => 
`import { TemplateFn, CHANGE_TYPE } from '${modulePath}/${wclibPath}';
import { render } from '${modulePath}/${litHtmlPath}';
import { ${capitalize(dashesToUppercase(name))} } from './${name}.js';

export const ${capitalize(dashesToUppercase(name))}CSS = new TemplateFn<${
	capitalize(dashesToUppercase(name))
}>(function (html) {
		return html\`<style>
			
		</style>\`
	}, CHANGE_TYPE.THEME, render);
`;

(async () => {
	const componentPath = process.argv[process.argv.length - 1];
	
	const projectRoot = path.join(__dirname, '../');
	const moduleRoot = path.join(projectRoot, 'app/modules');

	const name = componentPath.split('/').pop();

	//Create directory
	console.log(chalk.green(`${name}\\`), logSymbols.success);
	await fs.mkdirp(componentPath);

	const modulePath = path.relative(componentPath, moduleRoot)
		.replace(/\\/g, '/');

	//Create .ts file
	console.log(chalk.green(`  ${name}.ts`), logSymbols.success);
	await fs.writeFile(path.join(componentPath, 
		`${name}.ts`), indexTemplate(name, modulePath), {
			encoding: 'utf8'
		});

	//Create .html.ts file
	console.log(chalk.green(`  ${name}.html.ts`), logSymbols.success);
	await fs.writeFile(path.join(componentPath, 
		`${name}.html.ts`), htmlTemplate(name, modulePath), {
			encoding: 'utf8'
		});

	//Create .css.ts file
	console.log(chalk.green(`  ${name}.css.ts`), logSymbols.success);
	await fs.writeFile(path.join(componentPath, 
		`${name}.css.ts`), cssTemplate(name, modulePath), {
			encoding: 'utf8'
		});
})();