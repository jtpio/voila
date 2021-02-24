import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * A example plugin for Voila
 */
const main: JupyterFrontEndPlugin<void> = {
  id: '@voila-dashboards/voila',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('Voila plugin activated');
  }
};
/**
 * Export the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [main];

export default plugins;
