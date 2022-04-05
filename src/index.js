import loadable from '@loadable/component';
export { default as MultilingualWidget } from './MultilingualWidget';

const applyConfig = (config) => {
  config.settings.loadables = {
    ...config.settings.loadables,
    draftJsExportHtml: loadable.lib(() => import('draft-js-export-html')),
  };
};

export default applyConfig;
