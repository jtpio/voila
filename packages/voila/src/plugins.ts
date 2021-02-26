import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ITranslator, TranslationManager } from '@jupyterlab/translation';

import { VoilaApp } from './app';

/**
 * A example plugin for Voila
 */
const main: JupyterFrontEndPlugin<void> = {
  id: '@voila-dashboards/voila:main',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('Voila plugin activated');
  }
};

/**
 * The default paths.
 */
const paths: JupyterFrontEndPlugin<JupyterFrontEnd.IPaths> = {
  id: '@voila-dashboards/voila:paths',
  activate: (
    app: JupyterFrontEnd<JupyterFrontEnd.IShell>
  ): JupyterFrontEnd.IPaths => {
    return (app as VoilaApp).paths;
  },
  autoStart: true,
  provides: JupyterFrontEnd.IPaths
};

/**
 * A simplified Translator
 */
const translator: JupyterFrontEndPlugin<ITranslator> = {
  id: '@voila-dashboards/voila:translator',
  activate: (app: JupyterFrontEnd<JupyterFrontEnd.IShell>): ITranslator => {
    const translationManager = new TranslationManager();
    return translationManager;
  },
  autoStart: true,
  provides: ITranslator
};

/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [main, paths, translator];

export default plugins;
