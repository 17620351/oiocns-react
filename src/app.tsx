import { ConfigProvider, Spin, message, notification } from 'antd';
import React, { Suspense, useState } from 'react';
import { renderRoutes } from 'react-router-config';
import { HashRouter, useHistory } from 'react-router-dom';

import routes from '@/routes';
import './global.less';
// import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.light.css';
import config from 'devextreme/core/config';
import { loadMessages, locale } from 'devextreme/localization';
import zhMessage from 'devextreme/localization/messages/zh.json';
import { LoggerLevel, logger } from '@/ts/base/common';

moment.locale('cn');
config({ defaultCurrency: 'zh' });
loadMessages(zhMessage);
locale('zh');

message.config({
  prefixCls: 'ogo-message',
});

ConfigProvider.config({
  prefixCls: 'ogo',
});

notification.config({
  prefixCls: 'ogo-notification',
});

const App = () => {
  const [locale] = useState(zhCN);
  const history = useHistory();
  logger.onLogger = (level, msg) => {
    switch (level) {
      case LoggerLevel.info:
        message.info(msg);
        break;
      case LoggerLevel.warn:
        message.warn(msg);
        break;
      case LoggerLevel.error:
        message.error(msg);
        break;
      case LoggerLevel.unauth:
        message.warn(msg);
        sessionStorage.clear();
        return history.push('/passport/login');
    }
  };
  return (
    <HashRouter>
      <ConfigProvider prefixCls="ogo" locale={locale}>
        <Suspense fallback={<Spin size="large" className="layout__loading" />}>
          {renderRoutes(routes)}
          <div className="DialogTempalte" id="DialogTempalte"></div>
        </Suspense>
      </ConfigProvider>
    </HashRouter>
  );
};

export default App;
