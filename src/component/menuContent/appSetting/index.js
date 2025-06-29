import { message } from '../../message';

import * as form from '../../form';

import { node } from '../../../utility/node';

import { APP_NAME } from '../../../constant';

import { Link } from '../../link';
import { Splash } from '../../splash';
import { Control_slider } from '../../control/slider';

const appSetting = {};

appSetting.app = (parent) => {

  appSetting.app.para1 = node(`p:${message.get('menuContentAppPara1') || 'Text'}`);

  appSetting.app.link1 = new Link({
    text: message.get('menuContentAppLink1'),
    href: `https://www.reddit.com/r/${APP_NAME}`,
    openNew: true
  });

  appSetting.app.para2 = node(`p:${message.get('menuContentAppPara2') || 'Text'}`);

  appSetting.app.link2 = new Link({
    text: message.get('menuContentAppLink2'),
    href: `https://github.com/zombieFox/${APP_NAME}`,
    openNew: true
  });

  appSetting.app.link3 = new Link({
    text: message.get('menuContentAppLink3'),
    href: `https://github.com/zombieFox/${APP_NAME}/blob/master/license`,
    openNew: true
  });

  const splash = new Splash();

  // App region size controls
  appSetting.app.regionSizeLabel = node('label|for:app-region-width-slider|class:app-region-size-label');
  appSetting.app.regionSizeLabel.innerText = message.get('menuContentAppRegionSizeLabel') || 'App Region Size';

  appSetting.app.regionWidth = new Control_slider({
    object: state.get.current(),
    path: 'app.region.width',
    id: 'app-region-width-slider',
    labelText: message.get('menuContentAppRegionWidthLabel') || 'Width',
    value: state.get.current().app?.region?.width || 480,
    defaultValue: 480,
    min: 320,
    max: 1200,
    action: () => {
      document.documentElement.style.setProperty('--app-region-width', state.get.current().app.region.width + 'px');
      data.save();
    }
  });

  appSetting.app.regionHeight = new Control_slider({
    object: state.get.current(),
    path: 'app.region.height',
    id: 'app-region-height-slider',
    labelText: message.get('menuContentAppRegionHeightLabel') || 'Height',
    value: state.get.current().app?.region?.height || 320,
    defaultValue: 320,
    min: 200,
    max: 900,
    action: () => {
      document.documentElement.style.setProperty('--app-region-height', state.get.current().app.region.height + 'px');
      data.save();
    }
  });

  parent.appendChild(
    node('div', [
      splash.splash(),
      node('hr'),
      form.wrap({
        children: [
          appSetting.app.para1,
          form.indent({
            children: [
              node('p', [
                appSetting.app.link1.link()
              ])
            ]
          })
        ]
      }),
      form.wrap({
        children: [
          appSetting.app.para2,
          form.indent({
            children: [
              node('p', [
                appSetting.app.link2.link()
              ]),
              node('p', [
                appSetting.app.link3.link()
              ])
            ]
          })
        ]
      }),
      appSetting.app.regionSizeLabel,
      appSetting.app.regionWidth.wrap(),
      appSetting.app.regionHeight.wrap(),
      node('hr')
    ])
  );

};

export { appSetting };
