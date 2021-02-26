// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Inspired by: https://github.com/jupyterlab/jupyterlab/blob/master/dev_mode/index.js

import { PageConfig, URLExt } from '@jupyterlab/coreutils';

import { VoilaApp } from './app';

// Promise.allSettled polyfill, until our supported browsers implement it
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
if (Promise.allSettled === undefined) {
  Promise.allSettled = promises =>
    Promise.all(
      promises.map(promise =>
        promise.then(
          value => ({
            status: 'fulfilled',
            value
          }),
          reason => ({
            status: 'rejected',
            reason
          })
        )
      )
    );
}

require('./style.js');

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const newScript = document.createElement('script');
    newScript.onerror = reject;
    newScript.onload = resolve;
    newScript.async = true;
    document.head.appendChild(newScript);
    newScript.src = url;
  });
}
async function loadComponent(url, scope) {
  await loadScript(url);

  // From MIT-licensed https://github.com/module-federation/module-federation-examples/blob/af043acd6be1718ee195b2511adf6011fba4233c/advanced-api/dynamic-remotes/app1/src/App.js#L6-L12
  // eslint-disable-next-line no-undef
  await __webpack_init_sharing__('default');
  const container = window._JUPYTERLAB[scope];
  // Initialize the container, it may provide shared modules and may need ours
  // eslint-disable-next-line no-undef
  await container.init(__webpack_share_scopes__.default);
}

async function createModule(scope, module) {
  try {
    const factory = await window._JUPYTERLAB[scope].get(module);
    return factory();
  } catch (e) {
    console.warn(
      `Failed to create module: package: ${scope}; module: ${module}`
    );
    throw e;
  }
}

/**
 * The main function
 */
async function main() {
  const app = new VoilaApp();

  const disabled = [];
  let mods = [
    // @jupyterlab plugins
    require('@jupyterlab/apputils-extension').default.filter(({ id }) =>
      [
        '@jupyterlab/apputils-extension:settings',
        '@jupyterlab/apputils-extension:themes'
      ].includes(id)
    ),
    // TODO: re-add after updating to 3.1 lab packages
    // require('@jupyterlab/markdownviewer-extension'),
    require('@jupyterlab/mathjax2-extension'),
    require('@jupyterlab/rendermime-extension'),
    // TODO: add the settings endpoint to re-enable the theme plugins?
    // require('@jupyterlab/theme-light-extension'),
    // require('@jupyterlab/theme-dark-extension'),
    require('./plugins')
  ];

  // /**
  //  * Iterate over active plugins in an extension.
  //  *
  //  * #### Notes
  //  * This also populates the disabled
  //  */
  // function* activePlugins(extension) {
  //   // Handle commonjs or es2015 modules
  //   let exports;
  //   if (Object.prototype.hasOwnProperty.call(extension, '__esModule')) {
  //     exports = extension.default;
  //   } else {
  //     // CommonJS exports.
  //     exports = extension;
  //   }

  //   let plugins = Array.isArray(exports) ? exports : [exports];
  //   for (let plugin of plugins) {
  //     if (PageConfig.Extension.isDisabled(plugin.id)) {
  //       disabled.push(plugin.id);
  //       continue;
  //     }
  //     yield plugin;
  //   }
  // }

  // const extensionData = JSON.parse(
  //   PageConfig.getOption('federated_extensions')
  // );

  // console.log('extension data', extensionData);

  // const federatedExtensionPromises = [];
  // const federatedMimeExtensionPromises = [];
  // const federatedStylePromises = [];

  // const extensions = await Promise.allSettled(
  //   extensionData.map(async data => {
  //     await loadComponent(
  //       `${URLExt.join(
  //         PageConfig.getOption('fullLabextensionsUrl'),
  //         data.name,
  //         data.load
  //       )}`,
  //       data.name
  //     );
  //     return data;
  //   })
  // );

  // extensions.forEach(p => {
  //   if (p.status === 'rejected') {
  //     // There was an error loading the component
  //     console.error(p.reason);
  //     return;
  //   }

  //   const data = p.value;
  //   if (data.extension) {
  //     federatedExtensionPromises.push(createModule(data.name, data.extension));
  //   }
  //   if (data.mimeExtension) {
  //     federatedMimeExtensionPromises.push(
  //       createModule(data.name, data.mimeExtension)
  //     );
  //   }
  //   if (data.style) {
  //     federatedStylePromises.push(createModule(data.name, data.style));
  //   }
  // });

  // // Add the federated extensions.
  // // TODO: Add support for disabled extensions
  // const federatedExtensions = await Promise.allSettled(
  //   federatedExtensionPromises
  // );
  // federatedExtensions.forEach(p => {
  //   if (p.status === 'fulfilled') {
  //     for (let plugin of activePlugins(p.value)) {
  //       mods.push(plugin);
  //     }
  //   } else {
  //     console.error(p.reason);
  //   }
  // });

  // // Load all federated component styles and log errors for any that do not
  // (await Promise.allSettled(federatedStylePromises))
  //   .filter(({ status }) => status === 'rejected')
  //   .forEach(({ reason }) => {
  //     console.error(reason);
  //   });

  app.registerPluginModules(mods);

  await app.start();
}

window.addEventListener('load', main);
