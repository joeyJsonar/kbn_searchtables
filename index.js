import { resolve } from 'path';

export default function (kibana) {

  return new kibana.Plugin({
    uiExports: {
      visTypes: [
        'plugins/kbn_searchtables/table_vis'
      ],
      styleSheetPaths: resolve(__dirname, 'public/index.scss'),
    }
  });

}
