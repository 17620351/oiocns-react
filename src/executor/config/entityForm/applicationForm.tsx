import React from 'react';
import { ProFormColumnsType } from '@ant-design/pro-components';
import SchemaForm from '@/components/SchemaForm';
import { ApplicationModel } from '@/ts/base/model';
import { IApplication, IDirectory } from '@/ts/core';
import UploadItem from '../../tools/uploadItem';
import { EntityColumns } from './entityColumns';

interface Iprops {
  formType: string;
  current: IDirectory | IApplication;
  finished: () => void;
}
/*
  编辑
*/
const ApplicationForm = (props: Iprops) => {
  let title = '';
  let types = ['应用'];
  let directory: IDirectory;
  let application: IApplication | undefined;
  const readonly = props.formType === 'remarkApp';
  let initialValue: any = props.current.metadata;
  switch (props.formType) {
    case 'newApp':
      title = '新建应用';
      directory = props.current as IDirectory;
      initialValue = {};
      break;
    case 'updateApp':
      application = props.current as IApplication;
      directory = application.directory;
      title = '更新应用';
      break;
    case 'remarkApp':
      application = props.current as IApplication;
      directory = application.directory;
      title = '查看应用';
      break;
    default:
      return <></>;
  }
  const columns: ProFormColumnsType<ApplicationModel>[] = [
    {
      title: '图标',
      dataIndex: 'icon',
      colProps: { span: 24 },
      renderFormItem: (_, __, form) => {
        return (
          <UploadItem
            readonly={readonly}
            typeName={'应用'}
            icon={initialValue.icon}
            onChanged={(icon) => {
              form.setFieldValue('icon', icon);
            }}
            directory={directory}
          />
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      readonly: readonly,
      formItemProps: {
        rules: [{ required: true, message: '分类名称为必填项' }],
      },
    },
    {
      title: '类型',
      dataIndex: 'typeName',
      valueType: 'select',
      initialValue: types[0],
      fieldProps: {
        options: types.map((i) => {
          return {
            value: i,
            label: i,
          };
        }),
      },
      formItemProps: {
        rules: [{ required: true, message: '类型为必填项' }],
      },
    },
    {
      title: '代码',
      dataIndex: 'code',
      readonly: readonly,
      formItemProps: {
        rules: [{ required: true, message: '分类代码为必填项' }],
      },
    },
    {
      title: '资源',
      dataIndex: 'resource',
      colProps: { span: 24 },
      readonly: readonly,
    },
  ];
  if (readonly) {
    columns.push(...EntityColumns(props.current.metadata));
  }
  columns.push({
    title: '备注信息',
    dataIndex: 'remark',
    valueType: 'textarea',
    colProps: { span: 24 },
    readonly: readonly,
    formItemProps: {
      rules: [{ required: true, message: '备注信息为必填项' }],
    },
  });
  return (
    <SchemaForm<ApplicationModel>
      open
      title={title}
      width={640}
      columns={columns}
      initialValues={initialValue}
      rowProps={{
        gutter: [24, 0],
      }}
      layoutType="ModalForm"
      onOpenChange={(open: boolean) => {
        if (!open) {
          props.finished();
        }
      }}
      onFinish={async (values) => {
        switch (props.formType) {
          case 'updateApp':
            await (props.current as IApplication).update(values);
            break;
          case 'newApp':
            await directory.createApplication(values);
            break;
        }
        props.finished();
      }}></SchemaForm>
  );
};

export default ApplicationForm;
