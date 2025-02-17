import { command, model } from '@/ts/base';
import { IDirectory } from '@/ts/core/thing/directory';
import { formatDate } from '@/utils';
import { dataHandling, generateXlsx, readXlsx } from '@/utils/excel';
import {
  Context,
  DataHandler,
  ErrorMessage,
  ReadConfig,
  SheetConfig,
} from '@/utils/excel/types';
import { getConfigs, getReadConfigs } from '@/utils/excel/configs/index';
import { ProTable } from '@ant-design/pro-components';
import { Button, Modal, Spin, Tabs, Tag, Upload, message } from 'antd';
import TabPane from 'antd/lib/tabs/TabPane';
import React, { useState } from 'react';
import orgCtrl from '@/ts/controller';

/** 上传导入模板 */
export const uploadTemplate = (dir: IDirectory) => {
  function Content() {
    const [loading, setLoading] = useState(false);
    return (
      <>
        <div style={{ marginTop: 20 }}>
          <Button onClick={async () => generateXlsx(getConfigs(dir), '导入模板')}>
            导入模板下载
          </Button>
          {loading && <span style={{ marginLeft: 20 }}>正在加载数据中，请稍后...</span>}
        </div>
        <Spin spinning={loading}>
          <Upload
            type={'drag'}
            showUploadList={false}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ width: 550, height: 300, marginTop: 20 }}
            customRequest={async (options) => {
              setLoading(true);
              let excelFile = options.file as Blob;
              let readConfigs = getReadConfigs(dir);
              readXlsx(excelFile, readConfigs, async () => {
                let context = new Context();
                for (let config of readConfigs) {
                  await config.initContext?.apply(config, [context]);
                }
                setLoading(false);
                modal.destroy();
                showData(
                  readConfigs,
                  (modal) => {
                    modal.destroy();
                    generate(dir, excelFile.name, readConfigs, context);
                  },
                  '开始导入',
                );
              });
            }}>
            <div style={{ color: 'limegreen', fontSize: 22 }}>点击或拖拽至此处上传</div>
          </Upload>
        </Spin>
      </>
    );
  }
  const modal = Modal.info({
    icon: <></>,
    okText: '关闭',
    width: 610,
    title: '导入模板',
    maskClosable: true,
    content: <Content />,
  });
};

/** 展示数据 */
const showData = (
  configs: ReadConfig<any, any, SheetConfig<any>>[],
  confirm: (modal: any) => void,
  okText: string,
) => {
  const modal = Modal.info({
    icon: <></>,
    okText: okText,
    onOk: () => confirm(modal),
    width: 1344,
    title: '数据',
    maskClosable: true,
    content: (
      <Tabs>
        {configs.map((item) => {
          let sheetConfig = item.sheetConfig;
          return (
            <TabPane tab={sheetConfig.sheetName} key={sheetConfig.sheetName}>
              <ProTable
                dataSource={sheetConfig.data}
                cardProps={{ bodyStyle: { padding: 0 } }}
                scroll={{ y: 400 }}
                options={false}
                search={false}
                columns={[
                  {
                    title: '序号',
                    valueType: 'index',
                    width: 50,
                  },
                  {
                    title: '新增 / 覆盖',
                    renderText(_text, record, _index, _action) {
                      return record.id ? (
                        <Tag color="orange">覆盖</Tag>
                      ) : (
                        <Tag color="green">新增</Tag>
                      );
                    },
                  },
                  ...sheetConfig.metaColumns,
                ]}
              />
            </TabPane>
          );
        })}
      </Tabs>
    ),
  });
};

/** 开始导入 */
const generate = async (
  dir: IDirectory,
  name: string,
  configs: ReadConfig<any, any, SheetConfig<any>>[],
  context: Context,
) => {
  let errors = configs.flatMap((item) => item.checkData(context));
  if (errors.length > 0) {
    showErrors(errors);
    return;
  }
  command.emitter('-', 'taskList', dir);
  const task: model.TaskModel = {
    name: name,
    size: 0,
    finished: 0,
    createTime: new Date(),
  };
  let refresh = dir.createTask(task);
  let handler: DataHandler = {
    initialize: (totalRows) => {
      task.size = totalRows;
      refresh();
    },
    onItemCompleted: () => {
      task.finished += 1;
      refresh();
    },
    onCompleted: () => {
      task.finished = task.size;
      refresh();
      message.success(`模板导入成功！`);
      showData(
        configs,
        (modal) => {
          modal.destroy();
          let sheets = configs.map((item) => item.sheetConfig);
          let fileName = `数据导入模板(${formatDate(new Date(), 'yyyy-MM-dd HH:mm')})`;
          generateXlsx(sheets, fileName);
        },
        '生成数据模板',
      );
      dir.loadContent(true).then(() => {
        orgCtrl.changCallback();
      });
    },
    onReadError: (errors) => {
      showErrors(errors);
    },
  };
  dataHandling(context, handler, configs);
};

/** 错误数据 */
const showErrors = (errors: ErrorMessage[]) => {
  Modal.info({
    icon: <></>,
    okText: '关闭',
    width: 860,
    title: '错误信息',
    maskClosable: true,
    content: (
      <ProTable
        dataSource={errors}
        cardProps={{ bodyStyle: { padding: 0 } }}
        scroll={{ y: 300 }}
        options={false}
        search={false}
        columns={[
          {
            title: '序号',
            valueType: 'index',
            width: 50,
          },
          {
            title: '表名',
            dataIndex: 'sheetName',
          },
          {
            title: '行数',
            dataIndex: 'row',
          },
          {
            title: '错误信息',
            dataIndex: 'message',
            width: 460,
          },
        ]}
      />
    ),
  });
};
