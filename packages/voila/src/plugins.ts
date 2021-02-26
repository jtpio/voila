import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { PageConfig } from '@jupyterlab/coreutils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { INotebookModel } from '@jupyterlab/notebook';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { KernelAPI, ServerConnection } from '@jupyterlab/services';

import { KernelConnection } from '@jupyterlab/services/lib/kernel/default';

import { ITranslator, TranslationManager } from '@jupyterlab/translation';

import { VoilaApp } from './app';

import { WidgetManager as VoilaWidgetManager } from './manager';

/**
 * The Voila widgets manager plugin.
 */
const widgetManager: JupyterFrontEndPlugin<void> = {
  id: '@voila-dashboards/voila:widget-manager',
  autoStart: true,
  requires: [IRenderMimeRegistry],
  activate: async (app: JupyterFrontEnd, rendermime: IRenderMimeRegistry) => {
    const baseUrl = PageConfig.getBaseUrl();
    const kernelId = PageConfig.getOption('kernelId');
    const serverSettings = ServerConnection.makeSettings({ baseUrl });

    const model = await KernelAPI.getKernelModel(kernelId);
    if (!model) {
      return;
    }
    const kernel = new KernelConnection({ model, serverSettings });

    // TODO: switch to using a real SessionContext and a session context widget manager
    const context = {
      sessionContext: {
        session: {
          kernel,
          kernelChanged: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            connect: () => {}
          }
        },
        statusChanged: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          connect: () => {}
        },
        kernelChanged: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          connect: () => {}
        },
        connectionStatusChanged: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          connect: () => {}
        }
      },
      saveState: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        connect: () => {}
      }
    };

    const settings = {
      saveState: false
    };

    const manager = new VoilaWidgetManager(
      (context as unknown) as DocumentRegistry.IContext<INotebookModel>,
      rendermime,
      settings
    );

    void manager.build_widgets();

    console.log('Voila manager activated');
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
const plugins: JupyterFrontEndPlugin<any>[] = [
  paths,
  translator,
  widgetManager
];

export default plugins;
